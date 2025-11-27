import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import crypto from "crypto";

function ensureDirectoryExists(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
}

export class StarChartStore {
  constructor(dbFilePath) {
    const dir = path.dirname(dbFilePath);
    ensureDirectoryExists(dir);
    this.db = new Database(dbFilePath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.initialize();
  }

  initialize() {
    const tx = this.db.transaction(() => {
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS nodes (
          id TEXT PRIMARY KEY,
          type TEXT,
          title TEXT,
          slug TEXT,
          phase INTEGER,
          constellation TEXT,
          x REAL,
          y REAL,
          z REAL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS edges (
          src TEXT,
          dst TEXT,
          type TEXT,
          weight REAL DEFAULT 1.0,
          PRIMARY KEY (src, dst, type)
        )
      `).run();

      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          node_id TEXT,
          phase INTEGER,
          status TEXT CHECK (status IN ('success','failure')),
          summary TEXT,
          details TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS lessons (
          id TEXT PRIMARY KEY,
          event_id TEXT,
          severity INTEGER,
          recommendation TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS tags (
          tag TEXT PRIMARY KEY
        )
      `).run();

      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS event_tags (
          event_id TEXT,
          tag TEXT,
          PRIMARY KEY (event_id, tag)
        )
      `).run();

      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS artifacts (
          id TEXT PRIMARY KEY,
          event_id TEXT,
          path TEXT,
          hash TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      try {
        this.db.prepare(`
          CREATE VIRTUAL TABLE IF NOT EXISTS events_fts
          USING fts5(summary, details, content='events', content_rowid='rowid')
        `).run();
      } catch (_) {
        // FTS may not be available; continue without it
      }
    });
    tx();
  }

  upsertNode({ id, type, title, slug, phase, constellation, x, y, z }) {
    const nodeId = id || crypto.randomUUID();
    this.db.prepare(`
      INSERT INTO nodes (id, type, title, slug, phase, constellation, x, y, z)
      VALUES (@id, @type, @title, @slug, @phase, @constellation, @x, @y, @z)
      ON CONFLICT(id) DO UPDATE SET
        type=excluded.type,
        title=excluded.title,
        slug=excluded.slug,
        phase=excluded.phase,
        constellation=excluded.constellation,
        x=excluded.x,
        y=excluded.y,
        z=excluded.z
    `).run({ id: nodeId, type, title, slug, phase, constellation, x, y, z });
    return nodeId;
  }

  placeNode({ id, x, y, z }) {
    this.db.prepare(`UPDATE nodes SET x=@x, y=@y, z=@z WHERE id=@id`).run({ id, x, y, z });
  }

  linkNodes({ src, dst, type, weight = 1.0 }) {
    this.db.prepare(`
      INSERT OR IGNORE INTO edges (src, dst, type, weight)
      VALUES (@src, @dst, @type, @weight)
    `).run({ src, dst, type, weight });
  }

  logEvent({ nodeId, phase, status, summary, details, tags = [], artifacts = [] }) {
    const id = crypto.randomUUID();
    const tx = this.db.transaction(() => {
      this.db.prepare(`
        INSERT INTO events (id, node_id, phase, status, summary, details)
        VALUES (@id, @node_id, @phase, @status, @summary, @details)
      `).run({ id, node_id: nodeId, phase, status, summary, details });

      try {
        this.db.prepare(`INSERT INTO events_fts(rowid, summary, details)
          SELECT rowid, summary, details FROM events WHERE id=@id`).run({ id });
      } catch (_) {
        // FTS disabled; skip
      }

      for (const tag of tags) {
        this.db.prepare(`INSERT OR IGNORE INTO tags(tag) VALUES (@tag)`).run({ tag });
        this.db.prepare(`INSERT OR IGNORE INTO event_tags(event_id, tag) VALUES (@event_id, @tag)`).run({ event_id: id, tag });
      }

      for (const art of artifacts) {
        const artId = crypto.randomUUID();
        this.db.prepare(`
          INSERT INTO artifacts (id, event_id, path, hash)
          VALUES (@id, @event_id, @path, @hash)
        `).run({ id: artId, event_id: id, path: art.path || null, hash: art.hash || null });
      }
    });
    tx();
    return id;
  }

  addLesson({ eventId, severity = 3, recommendation }) {
    const id = crypto.randomUUID();
    this.db.prepare(`
      INSERT INTO lessons (id, event_id, severity, recommendation)
      VALUES (@id, @event_id, @severity, @recommendation)
    `).run({ id, event_id: eventId, severity, recommendation });
    return id;
  }

  getLessonsForPhase({ phase, maxPhase = phase, tags = [] }) {
    const whereTags = tags.length > 0 ? `AND e.id IN (SELECT event_id FROM event_tags WHERE tag IN (${tags.map(() => '?').join(',')}))` : '';
    const stmt = this.db.prepare(`
      SELECT l.id as lesson_id, l.severity, l.recommendation,
             e.id as event_id, e.status, e.summary, e.details, e.phase
      FROM lessons l
      JOIN events e ON e.id = l.event_id
      WHERE e.phase BETWEEN ? AND ?
      ${whereTags}
      ORDER BY l.severity DESC, e.created_at DESC
    `);
    const rows = stmt.all(...[phase, maxPhase, ...tags]);
    return rows;
  }

  similarFailures({ text, tags = [], limit = 10 }) {
    try {
      const whereTags = tags.length > 0 ? `AND e.id IN (SELECT event_id FROM event_tags WHERE tag IN (${tags.map(() => '?').join(',')}))` : '';
      const stmt = this.db.prepare(`
        SELECT e.id, e.summary, e.details, e.phase, e.created_at
        FROM events e
        JOIN events_fts fts ON fts.rowid = e.rowid
        WHERE e.status = 'failure' AND fts MATCH ?
        ${whereTags}
        ORDER BY e.created_at DESC
        LIMIT ?
      `);
      return stmt.all(...[text, ...tags, limit]);
    } catch (_) {
      // Fallback to LIKE if FTS is unavailable
      const whereTags = tags.length > 0 ? `AND e.id IN (SELECT event_id FROM event_tags WHERE tag IN (${tags.map(() => '?').join(',')}))` : '';
      const stmt = this.db.prepare(`
        SELECT e.id, e.summary, e.details, e.phase, e.created_at
        FROM events e
        WHERE e.status = 'failure' AND (e.summary LIKE ? OR e.details LIKE ?)
        ${whereTags}
        ORDER BY e.created_at DESC
        LIMIT ?
      `);
      const like = `%${text}%`;
      return stmt.all(...[like, like, ...tags, limit]);
    }
  }

  neighbors({ nodeId, phaseRadius = null }) {
    const neighborIds = this.db.prepare(`
      SELECT DISTINCT CASE WHEN src = @id THEN dst ELSE src END AS nid
      FROM edges
      WHERE src = @id OR dst = @id
    `).all({ id: nodeId }).map(r => r.nid);

    if (neighborIds.length === 0) return [];

    const placeholders = neighborIds.map(() => '?').join(',');
    let query = `SELECT * FROM nodes WHERE id IN (${placeholders})`;
    const params = [...neighborIds];
    if (phaseRadius !== null) {
      query += ` AND ABS(phase - (SELECT phase FROM nodes WHERE id = ?)) <= ?`;
      params.push(nodeId, phaseRadius);
    }
    return this.db.prepare(query).all(...params);
  }
}

// Export alias for backwards compatibility
export { StarChartStore as StarChart };
