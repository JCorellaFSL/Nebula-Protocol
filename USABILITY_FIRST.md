# Usability First: Nebula Protocol Design Philosophy

**Version:** 1.0 (January 2025)  
**Purpose:** Define usability standards for LLM-generated software

---

## The Problem

Traditional programming creates tools that:
- Require technical knowledge to use
- Assume command-line expertise
- Have cryptic error messages
- Need manual environment setup
- Work great for developers, fail for everyone else

**LLM programming risks amplifying this** by replicating programmer assumptions at scale.

---

## The Solution: Usability First

Every output from the Nebula Protocol must be **immediately usable** by:
1. Complete beginners with an idea
2. Non-technical stakeholders testing features
3. Experienced engineers who want to skip boilerplate
4. Anyone in between

---

## Usability Requirements by Project Type

### Command-Line Applications

#### ❌ Bad Example (Technically Correct)
```bash
# User needs to know:
# - How to activate virtualenv
# - What PATH is
# - Command-line quoting rules

source venv/bin/activate
export PATH=$PATH:~/.local/bin
mytool add "Task with spaces"
```

#### ✅ Good Example (Usable)
```bash
# User just runs one file
./mytool.sh add Task with spaces
```

**Requirements:**
- [ ] Launcher script handles venv activation
- [ ] No PATH configuration needed
- [ ] Natural input (no quotes for simple text)
- [ ] Works on Windows, Mac, Linux (or clear alternatives)
- [ ] Error messages say HOW to fix, not just WHAT went wrong

---

### Web Applications

#### ❌ Bad Example
```bash
npm install
npm run build
export NODE_ENV=production
npm start
```

#### ✅ Good Example
```bash
./start.sh
```
Output:
```
✅ Installing dependencies...
✅ Building project...
✅ Starting server...

🌐 Open http://localhost:3000

Press Ctrl+C to stop
```

**Requirements:**
- [ ] One command to start
- [ ] Automatic dependency installation
- [ ] Clear URL displayed
- [ ] Graceful shutdown instructions
- [ ] Automatic port selection if default is taken

---

### APIs / Libraries

#### ❌ Bad Example (API reference only)
```python
# Documentation
TodoManager.add(description: str) -> Todo
```

#### ✅ Good Example (Copy-paste ready)
```python
# Complete working example
from todo import TodoManager

# Create manager
manager = TodoManager()

# Add some todos
manager.add("Buy groceries")
manager.add("Call mom")
manager.add("Finish project")

# List them
for todo in manager.list_all():
    print(f"- {todo.description}")
```

**Requirements:**
- [ ] Working example included
- [ ] Copy-paste ready code
- [ ] Shows common use cases
- [ ] Explains when/why to use each feature

---

## Error Message Standards

### ❌ Programmer Error Messages

```
TypeError: 'NoneType' object is not iterable
```

```
Error: Command not found: todo
```

```
ValueError: invalid literal for int() with base 10: 'abc'
```

### ✅ Usable Error Messages

```
❌ Error: Can't add an empty todo

To add a todo, type:
  todo add Your task description

Example: todo add Buy groceries
```

```
❌ Error: Todo not found: xyz123

The ID 'xyz123' doesn't match any todos.

To see all todos with their IDs:
  todo list

Then use the first 4+ characters of the ID.
```

```
❌ Error: Expected a number but got 'abc'

The priority must be a number (1-5).

Example: todo add Task here --priority 3
```

**Requirements:**
- [ ] Say what went wrong in plain English
- [ ] Show the exact command to fix it
- [ ] Include a working example
- [ ] No jargon (TypeError, NoneType, etc.)

---

## Testing for Usability

### The Grandma Test

Would your grandmother (or any non-technical person) be able to:
1. Install the application
2. Use its basic features
3. Understand error messages
4. Get help when stuck

If the answer to ANY is "no," the usability fails.

### The Fresh Install Test

On a completely fresh system:
1. Can the user get it working in ONE command?
2. Do they need to know what Python/Node/Git is?
3. Do they need to edit config files?
4. Do they need to look up command-line syntax?

If the answer to 2-4 is "yes," the usability fails.

### The Error Test

When something goes wrong:
1. Is the error message in plain English?
2. Does it tell them EXACTLY how to fix it?
3. Does it include a working example?
4. Would they know what to do without Googling?

If the answer to ANY is "no," the usability fails.

---

## Implementation Checklist

For every project, the LLM MUST create:

### For CLI Applications
- [ ] Launcher scripts (`.bat`, `.ps1`, `.sh`)
- [ ] One-command install (or automatic on first run)
- [ ] Natural input (no unnecessary syntax)
- [ ] Helpful error messages with examples
- [ ] Cross-platform support or clear alternatives

### For Web Applications
- [ ] Single startup script
- [ ] Automatic dependency install
- [ ] Clear URL + port in output
- [ ] Graceful error handling
- [ ] Auto-port selection if needed

### For All Projects
- [ ] README with copy-paste examples
- [ ] Error messages with solutions
- [ ] Works immediately after clone/download
- [ ] No manual configuration needed
- [ ] Tested on target platform

---

## Common Pitfalls to Avoid

### 1. Assuming Technical Knowledge

❌ "Just activate your virtual environment first"
✅ Create a launcher that does it automatically

❌ "Add the bin directory to your PATH"
✅ Use absolute paths or put scripts in project root

❌ "Install dependencies with pip install -r requirements.txt"
✅ Launcher script does this automatically on first run

### 2. Programmer Defaults

❌ Requiring quotes: `tool add "Task here"`
✅ Natural input: `tool add Task here`

❌ Cryptic flags: `tool -l --filter-by-status=active`
✅ Readable: `tool list --active`

❌ Technical errors: `ModuleNotFoundError: No module named 'todo'`
✅ Helpful errors: `❌ Error: Missing dependencies. Run: pip install -e .`

### 3. Platform Assumptions

❌ Only providing `.sh` scripts
✅ Provide `.bat` (Windows CMD), `.ps1` (PowerShell), `.sh` (Mac/Linux)

❌ Using Unix-only commands (`grep`, `sed`, `&&`)
✅ Use cross-platform Python scripts or provide alternatives

❌ Hardcoded `/usr/local` paths
✅ Use relative paths or auto-detect

---

## Enforcement

**Star Gates validate usability:**

Every Star Gate includes:
- [ ] **Usability Test:** Can a non-technical user use it?
- [ ] **Error Message Review:** Are errors helpful?
- [ ] **Platform Compatibility:** Works on target platforms?
- [ ] **One-Command Install:** Can start with one command?
- [ ] **Documentation Quality:** Examples are copy-paste ready?

**If ANY fail, the Star Gate FAILS.**

---

## Examples from Project 1 (Todo CLI)

### Initial Implementation (Failed Usability)

**Problem:** Required quotes for multi-word input
```powershell
todo add "Buy milk"  # Works
todo add Buy milk    # Error!
```

**Why it's bad:** Forces users to understand command-line quoting rules

### Fixed Implementation (Passes Usability)

**Solution:** Accept natural input
```powershell
todo add Buy milk              # Just works
todo add Call mom tomorrow     # Just works
```

**Change made:** Used `nargs='*'` in argparse, joined arguments automatically

---

## Philosophy

> **The best interface is no interface.**  
> The second-best is one that feels natural.  
> The worst is one that requires reading documentation.

When building with LLMs:
- Make it work like users expect
- Remove unnecessary barriers
- Optimize for the first-time experience
- Assume zero technical knowledge

**Build for humans, not for programmers.**

---

**This is not optional. This is the standard.**

