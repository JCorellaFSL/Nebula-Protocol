# Star System 0.1: Environment Setup

**Parent Constellation:** 0 - Setup  
**Version Target:** 0.0.1.0  
**Status:** 🔄 Ready for Implementation  
**Complexity:** Simple

---

## Purpose

Set up the Python development environment for the Weather Dashboard project, including Python verification, virtual environment, and all required dependencies.

---

## Prerequisites

- Python 3.10 or higher installed on system
- Git installed and initialized
- Internet connection for package installation

---

## Technical Implementation Steps

### Step 1: Verify Python Installation

**Command:**
```bash
python --version
```

**Expected:** Python 3.10.0 or higher

**If missing:**
- Windows: Download from python.org
- Mac: `brew install python@3.10`
- Linux: `sudo apt install python3.10`

---

### Step 2: Create Virtual Environment

**Create venv:**
```bash
python -m venv venv
```

**Directory structure:**
```
project-2/
├── venv/              # Virtual environment (gitignored)
│   ├── Scripts/       # Windows
│   ├── bin/           # Mac/Linux
│   └── ...
```

---

### Step 3: Create requirements.txt

**File:** `requirements.txt`

```txt
# HTTP requests for API calls
requests>=2.31.0

# Beautiful terminal output
rich>=13.7.0

# Environment variable management
python-dotenv>=1.0.0

# Testing
pytest>=7.4.0
pytest-cov>=4.1.0

# Code quality
black>=23.12.0
flake8>=7.0.0
```

---

### Step 4: Install Dependencies

**Activate venv and install:**

**Windows PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

**Mac/Linux:**
```bash
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Step 5: Create Environment Verification Script

**File:** `verify_env.py`

```python
"""
Environment verification script for Weather Dashboard.
Checks that all dependencies are correctly installed.
"""
import sys

def check_python_version():
    """Verify Python version is 3.10+."""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 10):
        print(f"[FAIL] Python {version.major}.{version.minor} detected. Need 3.10+")
        return False
    print(f"[OK] Python {version.major}.{version.minor}.{version.micro}")
    return True

def check_package(package_name):
    """Check if a package is installed."""
    try:
        __import__(package_name)
        print(f"[OK] {package_name} installed")
        return True
    except ImportError:
        print(f"[FAIL] {package_name} not found")
        return False

def main():
    """Run all environment checks."""
    print("=" * 60)
    print("Weather Dashboard - Environment Verification")
    print("=" * 60)
    print()
    
    checks = [
        ("Python version", check_python_version),
        ("requests", lambda: check_package("requests")),
        ("rich", lambda: check_package("rich")),
        ("dotenv", lambda: check_package("dotenv")),
        ("pytest", lambda: check_package("pytest")),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append(result)
        except Exception as e:
            print(f"[FAIL] {name}: {e}")
            results.append(False)
    
    print()
    print("=" * 60)
    
    if all(results):
        print("[SUCCESS] All checks passed! Environment ready.")
        print()
        print("Next steps:")
        print("  1. Get OpenWeatherMap API key (free)")
        print("  2. Create .env file with API key")
        print("  3. Run: weather --help")
        return 0
    else:
        print("[ERROR] Some checks failed. Please fix and retry.")
        print()
        print("To install dependencies:")
        print("  pip install -r requirements.txt")
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

**Run verification:**
```bash
python verify_env.py
```

---

### Step 6: Update .gitignore

**Append to `.gitignore`:**
```gitignore
# Virtual environment
venv/
env/
ENV/

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
dist/
*.egg-info/

# Environment variables (IMPORTANT!)
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
.pytest_cache/
.coverage
htmlcov/
*.cover

# OS
.DS_Store
Thumbs.db
```

---

## Validation Checklist

- [ ] Python 3.10+ verified with `python --version`
- [ ] Virtual environment created in `venv/` directory
- [ ] pip upgraded to latest version
- [ ] All packages in requirements.txt installed
- [ ] `verify_env.py` script runs successfully
- [ ] All verification checks pass
- [ ] .gitignore updated to exclude venv and .env
- [ ] No errors in package installation

---

## Error Logging

If any errors occur, log them:

```javascript
// From .nebula/tools/
const pm = new ProjectMemory('../..', 'weather-dashboard', 'python');
pm.logError({
  level: 'ERROR',
  phase: 'Constellation 0: Setup',
  constellation: 'Environment Setup',
  message: 'Error description',
  stackTrace: 'Full error output',
  context: 'What step failed'
});
pm.close();
```

---

## Common Issues & Solutions

### Issue: Python not found
**Solution:** Install Python 3.10+ from python.org

### Issue: venv creation fails
**Solution:** Install python3-venv:
```bash
# Linux
sudo apt install python3.10-venv
```

### Issue: pip install fails with network error
**Solution:** Check internet connection, try again, or use `--no-cache-dir`:
```bash
pip install --no-cache-dir -r requirements.txt
```

### Issue: Permission denied on Windows PowerShell
**Solution:** Run as Administrator or:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Next Star System

**STAR_SYSTEM_0.2_STRUCTURE.md** - Create project structure and initial files

---

**Status:** Ready for implementation  
**Estimated Time:** 30-60 minutes  
**Difficulty:** Simple

