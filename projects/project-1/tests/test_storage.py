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
        
        # Save again to create backup
        sample_todos[0].mark_complete()
        temp_storage.save(sample_todos)

        # Corrupt main file (backup should still be good)
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
                {
                    "description": "Valid todo",
                    "id": "1",
                    "completed": False,
                    "created_at": "2024-01-01"
                },
                {"invalid": "todo"},  # This one is corrupt
                {
                    "description": "Another valid",
                    "id": "2",
                    "completed": False,
                    "created_at": "2024-01-02"
                }
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

