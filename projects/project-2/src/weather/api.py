"""
OpenWeatherMap API client.

Handles all communication with the OpenWeatherMap API.
"""

import requests
from typing import Optional, Dict, Any
from .config import config


class WeatherAPI:
    """Client for OpenWeatherMap API."""

    def __init__(self):
        """Initialize API client."""
        self.api_key = config.api_key
        self.base_url = config.api_base_url
        self.timeout = 10  # seconds

    def get_current_weather(
        self, city: str, units: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get current weather for a city.

        Args:
            city: City name (e.g., "London" or "London,UK")
            units: Temperature units ("metric" or "imperial")

        Returns:
            Weather data dictionary

        Raises:
            ValueError: If API key is missing or city not found
            requests.RequestException: If network error occurs
        """
        if not config.is_valid():
            raise ValueError(config.get_api_key_instructions())

        units = units or config.default_units

        url = f"{self.base_url}/weather"
        params = {"q": city, "appid": self.api_key, "units": units}

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.HTTPError as e:
            if e.response.status_code == 404:
                raise ValueError(f"City not found: {city}")
            elif e.response.status_code == 401:
                raise ValueError("Invalid API key. Please check your .env file.")
            else:
                raise ValueError(f"API error: {e}")
        except requests.RequestException as e:
            raise ValueError(f"Network error: {e}")

    def get_forecast(
        self, city: str, units: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get 5-day forecast for a city.

        Args:
            city: City name
            units: Temperature units

        Returns:
            Forecast data dictionary

        Raises:
            ValueError: If API key is missing or city not found
            requests.RequestException: If network error occurs
        """
        if not config.is_valid():
            raise ValueError(config.get_api_key_instructions())

        units = units or config.default_units

        url = f"{self.base_url}/forecast"
        params = {"q": city, "appid": self.api_key, "units": units}

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.HTTPError as e:
            if e.response.status_code == 404:
                raise ValueError(f"City not found: {city}")
            elif e.response.status_code == 401:
                raise ValueError("Invalid API key. Please check your .env file.")
            else:
                raise ValueError(f"API error: {e}")
        except requests.RequestException as e:
            raise ValueError(f"Network error: {e}")

