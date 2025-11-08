# Central KG Connection Guide

**For Nebula IDE Instances**  
**Version:** 0.1.0  
**Date:** November 8, 2025

---

## Overview

This guide explains how to connect your Nebula IDE instance to the Central Knowledge Graph for collaborative learning and pattern sharing.

**What the Central KG Does:**
- Aggregates error patterns and solutions from all IDE instances
- Anonymizes data to protect privacy
- Enables cross-project learning
- Provides pattern recommendations
- Tracks community knowledge growth

---

## Quick Start

### 1. Environment Configuration

Add to your IDE's `.env` file:

```bash
# Central KG Configuration
CENTRAL_KG_URL=http://localhost:8080          # Local development
# CENTRAL_KG_URL=https://kg.nebula-ide.com   # Production (when available)
CENTRAL_KG_API_KEY=your_api_key_here         # Optional, for authenticated access
```

### 2. Register Your IDE Instance

On first connection, register your IDE instance:

```rust
use central_kg_sync::CentralKGSync;

let sync_client = CentralKGSync::new(
    db_pool.clone(),
    std::env::var("CENTRAL_KG_URL").unwrap()
);

let instance_id = sync_client.register_instance(
    "nebula-ide-v0.1.0",     // Instance name
    "0.1.0"                   // IDE version
).await?;
```

This creates an entry in the Central KG's `instances` table.

### 3. Automatic Sync on Phase Completion

The IDE automatically syncs when a phase is completed. This is already implemented in:

```rust
// backend/src/routes/constellations.rs
async fn check_and_sync_phase_completion(
    state: &AppState,
    project_id: Uuid,
    phase: &str,
) -> Result<()> {
    // Checks if all tasks in phase are done
    // If yes → triggers Central KG sync
}
```

**No manual intervention needed** - it just works when users complete phases!

---

## API Endpoints

### Base URL

- **Local:** `http://localhost:8080`
- **Production:** `https://kg.nebula-ide.com` (when deployed)

### Authentication

Currently open (no auth required for local development).

**Future:** API key in header:
```
Authorization: Bearer YOUR_API_KEY
```

---

## Core Endpoints

### 1. Register IDE Instance

**POST** `/api/v1/instances`

Register a new IDE instance with the Central KG.

**Request Body:**
```json
{
  "instance_name": "nebula-ide-v0.1.0",
  "ide_version": "0.1.0",
  "instance_url": "http://localhost:3000",
  "capabilities": ["pattern_submission", "solution_query"]
}
```

**Response:**
```json
{
  "instance_id": "11111111-1111-1111-1111-111111111111",
  "api_key": "generated_key_here",
  "registered_at": "2025-11-08T14:00:00Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "instance_name": "my-ide-instance",
    "ide_version": "0.1.0"
  }'
```

---

### 2. Submit Error Pattern

**POST** `/api/v1/patterns`

Submit an error pattern encountered during development.

**Request Body:**
```json
{
  "error_signature": "rust_type_mismatch_option_t",
  "error_category": "type_error",
  "language": "Rust",
  "framework": "Axum",
  "description": "Type mismatch: expected Option<T>, found T",
  "tags": ["rust", "type_system", "option"],
  "anonymized": true
}
```

**Response:**
```json
{
  "pattern_id": "22222222-2222-2222-2222-222222222222",
  "occurrence_count": 15,
  "similar_patterns": [
    {
      "pattern_id": "33333333-3333-3333-3333-333333333333",
      "error_signature": "rust_lifetime_mismatch",
      "similarity_score": 0.75
    }
  ]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/v1/patterns \
  -H "Content-Type: application/json" \
  -d '{
    "error_signature": "sqlx_migration_conflict",
    "error_category": "migration_error",
    "language": "Rust",
    "description": "Migration file already exists with different checksum"
  }'
```

---

### 3. Submit Solution

**POST** `/api/v1/solutions`

Submit a solution that resolved an error pattern.

**Request Body:**
```json
{
  "pattern_signature": "rust_type_mismatch_option_t",
  "solution_title": "Use Option<T> for nullable fields",
  "solution_description": "Change struct field to Option<T> when SQL column is nullable",
  "code_snippet": "pub created_at: Option<chrono::DateTime<chrono::Utc>>",
  "success_rate": 0.95,
  "applies_to": ["Rust", "SQLx"],
  "verified": true
}
```

**Response:**
```json
{
  "solution_id": "44444444-4444-4444-4444-444444444444",
  "linked_patterns": 3,
  "confidence_score": 0.95,
  "alternative_solutions": []
}
```

---

### 4. Query Patterns by Technology

**GET** `/api/v1/patterns?language=Rust&framework=Axum&limit=10`

Find error patterns for a specific technology stack.

**Query Parameters:**
- `language` - Programming language (e.g., "Rust", "Python", "JavaScript")
- `framework` - Framework name (e.g., "Axum", "React", "Django")
- `category` - Error category (e.g., "type_error", "lifetime")
- `limit` - Max results (default: 20)

**Response:**
```json
{
  "patterns": [
    {
      "pattern_id": "...",
      "error_signature": "rust_type_mismatch_option_t",
      "description": "Type mismatch: expected Option<T>, found T",
      "occurrence_count": 25,
      "solution_count": 3,
      "last_seen": "2025-11-08T12:00:00Z"
    }
  ],
  "total": 147
}
```

---

### 5. Get Solutions for Pattern

**GET** `/api/v1/patterns/{pattern_id}/solutions`

Retrieve all solutions for a specific error pattern.

**Response:**
```json
{
  "pattern": {
    "error_signature": "rust_type_mismatch_option_t",
    "description": "Type mismatch: expected Option<T>, found T"
  },
  "solutions": [
    {
      "solution_id": "...",
      "title": "Use Option<T> for nullable fields",
      "description": "...",
      "code_snippet": "...",
      "success_rate": 0.95,
      "verified": true,
      "votes": 42
    }
  ]
}
```

---

### 6. Submit Feedback

**POST** `/api/v1/solutions/{solution_id}/feedback`

Report whether a solution worked for you.

**Request Body:**
```json
{
  "instance_id": "11111111-1111-1111-1111-111111111111",
  "was_helpful": true,
  "resolution_time_minutes": 5,
  "comment": "Worked perfectly, resolved immediately"
}
```

**Response:**
```json
{
  "feedback_id": "...",
  "solution_updated": true,
  "new_success_rate": 0.96
}
```

---

## Graph Navigation Endpoints

### 7. Find Similar Patterns

**GET** `/api/v1/graph/patterns/{pattern_id}/similar?limit=5`

Find patterns similar to the given one (cross-language, semantic similarity).

**Response:**
```json
{
  "pattern": {
    "error_signature": "rust_type_mismatch_option_t",
    "language": "Rust"
  },
  "similar_patterns": [
    {
      "pattern_id": "...",
      "error_signature": "python_nonetype_attribute",
      "language": "Python",
      "similarity_score": 0.82,
      "similarity_type": "semantic"
    },
    {
      "pattern_id": "...",
      "error_signature": "javascript_undefined_property",
      "language": "JavaScript",
      "similarity_score": 0.75,
      "similarity_type": "semantic"
    }
  ]
}
```

---

### 8. Get Related Technologies

**GET** `/api/v1/graph/technologies/{tech_slug}/related`

Find technologies related to a given one (alternatives, complementary, commonly used together).

**Response:**
```json
{
  "technology": {
    "slug": "axum",
    "name": "Axum",
    "category": "framework"
  },
  "related": [
    {
      "slug": "tokio",
      "name": "Tokio",
      "relationship": "dependency",
      "strength": 0.95
    },
    {
      "slug": "actix-web",
      "name": "Actix Web",
      "relationship": "alternative",
      "strength": 0.85
    }
  ]
}
```

---

### 9. Solution Portability

**GET** `/api/v1/graph/solutions/{solution_id}/portability`

Check if a solution can be applied to other tech stacks.

**Response:**
```json
{
  "solution": {
    "solution_id": "...",
    "title": "Use Option<T> for nullable fields"
  },
  "portability": [
    {
      "target_technology": "Python",
      "applicability": "high",
      "adaptation_notes": "Use Optional[T] from typing module"
    },
    {
      "target_technology": "TypeScript",
      "applicability": "high",
      "adaptation_notes": "Use type | null or type | undefined"
    }
  ]
}
```

---

## Rust Client Usage

### Using `CentralKGSync` Service

The Nebula IDE includes a pre-built sync service:

```rust
use services::central_kg_sync::CentralKGSync;

// Initialize
let sync_client = CentralKGSync::new(
    db_pool.clone(),
    "http://localhost:8080".to_string()
);

// Sync a completed phase
let stats = sync_client.sync_after_phase_completion(
    project_id,
    "2.01"  // Phase number
).await?;

println!("Synced {} patterns, {} solutions", 
    stats.patterns_synced, 
    stats.solutions_synced
);
```

### Manual Pattern Submission

```rust
#[derive(Serialize)]
struct PatternSubmission {
    error_signature: String,
    error_category: String,
    language: String,
    description: String,
    tags: Vec<String>,
}

let pattern = PatternSubmission {
    error_signature: "rust_borrow_checker_lifetime".to_string(),
    error_category: "lifetime_error".to_string(),
    language: "Rust".to_string(),
    description: "Lifetime parameter mismatch".to_string(),
    tags: vec!["rust".to_string(), "lifetimes".to_string()],
};

let client = reqwest::Client::new();
let response = client
    .post("http://localhost:8080/api/v1/patterns")
    .json(&pattern)
    .send()
    .await?;
```

---

## Data Privacy & Anonymization

### What Gets Sent

✅ **Sent to Central KG:**
- Normalized error signatures
- Error categories and types
- Programming language/framework
- Generic descriptions
- Tags
- Solution approaches
- Confidence scores

❌ **NOT Sent:**
- Project names
- File paths (anonymized to `[PATH]/[SRC]/...`)
- Usernames
- IP addresses (logged server-side only for rate limiting)
- Line numbers (replaced with `N`)
- Variable names (unless part of error pattern)
- Any PII (personally identifiable information)

### Anonymization Process

The `CentralKGSync` service automatically:

```rust
fn normalize_error_signature(error_message: &str) -> String {
    // Remove file paths
    let normalized = error_message
        .replace("C:\\", "[PATH]\\")
        .replace("/home/", "/[PATH]/")
        .replace("backend/src/", "[SRC]/")
        .replace("frontend/src/", "[SRC]/");
    
    // Remove line numbers
    let re = regex::Regex::new(r"\d+").unwrap();
    let normalized = re.replace_all(&normalized, "N");
    
    // Create hash-based signature
    format!("{}_{:x}", signature_base, hash)
}
```

**Example:**
```
Before: "Type error at C:\Users\john\MyProject\backend\src\routes\users.rs:145"
After:  "Type_error_at_[PATH]_[SRC]_routes_users.rs:N_a3f8b2c1"
```

---

## Local Development Setup

### 1. Start Central KG Services

```powershell
cd C:\Dev\fslabs\Labs\Nebula-KG
.\start-central-kg.bat
```

**What This Does:**
- Starts PostgreSQL (port 5433)
- Starts Redis (port 6380)
- Starts Central KG API (port 8080)

### 2. Verify Connection

```powershell
# Check if services are running
.\status.bat

# Test API health
curl http://localhost:8080/health
```

### 3. View Logs

```powershell
.\view-logs.bat
```

### 4. Apply Migrations

```powershell
.\apply-migrations.bat
```

---

## Testing the Connection

### Full Integration Test

```sql
-- File: test_central_kg_connection.sql

-- 1. Register instance
INSERT INTO instances (instance_name, ide_version)
VALUES ('test-connection', '0.1.0')
RETURNING instance_id, api_key;

-- 2. Submit a test pattern
INSERT INTO error_patterns (error_signature, language, description)
VALUES ('test_connection_error', 'Rust', 'Testing Central KG connection')
RETURNING id;

-- 3. Submit a test solution
INSERT INTO solutions (pattern_signature, title, description)
VALUES ('test_connection_error', 'Test Solution', 'Verify connection works')
RETURNING id;

-- 4. Query back
SELECT * FROM error_patterns WHERE error_signature = 'test_connection_error';
SELECT * FROM solutions WHERE pattern_signature = 'test_connection_error';
```

Run it:
```powershell
Get-Content test_central_kg_connection.sql | docker exec -i nebula-central-kg-db psql -U kg_user -d central_kg
```

---

## Monitoring & Statistics

### View Your Instance Stats

**GET** `/api/v1/instances/{instance_id}`

```json
{
  "instance_id": "...",
  "instance_name": "nebula-ide-v0.1.0",
  "patterns_submitted": 156,
  "solutions_submitted": 142,
  "feedback_given": 87,
  "last_sync_at": "2025-11-08T14:30:00Z",
  "total_sync_count": 42
}
```

### Global KG Statistics

**GET** `/api/v1/stats`

```json
{
  "total_patterns": 1247,
  "total_solutions": 1089,
  "total_instances": 156,
  "active_instances_24h": 89,
  "languages": {
    "Rust": 342,
    "Python": 287,
    "JavaScript": 231
  },
  "most_common_errors": [
    "type_mismatch",
    "lifetime_error",
    "async_runtime"
  ]
}
```

---

## Error Handling

### Connection Failures

The sync service handles failures gracefully:

```rust
// Async, non-blocking sync
tokio::spawn(async move {
    if let Err(e) = sync_phase_to_central_kg(&state, project_id, &phase).await {
        tracing::error!("Central KG sync failed: {}", e);
        // User development continues unaffected
    }
});
```

**Failure Modes:**
- Central KG offline → logged, no user impact
- Network timeout → retried (TODO)
- Invalid data → logged, skipped
- API error → logged with details

### Retry Strategy (TODO)

Future implementation:
- Exponential backoff: 1s, 2s, 4s, 8s
- Max 3 retries per sync
- Failed syncs queued for later
- Offline mode: sync on reconnect

---

## FAQ

### Q: Is the Central KG required for the IDE to work?

**A:** No. The IDE functions perfectly without it. Central KG is for community learning and optional pattern sharing.

### Q: Can I opt out?

**A:** Yes. Set `CENTRAL_KG_ENABLED=false` in your `.env` file to disable all sync operations.

### Q: How often does sync happen?

**A:** Automatically when you complete a phase (all tasks done). You can also manually trigger sync via API.

### Q: Is my code sent to the Central KG?

**A:** No. Only anonymized error signatures and generic solutions are shared. No source code, file paths, or personal info.

### Q: Can I run my own Central KG?

**A:** Yes! The entire Central KG is open source and can be self-hosted. Perfect for teams or enterprises.

### Q: What if two people solve the same error differently?

**A:** Both solutions are stored! Users see all solutions ranked by success rate and community votes.

---

## Troubleshooting

### Connection Refused

**Problem:** `Connection refused (os error 10061)`

**Solutions:**
1. Check if Central KG is running: `.\status.bat`
2. Verify URL in `.env`: `CENTRAL_KG_URL=http://localhost:8080`
3. Check firewall settings
4. Start Central KG: `.\start-central-kg.bat`

### Authentication Failed

**Problem:** `Missing authorization header`

**Solution:**
- Local dev: No auth required, check if API is running
- Production: Ensure `CENTRAL_KG_API_KEY` is set in `.env`

### Sync Not Triggering

**Problem:** Phase completed but no sync happened

**Debug:**
```sql
-- Check phase completion detection
SELECT 
    c.phase_number,
    COUNT(t.id) as total_tasks,
    SUM(CASE WHEN t.completed THEN 1 ELSE 0 END) as completed_tasks
FROM constellations c
LEFT JOIN constellation_tasks t ON c.id = t.constellation_id
WHERE c.project_id = 'your-project-id'
GROUP BY c.phase_number;
```

**Solution:**
- Ensure all tasks in phase are marked completed
- Check backend logs for sync trigger
- Verify `CENTRAL_KG_URL` is set

---

## Production Deployment

### Environment Variables

```bash
# Production Central KG
CENTRAL_KG_URL=https://kg.nebula-ide.com
CENTRAL_KG_API_KEY=prod_key_here

# Optional
CENTRAL_KG_TIMEOUT_SECONDS=30
CENTRAL_KG_RETRY_ATTEMPTS=3
CENTRAL_KG_BATCH_SIZE=50
```

### Scaling Considerations

- Central KG handles ~1000 requests/second
- PostgreSQL connection pooling enabled
- Redis caching for hot patterns
- Rate limiting: 100 requests/minute per instance

---

## Next Steps

1. ✅ Start Central KG locally: `.\start-central-kg.bat`
2. ✅ Register your IDE instance via `/api/v1/instances`
3. ✅ Complete a phase in your project to trigger automatic sync
4. ✅ Query patterns for your tech stack
5. ✅ Submit feedback on solutions that help you

**Documentation:**
- `README.md` - Full technical documentation
- `README_USER.md` - Non-technical overview
- `GRAPH_ARCHITECTURE.md` - 3D graph structure
- `TODO.md` - Roadmap and planned features

---

**Last Updated:** November 8, 2025  
**Central KG Version:** 0.1.0  
**Compatible with:** Nebula IDE 0.1.0+

For issues or questions, see `CONTRIBUTING.md` or open an issue on GitHub.

