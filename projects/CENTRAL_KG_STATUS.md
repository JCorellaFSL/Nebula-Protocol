# Central Knowledge Graph - Status & Integration

**Last Updated:** November 8, 2025  
**Status:** ✅ ACTIVE - Two-Way Sync Enabled

---

## 🧠 What Changed

### Before (Local Only)
```
Project 1 → Error → Log Locally → Solve → Continue
Project 2 → Same Error → Log Locally → Solve Again → Continue
Project 3 → Same Error → Log Locally → Solve Yet Again → Continue
```

**Problem:** Every project re-solves the same errors. No learning.

### After (Central KG - TWO-WAY STREET)
```
Project 1 → Error → Check Central KG (no match) → Log Locally + Sync to Central → Solve → Share Solution
Project 2 → Same Error → Check Central KG (MATCH!) → Show Solution → Apply → Continue
Project 3 → Same Error → Check Central KG (MATCH!) → Show Solution → Apply → Continue
```

**Benefit:** Each error only solved once. Every project benefits immediately.

---

## 🔄 Two-Way Integration

### READ from Central KG (Before Solving)
When `logError()` is called:
1. **Extract error pattern** (remove line numbers, variable names, paths)
2. **Query Central KG** for similar patterns using PostgreSQL `similarity()`
3. **Display known solutions** if found (effectiveness rating, usage count)
4. **Show match score** (30%+ similarity threshold)

**Example Output:**
```
🔍 Checking Central KG for similar errors...

💡 Found 2 similar errors with solutions:

1. Install package in editable mode using pip install -e .
   Effectiveness: 5/5 (used 3 times)
   Match: 95%

2. Ensure virtual environment is activated before running tests
   Effectiveness: 4/5 (used 1 time)
   Match: 72%
```

### WRITE to Central KG (After Logging)
1. **Log error locally** to project memory
2. **Extract pattern** (same normalization)
3. **Upsert to error_patterns** table (increment if exists, insert if new)
4. **Record instance** (when, where, which project)
5. **Link solution** when `recordSolution()` is called

---

## 📊 Central KG Statistics

**Current Data:**
- Error Patterns: 0 (fresh database)
- Solutions: 0
- Instances: 0
- Projects: 3 (todo-list-cli, weather-dashboard, file-organizer)

**Expected After Sync:**
- Error Patterns: ~4 unique patterns
- Solutions: ~4 solutions
- Instances: ~8 total occurrences

---

## 🔌 Connection Configuration

### PostgreSQL Central KG
- **Host:** localhost
- **Port:** 5433 (Docker mapped)
- **Database:** nebula_central_kg
- **User:** nebula
- **Password:** nebula_secure_password
- **Container:** nebula-central-kg-db

### Connection Test
```bash
docker exec nebula-central-kg-db psql -U nebula -d nebula_central_kg -c "SELECT COUNT(*) FROM error_patterns"
```

### Docker Status
```bash
docker ps | grep nebula-central-kg
```

Expected:
```
nebula-central-kg-db     Up X hours   0.0.0.0:5433->5432/tcp
nebula-central-kg-redis  Up X hours   0.0.0.0:6380->6379/tcp
```

---

## 🚀 How It Works in Practice

### Scenario 1: New Error (First Time)
```javascript
// Project 4 encounters new error
await pm.logError({
  level: 'ERROR',
  message: 'Module not found: requests',
  // ...
});

// Output:
// 🔍 Checking Central KG for similar errors...
//    No known solutions found - this is a new error pattern
// ✅ Error synced to Central KG
```

### Scenario 2: Known Error (Already Solved)
```javascript
// Project 5 encounters same error
await pm.logError({
  level: 'ERROR',
  message: 'Module not found: requests',
  // ...
});

// Output:
// 🔍 Checking Central KG for similar errors...
// 💡 Found 1 similar error with solutions:
// 1. Install package: pip install requests
//    Effectiveness: 5/5 (used 1 time)
//    Match: 98%
// ✅ Error synced to Central KG
```

Developer sees the solution immediately and applies it!

### Scenario 3: Recording Solution
```javascript
await pm.recordSolution({
  errorId: '...',
  description: 'Install package: pip install requests',
  codeChanges: 'pip install requests',
  effectiveness: 5,
  appliedBy: 'ai'
});

// Output:
// ✅ Solution synced to Central KG
```

Now all future projects benefit from this solution!

---

## 📈 Expected Impact

### Setup Time Reduction
```
Project 1: 20 min (learn from scratch)
Project 2: 15 min (some patterns applied)
Project 3: 10 min (more patterns applied)
Project 4-10: ~8 min (Central KG active!)
```

**Target:** Average setup time < 10 minutes with zero repeated errors.

### Error Resolution Speed
- **First occurrence:** 2-5 minutes (manual resolution)
- **Subsequent occurrences:** < 30 seconds (auto-suggested solution)

**Target:** 90% of errors have known solutions by Project 10.

---

## 🛠️ Integration Points

### project-memory.js (Updated)
- `logError()` → Query Central KG first, then log + sync
- `recordSolution()` → Sync solution to Central KG
- `queryCentralKG()` → Search for similar patterns
- `syncToCentralKG()` → Share new patterns
- `syncSolutionToCentralKG()` → Share solutions

### init-nebula-project.js (Updated)
- Tests Central KG connection on project initialization
- Shows status (connected/offline)
- Provides setup instructions if unavailable

### All Projects
- Project 1: ✅ Updated with two-way sync
- Project 2: ✅ Updated with two-way sync
- Project 3: ✅ Updated with two-way sync
- Projects 4-10: ✅ Will use updated version automatically

---

## 🎯 Next Steps

1. ✅ Two-way sync implemented
2. ✅ Connection testing added to init
3. ⏳ Sync existing errors from Projects 1-3
4. ⏳ Continue with Projects 4-10
5. ⏳ Validate pattern matching accuracy
6. ⏳ Monitor Central KG growth

---

## 🔧 Troubleshooting

### Central KG Not Available
**Symptoms:** `⚠️  Central KG not available (will use local memory only)`

**Solutions:**
1. Check Docker is running: `docker ps`
2. Start containers: `docker-compose up -d postgres redis`
3. Test connection: `node test-central-kg-connection.mjs`
4. Check logs: `docker logs nebula-central-kg-db`

**Fallback:** Projects work fine in local-only mode. Central KG is optional but recommended.

### Pattern Not Matching
**Symptoms:** Error appears but Central KG says "no known solutions"

**Reasons:**
- Similarity threshold (30%) not met
- Pattern normalization didn't match
- Error is genuinely new

**Solution:** Log the error, solve it, record solution. Future matches will work.

---

**Status:** ✅ Central Knowledge Graph is LIVE and integrated!  
**Mode:** Two-way sync (READ solutions, WRITE patterns)  
**Impact:** Accelerating development across all projects

