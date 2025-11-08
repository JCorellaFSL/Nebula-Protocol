# Project 4: Web Scraper

## Non-Technical Overview

### What We're Building

A tool that automatically extracts data from websites and saves it to CSV or JSON files. Users can point it at product pages, news sites, or data tables and get structured data they can analyze.

### Why This Project?

Manual data collection is tedious. This project solves:
- Copying data from websites manually
- Tracking price changes over time
- Collecting research data
- Monitoring competitor websites
- Building datasets for analysis

### Who Is This For?

- Researchers gathering data
- E-commerce businesses tracking competitors
- Data analysts building datasets
- Students collecting information
- Anyone who needs data from websites

### Core Features (What Users Can Do)

1. **Extract Data** - Pull specific information from web pages
2. **Handle Pagination** - Automatically follow "Next Page" links
3. **Multiple Pages** - Scrape entire websites
4. **Export Formats** - Save to CSV, JSON, or Excel
5. **Rate Limiting** - Respect website servers
6. **Retry Logic** - Handle temporary failures
7. **Data Validation** - Ensure extracted data is correct
8. **Respect Robots.txt** - Follow website scraping rules
9. **Progress Tracking** - Show scraping progress

### User Experience Flow

```
1. User types: scrape https://example.com/products --pages 10
2. Tool checks robots.txt
3. Begins scraping first page
4. Extracts product names, prices, ratings
5. Follows pagination links
6. Shows progress: "Page 5/10 (50%)"
7. Completes scraping
8. Exports to products.csv
9. Summary: "Scraped 250 products in 45 seconds"
```

### Success Criteria (How We Know It Works)

- [ ] Extracts data accurately (95%+ accuracy)
- [ ] Handles pagination automatically
- [ ] Respects rate limits (no server overload)
- [ ] Follows robots.txt rules
- [ ] Handles network errors gracefully
- [ ] Exports clean, structured data
- [ ] Works with major website structures
- [ ] Clear error messages for blocked scraping

### Technical Constraints

- Must respect website Terms of Service
- Must implement rate limiting (1-2 requests/second)
- Must handle dynamic JavaScript content (basic)
- Must parse messy HTML reliably
- Must validate extracted data
- Cannot bypass authentication/paywalls
- Must respect robots.txt

### Similar Products (For Reference)

- Scrapy (framework, more complex)
- BeautifulSoup (library, manual)
- Octoparse (GUI tool)
- ParseHub (cloud service)

### Project Scope

**In Scope:**
- Static HTML page scraping
- CSS selector-based extraction
- Automatic pagination handling
- Rate limiting and delays
- Robots.txt compliance
- Retry logic for failures
- Export to CSV/JSON
- Data cleaning and validation
- Progress bars

**Out of Scope:**
- JavaScript rendering (Selenium/Playwright)
- Login/authentication
- CAPTCHA solving
- Distributed scraping
- Cloud deployment
- Real-time scraping
- Database storage (just files)

### Estimated Complexity

**Complexity Level:** Moderate

**Reason:**
- HTML parsing (unpredictable structure)
- Error handling (404, timeouts, rate limits)
- Ethical considerations (robots.txt, rate limiting)
- Data extraction reliability
- Pagination logic (varies by site)
- Network programming

**Estimated Constellations:** 6-8

1. **Setup & Basic Fetching** - HTTP requests, HTML download
2. **HTML Parsing** - BeautifulSoup, CSS selectors, data extraction
3. **Pagination Handling** - Detect and follow page links
4. **Rate Limiting & Ethics** - Respect robots.txt, delays, backoff
5. **Data Export** - CSV/JSON export, data cleaning
6. **Error Handling** - Network errors, parsing errors, retries
7. **Advanced Features** - Progress bars, validation, logging
8. **Testing & Edge Cases** - Test with various websites

---

## Key Decisions to Make

1. **HTML Parser**
   - BeautifulSoup + lxml (fast, flexible)
   - BeautifulSoup + html.parser (built-in, slower)
   - lxml alone (fastest, less friendly)

2. **HTTP Library**
   - requests (simple, popular)
   - httpx (modern, async support)
   - urllib (built-in, verbose)

3. **Data Extraction Strategy**
   - CSS selectors (flexible)
   - XPath (powerful but complex)
   - Regex (fragile)

4. **Rate Limiting**
   - Fixed delay (simple)
   - Exponential backoff (respectful)
   - Adaptive (based on response times)

5. **Pagination Detection**
   - Look for common patterns ("Next", "→")
   - Parse page numbers
   - Follow <link rel="next">

6. **Error Recovery**
   - Retry failed requests (3 times?)
   - Skip broken pages
   - Save partial results

---

## Ethical Considerations

### Must Follow:
- ✅ Check and respect robots.txt
- ✅ Implement rate limiting (1 req/sec minimum)
- ✅ Set appropriate User-Agent
- ✅ Don't scrape personal data without permission
- ✅ Don't bypass authentication
- ✅ Don't overwhelm servers

### Best Practices:
- Scrape during off-peak hours
- Cache responses to avoid re-scraping
- Contact website owner if scraping heavily
- Provide clear User-Agent identifying bot
- Honor "nofollow" and "noindex" directives
- Handle 429 (Too Many Requests) appropriately

---

## Common Scraping Challenges

### Challenge 1: Website Structure Changes
- **Problem:** Website redesign breaks selectors
- **Solution:** Multiple selector fallbacks, structure validation

### Challenge 2: Rate Limiting
- **Problem:** Too many requests → IP ban
- **Solution:** Exponential backoff, respect Retry-After header

### Challenge 3: Dynamic Content
- **Problem:** JavaScript-rendered content not in HTML
- **Solution:** Detect and warn user (out of scope for this project)

### Challenge 4: Data Cleaning
- **Problem:** Extra whitespace, inconsistent formats
- **Solution:** Normalize data, strip whitespace, validate types

### Challenge 5: Inconsistent Pagination
- **Problem:** Every site paginates differently
- **Solution:** Config system for pagination patterns

---

## Success Metrics

After implementation, we should be able to:

- Scrape 100 pages in under 2 minutes (with rate limiting)
- Extract data with 95%+ accuracy
- Handle 100% of network errors gracefully
- Respect all robots.txt rules
- Follow pagination for 10+ pages
- Export clean CSV with proper headers
- Provide progress updates every 5 seconds
- Retry failed requests automatically

---

**This overview will be used to generate the initial constellation structure using the Nebula Protocol.**

**Next Steps:**
1. Initialize Nebula Protocol for this project
2. Generate constellations based on this overview
3. Create Star Systems for HTTP, parsing, ethics, export
4. Test with multiple real websites
5. Record HTML parsing errors to Central KG
6. Document common scraping patterns

