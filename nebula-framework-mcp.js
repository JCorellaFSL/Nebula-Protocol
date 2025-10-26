#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { StarChartStore } from "./star-chart.js";
import { ProjectMemory } from "./project-memory.js";

// Resolve the Nebula Framework base directory with sensible cross-platform defaults
function resolveFrameworkPath() {
  const candidates = [];
  const envPath = process.env.NEBULA_FRAMEWORK_PATH;
  if (envPath) candidates.push(envPath);

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  candidates.push(scriptDir);
  candidates.push(path.resolve(scriptDir, ".."));
  candidates.push(process.cwd());

  const markerFiles = [
    "Nebula_Protocol.md",
    "Nebula_readme.md",
    "README.md"
  ];

  for (const candidate of candidates) {
    try {
      const stats = fs.existsSync(candidate) && fs.statSync(candidate);
      if (!stats || !stats.isDirectory()) continue;
      const hasMarker = markerFiles.some(f => fs.existsSync(path.join(candidate, f)));
      if (hasMarker) return candidate;
    } catch (_) {
      // ignore and try next candidate
    }
  }
  // Fallback to script directory even if markers not found
  return path.dirname(fileURLToPath(import.meta.url));
}

const FRAMEWORK_PATH = resolveFrameworkPath();

function isPathInside(parent, child) {
  const resolvedParent = path.resolve(parent) + path.sep;
  const resolvedChild = path.resolve(child) + path.sep;
  return resolvedChild.toLowerCase().startsWith(resolvedParent.toLowerCase());
}

function resolveSafeFrameworkFile(filename) {
  if (!filename) return null;
  if (!filename.toLowerCase().endsWith(".md")) return null;
  const resolved = path.resolve(FRAMEWORK_PATH, filename);
  if (!isPathInside(FRAMEWORK_PATH, resolved)) return null;
  return resolved;
}

const server = new McpServer({
  name: "Nebula Framework",
  version: "1.0.0",
  description: "Provides access to Nebula Framework files for context engineering"
});

// Tool to get framework file contents
server.tool("get_framework_file",
  { 
    filename: z.string().optional().describe("Framework file to retrieve (e.g., FLUTTER_NEBULA_ADAPTATION.md)"),
    project_type: z.enum(["flutter", "tauri", "python", "rust", "dioxus", "generic"]).optional().describe("Project type for automatic file selection")
  },
  async ({ filename, project_type }) => {
    try {
      // Auto-select appropriate framework file if project_type is provided
      if (project_type && !filename) {
        const typeMap = {
          "flutter": "FLUTTER_NEBULA_ADAPTATION.md",
          "tauri": "TAURI_NEBULA_ADAPTATION.md", 
          "python": "PYTHON_NEBULA_ADAPTATION.md",
          "rust": "RUST_NEBULA_ADAPTATION.md",
          "dioxus": "DIOXUS_NEBULA_ADAPTATION.md",
          "generic": "Nebula_Protocol.md"
        };
        filename = typeMap[project_type];
      }
      if (!filename) {
        return {
          content: [{
            type: "text",
            text: "Error: No filename provided and project_type not specified. Provide 'filename' or 'project_type'."
          }]
        };
      }

      const filePath = resolveSafeFrameworkFile(filename);
      if (!filePath) {
        return {
          content: [{
            type: "text",
            text: `Error: Invalid filename '${filename}'. Only .md files under the framework directory are allowed.`
          }]
        };
      }
      
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
      const baseFiles = fs.readdirSync(FRAMEWORK_PATH)
        .filter(file => file.endsWith('.md'));

      const docsDir = path.join(FRAMEWORK_PATH, 'docs');
      const docsFiles = fs.existsSync(docsDir) && fs.statSync(docsDir).isDirectory()
        ? fs.readdirSync(docsDir).filter(file => file.endsWith('.md'))
        : [];

      const files = Array.from(new Set([...baseFiles, ...docsFiles])).sort();
      
      const descriptions = {
        "README.md": "How-to-use guide for the Nebula Framework",
        "Nebula_readme.md": "Complete framework philosophy and overview",
        "Nebula_Protocol.md": "Core framework specification (generic)",
        "MCP_implementation.md": "Complete MCP server setup and activation guide",
        "FLUTTER_NEBULA_ADAPTATION.md": "Flutter-specific adaptation",
        "TAURI_NEBULA_ADAPTATION.md": "Tauri-specific adaptation", 
        "PYTHON_NEBULA_ADAPTATION.md": "Python-specific adaptation",
        "RUST_NEBULA_ADAPTATION.md": "Pure Rust-specific adaptation",
        "DIOXUS_NEBULA_ADAPTATION.md": "Dioxus-specific adaptation",
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
    project_type: z.enum(["flutter", "tauri", "python", "rust", "dioxus", "generic"]).describe("Type of project to set up framework for")
  },
  async ({ project_type }) => {
    try {
      // Get main framework file
      const mainFiles = {
        "flutter": "FLUTTER_NEBULA_ADAPTATION.md",
        "tauri": "TAURI_NEBULA_ADAPTATION.md",
        "python": "PYTHON_NEBULA_ADAPTATION.md",
        "rust": "RUST_NEBULA_ADAPTATION.md",
        "dioxus": "DIOXUS_NEBULA_ADAPTATION.md",
        "generic": "Nebula_Protocol.md"
      };

      const mainFile = mainFiles[project_type];
      const howToPreferred = path.join(FRAMEWORK_PATH, "Nebula_readme.md");
      const howToFallback = path.join(FRAMEWORK_PATH, "README.md");
      const howToFilePath = fs.existsSync(howToPreferred) ? howToPreferred : howToFallback;

      const mainContent = fs.readFileSync(path.join(FRAMEWORK_PATH, mainFile), 'utf8');
      const howToContent = fs.readFileSync(howToFilePath, 'utf8');

      // Star Chart usage: ensure a setup node exists, link to the main doc, log success, and surface lessons for Phase 0
      const setupNodeId = starChart.upsertNode({
        type: "project_setup",
        title: `Setup ${project_type}`,
        slug: `setup-${toSlug(project_type)}`,
        phase: 0,
        constellation: project_type,
        x: 0, y: 0, z: 0
      });
      const mainDocNodeId = starChart.upsertNode({
        id: `doc:${mainFile}`,
        type: "doc",
        title: mainFile,
        slug: toSlug(mainFile),
        phase: null,
        constellation: "framework-docs",
        x: -1, y: 0, z: -1
      });
      starChart.linkNodes({ src: setupNodeId, dst: mainDocNodeId, type: "references" });
      starChart.logEvent({
        nodeId: setupNodeId,
        phase: 0,
        status: "success",
        summary: `Delivered setup for ${project_type}`,
        details: `Main file: ${mainFile}`,
        tags: [project_type, "setup"]
      });

      const lessons = starChart.getLessonsForPhase({ phase: 0, maxPhase: 0, tags: [project_type] });
      const lessonsText = lessons.length > 0
        ? `\n\n## Star Chart — Lessons for Phase 0\n${lessons.map(r => `- (sev:${r.severity}) ${r.recommendation} — from ${r.status}: ${r.summary}`).join('\n')}`
        : "";

      return {
        content: [{ 
          type: "text", 
          text: `# Complete Nebula Framework Setup for ${project_type.toUpperCase()}\n\n## How to Use Guide\n\n${howToContent}\n\n---\n\n## Framework Specification\n\n${mainContent}${lessonsText}` 
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

// -------------------- Star Chart (SQLite) Tools --------------------
const DATA_DIR = path.join(FRAMEWORK_PATH, ".data");
const DB_PATH = path.join(DATA_DIR, "nebula_kg.sqlite");
const starChart = new StarChartStore(DB_PATH);

function toSlug(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function bootstrapStarChart() {
  try {
    const rootId = starChart.upsertNode({
      id: "nebula_framework_root",
      type: "root",
      title: "Nebula Framework",
      slug: "nebula-framework",
      phase: null,
      constellation: "framework",
      x: 0, y: 0, z: -1
    });

    const baseFiles = fs.readdirSync(FRAMEWORK_PATH).filter(f => f.endsWith('.md'));
    const docsDir = path.join(FRAMEWORK_PATH, 'docs');
    const docsFiles = fs.existsSync(docsDir) && fs.statSync(docsDir).isDirectory()
      ? fs.readdirSync(docsDir).filter(f => f.endsWith('.md')).map(f => path.join('docs', f))
      : [];
    const all = [...baseFiles, ...docsFiles];

    for (const rel of all) {
      const title = path.basename(rel);
      const id = starChart.upsertNode({
        id: `doc:${rel}`,
        type: "doc",
        title,
        slug: toSlug(title),
        phase: null,
        constellation: "framework-docs",
        x: Math.random() * 10 - 5,
        y: Math.random() * 10 - 5,
        z: -1
      });
      starChart.linkNodes({ src: rootId, dst: id, type: "contains" });
    }
  } catch (_) {
    // Non-fatal
  }
}

bootstrapStarChart();

server.tool("kg_upsert_node",
  {
    id: z.string().optional(),
    type: z.string(),
    title: z.string(),
    slug: z.string().optional(),
    phase: z.number().int().optional(),
    constellation: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    z: z.number().optional()
  },
  async (args) => {
    const id = starChart.upsertNode(args);
    return { content: [{ type: "text", text: `Node upserted: ${id}` }] };
  }
);

server.tool("kg_link_nodes",
  {
    src: z.string(),
    dst: z.string(),
    type: z.string(),
    weight: z.number().optional()
  },
  async ({ src, dst, type, weight }) => {
    starChart.linkNodes({ src, dst, type, weight });
    return { content: [{ type: "text", text: `Linked ${src} -> ${dst} (${type})` }] };
  }
);

server.tool("kg_log_event",
  {
    nodeId: z.string(),
    phase: z.number().int().optional(),
    status: z.enum(["success", "failure"]),
    summary: z.string(),
    details: z.string().optional(),
    tags: z.array(z.string()).optional(),
    artifacts: z.array(z.object({ path: z.string().optional(), hash: z.string().optional() })).optional()
  },
  async ({ nodeId, phase, status, summary, details = "", tags = [], artifacts = [] }) => {
    const id = starChart.logEvent({ nodeId, phase: phase ?? null, status, summary, details, tags, artifacts });
    return { content: [{ type: "text", text: `Event logged: ${id}` }] };
  }
);

server.tool("kg_add_lesson",
  {
    eventId: z.string(),
    severity: z.number().int().min(1).max(5).optional(),
    recommendation: z.string()
  },
  async ({ eventId, severity = 3, recommendation }) => {
    const id = starChart.addLesson({ eventId, severity, recommendation });
    return { content: [{ type: "text", text: `Lesson added: ${id}` }] };
  }
);

server.tool("kg_get_lessons_for_phase",
  {
    phase: z.number().int(),
    maxPhase: z.number().int().optional(),
    tags: z.array(z.string()).optional()
  },
  async ({ phase, maxPhase, tags = [] }) => {
    const rows = starChart.getLessonsForPhase({ phase, maxPhase: maxPhase ?? phase, tags });
    const text = rows.map(r => `[#${r.lesson_id}] (sev:${r.severity}) ${r.recommendation} — from ${r.status}: ${r.summary}`).join("\n");
    return { content: [{ type: "text", text: text || "No lessons found." }] };
  }
);

server.tool("kg_similar_failures",
  {
    text: z.string(),
    tags: z.array(z.string()).optional(),
    limit: z.number().int().optional()
  },
  async ({ text, tags = [], limit = 10 }) => {
    const rows = starChart.similarFailures({ text, tags, limit });
    const out = rows.map(r => `(${r.phase ?? "-"}) ${r.summary}`).join("\n");
    return { content: [{ type: "text", text: out || "No similar failures found." }] };
  }
);

server.tool("kg_neighbors",
  {
    nodeId: z.string(),
    phaseRadius: z.number().int().optional()
  },
  async ({ nodeId, phaseRadius = null }) => {
    const rows = starChart.neighbors({ nodeId, phaseRadius });
    const out = rows.map(r => `${r.id} [${r.type}] @ (${r.x ?? "-"},${r.y ?? "-"},${r.z ?? "-"})`).join("\n");
    return { content: [{ type: "text", text: out || "No neighbors found." }] };
  }
);

// -------------------- Project Memory Tools --------------------
// Stores project-specific knowledge, errors, and context

server.tool("project_memory_init",
  {
    project_path: z.string(),
    project_name: z.string(),
    framework: z.string()
  },
  async ({ project_path, project_name, framework }) => {
    try {
      const memory = new ProjectMemory(project_path, project_name, framework);
      const info = memory.getProjectInfo();
      memory.close();
      return {
        content: [{
          type: "text",
          text: `Project memory initialized:\nName: ${info.name}\nFramework: ${info.framework}\nVersion: ${info.current_version}\nDatabase: ${project_path}/.nebula/project_memory.sqlite`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error initializing project memory: ${error.message}`
        }]
      };
    }
  }
);

server.tool("project_memory_log_error",
  {
    project_path: z.string(),
    level: z.enum(["ERROR", "CRITICAL"]),
    phase: z.string(),
    constellation: z.string(),
    file_path: z.string().optional(),
    line_number: z.number().int().optional(),
    error_code: z.string().optional(),
    message: z.string(),
    stack_trace: z.string().optional(),
    context: z.record(z.any()).optional()
  },
  async ({ project_path, level, phase, constellation, file_path, line_number, error_code, message, stack_trace, context }) => {
    try {
      const memory = new ProjectMemory(project_path);
      const result = memory.logError({
        level,
        phase,
        constellation,
        filePath: file_path,
        lineNumber: line_number,
        errorCode: error_code,
        message,
        stackTrace: stack_trace,
        context
      });
      memory.close();
      
      let response = `Error logged: ${result.errorId}\n`;
      if (result.patternFound) {
        response += `Pattern detected! This error has occurred ${result.occurrences} times before.\n`;
        if (result.recommendedSolution) {
          response += `Recommended solution: ${result.recommendedSolution}`;
        }
      }
      
      return { content: [{ type: "text", text: response }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error logging to project memory: ${error.message}` }]
      };
    }
  }
);

server.tool("project_memory_record_solution",
  {
    project_path: z.string(),
    error_id: z.string(),
    solution: z.string(),
    code_changes: z.string().optional(),
    applied_by: z.enum(["ai", "human"]),
    effectiveness: z.number().int().min(1).max(5).optional(),
    notes: z.string().optional()
  },
  async ({ project_path, error_id, solution, code_changes, applied_by, effectiveness, notes }) => {
    try {
      const memory = new ProjectMemory(project_path);
      const solutionId = memory.recordSolution({
        errorId: error_id,
        solution,
        codeChanges: code_changes,
        appliedBy: applied_by,
        effectiveness,
        notes
      });
      memory.close();
      
      return {
        content: [{
          type: "text",
          text: `Solution recorded: ${solutionId}\nError marked as resolved.`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error recording solution: ${error.message}` }]
      };
    }
  }
);

server.tool("project_memory_find_similar_errors",
  {
    project_path: z.string(),
    error_message: z.string(),
    phase: z.string().optional(),
    limit: z.number().int().optional()
  },
  async ({ project_path, error_message, phase, limit = 10 }) => {
    try {
      const memory = new ProjectMemory(project_path);
      const errors = memory.findSimilarErrors({
        text: error_message,
        phase,
        limit
      });
      memory.close();
      
      if (errors.length === 0) {
        return { content: [{ type: "text", text: "No similar errors found." }] };
      }
      
      const output = errors.map(e => {
        let line = `[${e.phase}] ${e.message}`;
        if (e.resolved && e.solution_description) {
          line += `\n  ✅ Solution (${e.effectiveness}/5): ${e.solution_description}`;
        } else {
          line += `\n  ❌ Unresolved`;
        }
        return line;
      }).join("\n\n");
      
      return { content: [{ type: "text", text: output }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error finding similar errors: ${error.message}` }]
      };
    }
  }
);

server.tool("project_memory_get_patterns",
  {
    project_path: z.string(),
    error_type: z.string().optional(),
    min_occurrences: z.number().int().optional()
  },
  async ({ project_path, error_type, min_occurrences = 2 }) => {
    try {
      const memory = new ProjectMemory(project_path);
      const patterns = memory.getErrorPatterns({
        errorType: error_type,
        minOccurrences: min_occurrences
      });
      memory.close();
      
      if (patterns.length === 0) {
        return { content: [{ type: "text", text: "No error patterns found." }] };
      }
      
      const output = patterns.map(p => 
        `${p.error_type} (${p.occurrences}x, success rate: ${(p.success_rate * 100).toFixed(0)}%)\n` +
        `  Cause: ${p.common_cause}\n` +
        `  Solution: ${p.recommended_solution || 'No solution yet'}`
      ).join("\n\n");
      
      return { content: [{ type: "text", text: output }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error getting patterns: ${error.message}` }]
      };
    }
  }
);

server.tool("project_memory_record_decision",
  {
    project_path: z.string(),
    phase: z.string(),
    constellation: z.string(),
    decision_type: z.string(),
    question: z.string(),
    chosen_option: z.string(),
    alternatives: z.array(z.string()),
    rationale: z.string(),
    made_by: z.enum(["ai", "human"])
  },
  async ({ project_path, phase, constellation, decision_type, question, chosen_option, alternatives, rationale, made_by }) => {
    try {
      const memory = new ProjectMemory(project_path);
      const decisionId = memory.recordDecision({
        phase,
        constellation,
        decisionType: decision_type,
        question,
        chosenOption: chosen_option,
        alternatives,
        rationale,
        madeBy: made_by
      });
      memory.close();
      
      return {
        content: [{
          type: "text",
          text: `Decision recorded: ${decisionId}\nType: ${decision_type}\nChosen: ${chosen_option}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error recording decision: ${error.message}` }]
      };
    }
  }
);

server.tool("project_memory_quality_gate",
  {
    project_path: z.string(),
    constellation: z.string(),
    passed: z.boolean(),
    issues_found: z.number().int(),
    notes: z.string(),
    sub_phase_created: z.string().optional(),
    reviewer: z.string().optional()
  },
  async ({ project_path, constellation, passed, issues_found, notes, sub_phase_created, reviewer }) => {
    try {
      const memory = new ProjectMemory(project_path);
      const gateId = memory.recordQualityGate({
        constellation,
        passed,
        issuesFound: issues_found,
        subPhaseCreated: sub_phase_created,
        notes,
        reviewer
      });
      memory.close();
      
      const status = passed ? "PASSED ✅" : "FAILED ❌";
      let response = `Quality Gate: ${status}\nConstellation: ${constellation}\nIssues: ${issues_found}`;
      if (sub_phase_created) {
        response += `\nSub-phase created: ${sub_phase_created}`;
      }
      
      return { content: [{ type: "text", text: response }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error recording quality gate: ${error.message}` }]
      };
    }
  }
);

server.tool("project_memory_get_context",
  {
    project_path: z.string(),
    phase: z.string().optional()
  },
  async ({ project_path, phase }) => {
    try {
      const memory = new ProjectMemory(project_path);
      const snapshot = memory.getLatestContextSnapshot({ phase });
      memory.close();
      
      if (!snapshot) {
        return { content: [{ type: "text", text: "No context snapshot found." }] };
      }
      
      const output = `# Context Snapshot (${snapshot.timestamp})\n\n` +
        `**Phase:** ${snapshot.phase}\n` +
        `**Constellation:** ${snapshot.constellation}\n\n` +
        `**Active Files:**\n${snapshot.active_files.map(f => `- ${f}`).join('\n')}\n\n` +
        `**Key Decisions:**\n${snapshot.key_decisions.map(d => `- ${d}`).join('\n')}\n\n` +
        `**Open Issues:**\n${snapshot.open_issues.map(i => `- ${i}`).join('\n')}\n\n` +
        `**Next Steps:**\n${snapshot.next_steps}`;
      
      return { content: [{ type: "text", text: output }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error getting context: ${error.message}` }]
      };
    }
  }
);

server.tool("project_memory_save_context",
  {
    project_path: z.string(),
    phase: z.string(),
    constellation: z.string(),
    active_files: z.array(z.string()),
    key_decisions: z.array(z.string()),
    open_issues: z.array(z.string()),
    next_steps: z.string(),
    session_duration: z.number().int().optional()
  },
  async ({ project_path, phase, constellation, active_files, key_decisions, open_issues, next_steps, session_duration }) => {
    try {
      const memory = new ProjectMemory(project_path);
      const snapshotId = memory.saveContextSnapshot({
        phase,
        constellation,
        activeFiles: active_files,
        keyDecisions: key_decisions,
        openIssues: open_issues,
        nextSteps: next_steps,
        sessionDuration: session_duration
      });
      memory.close();
      
      return {
        content: [{
          type: "text",
          text: `Context snapshot saved: ${snapshotId}\nUse project_memory_get_context to restore later.`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error saving context: ${error.message}` }]
      };
    }
  }
);

server.tool("project_memory_version_bump",
  {
    project_path: z.string(),
    version: z.string(),
    phase: z.string(),
    constellation: z.string(),
    changelog: z.string().optional(),
    git_tag: z.string().optional()
  },
  async ({ project_path, version, phase, constellation, changelog, git_tag }) => {
    try {
      const memory = new ProjectMemory(project_path);
      const versionId = memory.recordVersionBump({
        version,
        phase,
        constellation,
        changelog,
        gitTag: git_tag
      });
      memory.close();
      
      return {
        content: [{
          type: "text",
          text: `Version bumped to ${version}\nPhase: ${phase}\nConstellation: ${constellation}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error recording version bump: ${error.message}` }]
      };
    }
  }
);

server.tool("project_memory_get_stats",
  {
    project_path: z.string()
  },
  async ({ project_path }) => {
    try {
      const memory = new ProjectMemory(project_path);
      const stats = memory.getStatistics();
      memory.close();
      
      const output = `# Project Memory Statistics\n\n` +
        `**Current Version:** ${stats.currentVersion}\n` +
        `**Current Phase:** ${stats.currentPhase || 'Not set'}\n\n` +
        `**Errors:**\n` +
        `- Total: ${stats.totalErrors}\n` +
        `- Unresolved: ${stats.unresolvedErrors}\n` +
        `- Patterns: ${stats.errorPatterns}\n\n` +
        `**Quality Gates:**\n` +
        `- Total: ${stats.qualityGates}\n` +
        `- Passed: ${stats.passedQualityGates}\n\n` +
        `**Decisions Recorded:** ${stats.decisions}`;
      
      return { content: [{ type: "text", text: output }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error getting statistics: ${error.message}` }]
      };
    }
  }
);