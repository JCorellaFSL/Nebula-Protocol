# Project 2: Weather Dashboard

## Non-Technical Overview

### What We're Building

A terminal application that displays current weather and forecasts for any city in the world. Users can check multiple cities, see weather alerts, and get a 5-day forecast—all from the command line.

### Why This Project?

Weather affects daily decisions. This project solves:
- Need to check weather quickly
- Comparing weather across multiple cities
- Planning based on forecast
- Avoiding unreliable weather websites
- Getting weather without ads or clutter

### Who Is This For?

- People who check weather daily
- Travelers comparing destination weather
- Outdoor workers planning their day
- Developers who want weather in terminal
- Anyone who values speed over fancy interfaces

### Core Features (What Users Can Do)

1. **Current Weather** - Get current conditions for any city
2. **5-Day Forecast** - See upcoming weather
3. **Multiple Cities** - Save favorite cities
4. **Unit Conversion** - Switch between Celsius and Fahrenheit
5. **Weather Alerts** - See warnings (storms, heat, cold)
6. **Detailed Info** - Humidity, wind, pressure, etc.
7. **Search Cities** - Find city by name
8. **Visual Indicators** - Icons/emojis for weather conditions
9. **Refresh Data** - Update weather on command

### User Experience Flow

```
1. User types: weather London
2. Sees current temperature, conditions, forecast
3. User types: weather add Paris
4. Paris added to favorites
5. User types: weather list
6. Sees weather for all favorite cities
7. User types: weather --units F
8. Temperature switches to Fahrenheit
9. User types: weather alerts
10. Sees any active weather warnings
```

### Success Criteria (How We Know It Works)

- [ ] Displays accurate current weather
- [ ] Shows 5-day forecast clearly
- [ ] Response time under 2 seconds
- [ ] Works for cities worldwide
- [ ] Handles network errors gracefully
- [ ] Configuration persists (units, favorites)
- [ ] Weather icons display correctly
- [ ] No API key exposed to users

### Technical Constraints

- Must use free weather API (OpenWeatherMap)
- Must respect API rate limits (60 calls/min free tier)
- Must work offline (show cached data)
- Must handle network timeouts
- Should cache results to reduce API calls

### Similar Products (For Reference)

- wttr.in (terminal weather service)
- curl wttr.in (simple version)
- Weather apps (but command-line)

### Project Scope

**In Scope:**
- Current weather for any city
- 5-day forecast
- Multiple saved cities
- Temperature unit conversion
- Weather alerts
- Caching to reduce API calls
- Configuration file for settings

**Out of Scope:**
- Hourly forecasts (API limit)
- Historical weather data
- Weather maps/radar
- Push notifications
- Mobile app
- Custom alert rules

### Estimated Complexity

**Complexity Level:** Simple to Moderate

**Reason:**
- API integration (new skill for many)
- Error handling (network, API limits, bad city names)
- Configuration management
- Caching strategy
- Rate limiting awareness

**Estimated Constellations:** 5-6

1. **Setup & Configuration** - API key, config file, environment
2. **API Integration** - Connect to OpenWeatherMap, parse responses
3. **Core Display** - Current weather, basic formatting
4. **Forecast & Details** - 5-day forecast, detailed metrics
5. **Enhanced Features** - Multiple cities, caching, alerts
6. **Polish & Error Handling** - Network errors, rate limits, testing

---

## Key Decisions to Make

1. **Weather API**
   - OpenWeatherMap (most popular, good free tier)
   - WeatherAPI.com (alternative)
   - API aggregator (more reliable, costs money)

2. **Caching Strategy**
   - Cache duration (5 minutes? 30 minutes?)
   - Cache location (file? in-memory?)
   - Cache invalidation (manual refresh?)

3. **Display Format**
   - Table format (organized, clear)
   - Card layout (visual, modern)
   - Minimal (just numbers)

4. **Temperature Units**
   - Default Celsius
   - Default Fahrenheit
   - Auto-detect from locale

5. **City Search**
   - Require exact city name
   - Fuzzy matching (did you mean...?)
   - Allow coordinates (lat/lon)

6. **Terminal UI Library**
   - print() (simplest)
   - rich (beautiful tables, colors)
   - blessed/curses (full-screen TUI)

---

## API Considerations

### OpenWeatherMap Free Tier Limits
- 60 calls/minute
- 1,000,000 calls/month
- Current weather + 5-day forecast
- No hourly forecast on free tier

### API Key Security
- Store in environment variable
- Use .env file (not committed to Git)
- Prompt user to add key on first run
- Clear error message if key missing

### Error Scenarios
- Invalid city name → Suggest alternatives
- Network timeout → Show cached data
- Rate limit exceeded → Wait and retry
- API key invalid → Instructions to get new key

---

## Success Metrics

After implementation, we should be able to:

- Get weather for any city in under 2 seconds
- Cache results to minimize API calls (90% hit rate)
- Display forecast clearly in terminal
- Handle 100% of network errors gracefully
- Support 20+ saved cities without slowdown
- Convert units instantly
- Show helpful error messages

---

**This overview will be used to generate the initial constellation structure using the Nebula Protocol.**

**Next Steps:**
1. Initialize Nebula Protocol for this project
2. Generate constellations based on this overview
3. Create Star Systems for each constellation (API, caching, display, errors)
4. Begin implementation with Star Gate quality checks

