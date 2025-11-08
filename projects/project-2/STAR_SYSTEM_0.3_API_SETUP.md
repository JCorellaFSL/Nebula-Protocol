# Star System 0.3: API Setup & Configuration

**Parent Constellation:** 0 - Setup  
**Version Target:** 0.0.3.0  
**Status:** 🔄 Ready for Implementation  
**Complexity:** Simple

---

## Purpose

Set up OpenWeatherMap API access, configure environment variables, and test basic API connectivity.

---

## Prerequisites

- Star System 0.1 complete (environment ready)
- Star System 0.2 complete (project structure created)
- Internet connection
- Web browser

---

## Technical Implementation Steps

### Step 1: Get OpenWeatherMap API Key

**Register for free account:**

1. Go to https://openweathermap.org/api
2. Click "Sign Up" in top right
3. Fill in:
   - Email address
   - Username
   - Password
4. Verify email (check spam folder!)
5. Log in to dashboard
6. Navigate to "API keys" section
7. Copy your default API key (starts with a long string of characters)

**Important notes:**
- Free tier includes 60 calls/minute, 1,000,000 calls/month
- API key can take 10-60 minutes to activate
- No credit card required

---

### Step 2: Create .env File

**Copy template:**
```bash
cp .env.example .env
```

**Or create manually:**

`.env` file:
```bash
# OpenWeatherMap API Key
OPENWEATHER_API_KEY=your_actual_api_key_here

# Temperature Units
UNITS=metric

# Cache Duration (seconds)
CACHE_DURATION=300
```

**Replace `your_actual_api_key_here` with your real key!**

---

### Step 3: Verify .env is Gitignored

**Check .gitignore:**
```bash
cat .gitignore | grep .env
```

**Should see:**
```
.env
```

**CRITICAL:** Never commit `.env` to Git! It contains secrets.

---

### Step 4: Test API Configuration

**Create test script:** `test_api_connection.py`

```python
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
        print("❌ API key not configured!")
        print(config.get_api_key_instructions())
        return False

    api = WeatherAPI()

    try:
        print("🔄 Testing API with London...")
        data = api.get_current_weather("London")
        print(f"✅ API working! Temperature in London: {data['main']['temp']}°C")
        return True
    except ValueError as e:
        print(f"❌ API error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
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
        print("🎉 API setup complete!")
    else:
        print()
        print("⚠️  API setup needs attention")
```

**Run test:**
```bash
python test_api_connection.py
```

**Expected output:**
```
============================================================
OpenWeatherMap API Connection Test
============================================================

API Key configured: True
Default units: metric
Cache duration: 300s

🔄 Testing API with London...
✅ API working! Temperature in London: 15.2°C

🎉 API setup complete!
```

---

### Step 5: Test CLI with Real Data

**Test weather command:**
```powershell
.\weather.ps1 London
```

**Should see:**
- Beautiful table with weather data
- Temperature, conditions, humidity, wind
- Weather emoji (☀️ ☁️ 🌧️ etc.)

**Test different cities:**
```powershell
.\weather.ps1 Tokyo
.\weather.ps1 New York
.\weather.ps1 Paris --units F
```

---

### Step 6: Document API Usage

**Update README with setup instructions** (already done in Star System 0.2)

**Create API_USAGE.md:**

```markdown
# API Usage Guidelines

## Rate Limits

**Free Tier:**
- 60 calls/minute
- 1,000,000 calls/month
- ~1,370 calls/day average

**Recommendation:**
- Cache results for 5 minutes (default)
- Don't spam API with rapid requests
- Use bulk endpoints for multiple cities (Constellation 2)

## API Endpoints Used

### Current Weather
- Endpoint: `/weather`
- Cost: 1 call per request
- Data: Current conditions

### 5-Day Forecast
- Endpoint: `/forecast`
- Cost: 1 call per request
- Data: 40 forecast points (every 3 hours)

## Error Codes

- **401**: Invalid API key
- **404**: City not found
- **429**: Rate limit exceeded
- **500**: API server error

## Best Practices

1. **Cache Aggressively** - Weather changes slowly
2. **Handle Errors Gracefully** - Network can fail
3. **Validate Input** - Check city names before calling API
4. **Respect Limits** - Don't abuse free tier
5. **Use Bulk Endpoints** - More efficient for multiple cities
```

---

## Validation Checklist

- [ ] OpenWeatherMap account created
- [ ] API key obtained
- [ ] .env file created with valid API key
- [ ] .env file is gitignored (CRITICAL)
- [ ] Config loads successfully
- [ ] Test API connection successful
- [ ] CLI displays real weather data
- [ ] Multiple cities tested
- [ ] Temperature units working (metric/imperial)
- [ ] Error messages helpful if API key missing

---

## Error Logging

If any errors occur, log them:

```javascript
// From .nebula/tools/
const pm = new ProjectMemory('../..', 'weather-dashboard', 'python');
pm.logError({
  level: 'ERROR',
  phase: 'Constellation 0: Setup',
  constellation: 'API Setup',
  message: 'Error description',
  stackTrace: 'Full error output',
  context: 'What step failed'
});
pm.close();
```

---

## Common Issues & Solutions

### Issue: API key invalid (401 error)
**Cause:** Key not activated yet or incorrect key
**Solution:**
- Wait 10-60 minutes after signup
- Double-check key in .env (no spaces, no quotes)
- Regenerate key in OpenWeatherMap dashboard

### Issue: City not found (404 error)
**Cause:** City name misspelled or ambiguous
**Solution:**
- Try "City, Country" format: "London, UK"
- Check spelling
- Use exact name from OpenWeatherMap

### Issue: .env file not loading
**Cause:** File in wrong location or not named exactly ".env"
**Solution:**
- Must be in project root
- Must be named exactly ".env" (with dot)
- Run from correct directory

### Issue: Rate limit exceeded (429 error)
**Cause:** Too many API calls
**Solution:**
- Wait 1 minute
- Enable caching (default 5 minutes)
- Reduce request frequency

---

## Next Steps

**Star Gate 0:** Quality gate for Constellation 0 (Setup)

---

**Status:** Ready for implementation  
**Estimated Time:** 20-30 minutes  
**Difficulty:** Simple

