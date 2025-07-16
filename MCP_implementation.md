# Nebula Framework MCP Implementation Guide

## Overview

The Nebula Framework includes Model Context Protocol (MCP) integration to provide seamless access to framework files and guidance directly within AI development environments like Cursor, Claude Desktop, and other MCP-compatible tools.

This guide covers two primary implementation approaches:

1. **GitMCP Service** (Cloud-based, recommended)
2. **Custom MCP Server** (Local/self-hosted)

## What is MCP?

Model Context Protocol (MCP) is an open standard that enables AI applications to securely access external resources and tools. For the Nebula Framework, MCP provides:

- **Direct access** to framework files from any project
- **Consistent context** across all development sessions
- **Real-time updates** when framework files change
- **Standardized integration** with AI development tools

## Option 1: GitMCP Service (Recommended)

### Overview
GitMCP provides cloud-based access to any GitHub repository through the MCP protocol. This is the easiest and most reliable approach for most users.

### Prerequisites
- GitHub repository with your Nebula Framework files
- Cursor IDE (or other MCP-compatible tool)
- Internet connection

### Setup Steps

#### Step 1: Verify GitHub Repository
Ensure your Nebula Framework repository is public and accessible at:
```
https://github.com/your-username/your-repo-name
```

#### Step 2: Configure MCP Client

**For Cursor IDE:**
1. Open Cursor Settings → **Tools & Integrations** → **MCP**
2. Click **"New MCP Server"**
3. Add this configuration:

```json
{
  "mcpServers": {
    "nebula-framework": {
      "url": "https://gitmcp.io/_/your-username/your-repo-name"
    }
  }
}
```

**For Claude Desktop:**
1. Open your configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add this configuration:
```json
{
  "mcpServers": {
    "nebula-framework": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://gitmcp.io/_/your-username/your-repo-name"
      ]
    }
  }
}
```

#### Step 3: Restart Your AI Tool
Restart Cursor or Claude Desktop for the changes to take effect.

#### Step 4: Test the Integration
Try this command in your AI tool:
```
"Please access the Nebula Framework files from the nebula-framework MCP server 
and show me what framework files are available."
```

### Benefits of GitMCP Approach
- ✅ **No local setup required**
- ✅ **Always up-to-date** with repository changes
- ✅ **Works from any machine**
- ✅ **Automatic git authentication**
- ✅ **Zero maintenance**

### Limitations
- Requires internet connection
- Limited to public repositories (or accessible private repos)
- Dependent on GitMCP service availability

## Option 2: Custom MCP Server

### Overview
A custom MCP server provides more control and can include additional tools beyond basic file access.

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)
- Local copy of Nebula Framework files

### Setup Steps

#### Step 1: Create MCP Server Directory
```bash
mkdir nebula-framework-mcp
cd nebula-framework-mcp
```

#### Step 2: Initialize Node.js Project
```bash
npm init -y
npm install @modelcontextprotocol/sdk zod
```

#### Step 3: Create MCP Server File
Create `nebula-framework-mcp.js` with the following content:

```javascript
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";

// Path to your Nebula Framework files
const FRAMEWORK_PATH = process.env.NEBULA_FRAMEWORK_PATH || "/path/to/your/framework";

const server = new McpServer({
  name: "Nebula Framework",
  version: "1.0.0",
  description: "Provides access to Nebula Framework files for context engineering"
});

// Tool to get framework file contents
server.tool("get_framework_file",
  { 
    filename: z.string().describe("Framework file to retrieve"),
    project_type: z.enum(["flutter", "tauri", "python", "generic"]).optional()
  },
  async ({ filename, project_type }) => {
    try {
      if (project_type && !filename) {
        const typeMap = {
          "flutter": "FLUTTER_NEBULA_ADAPTATION.md",
          "tauri": "TAURI_NEBULA_ADAPTATION.md", 
          "python": "PYTHON_NEBULA_ADAPTATION.md",
          "generic": "Nebula_Protocol.md"
        };
        filename = typeMap[project_type];
      }

      const filePath = path.join(FRAMEWORK_PATH, filename);
      
      if (!fs.existsSync(filePath)) {
        return {
          content: [{ 
            type: "text", 
            text: `Error: Framework file '${filename}' not found` 
          }]
        };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      return {
        content: [{ 
          type: "text", 
          text: `# ${filename}\n\n${content}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error reading framework file: ${error.message}` 
        }]
      };
    }
  }
);

// Tool to list available framework files
server.tool("list_framework_files",
  {},
  async () => {
    try {
      const files = fs.readdirSync(FRAMEWORK_PATH)
        .filter(file => file.endsWith('.md'))
        .sort();
      
      const descriptions = {
        "README.md": "How-to-use guide for the Nebula Framework",
        "Nebula_readme.md": "Complete framework philosophy and overview",
        "Nebula_Protocol.md": "Core framework specification (generic)",
        "FLUTTER_NEBULA_ADAPTATION.md": "Flutter-specific adaptation",
        "TAURI_NEBULA_ADAPTATION.md": "Tauri-specific adaptation", 
        "PYTHON_NEBULA_ADAPTATION.md": "Python-specific adaptation",
        "IMPLEMENTATION_GUIDE.md": "Detailed implementation steps"
      };

      const fileList = files.map(file => 
        `- **${file}**: ${descriptions[file] || "Framework documentation"}`
      ).join('\n');

      return {
        content: [{ 
          type: "text", 
          text: `# Available Nebula Framework Files\n\n${fileList}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error listing framework files: ${error.message}` 
        }]
      };
    }
  }
);

// Tool to get complete framework setup for a project type
server.tool("setup_project_framework",
  { 
    project_type: z.enum(["flutter", "tauri", "python", "generic"])
  },
  async ({ project_type }) => {
    try {
      const mainFiles = {
        "flutter": "FLUTTER_NEBULA_ADAPTATION.md",
        "tauri": "TAURI_NEBULA_ADAPTATION.md",
        "python": "PYTHON_NEBULA_ADAPTATION.md", 
        "generic": "Nebula_Protocol.md"
      };

      const mainFile = mainFiles[project_type];
      const howToFile = "README.md";

      const mainContent = fs.readFileSync(path.join(FRAMEWORK_PATH, mainFile), 'utf8');
      const howToContent = fs.readFileSync(path.join(FRAMEWORK_PATH, howToFile), 'utf8');

      return {
        content: [{ 
          type: "text", 
          text: `# Complete Nebula Framework Setup for ${project_type.toUpperCase()}\n\n## How to Use Guide\n\n${howToContent}\n\n---\n\n## Framework Specification\n\n${mainContent}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error setting up framework: ${error.message}` 
        }]
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

#### Step 4: Update package.json
```json
{
  "name": "nebula-framework-mcp",
  "version": "1.0.0",
  "description": "MCP server for Nebula Framework",
  "main": "nebula-framework-mcp.js",
  "type": "module",
  "bin": {
    "nebula-framework-mcp": "./nebula-framework-mcp.js"
  },
  "scripts": {
    "start": "node nebula-framework-mcp.js",
    "inspector": "npx @modelcontextprotocol/inspector node nebula-framework-mcp.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0"
  }
}
```

#### Step 5: Make Script Executable
```bash
# Linux/Mac
chmod +x nebula-framework-mcp.js

# Windows - no action needed
```

#### Step 6: Test the Server
```bash
npm run inspector
```

#### Step 7: Configure AI Tool

**For Cursor IDE:**
Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "nebula-framework": {
      "command": "node",
      "args": ["/absolute/path/to/nebula-framework-mcp.js"],
      "env": {
        "NEBULA_FRAMEWORK_PATH": "/absolute/path/to/your/framework/files"
      }
    }
  }
}
```

**For Claude Desktop:**
Add to configuration file:
```json
{
  "mcpServers": {
    "nebula-framework": {
      "command": "node",
      "args": ["/absolute/path/to/nebula-framework-mcp.js"],
      "env": {
        "NEBULA_FRAMEWORK_PATH": "/absolute/path/to/your/framework/files"
      }
    }
  }
}
```

### Benefits of Custom MCP Server
- ✅ **Full control** over functionality
- ✅ **Works offline** (no internet required)
- ✅ **Custom tools** can be added
- ✅ **Private/internal** repositories supported
- ✅ **Enhanced features** beyond basic file access

### Limitations
- Requires Node.js installation
- Manual setup and maintenance
- Local file path dependencies
- Need to update manually when framework changes

## Activation and Usage

### Testing Your MCP Integration

#### 1. Verify MCP Server is Running
Check that your MCP server appears in your AI tool's available tools or servers list.

#### 2. Test Basic Functionality
```
"Please use the nebula-framework MCP server to list available framework files."
```

#### 3. Test Project-Specific Access
```
"I'm working on a Flutter project. Please use the nebula-framework MCP server 
to get the Flutter-specific framework setup."
```

### Common Usage Patterns

#### Project Initialization
```
"I'm starting a new [Flutter/Tauri/Python] project using the Nebula Framework. 
Please access the framework files from the MCP server and help me set up 
the project structure following the Nebula pattern."
```

#### Phase-Based Development
```
"I'm in Phase 1 of my Nebula roadmap focusing on core features. 
Please reference the framework files from the MCP server to guide 
my implementation approach."
```

#### Code Review and Validation
```
"Please review this code against the Nebula Framework testing standards. 
Use the framework files from the MCP server to ensure I'm following 
the validation patterns correctly."
```

### Available MCP Tools

When using the custom MCP server, you have access to these tools:

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_framework_files` | Lists all available framework files | None |
| `get_framework_file` | Retrieves specific framework file | filename, project_type (optional) |
| `setup_project_framework` | Gets complete framework setup for project type | project_type (required) |

## Troubleshooting

### Common Issues

#### GitMCP Service Issues
- **Server not found**: Verify repository URL is correct and public
- **Files not loading**: Check if repository is accessible and contains expected files
- **Authentication errors**: Ensure repository is public or properly authenticated

#### Custom MCP Server Issues
- **Server won't start**: Check Node.js installation and package dependencies
- **Files not found**: Verify `NEBULA_FRAMEWORK_PATH` environment variable is set correctly
- **Permission errors**: Ensure script has execute permissions (Linux/Mac)

### Debug Commands

```bash
# Test custom MCP server
npm run inspector

# Check MCP server logs (varies by AI tool)
# Cursor: Check ~/.cursor/logs/
# Claude Desktop: Check application logs

# Verify file paths
echo $NEBULA_FRAMEWORK_PATH  # Linux/Mac
echo $env:NEBULA_FRAMEWORK_PATH  # Windows PowerShell
```

### Getting Help

1. **Check the MCP Setup Guide**: Reference `MCP_SETUP_GUIDE.md` for additional setup options
2. **Verify Configuration**: Double-check JSON syntax in configuration files
3. **Test Step-by-Step**: Start with basic functionality before advanced features
4. **Check Dependencies**: Ensure all required packages are installed

## Maintenance

### Keeping Your MCP Integration Updated

#### GitMCP Service
- Automatically stays updated with your repository
- No manual maintenance required
- Push changes to GitHub to update immediately

#### Custom MCP Server
- Update framework files manually
- Restart MCP server after changes
- Consider version control for the MCP server itself

### Best Practices

1. **Test Changes**: Always test MCP integration after framework updates
2. **Document Configuration**: Keep track of your MCP server configuration
3. **Version Control**: Include MCP server code in your framework repository
4. **Monitor Performance**: Check MCP server responsiveness regularly

## Advanced Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEBULA_FRAMEWORK_PATH` | Path to framework files | Current directory |
| `MCP_LOG_LEVEL` | Logging level | `info` |
| `MCP_PORT` | HTTP port (if using HTTP transport) | `3000` |

### Custom Tools

You can extend the custom MCP server with additional tools:

```javascript
// Example: Add a tool to generate constellation templates
server.tool("generate_constellation_template",
  { 
    phase_number: z.number(),
    phase_name: z.string(),
    project_type: z.enum(["flutter", "tauri", "python", "generic"])
  },
  async ({ phase_number, phase_name, project_type }) => {
    // Implementation for generating constellation templates
    // ...
  }
);
```

---

## Conclusion

The Nebula Framework MCP integration provides powerful, seamless access to framework files and guidance directly within your AI development environment. Choose the approach that best fits your needs:

- **GitMCP Service** for simplicity and automatic updates
- **Custom MCP Server** for full control and enhanced functionality

Both approaches enable the same core benefit: consistent, immediate access to your Nebula Framework from any project, making your AI-assisted development more efficient and structured.

For additional setup options and troubleshooting, refer to the `MCP_SETUP_GUIDE.md` file in this repository. 