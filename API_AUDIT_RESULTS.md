# Nebula API Server Audit Results

**Date:** November 9, 2025  
**Auditor:** Protocol Review  
**Target:** `nebula-api-server.js` (1477 lines)  
**Specification:** `IDE_INTEGRATION.md` v3.0.0

---

## 🎯 Executive Summary

The current API server (`nebula-api-server.js`) is **NOT ready** for Nebula IDE integration. Critical gaps exist:

- ❌ **9 out of 17 IDE-required endpoints are missing**
- ❌ **Architecture mismatch:** Git-first vs. IDE-first
- ❌ **Versioning outdated:** Still using 4-component format (0.1.4.5)
- ❌ **Health check reports v2.0.0** (should be v3.0.0)
- ✅ **Documentation endpoints are complete** (4/4)

**Status:** 🔴 **CRITICAL - Requires Major Updates**

---

## 📊 Endpoint Coverage Analysis

### ✅ Implemented & Compliant (47% - 8/17 endpoints)

| Endpoint | Line | Status | Notes |
|----------|------|--------|-------|
| `GET /health` | 333 | ✅ Complete | But version is "2.0.0" |
| `GET /api/project/:id/version` | 833 | ✅ Complete | Works as specified |
| `POST /api/project/:id/version/bump` | 849 | ⚠️ Partial | Uses old 4-component format |
| `POST /api/docs/fetch` | 1323 | ✅ Complete | Fully functional |
| `GET /api/docs/search` | 1346 | ✅ Complete | Fully functional |
| `GET /api/docs/related` | 1368 | ✅ Complete | Fully functional |
| `POST /api/docs/extract-error` | 1388 | ✅ Complete | Fully functional |
| `POST /api/auth/token` | 407 | ✅ Complete | Works as specified |

---

### ❌ Missing Endpoints (53% - 9/17 endpoints)

These endpoints are **REQUIRED** for Nebula IDE but do NOT exist in the current API:

#### 1. Project Lifecycle Management

| Missing Endpoint | Priority | Reason |
|------------------|----------|--------|
| `POST /api/project/create` | 🔴 CRITICAL | IDE needs this to register projects in Central KG |
| `POST /api/project/:id/roadmap` | 🔴 CRITICAL | IDE needs this to generate PROJECT_ROADMAP.md |
| `POST /api/project/:id/constellation` | 🔴 CRITICAL | IDE needs this to generate constellation docs |
| `POST /api/project/:id/star-system` | 🟡 HIGH | IDE needs this to generate star system docs |

**What exists instead:**
- `POST /api/project/:projectId/init` (line 434) - Git-focused, doesn't match spec
- **Gap:** No document generation endpoints at all

---

#### 2. Knowledge Graph Integration

| Missing Endpoint | Priority | Reason |
|------------------|----------|--------|
| `POST /api/project/:id/kg/init` | 🔴 CRITICAL | IDE needs this to auto-setup project memory |
| `POST /api/project/:id/kg/log` | 🔴 CRITICAL | IDE needs this for automatic error logging |
| `GET /api/project/:id/kg/solutions` | 🔴 CRITICAL | IDE needs this to query Central KG for solutions |

**What exists instead:**
- `POST /api/project/:projectId/error` (line 895) - Partial match, but:
  - Uses `constellation` instead of `context`
  - Doesn't sync to Central KG (only local project memory)
  - Response format doesn't match spec
- `POST /api/kg/failures/similar` (line 1280) - Wrong path structure (`/api/kg/` instead of `/api/project/:id/kg/`)

**Critical Gap:** No Central KG integration endpoints!

---

#### 3. Star Gate Validation

| Missing Endpoint | Priority | Reason |
|------------------|----------|--------|
| `POST /api/project/:id/gate/check` | 🔴 CRITICAL | IDE needs this to enforce Star Gate validation |
| `GET /api/project/:id/gate/status` | 🔴 CRITICAL | IDE needs this to display checklist UI |

**What exists instead:**
- `POST /api/project/:projectId/star-gate` (line 1141) - Partial match, but:
  - Only records passed gates (doesn't validate)
  - No checklist status endpoint
  - No blocking logic for incomplete gates

**Critical Gap:** No actual validation or enforcement!

---

## 🔍 Architecture Mismatch Analysis

### Current Architecture (Git-First)

```
API Server
├─ Git Integration (lines 96, 434-614)
│  ├─ Initialize project with Git
│  ├─ Clone from Git
│  ├─ Commit/push
│  └─ Branch management
├─ Project Memory (local SQLite)
├─ Star Chart (global KG)
└─ Documentation Service
```

**Problems:**
1. Assumes all projects are Git repos
2. No project registration in Central KG
3. No document generation capabilities
4. No IDE-specific workflows

---

### Required Architecture (IDE-First)

```
API Server
├─ Project Registration (Central KG)
│  ├─ Create project
│  ├─ Generate roadmap
│  ├─ Generate constellation docs
│  └─ Generate star system docs
├─ Knowledge Graph Integration
│  ├─ Auto-init project memory
│  ├─ Log errors to Central KG
│  └─ Query solutions from Central KG
├─ Star Gate Validation
│  ├─ Check gate requirements
│  └─ Enforce blocking
└─ Documentation Service (✅ already implemented)
```

**What needs to be added:**
1. Project registration system
2. Document generation (LLM-powered)
3. Central KG sync (PostgreSQL)
4. Star Gate validation logic

---

## 📋 Specific Issues

### Issue 1: Version Management (Line 849)

**Current Implementation:**
```javascript
app.post('/api/project/:projectId/version/bump', authenticateToken, (req, res) => {
  const { component, resetLower } = req.body;
  const memory = new ProjectMemory(projectPath);
  const version = memory.bumpVersion(component || 'patch', resetLower !== false);
  // ...
});
```

**Problems:**
- Uses 4-component versioning (constellation.starSystem.qualityGate.patch)
- Doesn't support `"minor"` for constellation completion
- `resetLower` flag doesn't align with new spec (no reset in standard semver)

**Required Changes:**
```javascript
app.post('/api/project/:projectId/version/bump', authenticateToken, (req, res) => {
  const { component, reason } = req.body; // Add "reason" field
  
  // Map to semver:
  // "major" → MAJOR bump
  // "minor" → MINOR bump (constellation complete)
  // "patch" → PATCH bump (star system complete)
  
  const memory = new ProjectMemory(projectPath);
  const version = memory.bumpVersion(component || 'patch'); // No resetLower
  memory.close();
  
  res.json({
    success: true,
    old_version: version.oldVersion,
    new_version: version.version,
    component,
    reason,
    bumped_at: new Date().toISOString()
  });
});
```

---

### Issue 2: Health Check (Line 333)

**Current:**
```javascript
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    version: '2.0.0', // ❌ WRONG
    // ...
  };
});
```

**Required:**
```javascript
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    version: '3.0.0', // ✅ CORRECT
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      postgres: await checkPostgres() ? 'healthy' : 'unhealthy',
      redis: redisClient ? 'healthy' : 'unhealthy'
    }
  };
  // ...
});
```

---

### Issue 3: Error Logging (Line 895)

**Current:**
```javascript
app.post('/api/project/:projectId/error', authenticateToken, async (req, res) => {
  const { language, message, stackTrace, constellation, filePath, lineNumber } = req.body;
  
  const memory = new ProjectMemory(projectPath);
  const errorId = memory.recordError({ /* ... */ });
  
  // ❌ Only logs to local project memory
  // ❌ No Central KG sync
  // ❌ No solution suggestions from Central KG
  
  memory.close();
  res.json({ success: true, errorId });
});
```

**Required:**
```javascript
app.post('/api/project/:projectId/kg/log', authenticateToken, async (req, res) => {
  const { error_type, error_message, context, stack_trace, timestamp } = req.body;
  
  // 1. Log to local project memory
  const memory = new ProjectMemory(projectPath);
  const localErrorId = memory.recordError({ /* ... */ });
  memory.close();
  
  // 2. Sync to Central KG (PostgreSQL) ✅ NEW
  const centralKGResult = await centralKGSync.logError(projectId, {
    error_type,
    error_message,
    context,
    stack_trace
  });
  
  // 3. Query for solutions ✅ NEW
  const solutions = await centralKGSync.querySolutions(error_message);
  
  // 4. Fetch documentation ✅ EXISTS
  const docs = await docService.fetchDocumentation(context.language, error_message);
  
  res.json({
    error_id: centralKGResult.error_id,
    logged_to_project_memory: true,
    synced_to_central_kg: true,
    suggested_solutions: solutions,
    documentation_links: docs.data
  });
});
```

---

## 🛠️ Required Changes

### Phase 1: Critical Endpoints (Blocking IDE Development)

**Priority:** 🔴 CRITICAL  
**Timeline:** Week 1-2

#### 1. Add Project Registration Endpoint

```javascript
// POST /api/project/create
app.post('/api/project/create', async (req, res) => {
  const { name, description, type, language, framework } = req.body;
  
  // 1. Generate unique project ID
  const projectId = crypto.randomUUID();
  
  // 2. Create JWT token for this project
  const token = jwt.sign({ projectId, name }, JWT_SECRET, { expiresIn: '30d' });
  
  // 3. Register in Central KG (PostgreSQL)
  await centralKGSync.registerProject(projectId, {
    name,
    description,
    type,
    language,
    framework,
    created_at: new Date().toISOString()
  });
  
  res.json({
    project_id: projectId,
    api_token: token,
    created_at: new Date().toISOString(),
    initial_version: "0.0.0"
  });
});
```

---

#### 2. Add KG Integration Endpoints

```javascript
// POST /api/project/:projectId/kg/init
app.post('/api/project/:projectId/kg/init', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { project_name, language } = req.body;
  
  // 1. Create .nebula/project_memory.db (if not exists)
  const projectPath = path.join(config.storage.projectsDir, projectId);
  const memory = new ProjectMemory(projectPath, project_name, language);
  
  // 2. Log initial event to Central KG
  const eventId = await centralKGSync.logEvent(projectId, {
    event_type: 'project_initialized',
    message: 'Project initialized',
    timestamp: new Date().toISOString()
  });
  
  memory.close();
  
  res.json({
    kg_initialized: true,
    project_memory_path: '.nebula/project_memory.db',
    central_kg_connected: true,
    initial_event_logged: { event_id: eventId }
  });
});

// POST /api/project/:projectId/kg/log
// (See Issue 3 above for implementation)

// GET /api/project/:projectId/kg/solutions
app.get('/api/project/:projectId/kg/solutions', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { query } = req.query;
  
  const solutions = await centralKGSync.querySolutions(query);
  
  res.json({
    query,
    solutions
  });
});
```

---

#### 3. Add Star Gate Validation Endpoints

```javascript
// POST /api/project/:projectId/gate/check
app.post('/api/project/:projectId/gate/check', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { constellation_number, gate_number, checklist } = req.body;
  
  // 1. Validate checklist
  const validation = {
    tests: checklist.tests_passing && checklist.coverage_percent >= 80,
    git: checklist.git_committed && checklist.git_commit_sha,
    kg: checklist.errors_logged >= 1
  };
  
  const gate_passed = Object.values(validation).every(v => v === true);
  
  // 2. If passed, bump version
  let new_version = null;
  if (gate_passed) {
    const memory = new ProjectMemory(path.join(config.storage.projectsDir, projectId));
    const versionResult = memory.bumpVersion('minor'); // Constellation complete
    new_version = versionResult.version;
    memory.close();
    
    // 3. Log to Central KG
    await centralKGSync.logStarGate(projectId, {
      gate_number,
      constellation_number,
      passed: true,
      passed_at: new Date().toISOString()
    });
  }
  
  res.json({
    gate_passed,
    gate_id: gate_number,
    passed_at: gate_passed ? new Date().toISOString() : null,
    validation_results: {
      tests: { status: validation.tests ? 'pass' : 'fail' },
      git: { status: validation.git ? 'pass' : 'fail' },
      kg: { status: validation.kg ? 'pass' : 'fail' }
    },
    next_constellation: gate_passed ? constellation_number + 1 : null,
    new_version
  });
});

// GET /api/project/:projectId/gate/status
app.get('/api/project/:projectId/gate/status', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { gate } = req.query;
  
  // 1. Check current status from project memory
  const memory = new ProjectMemory(path.join(config.storage.projectsDir, projectId));
  const stats = memory.getStatistics();
  memory.close();
  
  // 2. Build checklist
  const checklist = [
    { item: 'All tests passing', status: stats.tests_passing ? 'complete' : 'incomplete' },
    { item: 'Code coverage >= 80%', status: stats.coverage >= 80 ? 'complete' : 'incomplete' },
    { item: 'Code committed to Git', status: stats.git_committed ? 'complete' : 'incomplete' },
    { item: 'Minimum 1 error logged to KG', status: stats.errors_logged >= 1 ? 'complete' : 'incomplete' }
  ];
  
  const blocking_items = checklist.filter(c => c.status === 'incomplete').map(c => c.item);
  
  res.json({
    gate_number: parseInt(gate),
    status: blocking_items.length === 0 ? 'ready' : 'in_progress',
    checklist,
    can_proceed: blocking_items.length === 0,
    blocking_items
  });
});
```

---

### Phase 2: Document Generation (Required for IDE)

**Priority:** 🟡 HIGH  
**Timeline:** Week 2-3

#### 1. Add Roadmap Generation

```javascript
// POST /api/project/:projectId/roadmap
app.post('/api/project/:projectId/roadmap', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { user_description, language, complexity } = req.body;
  
  // 1. Call LLM to generate roadmap
  const llmResponse = await llmService.generateRoadmap({
    description: user_description,
    language,
    complexity
  });
  
  res.json({
    roadmap: llmResponse.roadmap_markdown,
    suggested_constellations: llmResponse.constellations,
    estimated_complexity: complexity
  });
});
```

**Note:** Requires LLM integration (OpenAI/Anthropic API)

---

#### 2. Add Constellation/Star System Generation

```javascript
// POST /api/project/:projectId/constellation
app.post('/api/project/:projectId/constellation', authenticateToken, async (req, res) => {
  const { constellation_number, constellation_name, context } = req.body;
  
  // Call LLM to generate constellation document
  const content = await llmService.generateConstellation({
    number: constellation_number,
    name: constellation_name,
    context
  });
  
  res.json({
    constellation_id: constellation_number,
    file_name: `CONSTELLATION_${constellation_number}_${constellation_name.toUpperCase().replace(/ /g, '_')}.md`,
    content,
    suggested_star_systems: content.star_systems
  });
});

// POST /api/project/:projectId/star-system
app.post('/api/project/:projectId/star-system', authenticateToken, async (req, res) => {
  const { constellation_number, star_system_number, star_system_name, description } = req.body;
  
  // Call LLM to generate star system document
  const content = await llmService.generateStarSystem({
    constellation: constellation_number,
    number: star_system_number,
    name: star_system_name,
    description
  });
  
  res.json({
    star_system_id: star_system_number,
    file_name: `STAR_SYSTEM_${star_system_number}_${star_system_name.toUpperCase().replace(/ /g, '_')}.md`,
    content,
    steps: content.implementation_steps
  });
});
```

---

### Phase 3: Central KG Integration (Database Changes)

**Priority:** 🔴 CRITICAL  
**Timeline:** Week 1

#### Required Database Tables

```sql
-- Add to init.sql

-- Project registry
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  language VARCHAR(50),
  framework VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project errors (Central KG)
CREATE TABLE IF NOT EXISTS project_errors (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  error_type VARCHAR(100),
  error_message TEXT,
  context JSONB,
  stack_trace TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- Solutions (Central KG)
CREATE TABLE IF NOT EXISTS error_solutions (
  id UUID PRIMARY KEY,
  error_id UUID REFERENCES project_errors(id),
  description TEXT,
  command TEXT,
  success_rate DECIMAL(3,2),
  projects_used INTEGER DEFAULT 0,
  last_successful TIMESTAMP
);

-- Star Gate history
CREATE TABLE IF NOT EXISTS star_gates (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  gate_number INTEGER,
  constellation_number INTEGER,
  passed BOOLEAN,
  passed_at TIMESTAMP,
  validation_results JSONB
);
```

---

## 📊 Implementation Priority Matrix

| Task | Priority | Blocking | Est. Time |
|------|----------|----------|-----------|
| Fix health check version | 🟢 LOW | No | 5 min |
| Add project registration endpoint | 🔴 CRITICAL | **Yes** | 2 hours |
| Add KG init endpoint | 🔴 CRITICAL | **Yes** | 2 hours |
| Add KG log endpoint with Central sync | 🔴 CRITICAL | **Yes** | 4 hours |
| Add KG solutions endpoint | 🔴 CRITICAL | **Yes** | 2 hours |
| Add gate check endpoint | 🔴 CRITICAL | **Yes** | 3 hours |
| Add gate status endpoint | 🔴 CRITICAL | **Yes** | 2 hours |
| Update version bump to semver | 🟡 HIGH | No | 2 hours |
| Add roadmap generation | 🟡 HIGH | **Yes** | 8 hours |
| Add constellation generation | 🟡 HIGH | No | 6 hours |
| Add star system generation | 🟡 HIGH | No | 6 hours |
| Create Central KG database tables | 🔴 CRITICAL | **Yes** | 2 hours |
| Create CentralKGSync service | 🔴 CRITICAL | **Yes** | 6 hours |
| Integrate LLM service | 🟡 HIGH | **Yes** | 8 hours |

**Total Estimated Time:** ~60 hours (1.5 weeks full-time)

---

## 🚨 Critical Blockers for IDE Development

**Nebula IDE CANNOT proceed without these:**

1. ✅ `POST /api/project/create` - Project registration
2. ✅ `POST /api/project/:id/kg/init` - KG setup
3. ✅ `POST /api/project/:id/kg/log` - Error logging
4. ✅ `GET /api/project/:id/kg/solutions` - Solution queries
5. ✅ `POST /api/project/:id/gate/check` - Gate validation
6. ✅ `GET /api/project/:id/gate/status` - Gate status
7. ✅ `POST /api/project/:id/roadmap` - Roadmap generation

**Estimated time to unblock:** 2 weeks full-time

---

## 📝 Recommendations

### Immediate Actions (This Week)

1. **Update health check** to v3.0.0 (5 min)
2. **Create Central KG database schema** (2 hours)
3. **Implement CentralKGSync service** (6 hours)
4. **Add project registration endpoint** (2 hours)
5. **Add KG integration endpoints** (8 hours)
6. **Add Star Gate validation endpoints** (5 hours)

**Total:** ~23 hours

### Next Steps (Next Week)

1. **Integrate LLM service** (OpenAI/Anthropic)
2. **Add document generation endpoints**
3. **Update versioning to semver**
4. **Write integration tests**
5. **Update API documentation**

---

## ✅ What's Working Well

1. **Documentation endpoints** - Fully implemented and functional
2. **Git integration** - Robust branch management
3. **Rate limiting** - Well configured
4. **Error handling** - Comprehensive
5. **Logging** - Winston + Morgan setup
6. **Caching** - Redis + NodeCache
7. **Security** - Helmet + JWT

**These don't need changes for IDE integration.**

---

## 📄 Conclusion

**Current Status:** 47% complete (8/17 endpoints)  
**Blocking Issues:** 9 missing endpoints  
**Time to Completion:** ~60 hours (2 weeks)

**Next Steps:**
1. Review and approve this audit
2. Prioritize missing endpoints
3. Assign development resources
4. Begin Phase 1 implementation
5. Update IDE development timeline accordingly

---

**Audit Complete**  
**Version:** 1.0  
**Date:** November 9, 2025

