# Local KG Language Bridges

Multi-language bridge system for calling the Python Local KG from any supported language.

## Architecture

```
Project Code (Any Language)
        ↓
Language-Specific Bridge
        ↓
Python Subprocess
        ↓
local_kg.py (SQLite)
```

## Supported Languages

| Language | Bridge File | Status |
|----------|-------------|--------|
| JavaScript/Node.js | `bridge_javascript.js` | ✅ Production |
| TypeScript | `bridge_typescript.ts` | ✅ Production |
| Rust | `bridge_rust.rs` | ✅ Production |
| Python | `bridge_python.py` | ✅ Production |
| Java | `bridge_java.java` | ✅ Production |
| C#/.NET | `bridge_csharp.cs` | ✅ Production |
| Go | `bridge_go.go` | ✅ Production |
| PHP | `bridge_php.php` | ✅ Production |
| Swift | `bridge_swift.swift` | ✅ Production |
| Kotlin | `bridge_kotlin.kt` | ✅ Production |
| Dart/Flutter | `bridge_dart.dart` | ✅ Production |
| C++ | `bridge_cpp.cpp` | 🟡 WIP |

## Auto-Detection

The bridge system automatically detects project language based on:

1. **File Detection**: Checks for language-specific files (e.g., `Cargo.toml`, `package.json`)
2. **Environment Variables**: `NEBULA_LANGUAGE` override
3. **Explicit Configuration**: `.nebula/config.json`

## Usage Per Language

### JavaScript/Node.js

```javascript
import { LocalKGBridge } from './local_kg/bridges/bridge_javascript.js';

const kg = new LocalKGBridge();

// Capture error (non-blocking)
await kg.captureError({
  signature: error.message,
  category: error.name,
  language: 'javascript',
  severity: 'high'
});

// Query patterns (blocking, fast ~60ms)
const patterns = await kg.searchPatterns('package.json', 5);
```

### TypeScript

```typescript
import { LocalKGBridge } from './local_kg/bridges/bridge_typescript';

const kg = new LocalKGBridge();

try {
  await buildProject();
} catch (error) {
  await kg.captureError({
    signature: (error as Error).message,
    category: (error as Error).name,
    language: 'typescript',
    severity: 'high'
  });
}
```

### Rust

```rust
mod local_kg_bridge;
use local_kg_bridge::LocalKGBridge;

fn main() -> Result<()> {
    let kg = LocalKGBridge::new();
    
    match compile_code() {
        Err(e) => {
            kg.capture_error(
                &e.to_string(),
                "CompileError",
                "rust",
                "high"
            ).await?;
        }
        Ok(_) => {}
    }
}
```

### Python

```python
# Direct import - no bridge needed!
from local_kg.local_kg import get_local_kg

kg = get_local_kg('local_kg/nebula_protocol_local.db')

try:
    build_project()
except Exception as e:
    kg.capture_error(
        error_signature=str(e),
        error_category=type(e).__name__,
        language='python',
        severity='high'
    )
```

### Java

```java
import com.nebula.kg.LocalKGBridge;

public class Main {
    public static void main(String[] args) {
        LocalKGBridge kg = new LocalKGBridge();
        
        try {
            buildProject();
        } catch (Exception e) {
            kg.captureError(
                e.getMessage(),
                e.getClass().getSimpleName(),
                "java",
                "high"
            );
        }
    }
}
```

### C#/.NET

```csharp
using Nebula.KG;

class Program {
    static async Task Main() {
        var kg = new LocalKGBridge();
        
        try {
            await BuildProject();
        } catch (Exception ex) {
            await kg.CaptureErrorAsync(
                ex.Message,
                ex.GetType().Name,
                "csharp",
                "high"
            );
        }
    }
}
```

### Go

```go
import "nebula-kg/bridges"

func main() {
    kg := bridges.NewLocalKGBridge()
    
    if err := buildProject(); err != nil {
        kg.CaptureError(
            err.Error(),
            "BuildError",
            "go",
            "high",
        )
    }
}
```

### PHP

```php
<?php
require_once 'local_kg/bridges/bridge_php.php';

$kg = new LocalKGBridge();

try {
    buildProject();
} catch (Exception $e) {
    $kg->captureError(
        $e->getMessage(),
        get_class($e),
        'php',
        'high'
    );
}
```

### Swift

```swift
import NebulaKG

let kg = LocalKGBridge()

do {
    try buildProject()
} catch {
    kg.captureError(
        signature: error.localizedDescription,
        category: String(describing: type(of: error)),
        language: "swift",
        severity: "high"
    )
}
```

### Kotlin

```kotlin
import com.nebula.kg.LocalKGBridge

fun main() {
    val kg = LocalKGBridge()
    
    try {
        buildProject()
    } catch (e: Exception) {
        kg.captureError(
            signature = e.message ?: "Unknown error",
            category = e.javaClass.simpleName,
            language = "kotlin",
            severity = "high"
        )
    }
}
```

### Dart/Flutter

```dart
import 'package:nebula_kg/local_kg_bridge.dart';

void main() async {
  final kg = LocalKGBridge();
  
  try {
    await buildProject();
  } catch (e) {
    await kg.captureError(
      signature: e.toString(),
      category: e.runtimeType.toString(),
      language: 'dart',
      severity: 'high',
    );
  }
}
```

## Performance

| Operation | Method | Typical Time |
|-----------|--------|-------------|
| Capture Error | Fire-and-forget subprocess | ~50ms (non-blocking) |
| Search Patterns | Subprocess + SQLite query | ~60ms |
| Central KG Sync | HTTP POST | ~50-500ms |

**Key Insight**: Even with subprocess overhead, local queries are 5-10x faster than network calls to Central KG!

## Configuration

### Auto-Detection (Recommended)

Place a `.nebula/config.json` in project root:

```json
{
  "language": "auto",
  "local_kg_db": "local_kg/project_local.db",
  "central_kg_url": "http://localhost:8080",
  "auto_sync": true,
  "sync_interval_minutes": 30
}
```

### Explicit Configuration

```json
{
  "language": "rust",
  "framework": "dioxus",
  "local_kg_db": "local_kg/my_dioxus_app_local.db",
  "central_kg_url": "https://kg.example.com",
  "auto_sync": false
}
```

### Environment Variables

```bash
# Override auto-detection
export NEBULA_LANGUAGE=typescript
export NEBULA_FRAMEWORK=react
export NEBULA_LOCAL_KG_DB=./local_kg/my_app_local.db
export NEBULA_CENTRAL_KG_URL=http://localhost:8080
```

## Integration Workflow

### 1. Project Initialization

When `init-nebula-project.js` runs:

```javascript
// Detect language from args
const language = detectLanguage(projectType);

// Create .nebula/config.json
createConfig({
  language: language,
  framework: projectType,
  local_kg_db: `local_kg/${projectName}_local.db`
});

// Copy appropriate bridge
copyBridge(language, `.nebula/tools/kg_bridge.${getExtension(language)}`);
```

### 2. Runtime Detection

Each bridge checks for config:

```javascript
// JavaScript bridge
function detectConfig() {
  // Priority 1: .nebula/config.json
  if (fs.existsSync('.nebula/config.json')) {
    return JSON.parse(fs.readFileSync('.nebula/config.json'));
  }
  
  // Priority 2: Environment variables
  if (process.env.NEBULA_LANGUAGE) {
    return {
      language: process.env.NEBULA_LANGUAGE,
      local_kg_db: process.env.NEBULA_LOCAL_KG_DB || 'local_kg/project_local.db'
    };
  }
  
  // Priority 3: File detection
  return autoDetectLanguage();
}
```

### 3. Bridge Activation

Only the needed bridge is loaded:

```javascript
// init-nebula-project.js

switch (detectedLanguage) {
  case 'javascript':
  case 'typescript':
    copyFile('bridges/bridge_javascript.js', '.nebula/tools/');
    break;
  case 'rust':
    copyFile('bridges/bridge_rust.rs', 'src/');
    break;
  case 'python':
    // No bridge needed - direct import
    console.log('Using Python direct import');
    break;
  // ... etc
}
```

## Benefits

1. **Single Source of Truth**: All KG logic in Python
2. **No Code Duplication**: Each language just spawns subprocess
3. **Fast Local Queries**: SQLite is faster than network calls
4. **Offline-First**: Works without Central KG connection
5. **Simple to Maintain**: Update Python once, all languages benefit
6. **Type-Safe**: Each bridge uses native language types
7. **Non-Blocking**: Error captures don't slow down main app

## Adding New Language Support

1. Create `bridge_LANGUAGE.ext` in `local_kg/bridges/`
2. Implement three methods:
   - `captureError(signature, category, language, severity)`
   - `searchPatterns(query, limit)`
   - `addSolution(pattern_id, solution_text)`
3. Use subprocess to call Python:
   ```
   python -c "from local_kg.local_kg import get_local_kg; kg = get_local_kg(); kg.capture_error(...)"
   ```
4. Update `init-nebula-project.js` to copy your bridge
5. Add usage example to this README

## Troubleshooting

### Bridge Not Found

**Error**: "Cannot import local_kg bridge"

**Solution**: Run `init-nebula-project.js` to initialize project:
```bash
node init-nebula-project.js rust my-app
```

### Python Not in PATH

**Error**: "python: command not found"

**Solution**: Install Python 3.11+ and add to PATH:
```bash
# Check Python
python --version  # or python3 --version

# Add to PATH if needed
export PATH="/path/to/python:$PATH"
```

### Database Locked

**Error**: "database is locked"

**Solution**: SQLite issue - ensure only one process writes at a time:
```python
# Use connection pooling
from local_kg.local_kg import get_local_kg
kg = get_local_kg()  # Singleton pattern
```

### Subprocess Timeout

**Error**: "Python subprocess timed out"

**Solution**: Increase timeout or make capture async:
```javascript
// Don't await capture
kg.captureError(...).catch(err => console.warn('KG capture failed'));
```

---

**Built by:** Nebula Protocol Team  
**License:** MIT  
**Version:** 1.0.0

