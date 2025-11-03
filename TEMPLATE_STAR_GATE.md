# Star Gate [NUMBER]: [CONSTELLATION_NAME]

## Overview
**Constellation:** `CONSTELLATION_[NUMBER]_[NAME].md`  
**Status:** ⏳ Pending / 🔄 In Progress / ✅ Passed / ❌ Failed  
**Started:** YYYY-MM-DD  
**Completed:** YYYY-MM-DD  
**Reviewer:** [Name/Role]

## Purpose
Validate that Constellation [NUMBER] ([NAME]) meets all quality, testing, and integration requirements before proceeding to the next phase.

**Star Gates are mandatory checkpoints that prevent rushed, untested code from entering the next constellation.**

---

## Entry Criteria

Before attempting to pass through this Star Gate:

- [ ] All tasks in `CONSTELLATION_[NUMBER]_[NAME].md` are complete
- [ ] All code changes committed to version control
- [ ] **Code pushed to remote repository** (GitHub, GitLab, Bitbucket, etc.)
- [ ] No critical linter errors or build failures
- [ ] All Star Systems within this constellation are complete
- [ ] Documentation updated to reflect implemented features

**⚠️ IMPORTANT:** Always push to remote before passing Star Gate. This ensures:
- Backup of your work
- Team visibility
- Deployment pipeline triggers (if configured)
- Audit trail for project history

---

## Testing Requirements

### Automated Tests ✅

**⚠️ CRITICAL:** Automated tests must **GENUINELY test functionality**.  
Scripted outcomes that fake success are **FORBIDDEN** and will be flagged in project memory.

#### Unit Tests
- [ ] Unit tests written for all new functions/methods
- [ ] Unit tests passing (100% of written tests)
- [ ] Edge cases identified and tested
- [ ] Error handling tested

**Test Coverage Target:** 70%+ of new code  
**Current Coverage:** ____%

#### Integration Tests
- [ ] Integration tests cover happy paths
- [ ] Integration tests cover error scenarios
- [ ] API endpoints tested (if applicable)
- [ ] Database operations tested (if applicable)

**Tests Written:** ___ tests  
**Tests Passing:** ___ / ___

#### Example Test Evidence
```
# Example command used:
npm test
# OR
pytest tests/
# OR
cargo test

# Results:
[Paste test output showing passing tests]
```

---

### Manual Verification 👤 (REQUIRED)

**Human testing is mandatory for user-facing features.**

#### Developer Manual Testing
- [ ] Feature tested manually by developer
- [ ] All user flows work as expected
- [ ] UI/UX tested in development environment
- [ ] Cross-browser testing (if web app)
- [ ] Mobile responsive testing (if applicable)

#### User Acceptance Testing (if applicable)
- [ ] Feature tested by actual user (not developer)
- [ ] User feedback collected and documented
- [ ] Critical issues identified and fixed
- [ ] User-reported bugs logged

#### Manual Test Checklist
```
Test 1: [Feature/Flow Name]
- Steps taken: [Describe]
- Expected result: [Describe]
- Actual result: [Describe]
- Status: ✅ Pass / ❌ Fail

Test 2: [Feature/Flow Name]
- Steps taken: [Describe]
- Expected result: [Describe]
- Actual result: [Describe]
- Status: ✅ Pass / ❌ Fail

[Add more as needed]
```

---

## Integration Review

### Constellation Impact Analysis
- [ ] **Backward Compatibility:** Does this affect previous constellations?
  - If YES: Document impact and verify previous features still work
- [ ] **Breaking Changes:** Are there any breaking changes?
  - If YES: Document changes and update affected code
- [ ] **App Usability:** Does the application remain fully functional?
  - Verify end-to-end user flows still work

### Dependencies
- [ ] All new dependencies documented
- [ ] Dependency versions locked in package manifest
- [ ] No conflicting dependency versions
- [ ] Security vulnerabilities checked (npm audit, cargo audit, etc.)

---

## Performance & Quality

### Performance Benchmarks (if applicable)
- [ ] Load time acceptable: Target: ___ms, Actual: ___ms
- [ ] Response time acceptable: Target: ___ms, Actual: ___ms
- [ ] Memory usage acceptable: Target: ___MB, Actual: ___MB
- [ ] No performance regressions from previous constellation

### Code Quality
- [ ] Code follows project style guide
- [ ] No code duplication (DRY principle)
- [ ] Functions/methods are properly documented
- [ ] Complex logic includes explanatory comments
- [ ] No TODO or FIXME comments without associated issues

---

## Documentation

- [ ] README updated (if user-facing changes)
- [ ] API documentation updated (if applicable)
- [ ] Architecture diagrams updated (if structural changes)
- [ ] Changelog updated with constellation completion
- [ ] User-facing documentation updated

---

## Skip Documentation

**If any tests were skipped or incomplete, you MUST document:**

### Skipped Tests
```
Test Type: [Unit/Integration/Manual]
Reason: [Why was testing skipped?]
Risk Assessment: [Low/Medium/High] - What could go wrong?
Mitigation Plan: [How will this be addressed later?]
Approved By: [Name/Role]
Date: YYYY-MM-DD
```

**⚠️ WARNING:** This skip is logged to project memory and flagged for future review.

---

## Star Gate Decision

### ✅ PASS Criteria
All of the following must be true:
- [ ] All automated tests passing (or skips documented)
- [ ] Manual verification complete for user-facing features
- [ ] Integration check passed (no breaking changes to previous work)
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] No critical bugs or blockers

### 🔀 ADD MORE STAR SYSTEMS
If issues are found and constellation needs further decomposition:
- [ ] Add additional Star Systems to better organize work
- [ ] Create `STAR_SYSTEM_[X.Y]_[NAME].md` for focused fixes
- [ ] Reorganize existing Star Systems if needed
- [ ] Address issues in granular components
- [ ] Re-attempt Star Gate passage

**Note:** Star Systems should already exist. This is about adding MORE if needed, not creating them for the first time.

### 🔄 ROLLBACK
If major architectural issues discovered:
- [ ] Document fundamental problems
- [ ] Assess impact of rollback
- [ ] Create revised constellation plan
- [ ] Obtain stakeholder approval

---

## Final Verdict

**Decision:** ⏳ Pending / ✅ PASSED / 🔀 Add More Star Systems / 🔄 Rollback

**Reviewer:** [Name]  
**Date:** YYYY-MM-DD

**Notes:**
```
[Reviewer notes, concerns, recommendations]
```

---

## Project Memory Log

**This Star Gate passage is automatically logged to project memory:**

```json
{
  "star_gate_id": "[NUMBER]",
  "constellation": "CONSTELLATION_[NUMBER]_[NAME]",
  "status": "passed|failed|pending",
  "tests_automated": 0,
  "tests_passing": 0,
  "tests_manual": 0,
  "tests_skipped": 0,
  "skip_reasons": [],
  "duration_minutes": 0,
  "reviewer": "",
  "notes": "",
  "timestamp": ""
}
```

---

## Version Bump

Upon passing this Star Gate:

**Current Version:** 0.X.0  
**New Version:** 0.Y.0

- [ ] Version bumped in package.json / Cargo.toml / pubspec.yaml / setup.py
- [ ] Git tag created: `v0.Y.0`
- [ ] Changelog updated with version bump
- [ ] **Changes committed and pushed to remote**
- [ ] **Git tag pushed:** `git push origin v0.Y.0`

---

## Next Steps

Upon passing this Star Gate:

1. **Proceed to next constellation:** `CONSTELLATION_[NEXT]_[NAME].md`
2. **Update project status:** Mark Constellation [NUMBER] as complete
3. **Team notification:** Announce constellation completion
4. **Celebrate:** Acknowledge the milestone! 🎉

---

**Remember:** Star Gates are not bureaucracy—they are quality enforcement that prevents technical debt and ensures reliable, tested code progression.

