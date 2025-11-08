# Star System 1.2: Storage

**Parent Constellation:** 1 - Core Functionality  
**Version Target:** 0.1.2.0  
**Status:** 🔄 Ready for Implementation  
**Complexity:** Moderate

---

## Purpose

Implement JSON-based persistence for todo data. This includes saving todos to file, loading from file, handling file corruption, and ensuring data integrity.

---

## Prerequisites

- Star System 1.1 complete (Todo and TodoManager implemented)
- All tests from Star System 1.1 passing

---

## Technical Implementation Steps

### Step 1: Implement Storage Class

**Update:** `src/todo/storage.py`

```python
"""
Data persistence for todos.

This module handles:
- Saving todos to JSON file
- Loading todos from JSON file
- Data validation
- Error recovery
"""
import json
import os
import shutil
from pathlib import Path
from typing import Optional
from .todo import Todo


class Storage:
    """
    Handles todo data persistence using JSON.
    
    Features:
    - Automatic file creation
    - Corruption recovery with backup
    - Atomic writes (write to temp, then rename)
    - Data validation
    """
    
    def __init__(self, file_path: str = "todos.json"):
        """
        Initialize storage.
        
        Args:
            file_path: Path to JSON file (default: todos.json)
        """
        self.file_path = Path(file_path)
        self.backup_path = self.file_path.with_suffix('.json.bak')
    
    def load(self) -> list[Todo]:
        """
        Load todos from file.
        
        Returns:
            List of Todo objects (empty list if file doesn't exist)
        
        Raises:
            StorageError: If file is corrupt and backup recovery fails
        """
        # File doesn't exist yet - return empty list
        if not self.file_path.exists():
            return []
        
        try:
            return self._load_from_file(self.file_path)
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # File is corrupt, try backup
            print(f"Warning: Main file corrupt ({e}), trying backup...")
            
            if self.backup_path.exists():
                try:
                    todos = self._load_from_file(self.backup_path)
                    # Restore from backup
                    self._write_to_file(self.file_path, todos)
                    print("Restored from backup successfully")
                    return todos
                except Exception as backup_error:
                    print(f"Backup also corrupt: {backup_error}")
            
            # Both corrupt - create backup of corrupt file and start fresh
            if self.file_path.exists():
                corrupt_path = self.file_path.with_suffix('.json.corrupt')
                shutil.copy(self.file_path, corrupt_path)
                print(f"Corrupt file backed up to: {corrupt_path}")
            
            print("Starting with empty todo list")
            return []
    
    def _load_from_file(self, path: Path) -> list[Todo]:
        """
        Load todos from specific file.
        
        Args:
            path: Path to JSON file
        
        Returns:
            List of Todo objects
        
        Raises:
            json.JSONDecodeError: If JSON is invalid
            KeyError/ValueError: If data structure is invalid
        """
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Validate data structure
        if not isinstance(data, dict) or 'todos' not in data:
            raise ValueError("Invalid file format: missing 'todos' key")
        
        if not isinstance(data['todos'], list):
            raise ValueError("Invalid file format: 'todos' must be a list")
        
        # Convert dictionaries to Todo objects
        todos = []
        for todo_data in data['todos']:
            try:
                todo = Todo.from_dict(todo_data)
                todos.append(todo)
            except (KeyError, ValueError) as e:
                print(f"Warning: Skipping invalid todo: {e}")
                continue
        
        return todos
    
    def save(self, todos: list[Todo]) -> None:
        """
        Save todos to file.
        
        Uses atomic write (temp file + rename) to prevent corruption.
        Creates backup before overwriting.
        
        Args:
            todos: List of Todo objects to save
        
        Raises:
            StorageError: If save fails
        """
        # Create backup if main file exists
        if self.file_path.exists():
            shutil.copy(self.file_path, self.backup_path)
        
        # Convert todos to dictionaries
        data = {
            'version': '1.0',
            'todos': [todo.to_dict() for todo in todos]
        }
        
        # Atomic write: write to temp file, then rename
        temp_path = self.file_path.with_suffix('.json.tmp')
        try:
            self._write_to_file(temp_path, todos)
            # Rename is atomic on most filesystems
            temp_path.replace(self.file_path)
        except Exception as e:
            # Clean up temp file if it exists
            if temp_path.exists():
                temp_path.unlink()
            raise StorageError(f"Failed to save todos: {e}") from e
    
    def _write_to_file(self, path: Path, todos: list[Todo]) -> None:
        """
        Write todos to specific file.
        
        Args:
            path: Path to write to
            todos: List of Todo objects
        """
        data = {
            'version': '1.0',
            'todos': [todo.to_dict() for todo in todos]
        }
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def clear(self) -> None:
        """Delete the todos file (WARNING: destructive)."""
        if self.file_path.exists():
            self.file_path.unlink()
        if self.backup_path.exists():
            self.backup_path.unlink()
    
    def exists(self) -> bool:
        """Check if todos file exists."""
        return self.file_path.exists()
    
    def get_file_path(self) -> str:
        """Get the absolute path to the todos file."""
        return str(self.file_path.absolute())


class StorageError(Exception):
    """Raised when storage operations fail."""
    pass
```

---

### Step 2: Create Storage Tests

**Create:** `tests/test_storage.py`

```python
"""
Unit tests for Storage class.
"""
import json
import pytest
from pathlib import Path
from todo.storage import Storage, StorageError
from todo.todo import Todo


@pytest.fixture
def temp_storage(tmp_path):
    """Create temporary storage for testing."""
    file_path = tmp_path / "test_todos.json"
    return Storage(str(file_path))


@pytest.fixture
def sample_todos():
    """Create sample todos for testing."""
    return [
        Todo("Task 1"),
        Todo("Task 2"),
        Todo("Task 3")
    ]


class TestStorage:
    """Tests for Storage class."""
    
    def test_load_nonexistent_file(self, temp_storage):
        """Test loading when file doesn't exist returns empty list."""
        todos = temp_storage.load()
        assert todos == []
    
    def test_save_and_load(self, temp_storage, sample_todos):
        """Test saving and loading todos."""
        temp_storage.save(sample_todos)
        loaded = temp_storage.load()
        
        assert len(loaded) == 3
        assert loaded[0].description == "Task 1"
        assert loaded[1].description == "Task 2"
        assert loaded[2].description == "Task 3"
    
    def test_save_creates_backup(self, temp_storage, sample_todos):
        """Test that save creates backup of existing file."""
        # Save once
        temp_storage.save(sample_todos)
        
        # Save again (should create backup)
        sample_todos[0].mark_complete()
        temp_storage.save(sample_todos)
        
        assert temp_storage.backup_path.exists()
    
    def test_save_empty_list(self, temp_storage):
        """Test saving empty list."""
        temp_storage.save([])
        loaded = temp_storage.load()
        
        assert loaded == []
    
    def test_corrupted_file_uses_backup(self, temp_storage, sample_todos):
        """Test recovery from corrupted main file using backup."""
        # Save valid data
        temp_storage.save(sample_todos)
        
        # Corrupt main file
        with open(temp_storage.file_path, 'w') as f:
            f.write("{ invalid json }")
        
        # Load should recover from backup
        loaded = temp_storage.load()
        assert len(loaded) == 3
    
    def test_both_files_corrupted(self, temp_storage):
        """Test behavior when both main and backup are corrupted."""
        # Create corrupted files
        with open(temp_storage.file_path, 'w') as f:
            f.write("{ invalid }")
        with open(temp_storage.backup_path, 'w') as f:
            f.write("{ also invalid }")
        
        # Should return empty list and create .corrupt backup
        loaded = temp_storage.load()
        assert loaded == []
        
        corrupt_path = temp_storage.file_path.with_suffix('.json.corrupt')
        assert corrupt_path.exists()
    
    def test_invalid_data_structure(self, temp_storage):
        """Test handling of invalid JSON structure."""
        # Create file with wrong structure
        with open(temp_storage.file_path, 'w') as f:
            json.dump({"wrong": "structure"}, f)
        
        loaded = temp_storage.load()
        assert loaded == []
    
    def test_partial_corruption(self, temp_storage):
        """Test handling when some todos are corrupt."""
        # Create file with mixed valid/invalid todos
        data = {
            "version": "1.0",
            "todos": [
                {"description": "Valid todo", "id": "1", "completed": False, "created_at": "2024-01-01"},
                {"invalid": "todo"},  # This one is corrupt
                {"description": "Another valid", "id": "2", "completed": False, "created_at": "2024-01-02"}
            ]
        }
        
        with open(temp_storage.file_path, 'w') as f:
            json.dump(data, f)
        
        loaded = temp_storage.load()
        assert len(loaded) == 2  # Should skip the corrupt one
    
    def test_clear(self, temp_storage, sample_todos):
        """Test clearing all data."""
        temp_storage.save(sample_todos)
        assert temp_storage.exists()
        
        temp_storage.clear()
        assert not temp_storage.exists()
        assert not temp_storage.backup_path.exists()
    
    def test_exists(self, temp_storage, sample_todos):
        """Test file existence check."""
        assert not temp_storage.exists()
        
        temp_storage.save(sample_todos)
        assert temp_storage.exists()
    
    def test_get_file_path(self, temp_storage):
        """Test getting absolute file path."""
        path = temp_storage.get_file_path()
        assert "test_todos.json" in path
        assert Path(path).is_absolute()
    
    def test_unicode_support(self, temp_storage):
        """Test saving/loading todos with unicode characters."""
        todos = [
            Todo("日本語のタスク"),
            Todo("Tâche française"),
            Todo("Задача на русском"),
            Todo("Emoji test 🎉✅📝")
        ]
        
        temp_storage.save(todos)
        loaded = temp_storage.load()
        
        assert len(loaded) == 4
        assert loaded[0].description == "日本語のタスク"
        assert loaded[3].description == "Emoji test 🎉✅📝"
    
    def test_completed_todos_persist(self, temp_storage):
        """Test that completion status persists."""
        todos = [Todo("Task 1"), Todo("Task 2")]
        todos[0].mark_complete()
        
        temp_storage.save(todos)
        loaded = temp_storage.load()
        
        assert loaded[0].completed
        assert not loaded[1].completed
        assert loaded[0].completed_at is not None
```

**Run tests:**
```bash
pytest tests/test_storage.py -v
```

---

### Step 3: Update Package Imports

**Update:** `src/todo/__init__.py`

```python
"""
Todo List CLI - A simple command-line todo list application.
"""

__version__ = "0.1.2"
__author__ = "Nebula Protocol Test Project"

from .todo import Todo, TodoManager
from .storage import Storage, StorageError

__all__ = ["Todo", "TodoManager", "Storage", "StorageError"]
```

---

### Step 4: Integration Test

**Add to:** `tests/test_integration.py` (create if doesn't exist)

```python
"""
Integration tests for Todo + Storage.
"""
import pytest
from pathlib import Path
from todo.todo import TodoManager
from todo.storage import Storage


@pytest.fixture
def temp_file(tmp_path):
    """Temporary file for testing."""
    return tmp_path / "todos.json"


def test_full_workflow(temp_file):
    """Test complete add-save-load-complete-save-load workflow."""
    # Create manager and storage
    manager = TodoManager()
    storage = Storage(str(temp_file))
    
    # Add todos
    todo1 = manager.add("Buy milk")
    todo2 = manager.add("Write code")
    todo3 = manager.add("Read book")
    
    # Save
    storage.save(manager.list_all())
    
    # Create new manager and load
    new_manager = TodoManager()
    loaded_todos = storage.load()
    new_manager.load_todos(loaded_todos)
    
    assert new_manager.count()["total"] == 3
    
    # Complete one
    new_manager.complete(todo2.id)
    
    # Save again
    storage.save(new_manager.list_all())
    
    # Load again
    final_manager = TodoManager()
    final_manager.load_todos(storage.load())
    
    counts = final_manager.count()
    assert counts["total"] == 3
    assert counts["completed"] == 1
    assert counts["active"] == 2
```

---

### Step 5: Run Full Test Suite

```bash
pytest -v
pytest --cov=todo --cov-report=term-missing
```

**Expected Coverage:** 90%+ overall

---

### Step 6: Manual Testing

```bash
# Create test script
cat > test_storage_manual.py << 'EOF'
from todo.todo import TodoManager
from todo.storage import Storage

# Create manager
manager = TodoManager()
storage = Storage("test_todos.json")

# Add todos
manager.add("Test task 1")
manager.add("Test task 2")
manager.add("Test task 3")

# Save
storage.save(manager.list_all())
print(f"Saved to: {storage.get_file_path()}")

# Load
new_manager = TodoManager()
new_manager.load_todos(storage.load())
print(f"Loaded {new_manager.count()['total']} todos")

for todo in new_manager.list_all():
    print(f"  - {todo}")
EOF

python test_storage_manual.py
cat test_todos.json  # Inspect JSON file
```

---

## Validation Checklist

- [ ] Storage class implemented
- [ ] All file operations working
- [ ] Corruption recovery tested
- [ ] Backup functionality working
- [ ] All tests passing (15+ new tests)
- [ ] Integration test passing
- [ ] Unicode support verified
- [ ] Code coverage 90%+
- [ ] No errors logged (or all resolved)

---

## Next Star System

**STAR_SYSTEM_1.3_CLI_COMMANDS.md** - Command-line interface

---

**Status:** Ready for implementation  
**Estimated Time:** 1-2 hours  
**Difficulty:** Moderate

