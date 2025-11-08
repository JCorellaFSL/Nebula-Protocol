# File Organizer

An intelligent CLI tool that automatically sorts files into folders based on type, date, or custom rules.

## 🎯 Features

- **Auto-Organize by Type** - Images → Images/, Documents → Docs/
- **Organize by Date** - Files sorted into Year/Month folders  
- **Custom Rules** - Define your own organization patterns (Coming soon)
- **Duplicate Detection** - Find and handle duplicates (Coming soon)
- **Dry-Run Mode** - Preview changes before applying
- **Undo Function** - Reverse organization (Coming soon)
- **Watch Mode** - Auto-organize new files (Coming soon)

## 🚀 Quick Start

### Windows

**PowerShell:**
```powershell
.\fileorg.ps1 organize ~/Downloads --type
```

**Command Prompt:**
```cmd
fileorg.bat organize C:\Users\You\Downloads --type
```

## 📖 Usage

### Organize by File Type

```powershell
.\fileorg.ps1 organize ~/Downloads --type
```

### Organize by Date

```powershell
.\fileorg.ps1 organize ~/Downloads --date
```

### Preview Changes (Dry Run)

```powershell
.\fileorg.ps1 organize ~/Downloads --dry-run
```

## 🧪 Development

### Run Tests

```bash
pytest tests/ -v
```

### Code Quality

```bash
# Format
black src/ tests/

# Lint
flake8 src/ tests/
```

## 📂 Project Structure

```
file-organizer/
├── src/fileorg/
│   ├── __init__.py
│   ├── cli.py              # Command-line interface
│   ├── scanner.py          # File scanning
│   └── ...                 # More modules coming
├── tests/
│   └── test_smoke.py
├── fileorg.ps1             # PowerShell launcher
└── fileorg.bat             # Batch launcher
```

## 🌌 Development Progress

### ✅ Constellation 0: Setup (COMPLETE)
- [x] Python environment
- [x] Project structure  
- [x] Basic CLI framework
- [x] File scanner stub
- [x] All smoke tests passing

**Version:** 0.0.1.0

### ⏳ Constellation 1: File Type Organization (Next)
- [ ] File type detection
- [ ] Folder creation
- [ ] File moving logic
- [ ] Progress indicators

### ⏳ Constellation 2: Date-Based Organization (Future)
- [ ] Date parsing
- [ ] Year/Month folder structure
- [ ] Metadata preservation

## 🛠️ Technology Stack

- **Python** 3.10+
- **watchdog** - File system monitoring
- **rich** - Beautiful terminal output
- **PyYAML** - Configuration files
- **pytest** - Testing

---

**Current Status:** Setup complete, ready for file organization features!

