# Constellation 0: SETUP - Weather Dashboard

## Project Overview
This constellation establishes the foundation for the Weather Dashboard project - a command-line tool that displays current weather and forecasts for any city worldwide.

## Objectives
- Set up Python development environment
- Create project structure
- Configure API access to OpenWeatherMap
- Establish basic CLI framework
- Initialize Git repository and project memory
- Prepare for API integration work

## Success Criteria
- [ ] Python 3.10+ installed and verified
- [ ] Virtual environment created and activated
- [ ] All dependencies installed (requests, rich, python-dotenv, pytest)
- [ ] Project structure created with proper modules
- [ ] OpenWeatherMap API key obtained and configured
- [ ] .env file template created (not committed to Git)
- [ ] Basic CLI entry point created and testable
- [ ] Git repository initialized with remote
- [ ] All files committed and pushed
- [ ] Smoke tests passing

## Key Deliverables

### 1. Development Environment
- Python 3.10+ with venv
- requirements.txt with:
  - requests (HTTP/API calls)
  - rich (terminal UI/formatting)
  - python-dotenv (environment variables)
  - pytest (testing)
  - pytest-cov (coverage)

### 2. Project Structure
```
weather-dashboard/
├── src/
│   └── weather/
│       ├── __init__.py
│       ├── cli.py          # Command-line interface
│       ├── api.py          # OpenWeatherMap API client
│       ├── display.py      # Terminal display/formatting
│       └── config.py       # Configuration management
├── tests/
│   ├── __init__.py
│   └── test_smoke.py       # Smoke tests
├── .env.example            # Environment template (in Git)
├── .env                    # Actual config (NOT in Git)
├── .gitignore
├── requirements.txt
├── README.md
└── pyproject.toml
```

### 3. Configuration Setup
- `.env.example` (template for users)
- `.env` (actual config, gitignored)
- Instructions for getting OpenWeatherMap API key
- Default settings (units, cache duration, etc.)

### 4. Basic CLI Framework
- Entry point script (`cli.py`)
- Argument parsing structure (using argparse)
- Help text and usage examples
- Launcher scripts (weather.ps1, weather.bat) for usability

## What This Constellation Delivers

### User Value
**Before:** Nothing exists
**After:** Developer can run `weather --help` and see command structure

### Technical Value
- Clean project architecture
- API ready to integrate
- Testing infrastructure in place
- Usable from day 1 (launcher scripts)

## Key Decisions Made

### 1. Weather API Choice
**Decision:** OpenWeatherMap
**Rationale:** 
- Most popular weather API
- Generous free tier (1M calls/month)
- Good documentation
- Current weather + 5-day forecast included
**Alternatives considered:**
- WeatherAPI.com → Less popular, smaller community
- Weather.gov → US only
- Custom scraping → Unreliable, legal issues

### 2. Terminal UI Library
**Decision:** rich
**Rationale:**
- Beautiful tables and colors out of the box
- Easy to use
- Excellent documentation
- Active maintenance
**Alternatives considered:**
- Plain print() → Too basic, hard to format
- curses/blessed → Too complex for this project
- colorama only → Would need manual formatting

### 3. Config Management
**Decision:** python-dotenv + .env file
**Rationale:**
- Industry standard
- Simple for users
- Keeps secrets out of code
- Easy to validate
**Alternatives considered:**
- Config file (JSON/YAML) → More complex
- Environment variables only → Hard for users
- Prompt on first run → Annoying for repeated use

### 4. Default Temperature Unit
**Decision:** Celsius (with easy Fahrenheit toggle)
**Rationale:**
- International standard
- Most of world uses Celsius
- Easy to toggle with --units F flag
**Implementation:**
- Store preference in config
- Accept both C and F
- Auto-detect from locale (future enhancement)

## Star Systems (Technical Implementation)

This constellation will be broken down into 3 Star Systems:

### STAR_SYSTEM_0.1_ENVIRONMENT.md
Focuses on Python environment setup and dependencies.
- Python version verification
- Virtual environment creation
- Dependency installation
- Development tools setup

### STAR_SYSTEM_0.2_STRUCTURE.md
Focuses on creating project structure and initial files.
- Directory layout
- Module stubs
- Configuration templates
- Git setup

### STAR_SYSTEM_0.3_API_SETUP.md
Focuses on OpenWeatherMap API registration and configuration.
- API key acquisition
- Environment configuration
- Basic API connection test
- Rate limit awareness

## Star Gate
- **STAR_GATE_0_SETUP.md:** This quality gate ensures environment is ready, structure is correct, and API access is configured before moving to actual feature development.

## Risk Assessment

### Low Risk ✅
- Python setup (well-documented)
- Basic project structure (standard patterns)
- OpenWeatherMap API (reliable, well-documented)

### Medium Risk ⚠️
- API key management (users might expose keys)
- **Mitigation:** Clear .gitignore, .env.example template, warnings in docs
- First-time API usage (some devs unfamiliar)
- **Mitigation:** Clear instructions, working example in docs

### High Risk ❌
- None identified for setup phase

## Dependencies

### External Dependencies
- Python 3.10+ (user must install)
- OpenWeatherMap API key (free, requires signup)
- Internet connection (for API calls)

### Blocking Issues
- None - Ready to begin implementation

## Timeline Estimate

**Optimistic:** 1-2 hours
**Realistic:** 2-3 hours  
**Pessimistic:** 4-5 hours (if API signup issues, environment problems)

**Breakdown:**
- Star System 0.1 (Environment): 30-60 minutes
- Star System 0.2 (Structure): 30-60 minutes
- Star System 0.3 (API Setup): 60-90 minutes

## Testing Strategy

### Smoke Tests
- Python version check
- Package imports (requests, rich, dotenv)
- Config file loading
- Basic CLI execution
- API connection test (with mock key check)

### Manual Verification
1. `python --version` shows 3.10+
2. `weather --help` displays usage
3. `.env` file exists and is gitignored
4. Can import all modules without errors
5. API key format validation works

## Success Metrics

### Functional Metrics
- All smoke tests passing
- CLI help text displays
- Modules importable
- Config loading works

### Quality Metrics
- Project structure matches standard Python layout
- .gitignore prevents .env from being committed
- Documentation clear for API key setup
- Launcher scripts work on Windows

## Out of Scope (For Later Constellations)

- ❌ Actual weather data fetching (Constellation 1)
- ❌ Weather display formatting (Constellation 2)
- ❌ Forecast parsing (Constellation 2)
- ❌ Multiple city support (Constellation 3)
- ❌ Caching (Constellation 3)
- ❌ Error handling for network issues (Constellation 4)

**Rationale:** Setup focuses on foundation, not features. Weather functionality comes in Constellation 1.

---

**This overview will guide the creation of technical Star System documents and implementation.**

**Next Steps:**
1. Create STAR_SYSTEM_0.1_ENVIRONMENT.md
2. Create STAR_SYSTEM_0.2_STRUCTURE.md
3. Create STAR_SYSTEM_0.3_API_SETUP.md
4. Begin implementation with Star System 0.1

