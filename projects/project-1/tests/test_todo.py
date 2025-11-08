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
            "completed_at": None,
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
