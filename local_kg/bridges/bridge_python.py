"""
Python Bridge for Nebula Local KG

This is a thin wrapper around the local_kg module for consistency
with other language bridges. In Python, you can use the local_kg
module directly without this bridge.

Usage:
    from local_kg.bridges.bridge_python import LocalKGBridge
    
    kg = LocalKGBridge()
    pattern_id = kg.capture_error(
        signature="ValueError: invalid literal for int()",
        category="ValueError",
        language="python",
        severity="medium"
    )

Direct Usage (Recommended):
    from local_kg.local_kg import get_local_kg
    
    kg = get_local_kg('local_kg/my_project_local.db')
    pattern_id = kg.capture_error(...)
"""

import os
import sys
import json
from pathlib import Path
from typing import Optional, List, Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from local_kg import LocalKG, get_local_kg as get_local_kg_singleton


class LocalKGBridge:
    """
    Python bridge to Local Knowledge Graph.
    
    This is primarily for consistency with other language bridges.
    Python projects can use the local_kg module directly.
    """
    
    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize the bridge.
        
        Args:
            db_path: Path to SQLite database. If None, loads from config.
        """
        self.config = self.load_config()
        self.db_path = db_path or self.config.get('local_kg_db') or 'local_kg/nebula_protocol_local.db'
        self.kg = get_local_kg_singleton(self.db_path)
    
    def load_config(self) -> Dict[str, Any]:
        """Load configuration from .nebula/config.json or environment variables."""
        # Priority 1: .nebula/config.json
        config_path = Path('.nebula/config.json')
        if config_path.exists():
            with open(config_path, 'r') as f:
                return json.load(f)
        
        # Priority 2: Environment variables
        if os.environ.get('NEBULA_LANGUAGE'):
            return {
                'language': os.environ['NEBULA_LANGUAGE'],
                'local_kg_db': os.environ.get('NEBULA_LOCAL_KG_DB', 'local_kg/project_local.db'),
                'python_command': 'python'  # N/A for Python
            }
        
        # Priority 3: Defaults
        return {
            'language': 'python',
            'local_kg_db': 'local_kg/nebula_protocol_local.db'
        }
    
    def capture_error(
        self,
        signature: str,
        category: str = 'Error',
        language: str = 'python',
        severity: str = 'medium',
        description: Optional[str] = None,
        technologies: Optional[List[str]] = None
    ) -> str:
        """
        Capture an error pattern to the local KG.
        
        Args:
            signature: Error message/signature
            category: Error category (e.g., 'ValueError')
            language: Language where error occurred
            severity: 'low', 'medium', 'high', 'critical'
            description: Optional detailed description
            technologies: Optional technology tags
        
        Returns:
            Pattern ID (UUID as string)
        """
        return self.kg.capture_error(
            error_signature=signature,
            error_category=category,
            language=language,
            description=description,
            severity=severity
        )
    
    def search_patterns(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search for similar error patterns.
        
        Args:
            query: Search query (error signature or description)
            limit: Maximum number of results
        
        Returns:
            List of matching patterns
        """
        return self.kg.search_patterns(query, limit)
    
    def add_solution(
        self,
        pattern_id: str,
        solution_text: str,
        effectiveness: str = 'worked'
    ) -> str:
        """
        Add a solution to an existing pattern.
        
        Args:
            pattern_id: Pattern UUID
            solution_text: Solution description/code
            effectiveness: 'worked', 'partial', 'failed'
        
        Returns:
            Solution ID (UUID as string)
        """
        return self.kg.add_solution(
            pattern_id=pattern_id,
            solution_text=solution_text,
            effectiveness=effectiveness
        )
    
    def get_summary(self) -> Dict[str, Any]:
        """
        Get summary statistics about patterns and solutions.
        
        Returns:
            Dictionary with statistics
        """
        return self.kg.get_pattern_summary()
    
    def capture_error_from_exception(
        self,
        exception: Exception,
        language: str = 'python',
        severity: str = 'medium',
        description: Optional[str] = None
    ) -> str:
        """
        Convenience method to capture error from Python exception.
        
        Args:
            exception: Python exception object
            language: Language where error occurred
            severity: Error severity
            description: Optional detailed description
        
        Returns:
            Pattern ID (UUID as string)
        """
        return self.capture_error(
            signature=str(exception),
            category=type(exception).__name__,
            language=language,
            severity=severity,
            description=description
        )


# Singleton instance
_global_instance: Optional[LocalKGBridge] = None


def get_bridge(db_path: Optional[str] = None) -> LocalKGBridge:
    """
    Get or create global singleton instance.
    
    Args:
        db_path: Path to SQLite database
    
    Returns:
        LocalKGBridge instance
    """
    global _global_instance
    if _global_instance is None or db_path:
        _global_instance = LocalKGBridge(db_path)
    return _global_instance


# Example usage with context manager
class KGErrorCapture:
    """Context manager for automatic error capture."""
    
    def __init__(
        self,
        kg: LocalKGBridge,
        language: str = 'python',
        severity: str = 'medium',
        description: Optional[str] = None
    ):
        self.kg = kg
        self.language = language
        self.severity = severity
        self.description = description
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_val is not None:
            self.kg.capture_error_from_exception(
                exc_val,
                language=self.language,
                severity=self.severity,
                description=self.description
            )
        return False  # Don't suppress exception


# Example usage
if __name__ == '__main__':
    # Method 1: Using bridge
    bridge = LocalKGBridge()
    
    try:
        # Some code that might fail
        result = int("not a number")
    except Exception as e:
        pattern_id = bridge.capture_error_from_exception(e, severity='low')
        print(f"Captured error: {pattern_id}")
    
    # Method 2: Using context manager
    bridge = LocalKGBridge()
    with KGErrorCapture(bridge, language='python', severity='low'):
        result = int("not a number")  # Error automatically captured
    
    # Method 3: Direct usage (recommended for Python)
    from local_kg.local_kg import get_local_kg
    kg = get_local_kg()
    try:
        result = int("not a number")
    except ValueError as e:
        kg.capture_error(
            error_signature=str(e),
            error_category='ValueError',
            language='python',
            severity='low'
        )

