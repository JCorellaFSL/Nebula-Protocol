"""
Command-line interface for Weather Dashboard.

Provides commands:
- weather <city>: Get current weather
- weather forecast <city>: Get 5-day forecast
- weather --units F: Change temperature units
"""

import sys
import argparse
from .api import WeatherAPI
from .display import display_current_weather, display_error, display_info
from .config import config


def main():
    """Main entry point for CLI."""
    parser = argparse.ArgumentParser(
        description="Weather Dashboard - Check weather from the command line",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  weather London              Get weather for London
  weather New York            Get weather for New York
  weather Tokyo --units F     Get weather in Fahrenheit
  weather forecast Paris      Get 5-day forecast for Paris
        """,
    )

    parser.add_argument(
        "city",
        nargs="*",
        help="City name (can be multiple words, no quotes needed)",
    )

    parser.add_argument(
        "--units",
        "-u",
        choices=["C", "F", "metric", "imperial"],
        help="Temperature units (C/F or metric/imperial)",
    )

    parser.add_argument(
        "--forecast", "-f", action="store_true", help="Show 5-day forecast"
    )

    args = parser.parse_args()

    # Check if city provided
    if not args.city:
        parser.print_help()
        return 0

    # Join city name (no quotes needed!)
    city = " ".join(args.city)

    # Convert units
    if args.units:
        if args.units in ["C", "metric"]:
            units = "metric"
        else:
            units = "imperial"
    else:
        units = config.default_units

    # Check API key
    if not config.is_valid():
        display_error("OpenWeatherMap API key not configured!")
        print(config.get_api_key_instructions())
        return 1

    # Create API client
    api = WeatherAPI()

    try:
        if args.forecast:
            display_info(f"Fetching forecast for {city}...")
            # TODO: Implement forecast display
            display_info("Forecast display coming in Constellation 1!")
        else:
            display_info(f"Fetching weather for {city}...")
            data = api.get_current_weather(city, units)
            display_current_weather(data, units)

        return 0

    except ValueError as e:
        display_error(str(e))
        return 1
    except KeyboardInterrupt:
        print("\n[yellow]Cancelled[/yellow]")
        return 130
    except Exception as e:
        display_error(f"Unexpected error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())

