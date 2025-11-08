# Weather Dashboard Launcher (PowerShell)
# Automatically activates venv and runs the weather command

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"

# Run weather command with all arguments
python -m weather.cli $args

