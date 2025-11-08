/**
 * Nebula Protocol - Central Knowledge Graph Sync
 * 
 * Syncs local project memory to central PostgreSQL KG.
 * Enables cross-project learning and solution sharing.
 */

import config from '../config/index.js';

export class CentralKGSync {
  constructor(postgresPool) {
    this.pool = postgresPool;
    this.enabled = config.features.centralKG;
  }

  /**
   * Extract error pattern for matching
   * Removes specific values to create generalized pattern
   */
  extractErrorPattern(error) {
    let pattern = error.message
      // Numbers -> N
      .replace(/\d+/g, 'N')
      // Variable names in backticks -> VAR
      .replace(/`[^`]+`/g, '`VAR`')
      // Variable names in single quotes -> VAR
      .replace(/'[^']+'/g, "'VAR'")
      // Variable names in double quotes -> VAR
      .replace(/"[^"]+"/g, '"VAR"')
      // File paths -> PATH
      .replace(/\/[\w\/\.\-]+/g, '/PATH')
      .replace(/[A-Z]:\\[\w\\\.\-]+/g, 'C:\\PATH')
      // Memory addresses -> ADDR
      .replace(/0x[0-9a-f]+/gi, '0xADDR')
      // UUIDs -> UUID
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID')
      // Ports -> PORT
      .replace(/:\d{2,5}\b/g, ':PORT');
    
    return pattern;
  }

  /**
   * Sync error to Central KG
   */
  async syncError(error, projectId, framework) {
    if (!this.enabled || !this.pool) return null;
    
    try {
      const pattern = this.extractErrorPattern(error);
      const errorCode = error.error_code || this.extractErrorCode(error.message);
      
      // Check if pattern already exists
      const existingPattern = await this.pool.query(
        'SELECT pattern_id FROM error_patterns WHERE pattern = $1 AND language = $2',
        [pattern, error.language]
      );
      
      let patternId;
      
      if (existingPattern.rows.length > 0) {
        // Increment occurrence count
        patternId = existingPattern.rows[0].pattern_id;
        await this.pool.query(
          'UPDATE error_patterns SET occurrence_count = occurrence_count + 1, last_seen = NOW() WHERE pattern_id = $1',
          [patternId]
        );
      } else {
        // Insert new pattern
        const result = await this.pool.query(`
          INSERT INTO error_patterns (language, error_code, pattern, description, severity)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING pattern_id
        `, [
          error.language,
          errorCode,
          pattern,
          error.message,
          error.level || 'ERROR'
        ]);
        
        patternId = result.rows[0].pattern_id;
      }
      
      // Record instance
      await this.pool.query(`
        INSERT INTO instances (instance_id, pattern_id, project_id, constellation, stack_trace, file_path, line_number, occurred_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
      `, [
        patternId,
        projectId,
        error.constellation,
        error.stack_trace,
        error.file_path,
        error.line_number
      ]);
      
      // Link technology/framework if not already linked
      if (framework) {
        await this.linkTechnology(patternId, framework);
      }
      
      return patternId;
    } catch (error) {
      console.error('Failed to sync error to Central KG:', error.message);
      return null;
    }
  }

  /**
   * Sync solution to Central KG
   */
  async syncSolution(solution, patternId) {
    if (!this.enabled || !this.pool || !patternId) return null;
    
    try {
      // Check if similar solution already exists
      const existingSolution = await this.pool.query(`
        SELECT solution_id, effectiveness_avg, times_applied 
        FROM solutions 
        WHERE pattern_id = $1 AND similarity(description, $2) > 0.8
        ORDER BY similarity(description, $2) DESC
        LIMIT 1
      `, [patternId, solution.description]);
      
      let solutionId;
      
      if (existingSolution.rows.length > 0) {
        // Update existing solution
        const existing = existingSolution.rows[0];
        solutionId = existing.solution_id;
        
        const newTimesApplied = existing.times_applied + 1;
        const newEffectiveness = (
          (existing.effectiveness_avg * existing.times_applied) + 
          (solution.effectiveness || 3)
        ) / newTimesApplied;
        
        await this.pool.query(`
          UPDATE solutions 
          SET times_applied = $1,
              effectiveness_avg = $2,
              last_used = NOW()
          WHERE solution_id = $3
        `, [newTimesApplied, newEffectiveness, solutionId]);
      } else {
        // Insert new solution
        const result = await this.pool.query(`
          INSERT INTO solutions (
            solution_id, pattern_id, description, code_changes, 
            effectiveness_avg, times_applied, applied_by
          )
          VALUES (gen_random_uuid(), $1, $2, $3, $4, 1, $5)
          RETURNING solution_id
        `, [
          patternId,
          solution.description,
          solution.code_changes,
          solution.effectiveness || 3,
          solution.applied_by || 'ai'
        ]);
        
        solutionId = result.rows[0].solution_id;
      }
      
      return solutionId;
    } catch (error) {
      console.error('Failed to sync solution to Central KG:', error.message);
      return null;
    }
  }

  /**
   * Query similar errors from Central KG
   */
  async querySimilarErrors(error, limit = 5) {
    if (!this.enabled || !this.pool) return [];
    
    try {
      const pattern = this.extractErrorPattern(error);
      
      const result = await this.pool.query(`
        SELECT 
          ep.pattern_id,
          ep.language,
          ep.error_code,
          ep.pattern,
          ep.description,
          ep.occurrence_count,
          ep.last_seen,
          s.solution_id,
          s.description as solution_description,
          s.code_changes,
          s.effectiveness_avg,
          s.times_applied,
          similarity(ep.pattern, $1) as match_score
        FROM error_patterns ep
        LEFT JOIN solutions s ON s.pattern_id = ep.pattern_id
        WHERE ep.language = $2
          AND similarity(ep.pattern, $1) > 0.3
        ORDER BY match_score DESC, s.effectiveness_avg DESC NULLS LAST
        LIMIT $3
      `, [pattern, error.language, limit]);
      
      return result.rows;
    } catch (error) {
      console.error('Failed to query similar errors:', error.message);
      return [];
    }
  }

  /**
   * Record solution feedback
   */
  async recordFeedback(solutionId, effective, notes = null) {
    if (!this.enabled || !this.pool) return;
    
    try {
      await this.pool.query(`
        INSERT INTO solution_feedback (feedback_id, solution_id, effective, notes, created_at)
        VALUES (gen_random_uuid(), $1, $2, $3, NOW())
      `, [solutionId, effective, notes]);
      
      // Update solution effectiveness
      const feedback = await this.pool.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN effective THEN 1 ELSE 0 END) as successful
        FROM solution_feedback
        WHERE solution_id = $1
      `, [solutionId]);
      
      const total = parseInt(feedback.rows[0].total);
      const successful = parseInt(feedback.rows[0].successful);
      const newEffectiveness = (successful / total) * 5; // Convert to 1-5 scale
      
      await this.pool.query(`
        UPDATE solutions
        SET effectiveness_avg = $1
        WHERE solution_id = $2
      `, [newEffectiveness, solutionId]);
    } catch (error) {
      console.error('Failed to record feedback:', error.message);
    }
  }

  /**
   * Link technology to pattern
   */
  async linkTechnology(patternId, techName) {
    if (!this.enabled || !this.pool) return;
    
    try {
      // Get or create technology
      let techResult = await this.pool.query(
        'SELECT tech_id FROM technologies WHERE name = $1',
        [techName]
      );
      
      let techId;
      
      if (techResult.rows.length === 0) {
        techResult = await this.pool.query(
          'INSERT INTO technologies (tech_id, name) VALUES (gen_random_uuid(), $1) RETURNING tech_id',
          [techName]
        );
      }
      
      techId = techResult.rows[0].tech_id;
      
      // Link pattern to technology (ignore if already linked)
      await this.pool.query(`
        INSERT INTO error_technologies (pattern_id, tech_id)
        VALUES ($1, $2)
        ON CONFLICT (pattern_id, tech_id) DO NOTHING
      `, [patternId, techId]);
    } catch (error) {
      console.error('Failed to link technology:', error.message);
    }
  }

  /**
   * Get lessons learned for constellation
   */
  async getLessonsLearned(constellation, language = null, limit = 10) {
    if (!this.enabled || !this.pool) return [];
    
    try {
      const query = language
        ? `SELECT * FROM lessons_learned 
           WHERE constellation = $1 AND language = $2 
           ORDER BY importance DESC 
           LIMIT $3`
        : `SELECT * FROM lessons_learned 
           WHERE constellation = $1 
           ORDER BY importance DESC 
           LIMIT $2`;
      
      const params = language 
        ? [constellation, language, limit]
        : [constellation, limit];
      
      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Failed to get lessons learned:', error.message);
      return [];
    }
  }

  /**
   * Record lesson learned
   */
  async recordLesson(lesson) {
    if (!this.enabled || !this.pool) return;
    
    try {
      await this.pool.query(`
        INSERT INTO lessons_learned (
          lesson_id, constellation, language, category, title, description, 
          solution, importance, created_at
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
      `, [
        lesson.constellation,
        lesson.language,
        lesson.category,
        lesson.title,
        lesson.description,
        lesson.solution,
        lesson.importance || 3
      ]);
    } catch (error) {
      console.error('Failed to record lesson:', error.message);
    }
  }

  /**
   * Extract error code from message
   */
  extractErrorCode(message) {
    // Rust: E0XXX
    const rustMatch = message.match(/E\d{4}/);
    if (rustMatch) return rustMatch[0];
    
    // Python: ErrorName
    const pythonMatch = message.match(/^(\w+Error):/);
    if (pythonMatch) return pythonMatch[1];
    
    // TypeScript/JavaScript: TS\d+
    const tsMatch = message.match(/TS\d+/);
    if (tsMatch) return tsMatch[0];
    
    // C++: C\d+
    const cppMatch = message.match(/C\d+/);
    if (cppMatch) return cppMatch[0];
    
    return null;
  }

  /**
   * Get statistics for dashboard
   */
  async getStatistics() {
    if (!this.enabled || !this.pool) return null;
    
    try {
      const stats = await this.pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM error_patterns) as total_patterns,
          (SELECT COUNT(*) FROM solutions) as total_solutions,
          (SELECT SUM(occurrence_count) FROM error_patterns) as total_occurrences,
          (SELECT AVG(effectiveness_avg) FROM solutions) as avg_effectiveness,
          (SELECT COUNT(DISTINCT language) FROM error_patterns) as languages_tracked
      `);
      
      return stats.rows[0];
    } catch (error) {
      console.error('Failed to get statistics:', error.message);
      return null;
    }
  }
}

