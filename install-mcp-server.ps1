# Nebula Framework MCP Server Installation Script
# Run this script from your Nebula Framework directory

Write-Host "Setting up Nebula Framework MCP Server..." -ForegroundColor Green

# Create MCP server directory
$mcpDir = "nebula-framework-mcp"
if (!(Test-Path $mcpDir)) {
    New-Item -ItemType Directory -Path $mcpDir
    Write-Host "Created directory: $mcpDir" -ForegroundColor Yellow
}

# Copy files to MCP directory
Copy-Item "nebula-framework-mcp.js" -Destination $mcpDir
Copy-Item "package.json" -Destination $mcpDir
Write-Host "Copied MCP server files" -ForegroundColor Yellow

# Change to MCP directory and install dependencies
Set-Location $mcpDir
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Test the server
Write-Host "Testing MCP server..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "inspector" -Wait

# Create Cursor MCP configuration
$cursorMcpPath = "$env:USERPROFILE\.cursor\mcp.json"
$cursorMcpDir = Split-Path $cursorMcpPath
$currentPath = (Get-Location).Path
$frameworkPath = (Get-Location).Parent.FullName

if (!(Test-Path $cursorMcpDir)) {
    New-Item -ItemType Directory -Path $cursorMcpDir -Force
}

$mcpConfig = @{
    mcpServers = @{
        "nebula-framework" = @{
            command = "node"
            args = @("$currentPath\nebula-framework-mcp.js")
            env = @{
                NEBULA_FRAMEWORK_PATH = $frameworkPath
            }
        }
    }
} | ConvertTo-Json -Depth 10

$mcpConfig | Out-File -FilePath $cursorMcpPath -Encoding UTF8

Write-Host "MCP Server setup complete!" -ForegroundColor Green
Write-Host "Configuration saved to: $cursorMcpPath" -ForegroundColor Green
Write-Host ""
Write-Host "To use in Cursor:" -ForegroundColor Cyan
Write-Host "1. Restart Cursor" -ForegroundColor White
Write-Host "2. In any project, use these commands:" -ForegroundColor White
Write-Host "   - 'List available framework files'" -ForegroundColor Gray
Write-Host "   - 'Setup Flutter project with Nebula Framework'" -ForegroundColor Gray
Write-Host "   - 'Get FLUTTER_NEBULA_ADAPTATION.md from framework'" -ForegroundColor Gray 