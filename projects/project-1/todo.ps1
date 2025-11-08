# Todo List CLI Launcher (PowerShell)
# Automatically activates venv and runs the todo command

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"

# Run todo command with all arguments
python -m todo.cli $args

