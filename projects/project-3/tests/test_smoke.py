"""
Smoke tests for File Organizer.
"""

import sys


def test_package_importable():
    """Test that fileorg package can be imported."""
    import fileorg

    assert fileorg is not None


def test_package_version():
    """Test that package version is defined."""
    import fileorg

    assert hasattr(fileorg, "__version__")
    assert fileorg.__version__ == "0.0.1"


def test_modules_importable():
    """Test that all modules can be imported."""
    from fileorg import cli, scanner

    assert cli is not None
    assert scanner is not None


def test_scanner_class():
    """Test that FileScanner class exists."""
    from fileorg.scanner import FileScanner
    from pathlib import Path

    scanner = FileScanner(Path.cwd())
    assert scanner is not None


def test_cli_module():
    """Test that CLI module has main function."""
    from fileorg import cli

    assert hasattr(cli, "main")
    assert callable(cli.main)

