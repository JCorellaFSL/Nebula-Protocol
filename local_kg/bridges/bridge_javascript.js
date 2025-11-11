/**
 * JavaScript/Node.js Bridge for Nebula Local KG
 * 
 * Provides a simple interface for Node.js projects to interact with
 * the Python-based Local Knowledge Graph via subprocess.
 * 
 * Usage:
 *   import { LocalKGBridge } from './local_kg/bridges/bridge_javascript.js';
 *   const kg = new LocalKGBridge();
 *   await kg.captureError({ signature: 'Error message', ... });
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

export class LocalKGBridge {
  constructor(dbPath = null) {
    this.config = this.loadConfig();
    this.dbPath = dbPath || this.config.local_kg_db || 'local_kg/nebula_protocol_local.db';
    this.pythonCmd = this.config.python_command || 'python';
  }

  /**
   * Load configuration from .nebula/config.json or environment variables
   */
  loadConfig() {
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
      language: 'javascript',
      local_kg_db: 'local_kg/nebula_protocol_local.db',
      python_command: 'python'
    };
  }

  /**
   * Capture an error pattern to the local KG
   * 
   * @param {Object} error - Error details
   * @param {string} error.signature - Error message/signature
   * @param {string} error.category - Error category (e.g., 'TypeError')
   * @param {string} error.language - Language where error occurred
   * @param {string} error.severity - 'low', 'medium', 'high', 'critical'
   * @param {string} error.description - Optional detailed description
   * @param {Array<string>} error.technologies - Optional technology tags
   * @returns {Promise<string>} Pattern ID (UUID)
   */
  async captureError(error) {
    const {
      signature,
      category = 'Error',
      language = 'javascript',
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
   * 
   * @param {string} query - Search query (error signature or description)
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of matching patterns
   */
  async searchPatterns(query, limit = 5) {
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
   * 
   * @param {string} patternId - Pattern UUID
   * @param {string} solutionText - Solution description/code
   * @param {string} effectiveness - 'worked', 'partial', 'failed'
   * @returns {Promise<string>} Solution ID (UUID)
   */
  async addSolution(patternId, solutionText, effectiveness = 'worked') {
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
   * 
   * @returns {Promise<Object>} Statistics about patterns and solutions
   */
  async getSummary() {
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
   * 
   * Useful for capturing errors without waiting for Python to finish.
   * Errors in capture are logged but don't throw.
   * 
   * @param {Object} error - Same as captureError
   */
  captureErrorAsync(error) {
    this.captureError(error).catch(err => {
      console.warn('[LocalKG] Failed to capture error:', err.message);
    });
  }

  /**
   * Escape string for Python code
   * @private
   */
  escapePython(str) {
    if (str === null || str === undefined) {
      return 'None';
    }
    // Escape single quotes and backslashes
    const escaped = String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
    return `'${escaped}'`;
  }

  /**
   * Run Python code and return stdout
   * @private
   */
  runPython(code) {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.pythonCmd, ['-c', code], {
        cwd: process.cwd(),
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', data => {
        stdout += data.toString();
      });

      proc.stderr.on('data', data => {
        stderr += data.toString();
      });

      proc.on('error', err => {
        reject(new Error(`Failed to spawn Python: ${err.message}`));
      });

      proc.on('close', code => {
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
let globalInstance = null;

export function getLocalKG(dbPath = null) {
  if (!globalInstance || dbPath) {
    globalInstance = new LocalKGBridge(dbPath);
  }
  return globalInstance;
}

