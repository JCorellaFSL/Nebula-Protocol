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

import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
      execSync('git init', { cwd: projectPath });
      execSync(`git checkout -b ${gitBranch}`, { cwd: projectPath });
      
      // Configure Git user
      if (gitUsername) {
        execSync(`git config user.name "${gitUsername}"`, { cwd: projectPath });
      }
      if (options.gitEmail) {
        execSync(`git config user.email "${options.gitEmail}"`, { cwd: projectPath });
      }

      // Add remote if provided
      if (gitRemote) {
        const remoteUrl = this.buildRemoteUrl(gitRemote, gitProvider, gitUsername, gitToken);
        execSync(`git remote add origin ${remoteUrl}`, { cwd: projectPath });
      }

      // Create initial .gitignore
      const gitignore = this.generateGitignore(framework);
      fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);

      // Create README
      const readme = this.generateReadme(name, framework);
      fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

      // Initial commit
      execSync('git add .', { cwd: projectPath });
      execSync('git commit -m "Initial commit: Nebula Protocol project initialized"', { cwd: projectPath });

      // Push to remote if configured
      if (gitRemote) {
        try {
          execSync(`git push -u origin ${gitBranch}`, { cwd: projectPath });
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
      
      execSync(cloneCmd, { stdio: 'pipe' });

      // Get repository info
      const remoteUrl = execSync('git remote get-url origin', { cwd: projectPath }).toString().trim();
      const currentBranch = execSync('git branch --show-current', { cwd: projectPath }).toString().trim();
      const lastCommit = execSync('git log -1 --format="%H %s"', { cwd: projectPath }).toString().trim();

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
      const status = execSync('git status --porcelain', { cwd: projectPath }).toString();
      
      if (!status && !force) {
        return {
          success: true,
          message: 'No changes to commit',
          committed: false
        };
      }

      // Add files
      if (addAll) {
        execSync('git add .', { cwd: projectPath });
      }

      // Commit
      try {
        execSync(`git commit -m "${this.escapeCommitMessage(message)}"`, { cwd: projectPath });
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
      const commitHash = execSync('git rev-parse HEAD', { cwd: projectPath }).toString().trim();

      // Push if requested
      if (push) {
        const branch = execSync('git branch --show-current', { cwd: projectPath }).toString().trim();
        execSync(`git push origin ${branch}`, { cwd: projectPath });
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
      const output = execSync(pullCmd, { cwd: projectPath }).toString();

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
      const branch = execSync('git branch --show-current', { cwd: projectPath }).toString().trim();
      const remote = execSync('git remote get-url origin', { cwd: projectPath }).toString().trim();
      const lastCommit = execSync('git log -1 --format="%H|%an|%ae|%at|%s"', { cwd: projectPath }).toString().trim();
      const [hash, author, email, timestamp, message] = lastCommit.split('|');
      
      // Check for uncommitted changes
      const statusOutput = execSync('git status --porcelain', { cwd: projectPath }).toString();
      const hasChanges = statusOutput.length > 0;
      
      // Count commits ahead/behind
      let ahead = 0, behind = 0;
      try {
        const remoteBranch = execSync(`git rev-parse origin/${branch}`, { cwd: projectPath }).toString().trim();
        const localBranch = execSync('git rev-parse HEAD', { cwd: projectPath }).toString().trim();
        
        if (remoteBranch !== localBranch) {
          ahead = parseInt(execSync(`git rev-list --count origin/${branch}..HEAD`, { cwd: projectPath }).toString().trim());
          behind = parseInt(execSync(`git rev-list --count HEAD..origin/${branch}`, { cwd: projectPath }).toString().trim());
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
            const status = execSync('git status --porcelain', { cwd: projectPath }).toString();
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

