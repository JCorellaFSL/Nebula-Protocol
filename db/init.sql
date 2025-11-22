-- Nebula Central Knowledge Graph Database Schema
-- Version: 1.0.0
-- Date: November 8, 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For similarity searches

-- =============================================================================
-- INSTANCES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS instances (
    instance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_name VARCHAR(255) NOT NULL,
    ide_version VARCHAR(50) NOT NULL,
    instance_url TEXT,
    api_key VARCHAR(255) UNIQUE,
    capabilities JSONB DEFAULT '[]'::jsonb,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    total_sync_count INTEGER DEFAULT 0,
    patterns_submitted INTEGER DEFAULT 0,
    solutions_submitted INTEGER DEFAULT 0,
    feedback_given INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_instances_api_key ON instances(api_key);
CREATE INDEX idx_instances_active ON instances(is_active);

-- =============================================================================
-- ERROR PATTERNS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS error_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_signature VARCHAR(500) UNIQUE NOT NULL,
    error_category VARCHAR(100),
    language VARCHAR(50),
    framework VARCHAR(100),
    description TEXT,
    normalized_message TEXT,
    tags TEXT[] DEFAULT '{}'::text[],
    occurrence_count INTEGER DEFAULT 1,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    anonymized BOOLEAN DEFAULT true,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_error_patterns_signature ON error_patterns(error_signature);
CREATE INDEX idx_error_patterns_language ON error_patterns(language);
CREATE INDEX idx_error_patterns_framework ON error_patterns(framework);
CREATE INDEX idx_error_patterns_category ON error_patterns(error_category);
CREATE INDEX idx_error_patterns_tags ON error_patterns USING GIN(tags);
CREATE INDEX idx_error_patterns_occurrence ON error_patterns(occurrence_count DESC);

-- Full-text search on descriptions
CREATE INDEX idx_error_patterns_description_fts ON error_patterns USING GIN(to_tsvector('english', description));

-- =============================================================================
-- SOLUTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_signature VARCHAR(500) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    code_snippet TEXT,
    success_rate DECIMAL(3,2) DEFAULT 0.0 CHECK (success_rate >= 0 AND success_rate <= 1),
    confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    applies_to TEXT[] DEFAULT '{}'::text[],
    verified BOOLEAN DEFAULT false,
    votes INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_instance UUID REFERENCES instances(instance_id),
    metadata JSONB DEFAULT '{}'::jsonb,
    FOREIGN KEY (pattern_signature) REFERENCES error_patterns(error_signature) ON DELETE CASCADE
);

CREATE INDEX idx_solutions_pattern ON solutions(pattern_signature);
CREATE INDEX idx_solutions_success_rate ON solutions(success_rate DESC);
CREATE INDEX idx_solutions_verified ON solutions(verified);
CREATE INDEX idx_solutions_votes ON solutions(votes DESC);

-- =============================================================================
-- SOLUTION FEEDBACK TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS solution_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
    instance_id UUID NOT NULL REFERENCES instances(instance_id),
    was_helpful BOOLEAN NOT NULL,
    resolution_time_minutes INTEGER,
    comment TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_solution_feedback_solution ON solution_feedback(solution_id);
CREATE INDEX idx_solution_feedback_instance ON solution_feedback(instance_id);
CREATE INDEX idx_solution_feedback_helpful ON solution_feedback(was_helpful);

-- =============================================================================
-- PATTERN RELATIONSHIPS (GRAPH EDGES)
-- =============================================================================

CREATE TABLE IF NOT EXISTS pattern_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_pattern_id UUID NOT NULL REFERENCES error_patterns(id) ON DELETE CASCADE,
    to_pattern_id UUID NOT NULL REFERENCES error_patterns(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    -- Types: 'similar', 'leads_to', 'caused_by', 'semantic', 'alternative'
    similarity_score DECIMAL(3,2) DEFAULT 0.0 CHECK (similarity_score >= 0 AND similarity_score <= 1),
    strength DECIMAL(3,2) DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT no_self_reference CHECK (from_pattern_id != to_pattern_id),
    UNIQUE(from_pattern_id, to_pattern_id, relationship_type)
);

CREATE INDEX idx_pattern_relationships_from ON pattern_relationships(from_pattern_id);
CREATE INDEX idx_pattern_relationships_to ON pattern_relationships(to_pattern_id);
CREATE INDEX idx_pattern_relationships_type ON pattern_relationships(relationship_type);
CREATE INDEX idx_pattern_relationships_score ON pattern_relationships(similarity_score DESC);

-- =============================================================================
-- TECHNOLOGIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    -- Categories: 'language', 'framework', 'library', 'database', 'tool'
    description TEXT,
    official_url TEXT,
    version VARCHAR(50),
    popularity_score INTEGER DEFAULT 0,
    pattern_count INTEGER DEFAULT 0,
    solution_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_technologies_slug ON technologies(slug);
CREATE INDEX idx_technologies_category ON technologies(category);
CREATE INDEX idx_technologies_popularity ON technologies(popularity_score DESC);

-- =============================================================================
-- TECHNOLOGY RELATIONSHIPS
-- =============================================================================

CREATE TABLE IF NOT EXISTS technology_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_tech_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
    to_tech_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    -- Types: 'dependency', 'alternative', 'complementary', 'migration_target'
    strength DECIMAL(3,2) DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT no_self_tech_reference CHECK (from_tech_id != to_tech_id),
    UNIQUE(from_tech_id, to_tech_id, relationship_type)
);

CREATE INDEX idx_technology_relationships_from ON technology_relationships(from_tech_id);
CREATE INDEX idx_technology_relationships_to ON technology_relationships(to_tech_id);
CREATE INDEX idx_technology_relationships_type ON technology_relationships(relationship_type);

-- =============================================================================
-- PATTERN SYNC HISTORY
-- =============================================================================

CREATE TABLE IF NOT EXISTS sync_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID NOT NULL REFERENCES instances(instance_id),
    sync_type VARCHAR(50) NOT NULL,
    -- Types: 'phase_completion', 'manual', 'error_resolution', 'scheduled'
    patterns_synced INTEGER DEFAULT 0,
    solutions_synced INTEGER DEFAULT 0,
    sync_status VARCHAR(20) NOT NULL CHECK (sync_status IN ('success', 'partial', 'failed')),
    error_message TEXT,
    duration_ms INTEGER,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_sync_history_instance ON sync_history(instance_id);
CREATE INDEX idx_sync_history_status ON sync_history(sync_status);
CREATE INDEX idx_sync_history_timestamp ON sync_history(synced_at DESC);

-- =============================================================================
-- LESSONS LEARNED
-- =============================================================================

CREATE TABLE IF NOT EXISTS lessons_learned (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    constellation VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    lesson TEXT NOT NULL,
    context TEXT,
    impact INTEGER DEFAULT 3 CHECK (impact >= 1 AND impact <= 5),
    language VARCHAR(50),
    framework VARCHAR(100),
    tags TEXT[] DEFAULT '{}'::text[],
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_instance UUID REFERENCES instances(instance_id),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_lessons_constellation ON lessons_learned(constellation);
CREATE INDEX idx_lessons_category ON lessons_learned(category);
CREATE INDEX idx_lessons_impact ON lessons_learned(impact DESC);
CREATE INDEX idx_lessons_language ON lessons_learned(language);
CREATE INDEX idx_lessons_tags ON lessons_learned USING GIN(tags);

-- =============================================================================
-- ANALYTICS & STATISTICS
-- =============================================================================

CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_date DATE NOT NULL UNIQUE,
    total_patterns INTEGER DEFAULT 0,
    new_patterns INTEGER DEFAULT 0,
    total_solutions INTEGER DEFAULT 0,
    new_solutions INTEGER DEFAULT 0,
    active_instances INTEGER DEFAULT 0,
    total_syncs INTEGER DEFAULT 0,
    avg_resolution_time_minutes DECIMAL(10,2),
    top_languages JSONB DEFAULT '{}'::jsonb,
    top_frameworks JSONB DEFAULT '{}'::jsonb,
    top_errors JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_stats_date ON daily_stats(stat_date DESC);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Update pattern occurrence count
CREATE OR REPLACE FUNCTION update_pattern_occurrence()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE error_patterns
    SET occurrence_count = occurrence_count + 1,
        last_seen = NOW()
    WHERE error_signature = NEW.pattern_signature;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update solution success rate based on feedback
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
    updated_at = NOW()
    WHERE id = NEW.solution_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update instance statistics
CREATE OR REPLACE FUNCTION update_instance_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE instances
    SET last_sync_at = NOW(),
        total_sync_count = total_sync_count + 1
    WHERE instance_id = NEW.instance_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER trigger_update_solution_success_rate
AFTER INSERT ON solution_feedback
FOR EACH ROW
EXECUTE FUNCTION update_solution_success_rate();

CREATE TRIGGER trigger_update_instance_stats
AFTER INSERT ON sync_history
FOR EACH ROW
EXECUTE FUNCTION update_instance_stats();

-- =============================================================================
-- INITIAL DATA / SEED
-- =============================================================================

-- Insert common technologies
INSERT INTO technologies (slug, name, category, description) VALUES
('rust', 'Rust', 'language', 'Systems programming language'),
('python', 'Python', 'language', 'High-level programming language'),
('javascript', 'JavaScript', 'language', 'Web programming language'),
('typescript', 'TypeScript', 'language', 'Typed JavaScript'),
('axum', 'Axum', 'framework', 'Rust web framework'),
('tokio', 'Tokio', 'framework', 'Async runtime for Rust'),
('react', 'React', 'framework', 'JavaScript UI library'),
('django', 'Django', 'framework', 'Python web framework'),
('postgresql', 'PostgreSQL', 'database', 'Relational database'),
('redis', 'Redis', 'database', 'In-memory data store'),
('docker', 'Docker', 'tool', 'Container platform'),
('vscode', 'VS Code', 'tool', 'Code editor')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Popular patterns view
CREATE OR REPLACE VIEW v_popular_patterns AS
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
CREATE OR REPLACE VIEW v_instance_leaderboard AS
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
CREATE OR REPLACE VIEW v_global_stats AS
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
-- GRANTS (adjust for your user)
-- =============================================================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nebula;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nebula;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO nebula;

-- =============================================================================
-- COMPLETION
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Nebula Central KG Database Schema initialized successfully';
    RAISE NOTICE '📊 Tables created: instances, error_patterns, solutions, pattern_relationships, technologies, lessons_learned';
    RAISE NOTICE '🔍 Indexes created for optimal query performance';
    RAISE NOTICE '⚙️  Triggers and functions configured';
    RAISE NOTICE '🌱 Seed data inserted for common technologies';
END $$;

