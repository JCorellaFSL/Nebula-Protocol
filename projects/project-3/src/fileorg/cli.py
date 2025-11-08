"""
Command-line interface for File Organizer.
"""

import sys
import argparse
from pathlib import Path


def main():
    """Main entry point for CLI."""
    parser = argparse.ArgumentParser(
        description="File Organizer - Automatically sort files into folders",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  fileorg organize ~/Downloads --type    Organize by file type
  fileorg organize ~/Downloads --date    Organize by date
  fileorg --dry-run ~/Downloads          Preview changes
  fileorg undo                           Undo last organization
        """,
    )

    parser.add_argument(
        "command",
        choices=["organize", "undo", "watch"],
        help="Command to execute",
    )

    parser.add_argument(
        "path",
        nargs="?",
        type=Path,
        help="Directory to organize",
    )

    parser.add_argument(
        "--type", "-t",
        action="store_true",
        help="Organize by file type (default)",
    )

    parser.add_argument(
        "--date", "-d",
        action="store_true",
        help="Organize by date (Year/Month)",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without applying",
    )

    args = parser.parse_args()

    print(f"File Organizer v0.0.1")
    print(f"Command: {args.command}")
    print(f"Path: {args.path}")
    print(f"\nComing in Constellation 1!")

    return 0


if __name__ == "__main__":
    sys.exit(main())

