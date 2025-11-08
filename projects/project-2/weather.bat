@echo off
REM Weather Dashboard Launcher
REM Automatically activates venv and runs the weather command

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Activate virtual environment and run weather
call venv\Scripts\activate.bat
python -m weather.cli %*

