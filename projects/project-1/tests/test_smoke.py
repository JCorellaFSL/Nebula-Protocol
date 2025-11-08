"""
Smoke tests to verify basic setup is working.

These tests validate that:
1. Package is importable
2. Basic functionality exists
3. CLI entry point works
"""

import sys
import subprocess


def test_package_importable():
    """Test that the todo package can be imported."""
    import todo

    assert todo is not None


def test_package_version():
    """Test that package version is defined."""
    import todo

    assert hasattr(todo, "__version__")
    assert todo.__version__ == "0.1.3"


def test_cli_module_exists():
    """Test that CLI module exists and has main function."""
    from todo import cli

    assert hasattr(cli, "main")
    assert callable(cli.main)


def test_cli_runs():
    """Test that CLI entry point executes without errors."""
    result = subprocess.run(
        [sys.executable, "-m", "todo.cli"], capture_output=True, text=True
    )
    assert result.returncode == 0
    assert "todo list manager" in result.stdout.lower()


def test_todo_classes_exist():
    """Test that core todo classes are defined."""
    from todo import todo

    assert hasattr(todo, "Todo")
    assert hasattr(todo, "TodoManager")


def test_storage_class_exists():
    """Test that storage class is defined."""
    from todo import storage

    assert hasattr(storage, "Storage")
