@echo off
REM Todo List CLI Launcher
REM Automatically activates venv and runs the todo command

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Activate virtual environment and run todo
call venv\Scripts\activate.bat
python -m todo.cli %*

