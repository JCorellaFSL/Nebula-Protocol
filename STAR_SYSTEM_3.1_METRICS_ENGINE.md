# Star System 3.1: Metrics Engine Implementation

## 1. Technical Overview
We need to turn the raw `events` stream into actionable insights. We will implement SQL queries that calculate key performance indicators (KPIs) dynamically.

## 2. Metrics Definitions

### A. Velocity (Speed)
- **Definition:** Average time between `STAR_SYSTEM` creation (milestone) and `STAR_GATE` passage.
- **Calculation:** Delta between `events` where type='milestone' (start) and type='star_gate' (end).

### B. Quality (Stability)
- **Definition:** Ratio of `error` events to `milestone` events.
- **Calculation:** `Count(Errors) / Count(Milestones)`. Lower is better.

### C. AI Effectiveness
- **Definition:** Average effectiveness score of recorded solutions.
- **Calculation:** `AVG(json_extract(metadata, '$.effectiveness'))` from `events` where type='solution'.

## 3. Implementation Plan

### Step 1: SQL Views
Create `v_metrics_daily` view in `universal_memory.sqlite` to pre-calculate these stats.

### Step 2: Adapter Update
- **Python:** Add `get_advanced_stats()` to `LocalKG` class.
- **Node.js:** Update `getStatistics()` in `ProjectMemory` class.

### Step 3: CLI Visualization
Update `local_kg.py` to print a formatted report:
```text
[NEBULA METRICS]
Velocity: 2.5 days/constellation
Quality:  0.8 errors/milestone (Excellent)
AI Score: 4.2/5.0
```

