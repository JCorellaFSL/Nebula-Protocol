"""
Test OpenWeatherMap API connection.
"""
from weather.config import config
from weather.api import WeatherAPI


def test_config():
    """Test that config loads."""
    print(f"API Key configured: {config.is_valid()}")
    print(f"Default units: {config.default_units}")
    print(f"Cache duration: {config.cache_duration}s")


def test_api_connection():
    """Test basic API call."""
    if not config.is_valid():
        print("[FAIL] API key not configured!")
        print(config.get_api_key_instructions())
        return False

    api = WeatherAPI()

    try:
        print("[TEST] Testing API with London...")
        data = api.get_current_weather("London")
        print(f"[OK] API working! Temperature in London: {data['main']['temp']}C")
        return True
    except ValueError as e:
        print(f"[FAIL] API error: {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("OpenWeatherMap API Connection Test")
    print("=" * 60)
    print()

    test_config()
    print()

    if test_api_connection():
        print()
        print("[SUCCESS] API setup complete!")
    else:
        print()
        print("[WARNING] API setup needs attention")

