/**
 * Nebula Protocol - Git Branch Management
 * 
 * Provides branch operations for multi-branch workflows.
 * Works with ANY Git client - this just provides API access.
 * Users can also use GitHub Desktop, VS Code, CLI, etc.
 */

import { execSync } from 'child_process';

export class BranchManagement {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  /**
   * List all branches (local and remote)
   */
  listBranches() {
    try {
      const currentBranch = execSync('git branch --show-current', { 
        cwd: this.projectPath 
      }).toString().trim();
      
      const localBranches = execSync('git branch --format="%(refname:short)"', { 
        cwd: this.projectPath 
      })
        .toString()
        .trim()
        .split('\n')
        .filter(b => b);
      
      const remoteBranches = execSync('git branch -r --format="%(refname:short)"', { 
        cwd: this.projectPath 
      })
        .toString()
        .trim()
        .split('\n')
        .filter(b => b && !b.includes('HEAD'));
      
      return {
        success: true,
        current: currentBranch,
        local: localBranches,
        remote: remoteBranches,
        total: localBranches.length
      };
    } catch (error) {
      throw new Error(`Failed to list branches: ${error.message}`);
    }
  }

  /**
   * Create new branch
   */
  createBranch(branchName, options = {}) {
    const { fromBranch, checkout = true, push = false } = options;
    
    try {
      // Validate branch name
      if (!/^[a-zA-Z0-9_\-\/]+$/.test(branchName)) {
        throw new Error('Invalid branch name. Use alphanumeric, dash, underscore, or slash only.');
      }
      
      // Checkout base branch if specified
      if (fromBranch) {
        execSync(`git checkout ${fromBranch}`, { cwd: this.projectPath, stdio: 'pipe' });
      }
      
      // Create branch
      const cmd = checkout 
        ? `git checkout -b ${branchName}`
        : `git branch ${branchName}`;
      
      execSync(cmd, { cwd: this.projectPath, stdio: 'pipe' });
      
      // Push to remote if requested
      if (push && checkout) {
        try {
          execSync(`git push -u origin ${branchName}`, { cwd: this.projectPath, stdio: 'pipe' });
        } catch (error) {
          console.warn('Failed to push branch to remote:', error.message);
        }
      }
      
      return {
        success: true,
        branch: branchName,
        checkedOut: checkout,
        pushed: push
      };
    } catch (error) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  /**
   * Switch to different branch (checkout)
   */
  checkoutBranch(branchName, options = {}) {
    const { createIfMissing = false, force = false } = options;
    
    try {
      let cmd = `git checkout ${branchName}`;
      
      if (createIfMissing) {
        cmd = `git checkout -b ${branchName}`;
      }
      
      if (force) {
        cmd += ' --force';
      }
      
      execSync(cmd, { cwd: this.projectPath, stdio: 'pipe' });
      
      return {
        success: true,
        branch: branchName,
        created: createIfMissing
      };
    } catch (error) {
      throw new Error(`Failed to checkout branch: ${error.message}`);
    }
  }

  /**
   * Merge branch into current branch
   */
  mergeBranch(sourceBranch, options = {}) {
    const {
      strategy = 'merge',
      noFastForward = true,
      autoResolveConflicts = false,
      commitMessage = null
    } = options;
    
    try {
      let mergeCmd;
      
      switch (strategy) {
        case 'rebase':
          mergeCmd = `git rebase ${sourceBranch}`;
          break;
        case 'squash':
          mergeCmd = `git merge --squash ${sourceBranch}`;
          break;
        default:
          mergeCmd = `git merge ${sourceBranch}`;
          if (noFastForward) {
            mergeCmd += ' --no-ff';
          }
      }
      
      if (autoResolveConflicts) {
        mergeCmd += ' -X ours'; // Use "our" changes on conflict
      }
      
      if (commitMessage && strategy !== 'squash') {
        mergeCmd += ` -m "${this.escapeCommitMessage(commitMessage)}"`;
      }
      
      execSync(mergeCmd, { cwd: this.projectPath, stdio: 'pipe' });
      
      // Check for conflicts
      const status = execSync('git status --porcelain', { 
        cwd: this.projectPath 
      }).toString();
      
      const hasConflicts = status.includes('UU ') || status.includes('AA ');
      
      // Get current branch
      const currentBranch = execSync('git branch --show-current', { 
        cwd: this.projectPath 
      }).toString().trim();
      
      return {
        success: !hasConflicts,
        hasConflicts,
        targetBranch: currentBranch,
        sourceBranch,
        strategy,
        message: hasConflicts ? 'Merge conflicts detected' : 'Merge successful'
      };
    } catch (error) {
      // Check if it's a conflict error
      if (error.message.includes('CONFLICT')) {
        return {
          success: false,
          hasConflicts: true,
          message: 'Merge conflicts detected',
          error: error.message
        };
      }
      throw new Error(`Failed to merge: ${error.message}`);
    }
  }

  /**
   * Delete branch
   */
  deleteBranch(branchName, options = {}) {
    const { force = false, deleteRemote = true } = options;
    
    try {
      // Prevent deleting current branch
      const currentBranch = execSync('git branch --show-current', { 
        cwd: this.projectPath 
      }).toString().trim();
      
      if (currentBranch === branchName) {
        throw new Error('Cannot delete currently checked out branch. Switch to another branch first.');
      }
      
      // Delete local branch
      const deleteCmd = force ? `git branch -D ${branchName}` : `git branch -d ${branchName}`;
      execSync(deleteCmd, { cwd: this.projectPath, stdio: 'pipe' });
      
      let remoteDeletionResult = null;
      
      // Delete remote branch if requested
      if (deleteRemote) {
        try {
          execSync(`git push origin --delete ${branchName}`, { 
            cwd: this.projectPath, 
            stdio: 'pipe' 
          });
          remoteDeletionResult = 'success';
        } catch (error) {
          remoteDeletionResult = 'failed';
          console.warn('Failed to delete remote branch:', error.message);
        }
      }
      
      return {
        success: true,
        branch: branchName,
        deletedRemote: remoteDeletionResult
      };
    } catch (error) {
      throw new Error(`Failed to delete branch: ${error.message}`);
    }
  }

  /**
   * Get branch information
   */
  getBranchInfo(branchName = null) {
    try {
      const branch = branchName || execSync('git branch --show-current', { 
        cwd: this.projectPath 
      }).toString().trim();
      
      // Get last commit
      const lastCommit = execSync(`git log -1 --format="%H|%an|%ae|%at|%s" ${branch}`, { 
        cwd: this.projectPath 
      }).toString().trim();
      
      const [hash, author, email, timestamp, message] = lastCommit.split('|');
      
      // Check if remote tracking exists
      let remote = null;
      let ahead = 0;
      let behind = 0;
      
      try {
        remote = execSync(`git config branch.${branch}.remote`, { 
          cwd: this.projectPath,
          stdio: 'pipe'
        }).toString().trim();
        
        // Get ahead/behind counts
        const tracking = execSync(`git rev-list --left-right --count ${remote}/${branch}...${branch}`, {
          cwd: this.projectPath,
          stdio: 'pipe'
        }).toString().trim().split('\t');
        
        behind = parseInt(tracking[0]) || 0;
        ahead = parseInt(tracking[1]) || 0;
      } catch (error) {
        // No remote tracking
      }
      
      return {
        success: true,
        branch,
        lastCommit: {
          hash,
          author,
          email,
          timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
          message
        },
        remote,
        ahead,
        behind,
        needsPush: ahead > 0,
        needsPull: behind > 0
      };
    } catch (error) {
      throw new Error(`Failed to get branch info: ${error.message}`);
    }
  }

  /**
   * Compare two branches
   */
  compareBranches(baseBranch, compareBranch) {
    try {
      // Get commit counts
      const ahead = execSync(
        `git rev-list --count ${baseBranch}..${compareBranch}`,
        { cwd: this.projectPath }
      ).toString().trim();
      
      const behind = execSync(
        `git rev-list --count ${compareBranch}..${baseBranch}`,
        { cwd: this.projectPath }
      ).toString().trim();
      
      // Get diff stats
      const diffStats = execSync(
        `git diff --shortstat ${baseBranch}...${compareBranch}`,
        { cwd: this.projectPath }
      ).toString().trim();
      
      // Get list of changed files
      const changedFiles = execSync(
        `git diff --name-only ${baseBranch}...${compareBranch}`,
        { cwd: this.projectPath }
      ).toString().trim().split('\n').filter(f => f);
      
      return {
        success: true,
        baseBranch,
        compareBranch,
        ahead: parseInt(ahead),
        behind: parseInt(behind),
        diffStats,
        changedFiles,
        totalFiles: changedFiles.length
      };
    } catch (error) {
      throw new Error(`Failed to compare branches: ${error.message}`);
    }
  }

  /**
   * Escape commit message for shell
   */
  escapeCommitMessage(message) {
    return message.replace(/"/g, '\\"').replace(/\$/g, '\\$');
  }
}

