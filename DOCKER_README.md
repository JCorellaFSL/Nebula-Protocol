# Nebula Protocol - Docker API Architecture

## 🎯 What Changed

The Nebula Protocol has been **dockerized with full API access**, enabling:

1. **Centralized Knowledge Graph** - PostgreSQL-backed KG for cross-project learning
2. **REST API** - HTTP endpoints for all Nebula operations
3. **Scalable Architecture** - Docker containers with Nginx, Redis, monitoring
4. **Semantic Versioning** - CONSTELLATION.STAR_SYSTEM.QUALITY_GATE.PATCH (e.g., 0.1.4.5)
5. **Automated Syncing** - Project KG syncs after error resolution, Central KG after star system completion
6. **Service Health Checks** - Backend validation before development continues

---

## 📁 New Files Created

### Core Services
```
Nebula-Protocol/
├── docker-compose.yml          # Multi-service orchestration
├── Dockerfile                   # API server container
├── nebula-api-server.js        # Express API (42 endpoints)
├── .dockerignore               # Build optimization
└── .env.example                # Configuration template
```

### Database & Infrastructure
```
├── db/
│   └── init.sql                # PostgreSQL schema (Central KG)
├── nginx/
│   └── nginx.conf              # Reverse proxy + SSL config
├── monitoring/
│   └── prometheus.yml          # Metrics configuration
└── scripts/
    ├── start.sh / start.bat    # Deployment scripts
    └── stop.sh / stop.bat      # Shutdown scripts
```

### Documentation
```
├── DOCKER_DEPLOYMENT.md        # Complete deployment guide
└── nebula-kg/
    └── CONNECTION_GUIDE.md     # Central KG API reference
```

### Code Updates
```
├── project-memory.js           # Added versioning system
│   ├── getVersion()
│   ├── bumpVersion()
│   └── setVersion()
└── package.json                # Added Express dependencies
```

---

## 🚀 Quick Start

### 1. Start Services

**Windows:**
```cmd
scripts\start.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

### 2. Test API

```bash
# Health check
curl http://localhost:3000/health

# Get project version
curl http://localhost:3000/api/project/test-project/version \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. View Services

- **API:** http://localhost:3000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379
- **Monitoring:** http://localhost:9090 (with `--profile monitoring`)

---

## 🔑 Key Features

### 1. Semantic Versioning

**Format:** `CONSTELLATION.STAR_SYSTEM.QUALITY_GATE.PATCH`

```javascript
// Example: 0.1.4.5
// 0 = Constellation (Setup)
// 1 = Star System (Environment)
// 4 = Quality Gate (4th gate passed)
// 5 = Patch (5th bug fix)
```

**API:**
```bash
# Get version
GET /api/project/:projectId/version

# Bump version
POST /api/project/:projectId/version/bump
{
  "component": "star_system",  // constellation | star_system | quality_gate | patch
  "resetLower": true           // Reset lower components to 0
}
```

### 2. Automatic KG Sync

**Project KG:** Syncs after error resolution
```bash
POST /api/project/:projectId/solution
# Automatically bumps patch version and syncs Project KG
```

**Central KG:** Syncs after star system completion
```bash
POST /api/project/:projectId/star-gate
{
  "status": "passed",
  "constellation": "CORE",
  "constellationNumber": 1
}
# Automatically bumps quality_gate version and syncs to Central KG
```

### 3. Service Health Checks

All containers include health checks:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Your IDE / Client                    │
│              (Rust, VSCode, Web Browser)               │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTPS (wss:// for WebSocket)
                     ▼
┌─────────────────────────────────────────────────────────┐
│               NGINX (Reverse Proxy + SSL)               │
│          Rate Limiting, Security Headers, CORS          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Nebula API Server (Node.js)                │
│  ┌────────────────────────────────────────────────┐    │
│  │ REST API Endpoints (42 endpoints)              │    │
│  │  • /api/project/* (Project Memory)             │    │
│  │  • /api/kg/* (Knowledge Graph)                 │    │
│  │  • /api/auth/* (Authentication)                │    │
│  └────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────┐    │
│  │ Core Services                                  │    │
│  │  • ProjectMemory (SQLite per-project)          │    │
│  │  • StarChart (Global KG)                      │    │
│  │  • Versioning (Semantic)                      │    │
│  └────────────────────────────────────────────────┘    │
└───────────┬───────────────────┬─────────────────────────┘
            │                   │
     ┌──────▼──────┐     ┌──────▼──────┐
     │ PostgreSQL  │     │    Redis    │
     │ (Central KG)│     │  (Cache)    │
     │ Port: 5432  │     │ Port: 6379  │
     └─────────────┘     └─────────────┘
```

---

## 🔐 Security

### Authentication
- JWT tokens (24h expiration)
- API key validation
- Rate limiting (100 req/15min per IP)

### Network
- Nginx reverse proxy
- SSL/TLS encryption
- CORS configured
- Security headers (Helmet.js)

### Data
- Anonymized error patterns
- No PII sent to Central KG
- Project data isolated (SQLite per-project)

---

## 📈 Monitoring

### Enable Monitoring Stack
```bash
docker-compose --profile monitoring up -d
```

**Includes:**
- Prometheus (metrics collection)
- Grafana (visualization)
- Pre-configured dashboards

**Access:**
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

### Key Metrics
- API request rate & latency
- Error rates by endpoint
- Database connection pool
- Redis cache hit ratio
- Version bump frequency

---

## 🛠️ Development Workflow

### 1. Initialize Project
```bash
POST /api/project/my-project/init
{
  "name": "My Awesome Project",
  "framework": "Rust"
}
```

### 2. Work on Constellation
```bash
# Log errors as they occur
POST /api/project/my-project/error
{
  "level": "ERROR",
  "constellation": "CORE",
  "message": "Type mismatch: expected Option<T>, found T"
}
```

### 3. Resolve Errors
```bash
# Record solution (auto-bumps patch, syncs Project KG)
POST /api/project/my-project/solution
{
  "errorId": "...",
  "solution": "Changed field to Option<T>",
  "effectiveness": 5
}
```

### 4. Complete Star System
```bash
# Record Star Gate passage (auto-bumps quality_gate, syncs Central KG)
POST /api/project/my-project/star-gate
{
  "constellation": "CORE",
  "constellationNumber": 1,
  "status": "passed",
  "testsAutomated": 25,
  "testsAutomatedPassing": 24
}
```

### 5. Check Progress
```bash
# Get version
GET /api/project/my-project/version
# Response: { "version": "0.1.1.3", "constellation": 0, "starSystem": 1, ... }

# Get statistics
GET /api/project/my-project/stats
```

---

## 🌐 Deployment Options

### Local Development
```bash
./scripts/start.sh
# Uses localhost URLs
# No SSL required
# SQLite for Project Memory
# PostgreSQL for Central KG
```

### Bare Metal Server
```bash
# Update .env with server IP/domain
CENTRAL_KG_URL=https://kg.yourdomain.com
JWT_SECRET=$(openssl rand -hex 32)

# Start with SSL
docker-compose up -d
```

### Cloud (AWS/GCP/Azure)
- Use managed PostgreSQL (RDS/Cloud SQL)
- Use managed Redis (ElastiCache/Memorystore)
- Deploy Nebula API to ECS/Cloud Run/App Service
- Configure Load Balancer for SSL
- Enable auto-scaling

---

## 📝 Migration from MCP-Only

### Before (MCP Server)
```javascript
// Only accessible via Cursor/IDE
setup_project_framework(project_path, ...)
project_memory_init(project_path, ...)
```

### After (Docker + API)
```bash
# Accessible from anywhere via HTTP
POST http://your-server:3000/api/project/123/init
POST http://your-server:3000/api/project/123/error
GET  http://your-server:3000/api/project/123/stats
```

### Compatibility
- **MCP Server still works!** (`nebula-framework-mcp.js`)
- Docker deployment is **additional**, not replacement
- Can use both: MCP for local IDE, API for remote/centralized

---

## 🎓 Next Steps

1. ✅ **Read:** [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Full deployment guide
2. ✅ **Configure:** Edit `.env` with your settings
3. ✅ **Deploy:** Run `./scripts/start.sh` (or `.bat`)
4. ✅ **Test:** `curl http://localhost:3000/health`
5. ✅ **Integrate:** Connect your IDE to the API
6. ✅ **Monitor:** Enable monitoring profile for metrics
7. ✅ **Scale:** Deploy to bare metal/cloud when ready

---

## 🆘 Troubleshooting

### Service Won't Start
```bash
docker-compose logs nebula-api
docker-compose ps
```

### Port Conflicts
Edit `docker-compose.yml` ports section:
```yaml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

### Database Issues
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify connection
docker exec -it nebula-postgres psql -U nebula -d nebula_central_kg
```

### Clean Reset
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📚 Documentation

- **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)** - Complete deployment guide
- **[nebula-kg/CONNECTION_GUIDE.md](./nebula-kg/CONNECTION_GUIDE.md)** - Central KG API reference
- **[Nebula_Protocol.md](./Nebula_Protocol.md)** - Framework specification
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Implementation details

---

**Built with:** Docker, Node.js, Express, PostgreSQL, Redis, Nginx  
**Deployment:** Bare Metal, Cloud, Docker Compose  
**Architecture:** Microservices, REST API, JWT Auth, Central KG

**Version:** 1.0.0  
**Last Updated:** November 8, 2025

