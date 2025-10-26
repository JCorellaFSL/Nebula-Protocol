# Nebula Framework Usage Guide

Complete guide to using the Nebula Framework for AI-assisted software development.

---

## 🎯 Two Usage Modes

The Nebula Framework supports two complementary modes:

### 1. Cloud MCP (Documentation Access) ☁️
- **Use GitMCP** to read framework documentation from anywhere
- **4 tools** for searching and fetching docs
- **No installation** in your project
- **Perfect for:** Quick reference, learning the framework

### 2. Project-Local Tools (Full Features) 💻
- **Install tools** in your project's `.nebula/` directory
- **27 tools** including project memory and knowledge graph
- **Stays out of builds** - automatically excluded
- **Perfect for:** Active development, error tracking, pattern learning

**Best Practice:** Use both! Cloud MCP for docs, local tools for development.

---

## 🚀 Getting Started

### Step 1: Set Up Cloud MCP (5 minutes)

```bash
# Open Cursor: Settings → Tools & MCP → Add Custom MCP
# Add this configuration:
{
  "mcpServers": {
    "nebula-framework": {
      "url": "https://gitmcp.io/_/JCorellaFSL/Nebula-Protocol"
    }
  }
}

# Save and restart Cursor
# You now have access to framework documentation!
```

### Step 2: Initialize Your Project (5 minutes)

```bash
# Clone and install Nebula Framework (one-time)
git clone https://github.com/JCorellaFSL/Nebula-Protocol.git
cd Nebula-Protocol
npm install
npm link

# Navigate to your project
cd /path/to/your-project

# Initialize Nebula
init-nebula rust my-awesome-app
# Supported: flutter, tauri, python, rust, dioxus, generic

# That's it! Your project now has:
# ✅ .nebula/ directory with tools
# ✅ Project memory database
# ✅ ROADMAP.md with phase structure
# ✅ Framework documentation in docs/
# ✅ Logging infrastructure ready
```

---

## 📁 What Gets Created

```
your-project/
├── .nebula/                          # Development tools (stays out of builds)
│   ├── tools/
│   │   ├── project-memory.js        # Project memory system
│   │   ├── package.json             # Tool dependencies
│   │   └── node_modules/            # Dependencies (gitignored)
│   ├── logs/
│   │   ├── dev.log                  # Development logs
│   │   └── errors.log               # Error logs (JSON)
│   ├── project_memory.sqlite        # Knowledge database
│   └── README.md                    # Tool documentation
├── docs/
│   ├── Nebula_Protocol.md           # Core framework
│   └── RUST_NEBULA_ADAPTATION.md    # Your framework adaptation
├── ROADMAP.md                        # Main project roadmap
├── .gitignore                        # Updated with .nebula/ rules
└── [Your project files]
```

**Important:** `.nebula/` is automatically excluded from:
- Git (logs and databases only - tools are tracked)
- Production builds (framework-specific config)
- Distribution packages

---

## 🔧 Using Project Memory

### Automatic Error Logging

Errors are automatically logged when you integrate logging in your code:

**Rust:**
```rust
use tracing::{error, info};

fn main() {
    // Initialize logging (Phase 0 requirement)
    tracing_subscriber::fmt()
        .with_target(false)
        .with_file(true)
        .with_line_number(true)
        .init();
    
    // Errors are automatically logged
    if let Err(e) = do_something() {
        error!("Failed to do something: {}", e);
        // This automatically goes to .nebula/logs/errors.log
    }
}
```

**Python:**
```python
import logging
import json
from datetime import datetime

# Configure logging (Phase 0 requirement)
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('.nebula/logs/dev.log'),
        logging.StreamHandler()
    ]
)

# Errors automatically logged
try:
    do_something()
except Exception as e:
    logging.error(f"Failed: {e}", exc_info=True)
    # Also write to errors.log for project memory
```

### Querying Project Memory

```javascript
// In your project root
import { ProjectMemory } from './.nebula/tools/project-memory.js';

const pm = new ProjectMemory(process.cwd(), 'my-project', 'rust');

// Get recurring error patterns
const patterns = pm.getErrorPatterns();
console.log('Recurring issues:', patterns);

// Find similar past errors
const similar = pm.findSimilarErrors('connection timeout');
console.log('Similar errors:', similar);

// Record a solution
pm.recordSolution(errorId, 'Increased timeout to 30s', 'config.timeout = 30', 'ai', 5);

// Get project statistics
const stats = pm.getStatistics();
console.log('Project health:', stats);
```

### Via AI Assistant (MCP)

With local MCP server configured, you can ask your AI:

```
"Check project memory for similar timeout errors"
"What patterns do we have in our error logs?"
"Record this solution in project memory with effectiveness 4/5"
```

---

## 📋 Development Workflow

### Daily Workflow with Nebula

#### Morning: Review and Plan

```bash
# Review current phase
cat ROADMAP.md

# Check constellation for today's tasks
cat ROADMAP_PHASE_1_CORE.md

# Check project memory for context
cd .nebula/tools
node -e "import('./project-memory.js').then(m => {
  const pm = new m.ProjectMemory('../..', 'my-project', 'rust');
  console.log(pm.getStatistics());
})"
```

#### During Development

1. **Implement Feature** (with AI assistance)
   ```
   AI Prompt: "Implement [feature] from ROADMAP_PHASE_1_CORE.md 
   following the acceptance criteria. Include logging."
   ```

2. **Test Immediately**
   ```bash
   cargo test  # or npm test, flutter test, etc.
   ```

3. **Check Logs**
   ```bash
   tail -f .nebula/logs/dev.log
   tail -f .nebula/logs/errors.log
   ```

4. **Update Constellation**
   - Mark task complete
   - Document test results
   - Note any decisions made

#### End of Day

```bash
# Save context snapshot
cd .nebula/tools
node -e "import('./project-memory.js').then(m => {
  const pm = new m.ProjectMemory('../..', 'my-project', 'rust');
  pm.saveContextSnapshot('End of day - completed tasks X, Y, Z');
})"

# Commit progress
git add .
git commit -m "feat: Completed Phase 1 tasks X, Y, Z"
```

---

## 🎯 Quality Gates

After completing each constellation:

### 1. Run Quality Gate Review

```
AI Prompt: "Review ROADMAP_PHASE_1_CORE.md completion.
Check against Phase 0 for conflicts. 
Review .nebula/logs/errors.log for patterns.
Recommend: PROCEED, CREATE SUB-PHASE, or ROLLBACK"
```

### 2. Record Decision

```javascript
const pm = new ProjectMemory(process.cwd(), 'my-project', 'rust');
pm.recordQualityGate(
  '1',
  'PROCEED', 
  'All tests passing, no conflicts with Phase 0',
  'Phase 1 complete, moving to Phase 1.5'
);
```

### 3. Update Version

```javascript
pm.recordVersionBump('0.2.0', 'Phase 1 complete');
```

---

## 🔄 Mandatory UI Phases

### Phase 1.5: Basic UI (MANDATORY)

After Phase 1 (core backend), you MUST complete Phase 1.5:

```
AI Prompt: "Create basic UI for all Phase 1 features.
Reference ROADMAP_PHASE_1.5_BASIC_UI.md.
UI must be functional and testable by a human.
Include forms, navigation, and data display."
```

**Test:** Can you use the app? Can you test every feature manually?

### Phase 3.5: UI Polish (MANDATORY)

After Phase 3 (integration), you MUST complete Phase 3.5:

```
AI Prompt: "Polish UI for professional appearance.
Reference ROADMAP_PHASE_3.5_UI_POLISH.md.
Add animations, accessibility, responsive design.
Make it production-ready."
```

**Test:** Would you be comfortable showing this to users?

---

## 🧠 Learning from Project Memory

### Pattern Recognition

```javascript
const pm = new ProjectMemory(process.cwd(), 'my-project', 'rust');

// Get recurring errors
const patterns = pm.getErrorPatterns();

patterns.forEach(pattern => {
  console.log(`Error: ${pattern.error_code}`);
  console.log(`Occurred: ${pattern.occurrence_count} times`);
  console.log(`Last seen: ${pattern.last_occurrence}`);
  
  if (pattern.suggested_solution) {
    console.log(`Suggested fix: ${pattern.suggested_solution}`);
  }
});
```

### Decision History

```javascript
// Record architectural decisions
pm.recordDecision(
  'Phase 1',
  'Core',
  'database',
  'Using SQLite for local storage',
  'Lightweight, no server needed, perfect for desktop app',
  'human'
);

// Later, review decisions
const decisions = pm.db.prepare(`
  SELECT * FROM decisions 
  WHERE category = 'database'
  ORDER BY created_at DESC
`).all();
```

---

## 🚫 Keeping .nebula Out of Builds

The initialization script configures exclusions automatically:

### Rust/Dioxus (Cargo.toml)
```toml
[package]
exclude = [".nebula/"]
```

### Python (MANIFEST.in)
```
prune .nebula
```

### Flutter/Tauri
Uses `.gitignore` for build exclusions (automatically configured)

### Git (.gitignore)
```gitignore
# Automatically added by init-nebula
.nebula/logs/
.nebula/project_memory.sqlite*
.nebula/tools/node_modules/
```

**What gets committed:**
- ✅ `.nebula/tools/project-memory.js` (the code)
- ✅ `.nebula/tools/package.json` (dependencies list)
- ✅ `.nebula/README.md` (documentation)

**What's excluded:**
- ❌ Logs (`.nebula/logs/`)
- ❌ Databases (`.nebula/*.sqlite`)
- ❌ Dependencies (`.nebula/tools/node_modules/`)

---

## 🔍 Troubleshooting

### "Module not found" when using project memory

```bash
cd .nebula/tools
npm install
```

### "Cannot find project_memory.sqlite"

```javascript
// Initialize it first
import { ProjectMemory } from './.nebula/tools/project-memory.js';
new ProjectMemory(process.cwd(), 'my-project', 'rust');
```

### "Permission denied" on init-nebula

```bash
chmod +x init-nebula-project.js
# OR
node init-nebula-project.js rust my-project
```

### Logs not appearing

Check logging configuration in your code:
- Rust: `tracing` or `env_logger` configured?
- Python: `logging.basicConfig()` called?
- Flutter: `logger` package initialized?

---

## 📊 Success Metrics

Track these in project memory:

### Completion Rate
```javascript
const stats = pm.getStatistics();
console.log(`Errors resolved: ${stats.resolved_errors} / ${stats.total_errors}`);
```

### Pattern Reduction
```javascript
const patterns = pm.getErrorPatterns();
const recurring = patterns.filter(p => p.occurrence_count > 3);
console.log(`Recurring issues to address: ${recurring.length}`);
```

### Solution Effectiveness
```javascript
const solutions = pm.db.prepare(`
  SELECT AVG(effectiveness) as avg_effectiveness
  FROM error_solutions
  WHERE applied_by = 'ai'
`).get();
console.log(`AI solution effectiveness: ${solutions.avg_effectiveness}/5`);
```

---

## 🎓 Best Practices

### 1. Initialize Logging First (Phase 0)
Always set up logging infrastructure before any development.

### 2. Test Every Feature Immediately
Use Phase 1.5 (Basic UI) to make everything testable.

### 3. Run Quality Gates
Don't skip the review after each constellation.

### 4. Record Decisions
Use project memory to document why you chose approach X over Y.

### 5. Query Patterns Regularly
Check for recurring errors weekly and address root causes.

### 6. Backup Project Memory
```bash
cp .nebula/project_memory.sqlite backups/project_memory_$(date +%Y%m%d).sqlite
```

### 7. Use Both MCP Modes
- Cloud MCP: For reading docs and quick reference
- Local tools: For active development and memory

---

## 🌟 Example: Full Project Setup

```bash
# 1. Set up cloud MCP for documentation (one-time)
# (Configure in Cursor settings)

# 2. Install Nebula Framework (one-time)
git clone https://github.com/JCorellaFSL/Nebula-Protocol.git
cd Nebula-Protocol
npm install && npm link

# 3. Create your project
cd ~/projects
cargo new todo-app-rust
cd todo-app-rust

# 4. Initialize Nebula
init-nebula rust todo-app

# 5. Start Phase 0
# Review ROADMAP.md
# Follow ROADMAP_PHASE_0_SETUP.md

# 6. Integrate logging
# (Add tracing to Cargo.toml and configure in main.rs)

# 7. Start development with AI
# "Implement Phase 1 core features from ROADMAP_PHASE_1_CORE.md"

# 8. Test immediately
cargo test

# 9. Check logs
tail -f .nebula/logs/errors.log

# 10. Complete quality gate
# Review, decide PROCEED/SUB-PHASE/ROLLBACK

# 11. Continue through mandatory UI phases
# Phase 1.5 (Basic UI) - REQUIRED
# Phase 3.5 (UI Polish) - REQUIRED

# 12. Ship!
cargo build --release
```

---

## 📚 Further Reading

- **[Nebula_Protocol.md](docs/Nebula_Protocol.md)** - Core framework specification
- **[RUST_NEBULA_ADAPTATION.md](docs/RUST_NEBULA_ADAPTATION.md)** - Rust-specific guide
- **[MCP_implementation.md](MCP_implementation.md)** - MCP server details
- **[TECHNICAL_REVIEW.md](TECHNICAL_REVIEW.md)** - Professional review of the protocol

---

**🚀 You're ready to build with the Nebula Framework!**

The combination of cloud documentation access and project-local tools gives you:
- Framework guidance always available
- Project-specific learning and memory
- Automatic error tracking and pattern recognition
- Clean builds (no dev tools in production)

Start with `init-nebula [type] [name]` and let the framework guide your AI-assisted development journey.

