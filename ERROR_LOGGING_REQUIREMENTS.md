# Error Logging Requirements - MANDATORY

**Status:** MANDATORY - Cannot be waived  
**Enforcement:** Star Gates, Quality Gates, Protocol Compliance  
**Last Updated:** November 8, 2025

---

## Core Principle

**Every error encountered during development MUST be logged to Project Memory.**

This is not optional, not a suggestion, not a "nice-to-have" feature. Error logging is a **fundamental requirement** of the Nebula Protocol that enables:

1. **Institutional Learning** - Errors become reusable knowledge
2. **Central KG Population** - Future projects benefit from past mistakes
3. **Pattern Recognition** - Similar errors are auto-detected
4. **Solution Sharing** - Proven fixes are propagated across projects
5. **Progress Tracking** - Error resolution is measurable

---

## What MUST Be Logged

### 1. Implementation Errors (MANDATORY)

Any error that blocks progress or requires a fix:

```javascript
pm.logError({
  level: 'ERROR',                    // ERROR or CRITICAL
  phase: 'Constellation X: Name',
  constellation: 'ConstellationName',
  filePath: 'path/to/file.ext',
  lineNumber: 42,
  errorCode: 'ErrorType',
  message: 'Full error message',
  stackTrace: 'Complete stack trace',
  context: 'What you were trying to do when error occurred'
});
```

**Examples:**
- Syntax errors
- Import/dependency errors
- Type errors
- Runtime exceptions
- Build failures
- Test failures
- Deployment errors

### 2. Platform-Specific Issues (MANDATORY)

Errors specific to OS, shell, or environment:

- Windows vs Linux/Mac differences
- PowerShell vs bash syntax
- Encoding issues (UTF-8, cp1252, etc.)
- Path separators
- Permission issues
- Package manager differences

### 3. Tool/Framework Quirks (MANDATORY)

Unexpected behavior from tools or frameworks:

- Framework-specific errors
- Package manager issues
- Build tool problems
- IDE integration issues
- Version conflicts

### 4. Workarounds Applied (MANDATORY)

When you work around a problem instead of fixing it properly:

```javascript
pm.logError({
  level: 'ERROR',
  message: 'Original problem that required workaround',
  context: 'Describe what you did instead'
});

pm.recordSolution({
  errorId: errorId,
  solution: 'Workaround applied',
  codeChanges: 'What was changed',
  effectiveness: 3,  // Lower rating for workarounds
  notes: 'This is a workaround, not a proper fix'
});
```

---

## When to Log

### Immediate Logging (Within 60 Seconds of Error)

**RULE:** If you spent more than 2 minutes fixing an error, LOG IT.

**Workflow:**
1. Error occurs
2. Fix error
3. **IMMEDIATELY log error + solution**
4. Continue work

**DO NOT:**
- "I'll log it later" ❌
- "It's too minor to log" ❌
- "I'll remember this for the end" ❌

### Retroactive Logging (Same Day)

If you realize you forgot to log an error, create a retroactive logging script:

```javascript
// log_errors_YYYYMMDD.mjs
import { ProjectMemory } from './.nebula/tools/project-memory.js';

const pm = new ProjectMemory('.', 'project-name', 'framework');

// Log all forgotten errors here
const error1 = pm.logError({ /* ... */ });
pm.recordSolution({ errorId: error1.errorId, /* ... */ });

pm.close();
```

---

## What NOT to Log

### Minor Expected Behavior

- Intentional test failures (during TDD)
- Expected validation errors (user input testing)
- Debugging `console.log` output
- Linter warnings that are intentional

### User Errors (Not Development Errors)

- User provides invalid input (expected behavior)
- User lacks permissions (application logic)

---

## Enforcement Mechanisms

### 1. Star Gate Verification (MANDATORY)

Every Star Gate MUST include:

```markdown
## Error Logging Compliance

- [ ] All errors encountered during this constellation were logged
- [ ] All solutions have effectiveness ratings (1-5)
- [ ] Error patterns created for Central KG matching
- [ ] Retroactive logging script created if any errors were missed

**Command to verify:**
```bash
cd .nebula/tools
node -e "const {ProjectMemory} = require('./project-memory.js'); \
  const pm = new ProjectMemory('../..', 'project', 'framework'); \
  console.log(pm.getStatistics()); pm.close();"
```

**Minimum Requirements:**
- If constellation had no errors: Explicitly state "No errors encountered"
- If constellation had errors: Must show >0 totalErrors, >0 solutions
```

### 2. Pre-Commit Hook (RECOMMENDED)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Remind developer to log errors

echo "⚠️  REMINDER: Have you logged all errors to Project Memory?"
echo "   Run: cd .nebula/tools && node check_error_logging.mjs"
echo ""
read -p "Continue commit? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi
```

### 3. Star Gate Failure

**If error logging is incomplete, the Star Gate FAILS automatically.**

No exceptions. No waivers. No "I'll do it later."

---

## Error Logging Tools

### Quick Log Script

Create `.nebula/tools/quick_log.mjs`:

```javascript
#!/usr/bin/env node
import { ProjectMemory } from './project-memory.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pm = new ProjectMemory('../..', process.env.PROJECT_NAME, process.env.FRAMEWORK);

console.log('🚨 Quick Error Logger\n');

rl.question('Error message: ', (message) => {
  rl.question('File path: ', (filePath) => {
    rl.question('What were you doing? ', (context) => {
      const result = pm.logError({
        level: 'ERROR',
        phase: process.env.CURRENT_CONSTELLATION,
        constellation: process.env.CURRENT_CONSTELLATION,
        filePath,
        message,
        context
      });
      
      console.log(`✅ Error logged: ${result.errorId}`);
      
      rl.question('Solution applied: ', (solution) => {
        pm.recordSolution({
          errorId: result.errorId,
          solution,
          appliedBy: 'ai',
          effectiveness: 4
        });
        console.log('✅ Solution recorded');
        pm.close();
        rl.close();
      });
    });
  });
});
```

### Error Statistics Script

Create `.nebula/tools/error_stats.mjs`:

```javascript
#!/usr/bin/env node
import { ProjectMemory } from './project-memory.js';

const pm = new ProjectMemory('../..', process.argv[2], process.argv[3]);
const stats = pm.getStatistics();

console.log('\n📊 Error Logging Statistics\n');
console.log(`Total Errors Logged:     ${stats.totalErrors}`);
console.log(`Unresolved Errors:       ${stats.unresolvedErrors}`);
console.log(`Error Patterns Found:    ${stats.errorPatterns}`);
console.log(`Solutions Recorded:      ${stats.totalErrors - stats.unresolvedErrors}`);
console.log(`Current Version:         ${stats.currentVersion}`);
console.log(`Current Phase:           ${stats.currentPhase || 'Not set'}`);

if (stats.unresolvedErrors > 0) {
  console.log('\n⚠️  WARNING: Unresolved errors detected');
  console.log('   These must be resolved before passing Star Gate');
}

if (stats.totalErrors === 0) {
  console.log('\n✅ No errors logged');
  console.log('   If this is accurate, you may proceed');
  console.log('   If errors were encountered but not logged, LOG THEM NOW');
}

pm.close();
```

---

## Integration with Central KG

### Automatic Sync (When Available)

Errors and solutions automatically sync to Central KG when:
1. Solution is recorded
2. Star Gate is passed
3. Star System is completed

### Manual Sync

```javascript
// In project-memory.js
async syncToCentralKG(errorId, solutionId) {
  if (!config.features.centralKG) return;
  
  // Extract error pattern
  const pattern = this.extractErrorPattern(error);
  
  // Send to Central KG
  await fetch(`${config.centralKG.url}/api/kg/patterns`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${config.centralKG.token}` },
    body: JSON.stringify({ pattern, solution })
  });
}
```

---

## Benefits (Why This is Mandatory)

### 1. Cross-Project Learning

**Project 1:** Hits unicode error, spends 10 minutes debugging
**Project 2:** Hits same error, sees instant solution, spends 30 seconds

**10 Projects × 5 errors each × 8 minutes saved = 400 minutes = 6.6 hours saved**

### 2. Pattern Recognition

After 3-5 similar errors:
- Protocol auto-detects patterns
- Suggests preventive measures
- Updates Star System guides
- Warns future developers

### 3. Quality Metrics

Track project health:
- Error density per constellation
- Average time to resolution
- Most common error types
- Framework-specific issues

### 4. Documentation Auto-Generation

Errors become documentation:
- "Common Issues" sections
- Troubleshooting guides
- Platform-specific notes
- Framework gotchas

---

## Consequences of Non-Compliance

### Star Gate Level

**Automatic Failure** if:
- Errors were encountered but not logged
- Solutions lack effectiveness ratings
- No retroactive logging script provided

### Protocol Level

Projects that skip error logging:
- **Lose Central KG benefits**
- **Cannot help future projects**
- **Miss pattern detection**
- **Reduce protocol value for everyone**

---

## Summary: The Three Rules

### Rule 1: Every Error Must Be Logged
No exceptions. No "too minor to log." No "I'll remember."

### Rule 2: Every Solution Must Be Recorded
With effectiveness rating, code changes, and notes.

### Rule 3: Star Gates Enforce Compliance
Cannot pass a Star Gate without error logging verification.

---

## Getting Started

### For New Projects

1. Initialize Project Memory (automatic with `init-nebula-project.js`)
2. Set environment variables:
   ```bash
   export PROJECT_NAME="your-project"
   export FRAMEWORK="python"
   export CURRENT_CONSTELLATION="Constellation 0: Setup"
   ```
3. Create `quick_log.mjs` and `error_stats.mjs` scripts
4. Read this document
5. Log errors as you encounter them

### For Existing Projects

1. Create retroactive logging script for past errors
2. Run `error_stats.mjs` to verify compliance
3. Update Star Gate documents to include error logging checks
4. Continue with mandatory logging going forward

---

**Last Updated:** November 8, 2025  
**Status:** MANDATORY PROTOCOL REQUIREMENT  
**Enforcement:** Star Gates, Quality Gates, Protocol Compliance

