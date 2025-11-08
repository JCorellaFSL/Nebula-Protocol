# Project 10: Data Visualizer

## Non-Technical Overview

### What We're Building

An interactive data visualization application that loads data from CSV/Excel/JSON files, cleans and transforms it, and creates beautiful charts and dashboards. Users can explore data visually without writing code.

### Why This Project?

Data is everywhere but hard to understand. This project solves:
- Making sense of large datasets
- Creating professional visualizations
- Sharing insights with non-technical audiences
- Exploring data interactively
- Generating reports quickly

### Who Is This For?

- Data analysts
- Business professionals
- Researchers
- Students analyzing data
- Anyone working with spreadsheets
- Journalists doing data stories

### Core Features (What Users Can Do)

1. **Load Data** - Import CSV, Excel, JSON, SQL
2. **Clean Data** - Handle missing values, duplicates, outliers
3. **Transform Data** - Filter, sort, aggregate, pivot
4. **Visualize** - Line, bar, scatter, pie, heatmap charts
5. **Interactive Dashboard** - Multiple charts, filters
6. **Statistical Summary** - Mean, median, std dev, correlations
7. **Export** - Save charts as PNG/PDF
8. **Share** - Generate shareable dashboards
9. **Time Series** - Analyze trends over time
10. **Web Interface** - Streamlit dashboard

### User Experience Flow

```
1. User types: dataviz start
2. Web interface opens at localhost:8501
3. User uploads sales_data.csv
4. Tool shows data preview (first 10 rows)
5. User selects: Chart type = "Line"
6. User selects: X-axis = "Date", Y-axis = "Revenue"
7. Chart appears showing revenue trend
8. User adds filter: "Region = West"
9. Chart updates to show West region only
10. User clicks: "Export PNG"
11. Chart saved to downloads
```

### Success Criteria (How We Know It Works)

- [ ] Loads 100K rows in under 5 seconds
- [ ] Handles missing data gracefully
- [ ] Charts render in under 2 seconds
- [ ] Dashboard is responsive and interactive
- [ ] Statistical calculations are accurate
- [ ] Exports work in multiple formats
- [ ] Handles various file formats correctly
- [ ] Memory efficient with large datasets
- [ ] Error messages are clear
- [ ] Works on all major browsers

### Technical Constraints

- Must handle files up to 100MB
- Must support multiple data formats
- Must be memory efficient (streaming for large files)
- Must provide interactive visualizations
- Must calculate statistics accurately
- Must export high-quality images
- Must work in web browser (Streamlit)
- Must handle malformed data gracefully

### Similar Products (For Reference)

- Tableau (enterprise, expensive)
- Power BI (Microsoft ecosystem)
- Google Data Studio (cloud-based)
- Plotly Dash (code-heavy)
- Excel (limited visualization)

### Project Scope

**In Scope:**
- Data loading (CSV, Excel, JSON)
- Data cleaning (missing values, duplicates, types)
- Data transformation (filter, group, aggregate)
- Chart types (line, bar, scatter, pie, heatmap, box)
- Interactive Streamlit dashboard
- Statistical summaries
- Export to PNG/PDF
- Time series analysis
- Multiple datasets
- Configurable styling

**Out of Scope:**
- Database connections (SQL queries)
- Real-time data streaming
- Machine learning models
- Geographic maps (choropleths)
- 3D visualizations
- Video/animation
- Collaboration features
- Cloud deployment

### Estimated Complexity

**Complexity Level:** Complex (Data Processing)

**Reason:**
- Multiple data formats and edge cases
- Data cleaning complexity
- Statistical accuracy requirements
- Visualization library integration
- Interactive dashboard state management
- Performance with large datasets
- Memory management
- Export functionality

**Estimated Constellations:** 10-13

1. **Setup & Structure** - Project setup, Streamlit basics
2. **Data Loading** - CSV, Excel, JSON parsers with error handling
3. **Data Cleaning** - Missing values, duplicates, type conversion
4. **Data Exploration** - Preview, summary statistics, data types
5. **Basic Charts** - Line, bar, scatter plots with matplotlib
6. **Advanced Charts** - Pie, heatmap, box plots, histograms
7. **Interactive Dashboard** - Streamlit widgets, filters, selections
8. **Data Transformation** - Group by, aggregate, pivot tables
9. **Time Series** - Date parsing, resampling, rolling windows
10. **Statistical Analysis** - Correlations, distributions, outliers
11. **Export Functionality** - PNG, PDF, CSV export
12. **Performance Optimization** - Streaming, caching, memory management
13. **Polish & Edge Cases** - Error handling, loading states, styling

---

## Key Decisions to Make

1. **Data Library**
   - pandas (industry standard)
   - polars (faster, modern)
   - dask (big data, parallel)

2. **Visualization Library**
   - matplotlib (static, full control)
   - plotly (interactive, modern)
   - seaborn (beautiful statistical plots)
   - altair (declarative)

3. **Dashboard Framework**
   - Streamlit (simple, fast)
   - Dash (flexible, more code)
   - Gradio (ML-focused)

4. **Statistical Library**
   - scipy (comprehensive)
   - numpy (basic operations)
   - statsmodels (advanced stats)

5. **Excel Library**
   - openpyxl (read/write)
   - xlrd (read only, older)
   - pandas (built-in support)

6. **Export Format**
   - PNG (raster, standard)
   - PDF (vector, professional)
   - SVG (vector, web-friendly)

---

## Data Processing Pipeline

### Stage 1: Load
```python
# Load data from various sources
df = load_data(file_path, file_type)
# Returns: pandas DataFrame
```

### Stage 2: Clean
```python
# Handle missing values
df = handle_missing(df, strategy='drop')  # or 'fill', 'interpolate'

# Remove duplicates
df = df.drop_duplicates()

# Convert types
df = convert_types(df, columns={'date': 'datetime', 'price': 'float'})
```

### Stage 3: Transform
```python
# Filter rows
df = df[df['revenue'] > 1000]

# Group and aggregate
summary = df.groupby('category').agg({'revenue': 'sum', 'quantity': 'mean'})

# Pivot table
pivot = df.pivot_table(values='sales', index='month', columns='region')
```

### Stage 4: Visualize
```python
# Create chart
fig = create_line_chart(df, x='date', y='revenue', title='Revenue Trend')

# Display in Streamlit
st.plotly_chart(fig)
```

---

## Streamlit Dashboard Structure

```python
import streamlit as st
import pandas as pd
import plotly.express as px

# Title and file upload
st.title("Data Visualizer")
uploaded_file = st.file_uploader("Upload CSV", type=['csv', 'xlsx', 'json'])

if uploaded_file:
    # Load data
    df = pd.read_csv(uploaded_file)
    
    # Data preview
    st.subheader("Data Preview")
    st.dataframe(df.head(10))
    
    # Summary statistics
    st.subheader("Summary Statistics")
    st.write(df.describe())
    
    # Chart configuration
    st.subheader("Create Chart")
    chart_type = st.selectbox("Chart Type", ['Line', 'Bar', 'Scatter'])
    x_col = st.selectbox("X-axis", df.columns)
    y_col = st.selectbox("Y-axis", df.columns)
    
    # Generate chart
    if chart_type == 'Line':
        fig = px.line(df, x=x_col, y=y_col)
    elif chart_type == 'Bar':
        fig = px.bar(df, x=x_col, y=y_col)
    else:
        fig = px.scatter(df, x=x_col, y=y_col)
    
    st.plotly_chart(fig)
```

---

## Chart Types

### 1. Line Chart
- **Use:** Trends over time
- **Example:** Stock prices, sales trends, temperature

### 2. Bar Chart
- **Use:** Comparing categories
- **Example:** Sales by region, products by category

### 3. Scatter Plot
- **Use:** Relationship between variables
- **Example:** Height vs weight, price vs demand

### 4. Pie Chart
- **Use:** Part-to-whole relationships
- **Example:** Market share, budget allocation

### 5. Heatmap
- **Use:** Correlation matrix, patterns
- **Example:** Feature correlations, sales by day/hour

### 6. Box Plot
- **Use:** Distribution and outliers
- **Example:** Salary distribution, test scores

### 7. Histogram
- **Use:** Frequency distribution
- **Example:** Age distribution, price ranges

---

## Statistical Analysis

### Descriptive Statistics:
- **Mean:** Average value
- **Median:** Middle value
- **Mode:** Most frequent value
- **Std Dev:** Spread of data
- **Quartiles:** 25th, 50th, 75th percentiles

### Correlation Analysis:
```python
# Correlation matrix
corr = df.corr()

# Visualize with heatmap
fig = px.imshow(corr, text_auto=True, title='Correlation Matrix')
```

### Outlier Detection:
```python
# IQR method
Q1 = df['revenue'].quantile(0.25)
Q3 = df['revenue'].quantile(0.75)
IQR = Q3 - Q1
outliers = df[(df['revenue'] < Q1 - 1.5*IQR) | (df['revenue'] > Q3 + 1.5*IQR)]
```

### Time Series:
```python
# Resample to monthly
monthly = df.set_index('date').resample('M').sum()

# Rolling average
rolling = df['revenue'].rolling(window=7).mean()

# Trend detection
from scipy.stats import linregress
slope, intercept, r_value, p_value, std_err = linregress(x, y)
```

---

## Performance Optimization

### Challenge 1: Large Files (100MB+)
- **Problem:** Loading entire file into memory
- **Solution:** Stream data in chunks
```python
for chunk in pd.read_csv(file, chunksize=10000):
    process(chunk)
```

### Challenge 2: Slow Charts
- **Problem:** Plotting 100K points is slow
- **Solution:** Sample data for visualization
```python
if len(df) > 10000:
    df_plot = df.sample(10000)
else:
    df_plot = df
```

### Challenge 3: Repeated Calculations
- **Problem:** Recalculating statistics on every interaction
- **Solution:** Use Streamlit caching
```python
@st.cache_data
def load_and_clean_data(file):
    # Expensive operations cached
    return df
```

### Challenge 4: Memory Usage
- **Problem:** Large DataFrames consume RAM
- **Solution:** Use memory-efficient dtypes
```python
df = df.astype({
    'id': 'int32',  # instead of int64
    'category': 'category',  # instead of object
    'date': 'datetime64[ns]'
})
```

---

## Data Cleaning Strategies

### Missing Values:
- **Drop:** Remove rows/columns with missing data
- **Fill:** Replace with mean, median, mode, or constant
- **Interpolate:** Estimate based on surrounding values
- **Forward Fill:** Use previous value
- **Backward Fill:** Use next value

### Duplicates:
- **Exact Duplicates:** Same across all columns
- **Subset Duplicates:** Same in specific columns
- **Keep First:** Keep first occurrence
- **Keep Last:** Keep last occurrence
- **Drop All:** Remove all duplicates

### Type Conversion:
- **String to Number:** `pd.to_numeric()`
- **String to Date:** `pd.to_datetime()`
- **Boolean:** True/False or 1/0
- **Category:** For low-cardinality strings

---

## Export Functionality

### Image Export:
```python
# PNG (raster)
fig.write_image("chart.png", width=1920, height=1080)

# PDF (vector)
fig.write_image("chart.pdf")

# SVG (vector, web)
fig.write_html("chart.html")
```

### Data Export:
```python
# CSV
df.to_csv("data_cleaned.csv", index=False)

# Excel
df.to_excel("report.xlsx", sheet_name='Data')

# JSON
df.to_json("data.json", orient='records')
```

---

## Success Metrics

After implementation, we should be able to:

- Load 100K row CSV in under 5 seconds
- Handle 10 MB files smoothly
- Generate charts in under 2 seconds
- Calculate statistics with 100% accuracy
- Support 10+ chart types
- Export high-quality images (300 DPI)
- Run dashboard for hours without memory issues
- Handle missing data intelligently
- Provide interactive filtering in real-time
- Pass all statistical validation tests

---

**This overview will be used to generate the initial constellation structure using the Nebula Protocol.**

**IMPORTANT:** This is a DATA-INTENSIVE project. Every Star Gate must include:
- Performance testing with large datasets
- Statistical accuracy verification
- Memory usage profiling
- Chart rendering tests

**Next Steps:**
1. Initialize Nebula Protocol for this project
2. Generate constellations with emphasis on data handling
3. Create detailed Star Systems for loading, cleaning, visualization, analysis
4. Test with various data sizes (1K, 10K, 100K, 1M rows)
5. Record data processing patterns to Central KG for future data projects
6. Verify statistical calculations against known results
7. Optimize memory usage and performance
8. User acceptance testing with real datasets

