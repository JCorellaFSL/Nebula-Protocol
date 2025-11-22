"""
Local Knowledge Graph Implementation
Captures errors and solutions locally, syncs to Central KG

This serves as the reference implementation for:
- Nebula IDE local KG
- Nebula Protocol local KG
- Any other tool wanting to maintain a local pattern cache
"""
import sqlite3
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from uuid import uuid4

class LocalKG:
    """Local Knowledge Graph for offline pattern/solution storage"""
    
    def __init__(self, db_path: str = "local_kg/nebula_kg_local.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = None
        self._initialize()
    
    def _initialize(self):
        """Initialize database with schema"""
        self.conn = sqlite3.connect(str(self.db_path))
        self.conn.row_factory = sqlite3.Row
        
        # Load and execute schema
        schema_path = self.db_path.parent / "schema.sql"
        if schema_path.exists():
            with open(schema_path, 'r') as f:
                self.conn.executescript(f.read())
        self.conn.commit()
    
    def capture_error(
        self,
        error_signature: str,
        error_category: Optional[str] = None,
        language: Optional[str] = None,
        description: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        technologies: Optional[List[str]] = None,
        severity: str = "medium"
    ) -> str:
        """
        Capture an error pattern
        
        Args:
            error_signature: Unique identifier for the error (e.g., exception message)
            error_category: Category (e.g., 'DatabaseError', 'ConfigurationError')
            language: Programming language
            description: Human-readable description
            context: Additional context (stack trace, file paths, etc.)
            technologies: List of technology slugs involved
            severity: Error severity (low, medium, high, critical)
        
        Returns:
            Pattern ID
        """
        # Generate deterministic ID from signature
        pattern_id = hashlib.md5(error_signature.encode()).hexdigest()
        
        cursor = self.conn.cursor()
        
        # Check if pattern exists
        cursor.execute(
            "SELECT id, occurrence_count FROM local_patterns WHERE id = ?",
            (pattern_id,)
        )
        existing = cursor.fetchone()
        
        if existing:
            # Update occurrence count
            cursor.execute(
                """UPDATE local_patterns 
                   SET occurrence_count = occurrence_count + 1,
                       last_seen_at = datetime('now')
                   WHERE id = ?""",
                (pattern_id,)
            )
        else:
            # Insert new pattern
            cursor.execute(
                """INSERT INTO local_patterns 
                   (id, error_signature, error_category, language, description, 
                    context_json, severity)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    pattern_id,
                    error_signature,
                    error_category,
                    language,
                    description,
                    json.dumps(context) if context else None,
                    severity
                )
            )
            
            # Link technologies
            if technologies:
                for tech_slug in technologies:
                    cursor.execute(
                        """INSERT OR IGNORE INTO local_pattern_technologies 
                           (pattern_id, technology_slug)
                           VALUES (?, ?)""",
                        (pattern_id, tech_slug)
                    )
        
        self.conn.commit()
        return pattern_id
    
    def add_solution(
        self,
        pattern_id: str,
        title: str,
        description: str,
        code_snippet: Optional[str] = None,
        resolution_steps: Optional[str] = None,
        time_to_resolve_minutes: Optional[int] = None,
        was_successful: bool = True
    ) -> str:
        """
        Add a solution for a pattern
        
        Args:
            pattern_id: Pattern this solution applies to
            title: Short solution title
            description: Detailed solution description
            code_snippet: Code example if applicable
            resolution_steps: Step-by-step instructions
            time_to_resolve_minutes: How long it took to resolve
            was_successful: Whether this solution worked
        
        Returns:
            Solution ID
        """
        solution_id = str(uuid4())
        
        cursor = self.conn.cursor()
        cursor.execute(
            """INSERT INTO local_solutions 
               (id, pattern_id, title, description, code_snippet, 
                resolution_steps, time_to_resolve_minutes, was_successful)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                solution_id,
                pattern_id,
                title,
                description,
                code_snippet,
                resolution_steps,
                time_to_resolve_minutes,
                was_successful
            )
        )
        
        self.conn.commit()
        return solution_id
    
    def get_unsynced_patterns(self) -> List[Dict[str, Any]]:
        """Get patterns that haven't been synced to central KG"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM v_unsynced_patterns ORDER BY occurrence_count DESC")
        
        patterns = []
        for row in cursor.fetchall():
            pattern = dict(row)
            # Get associated technologies
            cursor.execute(
                "SELECT technology_slug FROM local_pattern_technologies WHERE pattern_id = ?",
                (pattern['id'],)
            )
            pattern['technologies'] = [r[0] for r in cursor.fetchall()]
            patterns.append(pattern)
        
        return patterns
    
    def get_unsynced_solutions(self) -> List[Dict[str, Any]]:
        """Get solutions that haven't been synced to central KG"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM v_unsynced_solutions")
        return [dict(row) for row in cursor.fetchall()]
    
    def mark_pattern_synced(self, local_id: str, central_id: str):
        """Mark a pattern as synced to central KG"""
        cursor = self.conn.cursor()
        cursor.execute(
            """UPDATE local_patterns 
               SET synced_to_central = 1, central_pattern_id = ?
               WHERE id = ?""",
            (central_id, local_id)
        )
        
        # Record sync history
        cursor.execute(
            """INSERT INTO sync_history (id, sync_type, local_id, central_id)
               VALUES (?, 'pattern', ?, ?)""",
            (str(uuid4()), local_id, central_id)
        )
        
        self.conn.commit()
    
    def mark_solution_synced(self, local_id: str, central_id: str):
        """Mark a solution as synced to central KG"""
        cursor = self.conn.cursor()
        cursor.execute(
            """UPDATE local_solutions 
               SET synced_to_central = 1, central_solution_id = ?
               WHERE id = ?""",
            (central_id, local_id)
        )
        
        # Record sync history
        cursor.execute(
            """INSERT INTO sync_history (id, sync_type, local_id, central_id)
               VALUES (?, 'solution', ?, ?)""",
            (str(uuid4()), local_id, central_id)
        )
        
        self.conn.commit()
    
    def get_pattern_summary(self) -> Dict[str, Any]:
        """Get summary of local patterns"""
        cursor = self.conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM local_patterns")
        total_patterns = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM local_patterns WHERE synced_to_central = 1")
        synced_patterns = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM local_solutions")
        total_solutions = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM local_solutions WHERE synced_to_central = 1")
        synced_solutions = cursor.fetchone()[0]
        
        return {
            "total_patterns": total_patterns,
            "synced_patterns": synced_patterns,
            "unsynced_patterns": total_patterns - synced_patterns,
            "total_solutions": total_solutions,
            "synced_solutions": synced_solutions,
            "unsynced_solutions": total_solutions - synced_solutions
        }
    
    def search_patterns(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search patterns by signature or description"""
        cursor = self.conn.cursor()
        cursor.execute(
            """SELECT * FROM v_pattern_solutions 
               WHERE error_signature LIKE ? OR error_category LIKE ?
               ORDER BY occurrence_count DESC
               LIMIT ?""",
            (f"%{query}%", f"%{query}%", limit)
        )
        return [dict(row) for row in cursor.fetchall()]
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


# Singleton instance for easy access
_local_kg_instance = None

def get_local_kg(db_path: str = "local_kg/nebula_kg_local.db") -> LocalKG:
    """Get singleton LocalKG instance"""
    global _local_kg_instance
    if _local_kg_instance is None:
        _local_kg_instance = LocalKG(db_path)
    return _local_kg_instance

