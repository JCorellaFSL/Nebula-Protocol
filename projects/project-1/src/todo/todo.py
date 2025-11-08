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
        completed_at: Optional[str] = None,
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
            "completed_at": self.completed_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Todo":
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
            completed_at=data.get("completed_at"),
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
        return sorted(self._todos.values(), key=lambda t: t.created_at)

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
            "completed": sum(1 for t in todos if t.completed),
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
