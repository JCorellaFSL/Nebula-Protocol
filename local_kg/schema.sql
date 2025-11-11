-- Local Knowledge Graph Schema (SQLite)
-- Lightweight pattern/solution storage that syncs to Central KG
-- This serves as the reference implementation for IDE local KG

-- Error patterns encountered locally
CREATE TABLE IF NOT EXISTS local_patterns (
    id TEXT PRIMARY KEY,
    error_signature TEXT NOT NULL,
    error_category TEXT,
    language TEXT,
    description TEXT,
    context_json TEXT, -- JSON blob with stack trace, file paths, etc.
    occurrence_count INTEGER DEFAULT 1,
    first_seen_at TEXT DEFAULT (datetime('now')),
    last_seen_at TEXT DEFAULT (datetime('now')),
    synced_to_central BOOLEAN DEFAULT 0,
    central_pattern_id TEXT, -- UUID from central KG if synced
    severity TEXT DEFAULT 'medium' -- low, medium, high, critical
);

-- Solutions for patterns
CREATE TABLE IF NOT EXISTS local_solutions (
    id TEXT PRIMARY KEY,
    pattern_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    code_snippet TEXT,
    resolution_steps TEXT, -- Step-by-step fix
    time_to_resolve_minutes INTEGER,
    was_successful BOOLEAN DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    synced_to_central BOOLEAN DEFAULT 0,
    central_solution_id TEXT,
    FOREIGN KEY (pattern_id) REFERENCES local_patterns(id)
);

-- Technologies associated with patterns
CREATE TABLE IF NOT EXISTS local_pattern_technologies (
    pattern_id TEXT NOT NULL,
    technology_slug TEXT NOT NULL,
    PRIMARY KEY (pattern_id, technology_slug),
    FOREIGN KEY (pattern_id) REFERENCES local_patterns(id)
);

-- Sync history to track what's been pushed to central
CREATE TABLE IF NOT EXISTS sync_history (
    id TEXT PRIMARY KEY,
    sync_type TEXT NOT NULL, -- 'pattern', 'solution'
    local_id TEXT NOT NULL,
    central_id TEXT,
    synced_at TEXT DEFAULT (datetime('now')),
    sync_status TEXT DEFAULT 'success', -- 'success', 'failed', 'pending'
    error_message TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patterns_signature ON local_patterns(error_signature);
CREATE INDEX IF NOT EXISTS idx_patterns_category ON local_patterns(error_category);
CREATE INDEX IF NOT EXISTS idx_patterns_synced ON local_patterns(synced_to_central);
CREATE INDEX IF NOT EXISTS idx_solutions_pattern ON local_solutions(pattern_id);
CREATE INDEX IF NOT EXISTS idx_solutions_synced ON local_solutions(synced_to_central);
CREATE INDEX IF NOT EXISTS idx_sync_history_local ON sync_history(local_id);

-- View for unsynced items
CREATE VIEW IF NOT EXISTS v_unsynced_patterns AS
SELECT * FROM local_patterns WHERE synced_to_central = 0;

CREATE VIEW IF NOT EXISTS v_unsynced_solutions AS
SELECT * FROM local_solutions WHERE synced_to_central = 0;

-- View for pattern-solution pairs
CREATE VIEW IF NOT EXISTS v_pattern_solutions AS
SELECT 
    p.id as pattern_id,
    p.error_signature,
    p.error_category,
    p.occurrence_count,
    COUNT(DISTINCT s.id) as solution_count,
    p.synced_to_central as pattern_synced,
    p.central_pattern_id
FROM local_patterns p
LEFT JOIN local_solutions s ON p.id = s.pattern_id
GROUP BY p.id;

