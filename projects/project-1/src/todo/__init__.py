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
