"""
Local Knowledge Graph Implementation (Universal Adapter)
Captures errors, solutions, and context locally using the Universal Schema (v1.1).
"""
import sqlite3
import json
import hashlib
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

# Universal Schema Paths
DB_PATH = "local_kg/universal_memory.sqlite"

class LocalKG:
    """
    Local Knowledge Graph for offline pattern/solution storage.
    Refactored to use the Universal Schema (events, patterns).
    """
    
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = None
        self._initialize()
    
    def _initialize(self):
        """Connect to Universal Database"""
        self.conn = sqlite3.connect(str(self.db_path))
        self.conn.row_factory = sqlite3.Row
        # Ensure foreign keys are on (though Universal Schema relies less on them)
        self.conn.execute("PRAGMA foreign_keys = ON")
        
    def capture_error(
        self,
        error_signature: str,
        error_category: Optional[str] = None,
        description: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        severity: str = "medium"
    ) -> str:
        """
        Capture an error event and update pattern stats.
        """
        cursor = self.conn.cursor()
        
        # 1. Generate Signature
        # If not provided, hash the description
        sig = error_signature or hashlib.md5((description or "").encode()).hexdigest()
        
        # 2. Log Event (The "Stream")
        event_id = str(uuid.uuid4())
        meta = {
            "severity": severity,
            "category": error_category,
            "context": context,
            "signature": sig
        }
        
        cursor.execute(
            """INSERT INTO events (id, type, phase, content, metadata)
               VALUES (?, 'error', ?, ?, ?)""",
            (
                event_id,
                "UNKNOWN", # Phase tracking not native to this CLI tool yet
                description or f"Error: {error_category}",
                json.dumps(meta, default=str) # Safe JSON dump handling dates/etc
            )
        )
        
        # 3. Manage Pattern (The "Knowledge")
        cursor.execute("SELECT id FROM patterns WHERE signature = ?", (sig,))
        existing = cursor.fetchone()
        
        if existing:
            cursor.execute(
                """UPDATE patterns 
                   SET occurrence_count = occurrence_count + 1,
                       last_seen_at = CURRENT_TIMESTAMP
                   WHERE id = ?""",
                (existing['id'],)
            )
        else:
            pattern_id = str(uuid.uuid4())
            cursor.execute(
                """INSERT INTO patterns (id, signature, category, description, occurrence_count)
                   VALUES (?, ?, ?, ?, 1)""",
                (pattern_id, sig, error_category, description)
            )
            
        self.conn.commit()
        return event_id

    def add_solution(
        self,
        error_signature: str,
        solution_text: str,
        effectiveness: int = 3
    ) -> str:
        """
        Record a solution for a known error pattern.
        """
        cursor = self.conn.cursor()
        event_id = str(uuid.uuid4())
        
        # 1. Log Solution Event
        meta = {
            "effectiveness": effectiveness,
            "target_signature": error_signature
        }
        
        cursor.execute(
            """INSERT INTO events (id, type, phase, content, metadata)
               VALUES (?, 'solution', 'UNKNOWN', ?, ?)""",
            (event_id, solution_text, json.dumps(meta, default=str))
        )
        
        # 2. Update Pattern (if it works well)
        if effectiveness >= 4:
            cursor.execute(
                """UPDATE patterns 
                   SET solution = ? 
                   WHERE signature = ?""",
                (solution_text, error_signature)
            )
            
        self.conn.commit()
        return event_id

    def generate_context_summary(self) -> str:
        """
        Analyzes recent events to generate a high-level summary for LLM injection.
        Updates project_info.context_window_summary.
        """
        cursor = self.conn.cursor()
        
        # Get recent stats
        cursor.execute("SELECT COUNT(*) as count FROM events WHERE type='error' AND created_at > datetime('now', '-1 day')")
        recent_errors = cursor.fetchone()['count']
        
        cursor.execute("SELECT content FROM events WHERE type='milestone' ORDER BY created_at DESC LIMIT 1")
        last_milestone = cursor.fetchone()
        last_milestone_text = last_milestone['content'] if last_milestone else "Project Initialized"
        
        # Construct Summary
        summary = (
            f"Project Status: ACTIVE. "
            f"Recent Errors (24h): {recent_errors}. "
            f"Last Milestone: {last_milestone_text}. "
            f"Database: Universal Schema v1.1 (SQLite)."
        )
        
        # Update DB
        cursor.execute(
            """UPDATE project_info 
               SET context_window_summary = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE rowid = (SELECT rowid FROM project_info LIMIT 1)""",
            (summary,)
        )
        
        self.conn.commit()
        return summary

    def get_recent_events(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Retrieve recent events for context."""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT * FROM events ORDER BY created_at DESC LIMIT ?", 
            (limit,)
        )
        return [dict(row) for row in cursor.fetchall()]

    # --- Metrics Engine (C3) ---
    def get_advanced_stats(self) -> Dict[str, Any]:
        """
        Calculates Velocity, Quality, and AI Effectiveness metrics.
        """
        cursor = self.conn.cursor()
        stats = {}
        
        # 1. Quality (Errors per Milestone)
        cursor.execute("SELECT COUNT(*) FROM events WHERE type='error'")
        error_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM events WHERE type='milestone'")
        milestone_count = cursor.fetchone()[0]
        
        # Prevent division by zero
        stats['quality_ratio'] = round(error_count / max(milestone_count, 1), 2)
        
        # 2. AI Effectiveness
        # Extract effectiveness from metadata JSON where type='solution'
        # SQLite JSON support required
        cursor.execute("""
            SELECT AVG(json_extract(metadata, '$.effectiveness')) 
            FROM events 
            WHERE type='solution' 
            AND json_extract(metadata, '$.effectiveness') IS NOT NULL
        """)
        result = cursor.fetchone()[0]
        stats['ai_effectiveness'] = round(result, 2) if result else 0.0
        
        # 3. Velocity (Simplified: Events in last 24h)
        cursor.execute("SELECT COUNT(*) FROM events WHERE created_at > datetime('now', '-1 day')")
        stats['daily_velocity'] = cursor.fetchone()[0]
        
        return stats

    # --- Seeding Engine (C3) ---
    def seed_knowledge(self, framework: str):
        """
        Populates the patterns table with framework-specific seeds.
        """
        seed_file = self.db_path.parent / "seeds" / f"{framework}.sql"
        
        if not seed_file.exists():
            print(f"❌ No seed file found for: {framework} ({seed_file})")
            return False
            
        try:
            with open(seed_file, 'r') as f:
                sql_script = f.read()
                
            self.conn.executescript(sql_script)
            self.conn.commit()
            print(f"[SUCCESS] Successfully seeded knowledge for: {framework}")
            return True
        except Exception as e:
            print(f"[ERROR] Seeding failed: {e}")
            return False

    def close(self):
        if self.conn:
            self.conn.close()

# Singleton accessor
_local_kg_instance = None

def get_local_kg(db_path: str = DB_PATH) -> LocalKG:
    global _local_kg_instance
    if _local_kg_instance is None:
        _local_kg_instance = LocalKG(db_path)
    return _local_kg_instance

if __name__ == "__main__":
    # Simple CLI for testing
    import sys
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        kg = get_local_kg()
        
        if cmd == "update-context":
            print(f"Updated Context: {kg.generate_context_summary()}")
            
        elif cmd == "stats":
            stats = kg.get_advanced_stats()
            print("\n[NEBULA METRICS]")
            print(f"Quality Ratio:    {stats['quality_ratio']} errors/milestone (Lower is better)")
            print(f"AI Effectiveness: {stats['ai_effectiveness']}/5.0")
            print(f"Daily Velocity:   {stats['daily_velocity']} events/24h")
            
        elif cmd == "seed":
            if len(sys.argv) < 3:
                print("Usage: python local_kg.py seed <framework>")
            else:
                kg.seed_knowledge(sys.argv[2])
                
        else:
            print(f"Unknown command: {cmd}")
    else:
        print("Usage: python local_kg.py [update-context|stats|seed <framework>]")
