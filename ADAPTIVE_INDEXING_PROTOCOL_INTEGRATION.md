# Nebula Adaptive Indexing Protocol - Specification & Reference Implementation

**Date:** November 25, 2025  
**Status:** Protocol Specification + Reference Implementation (panic-ide)  
**Purpose:** Protocol-level file analysis for App Development, Debugging, Optimization, and Migration

---

## 🎯 Executive Summary

The Adaptive Indexing Protocol is a **core component of the Nebula Protocol** that provides intent-aware code analysis across all four primary use cases:

1. **App Development** - Real-time code intelligence, symbol search, go-to-definition
2. **Debugging** - Deep pattern analysis, security scanning, control flow tracking
3. **Optimization** - Performance hotspot detection, complexity metrics, bottleneck identification
4. **Migration** - Dependency mapping, API usage analysis, breaking change detection

### Critical Distinction

**Nebula Protocol** = Framework/methodology/tooling specification (tool-agnostic)  
**panic-ide** = Reference implementation showing the protocol in action (one possible tool)

This document defines:
- **Part 1:** The protocol specification (what any tool must implement)
- **Part 2:** The reference implementation (how panic-ide demonstrated it)
- **Part 3:** Adoption guide (how other tools can implement it)

---

## 📖 Understanding the Relationship

```
┌─────────────────────────────────────────────────────┐
│         NEBULA PROTOCOL (Core Framework)            │
│                                                     │
│  ├─ Methodology: Constellations, Star Systems      │
│  ├─ Knowledge Graph: Patterns, solutions, code     │
│  ├─ Adaptive Indexing: Intent-aware analysis       │
│  └─ APIs/Libraries: Language-agnostic tooling      │
└─────────────────────────────────────────────────────┘
                        ↓ implements
        ┌───────────────┴───────────────┐
        ↓                               ↓
┌──────────────────┐          ┌──────────────────┐
│    panic-ide     │          │  Other Tools     │
│  (Reference)     │          │                  │
│                  │          │  - VS Code ext   │
│  Tauri desktop   │          │  - IntelliJ      │
│  Monaco editor   │          │  - CLI tools     │
│  Shows HOW       │          │  - Web services  │
└──────────────────┘          └──────────────────┘
```

### What You Can Build with Nebula Protocol:

- **IDEs** (like panic-ide, or extensions for existing IDEs)
- **CLI Tools** (command-line analysis, reporting)
- **Web Services** (API for code analysis)
- **CI/CD Integrations** (pre-commit checks, quality gates)
- **Migration Tools** (framework upgrade assistants)
- **Security Scanners** (vulnerability detection)
- **Documentation Generators** (auto-docs from code)

**All of these share the same:**
- Knowledge Graph schema
- Adaptive indexing methodology
- Intent-based analysis approach
- Error pattern recognition

---

# PART 1: PROTOCOL SPECIFICATION

This section defines what the Nebula Protocol requires. Any tool implementing this protocol must follow these specifications.

---

## 🧬 Protocol Architecture

### Core Philosophy: Intent-Driven Analysis

The Nebula Protocol defines a **single adaptive system** that scales across all use cases:

```
Nebula Protocol Entry Point
    ↓
IndexDecisionEngine
    ↓
Analyze: Size + Intent + Resources
    ↓
Strategy Selection (5 strategies)
    ↓
Feature Configuration (Intent-specific)
    ↓
Execution (with KG storage)
    ↓
Query Layer (for LLMs/IDEs)
```

### Why This Matters

Instead of building separate systems for:
- Code completion (IDE mode)
- Bug detection (debugging mode)
- Performance analysis (optimization mode)
- Framework migration (migration mode)

The protocol uses **ONE intelligent indexing system** that adapts based on **user intent**.

---

## 📋 Required Components

Any tool implementing the Nebula Adaptive Indexing Protocol must provide these components:

### 1. **Adaptive Indexer**

**Required Classes/Interfaces:**

```python
class IndexingStrategy(Enum):
    QUICK_SCAN = "quick"        # < 100 files, metadata only
    STANDARD = "standard"       # 100-1K files, full symbols
    DEEP_ANALYSIS = "deep"      # Any size, advanced analysis
    INCREMENTAL = "incremental" # 1K-10K, hash-based changes
    TARGETED = "targeted"       # 10K+, on-demand loading

class IndexIntent(Enum):
    IDE_REALTIME = "ide_realtime"   # Creating apps
    BUG_HUNTING = "bug_hunting"     # Debugging
    OPTIMIZATION = "optimization"    # Optimizing
    MIGRATION = "migration"          # Migrating
    ARCHITECTURE = "architecture"    # Understanding structure
    DOCUMENTATION = "documentation"  # Generating docs
```

**Decision Logic:**

```python
class IndexDecisionEngine:
    def decide_strategy(self, path, intent) -> (IndexPlan, CodebaseStats):
        # Step 1: Quick scan (< 1s for 1,000 files)
        stats = QuickScanner().scan(path)
        
        # Step 2: Size-based base strategy
        base = self._strategy_from_size(stats.source_files)
        
        # Step 3: Intent-based adjustments
        strategy, features = self._apply_intent(base, intent, stats)
        
        # Step 4: Resource constraints
        strategy = self._check_resources(strategy, stats)
        
        # Step 5: Build execution plan
        return IndexPlan(
            strategy=strategy,
            features=features,  # Intent-specific
            estimated_time=...,
            estimated_memory=...,
            parallelism=...,
            priority_paths=...
        ), stats
```

### 2. **Index Executor**

**Required Functionality:**

Must execute plans with parallelization support:

```python
class IndexExecutor:
    def execute(self, plan, stats, path) -> IndexResult:
        # Get files to index
        files = self._get_files_to_index(path, plan)
        
        # Route to appropriate indexer
        if plan.strategy == STANDARD:
            indexer = StandardIndexer(progress_callback)
            results = indexer.index(files, plan)
        elif plan.strategy == INCREMENTAL:
            indexer = IncrementalIndexer(kg, progress_callback)
            results = indexer.index(files, plan)
        # ... other strategies
        
        # Store in Knowledge Graph
        self._store_results(results)
        
        return IndexResult(
            files_indexed=...,
            symbols_extracted=...,
            dependencies_mapped=...,
            time_seconds=...
        )
```

**Key Features:**
- Parallel processing (configurable workers)
- SHA256 hash tracking for incremental updates
- Progress reporting to frontend
- Graceful error handling
- KG integration for persistence

### 3. **Parser Engine**

**Required Functionality:**

Must support AST-based parsing (Tree-sitter recommended but not mandatory):

```python
class CodeParser:
    def parse_file(self, filepath) -> Dict:
        # Language detection
        language = self._get_language_from_extension(filepath)
        
        # Tree-sitter parsing
        tree = self.parsers[language].parse(code_bytes)
        
        # Extract structure
        return {
            "filepath": str(filepath),
            "language": language,
            "structure": {
                "classes": [...],
                "functions": [...],
                "imports": [...]
            },
            "metrics": {
                "total_lines": ...,
                "file_size_bytes": ...
            }
        }
```

**Minimum Language Support:** Protocol implementations should support at least 3 major languages. Recommended: Python, JavaScript/TypeScript, and one compiled language (Rust/Go/Java).

### 4. **Semantic Engine** (Optional but Recommended)

**Purpose:** Vector embeddings for semantic code search

```python
class SemanticEngine:
    def index_codebase(self, root_path) -> Dict:
        # Walk codebase
        # Generate embeddings via Gemini API
        # Store in semantic_index.json
        
    def search(self, query, limit=3) -> List[Dict]:
        # Embed query
        # Cosine similarity search
        # Return top matches
```

**Use Case:** Semantic queries like "Find all authentication functions" (meaning-based, not keyword-based)

**Note:** Implementations can use any embedding API (OpenAI, Google, local models, etc.)

### 5. **Static Analyzer**

**Required Functionality:**

Rule-based analysis system:

```python
class Analyzer:
    def scan_file(self, filepath) -> List[Issue]:
        # Parse file
        # Run rules (TODO detection, complexity, etc.)
        # Return issues
        
    def scan_path(self, path) -> Dict:
        # Scan directory recursively
        # Aggregate results
```

**Extensibility Requirement:** Implementations must support adding custom rules/analyzers.

---

## 📊 Knowledge Graph Schema (Required)

### Official Nebula Protocol KG Schema v2.0

The protocol defines these **required tables** for code indexing. Implementations can add additional tables but must support these core tables:

```sql
-- ============================================================================
-- CODE INDEX TABLES (Adaptive Indexing Protocol)
-- ============================================================================

-- Files with hash tracking for incremental updates
CREATE TABLE indexed_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT UNIQUE NOT NULL,
    hash TEXT NOT NULL,               -- SHA256 for change detection
    language TEXT,
    size_bytes INTEGER,
    indexed_at TIMESTAMP,
    index_strategy TEXT,               -- quick, standard, deep, etc.
    parse_time_ms REAL
);

-- Code symbols (functions, classes, methods, variables)
CREATE TABLE symbols (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,                -- function, class, method, etc.
    line_start INTEGER,
    line_end INTEGER,
    signature TEXT,
    docstring TEXT,
    parent TEXT,                       -- For methods: parent class
    FOREIGN KEY (file_id) REFERENCES indexed_files(id)
);

-- Import dependencies between files
CREATE TABLE dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_file_id INTEGER NOT NULL,
    to_module TEXT NOT NULL,
    import_type TEXT,
    line INTEGER,
    FOREIGN KEY (from_file_id) REFERENCES indexed_files(id)
);

-- File-level code metrics
CREATE TABLE file_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER UNIQUE NOT NULL,
    lines_of_code INTEGER,
    lines_of_comments INTEGER,
    complexity INTEGER,
    maintainability_index REAL,
    functions_count INTEGER,
    classes_count INTEGER,
    FOREIGN KEY (file_id) REFERENCES indexed_files(id)
);

-- Deep analysis results (security, performance, patterns)
CREATE TABLE analysis_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    analyzer_type TEXT,                -- security, performance, migration
    finding_type TEXT,                 -- vulnerability, hotspot, deprecation
    severity TEXT,
    line INTEGER,
    message TEXT,
    details TEXT,                      -- JSON with additional info
    created_at TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES indexed_files(id)
);
```

### Schema Compatibility

**Storage Engine Flexibility:**
- Reference implementation uses SQLite (local) + PostgreSQL (central)
- Protocol allows any SQL database (MySQL, MariaDB, etc.)
- NoSQL implementations possible with schema mapping

**Key Requirements:**

1. **Code indexing tables** - Must store parsed symbols, dependencies, metrics
2. **Incremental tracking** - Must support hash-based change detection
3. **Analysis results** - Must store findings from deep analyzers
4. **Migration support** - Must support analyzer_type field with values: `security`, `performance`, `migration`, `architecture`

### Integration with Base Nebula KG

These code indexing tables **extend** the base Nebula KG schema:

```
Existing Nebula KG:
├── events (errors, solutions, milestones)
├── patterns (error patterns)
├── local_pattern_technologies
└── sync_history

NEW: Code Index Extension:
├── indexed_files
├── symbols
├── dependencies
├── file_metrics
└── analysis_results
```

**Unified Query Capability:** 

Implementations must enable querying across:
- **Error patterns** (from development history)
- **Code structure** (from indexing system)

Example query: "Show me all authentication functions that had errors in the past 30 days"

```sql
-- This type of query must be possible in any implementation
SELECT f.path, s.name, COUNT(p.id) as error_count
FROM indexed_files f
JOIN symbols s ON f.id = s.file_id
JOIN local_patterns p ON p.context_json LIKE '%' || f.path || '%'
WHERE s.name LIKE '%auth%'
  AND p.last_seen_at > datetime('now', '-30 days')
GROUP BY f.path, s.name
```

---

## 🎨 Four Use Cases (Protocol Requirements)

### 1. **App Development Mode** (Creating)

**Intent:** `IDE_REALTIME`

**Features Enabled:**
```python
{
    "incremental": True,
    "background": True,
    "debounce_ms": 500,
    "lazy_load": True,
    "symbol_search": True,
    "go_to_definition": True,
    "find_references": False  # Too expensive for real-time
}
```

**Strategy:** INCREMENTAL (for 1K-10K files) or STANDARD (< 1K files)

**What It Provides:**
- Real-time symbol search as you type
- Instant go-to-definition
- Auto-complete based on indexed symbols
- Background re-indexing of changed files only
- < 500ms latency for queries

**Protocol-Required API:**

Implementations must expose these operations (exact command syntax may vary per tool):

```
# Indexing operation
index(path, intent=IDE_REALTIME) -> IndexResult

# Query operations
get_symbols(filepath) -> List[Symbol]
search_semantic(query) -> List[Match]
get_indexed_files() -> List[FileInfo]
```

### 2. **Debugging Mode** (Bug Hunting)

**Intent:** `BUG_HUNTING`

**Features Enabled:**
```python
{
    "deep_parse": True,
    "control_flow": True,
    "data_flow": True,
    "security_patterns": True,
    "static_analysis_rules": True,
    "null_checks": True,
    "exception_paths": True
}
```

**Strategy:** DEEP_ANALYSIS (forces deep even for small codebases)

**What It Provides:**
- Security vulnerability detection
- Null pointer analysis
- Exception path tracking
- Control flow analysis
- Pattern-based bug detection
- Integration with error patterns from KG

**Protocol-Required API:**

```
# Deep analysis
index(path, intent=BUG_HUNTING) -> IndexResult

# Query findings
get_analysis_results(analyzer_type="security") -> List[Finding]
get_vulnerabilities(severity="high") -> List[Issue]
```

**Integration with Error Patterns:**
```sql
-- Find files with both security issues AND historical errors
SELECT 
    f.path,
    COUNT(DISTINCT a.id) as security_issues,
    COUNT(DISTINCT p.id) as historical_errors
FROM indexed_files f
LEFT JOIN analysis_results a ON f.id = a.file_id 
    AND a.analyzer_type = 'security'
LEFT JOIN local_patterns p ON p.context_json LIKE '%' || f.path || '%'
GROUP BY f.path
HAVING security_issues > 0 OR historical_errors > 0
```

### 3. **Optimization Mode** (Performance)

**Intent:** `OPTIMIZATION`

**Features Enabled:**
```python
{
    "complexity_metrics": True,
    "performance_hotspots": True,
    "algorithm_analysis": True,
    "database_queries": True,
    "network_calls": True,
    "bottleneck_detection": True
}
```

**Strategy:** QUICK (basic) or DEEP (if codebase < 5K files)

**What It Provides:**
- Cyclomatic complexity per function
- Algorithmic complexity estimation (O(n²) detection)
- Database query identification
- Network call tracking
- Performance hotspot ranking

**Example Output:**
```
🔥 Performance Hotspots Detected:

1. calculate_all_permutations() - Line 234
   Complexity: O(n!) - CRITICAL
   
2. nested_loop_processor() - Line 456
   Complexity: O(n³) - HIGH
   
3. unoptimized_db_query() - Line 789
   N+1 Query Pattern Detected
```

### 4. **Migration Mode** (Framework Upgrades)

**Intent:** `MIGRATION`

**Features Enabled:**
```python
{
    "dependency_graph": True,
    "api_usage_mapping": True,
    "deprecation_scan": True,
    "breaking_changes": True,
    "version_compatibility": True,
    "automated_refactor": True,
    "migration_templates": True
}
```

**Strategy:** DEEP_ANALYSIS (for codebases < 5K files)

**What It Provides:**
- Complete dependency graph visualization
- API usage inventory (e.g., all React lifecycle methods)
- Deprecated API detection
- Breaking change impact analysis
- Automated refactoring suggestions
- Migration effort estimation

**Protocol-Required Migration Analysis Example: React 16 → React 18**

Any compliant tool must be able to:

**Analysis Results:**
```
📊 Migration Analysis: React 16 → 18

🔍 Deprecated APIs Found:
  - componentWillMount: 12 occurrences
  - componentWillReceiveProps: 8 occurrences
  - componentWillUpdate: 5 occurrences

📦 Dependencies to Update:
  - react: 16.14.0 → 18.2.0
  - react-dom: 16.14.0 → 18.2.0
  - @testing-library/react: ^11.0.0 → ^13.0.0

⚠️ Breaking Changes Detected:
  1. Automatic batching (may affect setState timing)
  2. Strict Mode double-invocation
  3. Suspense tree behavior changes

🛠️ Suggested Refactorings:
  - Replace componentWillMount with useEffect
  - Update lifecycle methods to static getDerivedStateFromProps
  - Wrap ReactDOM.render with createRoot

⏱️ Estimated Migration Effort: 8-12 hours
```

**Required KG Storage:**

```sql
-- All implementations must store migration findings in this format
INSERT INTO analysis_results (
    file_id,
    analyzer_type,      -- Must be 'migration'
    finding_type,       -- 'deprecation', 'breaking_change', etc.
    severity,           -- 'low', 'medium', 'high', 'critical'
    line,
    message,
    details             -- JSON with tool-specific data
)
```

---

# PART 2: REFERENCE IMPLEMENTATION (panic-ide)

This section documents how panic-ide implemented the protocol as a proof-of-concept.

---

## 🔧 panic-ide Implementation Details

**Repository:** `Labs/panic-ide`  
**Purpose:** Desktop IDE demonstrating Nebula Protocol  
**Tech Stack:** Tauri (Rust) + React + TypeScript + Monaco Editor

### Implementation Files

```
panic-ide/
├── local_kg/
│   ├── analysis/
│   │   ├── adaptive_indexer.py      # Protocol implementation
│   │   ├── index_executor.py        # Execution engine
│   │   ├── parser_engine.py         # Tree-sitter parsing
│   │   ├── semantic_engine.py       # Gemini embeddings
│   │   └── analyzer.py              # Static analysis
│   ├── local_kg.py                  # KG + Chat interface
│   └── schema.sql                   # SQLite schema
└── src/                             # IDE UI (not protocol)
    ├── components/
    ├── services/
    └── App.tsx
```

### What panic-ide Demonstrates

✅ **Protocol Compliance:**
- All required components implemented
- Full KG schema support
- All 4 use cases working
- Intent-based analysis functional

✅ **Additional Features (IDE-specific):**
- Monaco code editor
- Terminal emulator (xterm.js)
- Graph visualization
- LSP integration
- AI-powered refactoring UI

**Key Point:** Other tools don't need these IDE features to be protocol-compliant.

---

## 🔄 Complete Workflow Example (panic-ide Implementation)

### Example: Migration Flow in panic-ide

**Note:** This shows ONE way to implement the protocol. Your tool can implement differently.

```
1. User Opens Project in panic-ide (Tauri desktop app)
   ↓
2. User types in chat: "I need to migrate from Django 2.2 to Django 4.0"
   ↓
3. Chat interface → Python backend: adaptive index . migration
   ↓
4. IndexDecisionEngine:
   - Quick scan: 347 Python files
   - Framework detected: Django 2.2
   - Strategy: DEEP_ANALYSIS
   - Features: dependency_graph, api_usage, deprecation_scan
   ↓
5. IndexExecutor:
   - Parse all Python files (parallel)
   - Extract symbols, imports, API calls
   - Run deprecation scanner
   - Build dependency graph
   - Store in KG
   ↓
6. Analysis Results:
   - 23 deprecated APIs found
   - 8 breaking changes detected
   - 156 files affected
   - Estimated effort: 24-32 hours
   ↓
7. LLM (via Chat Interface):
   - Queries indexed_files + analysis_results
   - Generates migration plan
   - Creates Nebula Constellation with phases
   ↓
8. User Approves Migration Plan
   ↓
9. IDE + Protocol:
   - Execute migration phases systematically
   - Apply automated refactorings
   - Run tests after each phase
   - Update KG with solutions
   ↓
10. Migration Complete
    - All findings addressed
    - Tests passing
    - Knowledge stored for future migrations
```

### panic-ide Chat Commands

These are specific to panic-ide's implementation:

```bash
# Indexing
adaptive index <path> <intent>
quick scan <path>
execute index plan

# Querying
show indexed files
show symbols in <file>
search <query>

# Analysis
analyze <file>
scan <path>
explain <file>

# Refactoring (IDE-specific)
refactor <file> <instruction>
undo <file>
```

**Other implementations may use:**
- Different command syntax
- GUI buttons/menus instead of chat
- REST API calls
- CLI flags
- IDE extension commands

---

# PART 3: ADOPTION GUIDE

This section explains how to implement the protocol in your own tool.

---

## 🌐 Protocol Benefits for Tool Builders

### 1. **Shared Knowledge Graph**

All tools implementing the protocol can sync to the same Central KG:

```
Developer uses VS Code with Nebula extension
    ↓
Encounters error, solution stored in Central KG
    ↓
Other developer uses CLI tool
    ↓
Queries Central KG, finds existing solution
    ↓
Cross-tool knowledge sharing!
```

### 2. **Implementation Libraries**

The protocol will provide official libraries:

```python
# Python
from nebula_protocol import AdaptiveIndexer, IndexIntent

indexer = AdaptiveIndexer()
result = indexer.analyze("/path/to/code", intent=IndexIntent.MIGRATION)
```

```javascript
// Node.js
const { AdaptiveIndexer, IndexIntent } = require('nebula-protocol');

const indexer = new AdaptiveIndexer();
const result = await indexer.analyze('./code', IndexIntent.BUG_HUNTING);
```

```rust
// Rust
use nebula_protocol::{AdaptiveIndexer, IndexIntent};

let indexer = AdaptiveIndexer::new();
let result = indexer.analyze("./code", IndexIntent::Optimization)?;
```

### 3. **Tool Implementation Examples**

**VS Code Extension:**
- Uses protocol library for analysis
- Displays results in VS Code UI
- Syncs to Central KG

**CLI Tool:**
```bash
$ nebula analyze ./project --intent=migration --output=json
{
  "deprecated_apis": 23,
  "breaking_changes": 8,
  "estimated_hours": 24
}
```

**CI/CD Integration:**
```yaml
# .github/workflows/nebula-check.yml
- name: Nebula Quality Gate
  uses: nebula-protocol/ci-action@v1
  with:
    intent: bug_hunting
    fail-on: critical
```

**Web Service:**
```python
# Flask API using protocol
from flask import Flask, request
from nebula_protocol import AdaptiveIndexer

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    indexer = AdaptiveIndexer()
    result = indexer.analyze(data['path'], data['intent'])
    return result.to_json()
```

---

## 🛠️ Implementation Checklist

To build a Nebula Protocol-compliant tool:

### Minimum Requirements (MVP)

- [ ] **Adaptive Indexer**
  - [ ] Quick scan (file enumeration)
  - [ ] Strategy selection based on size
  - [ ] Support at least 2 intents (IDE + one other)
  
- [ ] **Index Executor**
  - [ ] Standard indexing strategy
  - [ ] Symbol extraction (functions, classes)
  - [ ] Dependency tracking (imports)
  
- [ ] **Parser Engine**
  - [ ] AST parsing for at least 1 language
  - [ ] Symbol extraction
  - [ ] Import/dependency detection
  
- [ ] **Knowledge Graph**
  - [ ] Implement core schema tables
  - [ ] Local storage (SQLite recommended)
  - [ ] Basic sync to Central KG
  
- [ ] **Query Interface**
  - [ ] Get indexed files
  - [ ] Get symbols by file
  - [ ] Get dependencies

### Recommended Features

- [ ] Incremental indexing strategy
- [ ] Semantic search (embeddings)
- [ ] Static analysis rules
- [ ] Support 3+ languages
- [ ] Support 4+ intents
- [ ] Background indexing
- [ ] Progress reporting

### Advanced Features

- [ ] Deep analysis strategies
- [ ] Security pattern detection
- [ ] Performance hotspot analysis
- [ ] Migration-specific analyzers
- [ ] Parallel processing
- [ ] Real-time updates
- [ ] Custom rule system

---

## 📚 Getting Started

### Option 1: Use panic-ide as Starting Point

```bash
# Clone reference implementation
git clone https://github.com/your-org/panic-ide
cd panic-ide/local_kg

# Extract protocol components
# The analysis/ directory contains protocol implementation
# Can be adapted for your tool
```

### Option 2: Use Protocol Libraries (Coming Soon)

```bash
# Python
pip install nebula-protocol

# Node.js
npm install nebula-protocol

# Rust
cargo add nebula-protocol
```

### Option 3: Implement from Spec

1. Read this specification document
2. Implement required components
3. Follow KG schema
4. Test against Central KG
5. Submit for protocol compliance verification

---

## 🔗 Protocol API Specification

### Core Methods (All implementations must provide)

```typescript
interface NebulaProtocol {
  // Indexing
  analyze(path: string, intent: IndexIntent, options?: Options): Promise<IndexResult>
  quickScan(path: string): Promise<CodebaseStats>
  
  // Querying
  getIndexedFiles(filters?: FileFilters): Promise<FileInfo[]>
  getSymbols(filepath: string): Promise<Symbol[]>
  getDependencies(filepath: string): Promise<Dependency[]>
  getMetrics(filepath: string): Promise<FileMetrics>
  searchSemantic(query: string, limit?: number): Promise<SearchResult[]>
  
  // Analysis Results
  getAnalysisResults(filters?: AnalysisFilters): Promise<Finding[]>
  getVulnerabilities(severity?: Severity): Promise<Issue[]>
  getDeprecations(framework?: string): Promise<Deprecation[]>
  
  // Knowledge Graph
  syncToGemini(options?: SyncOptions): Promise<SyncResult>
  queryKG(sql: string): Promise<QueryResult>
}
```

### Data Types (Protocol Standard)

```typescript
enum IndexIntent {
  IDE_REALTIME = "ide_realtime",
  BUG_HUNTING = "bug_hunting",
  OPTIMIZATION = "optimization",
  MIGRATION = "migration",
  ARCHITECTURE = "architecture",
  DOCUMENTATION = "documentation"
}

enum IndexingStrategy {
  QUICK_SCAN = "quick",
  STANDARD = "standard",
  DEEP_ANALYSIS = "deep",
  INCREMENTAL = "incremental",
  TARGETED = "targeted"
}

interface IndexResult {
  files_indexed: number
  files_skipped: number
  files_failed: number
  symbols_extracted: number
  dependencies_mapped: number
  issues_found: number
  time_seconds: number
  strategy_used: IndexingStrategy
  errors: string[]
}

interface Symbol {
  name: string
  type: "function" | "class" | "method" | "variable" | "constant"
  line_start: number
  line_end: number
  signature?: string
  docstring?: string
  parent?: string
}

interface Finding {
  file_path: string
  analyzer_type: "security" | "performance" | "migration" | "architecture"
  finding_type: string
  severity: "low" | "medium" | "high" | "critical"
  line: number
  message: string
  details: Record<string, any>
}
```

---

## 🧪 Protocol Compliance Testing

### Test Suite (Coming Soon)

```bash
# Run compliance tests
nebula-protocol test ./your-implementation

# Tests include:
# - Schema validation
# - API method coverage
# - Intent handling
# - Strategy selection
# - KG sync capability
# - Query correctness
```

### Certification

Tools that pass compliance testing can display:

```
┌──────────────────────────────────┐
│  ✓ Nebula Protocol Compliant     │
│    Version 2.0                   │
│    Certified: 2025-11-25         │
└──────────────────────────────────┘
```

---

## 🤝 Contributing to the Protocol

### How to Extend the Protocol

1. **Propose Extension:** Open RFC (Request for Comments)
2. **Reference Implementation:** Show it working in at least one tool
3. **Community Review:** 30-day review period
4. **Adoption:** If accepted, becomes part of official spec

### Example Extensions Being Considered

- Real-time collaboration features
- AI pair programming integration
- Visual debugging protocol
- Performance profiling standard
- Test coverage tracking

---

## 📊 Protocol Comparison

### vs. Language Server Protocol (LSP)

| Feature | LSP | Nebula Protocol |
|---------|-----|-----------------|
| **Scope** | Editor ↔ Language Server | Full dev lifecycle |
| **Features** | Autocomplete, diagnostics | Analysis, debugging, migration |
| **Knowledge** | Per-session | Persistent KG across projects |
| **Intent** | Single (editing) | Six intents |
| **Strategy** | Fixed | Adaptive |

**Relationship:** Nebula Protocol can **use** LSP for editor features while providing broader capabilities.

### vs. Static Analysis Tools (ESLint, Pylint, etc.)

| Feature | Static Analyzers | Nebula Protocol |
|---------|------------------|-----------------|
| **Scope** | Single language | Multi-language |
| **Adaptation** | Fixed rules | Intent-based |
| **Knowledge** | Rules only | Historical patterns + rules |
| **Migration** | Not supported | First-class feature |
| **Cross-project** | No | Yes (Central KG) |

**Relationship:** Nebula Protocol can **integrate** existing analyzers as rule sources.

---

## 🌟 Protocol Vision

### The Goal

**Every developer using Nebula Protocol-compliant tools automatically:**

1. **Shares Knowledge** - Errors/solutions sync to Central KG
2. **Benefits from Others** - Finds solutions discovered elsewhere  
3. **Works Systematically** - Follows Constellation methodology
4. **Uses Best Tool** - Choose IDE/CLI/web based on preference
5. **Never Repeats Work** - Historical context always available

### Unified Knowledge Graph

```
Central KG (PostgreSQL)
    ↑ sync
Local KG (SQLite per project)
    ├── Error patterns (development history)
    ├── Solutions that worked
    └── Code index (structure, metrics, findings)
```

**Value:** LLMs can correlate:
- "This file has high complexity" (indexing)
- "This file had 5 errors last week" (error patterns)
- "Others solved similar issues with X" (solutions)

### 3. **Intent-First Design**

Instead of "run linter, run security scanner, run performance analyzer" separately:

```python
# One command, adaptive behavior
adaptive index . <intent>
```

The protocol intelligently:
- Selects appropriate strategy
- Enables relevant features
- Optimizes for resources
- Stores relevant findings

---

## 🎯 How Indexing Integrates with Constellations

Any tool can integrate indexing into the Constellation workflow:

```
CONSTELLATION_0_SETUP (Any IDE/tool)
  └─ STAR_SYSTEM_0.3_KG_INTEGRATION
      ↓
      Run: adaptive index . ide
      Purpose: Index project structure for LLM context
      Result: Stored in KG, available to all phases

CONSTELLATION_2_IMPLEMENTATION
  └─ STAR_SYSTEM_2.1_CORE_LOGIC
      ↓
      During development:
      - Incremental indexing runs in background
      - Symbol search available to developer
      - Go-to-definition works
      - LLM has full context

CONSTELLATION_3_TESTING
  └─ STAR_GATE_3_QUALITY
      ↓
      Run: adaptive index . bug_hunting
      Purpose: Deep analysis before approving phase
      Result: Security issues, bugs, code smells detected

CONSTELLATION_4_OPTIMIZATION
  └─ STAR_SYSTEM_4.1_PERFORMANCE
      ↓
      Run: adaptive index . optimization
      Purpose: Find bottlenecks, complexity issues
      Result: Hotspots identified, refactoring suggestions

CONSTELLATION_5_MIGRATION (if needed)
  └─ STAR_SYSTEM_5.1_ASSESSMENT
      ↓
      Run: adaptive index . migration
      Purpose: Analyze upgrade impact
      Result: Breaking changes, deprecations, effort estimate
```

---

## 🔮 Protocol Roadmap

### Phase 2: Deep Analyzers (Planned)

```python
class MigrationAnalyzer:
    def analyze(self, index: FileIndex, framework_target: str):
        # Analyze API usage patterns
        # Detect breaking changes
        # Generate migration templates
        # Estimate effort

class SecurityPatternAnalyzer:
    def analyze(self, index: FileIndex):
        # SQL injection detection
        # XSS vulnerability scanning
        # Authentication/authorization issues
        # Sensitive data exposure

class PerformanceHotspotAnalyzer:
    def analyze(self, index: FileIndex):
        # Algorithmic complexity
        # Database query optimization
        # Memory leak detection
        # CPU profiling integration

class ArchitectureAnalyzer:
    def analyze(self, index: FileIndex):
        # Circular dependencies
        # Layering violations
        # Module cohesion metrics
        # Suggested refactorings
```

### Phase 3: Official Protocol Service (Planned)

**Nebula Protocol Hub** - Centralized service for:

```python
# Tools can call official API instead of self-hosting
POST https://api.nebula-protocol.dev/v1/analyze
{
    "repo": "github.com/user/project",
    "intent": "migration",
    "webhook": "https://your-tool.com/callback"
}

# Or self-host the official server
docker run -p 8080:8080 nebula-protocol/api-server

# Or use libraries locally
from nebula_protocol import AdaptiveIndexer
# No external service needed
```

**Benefits:**
- Tools don't need to implement indexing themselves
- Consistent results across all tools
- Automatic updates to analysis capabilities
- Optional: self-hosted or cloud-hosted

---

## 🎉 Summary

### The Protocol vs. The Implementation

| Aspect | Nebula Protocol | panic-ide |
|--------|-----------------|-----------|
| **What it is** | Specification & libraries | Desktop IDE application |
| **Scope** | Tool-agnostic framework | One specific tool |
| **Can I use it?** | Yes, build your own tool | Yes, download and use |
| **Extensible?** | Define how tools work together | IDE features and UI |
| **Examples** | This spec, libraries | Reference implementation |

### Key Takeaways

1. **Nebula Protocol** = Framework for systematic development
   - Defines Constellation methodology
   - Provides adaptive indexing specification
   - Enables shared Knowledge Graph
   - Tool-agnostic, implementation-flexible

2. **panic-ide** = One implementation of the protocol
   - Shows it CAN be done
   - Demonstrates full protocol compliance
   - Provides working code reference
   - NOT what the protocol will become

3. **You can build:**
   - VS Code extensions using the protocol
   - CLI tools using the protocol
   - Web services using the protocol
   - CI/CD integrations using the protocol
   - Custom IDEs using the protocol

### The Core Innovation

**One adaptive system, four modes:**

- **Creating** (IDE_REALTIME) → Real-time code intelligence
- **Debugging** (BUG_HUNTING) → Deep pattern analysis  
- **Optimizing** (OPTIMIZATION) → Performance hotspots
- **Migrating** (MIGRATION) → Framework upgrades

All sharing the same:
- Adaptive strategy selection
- Knowledge Graph storage
- Intent-based configuration
- Protocol-standard APIs

**This is what the Nebula Protocol provides. How you implement it is up to you.**

---

## 📞 Next Steps

### For Protocol Users
- Choose or build a Nebula-compliant tool
- Start using Constellations for systematic development
- Benefit from shared knowledge across tools

### For Tool Builders
- Review this specification
- Implement required components
- Use reference implementation as guide
- Submit for protocol compliance certification
- Join the Nebula Protocol ecosystem

### For Contributors
- Propose protocol extensions
- Improve reference implementations
- Build language-specific libraries
- Create tutorials and guides

---

**Status:** ✅ Protocol Specification Complete  
**Reference Implementation:** panic-ide (fully functional)  
**Official Libraries:** Coming Q1 2025  
**Ecosystem:** Open for adoption

**The protocol is ready. The tools are waiting to be built.**


