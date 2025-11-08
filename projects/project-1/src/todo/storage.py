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
