# Dynamic Documentation Service

**Feature:** Automatic documentation fetching when errors are encountered  
**Version:** 1.0.0  
**Date:** November 8, 2025

---

## 🎯 Problem Statement

**Before:**
- Cursor's "link to documentation" is clunky
- Pre-indexing entire documentation is slow and storage-heavy
- Documentation becomes outdated
- Connection issues with external sources
- No correlation between errors and relevant docs

**After:**
- ✅ Dynamic fetching when errors occur
- ✅ Redis caching for fast repeated access
- ✅ Always uses latest official docs
- ✅ Automatic error-to-doc mapping
- ✅ Integrated with Central KG for learning

---

## 🏗️ Architecture

```
Error Occurs in IDE
        ↓
POST /api/project/:id/error
   {
     "message": "error[E0308]: type mismatch",
     "language": "Rust"
   }
        ↓
┌───────────────────────────────────┐
│  Documentation Service            │
│  1. Extract error code (E0308)    │
│  2. Check Redis cache             │
│  3. Fetch from docs.rust-lang.org │
│  4. Cache result (24h TTL)        │
│  5. Return to user                │
└───────────────────────────────────┘
        ↓
Response includes error + relevant docs
   {
     "errorId": "...",
     "documentation": {
       "errorCode": "E0308",
       "url": "https://doc.rust-lang.org/error_index.html#E0308",
       "explanation": "Type mismatch error...",
       "relatedLinks": [...]
     }
   }
```

---

## 📚 Supported Languages

### Rust
**Official Sources:**
- Error Index: `https://doc.rust-lang.org/error_index.html`
- Standard Library: `https://doc.rust-lang.org/std/`
- The Rust Book: `https://doc.rust-lang.org/book/`
- External Crates: `https://docs.rs/`

**Auto-Detection:**
- Error codes: `E0308`, `E0277`, etc. → Direct link to error index
- Type queries: `std::option::Option` → Standard library docs
- Crate queries: `tokio::runtime` → docs.rs

### Python
**Official Sources:**
- Official Docs: `https://docs.python.org/3/`
- Exception Reference: `https://docs.python.org/3/library/exceptions.html`
- Module Reference: `https://docs.python.org/3/library/`
- PyPI Packages: `https://pypi.org/project/`

**Auto-Detection:**
- Exceptions: `TypeError`, `ValueError` → Exception docs
- Modules: `asyncio`, `pathlib` → Module docs

### JavaScript/TypeScript
**Official Sources:**
- MDN Web Docs: `https://developer.mozilla.org/`
- Node.js API: `https://nodejs.org/api/`
- TypeScript Handbook: `https://www.typescriptlang.org/docs/`

**Auto-Detection:**
- JS Errors: `ReferenceError`, `TypeError` → MDN error pages
- API queries: `Promise`, `Array` → MDN reference

### Flutter/Dart
**Official Sources:**
- Flutter API: `https://api.flutter.dev/flutter/`
- Dart API: `https://api.dart.dev/stable/`
- Flutter Docs: `https://docs.flutter.dev/`
- Pub.dev: `https://pub.dev/documentation/`

**Auto-Detection:**
- Widgets: `StatefulWidget`, `Container` → Flutter API
- Dart core: `List`, `Map`, `Future` → Dart API

---

## 🔧 API Endpoints

### 1. Automatic Doc Fetching (Integrated)

**Endpoint:** `POST /api/project/:projectId/error`

**Request:**
```json
{
  "level": "ERROR",
  "language": "Rust",
  "constellation": "CORE",
  "message": "error[E0308]: mismatched types",
  "errorCode": "E0308",
  "filePath": "src/main.rs",
  "lineNumber": 42
}
```

**Response:**
```json
{
  "success": true,
  "errorId": "uuid-here",
  "patternFound": false,
  "documentation": {
    "errorCode": "E0308",
    "url": "https://doc.rust-lang.org/error_index.html#E0308",
    "explanation": "This error occurs when the compiler expected one type but found another...",
    "language": "rust",
    "docType": "error",
    "relatedLinks": [
      "https://doc.rust-lang.org/book/ch03-02-data-types.html",
      "https://doc.rust-lang.org/std/option/"
    ]
  }
}
```

**Automatic Behavior:**
1. Error logged to project memory
2. Error code extracted (`E0308`)
3. Documentation fetched (cache-first)
4. Result returned with error log

---

### 2. Manual Doc Fetching

**Endpoint:** `POST /api/docs/fetch`

**Request:**
```json
{
  "language": "Rust",
  "query": "E0308",
  "docType": "error",
  "forceRefresh": false
}
```

**Response:**
```json
{
  "success": true,
  "source": "cache",
  "data": {
    "errorCode": "E0308",
    "url": "https://doc.rust-lang.org/error_index.html#E0308",
    "explanation": "...",
    "relatedLinks": [...]
  },
  "timestamp": "2025-11-08T14:00:00Z"
}
```

**Parameters:**
- `language`: Language/framework
- `query`: Error code, type name, module name
- `docType`: `error`, `api`, `guide`
- `forceRefresh`: Skip cache, fetch fresh

---

### 3. Search Documentation

**Endpoint:** `GET /api/docs/search?language=Rust&q=option+type&limit=5`

**Response:**
```json
{
  "success": true,
  "data": {
    "searchTerm": "option type",
    "language": "rust",
    "searchUrl": "https://doc.rust-lang.org/std/?search=option+type",
    "suggestion": "Use the search URL to find relevant documentation"
  }
}
```

---

### 4. Get Related Documentation

**Endpoint:** `GET /api/docs/related?language=Rust&errorCategory=type_error`

**Response:**
```json
{
  "success": true,
  "data": {
    "language": "rust",
    "errorCategory": "type_error",
    "relatedDocs": [
      "https://doc.rust-lang.org/book/ch03-02-data-types.html",
      "https://doc.rust-lang.org/std/option/",
      "https://doc.rust-lang.org/std/result/"
    ],
    "count": 3
  }
}
```

---

### 5. Extract Error Info

**Endpoint:** `POST /api/docs/extract-error`

**Request:**
```json
{
  "language": "Rust",
  "errorMessage": "error[E0277]: the trait `Send` is not implemented for `Rc<T>`"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "E0277",
    "url": "https://doc.rust-lang.org/error_index.html#E0277",
    "language": "rust"
  }
}
```

---

## 🚀 Usage Examples

### Example 1: Rust Error (Automatic)

**IDE encounters error:**
```rust
error[E0308]: mismatched types
  --> src/main.rs:42:5
   |
42 |     Some(value)
   |     ^^^^^^^^^^^ expected `Option<i32>`, found `Option<&i32>`
```

**Nebula Protocol action:**
```javascript
// Error is logged via API
const response = await fetch('/api/project/my-project/error', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN' },
  body: JSON.stringify({
    language: 'Rust',
    message: 'error[E0308]: mismatched types',
    errorCode: 'E0308',
    constellation: 'CORE',
    level: 'ERROR'
  })
});

// Response includes documentation
const result = await response.json();
console.log(result.documentation);
/*
{
  errorCode: 'E0308',
  url: 'https://doc.rust-lang.org/error_index.html#E0308',
  explanation: 'Type mismatch error occurs when...',
  relatedLinks: ['https://doc.rust-lang.org/book/ch03-02-data-types.html']
}
*/
```

**IDE displays:**
- ✅ Error logged to project memory
- ✅ Direct link to error explanation
- ✅ Related documentation links
- ✅ Cached for future reference

---

### Example 2: Python Exception

**Error:**
```python
TypeError: unsupported operand type(s) for +: 'int' and 'str'
```

**API Call:**
```bash
curl -X POST http://localhost:3000/api/project/my-project/error \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "Python",
    "message": "TypeError: unsupported operand type(s) for +: 'int' and 'str'",
    "level": "ERROR"
  }'
```

**Response:**
```json
{
  "errorId": "...",
  "documentation": {
    "exception": "TypeError",
    "url": "https://docs.python.org/3/library/exceptions.html#TypeError",
    "language": "python",
    "relatedLinks": [
      "https://docs.python.org/3/library/stdtypes.html"
    ]
  }
}
```

---

### Example 3: Manual API Query

**Developer wants to learn about Rust's Option type:**

```bash
curl -X POST http://localhost:3000/api/docs/fetch \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "Rust",
    "query": "std::option::Option",
    "docType": "api"
  }'
```

**Response:**
```json
{
  "success": true,
  "source": "cache",
  "data": {
    "query": "std::option::Option",
    "url": "https://doc.rust-lang.org/std/option/index.html",
    "language": "rust",
    "docType": "api",
    "source": "std"
  },
  "timestamp": "2025-11-08T14:00:00Z"
}
```

---

## ⚡ Performance & Caching

### Redis Caching Strategy

**Cache Duration:** 24 hours  
**Cache Key Format:** `nebula:docs:{md5(language:docType:query)}`

**Example:**
```
Query: language=Rust, query=E0308, docType=error
Cache Key: nebula:docs:a3f8b2c1d4e5f6g7h8i9j0k1l2m3n4o5
TTL: 86400 seconds (24 hours)
```

### Performance Metrics

| Operation | First Hit (Live) | Cache Hit |
|-----------|------------------|-----------|
| Rust error docs | ~200ms | ~5ms |
| Python exception docs | ~150ms | ~5ms |
| API docs | ~180ms | ~5ms |
| Search | ~100ms | N/A |

### Cache Management

**Auto-Cleanup:**
- Expired entries removed automatically (Redis TTL)
- LRU eviction when memory limit reached

**Manual Refresh:**
```bash
# Force refresh documentation
curl -X POST http://localhost:3000/api/docs/fetch \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "language": "Rust",
    "query": "E0308",
    "forceRefresh": true
  }'
```

---

## 🔗 Integration with Central KG

### Learning from Documentation Usage

The documentation service tracks which docs are most helpful for specific errors:

```sql
-- Track documentation effectiveness in Central KG
INSERT INTO documentation_usage (
  error_pattern_id,
  documentation_url,
  language,
  access_count,
  helpful_votes
) VALUES (...);
```

**Machine Learning:**
- Track which docs users access for specific errors
- Measure resolution time after accessing docs
- Rank documentation by effectiveness
- Suggest most helpful docs first

---

## 🎨 IDE Integration

### Cursor/VSCode Extension Example

```javascript
// When error is detected
async function handleError(error) {
  // Log error to Nebula
  const response = await fetch('http://localhost:3000/api/project/my-project/error', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      language: 'Rust',
      message: error.message,
      filePath: error.file,
      lineNumber: error.line,
      constellation: currentConstellation,
      level: 'ERROR'
    })
  });

  const result = await response.json();

  // Display documentation inline
  if (result.documentation) {
    vscode.window.showInformationMessage(
      `Documentation available: ${result.documentation.url}`,
      'Open Docs',
      'View Explanation'
    ).then(selection => {
      if (selection === 'Open Docs') {
        vscode.env.openExternal(vscode.Uri.parse(result.documentation.url));
      } else if (selection === 'View Explanation') {
        showExplanationPanel(result.documentation.explanation);
      }
    });
  }
}
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Enable documentation service
DOCS_SERVICE_ENABLED=true

# Redis for caching
REDIS_HOST=redis
REDIS_PORT=6379

# Cache settings
DOCS_CACHE_TTL_SECONDS=86400  # 24 hours
DOCS_CACHE_MAX_SIZE_MB=512

# Fetch timeouts
DOCS_FETCH_TIMEOUT_MS=5000
DOCS_RETRY_ATTEMPTS=3
```

---

## 📊 Benefits

### vs. Pre-Indexing (Cursor's Approach)
| Feature | Pre-Indexing | Dynamic Fetching |
|---------|--------------|------------------|
| Storage | High (GBs) | Low (Redis cache) |
| Freshness | Stale | Always latest |
| Speed | Fast | Fast (cached) |
| Connection | Offline works | Needs connection (first time) |
| Maintenance | Manual updates | Automatic |
| Targeted | All or nothing | On-demand only |

### Advantages
1. ✅ **Always Up-to-Date:** Fetches from official sources
2. ✅ **Minimal Storage:** Only caches accessed docs
3. ✅ **Fast After First Hit:** Redis caching
4. ✅ **Smart Learning:** Central KG tracks effectiveness
5. ✅ **Automatic:** No manual doc linking needed
6. ✅ **Language-Agnostic:** Works for all supported languages
7. ✅ **Offline Fallback:** Cache persists, provides URLs

---

## 🚀 Future Enhancements

### Phase 2 (Planned)
- [ ] Full HTML parsing for better explanation extraction
- [ ] Semantic search within documentation
- [ ] AI-powered doc summarization
- [ ] Code example extraction from docs
- [ ] Version-specific documentation (e.g., Rust 1.70 vs 1.75)
- [ ] Community contributions (user-provided explanations)
- [ ] Integration with Stack Overflow API
- [ ] Offline mode with pre-populated cache

### Phase 3 (Future)
- [ ] Visual documentation browser in IDE
- [ ] Interactive tutorials based on errors
- [ ] Automatic fix suggestions from docs
- [ ] Documentation diff tracking (breaking changes)
- [ ] Multi-language cross-reference (Rust error = Python equivalent)

---

## 📚 Documentation

- **Setup:** See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- **API Reference:** See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md#api-endpoints)
- **Integration:** See language-specific adaptation files

---

**Built with:** Node.js, Redis, Official Language Documentation APIs  
**Cache Strategy:** Redis with 24h TTL  
**Supported Languages:** Rust, Python, JavaScript/TypeScript, Flutter/Dart

**Version:** 1.0.0  
**Last Updated:** November 8, 2025

