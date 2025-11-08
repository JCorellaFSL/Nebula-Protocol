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
│       ├── cli.py            # CLI implementation ✅
│       ├── todo.py           # Core logic ✅
│       └── storage.py        # JSON storage ✅
├── tests/
│   ├── __init__.py
│   ├── test_smoke.py         # Smoke tests
│   ├── test_todo.py          # Todo logic tests (20)
│   ├── test_storage.py       # Storage tests (13)
│   ├── test_cli.py           # CLI tests (12)
│   └── test_integration.py   # Integration tests (2)
├── docs/
│   └── usage.md              # Usage guide
├── venv/                     # Virtual environment (not in git)
├── .nebula/                  # Nebula Framework tools
├── todos.json                # Your todo data
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

## Usage

### Quick Start (Windows)

From the project directory, use the launcher scripts:

**PowerShell:**
```powershell
.\todo.ps1 list
.\todo.ps1 add "Your task"
.\todo.ps1 complete <id>
```

**Command Prompt:**
```cmd
todo.bat list
todo.bat add "Your task"
todo.bat complete <id>
```

These scripts automatically handle the virtual environment for you!

### Alternative: Direct Python

```bash
python -m todo.cli list
python -m todo.cli add "Your task"
python -m todo.cli complete <id>
```

### Commands

```bash
# Add a todo
.\todo.ps1 add "Buy groceries"

# List todos
.\todo.ps1 list                # All todos
.\todo.ps1 list --active       # Active only
.\todo.ps1 list --completed    # Completed only

# Complete a todo (use first 4+ chars of ID shown in list)
.\todo.ps1 complete <id>

# Delete a todo
.\todo.ps1 delete <id>
```

## Current Status

✅ **Constellation 0: Setup** - Complete (Star Gate 0 Passed)  
✅ **Constellation 1: Core Functionality** - Complete (53/53 tests, 79% coverage)
  - Star System 1.1: Todo Logic ✅
  - Star System 1.2: JSON Storage ✅
  - Star System 1.3: CLI Commands ✅

🚪 **Star Gate 1: Core Validation** - Ready for testing  
⏳ **Constellation 2** - TBD based on user feedback

See ROADMAP.md for full development plan.

## License

MIT

