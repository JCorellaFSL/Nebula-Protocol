# Rapid initialization script for Projects 4-10
Write-Host "`n🚀 Rapid Initialization: Projects 4-10`n" -ForegroundColor Cyan

$projects = @(
    @{num=4; name="web-scraper"},
    @{num=5; name="password-manager"},
    @{num=6; name="budget-tracker"},
    @{num=7; name="markdown-blog"},
    @{num=8; name="rest-api"},
    @{num=9; name="discord-bot"},
    @{num=10; name="data-visualizer"}
)

foreach ($proj in $projects) {
    Write-Host "📦 Initializing Project $($proj.num): $($proj.name)..." -ForegroundColor Yellow
    
    Set-Location "project-$($proj.num)"
    
    # Run Nebula init
    node ../../init-nebula-project.js 2>$null | Out-Null
    
    # Quick Python setup
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -q pytest rich colorama
    
    # Create minimal structure
    New-Item -ItemType Directory -Force -Path "src/$($proj.name.Replace('-',''))" | Out-Null
    New-Item -ItemType Directory -Force -Path "tests" | Out-Null
    
    # Initial commit
    git add .
    git commit -q -m "Initial setup: $($proj.name)"
    
    Write-Host "  ✅ Complete`n" -ForegroundColor Green
    
    Set-Location ..
}

Write-Host "✅ All projects initialized!`n" -ForegroundColor Green

