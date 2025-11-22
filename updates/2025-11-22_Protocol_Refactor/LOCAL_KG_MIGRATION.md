# Local KG Migration to Python

**Date:** November 11, 2025  
**Status:** ✅ Complete

## What Changed

The Nebula Protocol now uses a **unified Python-based Local Knowledge Graph** instead of the previous JavaScript implementation.

### Before (JavaScript)

- `src/kg/central-kg-sync.js` - JavaScript sync client
- Direct PostgreSQL connection required
- Tightly coupled to Protocol's architecture
- No offline-first capability

### After (Python)

- `local_kg/` directory with unified implementation
- SQLite for offline-first pattern storage
- Syncs to Central KG in background
- Shared codebase with IDE and Central KG

## Migration Benefits

1. **Unified Architecture**: Same local KG implementation across all projects
   - Nebula-KG (reference implementation)
   - Nebula Protocol (this project)
   - Nebula IDE

2. **Offline First**: Patterns stored locally in SQLite
   - Works without Central KG connection
   - Sync happens in background
   - No blocking on project creation

3. **Better Error Patterns**: Deterministic pattern IDs via hashing
   - Automatic deduplication
   - Version-independent matching

4. **Rich Metadata**: Full context preservation
   - Stack traces
   - File paths
   - Technology tags
   - Severity levels

## File Locations

### New Files

```
local_kg/
├── schema.sql              # SQLite schema
├── local_kg.py             # Core LocalKG class  
├── sync.py                 # Central KG sync
├── setup.py                # DB initialization
├── seed_data.sql           # Real Protocol errors
├── requirements.txt        # Python dependencies
├── README.md               # Usage guide
└── nebula_protocol_local.db  # SQLite database
```

### Deprecated Files

- `src/kg/central-kg-sync.js` - **DEPRECATED** (see note in file)

## Usage

### Capture Error in Protocol

```javascript
// Option 1: Python subprocess (recommended)
const { spawn } = require('child_process');

function captureError(error, template) {
  const proc = spawn('python', ['-m', 'local_kg.local_kg', 'capture',
    '--signature', error.message,
    '--category', error.name,
    '--language', template.language,
    '--severity', 'high'
  ]);
  // Non-blocking, fire-and-forget
}

// Option 2: Direct Python import (if using Python template generator)
from local_kg.local_kg import get_local_kg

kg = get_local_kg('local_kg/nebula_protocol_local.db')
pattern_id = kg.capture_error(
    error_signature=str(error),
    error_category='TemplateError',
    language='node',
    technologies=['node', 'npm'],
    severity='high'
)
```

### Sync to Central KG

```bash
# Manual sync
npm run kg:sync

# Or directly
python -m local_kg.sync http://localhost:8080 nebula-protocol
```

### Query Patterns

```bash
# Get summary
npm run kg:stats

# Search for specific error
python -c "
from local_kg.local_kg import get_local_kg
kg = get_local_kg('local_kg/nebula_protocol_local.db')
patterns = kg.search_patterns('package.json', 5)
for p in patterns:
    print(f'{p[\"error_signature\"]}: {p[\"solution_count\"]} solutions')
"
```

## Seed Data (Real Errors)

The local KG is pre-populated with 6 actual errors from Protocol development:

1. **Missing package.json** - Template generation incomplete
2. **Git not in PATH** - Windows can't find Git
3. **Template variable undefined** - Substitution failure
4. **Out of memory** - Constellation analyzer heap exhausted
5. **File permissions** - Scripts not executable on Linux
6. **Central KG timeout** - Sync blocking project creation

Each has working solutions documented.

## Integration Points

### 1. Project Creation
- Capture template generation errors
- Query known issues before generation
- Suggest solutions if template has known problems

### 2. Constellation Analyzer
- Track performance issues
- Capture parsing errors
- Document optimizations

### 3. Background Sync
- Sync every 5-10 minutes
- Non-blocking, graceful failures
- Exponential backoff on errors

## npm Scripts

Added to `package.json`:

```json
{
  "scripts": {
    "kg:setup": "python local_kg/setup.py",
    "kg:sync": "python -m local_kg.sync http://localhost:8080 nebula-protocol",
    "kg:stats": "python -c \"from local_kg.local_kg import get_local_kg; print(get_local_kg('local_kg/nebula_protocol_local.db').get_pattern_summary())\""
  }
}
```

## Testing

```bash
# 1. Initialize (if not already done)
npm run kg:setup

# 2. Check patterns loaded
npm run kg:stats
# Should show: 6 patterns, 6 solutions

# 3. Sync to Central KG (requires Central KG running)
npm run kg:sync
# Should show: Synced X patterns, Y solutions

# 4. Verify sync
curl http://localhost:8080/api/v1/info
# Should show increased pattern count
```

## Rollback Plan

If Python implementation causes issues:

1. JavaScript sync still works (`src/kg/central-kg-sync.js`)
2. Can run both in parallel (local KG + direct sync)
3. Local KG is non-blocking - failures don't break Protocol

## Next Steps

1. ✅ Local KG initialized with seed data
2. ⏳ Update template generators to capture errors
3. ⏳ Add background sync service
4. ⏳ Integrate with constellation analyzer
5. ⏳ Add UI to show known template issues
6. ⏳ Deprecate `central-kg-sync.js` once stable

## Questions?

See:
- `local_kg/README.md` - Detailed usage guide
- `../Nebula-KG/LOCAL_KG_INTEGRATION.md` - Architecture overview
- `../Nebula-KG/local_kg/README.md` - Reference implementation

