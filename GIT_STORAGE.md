# Git-First Storage Architecture

## Overview

The Nebula Protocol uses a **Git-first architecture** for project storage. All projects MUST be stored in Git repositories (GitHub, GitLab, Bitbucket, or self-hosted Git servers). This design eliminates the need for expensive server storage infrastructure.

---

## Why Git-First?

### Traditional Problem
- Server storage is expensive at scale
- File storage requires backups
- Difficult to share projects
- Hard to resume work across devices
- Single point of failure

### Git-First Solution
✅ **No storage costs** - Use free Git hosting (GitHub, GitLab)  
✅ **Built-in backups** - Git history is the backup  
✅ **Easy collaboration** - Git native collaboration tools  
✅ **Resume anywhere** - Clone project into Docker sandbox  
✅ **Version control included** - Track all changes automatically  
✅ **Stateless server** - Can scale horizontally  
✅ **Zero vendor lock-in** - Your code, your Git service  

---

## Architecture Diagram

```mermaid
graph TB
    A[User/IDE] -->|Initialize| B[Nebula API]
    B -->|git init + push| C[GitHub/GitLab/Bitbucket]
    C -->|Repository Created| B
    B -->|Project ID| A
    
    D[User 2] -->|Clone| B
    B -->|git clone| C
    C -->|Project Files| E[Docker Sandbox]
    E -->|Work + Commit| C
    C -->|git push| C
    
    F[User 1 Resume] -->|Clone| B
    B -->|git clone| C
    C -->|Latest Code| G[New Docker Sandbox]
    
    style C fill:#4a90e2
    style E fill:#2ecc71
    style G fill:#2ecc71
```

---

## Project Lifecycle

### 1. Initialize Project

```bash
POST /api/project/:projectId/init
{
  "name": "My Awesome App",
  "framework": "rust",
  "gitRemote": "username/my-awesome-app",  # REQUIRED
  "gitProvider": "github",
  "gitUsername": "username",
  "gitToken": "ghp_xxxxxxxxxxxx",
  "gitEmail": "user@example.com"
}
```

**What happens:**
1. Server creates temporary directory
2. Initializes Git repository
3. Creates `.gitignore` and `README.md`
4. Makes initial commit
5. Pushes to remote (GitHub, GitLab, etc.)
6. Returns project ID

### 2. Work on Project

**Option A: Docker Sandbox (Recommended)**
```bash
# Clone into Docker sandbox
POST /api/project/:projectId/clone
{
  "gitUrl": "https://github.com/username/my-awesome-app.git",
  "gitToken": "ghp_xxxxxxxxxxxx"
}

# Work in sandbox...

# Auto-commits on milestones:
# - Star System completion
# - Star Gate passage
# - Version bumps
```

**Option B: Local Clone**
```bash
git clone https://github.com/username/my-awesome-app.git
cd my-awesome-app
# Work locally...
git push
```

### 3. Resume Later

```bash
# Clone same project
POST /api/project/:projectId/clone
{
  "gitUrl": "https://github.com/username/my-awesome-app.git",
  "gitToken": "ghp_xxxxxxxxxxxx"
}

# Continues from last commit
```

### 4. Cleanup

- Server automatically cleans temp directories after 30 days (configurable)
- Only deletes if no uncommitted changes
- Your code is safe in Git

---

## Server Storage Model

### Temporary Storage Only

```
/app/projects/
  ├── project-abc-123/          # Temporary working directory
  │   ├── .git/                 # Git repository
  │   ├── .nebula/              # Project memory (SQLite)
  │   ├── src/                  # Source code
  │   └── ...
  └── project-xyz-789/          # Another project
      └── ...
```

**Key Points:**
- Temporary directories cleaned after 30 days
- Projects must have Git remote
- Server never stores projects permanently
- All persistence is in Git

---

## Automatic Git Operations

The Nebula Protocol automatically commits and pushes on these events:

| Event | Commit Message | Auto-Push | Configurable |
|-------|----------------|-----------|--------------|
| Star System Complete | `feat: Complete Star System X` | ✅ | `GIT_COMMIT_ON_STAR_SYSTEM` |
| Star Gate Passed | `milestone: Pass Star Gate X (vX.X.X.X)` | ✅ | `GIT_COMMIT_ON_STAR_GATE` |
| Error Resolved | `fix: Resolve error {id}` | Optional | `GIT_COMMIT_ON_ERROR_RESOLUTION` |
| Version Bump | `chore: Bump version to X.X.X.X` | ✅ | `GIT_AUTO_COMMIT` |

Configure in `.env`:
```bash
GIT_AUTO_COMMIT=true
GIT_AUTO_PUSH=true
GIT_COMMIT_ON_STAR_SYSTEM=true
GIT_COMMIT_ON_STAR_GATE=true
GIT_COMMIT_ON_ERROR_RESOLUTION=false
```

---

## Supported Git Providers

| Provider | URL Format | Token Type |
|----------|------------|------------|
| **GitHub** | `username/repo` or full URL | Personal Access Token (PAT) |
| **GitLab** | `username/repo` or full URL | Personal Access Token |
| **Bitbucket** | `username/repo` or full URL | App Password |
| **Self-Hosted** | Full URL | Varies |

### Getting Tokens

**GitHub:**
1. Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Scopes: `repo` (full control)
4. Token format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**GitLab:**
1. User Settings → Access Tokens
2. Scopes: `api`, `read_repository`, `write_repository`
3. Token format: `glpat-xxxxxxxxxxxxxxxxxxxx`

**Bitbucket:**
1. Personal Settings → App Passwords
2. Permissions: Repository Read/Write
3. Use username + app password

---

## Docker Sandbox Integration

### Dockerfile for Sandboxes

```dockerfile
FROM ubuntu:22.04

# Install Git + language runtimes
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential

# Install Rust (example)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /workspace

# Entrypoint will clone project
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
```

### entrypoint.sh

```bash
#!/bin/bash
set -e

# Clone project if GIT_URL provided
if [ -n "$GIT_URL" ]; then
  echo "Cloning $GIT_URL..."
  
  if [ -n "$GIT_TOKEN" ]; then
    # Inject token into URL
    AUTH_URL=$(echo "$GIT_URL" | sed "s|https://|https://$GIT_TOKEN@|")
    git clone "$AUTH_URL" /workspace
  else
    git clone "$GIT_URL" /workspace
  fi
  
  cd /workspace
  echo "Project cloned successfully!"
fi

# Keep container running
exec "$@"
```

### Usage

```bash
# Create sandbox
docker run -d --name nebula-sandbox-{projectId} \
  -e GIT_URL=https://github.com/user/project.git \
  -e GIT_TOKEN=ghp_xxxxxxxxxxxx \
  nebula-protocol/sandbox:latest \
  tail -f /dev/null

# Work in sandbox
docker exec -it nebula-sandbox-{projectId} bash
cd /workspace
# Make changes...
git add .
git commit -m "feat: New feature"
git push

# Cleanup
docker stop nebula-sandbox-{projectId}
docker rm nebula-sandbox-{projectId}
```

---

## Security Considerations

### Token Storage

⚠️ **NEVER commit tokens to Git repositories!**

**Best Practices:**
- Store tokens in environment variables only
- Use token sanitization in logs (`***`)
- Rotate tokens regularly
- Use fine-grained permissions
- Consider SSH keys for automation

### URL Sanitization

All Git URLs with tokens are automatically sanitized in logs:

```javascript
// Before logging
https://ghp_token123@github.com/user/repo.git

// After sanitization
https://***@github.com/user/repo.git
```

---

## Cost Comparison

### Traditional Storage

```
Cost per project: ~$0.10/month (10GB * $0.01/GB)
1,000 projects: $100/month
10,000 projects: $1,000/month
```

### Git-First Storage

```
GitHub Free: Unlimited public repos, 500MB private repos
GitHub Pro ($4/month): Unlimited private repos
GitLab Free: 10GB storage, unlimited repos
Bitbucket Free: 1GB LFS storage, unlimited repos

Cost per project: $0 (using free tiers)
1,000 projects: $0/month (or $4 if private)
10,000 projects: $0/month (or $4 if private)
```

**Savings: 96-100% reduction in storage costs!**

---

## Backup & Disaster Recovery

### Traditional Approach
- Daily backups required
- Backup storage costs
- Complex restore procedures
- Data loss risk

### Git-First Approach
- Git history IS the backup
- Distributed across multiple machines
- Instant restore (git clone)
- Zero data loss (every commit preserved)

---

## Scalability

### Horizontal Scaling

Because the server is stateless, it can scale horizontally:

```
        Load Balancer
              |
     ┌────────┼────────┐
     │        │        │
  Server 1 Server 2 Server 3
     │        │        │
     └────────┼────────┘
              |
          GitHub/GitLab
```

Each server:
- Has temporary project directories
- Clones from Git as needed
- Pushes changes to Git
- No shared storage required

---

## Migration from Traditional Storage

If you have existing projects in traditional storage:

```bash
# For each project
cd /existing/storage/project-123

# Initialize Git
git init
git add .
git commit -m "Migrate to Git-first storage"

# Push to remote
git remote add origin https://github.com/user/project.git
git push -u origin main

# Update Nebula project memory with Git remote
# Server can now treat it as Git-first project
```

---

## Troubleshooting

### Problem: Push fails

```bash
# Check remote
git remote -v

# Update remote URL with token
git remote set-url origin https://TOKEN@github.com/user/repo.git

# Try push again
git push
```

### Problem: Clone fails

```bash
# Verify Git URL is accessible
git ls-remote https://github.com/user/repo.git

# Check token permissions
# Token needs: repo (full control)
```

### Problem: Uncommitted changes during cleanup

```bash
# Server won't delete projects with uncommitted changes
# Check status
git status

# Commit or discard changes
git add .
git commit -m "Save work"
git push
```

---

## Configuration Reference

All Git-related settings in `.env`:

```bash
# Git Integration
GIT_ENABLED=true                       # Enable Git integration
GIT_REQUIRED=true                      # Require Git for all projects
GIT_AUTO_COMMIT=true                   # Auto-commit on milestones
GIT_AUTO_PUSH=true                     # Auto-push commits
GIT_DEFAULT_BRANCH=main                # Default branch name
GIT_DEFAULT_PROVIDER=github            # github|gitlab|bitbucket|custom
GIT_SHALLOW_CLONE=false                # Use shallow clones for speed
GIT_COMMIT_ON_STAR_SYSTEM=true         # Commit on Star System completion
GIT_COMMIT_ON_STAR_GATE=true           # Commit on Star Gate passage
GIT_COMMIT_ON_ERROR_RESOLUTION=false   # Commit on error resolution

# Storage Cleanup
STORAGE_CLEANUP_ENABLED=true           # Enable automatic cleanup
STORAGE_CLEANUP_INTERVAL=86400000      # Check every 24 hours
PROJECT_MAX_AGE=2592000000              # Delete after 30 days
PROJECTS_DIR=/app/projects             # Temporary project directory
```

---

## FAQ

**Q: What if my Git provider goes down?**  
A: Clone your project locally as backup. Git is distributed - every clone is a full backup.

**Q: Can I use private repositories?**  
A: Yes! Use personal access tokens with appropriate permissions.

**Q: How much does this cost?**  
A: GitHub/GitLab free tiers cover most users. Paid tiers are $4-9/month for unlimited private repos.

**Q: What if I don't want to use Git?**  
A: Git is required. The entire protocol is designed around Git-first architecture for scalability and cost-effectiveness.

**Q: Can I self-host Git?**  
A: Yes! Use GitLab self-hosted, Gitea, or any Git server. Set `gitProvider: 'custom'` and provide full URL.

**Q: How often should I push?**  
A: The protocol auto-pushes on major milestones (Star Gates, version bumps). You can also push manually anytime.

---

**Git-First = Scalable + Cost-Effective + Reliable** 🚀

