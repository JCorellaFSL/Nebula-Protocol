# Local KG for Nebula Protocol

Captures error patterns during project template generation and syncs to Central KG.

## Quick Start

### 1. Install Python Dependencies

```bash
pip install -r local_kg/requirements.txt
```

### 2. Initialize Database

```bash
python local_kg/setup.py
```

This creates `local_kg/nebula_protocol_local.db` with:
- 6 real error patterns from Protocol development
- Solutions that worked

### 3. Use in Protocol Code

#### Capture Template Generation Errors

```javascript
// In nebula-init-python.py or init-nebula-project.js
import { LocalKG } from './local_kg_bridge.js';

const kg = new LocalKG('local_kg/nebula_protocol_local.db');

try {
  // Generate project from template
  await generateProject(template, config);
} catch (error) {
  // Capture error to local KG
  const patternId = await kg.captureError({
    error_signature: error.message,
    error_category: error.name,
    language: template.language,
    description: `Template generation failed: ${template.name}`,
    technologies: [template.language, template.framework],
    severity: 'high'
  });
  
  throw error;
}
```

#### Query Known Issues Before Generation

```javascript
// Before starting project creation
const similarErrors = await kg.searchPatterns(
  template.name, 
  5 // limit
);

if (similarErrors.length > 0) {
  console.log(`⚠️  Known issues with ${template.name}:`);
  for (const pattern of similarErrors) {
    console.log(`  - ${pattern.error_signature}`);
    console.log(`    Solutions: ${pattern.solution_count}`);
  }
}
```

#### Sync to Central KG (Background)

```javascript
// After project creation succeeds
import { syncToCentral } from './local_kg/sync.js';

// Non-blocking sync
syncToCentral({
  central_api_url: process.env.CENTRAL_KG_URL || 'http://localhost:8080',
  instance_id: projectId
}).catch(err => {
  // Log but don't fail project creation
  console.error('Central KG sync failed:', err.message);
});
```

## Integration Points

### 1. **Template Generator** (`nebula-init-python.py`)
- Capture template instantiation errors
- Track which variables cause issues
- Record fix steps that worked

### 2. **Constellation Analyzer** (`constellation-analyzer.js`)
- Track performance issues (OOM, timeouts)
- Capture parsing errors
- Record optimization solutions

### 3. **Project Memory** (`project-memory.js`)
- Capture storage/retrieval errors
- Track corruption issues
- Document recovery procedures

## Real Errors Documented

The seed data contains 6 actual errors:

1. **Missing package.json**: Template doesn't generate required files
2. **Git not in PATH**: Windows can't find Git during init
3. **Template variable undefined**: Variable substitution fails
4. **Out of memory**: Analyzer runs out of heap processing many projects
5. **File permissions**: Generated scripts not executable on Linux
6. **Central KG timeout**: Sync blocks project creation

## Python Bridge for Node.js

Since Protocol is Node.js, use Python subprocess:

```javascript
// local_kg_bridge.js
import { spawn } from 'child_process';

export class LocalKG {
  constructor(dbPath) {
    this.dbPath = dbPath;
  }
  
  async captureError(error) {
    return new Promise((resolve, reject) => {
      const proc = spawn('python', [
        '-c',
        `
from local_kg.local_kg import LocalKG
kg = LocalKG('${this.dbPath}')
pattern_id = kg.capture_error(
  error_signature='${error.error_signature}',
  error_category='${error.error_category}',
  language='${error.language}',
  description='${error.description}',
  severity='${error.severity}'
)
print(pattern_id)
        `
      ]);
      
      let output = '';
      proc.stdout.on('data', data => output += data);
      proc.on('close', code => {
        if (code === 0) resolve(output.trim());
        else reject(new Error('Failed to capture error'));
      });
    });
  }
}
```

## Automatic Sync

Add to `package.json`:

```json
{
  "scripts": {
    "kg:sync": "python -m local_kg.sync http://localhost:8080 nebula-protocol",
    "kg:setup": "python local_kg/setup.py",
    "kg:stats": "python -c \"from local_kg.local_kg import get_local_kg; print(get_local_kg().get_pattern_summary())\""
  }
}
```

## Testing

```bash
# View patterns
npm run kg:stats

# Sync to Central KG (requires Central KG running)
npm run kg:sync

# Query database directly
sqlite3 local_kg/nebula_protocol_local.db "SELECT * FROM v_pattern_solutions"
```

## Next Steps

1. ✅ Initialize local KG: `python local_kg/setup.py`
2. ⏳ Add error capture to template generators
3. ⏳ Integrate with constellation analyzer
4. ⏳ Add background sync to project creation flow
5. ⏳ Create UI to show known issues before project creation

