"""
Tests for CLI module.
"""

import pytest
from todo.cli import CLI


@pytest.fixture
def temp_cli(tmp_path):
    """Create CLI with temporary storage."""
    file_path = tmp_path / "test_todos.json"
    return CLI(str(file_path))


class TestCLI:
    """Tests for CLI class."""

    def test_add_todo(self, temp_cli):
        """Test adding todo via CLI."""
        temp_cli.add("Test task")
        todos = temp_cli.manager.list_all()
        assert len(todos) == 1
        assert todos[0].description == "Test task"

    def test_list_empty(self, temp_cli, capsys):
        """Test listing when no todos exist."""
        temp_cli.list()
        output = capsys.readouterr().out
        assert "No todos found" in output

    def test_list_all(self, temp_cli, capsys):
        """Test listing all todos."""
        temp_cli.add("Task 1")
        temp_cli.add("Task 2")

        temp_cli.list()
        output = capsys.readouterr().out
        assert "Task 1" in output
        assert "Task 2" in output

    def test_list_active(self, temp_cli, capsys):
        """Test listing active todos only."""
        temp_cli.add("Active task")
        temp_cli.add("To be completed")

        todos = temp_cli.manager.list_all()
        temp_cli.manager.complete(todos[1].id)
        temp_cli._save_todos()

        # Clear captured output from add() calls
        capsys.readouterr()
        
        temp_cli.list("active")
        output = capsys.readouterr().out
        assert "Active task" in output
        assert "To be completed" not in output

    def test_list_completed(self, temp_cli, capsys):
        """Test listing completed todos only."""
        temp_cli.add("Task 1")
        temp_cli.add("Task 2")

        todos = temp_cli.manager.list_all()
        temp_cli.manager.complete(todos[0].id)
        temp_cli._save_todos()

        # Clear captured output from add() calls
        capsys.readouterr()
        
        temp_cli.list("completed")
        output = capsys.readouterr().out
        assert "Task 1" in output
        assert "Task 2" not in output

    def test_complete_todo(self, temp_cli):
        """Test completing todo via CLI."""
        temp_cli.add("Test task")
        todos = temp_cli.manager.list_all()

        temp_cli.complete(todos[0].id)

        updated = temp_cli.manager.get(todos[0].id)
        assert updated.completed

    def test_complete_with_partial_id(self, temp_cli):
        """Test completing todo with partial ID."""
        temp_cli.add("Test task")
        todos = temp_cli.manager.list_all()

        # Use first 8 characters of ID
        partial_id = todos[0].id[:8]
        temp_cli.complete(partial_id)

        updated = temp_cli.manager.get(todos[0].id)
        assert updated.completed

    def test_complete_nonexistent_todo(self, temp_cli):
        """Test completing todo that doesn't exist."""
        with pytest.raises(SystemExit):
            temp_cli.complete("nonexistent")

    def test_delete_todo(self, temp_cli):
        """Test deleting todo via CLI."""
        temp_cli.add("Test task")
        assert temp_cli.manager.count()["total"] == 1

        todos = temp_cli.manager.list_all()
        temp_cli.delete(todos[0].id)

        assert temp_cli.manager.count()["total"] == 0

    def test_delete_with_partial_id(self, temp_cli):
        """Test deleting todo with partial ID."""
        temp_cli.add("Test task")
        todos = temp_cli.manager.list_all()

        partial_id = todos[0].id[:8]
        temp_cli.delete(partial_id)

        assert temp_cli.manager.count()["total"] == 0

    def test_delete_nonexistent_todo(self, temp_cli):
        """Test deleting todo that doesn't exist."""
        with pytest.raises(SystemExit):
            temp_cli.delete("nonexistent")

    def test_persistence(self, tmp_path):
        """Test that todos persist across CLI instances."""
        file_path = tmp_path / "test_todos.json"

        # First CLI instance
        cli1 = CLI(str(file_path))
        cli1.add("Persistent task")

        # Second CLI instance (should load from file)
        cli2 = CLI(str(file_path))
        todos = cli2.manager.list_all()

        assert len(todos) == 1
        assert todos[0].description == "Persistent task"

