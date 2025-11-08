# Star System 0.2: Project Structure

**Parent Constellation:** 0 - Setup  
**Version Target:** 0.1.0.0  
**Status:** 🔄 Ready for Implementation  
**Complexity:** Simple

---

## Purpose

Create the project directory structure, configuration files, and initial codebase. This Star System establishes the architectural foundation for the todo list application.

---

## Prerequisites

- Star System 0.1 completed (environment ready)
- Virtual environment activated
- Dependencies installed

---

## Technical Implementation Steps

### Step 1: Create Directory Structure

**Execute these commands from project root:**

```bash
# Create source directories
mkdir -p src/todo
mkdir -p tests
mkdir -p docs

# Verify structure
ls -la  # Mac/Linux
dir     # Windows
```

**Expected structure:**
```
todo-list-cli/
├── src/
│   └── todo/
├── tests/
├── docs/
├── venv/
├── .nebula/
└── (other files from Star System 0.1)
```

---

### Step 2: Create Package __init__.py Files

**Create:** `src/todo/__init__.py`

```python
"""
Todo List CLI - A simple command-line todo list application.

This package provides functionality for managing todos including:
- Creating, reading, updating, and deleting todos
- Persisting todos to storage (JSON)
- Command-line interface for todo management
"""

__version__ = "0.0.1"
__author__ = "Your Name"

# Package-level imports (to be added in Constellation 1)
# from .todo import Todo, TodoManager
# from .storage import Storage
# from .cli import CLI
```

**Create:** `tests/__init__.py`

```python
"""
Tests for Todo List CLI.

Test suite organization:
- test_cli.py: Command-line interface tests
- test_todo.py: Todo management logic tests
- test_storage.py: Data persistence tests
"""
```

---

### Step 3: Create pyproject.toml (Modern Python Packaging)

**Create:** `pyproject.toml`

```toml
[build-system]
requires = ["setuptools>=68.0.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "todo-list-cli"
version = "0.0.1"
description = "A simple command-line todo list application"
readme = "README.md"
requires-python = ">=3.10"
license = {text = "MIT"}
authors = [
    {name = "Your Name", email = "your.email@example.com"}
]
keywords = ["todo", "cli", "task-management", "productivity"]
classifiers = [
    "Development Status :: 3 - Alpha",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]

dependencies = [
    "colorama>=0.4.6",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
    "black>=23.0.0",
    "flake8>=6.1.0",
]

[project.scripts]
todo = "todo.cli:main"

[project.urls]
"Homepage" = "https://github.com/yourusername/todo-list-cli"
"Bug Tracker" = "https://github.com/yourusername/todo-list-cli/issues"

[tool.setuptools]
package-dir = {"" = "src"}

[tool.setuptools.packages.find]
where = ["src"]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "-v --cov=todo --cov-report=html --cov-report=term-missing"

[tool.black]
line-length = 88
target-version = ['py310']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | venv
  | build
  | dist
)/
'''

[tool.flake8]
max-line-length = 88
extend-ignore = ["E203", "W503"]
exclude = [".git", "__pycache__", "venv", "build", "dist"]
```

---

### Step 4: Create Setup Configuration

**Create:** `setup.cfg` (optional, for older tools)

```ini
[metadata]
name = todo-list-cli
version = 0.0.1

[options]
packages = find:
package_dir =
    = src
python_requires = >=3.10

[options.packages.find]
where = src

[flake8]
max-line-length = 88
extend-ignore = E203, W503
exclude = .git,__pycache__,venv,build,dist
```

---

### Step 5: Create Initial Source Files

**Create:** `src/todo/cli.py` (entry point placeholder)

```python
"""
Command-line interface for Todo List CLI.

This module will provide the CLI commands and argument parsing.
Implementation details will be added in Constellation 1.
"""
import sys


def main():
    """
    Main entry point for the CLI application.
    
    This is a placeholder that will be fully implemented
    in Constellation 1: Core Functionality.
    """
    print("Todo List CLI v0.0.1")
    print("Constellation 0: Setup - Initial structure created")
    print("\nFull functionality coming in Constellation 1!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

**Create:** `src/todo/todo.py` (core logic placeholder)

```python
"""
Core todo management logic.

This module will handle todo operations:
- Creating todos
- Reading/listing todos
- Updating todos
- Deleting todos
- Marking todos as complete

Implementation details will be added in Constellation 1.
"""


class Todo:
    """
    Represents a single todo item.
    
    To be fully implemented in Constellation 1.
    """
    pass


class TodoManager:
    """
    Manages a collection of todos.
    
    To be fully implemented in Constellation 1.
    """
    pass
```

**Create:** `src/todo/storage.py` (storage placeholder)

```python
"""
Data persistence for todos.

This module will handle:
- Saving todos to JSON file
- Loading todos from JSON file
- Data validation

Implementation details will be added in Constellation 1.
"""


class Storage:
    """
    Handles todo data persistence.
    
    To be fully implemented in Constellation 1.
    """
    pass
```

---

### Step 6: Create First Test

**Create:** `tests/test_smoke.py`

```python
"""
Smoke tests to verify basic setup is working.

These tests validate that:
1. Package is importable
2. Basic functionality exists
3. CLI entry point works
"""
import sys
import subprocess


def test_package_importable():
    """Test that the todo package can be imported."""
    import todo
    assert todo is not None


def test_package_version():
    """Test that package version is defined."""
    import todo
    assert hasattr(todo, '__version__')
    assert todo.__version__ == "0.0.1"


def test_cli_module_exists():
    """Test that CLI module exists and has main function."""
    from todo import cli
    assert hasattr(cli, 'main')
    assert callable(cli.main)


def test_cli_runs():
    """Test that CLI entry point executes without errors."""
    result = subprocess.run(
        [sys.executable, '-m', 'todo.cli'],
        capture_output=True,
        text=True
    )
    assert result.returncode == 0
    assert "Todo List CLI" in result.stdout


def test_todo_classes_exist():
    """Test that core todo classes are defined."""
    from todo import todo
    assert hasattr(todo, 'Todo')
    assert hasattr(todo, 'TodoManager')


def test_storage_class_exists():
    """Test that storage class is defined."""
    from todo import storage
    assert hasattr(storage, 'Storage')
```

---

### Step 7: Run Initial Tests

**Install package in development mode:**
```bash
pip install -e .
```

**Expected Output:**
```
Successfully installed todo-list-cli-0.0.1
```

**Run tests:**
```bash
pytest
```

**Expected Output:**
```
====== test session starts ======
collected 6 items

tests/test_smoke.py ......                                  [100%]

====== 6 passed in 0.50s ======
```

**Run CLI to verify:**
```bash
python -m todo.cli
```

**Expected Output:**
```
Todo List CLI v0.0.1
Constellation 0: Setup - Initial structure created

Full functionality coming in Constellation 1!
```

---

### Step 8: Code Quality Checks

**Run Black (formatter):**
```bash
black src/ tests/
```

**Expected:** May reformat files, should not error

**Run Flake8 (linter):**
```bash
flake8 src/ tests/
```

**Expected:** Should pass with no errors

**If there are errors:** Fix them before proceeding

---

### Step 9: Create pytest.ini

**Create:** `pytest.ini`

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --cov=todo --cov-report=html --cov-report=term-missing
```

---

### Step 10: Generate Initial Coverage Report

```bash
pytest --cov=todo --cov-report=html
```

**Expected:** Creates `htmlcov/` directory with coverage report

**Open coverage report:**
```bash
# Mac/Linux
open htmlcov/index.html

# Windows
start htmlcov/index.html
```

**Expected Coverage:** ~20-30% (we only have placeholders so far)

---

### Step 11: Create Documentation Stub

**Create:** `docs/usage.md`

```markdown
# Todo List CLI - Usage Guide

## Installation

See README.md for installation instructions.

## Basic Usage

Coming in Constellation 1: Core Functionality!

The following commands will be available:

\`\`\`bash
# Add a todo
todo add "Buy groceries"

# List all todos
todo list

# Complete a todo
todo complete 1

# Delete a todo
todo delete 1
\`\`\`

## Advanced Usage

Coming in Constellation 2: Enhanced Features!

- Priorities
- Due dates
- Search and filtering
- Categories/tags

## Configuration

Coming soon!
```

---

### Step 12: Update README.md

**Add to existing README.md:**

```markdown
## Project Structure

\`\`\`
todo-list-cli/
├── src/
│   └── todo/
│       ├── __init__.py
│       ├── cli.py          # Command-line interface
│       ├── todo.py         # Todo management logic
│       └── storage.py      # Data persistence
├── tests/
│   ├── __init__.py
│   └── test_smoke.py       # Initial smoke tests
├── docs/
│   └── usage.md            # Usage documentation
├── venv/                   # Virtual environment (not in git)
├── .nebula/                # Nebula Framework tools
├── .gitignore
├── pyproject.toml          # Project configuration
├── requirements.txt        # Dependencies
└── README.md               # This file
\`\`\`

## Running Tests

\`\`\`bash
# Run all tests
pytest

# Run with coverage
pytest --cov=todo

# Run specific test file
pytest tests/test_smoke.py
\`\`\`

## Code Quality

\`\`\`bash
# Format code
black src/ tests/

# Lint code
flake8 src/ tests/
\`\`\`

## Current Status

**Constellation 0: Setup** - Complete  
**Constellation 1: Core Functionality** - Coming next  
**Constellation 2: Deployment** - Planned

See ROADMAP.md for full development plan.
```

---

## Commit Changes

**Stage all new files:**
```bash
git add .
```

**Commit:**
```bash
git commit -m "feat: Complete Constellation 0 - Project structure established

Implemented Star System 0.2:
- Created src/todo/ package structure
- Created tests/ directory with smoke tests
- Created pyproject.toml for modern packaging
- Created initial source files (cli.py, todo.py, storage.py)
- Created first test suite (6 tests passing)
- Configured code quality tools (black, flake8)
- Updated documentation

Project structure complete and tested.
Ready for Constellation 1: Core Functionality

Version: 0.1.0.0 (setup complete)
Tests: 6 passed, coverage ~25%"
```

**Push to remote:**
```bash
git push origin main
```

---

## Validation Checklist

Before moving to Star Gate, verify:

- [ ] Directory structure created (src/todo, tests, docs)
- [ ] All __init__.py files created
- [ ] pyproject.toml configured
- [ ] Initial source files created (cli.py, todo.py, storage.py)
- [ ] Smoke tests created and passing (6/6)
- [ ] Package installable with `pip install -e .`
- [ ] CLI runs with `python -m todo.cli`
- [ ] Black runs without errors
- [ ] Flake8 runs without errors
- [ ] Coverage report generated
- [ ] Documentation updated
- [ ] Changes committed and pushed to remote

---

## Error Logging

If errors occur, log them to project memory. Example:

```javascript
// From .nebula/tools/
const pm = new ProjectMemory('../..', 'todo-list-cli', 'python');
pm.recordError({
  language: 'python',
  message: 'pytest import error',
  stackTrace: 'ModuleNotFoundError: No module named todo',
  constellation: 'Setup',
  filePath: 'tests/test_smoke.py',
  level: 'ERROR'
});
pm.close();
```

---

## Common Issues & Solutions

### Issue 1: "No module named 'todo'"
**Problem:** Package not installed  
**Solution:** Run `pip install -e .` from project root

### Issue 2: Tests can't import todo package
**Problem:** PYTHONPATH not set correctly  
**Solution:** Ensure you're in project root and venv is activated

### Issue 3: pytest not found
**Problem:** Dependencies not installed  
**Solution:** Run `pip install -r requirements.txt`

### Issue 4: Import errors in tests
**Problem:** Circular imports or missing __init__.py  
**Solution:** Verify all directories have __init__.py files

---

## Next Step

Once this Star System is complete and validated, proceed to:
**STAR_GATE_0_SETUP.md** - Validate setup before moving to Constellation 1

---

## Version Impact

**Before this Star System:** 0.0.1.0 (environment only)  
**After this Star System:** 0.1.0.0 (full setup complete)  
**Ready for:** Constellation 1 - Core Functionality

---

**Status:** Ready for implementation  
**Estimated Time:** 45-90 minutes  
**Difficulty:** Easy to Moderate

