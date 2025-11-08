import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import crypto from "crypto";

function ensureDirectoryExists(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
}

export class ProjectMemory {
  constructor(projectPath, projectName = null, framework = null) {
    this.projectPath = projectPath;
    const dataDir = path.join(projectPath, ".nebula");
    const dbPath = path.join(dataDir, "project_memory.sqlite");
    
    ensureDirectoryExists(dataDir);
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    
    this.initialize();
    
    if (projectName && framework) {
      this.initializeProject(projectName, framework);
    }
  }

  initialize() {
    const tx = this.db.transaction(() => {
      // Project information
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS project_info (
          project_id TEXT PRIMARY KEY,
          name TEXT,
          framework TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          current_version TEXT DEFAULT '0.0.0.0',
          version_constellation INTEGER DEFAULT 0,
          version_star_system INTEGER DEFAULT 0,
          version_quality_gate INTEGER DEFAULT 0,
          version_patch INTEGER DEFAULT 0,
          current_phase TEXT,
          current_constellation TEXT,
          current_star_system TEXT,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Error logging
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS error_log (
          id TEXT PRIMARY KEY,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
          level TEXT CHECK (level IN ('ERROR','CRITICAL')),
          phase TEXT,
          constellation TEXT,
          file_path TEXT,
          line_number INTEGER,
          error_code TEXT,
          message TEXT,
          stack_trace TEXT,
          context_json TEXT,
          resolved BOOLEAN DEFAULT 0,
          resolution_id TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Error solutions
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS error_solutions (
          id TEXT PRIMARY KEY,
          error_id TEXT,
          solution_description TEXT,
          code_changes TEXT,
          applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
          applied_by TEXT CHECK (applied_by IN ('ai','human')),
          effectiveness INTEGER CHECK (effectiveness BETWEEN 1 AND 5),
          notes TEXT,
          FOREIGN KEY (error_id) REFERENCES error_log(id)
        )
      `).run();

      // Error patterns
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS error_patterns (
          id TEXT PRIMARY KEY,
          pattern_signature TEXT UNIQUE,
          error_type TEXT,
          common_cause TEXT,
          recommended_solution TEXT,
          occurrences INTEGER DEFAULT 1,
          last_seen TEXT DEFAULT CURRENT_TIMESTAMP,
          success_rate REAL DEFAULT 0.0
        )
      `).run();

      // Architectural decisions
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS decisions (
          id TEXT PRIMARY KEY,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
          phase TEXT,
          constellation TEXT,
          decision_type TEXT,
          question TEXT,
          chosen_option TEXT,
          alternatives_considered TEXT,
          rationale TEXT,
          made_by TEXT CHECK (made_by IN ('ai','human'))
        )
      `).run();

      // Star Gates (Quality gates with enhanced tracking)
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS star_gates (
          id TEXT PRIMARY KEY,
          constellation TEXT,
          constellation_number INTEGER,
          completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
          status TEXT CHECK (status IN ('passed','failed','pending','skipped')),
          tests_automated INTEGER DEFAULT 0,
          tests_automated_passing INTEGER DEFAULT 0,
          tests_manual INTEGER DEFAULT 0,
          tests_manual_passing INTEGER DEFAULT 0,
          tests_skipped INTEGER DEFAULT 0,
          skip_reasons TEXT,
          duration_minutes INTEGER,
          performance_acceptable BOOLEAN DEFAULT 1,
          docs_updated BOOLEAN DEFAULT 1,
          breaking_changes BOOLEAN DEFAULT 0,
          breaking_changes_notes TEXT,
          notes TEXT,
          reviewer TEXT,
          reviewer_type TEXT CHECK (reviewer_type IN ('human','ai','system'))
        )
      `).run();
      
      // Legacy quality_gates table (keep for backward compatibility)
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS quality_gates (
          id TEXT PRIMARY KEY,
          constellation TEXT,
          completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
          passed BOOLEAN,
          issues_found INTEGER,
          sub_phase_created TEXT,
          notes TEXT,
          reviewer TEXT
        )
      `).run();

      // Context snapshots
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS context_snapshots (
          id TEXT PRIMARY KEY,
          phase TEXT,
          constellation TEXT,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
          active_files TEXT,
          key_decisions TEXT,
          open_issues TEXT,
          next_steps TEXT,
          session_duration INTEGER
        )
      `).run();

      // Version history
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS version_history (
          id TEXT PRIMARY KEY,
          version TEXT,
          phase TEXT,
          constellation TEXT,
          bumped_at TEXT DEFAULT CURRENT_TIMESTAMP,
          changelog TEXT,
          git_tag TEXT
        )
      `).run();

      // Indexes for performance
      try {
        this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_error_log_phase ON error_log(phase)`).run();
        this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_error_log_resolved ON error_log(resolved)`).run();
        this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_error_log_timestamp ON error_log(timestamp)`).run();
        this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_error_patterns_signature ON error_patterns(pattern_signature)`).run();
        this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_decisions_phase ON decisions(phase)`).run();
        this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_quality_gates_constellation ON quality_gates(constellation)`).run();
        this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_star_gates_constellation ON star_gates(constellation)`).run();
        this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_star_gates_status ON star_gates(status)`).run();
      } catch (error) {
        // Indexes may already exist
      }

      // Full-text search for errors
      try {
        this.db.prepare(`
          CREATE VIRTUAL TABLE IF NOT EXISTS error_log_fts
          USING fts5(message, stack_trace, content='error_log', content_rowid='rowid')
        `).run();
      } catch (error) {
        // FTS may not be available
      }
    });
    tx();
  }

  initializeProject(name, framework) {
    const projectId = crypto.randomUUID();
    try {
      this.db.prepare(`
        INSERT INTO project_info (project_id, name, framework)
        VALUES (?, ?, ?)
      `).run(projectId, name, framework);
    } catch (error) {
      // Project may already exist
    }
    return projectId;
  }

  updateProjectInfo(updates) {
    const { version, phase, constellation, starSystem } = updates;
    this.db.prepare(`
      UPDATE project_info
      SET current_version = COALESCE(?, current_version),
          current_phase = COALESCE(?, current_phase),
          current_constellation = COALESCE(?, current_constellation),
          current_star_system = COALESCE(?, current_star_system),
          updated_at = CURRENT_TIMESTAMP
      WHERE project_id = (SELECT project_id FROM project_info LIMIT 1)
    `).run(version || null, phase || null, constellation || null, starSystem || null);
  }

  // Version management: CONSTELLATION.STAR_SYSTEM.QUALITY_GATE.PATCH
  getVersion() {
    const info = this.db.prepare(`
      SELECT current_version, version_constellation, version_star_system, 
             version_quality_gate, version_patch
      FROM project_info LIMIT 1
    `).get();
    
    if (!info) {
      return { version: '0.0.0.0', constellation: 0, starSystem: 0, qualityGate: 0, patch: 0 };
    }
    
    return {
      version: info.current_version,
      constellation: info.version_constellation,
      starSystem: info.version_star_system,
      qualityGate: info.version_quality_gate,
      patch: info.version_patch
    };
  }

  bumpVersion(component = 'patch', resetLower = true) {
    const current = this.getVersion();
    let { constellation, starSystem, qualityGate, patch } = current;

    switch (component) {
      case 'constellation':
        constellation += 1;
        if (resetLower) {
          starSystem = 0;
          qualityGate = 0;
          patch = 0;
        }
        break;
      case 'star_system':
        starSystem += 1;
        if (resetLower) {
          qualityGate = 0;
          patch = 0;
        }
        break;
      case 'quality_gate':
        qualityGate += 1;
        if (resetLower) {
          patch = 0;
        }
        break;
      case 'patch':
        patch += 1;
        break;
      default:
        throw new Error(`Unknown version component: ${component}`);
    }

    const version = `${constellation}.${starSystem}.${qualityGate}.${patch}`;
    
    this.db.prepare(`
      UPDATE project_info
      SET current_version = ?,
          version_constellation = ?,
          version_star_system = ?,
          version_quality_gate = ?,
          version_patch = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE project_id = (SELECT project_id FROM project_info LIMIT 1)
    `).run(version, constellation, starSystem, qualityGate, patch);

    // Log version bump
    this.recordDecision({
      title: `Version bump: ${component}`,
      decision: `Bumped ${component} version to ${version}`,
      rationale: `Automated version bump after ${component} completion`,
      phase: current.constellation.toString(),
      constellation: current.constellation.toString()
    });

    return { version, constellation, starSystem, qualityGate, patch };
  }

  setVersion(constellation, starSystem, qualityGate, patch) {
    const version = `${constellation}.${starSystem}.${qualityGate}.${patch}`;
    
    this.db.prepare(`
      UPDATE project_info
      SET current_version = ?,
          version_constellation = ?,
          version_star_system = ?,
          version_quality_gate = ?,
          version_patch = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE project_id = (SELECT project_id FROM project_info LIMIT 1)
    `).run(version, constellation, starSystem, qualityGate, patch);

    return { version, constellation, starSystem, qualityGate, patch };
  }

  logError({ level, phase, constellation, filePath, lineNumber, errorCode, message, stackTrace, context }) {
    const id = crypto.randomUUID();
    const contextJson = context ? JSON.stringify(context) : null;
    
    const tx = this.db.transaction(() => {
      // Insert error
      this.db.prepare(`
        INSERT INTO error_log (id, level, phase, constellation, file_path, line_number, error_code, message, stack_trace, context_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, level, phase, constellation, filePath || null, lineNumber || null, errorCode || null, message, stackTrace || null, contextJson);

      // Update FTS index
      try {
        this.db.prepare(`
          INSERT INTO error_log_fts(rowid, message, stack_trace)
          SELECT rowid, message, stack_trace FROM error_log WHERE id = ?
        `).run(id);
      } catch (error) {
        // FTS disabled
      }

      // Check for pattern
      const signature = this.generateErrorSignature(message, errorCode);
      const pattern = this.db.prepare(`
        SELECT id, occurrences, recommended_solution FROM error_patterns WHERE pattern_signature = ?
      `).get(signature);

      if (pattern) {
        // Update existing pattern
        this.db.prepare(`
          UPDATE error_patterns
          SET occurrences = occurrences + 1,
              last_seen = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(pattern.id);
        
        return {
          errorId: id,
          patternFound: true,
          occurrences: pattern.occurrences + 1,
          recommendedSolution: pattern.recommended_solution
        };
      } else {
        // Create new pattern
        const patternId = crypto.randomUUID();
        this.db.prepare(`
          INSERT INTO error_patterns (id, pattern_signature, error_type, common_cause)
          VALUES (?, ?, ?, ?)
        `).run(patternId, signature, errorCode || 'UNKNOWN', message.substring(0, 200));
        
        return {
          errorId: id,
          patternFound: false,
          occurrences: 1
        };
      }
    });
    
    return tx();
  }

  generateErrorSignature(message, errorCode) {
    // Normalize error message for pattern matching
    const normalized = message
      .toLowerCase()
      .replace(/\d+/g, 'N') // Replace numbers
      .replace(/['"]/g, '') // Remove quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    const base = errorCode ? `${errorCode}:${normalized}` : normalized;
    return crypto.createHash('md5').update(base).digest('hex');
  }

  recordSolution({ errorId, solution, codeChanges, appliedBy, effectiveness, notes }) {
    const id = crypto.randomUUID();
    
    const tx = this.db.transaction(() => {
      // Insert solution
      this.db.prepare(`
        INSERT INTO error_solutions (id, error_id, solution_description, code_changes, applied_by, effectiveness, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, errorId, solution, codeChanges || null, appliedBy, effectiveness || null, notes || null);

      // Mark error as resolved
      this.db.prepare(`
        UPDATE error_log SET resolved = 1, resolution_id = ? WHERE id = ?
      `).run(id, errorId);

      // Update pattern with solution if effectiveness is good
      if (effectiveness && effectiveness >= 4) {
        const error = this.db.prepare(`
          SELECT message, error_code FROM error_log WHERE id = ?
        `).get(errorId);
        
        if (error) {
          const signature = this.generateErrorSignature(error.message, error.error_code);
          this.db.prepare(`
            UPDATE error_patterns
            SET recommended_solution = ?,
                success_rate = (
                  SELECT AVG(effectiveness) / 5.0
                  FROM error_solutions es
                  JOIN error_log el ON el.resolution_id = es.id
                  JOIN error_patterns ep ON ep.pattern_signature = ?
                  WHERE el.id = es.error_id
                )
            WHERE pattern_signature = ?
          `).run(solution, signature, signature);
        }
      }
    });
    
    tx();
    return id;
  }

  findSimilarErrors({ text, phase, tags = [], limit = 10 }) {
    try {
      const phaseFilter = phase ? `AND phase = ?` : '';
      const params = phase ? [text, phase, limit] : [text, limit];
      
      const stmt = this.db.prepare(`
        SELECT el.id, el.message, el.phase, el.constellation, el.timestamp, el.resolved,
               es.solution_description, es.effectiveness
        FROM error_log el
        JOIN error_log_fts fts ON fts.rowid = el.rowid
        LEFT JOIN error_solutions es ON es.id = el.resolution_id
        WHERE fts MATCH ?
        ${phaseFilter}
        ORDER BY el.timestamp DESC
        LIMIT ?
      `);
      
      return stmt.all(...params);
    } catch (error) {
      // Fallback to LIKE search if FTS unavailable
      const likePattern = `%${text}%`;
      const phaseFilter = phase ? `AND phase = ?` : '';
      const params = phase ? [likePattern, likePattern, phase, limit] : [likePattern, likePattern, limit];
      
      const stmt = this.db.prepare(`
        SELECT el.id, el.message, el.phase, el.constellation, el.timestamp, el.resolved,
               es.solution_description, es.effectiveness
        FROM error_log el
        LEFT JOIN error_solutions es ON es.id = el.resolution_id
        WHERE (el.message LIKE ? OR el.stack_trace LIKE ?)
        ${phaseFilter}
        ORDER BY el.timestamp DESC
        LIMIT ?
      `);
      
      return stmt.all(...params);
    }
  }

  getErrorPatterns({ errorType, minOccurrences = 2 }) {
    const typeFilter = errorType ? `WHERE error_type = ?` : '';
    const params = errorType ? [errorType, minOccurrences] : [minOccurrences];
    
    const stmt = this.db.prepare(`
      SELECT id, error_type, common_cause, recommended_solution, occurrences, last_seen, success_rate
      FROM error_patterns
      ${typeFilter}
      ${typeFilter ? 'AND' : 'WHERE'} occurrences >= ?
      ORDER BY occurrences DESC, last_seen DESC
    `);
    
    return stmt.all(...params);
  }

  recordDecision({ phase, constellation, decisionType, question, chosenOption, alternatives, rationale, madeBy }) {
    const id = crypto.randomUUID();
    this.db.prepare(`
      INSERT INTO decisions (id, phase, constellation, decision_type, question, chosen_option, alternatives_considered, rationale, made_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, phase, constellation, decisionType, question, chosenOption, JSON.stringify(alternatives), rationale, madeBy);
    return id;
  }

  getDecisions({ phase, decisionType, limit = 50 }) {
    let query = `SELECT * FROM decisions WHERE 1=1`;
    const params = [];
    
    if (phase) {
      query += ` AND phase = ?`;
      params.push(phase);
    }
    if (decisionType) {
      query += ` AND decision_type = ?`;
      params.push(decisionType);
    }
    
    query += ` ORDER BY timestamp DESC LIMIT ?`;
    params.push(limit);
    
    return this.db.prepare(query).all(...params);
  }

  // Star Gate recording (new enhanced version)
  recordStarGate({
    constellation,
    constellationNumber,
    status,
    testsAutomated = 0,
    testsAutomatedPassing = 0,
    testsManual = 0,
    testsManualPassing = 0,
    testsSkipped = 0,
    skipReasons = [],
    durationMinutes,
    performanceAcceptable = true,
    docsUpdated = true,
    breakingChanges = false,
    breakingChangesNotes = null,
    notes,
    reviewer,
    reviewerType = 'human'
  }) {
    const id = crypto.randomUUID();
    this.db.prepare(`
      INSERT INTO star_gates (
        id, constellation, constellation_number, status,
        tests_automated, tests_automated_passing,
        tests_manual, tests_manual_passing,
        tests_skipped, skip_reasons, duration_minutes,
        performance_acceptable, docs_updated,
        breaking_changes, breaking_changes_notes,
        notes, reviewer, reviewer_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, constellation, constellationNumber, status,
      testsAutomated, testsAutomatedPassing,
      testsManual, testsManualPassing,
      testsSkipped, JSON.stringify(skipReasons), durationMinutes,
      performanceAcceptable ? 1 : 0, docsUpdated ? 1 : 0,
      breakingChanges ? 1 : 0, breakingChangesNotes,
      notes, reviewer, reviewerType
    );
    
    // Log warning if tests were skipped
    if (testsSkipped > 0) {
      console.warn(`⚠️  Star Gate ${constellation}: ${testsSkipped} tests skipped`);
      console.warn(`   Reasons: ${skipReasons.join(', ')}`);
    }
    
    return id;
  }

  getStarGates({ constellation, status }) {
    let query = `SELECT * FROM star_gates WHERE 1=1`;
    const params = [];
    
    if (constellation) {
      query += ` AND constellation = ?`;
      params.push(constellation);
    }
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY completed_at DESC`;
    
    return this.db.prepare(query).all(...params);
  }

  getStarGateStats() {
    return {
      total: this.db.prepare(`SELECT COUNT(*) as count FROM star_gates`).get().count,
      passed: this.db.prepare(`SELECT COUNT(*) as count FROM star_gates WHERE status = 'passed'`).get().count,
      failed: this.db.prepare(`SELECT COUNT(*) as count FROM star_gates WHERE status = 'failed'`).get().count,
      skipped: this.db.prepare(`SELECT COUNT(*) as count FROM star_gates WHERE status = 'skipped'`).get().count,
      testsSkippedTotal: this.db.prepare(`SELECT SUM(tests_skipped) as total FROM star_gates`).get().total || 0
    };
  }

  // Legacy quality gate support (backward compatibility)
  recordQualityGate({ constellation, passed, issuesFound, subPhaseCreated, notes, reviewer }) {
    const id = crypto.randomUUID();
    this.db.prepare(`
      INSERT INTO quality_gates (id, constellation, passed, issues_found, sub_phase_created, notes, reviewer)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, constellation, passed ? 1 : 0, issuesFound, subPhaseCreated || null, notes, reviewer || 'system');
    return id;
  }

  getQualityGates({ constellation }) {
    const filter = constellation ? `WHERE constellation = ?` : '';
    const params = constellation ? [constellation] : [];
    
    const stmt = this.db.prepare(`
      SELECT * FROM quality_gates
      ${filter}
      ORDER BY completed_at DESC
    `);
    
    return stmt.all(...params);
  }

  saveContextSnapshot({ phase, constellation, activeFiles, keyDecisions, openIssues, nextSteps, sessionDuration }) {
    const id = crypto.randomUUID();
    this.db.prepare(`
      INSERT INTO context_snapshots (id, phase, constellation, active_files, key_decisions, open_issues, next_steps, session_duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      phase,
      constellation,
      JSON.stringify(activeFiles),
      JSON.stringify(keyDecisions),
      JSON.stringify(openIssues),
      nextSteps,
      sessionDuration || null
    );
    return id;
  }

  getLatestContextSnapshot({ phase }) {
    const filter = phase ? `WHERE phase = ?` : '';
    const params = phase ? [phase] : [];
    
    const stmt = this.db.prepare(`
      SELECT * FROM context_snapshots
      ${filter}
      ORDER BY timestamp DESC
      LIMIT 1
    `);
    
    const snapshot = stmt.get(...params);
    
    if (snapshot) {
      return {
        ...snapshot,
        active_files: JSON.parse(snapshot.active_files),
        key_decisions: JSON.parse(snapshot.key_decisions),
        open_issues: JSON.parse(snapshot.open_issues)
      };
    }
    
    return null;
  }

  recordVersionBump({ version, phase, constellation, changelog, gitTag }) {
    const id = crypto.randomUUID();
    
    const tx = this.db.transaction(() => {
      // Record version history
      this.db.prepare(`
        INSERT INTO version_history (id, version, phase, constellation, changelog, git_tag)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, version, phase, constellation, changelog || null, gitTag || null);

      // Update project info
      this.updateProjectInfo({ version });
    });
    
    tx();
    return id;
  }

  getVersionHistory({ limit = 20 }) {
    return this.db.prepare(`
      SELECT * FROM version_history
      ORDER BY bumped_at DESC
      LIMIT ?
    `).all(limit);
  }

  getProjectInfo() {
    return this.db.prepare(`
      SELECT * FROM project_info LIMIT 1
    `).get();
  }

  getStatistics() {
    const starGateStats = this.getStarGateStats();
    
    const stats = {
      totalErrors: this.db.prepare(`SELECT COUNT(*) as count FROM error_log`).get().count,
      unresolvedErrors: this.db.prepare(`SELECT COUNT(*) as count FROM error_log WHERE resolved = 0`).get().count,
      errorPatterns: this.db.prepare(`SELECT COUNT(*) as count FROM error_patterns`).get().count,
      decisions: this.db.prepare(`SELECT COUNT(*) as count FROM decisions`).get().count,
      qualityGates: this.db.prepare(`SELECT COUNT(*) as count FROM quality_gates`).get().count,
      passedQualityGates: this.db.prepare(`SELECT COUNT(*) as count FROM quality_gates WHERE passed = 1`).get().count,
      starGates: starGateStats.total,
      starGatesPassed: starGateStats.passed,
      starGatesFailed: starGateStats.failed,
      starGatesSkipped: starGateStats.skipped,
      testsSkipped: starGateStats.testsSkippedTotal,
      currentVersion: null,
      currentPhase: null
    };
    
    const projectInfo = this.getProjectInfo();
    if (projectInfo) {
      stats.currentVersion = projectInfo.current_version;
      stats.currentPhase = projectInfo.current_phase;
    }
    
    return stats;
  }

  exportToJSON(outputPath) {
    const data = {
      project_info: this.getProjectInfo(),
      error_log: this.db.prepare(`SELECT * FROM error_log ORDER BY timestamp DESC`).all(),
      error_solutions: this.db.prepare(`SELECT * FROM error_solutions ORDER BY applied_at DESC`).all(),
      error_patterns: this.db.prepare(`SELECT * FROM error_patterns ORDER BY occurrences DESC`).all(),
      decisions: this.db.prepare(`SELECT * FROM decisions ORDER BY timestamp DESC`).all(),
      quality_gates: this.db.prepare(`SELECT * FROM quality_gates ORDER BY completed_at DESC`).all(),
      context_snapshots: this.db.prepare(`SELECT * FROM context_snapshots ORDER BY timestamp DESC LIMIT 10`).all(),
      version_history: this.db.prepare(`SELECT * FROM version_history ORDER BY bumped_at DESC`).all()
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    return outputPath;
  }

  close() {
    this.db.close();
  }
}

