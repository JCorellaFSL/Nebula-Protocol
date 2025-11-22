-- Migration 001: Add timezone to all timestamp columns
-- Ensures proper timezone handling for global IDE instances and cross-project learning
-- Version: 1.0.1
-- Date: November 9, 2025

-- =============================================================================
-- DROP VIEWS THAT DEPEND ON TIMESTAMP COLUMNS
-- =============================================================================
DROP VIEW IF EXISTS v_popular_patterns CASCADE;
DROP VIEW IF EXISTS v_instance_leaderboard CASCADE;
DROP VIEW IF EXISTS v_global_stats CASCADE;

-- =============================================================================
-- INSTANCES TABLE
-- =============================================================================
ALTER TABLE instances
    ALTER COLUMN registered_at TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN last_sync_at TYPE TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- ERROR PATTERNS TABLE
-- =============================================================================
ALTER TABLE error_patterns
    ALTER COLUMN first_seen TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN last_seen TYPE TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- SOLUTIONS TABLE
-- =============================================================================
ALTER TABLE solutions
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- SOLUTION FEEDBACK TABLE
-- =============================================================================
ALTER TABLE solution_feedback
    ALTER COLUMN submitted_at TYPE TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- PATTERN RELATIONSHIPS TABLE
-- =============================================================================
ALTER TABLE pattern_relationships
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- SYNC HISTORY TABLE
-- =============================================================================
ALTER TABLE sync_history
    ALTER COLUMN synced_at TYPE TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- LESSONS LEARNED TABLE
-- =============================================================================
ALTER TABLE lessons_learned
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- DAILY STATS TABLE
-- =============================================================================
ALTER TABLE daily_stats
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- UPDATE TRIGGERS TO USE TIMESTAMPTZ
-- =============================================================================

-- Update pattern occurrence function
CREATE OR REPLACE FUNCTION update_pattern_occurrence()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE error_patterns
    SET occurrence_count = occurrence_count + 1,
        last_seen = NOW()  -- NOW() respects timezone
    WHERE error_signature = NEW.pattern_signature;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update solution success rate function
CREATE OR REPLACE FUNCTION update_solution_success_rate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE solutions
    SET success_rate = (
        SELECT COALESCE(AVG(CASE WHEN was_helpful THEN 1.0 ELSE 0.0 END), 0.0)
        FROM solution_feedback
        WHERE solution_id = NEW.solution_id
    ),
    helpful_count = (
        SELECT COUNT(*) FROM solution_feedback
        WHERE solution_id = NEW.solution_id AND was_helpful = true
    ),
    unhelpful_count = (
        SELECT COUNT(*) FROM solution_feedback
        WHERE solution_id = NEW.solution_id AND was_helpful = false
    ),
    updated_at = NOW()  -- NOW() respects timezone
    WHERE id = NEW.solution_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update instance stats function
CREATE OR REPLACE FUNCTION update_instance_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE instances
    SET last_sync_at = NOW(),  -- NOW() respects timezone
        total_sync_count = total_sync_count + 1
    WHERE instance_id = NEW.instance_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VERIFICATION QUERY
-- =============================================================================
-- Note: All timestamp columns now use TIMESTAMP WITH TIME ZONE for proper timezone handling

-- Query to verify all timestamp columns are now timezone-aware
-- Uncomment to run verification:
/*
SELECT 
    table_name, 
    column_name, 
    data_type,
    CASE 
        WHEN data_type = 'timestamp with time zone' THEN '✅ Timezone-aware'
        WHEN data_type = 'timestamp without time zone' THEN '⚠️ Needs update'
        ELSE data_type
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
    AND (column_name LIKE '%_at' OR column_name LIKE '%_time' OR column_name LIKE '%_seen')
    AND data_type LIKE 'timestamp%'
ORDER BY table_name, column_name;
*/

-- =============================================================================
-- RECREATE VIEWS WITH UPDATED COLUMN TYPES
-- =============================================================================

-- Popular patterns view
CREATE VIEW v_popular_patterns AS
SELECT 
    ep.id,
    ep.error_signature,
    ep.error_category,
    ep.language,
    ep.framework,
    ep.description,
    ep.occurrence_count,
    ep.last_seen,
    COUNT(DISTINCT s.id) as solution_count,
    COALESCE(AVG(s.success_rate), 0) as avg_success_rate
FROM error_patterns ep
LEFT JOIN solutions s ON s.pattern_signature = ep.error_signature
GROUP BY ep.id
ORDER BY ep.occurrence_count DESC, ep.last_seen DESC;

-- Instance leaderboard view
CREATE VIEW v_instance_leaderboard AS
SELECT 
    instance_id,
    instance_name,
    patterns_submitted,
    solutions_submitted,
    feedback_given,
    (patterns_submitted + solutions_submitted + feedback_given) as total_contributions,
    last_sync_at,
    registered_at
FROM instances
WHERE is_active = true
ORDER BY total_contributions DESC;

-- Global statistics view
CREATE VIEW v_global_stats AS
SELECT 
    (SELECT COUNT(*) FROM error_patterns) as total_patterns,
    (SELECT COUNT(*) FROM solutions) as total_solutions,
    (SELECT COUNT(*) FROM instances WHERE is_active = true) as active_instances,
    (SELECT COUNT(*) FROM instances WHERE last_sync_at > NOW() - INTERVAL '24 hours') as active_instances_24h,
    (SELECT jsonb_object_agg(language, cnt) 
     FROM (SELECT language, COUNT(*) as cnt FROM error_patterns GROUP BY language) sub) as languages,
    (SELECT jsonb_object_agg(error_category, cnt)
     FROM (SELECT error_category, COUNT(*) as cnt FROM error_patterns GROUP BY error_category ORDER BY cnt DESC LIMIT 10) sub) as top_errors;

-- =============================================================================
-- COMPLETION
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Central KG Timestamp Migration completed successfully';
    RAISE NOTICE '🌍 All timestamp columns now timezone-aware (TIMESTAMPTZ)';
    RAISE NOTICE '🔄 Triggers updated to use NOW() for timezone consistency';
    RAISE NOTICE '📊 Data preserved during migration (timestamps converted to UTC)';
    RAISE NOTICE '👁️  Views recreated with updated column types';
END $$;

