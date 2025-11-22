# Star System 3.2: Adaptation Seeds (Starter Brains)

## 1. Technical Overview
Currently, a new Nebula project starts with an empty brain. We want to pre-fill the `patterns` table with known common errors for specific frameworks, so the AI can solve them immediately without "learning" them from scratch every time.

## 2. Implementation Plan

### Step 1: Seed Directory
Create structure: `local_kg/seeds/`
- `react.sql`
- `python.sql`
- `rust.sql`

### Step 2: Seed Content
Each file contains `INSERT INTO patterns` statements.
*Example (react.sql):*
```sql
INSERT INTO patterns (id, signature, category, description, solution, occurrence_count)
VALUES (
  uuid(), 
  'react_hydration_mismatch', 
  'HydrationError', 
  'Text content does not match server-rendered HTML', 
  'Check for invalid nesting like <div> inside <p> or random IDs generated during render.', 
  100
);
```

### Step 3: Tooling Integration
Update `local_kg.py` with a `seed` command:
`python local_kg.py seed react` -> Executes `local_kg/seeds/react.sql`.

