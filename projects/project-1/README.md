# Todo List CLI

A simple command-line todo list application built with Python.

## Setup

### Prerequisites
- Python 3.10 or higher
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd todo-list-cli
   ```

2. Create and activate virtual environment:
   ```bash
   # Create venv
   python -m venv venv
   
   # Activate (Windows)
   .\venv\Scripts\Activate.ps1
   
   # Activate (Mac/Linux)
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Verify installation:
   ```bash
   python verify_env.py
   ```

## Project Structure

```
todo-list-cli/
├── src/
│   └── todo/
│       ├── __init__.py       # Package init
│       ├── cli.py            # CLI placeholder
│       ├── todo.py           # Core placeholder
│       └── storage.py        # Storage placeholder
├── tests/
│   ├── __init__.py
│   └── test_smoke.py         # 6 smoke tests
├── docs/
│   └── usage.md              # Usage guide
├── venv/                     # Virtual environment (not in git)
├── .nebula/                  # Nebula Framework tools
├── .gitignore
├── pyproject.toml            # Project configuration
├── pytest.ini                # Test configuration
├── requirements.txt          # Dependencies
└── README.md                 # This file
```

## Development

This project uses the Nebula Protocol for structured development.
See `ROADMAP.md` for the project plan.

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=todo

# Run specific test file
pytest tests/test_smoke.py
```

## Code Quality

```bash
# Format code
black src/ tests/

# Lint code
flake8 src/ tests/
```

## Current Status

**Constellation 0: Setup** - Complete  
**Constellation 1: Core Functionality** - Coming next  
**Constellation 2: Deployment** - Planned

See ROADMAP.md for full development plan.

## License

MIT

