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
            print(f"{Fore.GREEN}[OK]{Style.RESET_ALL} Added: {todo.description}")
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
                status = f"{Fore.GREEN}[OK]{Style.RESET_ALL}"
                desc_color = Fore.WHITE
            else:
                status = f"{Fore.YELLOW}[  ]{Style.RESET_ALL}"
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
        print(f"{Fore.GREEN}[OK]{Style.RESET_ALL} Completed: {todo.description}")
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
        print(f"{Fore.GREEN}[OK]{Style.RESET_ALL} Deleted: {desc}")
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
    add_parser.add_argument("description", nargs='*', help="Todo description (no quotes needed)")

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
            description = ' '.join(args.description) if isinstance(args.description, list) else args.description
            cli.add(description)
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
