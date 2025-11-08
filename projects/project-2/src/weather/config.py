"""
Configuration management for Weather Dashboard.

Handles loading API keys, user preferences, and app settings.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Application configuration."""

    def __init__(self):
        """Initialize configuration."""
        # API Configuration
        self.api_key = os.getenv("OPENWEATHER_API_KEY", "")
        self.api_base_url = "https://api.openweathermap.org/data/2.5"

        # User Preferences
        self.default_units = os.getenv("UNITS", "metric")  # metric or imperial
        self.cache_duration = int(os.getenv("CACHE_DURATION", "300"))  # seconds

        # Paths
        self.cache_dir = Path.home() / ".weather-dashboard" / "cache"
        self.config_dir = Path.home() / ".weather-dashboard"

        # Create directories if they don't exist
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.config_dir.mkdir(parents=True, exist_ok=True)

    def is_valid(self) -> bool:
        """Check if configuration is valid (API key present)."""
        return bool(self.api_key and len(self.api_key) > 10)

    def get_api_key_instructions(self) -> str:
        """Get instructions for obtaining an API key."""
        return """
OpenWeatherMap API Key Required!

To get a free API key:
1. Go to: https://openweathermap.org/api
2. Click "Sign Up" (it's free!)
3. Verify your email
4. Go to API keys section
5. Copy your API key

Then create a .env file in this directory:
  OPENWEATHER_API_KEY=your_api_key_here
  UNITS=metric

Or set environment variable:
  export OPENWEATHER_API_KEY=your_api_key_here
"""


# Global config instance
config = Config()

