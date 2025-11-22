#!/usr/bin/env python3
"""
Nebula Protocol - Python Project Initialization Template

This script sets up a new Python project with MANDATORY KG integration.
Run this FIRST when starting any new Python project.

Usage:
    python nebula-init-python.py project-name "Project Description"
"""

import sys
import os
from pathlib import Path
import json
from datetime import datetime, timezone

def create_project_structure(project_name: str, description: str):
    """Create standard Nebula project structure with KG integration."""
    
    project_path = Path(f"projects/{project_name}")
    
    print(f"\n🌌 Initializing Nebula Project: {project_name}")
    print(f"   {description}\n")
    
    # Step 1: Create directories
    print("📁 Creating directory structure...")
    directories = [
        project_path,
        project_path / ".nebula" / "logs",
        project_path / ".nebula" / "memory",
        project_path / "src" / project_name.replace("-", "_"),
        project_path / "tests",
        project_path / "config",
        project_path / "docs",
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"   ✓ {directory}")
    
    # Step 2: Central KG setup (repository root)
    print("\n🧠 Setting up Central Knowledge Graph...")
    repo_root = Path(__file__).parent.parent
    central_kg_dir = repo_root / ".nebula_central" / "kg"
    central_kg_dir.mkdir(parents=True, exist_ok=True)
    
    for kg_file in ["error_patterns.jsonl", "solutions.jsonl", "security_patterns.jsonl"]:
        kg_path = central_kg_dir / kg_file
        if not kg_path.exists():
            kg_path.touch()
            print(f"   ✓ Created {kg_path.relative_to(repo_root)}")
        else:
            print(f"   ✓ Found {kg_path.relative_to(repo_root)}")
    
    # Step 3: Create project_memory.py (MANDATORY)
    print("\n📝 Creating project_memory.py (KG integration)...")
    create_project_memory_module(project_path, project_name)
    
    # Step 4: Create central_kg.py (MANDATORY)
    print("📝 Creating central_kg.py (Central KG client)...")
    create_central_kg_module(project_path)
    
    # Step 5: Create __init__.py files
    print("\n📦 Creating package files...")
    package_name = project_name.replace("-", "_")
    create_init_files(project_path, package_name, description)
    
    # Step 6: Create requirements.txt
    print("📦 Creating requirements.txt...")
    create_requirements(project_path)
    
    # Step 7: Create .gitignore
    print("🚫 Creating .gitignore...")
    create_gitignore(project_path)
    
    # Step 8: Create pytest.ini
    print("🧪 Creating pytest.ini...")
    create_pytest_ini(project_path, package_name)
    
    # Step 9: Create pyproject.toml
    print("📦 Creating pyproject.toml...")
    create_pyproject_toml(project_path, project_name, description, package_name)
    
    # Step 10: Create basic test
    print("🧪 Creating basic test...")
    create_basic_test(project_path, package_name)
    
    # Step 11: Create README
    print("📄 Creating README.md...")
    create_readme(project_path, project_name, description)
    
    # Step 12: Create ROADMAP template
    print("🗺️  Creating ROADMAP.md...")
    create_roadmap(project_path, project_name, description)
    
    # Step 13: Initialize Git
    print("\n🔧 Initializing Git repository...")
    os.chdir(project_path)
    os.system("git init")
    
    # Step 14: Test KG integration
    print("\n🧪 Testing KG integration...")
    test_kg_integration(project_path)
    
    print("\n✅ Project initialized successfully!")
    print(f"\n📍 Next steps:")
    print(f"   cd {project_path}")
    print(f"   python -m venv venv")
    print(f"   .\\venv\\Scripts\\Activate.ps1  # Windows")
    print(f"   source venv/bin/activate      # Linux/Mac")
    print(f"   pip install -r requirements.txt")
    print(f"   pytest tests/")
    print(f"\n🌌 Nebula Protocol ready! KG integration active.")


def create_project_memory_module(project_path: Path, project_name: str):
    """Create the project_memory.py module."""
    package_name = project_name.replace("-", "_")
    module_path = project_path / "src" / package_name / "project_memory.py"
    
    content = '''"""Project memory and error tracking for Nebula Protocol.

AUTOMATICALLY GENERATED - DO NOT REMOVE
This module provides mandatory error logging and KG integration.
"""

import json
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import traceback

# Import Central KG integration
from .central_kg import (
    query_solutions,
    sync_error_pattern,
    record_solution,
    get_central_kg_stats
)

# Get project root (.nebula/ should be in project root)
PROJECT_ROOT = Path(__file__).parent.parent.parent
NEBULA_DIR = PROJECT_ROOT / '.nebula'
LOGS_DIR = NEBULA_DIR / 'logs'
MEMORY_DIR = NEBULA_DIR / 'memory'


class ProjectMemory:
    """Handles error logging and project memory for KG integration."""

    def __init__(self):
        """Initialize project memory system."""
        # Ensure directories exist
        LOGS_DIR.mkdir(parents=True, exist_ok=True)
        MEMORY_DIR.mkdir(parents=True, exist_ok=True)

        self.error_log = LOGS_DIR / 'errors.jsonl'
        self.debug_log = LOGS_DIR / 'debug.jsonl'
        self.memory_file = MEMORY_DIR / 'project_memory.json'

        # Load existing memory
        self.memory = self._load_memory()

    def _load_memory(self) -> Dict[str, Any]:
        """Load project memory from disk."""
        if self.memory_file.exists():
            try:
                with open(self.memory_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                pass

        # Initialize default memory structure
        return {
            'errors': {},
            'patterns': {},
            'solutions': {},
            'statistics': {
                'total_errors': 0,
                'total_operations': 0
            }
        }

    def _save_memory(self):
        """Save project memory to disk."""
        try:
            with open(self.memory_file, 'w', encoding='utf-8') as f:
                json.dump(self.memory, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logging.error(f"Failed to save project memory: {e}")

    def log_error(
        self,
        error_type: str,
        error_message: str,
        context: Optional[Dict[str, Any]] = None,
        exception: Optional[Exception] = None
    ):
        """Log an error with Central KG integration."""
        timestamp = datetime.now(timezone.utc).isoformat()

        # STEP 1: Query Central KG for known solutions
        print(f"\\n[Central KG] Checking for similar errors...")
        try:
            solutions = query_solutions(error_message, error_type, '{project_name}')
            if solutions:
                print(f"\\n[!] Found {len(solutions)} known solution(s):\\n")
                for i, match in enumerate(solutions[:3], 1):
                    sol = match['solution']
                    sim = match['similarity']
                    print(f"  {i}. {sol['description']}")
                    print(f"     Effectiveness: {sol['effectiveness']}/5 "
                          f"(used {sol['usage_count']} times)")
                    print(f"     Match: {sim*100:.0f}%\\n")
            else:
                print("   No known solutions found - this is a new error pattern")
        except Exception as e:
            logging.debug(f"Central KG query failed: {e}")

        # STEP 2: Create error record
        error_record = {
            'timestamp': timestamp,
            'type': error_type,
            'message': error_message,
            'context': context or {},
        }

        if exception:
            error_record['traceback'] = ''.join(
                traceback.format_exception(
                    type(exception), exception, exception.__traceback__
                )
            )

        # STEP 3: Write to JSONL error log
        try:
            with open(self.error_log, 'a', encoding='utf-8') as f:
                f.write(json.dumps(error_record, ensure_ascii=False) + '\\n')
        except Exception as e:
            logging.error(f"Failed to write error log: {e}")

        # STEP 4: Update project memory
        self._update_error_memory(error_type, error_message, context)

        # STEP 5: Sync to Central KG
        try:
            pattern_id = sync_error_pattern(
                error_type, error_message, '{project_name}', 'python', context
            )
            if pattern_id:
                print("[OK] Error synced to Central KG")
        except Exception as e:
            logging.debug(f"Central KG sync failed: {e}")

    def _update_error_memory(
        self, error_type: str, error_message: str, context: Optional[Dict]
    ):
        """Update project memory with error patterns."""
        if error_type not in self.memory['errors']:
            self.memory['errors'][error_type] = {
                'count': 0,
                'first_seen': datetime.now(timezone.utc).isoformat(),
                'last_seen': datetime.now(timezone.utc).isoformat(),
                'examples': []
            }

        self.memory['errors'][error_type]['count'] += 1
        self.memory['errors'][error_type]['last_seen'] = (
            datetime.now(timezone.utc).isoformat()
        )

        examples = self.memory['errors'][error_type]['examples']
        examples.append({'message': error_message, 'context': context})
        self.memory['errors'][error_type]['examples'] = examples[-5:]

        self.memory['statistics']['total_errors'] += 1
        self._save_memory()

    def log_success(self, operation: str, context: Dict[str, Any]):
        """Log successful operation for statistics."""
        if operation not in self.memory['statistics']:
            self.memory['statistics'][operation] = 0
        self.memory['statistics'][operation] += 1
        self._save_memory()

    def get_error_patterns(self) -> Dict[str, Any]:
        """Get known error patterns from memory."""
        return self.memory['errors']


# Global instance
_project_memory = None

def get_project_memory() -> ProjectMemory:
    """Get the global project memory instance."""
    global _project_memory
    if _project_memory is None:
        _project_memory = ProjectMemory()
    return _project_memory

def log_error(
    error_type: str,
    error_message: str,
    context: Optional[Dict[str, Any]] = None,
    exception: Optional[Exception] = None
):
    """Convenience function to log errors."""
    memory = get_project_memory()
    memory.log_error(error_type, error_message, context, exception)

def log_success(operation: str, context: Dict[str, Any]):
    """Convenience function to log successful operations."""
    memory = get_project_memory()
    memory.log_success(operation, context)
'''.replace('{project_name}', project_name)
    
    module_path.write_text(content, encoding='utf-8')
    print(f"   ✓ {module_path.relative_to(project_path)}")


def create_central_kg_module(project_path: Path):
    """Create the central_kg.py module."""
    # Copy the central_kg.py from project-5 as template
    template_path = Path("projects/project-5/src/passmanager/central_kg.py")
    if template_path.exists():
        content = template_path.read_text(encoding='utf-8')
    else:
        # Fallback: create minimal version
        content = '''"""Central KG integration - minimal version."""
# TODO: Copy full implementation from project-5
'''
    
    package_name = project_path.name.replace("-", "_")
    module_path = project_path / "src" / package_name / "central_kg.py"
    module_path.write_text(content, encoding='utf-8')
    print(f"   ✓ {module_path.relative_to(project_path)}")


def create_init_files(project_path: Path, package_name: str, description: str):
    """Create __init__.py files."""
    # Package __init__.py
    init_path = project_path / "src" / package_name / "__init__.py"
    init_path.write_text(f'''"""{description}"""

__version__ = "0.0.1"
__author__ = "Nebula Protocol"
''', encoding='utf-8')
    print(f"   ✓ {init_path.relative_to(project_path)}")
    
    # Tests __init__.py
    test_init = project_path / "tests" / "__init__.py"
    test_init.write_text('"""Test suite."""\n', encoding='utf-8')
    print(f"   ✓ {test_init.relative_to(project_path)}")


def create_requirements(project_path: Path):
    """Create requirements.txt."""
    requirements = project_path / "requirements.txt"
    requirements.write_text('''# Core Dependencies
# Add your project-specific dependencies here

# Development Dependencies
pytest>=7.4.0
pytest-cov>=4.1.0
black>=23.7.0
flake8>=6.1.0
''', encoding='utf-8')
    print(f"   ✓ {requirements.relative_to(project_path)}")


def create_gitignore(project_path: Path):
    """Create .gitignore."""
    gitignore = project_path / ".gitignore"
    gitignore.write_text('''# Python
__pycache__/
*.py[cod]
*$py.class
venv/
env/
*.egg-info/

# Testing
.pytest_cache/
.coverage
htmlcov/

# IDE
.vscode/
.idea/
*.swp

# Nebula Protocol - logs and memory (local, not shared)
.nebula/logs/
.nebula/memory/project_memory.json

# OS
.DS_Store
Thumbs.db
''', encoding='utf-8')
    print(f"   ✓ {gitignore.relative_to(project_path)}")


def create_pytest_ini(project_path: Path, package_name: str):
    """Create pytest.ini."""
    pytest_ini = project_path / "pytest.ini"
    pytest_ini.write_text(f'''[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*

addopts = 
    -v
    --strict-markers
    --cov=src/{package_name}
    --cov-report=html
    --cov-report=term-missing
''', encoding='utf-8')
    print(f"   ✓ {pytest_ini.relative_to(project_path)}")


def create_pyproject_toml(project_path: Path, project_name: str, description: str, package_name: str):
    """Create pyproject.toml."""
    pyproject = project_path / "pyproject.toml"
    pyproject.write_text(f'''[build-system]
requires = ["setuptools>=68.0.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "{project_name}"
version = "0.0.1"
description = "{description}"
readme = "README.md"
requires-python = ">=3.10"

[tool.setuptools.packages.find]
where = ["src"]

[tool.black]
line-length = 88
target-version = ['py310']

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
''', encoding='utf-8')
    print(f"   ✓ {pyproject.relative_to(project_path)}")


def create_basic_test(project_path: Path, package_name: str):
    """Create basic test file."""
    test_file = project_path / "tests" / "test_basic.py"
    test_file.write_text(f'''"""Basic smoke tests."""

import pytest
from src.{package_name} import __version__
from src.{package_name}.project_memory import get_project_memory


def test_version():
    """Test version is set."""
    assert __version__ == "0.0.1"


def test_project_memory_initialization():
    """Test that project memory initializes correctly."""
    pm = get_project_memory()
    assert pm is not None
    assert pm.memory is not None
    assert 'errors' in pm.memory
    assert 'statistics' in pm.memory


def test_error_logging():
    """Test that errors can be logged."""
    pm = get_project_memory()
    initial_count = pm.memory['statistics']['total_errors']
    
    pm.log_error(
        'TestError',
        'Test error message',
        {{'test_key': 'test_value'}}
    )
    
    assert pm.memory['statistics']['total_errors'] == initial_count + 1
    assert 'TestError' in pm.memory['errors']
''', encoding='utf-8')
    print(f"   ✓ {test_file.relative_to(project_path)}")


def create_readme(project_path: Path, project_name: str, description: str):
    """Create README.md."""
    readme = project_path / "README.md"
    readme.write_text(f'''# {project_name.replace("-", " ").title()}

{description}

## Installation

```bash
python -m venv venv
source venv/bin/activate  # or .\\venv\\Scripts\\Activate.ps1 on Windows
pip install -r requirements.txt
```

## Testing

```bash
pytest tests/ -v
```

## Project Structure

```
{project_name}/
├── .nebula/              # Error logging and KG (auto-generated)
├── src/{project_name.replace("-", "_")}/  # Main package
│   ├── project_memory.py # KG integration (MANDATORY)
│   └── central_kg.py     # Central KG client (MANDATORY)
├── tests/                # Test suite
└── config/               # Configuration
```

## Nebula Protocol

This project uses the Nebula Protocol for error logging and knowledge graph integration.

- **Local KG**: `.nebula/memory/project_memory.json`
- **Central KG**: `../../.nebula_central/kg/*.jsonl` (shared across projects)

All errors are automatically logged and patterns are shared across projects.
''', encoding='utf-8')
    print(f"   ✓ {readme.relative_to(project_path)}")


def create_roadmap(project_path: Path, project_name: str, description: str):
    """Create ROADMAP.md template."""
    roadmap = project_path / "ROADMAP.md"
    roadmap.write_text(f'''# {project_name.replace("-", " ").title()} - Nebula Roadmap

## Project Overview
{description}

**Complexity Level:** TBD (simple/moderate/complex)  
**Adaptive Structure:** Constellations will be defined as needed

## Development Constellations

### Constellation 0: SETUP (→ 0.1.0)
- **Status:** ⏳ Pending
- **Description:** Project initialization and setup
- **Key Deliverables:**
  - Virtual environment configured
  - Project structure created
  - Core modules implemented
  - Test suite initialized
  - ✅ Error logging + KG integration (auto-configured)

### Define additional constellations as project complexity emerges...

---

**Current Progress:** Constellation 0 (SETUP) - Ready to begin

See PROJECT_OVERVIEW.md for detailed requirements.
''', encoding='utf-8')
    print(f"   ✓ {roadmap.relative_to(project_path)}")


def test_kg_integration(project_path: Path):
    """Test that KG integration is working."""
    package_name = project_path.name.replace("-", "_")
    test_script = f'''
import sys
sys.path.insert(0, 'src')
from {package_name}.project_memory import get_project_memory
from {package_name}.central_kg import get_central_kg_stats

pm = get_project_memory()
pm.log_error('InitTest', 'Testing KG during initialization', {{'init': True}})
stats = get_central_kg_stats()
print(f"[OK] KG Integration Test Passed")
print(f"[OK] Central KG Stats: {{stats}}")
'''
    
    test_file = project_path / "test_kg_init.py"
    test_file.write_text(test_script, encoding='utf-8')
    
    try:
        os.system(f"cd {project_path} && python test_kg_init.py")
        test_file.unlink()  # Clean up
    except Exception as e:
        print(f"   ⚠ KG test failed: {e}")
        print(f"   Run manually: cd {project_path} && python test_kg_init.py")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python nebula-init-python.py project-name \"Project Description\"")
        sys.exit(1)
    
    project_name = sys.argv[1]
    description = sys.argv[2]
    
    create_project_structure(project_name, description)

