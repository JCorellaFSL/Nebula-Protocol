@echo off
REM File Organizer Launcher

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

call venv\Scripts\activate.bat
python -m fileorg.cli %*

