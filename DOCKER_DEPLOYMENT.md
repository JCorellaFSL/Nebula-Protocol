# Nebula Protocol Docker Deployment Guide

**Version:** 1.1.0
**Date:** November 22, 2025
**Architecture:** Dockerized API + Internal PostgreSQL + Redis Cache (Self-Contained)

---

## 🌌 Overview

The Nebula Protocol is fully dockerized with API access points for IDE integration and centralized Knowledge Graph sharing. This deployment is designed for **Docker Desktop** (local development) or single-node production servers.

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         NGINX (SSL/TLS)                       │
│                    Ports: 80 (HTTP) / 443 (HTTPS)            │
└────────────────────────┬──────────────────────────────────────┘
                         │
                ┌────────▼────────┐
                │  Nebula API     │  ← REST API + MCP Server
                │  (Node.js)      │     Port: 3000
                │                 │
                ├─────────────────┤
                │ • Project Memory│  ← SQLite per-project
                │ • Star Chart KG │  ← Cross-project learning
                │ • Versioning    │
                │ • Star Gates    │
                └────────┬────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
┌───────▼───────┐              ┌──────────▼─────────┐
│  PostgreSQL   │              │      Redis         │
│ (Central KG)  │              │  (Cache/Sessions)  │
│  Port: 5432   │              │   Port: 6379       │
└───────────────┘              └────────────────────┘
```

---

## ⚡ Quick Start

### Prerequisites

- Docker Desktop or Docker Engine (20.10+)
- Docker Compose (v2.0+)
- 4GB RAM minimum (8GB recommended)
- 10GB disk space

### 1. Clone and Configure

```bash
git clone https://github.com/JCorellaFSL/Nebula-Protocol.git
cd Nebula-Protocol

# Copy environment template
cp .env.example .env

# Edit configuration (important!)
nano .env  # or use your preferred editor
```

**Critical .env variables:**
```bash
JWT_SECRET=change_this_to_secure_random_string
KG_DB_PASSWORD=change_this_secure_password
```

### 2. Start Services

**Windows:**
```cmd
scripts\start.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

**Manual (any platform):**
```bash
docker-compose up -d
```

### 3. Verify Deployment

```bash
# Check service health
docker-compose ps

# Test API
curl http://localhost:3000/health

# View logs
docker-compose logs -f nebula-api
```

---

## 📊 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Nebula API** | http://localhost:3000 | Main API endpoint |
| **Health Check** | http://localhost:3000/health | Service status |
| **PostgreSQL** | localhost:5432 | Central KG database |
| **Redis** | localhost:6379 | Caching layer |
| **Prometheus** | http://localhost:9090 | Metrics (optional) |
| **Grafana** | http://localhost:3001 | Dashboards (optional) |

---

## 🔐 Authentication

### Generate API Token

```bash
curl -X POST http://localhost:3000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-32-character-api-key-here",
    "projectId": "my-project"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h",
  "type": "Bearer"
}
```

### Using the Token

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/project/my-project/stats
```

---

## 🛠️ API Endpoints

### Project Management

#### Initialize Project
```bash
POST /api/project/:projectId/init
Content-Type: application/json

{
  "name": "My Awesome Project",
  "framework": "Rust"
}
```

#### Get Project Version
```bash
GET /api/project/:projectId/version
```

**Response:**
```json
{
  "version": "0.1.4.5",
  "constellation": 0,
  "starSystem": 1,
  "qualityGate": 4,
  "patch": 5
}
```

#### Bump Version
```bash
POST /api/project/:projectId/version/bump
Content-Type: application/json

{
  "component": "star_system",  // constellation | star_system | quality_gate | patch
  "resetLower": true
}
```

### Error Logging

#### Log Error
```bash
POST /api/project/:projectId/error
Content-Type: application/json

{
  "level": "ERROR",
  "phase": "1",
  "constellation": "CORE",
  "filePath": "src/main.rs",
  "lineNumber": 42,
  "errorCode": "E0308",
  "message": "Type mismatch: expected Option<T>, found T",
  "stackTrace": "...",
  "context": { "function": "process_user" }
}
```

#### Record Solution
```bash
POST /api/project/:projectId/solution
Content-Type: application/json

{
  "errorId": "error-uuid-here",
  "solution": "Changed field to Option<T>",
  "codeChanges": "pub created_at: Option<DateTime>",
  "appliedBy": "human",
  "effectiveness": 5,
  "notes": "Fixed immediately"
}
```

### Star Gates

#### Record Star Gate
```bash
POST /api/project/:projectId/star-gate
Content-Type: application/json

{
  "constellation": "CORE",
  "constellationNumber": 1,
  "status": "passed",
  "testsAutomated": 25,
  "testsAutomatedPassing": 24,
  "testsManual": 3,
  "testsManualPassing": 3,
  "testsSkipped": 0,
  "performanceAcceptable": true,
  "docsUpdated": true,
  "notes": "All tests passing, ready for next constellation"
}
```

### Knowledge Graph

#### Create/Update Node
```bash
POST /api/kg/node
Content-Type: application/json

{
  "nodeId": "rust_type_system",
  "nodeType": "concept",
  "constellation": "1",
  "properties": {
    "difficulty": "medium",
    "importance": "high"
  }
}
```

#### Link Nodes
```bash
POST /api/kg/link
Content-Type: application/json

{
  "fromNode": "rust_type_system",
  "toNode": "option_type",
  "linkType": "contains",
  "weight": 0.9
}
```

#### Add Lesson Learned
```bash
POST /api/kg/lesson
Content-Type: application/json

{
  "constellation": "1",
  "category": "type_safety",
  "lesson": "Always use Option<T> for nullable database fields",
  "context": "SQLx integration",
  "impact": 5
}
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | production | Environment mode |
| `PORT` | 3000 | API server port |
| `JWT_SECRET` | *required* | JWT signing key |
| `POSTGRES_HOST` | postgres | Database host (internal Docker DNS) |
| `POSTGRES_PORT` | 5432 | Database port |
| `POSTGRES_DB` | central_kg | Database name |
| `POSTGRES_USER` | kg_user | Database user |
| `POSTGRES_PASSWORD` | *required* | Database password |
| `REDIS_HOST` | redis | Redis host |
| `REDIS_PORT` | 6379 | Redis port |
| `CENTRAL_KG_ENABLED` | true | Enable Central KG sync |

### Docker Compose Profiles

#### Default (minimal)
```bash
docker-compose up -d
```
Starts: API, PostgreSQL, Redis, Nginx

#### With Monitoring
```bash
docker-compose --profile monitoring up -d
```
Starts: All + Prometheus + Grafana

---

## 📈 Monitoring

### Enable Monitoring Stack

```bash
# Start with monitoring
docker-compose --profile monitoring up -d

# Access Prometheus
open http://localhost:9090

# Access Grafana (admin/admin)
open http://localhost:3001
```

### Key Metrics

- API request rate
- Error rates by endpoint
- Database connection pool status
- Redis cache hit ratio
- Average response times

### Health Checks

```bash
# API health
curl http://localhost:3000/health

# PostgreSQL health
docker exec nebula-postgres pg_isready -U kg_user

# Redis health
docker exec nebula-central-redis redis-cli ping
```

---

## 🔄 Backup & Restore

### Backup PostgreSQL

```bash
# Create backup
docker exec nebula-postgres pg_dump -U kg_user central_kg > backup.sql

# Or with timestamp
docker exec nebula-postgres pg_dump -U kg_user central_kg > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore PostgreSQL

```bash
# Restore from backup
cat backup.sql | docker exec -i nebula-postgres psql -U kg_user -d central_kg
```

### Backup Project Data

```bash
# Backup all project databases (SQLite)
docker cp nebula-central-api:/app/projects ./projects_backup
```

---

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs nebula-api

# Check all services
docker-compose ps

# Restart specific service
docker-compose restart nebula-api
```

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify connection from API
docker exec nebula-central-api ping postgres

# Manual connection test
docker exec -it nebula-postgres psql -U kg_user -d central_kg
```

### Port Already in Use

```bash
# Find process using port 3000
# Linux/Mac:
lsof -i :3000

# Windows:
netstat -ano | findstr :3000

# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

### Clean Reset

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose down --rmi all -v

# Start fresh
docker-compose up -d
```

---

## 📚 Additional Resources

- [API Documentation](./API_REFERENCE.md) - Complete API reference
- [Central KG Guide](./nebula-kg/CONNECTION_GUIDE.md) - KG integration details
- [Nebula Protocol](./Nebula_Protocol.md) - Framework specification
- [GitHub Issues](https://github.com/JCorellaFSL/Nebula-Protocol/issues) - Report bugs

---

## 🆘 Support

- **Documentation:** [https://docs.nebula-protocol.dev](https://docs.nebula-protocol.dev)
- **Issues:** [GitHub Issues](https://github.com/JCorellaFSL/Nebula-Protocol/issues)
- **Discussions:** [GitHub Discussions](https://github.com/JCorellaFSL/Nebula-Protocol/discussions)
- **Email:** support@nebula-protocol.dev

---

**Last Updated:** November 22, 2025
**Docker Version:** 20.10+
**Docker Compose Version:** 2.0+
