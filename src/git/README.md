# Git Integration for Nebula Protocol

## Architecture: Git-First Storage

The Nebula Protocol uses a **Git-first architecture** for project storage. This provides:

- ✅ **No expensive server storage** - Projects stored in Git (GitHub, GitLab, etc.)
- ✅ **Stateless server** - Can scale horizontally without shared storage
- ✅ **Version control built-in** - All changes tracked automatically
- ✅ **Clone and resume** - Work in Docker sandboxes, resume anywhere
- ✅ **Collaboration ready** - Multiple developers can work on same project
- ✅ **Cost-effective** - Use free Git hosting (GitHub, GitLab)

---

## How It Works

```mermaid
sequenceDiagram
    participant User
    participant API
    participant GitService
    participant GitHub
    participant Docker
    
    User->>API: POST /init (with gitRemote)
    API->>GitService: initializeProject()
    GitService->>GitHub: git init + push
    GitHub-->>GitService: Repository created
    GitService-->>API: Project initialized
    API-->>User: {projectId, gitRemote}
    
    Note over User,Docker: Later: Resume work
    
    User->>API: POST /clone (projectId)
    API->>Docker: Create sandbox
    Docker->>GitHub: git clone
    GitHub-->>Docker: Project cloned
    Docker-->>API: Ready for work
    API-->>User: Sandbox ready
```

---

## Supported Git Providers

- ✅ **GitHub** (github.com)
- ✅ **GitLab** (gitlab.com or self-hosted)
- ✅ **Bitbucket** (bitbucket.org)
- ✅ **Custom** (Any Git server with HTTP/HTTPS)

---

## API Endpoints

### Initialize Project with Git

```bash
POST /api/project/:projectId/init
{
  "name": "my-project",
  "framework": "rust",
  "gitRemote": "username/my-project",  # Required
  "gitProvider": "github",             # github|gitlab|bitbucket|custom
  "gitUsername": "username",
  "gitToken": "ghp_xxxxxxxxxxxx",      # Personal access token
  "gitEmail": "user@example.com",
  "gitBranch": "main"
}
```

### Clone Existing Project

```bash
POST /api/project/:projectId/clone
{
  "gitUrl": "https://github.com/username/project.git",
  "gitToken": "ghp_xxxxxxxxxxxx",  # Optional
  "gitBranch": "main",              # Optional
  "shallow": true                   # Optional: shallow clone for speed
}
```

### Get Git Status

```bash
GET /api/project/:projectId/git/status
```

Response:
```json
{
  "branch": "main",
  "remote": "https://github.com/username/project.git",
  "lastCommit": {
    "hash": "abc123...",
    "author": "John Doe",
    "timestamp": "2025-11-08T10:00:00Z",
    "message": "feat: Complete Star System 1"
  },
  "hasUncommittedChanges": false,
  "ahead": 0,
  "behind": 0,
  "needsPush": false,
  "needsPull": false
}
```

### Manual Commit & Push

```bash
POST /api/project/:projectId/git/commit
{
  "message": "feat: Implement user authentication",
  "push": true
}
```

### Pull Latest Changes

```bash
POST /api/project/:projectId/git/pull
```

---

## Automatic Git Operations

The Nebula Protocol automatically commits and pushes on these milestones:

| Event | Auto-Commit | Message Format |
|-------|-------------|----------------|
| Star System Complete | ✅ | `feat: Complete Star System X` |
| Star Gate Passed | ✅ | `milestone: Pass Star Gate X (vX.X.X.X)` |
| Error Resolved | Optional | `fix: Resolve error {errorId}` |
| Solution Applied | Optional | `fix: Apply solution {solutionId}` |
| Version Bump | ✅ | `chore: Bump version to X.X.X.X` |

Configure auto-commits in `.env`:
```bash
GIT_AUTO_COMMIT=true
GIT_AUTO_PUSH=true
GIT_COMMIT_ON_STAR_SYSTEM=true
GIT_COMMIT_ON_STAR_GATE=true
GIT_COMMIT_ON_ERROR_RESOLUTION=false
```

---

## Docker Sandbox Workflow

### 1. Create Sandbox Container

```bash
docker run -d --name nebula-sandbox-{projectId} \
  -e PROJECT_ID={projectId} \
  -e GIT_URL={gitUrl} \
  -e GIT_TOKEN={token} \
  nebula-protocol/sandbox:latest
```

### 2. Clone Project in Sandbox

```bash
docker exec nebula-sandbox-{projectId} \
  git clone {gitUrl} /workspace
```

### 3. Work in Sandbox

```bash
docker exec -it nebula-sandbox-{projectId} bash
cd /workspace
# Make changes...
git add .
git commit -m "feat: New feature"
git push
```

### 4. Destroy Sandbox

```bash
docker stop nebula-sandbox-{projectId}
docker rm nebula-sandbox-{projectId}
```

---

## Storage Cleanup

The server automatically cleans up old project directories:

- **Max Age:** 30 days (configurable)
- **Check Interval:** 24 hours
- **Safety:** Won't delete projects with uncommitted changes
- **Configure:**
  ```bash
  STORAGE_CLEANUP_ENABLED=true
  STORAGE_CLEANUP_INTERVAL=86400000  # 24 hours
  PROJECT_MAX_AGE=2592000000          # 30 days
  ```

---

## Authentication

### GitHub Personal Access Token

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Select scopes: `repo` (Full control of private repositories)
4. Copy token: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
5. Use in API: `"gitToken": "ghp_xxxx..."`

### GitLab Personal Access Token

1. Go to GitLab User Settings → Access Tokens
2. Create token with `api`, `read_repository`, `write_repository` scopes
3. Copy token: `glpat-xxxxxxxxxxxxxxxxxxxx`
4. Use in API: `"gitToken": "glpat-xxxx..."`

### Bitbucket App Password

1. Go to Bitbucket Settings → App Passwords
2. Create app password with Repository Read/Write permissions
3. Use in API: `"gitToken": "your_app_password"`

---

## Security

### Token Storage

⚠️ **NEVER commit tokens to Git!**

Tokens are:
- ✅ Stored in environment variables
- ✅ Sanitized in logs (shown as `***`)
- ✅ Not stored in project memory
- ✅ Used only for Git operations

### URL Sanitization

Git URLs with tokens are automatically sanitized:
```
https://ghp_token123@github.com/user/repo.git
↓
https://***@github.com/user/repo.git
```

---

## Example: Full Project Lifecycle

### 1. Create Project on GitHub

```bash
# On GitHub: Create repository "my-rust-app"
# Get personal access token: Settings → Developer Settings → Tokens
```

### 2. Initialize via Nebula API

```bash
curl -X POST http://localhost:3000/api/project/my-rust-app/init \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Rust App",
    "framework": "rust",
    "gitRemote": "username/my-rust-app",
    "gitProvider": "github",
    "gitUsername": "username",
    "gitToken": "ghp_xxxxxxxxxxxx",
    "gitEmail": "user@example.com"
  }'
```

### 3. Verify on GitHub

Check GitHub - repository now has:
- Initial commit
- README.md
- .gitignore
- main branch

### 4. Clone into Docker Sandbox

```bash
curl -X POST http://localhost:3000/api/project/my-rust-app/clone \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gitUrl": "https://github.com/username/my-rust-app.git",
    "gitToken": "ghp_xxxxxxxxxxxx"
  }'
```

### 5. Work Resumes Anywhere

```bash
# In Docker sandbox
git pull
# Make changes
git push

# Or clone to local machine
git clone https://github.com/username/my-rust-app.git
cd my-rust-app
# Work locally
git push
```

---

## Benefits

### For Users
- ✅ No vendor lock-in (use any Git service)
- ✅ Keep all project data in Git
- ✅ Work offline, sync when ready
- ✅ Collaborate with team members
- ✅ Free Git hosting available

### For Server
- ✅ No expensive storage costs
- ✅ Stateless architecture (scales horizontally)
- ✅ No backup requirements (Git is the backup)
- ✅ No file cleanup needed (automatic)
- ✅ Cost-effective operation

---

## Configuration

See `.env.example` for all Git-related configuration options.

Key settings:
```bash
# Git Integration
GIT_ENABLED=true
GIT_AUTO_COMMIT=true
GIT_AUTO_PUSH=true
GIT_DEFAULT_BRANCH=main
GIT_DEFAULT_PROVIDER=github

# Storage
GIT_REQUIRED=true
STORAGE_CLEANUP_ENABLED=true
PROJECT_MAX_AGE=2592000000  # 30 days
```

---

**Git-First Architecture = Scalable + Cost-Effective + Flexible** 🚀

