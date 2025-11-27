#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Import Core Logic
import { ProjectMemory } from "../src/project-memory.js";
// import { StarChartStore } from "../src/star-chart.js"; // Optional: If managing global knowledge

// Helper to resolve paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

// Initialize Server
const server = new McpServer({
  name: "Nebula Protocol Guardian",
  version: "1.0.0",
  description: "Enforces Nebula Protocol compliance, manages project memory, and ensures quality gates."
});

// ------------------------------------------------------------------
// TOOL: Verify Compliance
// ------------------------------------------------------------------
server.tool("verify_compliance",
  {
    project_path: z.string().describe("Path to the project root to verify")
  },
  async ({ project_path }) => {
    try {
      const errors = [];
      const warnings = [];
      
      // 1. Check Structure
      const required = ['ROADMAP.md', '.nebula'];
      for (const req of required) {
        if (!await fs.pathExists(path.join(project_path, req))) {
          errors.push(`Missing required file/directory: ${req}`);
        }
      }
      
      // 2. Check .nebula integrity
      if (await fs.pathExists(path.join(project_path, '.nebula'))) {
        if (!await fs.pathExists(path.join(project_path, '.nebula/project_memory.sqlite'))) {
          warnings.push("Project Memory database not found (will be created on first write)");
        }
        if (!await fs.pathExists(path.join(project_path, '.nebula/logs'))) {
          errors.push("Missing .nebula/logs directory");
        }
      }

      // 3. Check Central KG Connection
      try {
        const res = await fetch('http://localhost:8080/health');
        if (!res.ok) throw new Error(`Status ${res.status}`);
      } catch (e) {
        errors.push("Central Knowledge Graph unreachable (Docker container down?)");
      }

      const success = errors.length === 0;
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            compliant: success,
            errors,
            warnings,
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Verification failed: ${error.message}` }] };
    }
  }
);

// ------------------------------------------------------------------
// TOOL: Initialize Project
// ------------------------------------------------------------------
server.tool("init_project",
  {
    name: z.string(),
    type: z.enum(["python", "rust", "typescript", "flutter", "generic"]),
    complexity: z.enum(["simple", "moderate", "complex"]).default("moderate"),
    path: z.string().optional().describe("Optional target path. If not provided, creates in <ROOT_DIR>/../projects/<name>.")
  },
  async ({ name, type, complexity, path: targetPath }) => {
    try {
      // Determine Target Directory
      // Default to <ROOT_DIR>/../projects/<name> (sibling to protocol)
      const finalPath = targetPath 
        ? path.resolve(targetPath) 
        : path.resolve(ROOT_DIR, "..", "projects", name);

      console.error(`Initializing project at: ${finalPath}`);

      // Create Directory
      await fs.ensureDir(finalPath);

      // Locate init script in Protocol Root
      const initScript = path.resolve(ROOT_DIR, "..", "init-nebula-project.js");
      
      if (!await fs.pathExists(initScript)) {
        throw new Error(`Initialization script not found at ${initScript}`);
      }

      // Execute Initialization
      // We assume 'node' is in the path.
      execSync(`node "${initScript}" ${type} "${name}" ${complexity}`, {
        cwd: finalPath,
        stdio: 'inherit' // Or 'pipe' if we want to capture output
      });

      return {
        content: [{
          type: "text",
          text: `✅ Project '${name}' initialized successfully at:\n${finalPath}\n\nCompliance Verified.`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `❌ Initialization Failed: ${error.message}`
        }]
      };
    }
  }
);

// ------------------------------------------------------------------
// TOOL: Log Error (Project Memory)
// ------------------------------------------------------------------
server.tool("log_error",
  {
    project_path: z.string(),
    message: z.string(),
    severity: z.enum(["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]),
    phase: z.string().optional().default("UNKNOWN"),
    constellation: z.string().optional().default("UNKNOWN"),
    file_path: z.string().optional(),
    line_number: z.number().optional(),
    stack_trace: z.string().optional()
  },
  async ({ project_path, message, severity, phase, constellation, file_path, line_number, stack_trace }) => {
    try {
      // Use the ProjectMemory class to write to SQLite
      const memory = new ProjectMemory(project_path);
      const result = memory.logError({
        level: severity,
        message,
        phase,
        constellation,
        filePath: file_path,
        lineNumber: line_number,
        stackTrace: stack_trace
      });
      memory.close();

      let output = `[${severity}] Error logged: ${result.errorId}`;
      if (result.patternFound) {
        output += `\n⚠️  Pattern Detected! (${result.occurrences} occurrences)`;
        if (result.recommendedSolution) {
          output += `\n💡 Recommended Solution: ${result.recommendedSolution}`;
        }
      }
      return { content: [{ type: "text", text: output }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Failed to log error: ${e.message}` }] };
    }
  }
);

// ------------------------------------------------------------------
// TOOL: Record Star Gate (Quality Gate)
// ------------------------------------------------------------------
server.tool("record_star_gate",
  {
    project_path: z.string(),
    constellation: z.string(),
    status: z.enum(["passed", "failed", "skipped"]),
    notes: z.string().optional()
  },
  async ({ project_path, constellation, status, notes }) => {
    try {
      const memory = new ProjectMemory(project_path);
      // We map the simple input to the complex recordStarGate signature
      const gateId = memory.recordStarGate({
        constellation,
        constellationNumber: -1, // Unknown if not parsed
        status,
        notes,
        testsAutomated: 0, // Defaults
        testsManual: 0
      });
      memory.close();
      return { content: [{ type: "text", text: `Star Gate recorded: ${gateId} (${status})` }] };
    } catch (e) {
       return { content: [{ type: "text", text: `Failed to record Star Gate: ${e.message}` }] };
    }
  }
);

// ------------------------------------------------------------------
// TOOL: Get Project Stats
// ------------------------------------------------------------------
server.tool("get_project_stats",
  {
    project_path: z.string()
  },
  async ({ project_path }) => {
    try {
      const memory = new ProjectMemory(project_path);
      const stats = memory.getStatistics();
      memory.close();
      return { content: [{ type: "text", text: JSON.stringify(stats, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Failed to get stats: ${e.message}` }] };
    }
  }
);


// ------------------------------------------------------------------
// Start Server
// ------------------------------------------------------------------
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Nebula Protocol Guardian Active 🛡️");
