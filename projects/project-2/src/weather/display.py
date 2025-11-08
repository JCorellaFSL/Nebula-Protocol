"""
Terminal display formatting for weather data.

Uses rich library for beautiful terminal output.
"""

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from typing import Dict, Any

console = Console()


def display_current_weather(data: Dict[str, Any], units: str = "metric") -> None:
    """
    Display current weather in a formatted table.

    Args:
        data: Weather data from API
        units: Temperature units used
    """
    # Extract data
    city = data["name"]
    country = data["sys"]["country"]
    temp = data["main"]["temp"]
    feels_like = data["main"]["feels_like"]
    description = data["weather"][0]["description"].title()
    humidity = data["main"]["humidity"]
    wind_speed = data["wind"]["speed"]

    # Unit symbol
    temp_unit = "°C" if units == "metric" else "°F"
    wind_unit = "m/s" if units == "metric" else "mph"

    # Weather emoji
    weather_emoji = get_weather_emoji(data["weather"][0]["main"])

    # Create table
    table = Table(title=f"{weather_emoji} Weather in {city}, {country}")

    table.add_column("Metric", style="cyan", no_wrap=True)
    table.add_column("Value", style="green")

    table.add_row("Temperature", f"{temp}{temp_unit}")
    table.add_row("Feels Like", f"{feels_like}{temp_unit}")
    table.add_row("Conditions", description)
    table.add_row("Humidity", f"{humidity}%")
    table.add_row("Wind Speed", f"{wind_speed} {wind_unit}")

    console.print(table)


def get_weather_emoji(condition: str) -> str:
    """Get emoji for weather condition."""
    emojis = {
        "Clear": "☀️",
        "Clouds": "☁️",
        "Rain": "🌧️",
        "Drizzle": "🌦️",
        "Thunderstorm": "⛈️",
        "Snow": "❄️",
        "Mist": "🌫️",
        "Fog": "🌫️",
    }
    return emojis.get(condition, "🌤️")


def display_error(message: str) -> None:
    """Display error message."""
    console.print(f"[bold red]❌ Error:[/bold red] {message}")


def display_success(message: str) -> None:
    """Display success message."""
    console.print(f"[bold green]✅[/bold green] {message}")


def display_info(message: str) -> None:
    """Display info message."""
    console.print(f"[bold cyan]ℹ️[/bold cyan] {message}")

