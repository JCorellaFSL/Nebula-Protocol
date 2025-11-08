# Star System 1.3: CLI Commands

**Parent Constellation:** 1 - Core Functionality  
**Version Target:** 0.1.3.0  
**Status:** 🔄 Ready for Implementation  
**Complexity:** Moderate

---

## Purpose

Implement the command-line interface using argparse. This connects the Todo and Storage layers to provide user-facing commands for managing todos.

---

## Prerequisites

- Star System 1.1 complete (Todo logic)
- Star System 1.2 complete (Storage)
- All tests passing from previous Star Systems

---

## Technical Implementation Steps

### Step 1: Implement CLI Module

**Update:** `src/todo/cli.py`

```python
"""
Command-line interface for Todo List CLI.

Provides commands:
- add: Add a new todo
- list: List todos (all, active, or completed)
- complete: Mark todo as complete
- delete: Delete a todo
"""
import sys
import argparse
from typing import Optional
from colorama import init, Fore, Style
from .todo import TodoManager
from .storage import Storage, StorageError

# Initialize colorama for cross-platform color support
init(autoreset=True)


class CLI:
    """Command-line interface for todo management."""
    
    def __init__(self, storage_path: str = "todos.json"):
        """
        Initialize CLI.
        
        Args:
            storage_path: Path to todos JSON file
        """
        self.storage = Storage(storage_path)
        self.manager = TodoManager()
        self._load_todos()
    
    def _load_todos(self) -> None:
        """Load todos from storage."""
        try:
            todos = self.storage.load()
            self.manager.load_todos(todos)
        except StorageError as e:
            print(f"{Fore.RED}Error loading todos: {e}{Style.RESET_ALL}")
            sys.exit(1)
    
    def _save_todos(self) -> None:
        """Save todos to storage."""
        try:
            self.storage.save(self.manager.list_all())
        except StorageError as e:
            print(f"{Fore.RED}Error saving todos: {e}{Style.RESET_ALL}")
            sys.exit(1)
    
    def add(self, description: str) -> None:
        """
        Add a new todo.
        
        Args:
            description: Todo description
        """
        try:
            todo = self.manager.add(description)
            self._save_todos()
            print(f"{Fore.GREEN}✓{Style.RESET_ALL} Added: {todo.description}")
            self._print_stats()
        except ValueError as e:
            print(f"{Fore.RED}Error: {e}{Style.RESET_ALL}")
            sys.exit(1)
    
    def list(self, filter_type: str = "all") -> None:
        """
        List todos.
        
        Args:
            filter_type: 'all', 'active', or 'completed'
        """
        if filter_type == "active":
            todos = self.manager.list_active()
            title = "Active Todos"
        elif filter_type == "completed":
            todos = self.manager.list_completed()
            title = "Completed Todos"
        else:
            todos = self.manager.list_all()
            title = "All Todos"
        
        if not todos:
            print(f"\n{Fore.YELLOW}No todos found{Style.RESET_ALL}")
            if filter_type == "all":
                print(f"Add your first todo: {Fore.CYAN}todo add \"Your task\"{Style.RESET_ALL}")
            return
        
        print(f"\n{Fore.CYAN}{'=' * 60}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{title}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{'=' * 60}{Style.RESET_ALL}\n")
        
        for i, todo in enumerate(todos, 1):
            # Format status
            if todo.completed:
                status = f"{Fore.GREEN}✓{Style.RESET_ALL}"
                desc_color = Fore.WHITE
            else:
                status = f"{Fore.YELLOW}○{Style.RESET_ALL}"
                desc_color = Fore.WHITE
            
            # Format ID (first 8 characters)
            short_id = todo.id[:8]
            
            print(f"{status} [{Fore.CYAN}{short_id}{Style.RESET_ALL}] {desc_color}{todo.description}{Style.RESET_ALL}")
        
        print(f"\n{Fore.CYAN}{'=' * 60}{Style.RESET_ALL}")
        self._print_stats()
    
    def complete(self, todo_id: str) -> None:
        """
        Mark todo as complete.
        
        Args:
            todo_id: Todo ID (full or partial)
        """
        # Find todo by full or partial ID
        todo = self._find_todo_by_id(todo_id)
        if not todo:
            print(f"{Fore.RED}Error: Todo not found: {todo_id}{Style.RESET_ALL}")
            print(f"Use {Fore.CYAN}todo list{Style.RESET_ALL} to see all todos")
            sys.exit(1)
        
        if todo.completed:
            print(f"{Fore.YELLOW}Todo already completed: {todo.description}{Style.RESET_ALL}")
            return
        
        self.manager.complete(todo.id)
        self._save_todos()
        print(f"{Fore.GREEN}✓{Style.RESET_ALL} Completed: {todo.description}")
        self._print_stats()
    
    def delete(self, todo_id: str) -> None:
        """
        Delete a todo.
        
        Args:
            todo_id: Todo ID (full or partial)
        """
        todo = self._find_todo_by_id(todo_id)
        if not todo:
            print(f"{Fore.RED}Error: Todo not found: {todo_id}{Style.RESET_ALL}")
            print(f"Use {Fore.CYAN}todo list{Style.RESET_ALL} to see all todos")
            sys.exit(1)
        
        desc = todo.description
        self.manager.delete(todo.id)
        self._save_todos()
        print(f"{Fore.GREEN}✓{Style.RESET_ALL} Deleted: {desc}")
        self._print_stats()
    
    def _find_todo_by_id(self, partial_id: str) -> Optional:
        """
        Find todo by full or partial ID.
        
        Args:
            partial_id: Full or partial UUID
        
        Returns:
            Todo if found, None otherwise
        """
        # Try exact match first
        todo = self.manager.get(partial_id)
        if todo:
            return todo
        
        # Try partial match (at least 4 characters)
        if len(partial_id) < 4:
            return None
        
        matches = [
            t for t in self.manager.list_all()
            if t.id.startswith(partial_id)
        ]
        
        if len(matches) == 1:
            return matches[0]
        elif len(matches) > 1:
            print(f"{Fore.YELLOW}Ambiguous ID, multiple matches:{Style.RESET_ALL}")
            for match in matches:
                print(f"  {match.id[:8]} - {match.description}")
            return None
        
        return None
    
    def _print_stats(self) -> None:
        """Print todo statistics."""
        counts = self.manager.count()
        print(f"\nTotal: {counts['total']} | "
              f"{Fore.YELLOW}Active: {counts['active']}{Style.RESET_ALL} | "
              f"{Fore.GREEN}Completed: {counts['completed']}{Style.RESET_ALL}\n")


def main():
    """
    Main entry point for the CLI application.
    """
    parser = argparse.ArgumentParser(
        description="Simple command-line todo list manager",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  todo add "Buy groceries"       Add a new todo
  todo list                      List all todos
  todo list --active             List active todos only
  todo list --completed          List completed todos only
  todo complete <id>             Mark todo as complete
  todo delete <id>               Delete a todo
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Add command
    add_parser = subparsers.add_parser("add", help="Add a new todo")
    add_parser.add_argument("description", help="Todo description")
    
    # List command
    list_parser = subparsers.add_parser("list", help="List todos")
    list_group = list_parser.add_mutually_exclusive_group()
    list_group.add_argument("--active", action="store_true", help="Show only active todos")
    list_group.add_argument("--completed", action="store_true", help="Show only completed todos")
    
    # Complete command
    complete_parser = subparsers.add_parser("complete", help="Mark todo as complete")
    complete_parser.add_argument("id", help="Todo ID (full or partial)")
    
    # Delete command
    delete_parser = subparsers.add_parser("delete", help="Delete a todo")
    delete_parser.add_argument("id", help="Todo ID (full or partial)")
    
    # Parse arguments
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 0
    
    # Create CLI instance
    cli = CLI()
    
    # Execute command
    try:
        if args.command == "add":
            cli.add(args.description)
        elif args.command == "list":
            if args.active:
                cli.list("active")
            elif args.completed:
                cli.list("completed")
            else:
                cli.list("all")
        elif args.command == "complete":
            cli.complete(args.id)
        elif args.command == "delete":
            cli.delete(args.id)
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Cancelled{Style.RESET_ALL}")
        return 130
    except Exception as e:
        print(f"{Fore.RED}Unexpected error: {e}{Style.RESET_ALL}")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

---

### Step 2: Create CLI Tests

**Create:** `tests/test_cli.py`

```python
"""
Tests for CLI module.
"""
import pytest
from io import StringIO
from unittest.mock import patch
from todo.cli import CLI
from todo.storage import Storage


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
```

---

### Step 3: End-to-End Test

**Add to:** `tests/test_integration.py`

```python
def test_cli_full_workflow(tmp_path, capsys):
    """Test complete CLI workflow."""
    from todo.cli import CLI
    
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
```

---

### Step 4: Update Package Entry Point

**Update:** `pyproject.toml`

Verify the entry point exists:

```toml
[project.scripts]
todo = "todo.cli:main"
```

---

### Step 5: Manual Testing

```bash
# Install in development mode
pip install -e .

# Test commands
todo add "Buy groceries"
todo add "Write documentation"
todo add "Fix bugs"

todo list

todo complete <id>  # Use first few characters of ID shown in list

todo list --active
todo list --completed

todo delete <id>

todo list
```

**Expected:** All commands work, colored output displays correctly

---

### Step 6: Run Full Test Suite

```bash
# All tests
pytest -v

# With coverage
pytest --cov=todo --cov-report=html --cov-report=term-missing

# Integration tests
pytest tests/test_integration.py -v
```

**Expected Coverage:** 85%+ overall

---

## Validation Checklist

- [ ] CLI class implemented
- [ ] All 4 commands working (add, list, complete, delete)
- [ ] Colored output working
- [ ] Partial ID matching working
- [ ] Error handling for invalid input
- [ ] All tests passing (20+ CLI tests)
- [ ] Integration tests passing
- [ ] Entry point works (`todo` command available)
- [ ] Manual testing successful
- [ ] Code coverage 85%+
- [ ] No errors logged (or all resolved)

---

## Next Step

**STAR_GATE_1_CORE.md** - Validate all core functionality before deployment

---

**Status:** Ready for implementation  
**Estimated Time:** 2-3 hours  
**Difficulty:** Moderate

