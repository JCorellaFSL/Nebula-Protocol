# Star Gate 3: Advanced Features Validation

## 1. Validation Checkpoints

### Automated Tests
- [ ] **Metrics Calculation:** Simulate a project history (1 milestone, 3 errors, 1 star gate) and assert the Quality Metric calculates correctly (3.0).
- [ ] **Seeding:** Run `python local_kg.py seed python` and verify `patterns` table count increases.

### Manual Verification
- [ ] **CLI Experience:**
  - Run `python local_kg.py stats` on the current `Nebula-Protocol` project.
  - Does it show meaningful numbers?
- [ ] **Seed Relevance:**
  - Check the content of `react.sql`. Are the solutions actually helpful?

## 2. Rollback Plan
- If SQL Views break legacy queries: `DROP VIEW ...`
- If Seeding corrupts DB: Restore from backup.

