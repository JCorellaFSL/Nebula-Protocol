# Constellation 3: Advanced Features & Metrics

## 1. Overview
This constellation focuses on implementing the "Next Steps" identified for the Nebula Protocol: **Metrics/Analytics** and **Specialized Adaptations**. We will build these features directly into the Universal Schema and tooling established in C1 and C2.

## 2. Goals & Success Criteria
- **Goal:** Enable quantitative tracking of project health (velocity, quality).
- **Goal:** Provide "Starter Brains" for common frameworks (React, Python, etc.) to reduce cold-start friction.
- **Success Criteria:**
  - The `getStatistics()` method in both Node/Python adapters returns real calculated metrics (not stubs).
  - `init-nebula` (or `local_kg seed`) can populate the DB with framework-specific patterns.

## 3. Scope & Boundaries
- **In Scope:**
  - Extending `universal_memory.sqlite` with views/queries for metrics.
  - Creating seed data files (`local_kg/seeds/*.sql`).
  - Implementing dashboard CLI command (`python local_kg.py stats`).
- **Out of Scope:**
  - Web-based dashboard (CLI only for now).
  - Multi-user/Team features (strictly single-user optimization).

## 4. Star System Breakdown
- **`STAR_SYSTEM_3.1_METRICS_ENGINE.md`**: Implementing the SQL logic and adapter methods to calculate Velocity and Quality metrics.
- **`STAR_SYSTEM_3.2_ADAPTATION_SEEDS.md`**: Creating the "Starter Brain" SQL files for React, Python, etc.

## 5. Star Gate Requirements
- **Tests:**
  - Verify `metrics.velocity` returns a non-zero value after events are logged.
  - Verify seeding a React project populates the `patterns` table.
- **Manual Check:**
  - Run `python local_kg.py stats` and verify the output is useful.

