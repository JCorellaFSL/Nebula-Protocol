# Star System 1.1: Todo Logic

**Parent Constellation:** 1 - Core Functionality  
**Version Target:** 0.1.1.0  
**Status:** 🔄 Ready for Implementation  
**Complexity:** Moderate

---

## Purpose

Implement the core data structures and business logic for todo management. This includes the `Todo` class representing individual items and the `TodoManager` class for managing collections of todos.

---

## Prerequisites

- Star Gate 0 passed (environment and structure ready)
- Python 3.10+ with venv activated
- All dependencies installed
- Project structure in place

---

## Technical Implementation Steps

### Step 1: Implement Todo Class

**Create/Update:** `src/todo/todo.py`

```python
"""
Core todo management logic.

This module handles todo operations:
- Creating todos
- Reading/listing todos
- Updating todos
- Deleting todos
- Marking todos as complete
"""
import uuid
from datetime import datetime
from typing import Optional


class Todo:
    """
    Represents a single todo item.
    
    Attributes:
        id (str): Unique identifier (UUID4)
        description (str): Todo description
        completed (bool): Completion status
        created_at (str): ISO 8601 timestamp of creation
        completed_at (Optional[str]): ISO 8601 timestamp of completion
    """
    
    def __init__(
        self,
        description: str,
        id: Optional[str] = None,
        completed: bool = False,
        created_at: Optional[str] = None,
        completed_at: Optional[str] = None
    ):
        """
        Initialize a new Todo item.
        
        Args:
            description: The todo description
            id: Optional UUID (generated if not provided)
            completed: Initial completion status
            created_at: Optional creation timestamp (current time if not provided)
            completed_at: Optional completion timestamp
        
        Raises:
            ValueError: If description is empty or whitespace only
        """
        if not description or not description.strip():
            raise ValueError("Todo description cannot be empty")
        
        self.id = id or str(uuid.uuid4())
        self.description = description.strip()
        self.completed = completed
        self.created_at = created_at or datetime.now().isoformat()
        self.completed_at = completed_at
    
    def mark_complete(self) -> None:
        """Mark this todo as complete with current timestamp."""
        if not self.completed:
            self.completed = True
            self.completed_at = datetime.now().isoformat()
    
    def mark_incomplete(self) -> None:
        """Mark this todo as incomplete."""
        if self.completed:
            self.completed = False
            self.completed_at = None
    
    def to_dict(self) -> dict:
        """
        Convert todo to dictionary for serialization.
        
        Returns:
            Dictionary representation of the todo
        """
        return {
            "id": self.id,
            "description": self.description,
            "completed": self.completed,
            "created_at": self.created_at,
            "completed_at": self.completed_at
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Todo':
        """
        Create Todo from dictionary (deserialization).
        
        Args:
            data: Dictionary with todo data
        
        Returns:
            New Todo instance
        
        Raises:
            KeyError: If required keys are missing
            ValueError: If data is invalid
        """
        return cls(
            description=data["description"],
            id=data.get("id"),
            completed=data.get("completed", False),
            created_at=data.get("created_at"),
            completed_at=data.get("completed_at")
        )
    
    def __str__(self) -> str:
        """String representation for display."""
        status = "✓" if self.completed else " "
        return f"[{status}] {self.description}"
    
    def __repr__(self) -> str:
        """Developer-friendly representation."""
        return f"Todo(id={self.id[:8]}..., description={self.description!r}, completed={self.completed})"


class TodoManager:
    """
    Manages a collection of todos.
    
    Provides operations for adding, listing, completing,
    and deleting todos from the collection.
    """
    
    def __init__(self):
        """Initialize empty todo manager."""
        self._todos: dict[str, Todo] = {}
    
    def add(self, description: str) -> Todo:
        """
        Add a new todo.
        
        Args:
            description: Todo description
        
        Returns:
            The newly created Todo
        
        Raises:
            ValueError: If description is invalid
        """
        todo = Todo(description)
        self._todos[todo.id] = todo
        return todo
    
    def get(self, todo_id: str) -> Optional[Todo]:
        """
        Get a todo by ID.
        
        Args:
            todo_id: The todo's UUID
        
        Returns:
            The Todo if found, None otherwise
        """
        return self._todos.get(todo_id)
    
    def list_all(self) -> list[Todo]:
        """
        Get all todos.
        
        Returns:
            List of all todos, sorted by creation date (oldest first)
        """
        return sorted(
            self._todos.values(),
            key=lambda t: t.created_at
        )
    
    def list_active(self) -> list[Todo]:
        """
        Get all incomplete todos.
        
        Returns:
            List of incomplete todos, sorted by creation date
        """
        return [t for t in self.list_all() if not t.completed]
    
    def list_completed(self) -> list[Todo]:
        """
        Get all completed todos.
        
        Returns:
            List of completed todos, sorted by completion date
        """
        completed = [t for t in self._todos.values() if t.completed]
        return sorted(completed, key=lambda t: t.completed_at or "")
    
    def complete(self, todo_id: str) -> bool:
        """
        Mark a todo as complete.
        
        Args:
            todo_id: The todo's UUID
        
        Returns:
            True if todo was marked complete, False if not found
        """
        todo = self.get(todo_id)
        if todo:
            todo.mark_complete()
            return True
        return False
    
    def delete(self, todo_id: str) -> bool:
        """
        Delete a todo.
        
        Args:
            todo_id: The todo's UUID
        
        Returns:
            True if todo was deleted, False if not found
        """
        if todo_id in self._todos:
            del self._todos[todo_id]
            return True
        return False
    
    def count(self) -> dict[str, int]:
        """
        Get todo counts by status.
        
        Returns:
            Dictionary with 'total', 'active', 'completed' counts
        """
        todos = list(self._todos.values())
        return {
            "total": len(todos),
            "active": sum(1 for t in todos if not t.completed),
            "completed": sum(1 for t in todos if t.completed)
        }
    
    def clear_completed(self) -> int:
        """
        Delete all completed todos.
        
        Returns:
            Number of todos deleted
        """
        completed_ids = [t.id for t in self._todos.values() if t.completed]
        for todo_id in completed_ids:
            del self._todos[todo_id]
        return len(completed_ids)
    
    def load_todos(self, todos: list[Todo]) -> None:
        """
        Load todos from external source (used by Storage).
        
        Args:
            todos: List of Todo objects to load
        """
        self._todos = {t.id: t for t in todos}
    
    def get_all_as_dicts(self) -> list[dict]:
        """
        Get all todos as dictionaries (for serialization).
        
        Returns:
            List of todo dictionaries
        """
        return [t.to_dict() for t in self.list_all()]
```

**Validation:**
```bash
# Test imports
python -c "from todo.todo import Todo, TodoManager; print('Imports successful')"
```

---

### Step 2: Create Unit Tests

**Create:** `tests/test_todo.py`

```python
"""
Unit tests for Todo and TodoManager classes.
"""
import pytest
from datetime import datetime
from todo.todo import Todo, TodoManager


class TestTodo:
    """Tests for Todo class."""
    
    def test_create_todo(self):
        """Test basic todo creation."""
        todo = Todo("Buy groceries")
        assert todo.description == "Buy groceries"
        assert todo.completed is False
        assert todo.id is not None
        assert todo.created_at is not None
    
    def test_empty_description_raises_error(self):
        """Test that empty description raises ValueError."""
        with pytest.raises(ValueError, match="cannot be empty"):
            Todo("")
        
        with pytest.raises(ValueError, match="cannot be empty"):
            Todo("   ")
    
    def test_description_is_stripped(self):
        """Test that leading/trailing whitespace is removed."""
        todo = Todo("  Task with spaces  ")
        assert todo.description == "Task with spaces"
    
    def test_mark_complete(self):
        """Test marking todo as complete."""
        todo = Todo("Test task")
        assert not todo.completed
        assert todo.completed_at is None
        
        todo.mark_complete()
        assert todo.completed
        assert todo.completed_at is not None
    
    def test_mark_incomplete(self):
        """Test marking todo as incomplete."""
        todo = Todo("Test task")
        todo.mark_complete()
        assert todo.completed
        
        todo.mark_incomplete()
        assert not todo.completed
        assert todo.completed_at is None
    
    def test_to_dict(self):
        """Test conversion to dictionary."""
        todo = Todo("Test task")
        data = todo.to_dict()
        
        assert data["description"] == "Test task"
        assert data["completed"] is False
        assert "id" in data
        assert "created_at" in data
    
    def test_from_dict(self):
        """Test creation from dictionary."""
        data = {
            "id": "test-id-123",
            "description": "Test task",
            "completed": False,
            "created_at": "2024-01-01T12:00:00",
            "completed_at": None
        }
        todo = Todo.from_dict(data)
        
        assert todo.id == "test-id-123"
        assert todo.description == "Test task"
        assert not todo.completed
    
    def test_str_representation(self):
        """Test string representation."""
        todo = Todo("Test task")
        assert "Test task" in str(todo)
        assert "[ ]" in str(todo)
        
        todo.mark_complete()
        assert "[✓]" in str(todo)


class TestTodoManager:
    """Tests for TodoManager class."""
    
    def test_add_todo(self):
        """Test adding a todo."""
        manager = TodoManager()
        todo = manager.add("Buy milk")
        
        assert todo.description == "Buy milk"
        assert manager.count()["total"] == 1
    
    def test_get_todo(self):
        """Test retrieving a todo by ID."""
        manager = TodoManager()
        todo = manager.add("Test task")
        
        retrieved = manager.get(todo.id)
        assert retrieved is not None
        assert retrieved.id == todo.id
        assert retrieved.description == "Test task"
    
    def test_get_nonexistent_todo(self):
        """Test getting todo that doesn't exist."""
        manager = TodoManager()
        assert manager.get("nonexistent-id") is None
    
    def test_list_all(self):
        """Test listing all todos."""
        manager = TodoManager()
        manager.add("Task 1")
        manager.add("Task 2")
        manager.add("Task 3")
        
        todos = manager.list_all()
        assert len(todos) == 3
    
    def test_list_active(self):
        """Test listing only active todos."""
        manager = TodoManager()
        todo1 = manager.add("Task 1")
        manager.add("Task 2")
        todo3 = manager.add("Task 3")
        
        manager.complete(todo1.id)
        
        active = manager.list_active()
        assert len(active) == 2
        assert todo3 in active
    
    def test_list_completed(self):
        """Test listing only completed todos."""
        manager = TodoManager()
        todo1 = manager.add("Task 1")
        manager.add("Task 2")
        
        manager.complete(todo1.id)
        
        completed = manager.list_completed()
        assert len(completed) == 1
        assert todo1 in completed
    
    def test_complete_todo(self):
        """Test completing a todo."""
        manager = TodoManager()
        todo = manager.add("Test task")
        
        assert not todo.completed
        result = manager.complete(todo.id)
        
        assert result is True
        assert todo.completed
    
    def test_complete_nonexistent_todo(self):
        """Test completing todo that doesn't exist."""
        manager = TodoManager()
        result = manager.complete("nonexistent-id")
        assert result is False
    
    def test_delete_todo(self):
        """Test deleting a todo."""
        manager = TodoManager()
        todo = manager.add("Test task")
        
        assert manager.count()["total"] == 1
        result = manager.delete(todo.id)
        
        assert result is True
        assert manager.count()["total"] == 0
    
    def test_delete_nonexistent_todo(self):
        """Test deleting todo that doesn't exist."""
        manager = TodoManager()
        result = manager.delete("nonexistent-id")
        assert result is False
    
    def test_count(self):
        """Test count statistics."""
        manager = TodoManager()
        todo1 = manager.add("Task 1")
        manager.add("Task 2")
        manager.add("Task 3")
        
        manager.complete(todo1.id)
        
        counts = manager.count()
        assert counts["total"] == 3
        assert counts["active"] == 2
        assert counts["completed"] == 1
    
    def test_clear_completed(self):
        """Test clearing completed todos."""
        manager = TodoManager()
        todo1 = manager.add("Task 1")
        manager.add("Task 2")
        todo3 = manager.add("Task 3")
        
        manager.complete(todo1.id)
        manager.complete(todo3.id)
        
        cleared = manager.clear_completed()
        assert cleared == 2
        assert manager.count()["total"] == 1
```

**Run tests:**
```bash
pytest tests/test_todo.py -v
```

**Expected:** All tests passing

---

### Step 3: Update Package __init__.py

**Update:** `src/todo/__init__.py`

```python
"""
Todo List CLI - A simple command-line todo list application.

This package provides functionality for managing todos including:
- Creating, reading, updating, and deleting todos
- Persisting todos to storage (JSON)
- Command-line interface for todo management
"""

__version__ = "0.1.1"
__author__ = "Nebula Protocol Test Project"

# Package-level imports
from .todo import Todo, TodoManager

__all__ = ["Todo", "TodoManager"]
```

---

### Step 4: Run Full Test Suite

```bash
# Run all tests
pytest -v

# With coverage
pytest --cov=todo --cov-report=html --cov-report=term-missing
```

**Expected Coverage:** 85%+ for todo.py

---

### Step 5: Code Quality Checks

```bash
# Format code
black src/ tests/

# Lint code
flake8 src/ tests/

# Type checking (optional but recommended)
mypy src/todo/todo.py
```

**Expected:** All checks passing

---

## Error Logging

Log any errors encountered:

```javascript
// From .nebula/tools/
const pm = new ProjectMemory('../..', 'todo-list-cli', 'python');
pm.logError({
  level: 'ERROR',
  phase: 'Constellation 1: Core',
  constellation: 'Todo Logic',
  message: 'Error description',
  stackTrace: 'Full stack trace',
  context: 'What you were doing'
});
pm.close();
```

---

## Validation Checklist

- [ ] Todo class implemented with all methods
- [ ] TodoManager class implemented with all operations
- [ ] All unit tests passing (20+ tests)
- [ ] Code coverage 85%+
- [ ] Black formatting applied
- [ ] Flake8 passing
- [ ] Type hints added (optional)
- [ ] All imports working
- [ ] No errors logged (or all errors resolved)

---

## Common Issues & Solutions

### Issue: Import errors
**Solution:** Ensure venv is activated and `pip install -e .` was run

### Issue: UUID import fails
**Solution:** UUID is in standard library, check Python version

### Issue: Tests fail with missing pytest
**Solution:** Run `pip install pytest pytest-cov`

---

## Next Star System

**STAR_SYSTEM_1.2_STORAGE.md** - JSON persistence implementation

---

**Status:** Ready for implementation  
**Estimated Time:** 1-2 hours  
**Difficulty:** Moderate

