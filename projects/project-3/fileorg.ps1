# File Organizer Launcher (PowerShell)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

& ".\venv\Scripts\Activate.ps1"
python -m fileorg.cli $args

