"""
Todo List CLI - A simple command-line todo list application.

This package provides functionality for managing todos including:
- Creating, reading, updating, and deleting todos
- Persisting todos to storage (JSON)
- Command-line interface for todo management
"""

__version__ = "0.1.2"
__author__ = "Nebula Protocol Test Project"

# Package-level imports
from .todo import Todo, TodoManager
from .storage import Storage, StorageError

__all__ = ["Todo", "TodoManager", "Storage", "StorageError"]
