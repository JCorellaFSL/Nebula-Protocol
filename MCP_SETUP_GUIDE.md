# Nebula Framework MCP Integration Setup Guide

## Overview
This guide shows you how to set up MCP (Model Context Protocol) integration so your Nebula Framework files are accessible from any Cursor project without copying them.

## 📦 First: Clone the Repository

**⚠️ Important:** Before setting up MCP integration, we recommend cloning the Nebula Framework repository to your local machine for easy access to all files:

```bash
# Clone the repository
git clone https://github.com/JCorellaFSL/Context-Engineering-Protocol.git
cd Context-Engineering-Protocol

# Or if you want to clone to a specific directory
git clone https://github.com/JCorellaFSL/Context-Engineering-Protocol.git ~/nebula-framework
```

**Benefits of cloning:**
- ✅ Access to all framework files locally
- ✅ Easy to copy files to new projects
- ✅ Can modify and customize for your needs
- ✅ Always have the latest version with `git pull`

## Option 1: GitMCP Service (Easiest)

### Prerequisites
- Your Nebula Framework repository pushed to GitHub
- Cursor IDE with MCP support

### Setup Steps

1. **Push to GitHub** (if not already done):
   ```bash
   git remote add origin https://github.com/your-username/your-nebula-repo.git
   git push -u origin main
   ```

2. **Configure Cursor MCP** (`~/.cursor/mcp.json`):
   ```json
   {
     "mcpServers": {
       "nebula-framework": {
         "url": "https://gitmcp.io/_/your-username/your-nebula-repo"
       }
     }
   }
   ```

3. **Usage in Cursor**:
   ```
   "I'm using the Nebula Framework. Please access the framework files 
   from the nebula-framework MCP server to guide my Flutter project development."
   ```

### Benefits
- ✅ No local installation required
- ✅ Always up-to-date with your repository
- ✅ Works from any machine with Cursor
- ✅ Handles git authentication automatically

## Option 2: Custom MCP Server (More Control)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Your Nebula Framework files locally

### Setup Steps

1. **Create MCP Server Directory**:
   ```bash
   mkdir nebula-framework-mcp
   cd nebula-framework-mcp
   ```

2. **Initialize and Install**:
   ```bash
   npm init -y
   npm install @modelcontextprotocol/sdk zod
   ```

3. **Copy Framework Files**:
   Copy the `nebula-framework-mcp.js` and `package.json` files created above to your MCP server directory.

4. **Make Executable**:
   ```bash
   chmod +x nebula-framework-mcp.js
   ```

5. **Configure Environment**:
   Set the path to your framework files (optional - defaults to current path):
   ```bash
   # Windows (PowerShell)
   $env:NEBULA_FRAMEWORK_PATH = "C:\Users\YourUser\Dev\nebula-framework"
   
   # Linux/Mac
   export NEBULA_FRAMEWORK_PATH="/home/user/Dev/nebula-framework"
   ```

6. **Test the Server**:
   ```bash
   npm run inspector
   ```

7. **Configure Cursor** (`~/.cursor/mcp.json`):
   ```json
   {
     "mcpServers": {
       "nebula-framework": {
         "command": "node",
         "args": ["/path/to/nebula-framework-mcp/nebula-framework-mcp.js"],
         "env": {
           "NEBULA_FRAMEWORK_PATH": "C:\\Users\\YourUser\\Dev\\nebula-framework"
         }
       }
     }
   }
   ```

### Available Tools
The custom MCP server provides these tools:

- **`list_framework_files`**: Lists all available framework files
- **`get_framework_file`**: Retrieves a specific framework file
- **`setup_project_framework`**: Gets complete framework setup for a project type (flutter/tauri/python/generic)

### Usage Examples

```
# List available framework files
"Please use the list_framework_files tool to show me what's available."

# Get Flutter-specific framework
"Use setup_project_framework with project_type 'flutter' to set up my Flutter project."

# Get specific file
"Use get_framework_file to retrieve 'FLUTTER_NEBULA_ADAPTATION.md'."
```

## Option 3: Global npm Package (Advanced)

### Setup Steps

1. **Publish to npm** (from your MCP server directory):
   ```bash
   npm publish
   ```

2. **Configure Cursor** (`~/.cursor/mcp.json`):
   ```json
   {
     "mcpServers": {
       "nebula-framework": {
         "command": "npx",
         "args": ["-y", "nebula-framework-mcp"],
         "env": {
           "NEBULA_FRAMEWORK_PATH": "C:\\Users\\YourUser\\Dev\\nebula-framework"
         }
       }
     }
   }
   ```

### Benefits
- ✅ Easy installation across machines
- ✅ Version control for MCP server
- ✅ Shareable with team members

## Recommended Workflow

### For Personal Use
Use **Option 1 (GitMCP)** - it's the simplest and most reliable.

### For Team Use
Use **Option 3 (npm package)** - allows team members to easily use the same framework.

### For Development/Testing
Use **Option 2 (Custom server)** - gives you full control and ability to modify.

## AI Conversation Patterns

Once set up, use these patterns in Cursor:

### Project Initialization
```
"I'm starting a new Flutter project using the Nebula Framework. 
Please use the nebula-framework MCP server to get the Flutter adaptation 
and help me set up the project structure."
```

### Feature Development
```
"I'm in Phase 1 of my Nebula roadmap. Please reference the framework 
files from the MCP server to guide implementing the core authentication features."
```

### Code Review
```
"Please review this code against the Nebula Framework testing standards. 
Use the framework files from the MCP server to ensure I'm following 
the validation patterns correctly."
```

## Troubleshooting

### Common Issues

1. **MCP Server Not Found**:
   - Check file paths in configuration
   - Verify Node.js is installed
   - Test with `npm run inspector`

2. **Permission Errors**:
   - Ensure execute permissions on script files
   - Check directory access permissions

3. **Framework Files Not Found**:
   - Verify `NEBULA_FRAMEWORK_PATH` environment variable
   - Check file paths are correct
   - Ensure all .md files are present

### Debug Commands

```bash
# Test MCP server
npm run inspector

# Check Cursor MCP logs (Mac/Linux)
tail -f ~/Library/Logs/Claude/mcp*.log

# Check Cursor MCP logs (Windows)
Get-Content -Path "$env:APPDATA\Cursor\logs\mcp*.log" -Wait
```

## Benefits of MCP Integration

✅ **No Copy-Paste**: Framework files available in every project
✅ **Always Current**: Files stay up-to-date automatically
✅ **Consistent Context**: AI always has the same framework reference
✅ **Team Collaboration**: Everyone uses the same framework version
✅ **Faster Development**: Instant access to framework guidance

---

Choose the option that best fits your workflow and start using the Nebula Framework seamlessly across all your projects! 