#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";

// Path to your Star Cluster framework files
const FRAMEWORK_PATH = process.env.NEBULA_FRAMEWORK_PATH || "/c/Users/JohnC/Dev/Star Cluster";

const server = new McpServer({
  name: "Nebula Framework",
  version: "1.0.0",
  description: "Provides access to Nebula Framework files for context engineering"
});

// Tool to get framework file contents
server.tool("get_framework_file",
  { 
    filename: z.string().describe("Framework file to retrieve (e.g., FLUTTER_NEBULA_ADAPTATION.md)"),
    project_type: z.enum(["flutter", "tauri", "python", "generic"]).optional().describe("Project type for automatic file selection")
  },
  async ({ filename, project_type }) => {
    try {
      // Auto-select appropriate framework file if project_type is provided
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
            text: `Error: Framework file '${filename}' not found at ${filePath}` 
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
        "MCP_implementation.md": "Complete MCP server setup and activation guide",
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
          text: `# Available Nebula Framework Files\n\n${fileList}\n\n## Usage\nUse the get_framework_file tool to retrieve any of these files for your project context.` 
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
    project_type: z.enum(["flutter", "tauri", "python", "generic"]).describe("Type of project to set up framework for")
  },
  async ({ project_type }) => {
    try {
      // Get main framework file
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
          text: `Error setting up framework for ${project_type}: ${error.message}` 
        }]
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport); 