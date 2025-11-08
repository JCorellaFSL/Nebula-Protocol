"""
Integration tests for Todo + Storage + CLI.
"""

import pytest
from pathlib import Path
from todo.todo import TodoManager
from todo.storage import Storage
from todo.cli import CLI


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


def test_cli_full_workflow(tmp_path, capsys):
    """Test complete CLI workflow."""
    file_path = tmp_path / "todos.json"
    cli = CLI(str(file_path))

    # Add todos
    cli.add("Buy milk")
    cli.add("Write code")
    cli.add("Read book")

    # List all
    cli.list()
    output = capsys.readouterr().out
    assert "Buy milk" in output
    assert "Total: 3" in output

    # Complete one
    todos = cli.manager.list_all()
    cli.complete(todos[0].id[:8])  # Use partial ID

    # Check stats
    counts = cli.manager.count()
    assert counts["completed"] == 1
    assert counts["active"] == 2

    # Delete one
    cli.delete(todos[1].id[:8])

    # Final check
    assert cli.manager.count()["total"] == 2

