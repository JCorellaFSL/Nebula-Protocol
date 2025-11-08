# Star System 0.1: Environment Setup

**Parent Constellation:** 0 - Setup  
**Version Target:** 0.0.1.0  
**Status:** 🔄 Ready for Implementation  
**Complexity:** Simple

---

## Purpose

Set up the Python development environment, virtual environment, and install essential dependencies. This Star System ensures we have a clean, isolated, and reproducible development environment.

---

## Prerequisites

- Python 3.10 or higher installed on system
- Git installed and configured
- Terminal/command line access
- Internet connection for package downloads

---

## Technical Implementation Steps

### Step 1: Verify Python Installation

**Check Python version:**
```bash
python --version
# Should show Python 3.10.x or higher
```

If `python` doesn't work, try:
```bash
python3 --version
```

**Expected Output:**
```
Python 3.10.x or Python 3.11.x or Python 3.12.x
```

**If Python is not installed or version is too old:**
- Windows: Download from https://python.org/downloads
- Mac: `brew install python@3.11`
- Linux: `sudo apt install python3.11` or equivalent

**Validation:**
```bash
python -c "import sys; print(f'Python {sys.version}')"
```

---

### Step 2: Create Virtual Environment

**Why:** Isolates project dependencies from system Python packages.

**Create virtual environment:**
```bash
# In project root (projects/project-1/)
python -m venv venv
```

**Activate virtual environment:**

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
.\venv\Scripts\activate.bat
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

**Validation:**
```bash
which python  # Mac/Linux
where python  # Windows

# Should point to venv/Scripts/python or venv/bin/python
```

**Expected:** Your prompt should now show `(venv)` prefix.

---

### Step 3: Upgrade pip

**Why:** Ensure we have the latest package installer.

```bash
python -m pip install --upgrade pip
```

**Expected Output:**
```
Successfully installed pip-24.x.x
```

**Validation:**
```bash
pip --version
# Should show pip 24.x or higher from venv
```

---

### Step 4: Create requirements.txt

**Create file:** `requirements.txt`

**Content:**
```txt
# Testing
pytest>=7.4.0
pytest-cov>=4.1.0

# Code Quality
black>=23.0.0
flake8>=6.1.0

# CLI Enhancement
colorama>=0.4.6

# Development
ipython>=8.12.0
```

**Why each dependency:**
- `pytest`: Testing framework (industry standard)
- `pytest-cov`: Test coverage reporting
- `black`: Code formatter (automatic)
- `flake8`: Linter (catches errors)
- `colorama`: Cross-platform colored terminal output
- `ipython`: Enhanced Python REPL for debugging

---

### Step 5: Install Dependencies

```bash
pip install -r requirements.txt
```

**Expected:** Should install all packages without errors.

**Validation:**
```bash
pip list

# Should show:
# pytest, pytest-cov, black, flake8, colorama, ipython
```

**Test imports:**
```bash
python -c "import pytest; import colorama; import black; print('All imports successful!')"
```

**Expected Output:**
```
All imports successful!
```

---

### Step 6: Create requirements-dev.txt (Optional)

For additional development tools:

**Create file:** `requirements-dev.txt`

**Content:**
```txt
# Development dependencies
-r requirements.txt

# Additional dev tools
mypy>=1.5.0          # Type checking
pylint>=2.17.0       # Additional linting
```

---

### Step 7: Configure Git (if not already done)

**Check Git configuration:**
```bash
git config --global user.name
git config --global user.email
```

**If not set:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Validation:**
```bash
git config --list | grep user
```

---

### Step 8: Update .gitignore

**Verify .gitignore contains:**
```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
venv/
env/
ENV/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
.pytest_cache/
.coverage
htmlcov/

# Nebula Framework
.nebula/logs/
.nebula/tools/node_modules/
*.sqlite
*.sqlite-wal
*.sqlite-shm

# OS
.DS_Store
Thumbs.db
```

**This file should already exist from init-nebula-project.js**

---

### Step 9: Verify Environment

**Create verification script:** `verify_env.py`

```python
"""
Environment verification script.
Run this to ensure setup is correct.
"""
import sys
import subprocess

def check_python_version():
    """Verify Python version is 3.10+"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 10:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} (need 3.10+)")
        return False

def check_virtual_env():
    """Verify we're in a virtual environment"""
    in_venv = hasattr(sys, 'real_prefix') or (
        hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
    )
    if in_venv:
        print(f"✅ Virtual environment active: {sys.prefix}")
        return True
    else:
        print("❌ Not in virtual environment")
        return False

def check_imports():
    """Verify required packages are importable"""
    packages = ['pytest', 'colorama', 'black', 'flake8']
    all_ok = True
    
    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package} installed")
        except ImportError:
            print(f"❌ {package} not found")
            all_ok = False
    
    return all_ok

def main():
    print("🔍 Verifying Development Environment...\n")
    
    checks = [
        check_python_version(),
        check_virtual_env(),
        check_imports()
    ]
    
    print("\n" + "="*50)
    if all(checks):
        print("✅ All checks passed! Environment is ready.")
        return 0
    else:
        print("❌ Some checks failed. Please review errors above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
```

**Run verification:**
```bash
python verify_env.py
```

**Expected Output:**
```
🔍 Verifying Development Environment...

✅ Python 3.10.x
✅ Virtual environment active: /path/to/venv
✅ pytest installed
✅ colorama installed
✅ black installed
✅ flake8 installed

==================================================
✅ All checks passed! Environment is ready.
```

---

### Step 10: Document Environment Setup

**Update README.md** (create if doesn't exist):

```markdown
# Todo List CLI

A simple command-line todo list application built with Python.

## Setup

### Prerequisites
- Python 3.10 or higher
- Git

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd todo-list-cli
   \`\`\`

2. Create and activate virtual environment:
   \`\`\`bash
   # Create venv
   python -m venv venv
   
   # Activate (Windows)
   .\\venv\\Scripts\\Activate.ps1
   
   # Activate (Mac/Linux)
   source venv/bin/activate
   \`\`\`

3. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. Verify installation:
   \`\`\`bash
   python verify_env.py
   \`\`\`

## Development

This project uses the Nebula Protocol for structured development.
See `ROADMAP.md` for the project plan.

## Testing

\`\`\`bash
pytest
\`\`\`

## License

MIT
```

---

## Error Logging

**If errors occur during setup, log to Nebula project memory:**

```bash
# From project root
cd .nebula/tools

node -e "
import('./project-memory.js').then(m => {
  const pm = new m.ProjectMemory('../..', 'todo-list-cli', 'python');
  pm.recordError({
    language: 'python',
    message: 'Error description here',
    stackTrace: 'Stack trace if available',
    constellation: 'Setup',
    filePath: 'requirements.txt',
    level: 'ERROR'
  });
  console.log('Error logged');
  pm.close();
});
"
```

---

## Validation Checklist

Before moving to next Star System, verify:

- [ ] Python 3.10+ installed and accessible
- [ ] Virtual environment created and activated
- [ ] pip upgraded to latest version
- [ ] All dependencies installed successfully
- [ ] All packages importable
- [ ] verify_env.py runs and passes all checks
- [ ] .gitignore properly configured
- [ ] README.md contains setup instructions
- [ ] No errors in project memory

---

## Common Issues & Solutions

### Issue 1: Python not found
**Problem:** `python` command not recognized  
**Solution:** Use `python3` or add Python to PATH

### Issue 2: Virtual environment won't activate (Windows)
**Problem:** PowerShell execution policy  
**Solution:** 
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 3: pip install fails with SSL error
**Problem:** Network/firewall issues  
**Solution:** Use trusted host:
```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
```

### Issue 4: Permission denied errors
**Problem:** Trying to install to system Python  
**Solution:** Ensure virtual environment is activated (check for `(venv)` in prompt)

---

## Next Star System

Once this Star System is complete, proceed to:
**STAR_SYSTEM_0.2_STRUCTURE.md** - Project structure and initial code

---

## Version Impact

**Current:** 0.0.0.0  
**After this Star System:** 0.0.1.0 (environment ready)  
**After next Star System:** 0.1.0.0 (setup complete)

---

**Status:** Ready for implementation  
**Estimated Time:** 30-60 minutes  
**Difficulty:** Easy

