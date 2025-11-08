# Project 6: Budget Tracker

## Non-Technical Overview

### What We're Building

A personal finance application that tracks income and expenses, categorizes transactions, and generates financial reports. Users can see where their money goes and stay within budget.

### Why This Project?

Financial awareness is crucial. This project solves:
- Not knowing where money goes
- Overspending in categories
- Difficulty tracking expenses
- Manual budget calculations
- No visibility into spending trends

### Who Is This For?

- Individuals managing personal finances
- Students on tight budgets
- Freelancers tracking business expenses
- Families managing household budgets
- Anyone wanting financial awareness

### Core Features (What Users Can Do)

1. **Add Transactions** - Record income and expenses
2. **Categorize** - Assign categories (Food, Transport, Entertainment)
3. **Monthly Reports** - See spending by month
4. **Category Analysis** - View spending by category
5. **Budget Goals** - Set spending limits per category
6. **Recurring Transactions** - Auto-add regular expenses
7. **Import/Export** - CSV import/export for bank statements
8. **Charts & Graphs** - Visual spending analysis
9. **Search & Filter** - Find specific transactions

### User Experience Flow

```
1. User types: budget add -50 "Groceries" --category Food
2. Transaction recorded
3. User types: budget report --month current
4. Sees monthly summary:
   Income: $3000
   Expenses: $1850
   Remaining: $1150
5. User types: budget by-category
6. Sees pie chart of spending by category
7. User notices: Food $600 (over budget of $500)
8. Gets alert: "Food budget exceeded by $100"
```

### Success Criteria (How We Know It Works)

- [ ] Transaction entry takes under 5 seconds
- [ ] Reports generate in under 2 seconds
- [ ] Data persists across sessions
- [ ] Calculations are 100% accurate
- [ ] CSV import works with bank formats
- [ ] Charts display correctly
- [ ] Budget alerts work reliably
- [ ] No data loss during operations

### Technical Constraints

- Must use SQLite for data storage
- Must handle decimal precision (financial data)
- Must support multiple currencies (future)
- Must validate all financial inputs
- Must backup data automatically
- Must import common CSV formats
- Must generate visual reports

### Similar Products (For Reference)

- Mint (but local, private)
- YNAB (but simpler, free)
- GnuCash (but command-line)
- Personal Capital (but terminal-based)

### Project Scope

**In Scope:**
- Transaction CRUD operations
- Category management
- Monthly/yearly reports
- Budget goals and tracking
- CSV import/export
- Charts (matplotlib)
- Recurring transactions
- Search and filtering
- Data validation

**Out of Scope:**
- Bank API integration (Plaid)
- Investment tracking
- Multiple users/accounts
- Cloud sync
- Mobile app
- Receipt scanning
- Tax calculations

### Estimated Complexity

**Complexity Level:** Moderate

**Reason:**
- Database design (normalized schema)
- Financial calculations (precision critical)
- Date/time handling (monthly reports)
- Data aggregation and reporting
- Data validation (amounts, categories)
- CSV parsing (various formats)
- Chart generation

**Estimated Constellations:** 7-9

1. **Setup & Database** - Project setup, SQLite schema, migrations
2. **Core Transactions** - Add, view, edit, delete transactions
3. **Categories & Tagging** - Category system, tag management
4. **Reports & Analysis** - Monthly reports, aggregations, statistics
5. **Budget Goals** - Set budgets, track spending, alerts
6. **Import/Export** - CSV parsing, export functionality
7. **Visualizations** - Charts (pie, bar, line) with matplotlib
8. **Recurring Transactions** - Auto-add regular expenses
9. **Polish & Testing** - Edge cases, data validation, comprehensive tests

---

## Key Decisions to Make

1. **Database Schema**
   - Single table (simple)
   - Normalized (transactions, categories, budgets)
   - Star schema (OLAP-style)

2. **Decimal Handling**
   - Python Decimal (accurate)
   - Float (simple but imprecise)
   - Integer (cents, precise but awkward)

3. **Date Storage**
   - ISO string (readable)
   - Unix timestamp (efficient)
   - Python datetime (flexible)

4. **Chart Library**
   - matplotlib (standard, static)
   - plotly (interactive, web-based)
   - ASCII art (terminal-only)

5. **CSV Import**
   - Strict format (fast, brittle)
   - Flexible mapping (user-friendly)
   - Auto-detect columns (smart)

6. **Budget Period**
   - Calendar month (standard)
   - Custom periods (flexible)
   - Rolling 30 days (continuous)

---

## Database Design

### Core Tables:

**transactions**
- id (PRIMARY KEY)
- date (DATE)
- amount (DECIMAL)
- description (TEXT)
- category_id (FOREIGN KEY)
- type (ENUM: income, expense)
- recurring_id (FOREIGN KEY, nullable)
- created_at (TIMESTAMP)

**categories**
- id (PRIMARY KEY)
- name (TEXT, UNIQUE)
- type (ENUM: income, expense)
- budget_monthly (DECIMAL, nullable)
- color (TEXT, for charts)

**recurring**
- id (PRIMARY KEY)
- amount (DECIMAL)
- description (TEXT)
- category_id (FOREIGN KEY)
- frequency (ENUM: daily, weekly, monthly, yearly)
- start_date (DATE)
- end_date (DATE, nullable)
- last_created (DATE)

---

## Financial Calculations

### Must Handle:

1. **Decimal Precision**
   - Use Python's `Decimal` type
   - Always round to 2 decimal places
   - No floating-point arithmetic

2. **Aggregations**
   - Sum by category
   - Sum by month/year
   - Average transaction amount
   - Budget vs actual calculations

3. **Percentages**
   - Category as % of total
   - Budget utilization %
   - Month-over-month change %

4. **Date Ranges**
   - Current month
   - Last month
   - Year-to-date
   - Custom date ranges

---

## CSV Import Challenges

### Common Bank CSV Formats:

1. **Chase Bank**
   ```
   Date,Description,Amount,Type
   01/15/2025,AMAZON PURCHASE,-45.99,DEBIT
   ```

2. **Bank of America**
   ```
   Posted Date,Payee,Address,Amount
   01/15/2025,AMAZON.COM,,-45.99
   ```

3. **American Express**
   ```
   Date,Description,Card Member,Amount
   01/15/2025,AMAZON,-,-45.99
   ```

### Import Strategy:
- Detect column headers automatically
- Map columns to transaction fields
- Handle different date formats
- Parse amounts (with/without $, parentheses for negatives)
- Assign default category for manual review

---

## Success Metrics

After implementation, we should be able to:

- Add 100 transactions in under 2 minutes
- Generate monthly report for 1000 transactions in under 1 second
- Import 500 transactions from CSV in under 5 seconds
- Calculate budgets with 100% accuracy (no rounding errors)
- Generate charts in under 3 seconds
- Handle 10,000+ transactions without slowdown
- Export full transaction history to CSV
- Provide budget alerts within 1 second of adding transaction

---

**This overview will be used to generate the initial constellation structure using the Nebula Protocol.**

**Next Steps:**
1. Initialize Nebula Protocol for this project
2. Generate constellations with focus on data integrity
3. Create Star Systems for database, calculations, reports, import
4. Implement comprehensive financial calculation tests
5. Record data handling patterns to Central KG
6. Test edge cases (negative balances, large amounts, date boundaries)

