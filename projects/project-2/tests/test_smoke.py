"""
Smoke tests for Weather Dashboard.
"""

import sys
import subprocess


def test_package_importable():
    """Test that weather package can be imported."""
    import weather

    assert weather is not None


def test_package_version():
    """Test that package version is defined."""
    import weather

    assert hasattr(weather, "__version__")
    assert weather.__version__ == "0.0.1"


def test_modules_importable():
    """Test that all modules can be imported."""
    from weather import config, api, display, cli

    assert config is not None
    assert api is not None
    assert display is not None
    assert cli is not None


def test_config_loads():
    """Test that config loads without errors."""
    from weather.config import config

    # Should load even without API key
    assert config is not None
    assert config.default_units in ["metric", "imperial"]


def test_cli_runs():
    """Test that CLI entry point executes."""
    result = subprocess.run(
        [sys.executable, "-m", "weather.cli"], capture_output=True, text=True
    )
    # Should show help when no args
    assert result.returncode == 0
    assert "weather" in result.stdout.lower()

