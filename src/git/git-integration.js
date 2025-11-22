/**
 * Nebula Protocol - Git Integration Service
 * 
 * Handles Git operations for project storage and collaboration.
 * Supports GitHub, GitLab, Bitbucket, and self-hosted Git.
 * 
 * Architecture:
 * - Projects stored in Git repositories (not on server)
 * - Server maintains temporary working directories
 * - Automatic push after significant milestones
 * - Clone projects into Docker sandboxes for work
 * - Cleanup temporary files after inactivity
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export class GitIntegration {
  constructor(config) {
    this.config = config;
    this.tempDir = config.storage.projectsDir;
    this.cleanupInterval = config.storage.cleanupInterval;
    this.maxAge = config.storage.maxAge;
    
    // Start cleanup service
    if (config.storage.cleanupEnabled) {
      this.startCleanupService();
    }
  }

  /**
   * Execute command asynchronously
   */
  async execute(command, cwd) {
    try {
      const { stdout } = await execAsync(command, { cwd });
      return stdout.trim();
    } catch (error) {
      throw new Error(`Command failed: ${command}. Error: ${error.message}`);
    }
  }

  /**
   * Initialize a new Git repository for a project
   */
  async initializeProject(projectId, options = {}) {
    const {
      name,
      framework,
      gitRemote,
      gitProvider = 'github', // github, gitlab, bitbucket, custom
      gitUsername,
      gitToken,
      gitBranch = 'main'
    } = options;

    const projectPath = path.join(this.tempDir, projectId);
    
    // Create project directory
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    try {
      // Initialize Git repository
      await this.execute('git init', projectPath);
      await this.execute(`git checkout -b ${gitBranch}`, projectPath);
      
      // Configure Git user
      if (gitUsername) {
        await this.execute(`git config user.name "${gitUsername}"`, projectPath);
      }
      if (options.gitEmail) {
        await this.execute(`git config user.email "${options.gitEmail}"`, projectPath);
      }

      // Add remote if provided
      if (gitRemote) {
        const remoteUrl = this.buildRemoteUrl(gitRemote, gitProvider, gitUsername, gitToken);
        await this.execute(`git remote add origin ${remoteUrl}`, projectPath);
      }

      // Create initial .gitignore
      const gitignore = this.generateGitignore(framework);
      fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);

      // Create README
      const readme = this.generateReadme(name, framework);
      fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

      // Initial commit
      await this.execute('git add .', projectPath);
      await this.execute('git commit -m "Initial commit: Nebula Protocol project initialized"', projectPath);

      // Push to remote if configured
      if (gitRemote) {
        try {
          await this.execute(`git push -u origin ${gitBranch}`, projectPath);
        } catch (error) {
          console.warn('Failed to push to remote:', error.message);
          // Don't fail initialization if push fails
        }
      }

      return {
        success: true,
        projectId,
        projectPath,
        gitInitialized: true,
        gitRemote: gitRemote || null,
        gitBranch
      };
    } catch (error) {
      throw new Error(`Git initialization failed: ${error.message}`);
    }
  }

  /**
   * Clone an existing project from Git
   */
  async cloneProject(projectId, gitUrl, options = {}) {
    const {
      gitBranch = 'main',
      gitToken,
      shallow = false
    } = options;

    const projectPath = path.join(this.tempDir, projectId);
    
    // Remove existing directory if it exists
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }

    try {
      // Build authenticated URL if token provided
      const cloneUrl = gitToken ? this.injectToken(gitUrl, gitToken) : gitUrl;
      
      // Clone repository
      const cloneCmd = shallow 
        ? `git clone --depth 1 --branch ${gitBranch} ${cloneUrl} ${projectPath}`
        : `git clone --branch ${gitBranch} ${cloneUrl} ${projectPath}`;
      
      await execAsync(cloneCmd); // Clone typically creates the dir, so cwd is parent or default

      // Get repository info
      const remoteUrl = await this.execute('git remote get-url origin', projectPath);
      const currentBranch = await this.execute('git branch --show-current', projectPath);
      const lastCommit = await this.execute('git log -1 --format="%H %s"', projectPath);

      return {
        success: true,
        projectId,
        projectPath,
        gitRemote: this.sanitizeUrl(remoteUrl),
        gitBranch: currentBranch,
        lastCommit
      };
    } catch (error) {
      throw new Error(`Git clone failed: ${error.message}`);
    }
  }

  /**
   * Commit and push changes
   */
  async commitAndPush(projectPath, message, options = {}) {
    const {
      addAll = true,
      push = true,
      force = false
    } = options;

    try {
      // Check if there are changes
      let status;
      try {
        status = await this.execute('git status --porcelain', projectPath);
      } catch (e) {
        status = '';
      }
      
      if (!status && !force) {
        return {
          success: true,
          message: 'No changes to commit',
          committed: false
        };
      }

      // Add files
      if (addAll) {
        await this.execute('git add .', projectPath);
      }

      // Commit
      try {
        await this.execute(`git commit -m "${this.escapeCommitMessage(message)}"`, projectPath);
      } catch (error) {
        if (error.message.includes('nothing to commit')) {
          return {
            success: true,
            message: 'No changes to commit',
            committed: false
          };
        }
        throw error;
      }

      // Get commit hash
      const commitHash = await this.execute('git rev-parse HEAD', projectPath);

      // Push if requested
      if (push) {
        const branch = await this.execute('git branch --show-current', projectPath);
        await this.execute(`git push origin ${branch}`, projectPath);
      }

      return {
        success: true,
        message: 'Changes committed' + (push ? ' and pushed' : ''),
        committed: true,
        commitHash,
        pushed: push
      };
    } catch (error) {
      throw new Error(`Git commit failed: ${error.message}`);
    }
  }

  /**
   * Pull latest changes
   */
  async pullChanges(projectPath, options = {}) {
    const { rebase = false } = options;

    try {
      const pullCmd = rebase ? 'git pull --rebase' : 'git pull';
      const output = await this.execute(pullCmd, projectPath);

      return {
        success: true,
        message: 'Changes pulled successfully',
        output
      };
    } catch (error) {
      throw new Error(`Git pull failed: ${error.message}`);
    }
  }

  /**
   * Get repository status
   */
  async getStatus(projectPath) {
    try {
      const branch = await this.execute('git branch --show-current', projectPath);
      const remote = await this.execute('git remote get-url origin', projectPath);
      const lastCommitRaw = await this.execute('git log -1 --format="%H|%an|%ae|%at|%s"', projectPath);
      const [hash, author, email, timestamp, message] = lastCommitRaw.split('|');
      
      // Check for uncommitted changes
      const statusOutput = await this.execute('git status --porcelain', projectPath);
      const hasChanges = statusOutput.length > 0;
      
      // Count commits ahead/behind
      let ahead = 0, behind = 0;
      try {
        const remoteBranch = await this.execute(`git rev-parse origin/${branch}`, projectPath);
        const localBranch = await this.execute('git rev-parse HEAD', projectPath);
        
        if (remoteBranch !== localBranch) {
          ahead = parseInt(await this.execute(`git rev-list --count origin/${branch}..HEAD`, projectPath));
          behind = parseInt(await this.execute(`git rev-list --count HEAD..origin/${branch}`, projectPath));
        }
      } catch (error) {
        // Remote branch might not exist
      }

      return {
        branch,
        remote: this.sanitizeUrl(remote),
        lastCommit: {
          hash,
          author,
          email,
          timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
          message
        },
        hasUncommittedChanges: hasChanges,
        ahead,
        behind,
        needsPush: ahead > 0,
        needsPull: behind > 0
      };
    } catch (error) {
      throw new Error(`Git status failed: ${error.message}`);
    }
  }

  /**
   * Auto-commit on milestones (Star System completion, Star Gate passage, etc.)
   */
  async autoCommit(projectPath, milestone, metadata = {}) {
    const messages = {
      star_system: `feat: Complete Star System ${metadata.starSystem}`,
      star_gate: `milestone: Pass Star Gate ${metadata.constellation} (v${metadata.version})`,
      error_resolution: `fix: Resolve error ${metadata.errorId}`,
      solution: `fix: Apply solution ${metadata.solutionId}`,
      version_bump: `chore: Bump version to ${metadata.version}`
    };

    const message = messages[milestone] || `chore: ${milestone}`;
    
    try {
      return await this.commitAndPush(projectPath, message, { push: true });
    } catch (error) {
      console.error('Auto-commit failed:', error.message);
      // Don't throw - auto-commit failure shouldn't break the workflow
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cleanup old projects
   */
  startCleanupService() {
    setInterval(() => {
      this.cleanupOldProjects();
    }, this.cleanupInterval);
  }

  async cleanupOldProjects() {
    try {
      if (!fs.existsSync(this.tempDir)) return;

      const projects = fs.readdirSync(this.tempDir);
      const now = Date.now();
      let cleaned = 0;

      for (const projectId of projects) {
        const projectPath = path.join(this.tempDir, projectId);
        const stats = fs.statSync(projectPath);
        const age = now - stats.mtimeMs;

        if (age > this.maxAge) {
          // Check if there are uncommitted changes
          try {
            const status = await this.execute('git status --porcelain', projectPath);
            if (status) {
              console.warn(`Project ${projectId} has uncommitted changes, skipping cleanup`);
              continue;
            }
          } catch (error) {
            // Not a git repo or error checking status
          }

          // Remove old project
          fs.rmSync(projectPath, { recursive: true, force: true });
          cleaned++;
          console.log(`Cleaned up old project: ${projectId} (age: ${Math.round(age / 86400000)} days)`);
        }
      }

      if (cleaned > 0) {
        console.log(`Cleanup completed: removed ${cleaned} old projects`);
      }
    } catch (error) {
      console.error('Cleanup error:', error.message);
    }
  }

  /**
   * Build remote URL with authentication
   */
  buildRemoteUrl(repo, provider, username, token) {
    if (repo.startsWith('http://') || repo.startsWith('https://')) {
      return this.injectToken(repo, token);
    }

    const providers = {
      github: `https://github.com/${repo}.git`,
      gitlab: `https://gitlab.com/${repo}.git`,
      bitbucket: `https://bitbucket.org/${repo}.git`,
      custom: repo
    };

    const url = providers[provider] || repo;
    return token ? this.injectToken(url, token) : url;
  }

  /**
   * Inject authentication token into URL
   */
  injectToken(url, token) {
    if (!token) return url;
    
    // For GitHub/GitLab: https://TOKEN@github.com/user/repo.git
    return url.replace('https://', `https://${token}@`);
  }

  /**
   * Remove token from URL for logging
   */
  sanitizeUrl(url) {
    return url.replace(/https:\/\/[^@]+@/, 'https://***@');
  }

  /**
   * Escape commit message for shell
   */
  escapeCommitMessage(message) {
    return message.replace(/"/g, '\\"').replace(/\$/g, '\\$');
  }

  /**
   * Generate .gitignore for framework
   */
  generateGitignore(framework) {
    const common = `# Nebula Protocol
.nebula/
*.sqlite
*.sqlite-wal
*.sqlite-shm

# Environment
.env
.env.local

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db
`;

    const frameworkIgnores = {
      rust: `target/
Cargo.lock
*.rs.bk`,
      python: `__pycache__/
*.py[cod]
venv/
*.egg-info/`,
      javascript: `node_modules/
dist/
build/`,
      typescript: `node_modules/
dist/
build/
*.tsbuildinfo`,
      flutter: `.dart_tool/
.flutter-plugins
.packages
build/`,
      tauri: `target/
node_modules/
dist/
src-tauri/target/`,
      dioxus: `target/
dist/
assets/`,
      nextjs: `node_modules/
.next/
out/
build/`,
      react: `node_modules/
build/
dist/`
    };

    return common + (frameworkIgnores[framework?.toLowerCase()] || '');
  }

  /**
   * Generate initial README
   */
  generateReadme(name, framework) {
    return `# ${name}

**Framework:** ${framework}  
**Managed by:** Nebula Protocol  
**Created:** ${new Date().toISOString()}

## About

This project uses the Nebula Protocol for AI-assisted development with:
- 🏗️ Structured Constellations and Star Systems
- 🚪 Quality Gates (Star Gates) between phases
- 📊 Semantic Versioning (CONSTELLATION.STAR_SYSTEM.QUALITY_GATE.PATCH)
- 🧠 Project Memory and Knowledge Graph
- 📚 Automatic Documentation Fetching

## Getting Started

This project is managed through the Nebula Protocol. To resume work:

\`\`\`bash
# Clone this repository
git clone <repository-url>

# Navigate to project
cd ${name}

# Resume work via Nebula API or Docker sandbox
\`\`\`

## Project Structure

See \`ROADMAP.md\` for the complete project plan and constellation structure.

## Documentation

- \`ROADMAP.md\` - Project phases and timeline
- \`PROJECT_GUIDE.md\` - Nebula Protocol guide for this project
- \`CONSTELLATION_*.md\` - Strategic phase overviews
- \`STAR_SYSTEM_*.md\` - Technical implementation guides
- \`STAR_GATE_*.md\` - Quality checkpoint templates

---

**Powered by Nebula Protocol** 🌌
`;
  }
}
