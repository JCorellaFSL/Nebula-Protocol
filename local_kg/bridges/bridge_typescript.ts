/**
 * TypeScript Bridge for Nebula Local KG
 * 
 * Type-safe interface for TypeScript projects to interact with
 * the Python-based Local Knowledge Graph.
 * 
 * Usage:
 *   import { LocalKGBridge, ErrorCapture } from './local_kg/bridges/bridge_typescript';
 *   const kg = new LocalKGBridge();
 *   await kg.captureError({ signature: 'TS2304: Cannot find name', ... });
 */

import { spawn, ChildProcess } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

export interface NebulaConfig {
  language?: string;
  framework?: string;
  local_kg_db?: string;
  central_kg_url?: string;
  python_command?: string;
  auto_sync?: boolean;
}

export interface ErrorCapture {
  signature: string;
  category?: string;
  language?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  technologies?: string[];
}

export interface ErrorPattern {
  id: string;
  error_signature: string;
  error_category: string;
  language: string;
  severity: string;
  description: string | null;
  occurrence_count: number;
  first_seen: string;
  last_seen: string;
  solution_count: number;
}

export interface PatternSummary {
  total_patterns: number;
  total_solutions: number;
  languages: Record<string, number>;
  top_errors: Array<{ signature: string; count: number }>;
}

export class LocalKGBridge {
  private config: NebulaConfig;
  private dbPath: string;
  private pythonCmd: string;

  constructor(dbPath?: string) {
    this.config = this.loadConfig();
    this.dbPath = dbPath || this.config.local_kg_db || 'local_kg/nebula_protocol_local.db';
    this.pythonCmd = this.config.python_command || 'python';
  }

  /**
   * Load configuration from .nebula/config.json or environment variables
   */
  private loadConfig(): NebulaConfig {
    // Priority 1: .nebula/config.json
    const configPath = path.join(process.cwd(), '.nebula', 'config.json');
    if (existsSync(configPath)) {
      return JSON.parse(readFileSync(configPath, 'utf8'));
    }

    // Priority 2: Environment variables
    if (process.env.NEBULA_LANGUAGE) {
      return {
        language: process.env.NEBULA_LANGUAGE,
        local_kg_db: process.env.NEBULA_LOCAL_KG_DB || 'local_kg/project_local.db',
        python_command: process.env.PYTHON_CMD || 'python'
      };
    }

    // Priority 3: Defaults
    return {
      language: 'typescript',
      local_kg_db: 'local_kg/nebula_protocol_local.db',
      python_command: 'python'
    };
  }

  /**
   * Capture an error pattern to the local KG
   */
  async captureError(error: ErrorCapture): Promise<string> {
    const {
      signature,
      category = 'Error',
      language = 'typescript',
      severity = 'medium',
      description = null,
      technologies = []
    } = error;

    const pythonCode = `
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('${this.dbPath}')
pattern_id = kg.capture_error(
    error_signature=${this.escapePython(signature)},
    error_category=${this.escapePython(category)},
    language=${this.escapePython(language)},
    description=${description ? this.escapePython(description) : 'None'},
    severity=${this.escapePython(severity)}
)
print(pattern_id)
`.trim();

    return this.runPython(pythonCode);
  }

  /**
   * Search for similar error patterns
   */
  async searchPatterns(query: string, limit: number = 5): Promise<ErrorPattern[]> {
    const pythonCode = `
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('${this.dbPath}')
patterns = kg.search_patterns(${this.escapePython(query)}, ${limit})
print(json.dumps(patterns, default=str))
`.trim();

    const result = await this.runPython(pythonCode);
    return JSON.parse(result);
  }

  /**
   * Add a solution to an existing pattern
   */
  async addSolution(
    patternId: string,
    solutionText: string,
    effectiveness: 'worked' | 'partial' | 'failed' = 'worked'
  ): Promise<string> {
    const pythonCode = `
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('${this.dbPath}')
solution_id = kg.add_solution(
    pattern_id=${this.escapePython(patternId)},
    solution_text=${this.escapePython(solutionText)},
    effectiveness=${this.escapePython(effectiveness)}
)
print(solution_id)
`.trim();

    return this.runPython(pythonCode);
  }

  /**
   * Get summary statistics
   */
  async getSummary(): Promise<PatternSummary> {
    const pythonCode = `
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('${this.dbPath}')
summary = kg.get_pattern_summary()
print(json.dumps(summary, default=str))
`.trim();

    const result = await this.runPython(pythonCode);
    return JSON.parse(result);
  }

  /**
   * Fire-and-forget error capture (non-blocking)
   */
  captureErrorAsync(error: ErrorCapture): void {
    this.captureError(error).catch(err => {
      console.warn('[LocalKG] Failed to capture error:', err.message);
    });
  }

  /**
   * Escape string for Python code
   */
  private escapePython(str: string | null | undefined): string {
    if (str === null || str === undefined) {
      return 'None';
    }
    const escaped = String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
    return `'${escaped}'`;
  }

  /**
   * Run Python code and return stdout
   */
  private runPython(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.pythonCmd, ['-c', code], {
        cwd: process.cwd(),
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on('error', (err: Error) => {
        reject(new Error(`Failed to spawn Python: ${err.message}`));
      });

      proc.on('close', (code: number | null) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Python process failed (exit ${code}): ${stderr}`));
        }
      });
    });
  }
}

/**
 * Singleton instance for convenience
 */
let globalInstance: LocalKGBridge | null = null;

export function getLocalKG(dbPath?: string): LocalKGBridge {
  if (!globalInstance || dbPath) {
    globalInstance = new LocalKGBridge(dbPath);
  }
  return globalInstance;
}

