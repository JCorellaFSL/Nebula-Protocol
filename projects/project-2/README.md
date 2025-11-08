# Weather Dashboard

A beautiful command-line weather application powered by OpenWeatherMap API.

## 🌟 Features

- **Current Weather** - Get real-time weather for any city
- **5-Day Forecast** - See upcoming weather (Constellation 1)
- **Multiple Cities** - Save favorites (Constellation 2)
- **Beautiful Display** - Rich terminal UI with colors and emojis
- **Flexible Units** - Switch between Celsius and Fahrenheit
- **Natural Input** - No quotes needed for city names!

## 🚀 Quick Start

### 1. Get OpenWeatherMap API Key (Free!)

1. Go to https://openweathermap.org/api
2. Click "Sign Up"
3. Verify your email
4. Copy your API key from the dashboard

### 2. Configure

Create a `.env` file (copy from `.env.example`):

```bash
OPENWEATHER_API_KEY=your_api_key_here
UNITS=metric
```

### 3. Run!

**PowerShell:**
```powershell
.\weather.ps1 London
.\weather.ps1 New York --units F
```

**Command Prompt:**
```cmd
weather.bat London
weather.bat Tokyo
```

**Direct Python:**
```bash
python -m weather.cli Paris
```

## 📖 Usage

### Check Weather

```powershell
# Simple query (no quotes needed!)
.\weather.ps1 London

# Multi-word cities
.\weather.ps1 New York
.\weather.ps1 San Francisco

# With Fahrenheit
.\weather.ps1 Tokyo --units F
```

### Get Forecast (Coming in Constellation 1)

```powershell
.\weather.ps1 Paris --forecast
```

## 🧪 Development

### Run Tests

```bash
pytest tests/ -v
```

### Code Quality

```bash
# Format code
black src/ tests/

# Lint
flake8 src/ tests/
```

### Environment Verification

```bash
python verify_env.py
```

## 📂 Project Structure

```
weather-dashboard/
├── src/weather/
│   ├── __init__.py         # Package initialization
│   ├── cli.py              # Command-line interface
│   ├── api.py              # OpenWeatherMap API client
│   ├── display.py          # Terminal formatting
│   └── config.py           # Configuration management
├── tests/
│   ├── test_smoke.py       # Basic tests
│   └── ...                 # More tests coming
├── .env                    # Your config (NOT in Git!)
├── .env.example            # Template
├── requirements.txt        # Dependencies
├── pyproject.toml          # Project metadata
├── weather.ps1             # PowerShell launcher
└── weather.bat             # Batch launcher
```

## 🌌 Development Progress

### ✅ Constellation 0: Setup (COMPLETE)
- [x] Python environment
- [x] Project structure
- [x] API configuration
- [x] Basic CLI framework
- [x] Launcher scripts
- [x] All smoke tests passing

**Version:** 0.0.1.0

### ⏳ Constellation 1: Core Weather Display (Next)
- [ ] Current weather display
- [ ] 5-day forecast parsing
- [ ] Error handling
- [ ] API rate limiting

### ⏳ Constellation 2: Multiple Cities (Future)
- [ ] Favorites management
- [ ] Caching
- [ ] Bulk weather check

## 🛠️ Technology Stack

- **Python** 3.10+
- **requests** - HTTP API calls
- **rich** - Beautiful terminal output
- **python-dotenv** - Environment configuration
- **pytest** - Testing

## 📝 License

Built using the Nebula Protocol for systematic software development.

---

**Current Status:** Constellation 0 complete, ready for weather feature implementation!

