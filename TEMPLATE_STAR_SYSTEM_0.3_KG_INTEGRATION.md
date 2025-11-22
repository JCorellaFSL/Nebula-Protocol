# Star System 0.3: Knowledge Graph Integration

**Constellation:** 0 (Setup)  
**Star System:** 0.3  
**Type:** Technical Implementation (MANDATORY)  
**Version:** 3.0.0  
**Status:** Template

---

## ⚠️ CRITICAL: This Star System is MANDATORY

Knowledge Graph integration is **NOT optional**. Every project using the Nebula Protocol MUST complete this Star System during Constellation 0. Star Gate 0 will automatically FAIL if KG integration is not completed and at least one error has not been logged.

---

## 🎯 Objective

Connect the project to the **Central Knowledge Graph** (PostgreSQL-backed) for:
1. **Automatic error tracking** across all development phases
2. **Solution reuse** from previous projects and community knowledge
3. **Pattern recognition** for common issues
4. **Cross-project learning** and intelligence

By the end of this Star System:
- ✅ Project Memory (local SQLite) initialized
- ✅ Central KG connection established
- ✅ Project registered in Central KG
- ✅ Test error logged and verified
- ✅ Query functionality tested

---

## 📋 Prerequisites

Before starting this Star System, ensure:
- ✅ Constellation 0 started
- ✅ Star System 0.1 (Environment) complete
- ✅ Star System 0.2 (Dependencies) complete
- ✅ Docker services running (Central KG database + Redis)
- ✅ API endpoint accessible (`http://localhost:3000`)

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────┐
│ Your Project                       │
│ ┌────────────────────────────────┐ │
│ │ project_memory.py / .js / .rs  │ │ ← You create this
│ │ (Language-specific wrapper)    │ │
│ └────────────┬───────────────────┘ │
│              │                      │
│ ┌────────────▼───────────────────┐ │
│ │ .nebula/project_memory.db      │ │ ← Local SQLite cache
│ │ (Errors, solutions, context)   │ │
│ └────────────┬───────────────────┘ │
└──────────────┼─────────────────────┘
               │ HTTP/REST
               ↓
┌──────────────────────────────────────┐
│ Central Knowledge Graph (Docker)     │
│ ┌──────────────────────────────────┐ │
│ │ PostgreSQL (Port 5433)           │ │
│ │ - error_patterns                 │ │
│ │ - solutions                      │ │
│ │ - project_registry               │ │
│ │ - cross_project_intelligence     │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 📝 Implementation Steps

### Step 1: Verify Docker Services

**Objective:** Confirm Central KG is running and accessible.

**Commands:**

```bash
# Check Docker containers are running
docker ps

# Expected output should include:
# - nebula-central-kg-db (PostgreSQL, port 5433)
# - nebula-central-kg-redis (Redis, port 6380)
```

**If containers are NOT running:**

```bash
# Windows PowerShell
docker start nebula-central-kg-db nebula-central-kg-redis

# Linux/macOS
docker start nebula-central-kg-db nebula-central-kg-redis
```

**Validation:**

```bash
# Test PostgreSQL connection
docker exec nebula-central-kg-db psql -U nebula -d nebula_central_kg -c "SELECT 1;"

# Expected output:
#  ?column? 
# ----------
#         1
# (1 row)
```

**If validation fails:**
- Check Docker Desktop is running
- Verify containers exist: `docker ps -a`
- Check logs: `docker logs nebula-central-kg-db`

---

### Step 2: Create `.nebula/` Directory

**Objective:** Create IDE-managed directory for project metadata.

**Commands:**

```bash
# Create .nebula directory
mkdir .nebula

# Create logs subdirectory
mkdir .nebula/logs
```

**File Structure:**
```
your-project/
├── .nebula/                     ← New directory
│   ├── config.json              ← Will be created by IDE
│   ├── project_memory.db        ← Will be auto-created
│   └── logs/                    ← For debugging
│       ├── kg_sync.log
│       └── api_calls.log
```

**Update `.gitignore`:**

```gitignore
# Nebula IDE files (local only, do not commit)
.nebula/
!.nebula/.gitkeep
```

**Validation:**
- ✅ `.nebula/` directory exists
- ✅ `.nebula/` added to `.gitignore`

---

### Step 3: Create Project Memory Module

**Objective:** Create language-specific wrapper for Central KG integration.

Choose the implementation for your project's language:

---

#### Option A: Python Implementation

**File:** `src/<your_package>/project_memory.py` or `src/project_memory.py`

```python
"""
Project Memory - Central Knowledge Graph Integration
Auto-generated by Nebula Protocol v3.0
"""

import sqlite3
import json
import requests
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List, Any

# Configuration
PROJECT_NAME = "your-project-name"  # Update this
API_ENDPOINT = "http://localhost:3000/api"
PROJECT_ID = None  # Will be set after registration
API_TOKEN = None   # Will be set after registration

# Local database path
DB_PATH = Path(".nebula/project_memory.db")

class ProjectMemory:
    """Local project memory with Central KG sync."""
    
    def __init__(self):
        self.db_path = DB_PATH
        self._init_local_db()
        self._load_config()
    
    def _init_local_db(self):
        """Initialize local SQLite database."""
        DB_PATH.parent.mkdir(exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS errors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                error_id TEXT UNIQUE,
                error_type TEXT,
                error_message TEXT,
                context TEXT,
                stack_trace TEXT,
                timestamp TEXT,
                resolved BOOLEAN DEFAULT 0,
                synced BOOLEAN DEFAULT 0
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS solutions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                error_id TEXT,
                solution_description TEXT,
                solution_command TEXT,
                success_rate REAL,
                applied_at TEXT,
                worked BOOLEAN,
                FOREIGN KEY (error_id) REFERENCES errors(error_id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sync_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                synced_at TEXT,
                records_synced INTEGER,
                status TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    
    def _load_config(self):
        """Load project ID and token from .nebula/config.json."""
        global PROJECT_ID, API_TOKEN
        
        config_path = Path(".nebula/config.json")
        if config_path.exists():
            with open(config_path) as f:
                config = json.load(f)
                PROJECT_ID = config.get("project", {}).get("id")
                API_TOKEN = config.get("api", {}).get("token")
    
    def log_error(
        self,
        error_type: str,
        error_message: str,
        context: Optional[Dict[str, Any]] = None,
        stack_trace: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Log an error to local DB and sync to Central KG.
        
        Args:
            error_type: Type of error (e.g., "ImportError", "TypeError")
            error_message: Error message
            context: Additional context (file, line, etc.)
            stack_trace: Full stack trace
        
        Returns:
            Dict with error_id, suggested_solutions, documentation_links
        """
        timestamp = datetime.now().isoformat()
        
        # 1. Save to local DB
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO errors (error_type, error_message, context, stack_trace, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (error_type, error_message, json.dumps(context or {}), stack_trace, timestamp))
        
        local_error_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # 2. Sync to Central KG
        if PROJECT_ID and API_TOKEN:
            try:
                response = requests.post(
                    f"{API_ENDPOINT}/project/{PROJECT_ID}/kg/log",
                    headers={"Authorization": f"Bearer {API_TOKEN}"},
                    json={
                        "error_type": error_type,
                        "error_message": error_message,
                        "context": context or {},
                        "stack_trace": stack_trace,
                        "timestamp": timestamp
                    },
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Update local DB with Central KG error ID
                    conn = sqlite3.connect(self.db_path)
                    cursor = conn.cursor()
                    cursor.execute("""
                        UPDATE errors SET error_id = ?, synced = 1
                        WHERE id = ?
                    """, (data["error_id"], local_error_id))
                    conn.commit()
                    conn.close()
                    
                    return {
                        "error_id": data["error_id"],
                        "local_id": local_error_id,
                        "suggested_solutions": data.get("suggested_solutions", []),
                        "documentation_links": data.get("documentation_links", []),
                        "synced": True
                    }
                else:
                    print(f"[WARNING] Failed to sync to Central KG: HTTP {response.status_code}")
                    return {
                        "error_id": None,
                        "local_id": local_error_id,
                        "suggested_solutions": [],
                        "documentation_links": [],
                        "synced": False
                    }
            
            except requests.exceptions.RequestException as e:
                print(f"[WARNING] Central KG unreachable: {e}")
                return {
                    "error_id": None,
                    "local_id": local_error_id,
                    "suggested_solutions": [],
                    "documentation_links": [],
                    "synced": False
                }
        else:
            print("[WARNING] Project not registered with Central KG")
            return {
                "error_id": None,
                "local_id": local_error_id,
                "suggested_solutions": [],
                "documentation_links": [],
                "synced": False
            }
    
    def query_solutions(self, error_message: str) -> List[Dict[str, Any]]:
        """
        Query Central KG for known solutions to similar errors.
        
        Args:
            error_message: Error message to search for
        
        Returns:
            List of solutions from Central KG
        """
        if not PROJECT_ID or not API_TOKEN:
            print("[WARNING] Project not registered with Central KG")
            return []
        
        try:
            response = requests.get(
                f"{API_ENDPOINT}/project/{PROJECT_ID}/kg/solutions",
                headers={"Authorization": f"Bearer {API_TOKEN}"},
                params={"query": error_message},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("solutions", [])
            else:
                print(f"[WARNING] Query failed: HTTP {response.status_code}")
                return []
        
        except requests.exceptions.RequestException as e:
            print(f"[WARNING] Central KG unreachable: {e}")
            return []
    
    def mark_solution_effective(self, error_id: str, solution_id: str):
        """Mark a solution as effective (positive feedback to Central KG)."""
        if not PROJECT_ID or not API_TOKEN:
            return
        
        try:
            requests.post(
                f"{API_ENDPOINT}/project/{PROJECT_ID}/kg/mark-resolved",
                headers={"Authorization": f"Bearer {API_TOKEN}"},
                json={"error_id": error_id, "solution_id": solution_id},
                timeout=5
            )
        except requests.exceptions.RequestException:
            pass  # Fail silently
    
    def test_connection(self) -> bool:
        """Test connection to Central KG."""
        try:
            response = requests.get(f"{API_ENDPOINT}/../health", timeout=5)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False

# Singleton instance
_memory = ProjectMemory()

# Convenience functions
def log_error(error_type, error_message, context=None, stack_trace=None):
    """Log an error (convenience wrapper)."""
    return _memory.log_error(error_type, error_message, context, stack_trace)

def query_solutions(error_message):
    """Query solutions (convenience wrapper)."""
    return _memory.query_solutions(error_message)

def test_connection():
    """Test Central KG connection."""
    return _memory.test_connection()
```

**Validation:**

```bash
# Test import
python -c "import src.project_memory; print('✅ Import successful')"

# Test connection
python -c "from src.project_memory import test_connection; print('✅ Connected' if test_connection() else '❌ Connection failed')"

# Test error logging
python -c "
from src.project_memory import log_error
result = log_error('TestError', 'This is a test error from Star System 0.3')
print(f'✅ Error logged: {result}')
"
```

---

#### Option B: JavaScript/TypeScript Implementation

**File:** `src/projectMemory.js`

```javascript
/**
 * Project Memory - Central Knowledge Graph Integration
 * Auto-generated by Nebula Protocol v3.0
 */

const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_NAME = 'your-project-name'; // Update this
const API_ENDPOINT = 'http://localhost:3000/api';
let PROJECT_ID = null;
let API_TOKEN = null;

const DB_PATH = path.join('.nebula', 'project_memory.db');

class ProjectMemory {
    constructor() {
        this.dbPath = DB_PATH;
        this._initLocalDB();
        this._loadConfig();
    }
    
    _initLocalDB() {
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        this.db = new sqlite3.Database(DB_PATH);
        
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS errors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    error_id TEXT UNIQUE,
                    error_type TEXT,
                    error_message TEXT,
                    context TEXT,
                    stack_trace TEXT,
                    timestamp TEXT,
                    resolved BOOLEAN DEFAULT 0,
                    synced BOOLEAN DEFAULT 0
                )
            `);
            
            this.db.run(`
                CREATE TABLE IF NOT EXISTS solutions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    error_id TEXT,
                    solution_description TEXT,
                    solution_command TEXT,
                    success_rate REAL,
                    applied_at TEXT,
                    worked BOOLEAN,
                    FOREIGN KEY (error_id) REFERENCES errors(error_id)
                )
            `);
        });
    }
    
    _loadConfig() {
        const configPath = path.join('.nebula', 'config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            PROJECT_ID = config.project?.id;
            API_TOKEN = config.api?.token;
        }
    }
    
    async logError(errorType, errorMessage, context = {}, stackTrace = null) {
        const timestamp = new Date().toISOString();
        
        // 1. Save to local DB
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO errors (error_type, error_message, context, stack_trace, timestamp)
                 VALUES (?, ?, ?, ?, ?)`,
                [errorType, errorMessage, JSON.stringify(context), stackTrace, timestamp],
                async function(err) {
                    if (err) return reject(err);
                    
                    const localErrorId = this.lastID;
                    
                    // 2. Sync to Central KG
                    if (PROJECT_ID && API_TOKEN) {
                        try {
                            const response = await axios.post(
                                `${API_ENDPOINT}/project/${PROJECT_ID}/kg/log`,
                                {
                                    error_type: errorType,
                                    error_message: errorMessage,
                                    context,
                                    stack_trace: stackTrace,
                                    timestamp
                                },
                                {
                                    headers: { Authorization: `Bearer ${API_TOKEN}` },
                                    timeout: 5000
                                }
                            );
                            
                            resolve({
                                error_id: response.data.error_id,
                                local_id: localErrorId,
                                suggested_solutions: response.data.suggested_solutions || [],
                                documentation_links: response.data.documentation_links || [],
                                synced: true
                            });
                        } catch (error) {
                            console.warn('[WARNING] Failed to sync to Central KG:', error.message);
                            resolve({
                                error_id: null,
                                local_id: localErrorId,
                                suggested_solutions: [],
                                documentation_links: [],
                                synced: false
                            });
                        }
                    } else {
                        console.warn('[WARNING] Project not registered with Central KG');
                        resolve({
                            error_id: null,
                            local_id: localErrorId,
                            suggested_solutions: [],
                            documentation_links: [],
                            synced: false
                        });
                    }
                }
            );
        });
    }
    
    async querySolutions(errorMessage) {
        if (!PROJECT_ID || !API_TOKEN) {
            console.warn('[WARNING] Project not registered with Central KG');
            return [];
        }
        
        try {
            const response = await axios.get(
                `${API_ENDPOINT}/project/${PROJECT_ID}/kg/solutions`,
                {
                    headers: { Authorization: `Bearer ${API_TOKEN}` },
                    params: { query: errorMessage },
                    timeout: 5000
                }
            );
            
            return response.data.solutions || [];
        } catch (error) {
            console.warn('[WARNING] Central KG unreachable:', error.message);
            return [];
        }
    }
    
    async testConnection() {
        try {
            const response = await axios.get(`${API_ENDPOINT}/../health`, { timeout: 5000 });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}

// Singleton
const memory = new ProjectMemory();

module.exports = {
    logError: (...args) => memory.logError(...args),
    querySolutions: (...args) => memory.querySolutions(...args),
    testConnection: () => memory.testConnection()
};
```

**Validation:**

```bash
# Test import
node -e "const pm = require('./src/projectMemory'); console.log('✅ Import successful');"

# Test connection
node -e "const {testConnection} = require('./src/projectMemory'); testConnection().then(r => console.log(r ? '✅ Connected' : '❌ Connection failed'));"

# Test error logging
node -e "
const {logError} = require('./src/projectMemory');
logError('TestError', 'This is a test error from Star System 0.3')
    .then(result => console.log('✅ Error logged:', result));
"
```

---

#### Option C: Rust Implementation

**File:** `src/project_memory.rs`

```rust
// Project Memory - Central Knowledge Graph Integration
// Auto-generated by Nebula Protocol v3.0

use rusqlite::{Connection, params};
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use std::path::Path;

const API_ENDPOINT: &str = "http://localhost:3000/api";
const DB_PATH: &str = ".nebula/project_memory.db";

#[derive(Serialize, Deserialize, Debug)]
pub struct ErrorLog {
    pub error_type: String,
    pub error_message: String,
    pub context: Option<String>,
    pub stack_trace: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct ErrorResponse {
    pub error_id: String,
    pub suggested_solutions: Vec<Solution>,
    pub documentation_links: Vec<DocLink>,
}

#[derive(Deserialize, Debug)]
pub struct Solution {
    pub description: String,
    pub command: Option<String>,
    pub success_rate: f64,
}

#[derive(Deserialize, Debug)]
pub struct DocLink {
    pub title: String,
    pub url: String,
}

pub struct ProjectMemory {
    db: Connection,
    client: Client,
}

impl ProjectMemory {
    pub fn new() -> rusqlite::Result<Self> {
        let db = Connection::open(DB_PATH)?;
        
        db.execute(
            "CREATE TABLE IF NOT EXISTS errors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                error_id TEXT UNIQUE,
                error_type TEXT,
                error_message TEXT,
                context TEXT,
                stack_trace TEXT,
                timestamp TEXT,
                resolved BOOLEAN DEFAULT 0,
                synced BOOLEAN DEFAULT 0
            )",
            [],
        )?;
        
        Ok(Self {
            db,
            client: Client::new(),
        })
    }
    
    pub fn log_error(&self, error: ErrorLog) -> Result<ErrorResponse, Box<dyn std::error::Error>> {
        // 1. Save to local DB
        let timestamp = chrono::Utc::now().to_rfc3339();
        
        self.db.execute(
            "INSERT INTO errors (error_type, error_message, context, stack_trace, timestamp)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                error.error_type,
                error.error_message,
                error.context,
                error.stack_trace,
                timestamp
            ],
        )?;
        
        // 2. Sync to Central KG
        let response = self.client
            .post(format!("{}/project/PROJECT_ID/kg/log", API_ENDPOINT))
            .json(&error)
            .send()?
            .json::<ErrorResponse>()?;
        
        Ok(response)
    }
    
    pub fn test_connection(&self) -> bool {
        self.client
            .get(format!("{}/health", API_ENDPOINT.replace("/api", "")))
            .send()
            .map(|r| r.status().is_success())
            .unwrap_or(false)
    }
}
```

**Note:** Rust implementation requires additional dependencies:
```toml
[dependencies]
rusqlite = "0.30"
reqwest = { version = "0.11", features = ["blocking", "json"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
chrono = "0.4"
```

---

### Step 4: Register Project with Central KG

**Objective:** Register this project in the Central KG and obtain authentication token.

**Option A: Using Nebula IDE (Automatic)**

If using Nebula IDE, this step is **automatic** when you create a new project. Skip to Step 5.

**Option B: Manual Registration (For testing)**

```bash
# Call the API endpoint
curl -X POST http://localhost:3000/api/project/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "your-project-name",
    "description": "Brief project description",
    "type": "python",
    "language": "python"
  }'

# Response will include:
# {
#   "project_id": "uuid-string",
#   "api_token": "jwt-token-string",
#   "created_at": "2025-11-09T12:00:00Z"
# }
```

**Update `.nebula/config.json`:**

```json
{
  "version": "3.0.0",
  "project": {
    "id": "paste-project-id-here",
    "name": "your-project-name",
    "type": "python"
  },
  "api": {
    "endpoint": "http://localhost:3000",
    "token": "paste-api-token-here"
  },
  "structure": {
    "current_constellation": 0,
    "version": "0.0.0"
  },
  "kg": {
    "enabled": true,
    "project_memory_path": ".nebula/project_memory.db"
  }
}
```

**Update `project_memory.py`:**

Replace `PROJECT_NAME = "your-project-name"` with your actual project name.

**Validation:**

```bash
python -c "from src.project_memory import test_connection; print('✅ Registered' if test_connection() else '❌ Registration failed')"
```

---

### Step 5: Log First Error (Test)

**Objective:** Log a test error to verify end-to-end functionality.

**Python:**

```bash
python -c "
from src.project_memory import log_error
result = log_error(
    error_type='TestError',
    error_message='Test error from Star System 0.3 - KG integration verified',
    context={'constellation': 0, 'star_system': '0.3', 'test': True}
)
print('✅ Test error logged successfully!')
print(f'Error ID: {result[\"error_id\"]}')
print(f'Synced to Central KG: {result[\"synced\"]}')
if result.get('suggested_solutions'):
    print(f'Found {len(result[\"suggested_solutions\"])} suggested solutions')
"
```

**JavaScript:**

```bash
node -e "
const {logError} = require('./src/projectMemory');
logError('TestError', 'Test error from Star System 0.3', {test: true})
    .then(result => {
        console.log('✅ Test error logged successfully!');
        console.log('Error ID:', result.error_id);
        console.log('Synced:', result.synced);
    });
"
```

**Expected Output:**

```
✅ Test error logged successfully!
Error ID: <uuid>
Synced to Central KG: True
```

**Verification:**

Check local database:
```bash
sqlite3 .nebula/project_memory.db "SELECT * FROM errors;"
```

Check Central KG (via API):
```bash
# Replace PROJECT_ID and TOKEN with your values
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/project/YOUR_PROJECT_ID/kg/solutions?query=TestError
```

---

### Step 6: Query Solutions Test

**Objective:** Verify you can query Central KG for known solutions.

**Python:**

```bash
python -c "
from src.project_memory import query_solutions
solutions = query_solutions('ImportError')
print(f'Found {len(solutions)} solutions for ImportError')
for i, sol in enumerate(solutions[:3], 1):
    print(f'{i}. {sol[\"description\"]} (success rate: {sol[\"success_rate\"]*100:.0f}%)')
"
```

**Expected Output:**

```
Found 523 solutions for ImportError
1. Install missing package via pip (success rate: 98%)
2. Check PYTHONPATH configuration (success rate: 85%)
3. Verify virtual environment activated (success rate: 92%)
```

---

## ✅ Success Criteria

Before proceeding to Star Gate 0, verify:

- ✅ Docker services running (`docker ps` shows both containers)
- ✅ `.nebula/` directory created and in `.gitignore`
- ✅ `project_memory.py` (or equivalent) created
- ✅ Project registered in Central KG
- ✅ `.nebula/config.json` contains `project_id` and `api_token`
- ✅ Test error logged successfully (`local_id` and `error_id` present)
- ✅ `test_connection()` returns `True`
- ✅ `query_solutions()` returns results
- ✅ `.nebula/project_memory.db` file exists and contains test error

---

## 📊 Integration Into Your Code

From now on, **wrap all error-prone code** with KG logging:

**Python Example:**

```python
from src.project_memory import log_error

try:
    import some_module
except ImportError as e:
    # Log to Central KG
    result = log_error(
        error_type='ImportError',
        error_message=str(e),
        context={'file': __file__},
        stack_trace=traceback.format_exc()
    )
    
    # Show suggested solutions
    if result.get('suggested_solutions'):
        print("Suggested solutions:")
        for sol in result['suggested_solutions']:
            print(f"- {sol['description']}")
    
    raise  # Re-raise after logging
```

**JavaScript Example:**

```javascript
const {logError} = require('./src/projectMemory');

async function riskyOperation() {
    try {
        // ... operation that might fail ...
    } catch (error) {
        const result = await logError(
            error.name,
            error.message,
            {file: __filename},
            error.stack
        );
        
        if (result.suggested_solutions.length > 0) {
            console.log('Suggested solutions:');
            result.suggested_solutions.forEach(sol => {
                console.log(`- ${sol.description}`);
            });
        }
        
        throw error;  // Re-raise after logging
    }
}
```

---

## 🚨 Troubleshooting

### Problem: "Connection failed"

**Symptoms:**
```
❌ Connection failed
[WARNING] Central KG unreachable
```

**Solutions:**
1. Check Docker containers:
   ```bash
   docker ps
   ```
   If not running: `docker start nebula-central-kg-db nebula-central-kg-redis`

2. Check API health:
   ```bash
   curl http://localhost:3000/health
   ```

3. Check firewall/ports:
   - Port 3000: API
   - Port 5433: PostgreSQL
   - Port 6380: Redis

---

### Problem: "Project not registered"

**Symptoms:**
```
[WARNING] Project not registered with Central KG
```

**Solutions:**
1. Check `.nebula/config.json` exists and has `project.id` and `api.token`
2. Re-register manually:
   ```bash
   curl -X POST http://localhost:3000/api/project/create \
     -H "Content-Type: application/json" \
     -d '{"name": "your-project", "type": "python"}'
   ```
3. Update `config.json` with returned `project_id` and `api_token`

---

### Problem: "401 Unauthorized"

**Symptoms:**
```
Failed to sync to Central KG: HTTP 401
```

**Solutions:**
1. Token expired → Re-authenticate
2. Token invalid → Check `.nebula/config.json` → `api.token`
3. Regenerate token via API

---

## 📚 Additional Resources

- **API Documentation:** `IDE_INTEGRATION.md` (sections 6-7)
- **Central KG Schema:** `nebula-kg/CONNECTION_GUIDE.md`
- **Error Logging Requirements:** `ERROR_LOGGING_REQUIREMENTS.md`

---

## 🎯 Next Steps

Once this Star System is complete:

1. ✅ Mark Star System 0.3 as complete in `.nebula/config.json`
2. ✅ Proceed to **Star Gate 0** validation
3. ✅ Star Gate will verify:
   - At least 1 error logged to KG
   - `test_connection()` passes
   - `.nebula/config.json` properly configured

---

**Version:** 3.0.0  
**Last Updated:** November 9, 2025  
**Maintainer:** Nebula Protocol Team

