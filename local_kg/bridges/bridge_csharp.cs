/**
 * C#/.NET Bridge for Nebula Local KG
 * 
 * Provides a C# interface to interact with the Python-based Local Knowledge Graph.
 * 
 * Usage:
 *   using Nebula.KG;
 *   
 *   var kg = new LocalKGBridge();
 *   await kg.CaptureErrorAsync("NullReferenceException", "NullReferenceException", "csharp", "high");
 */

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Nebula.KG
{
    public class NebulaConfig
    {
        public string? Language { get; set; }
        public string? Framework { get; set; }
        public string? LocalKgDb { get; set; }
        public string? CentralKgUrl { get; set; }
        public string? PythonCommand { get; set; }
        public bool? AutoSync { get; set; }
    }

    public class ErrorCapture
    {
        public string Signature { get; set; } = "";
        public string Category { get; set; } = "Error";
        public string Language { get; set; } = "csharp";
        public string Severity { get; set; } = "medium";
        public string? Description { get; set; }
    }

    public class ErrorPattern
    {
        public string Id { get; set; } = "";
        public string ErrorSignature { get; set; } = "";
        public string ErrorCategory { get; set; } = "";
        public string Language { get; set; } = "";
        public string Severity { get; set; } = "";
        public string? Description { get; set; }
        public int OccurrenceCount { get; set; }
        public string FirstSeen { get; set; } = "";
        public string LastSeen { get; set; } = "";
        public int SolutionCount { get; set; }
    }

    public class LocalKGBridge
    {
        private readonly string _dbPath;
        private readonly string _pythonCommand;
        private static LocalKGBridge? _instance;
        private static readonly object _lock = new object();

        /// <summary>
        /// Create a new bridge instance
        /// </summary>
        public LocalKGBridge(string? dbPath = null)
        {
            var config = LoadConfig();
            _dbPath = dbPath ?? config.LocalKgDb ?? "local_kg/nebula_protocol_local.db";
            _pythonCommand = config.PythonCommand ?? "python";
        }

        /// <summary>
        /// Load configuration from .nebula/config.json or environment variables
        /// </summary>
        private NebulaConfig LoadConfig()
        {
            // Priority 1: .nebula/config.json
            var configPath = Path.Combine(".nebula", "config.json");
            if (File.Exists(configPath))
            {
                var json = File.ReadAllText(configPath);
                var config = JsonSerializer.Deserialize<NebulaConfig>(json);
                if (config != null) return config;
            }

            // Priority 2: Environment variables
            var language = Environment.GetEnvironmentVariable("NEBULA_LANGUAGE");
            if (!string.IsNullOrEmpty(language))
            {
                return new NebulaConfig
                {
                    Language = language,
                    LocalKgDb = Environment.GetEnvironmentVariable("NEBULA_LOCAL_KG_DB") ?? "local_kg/project_local.db",
                    PythonCommand = Environment.GetEnvironmentVariable("PYTHON_CMD") ?? "python"
                };
            }

            // Priority 3: Defaults
            return new NebulaConfig
            {
                Language = "csharp",
                LocalKgDb = "local_kg/nebula_protocol_local.db",
                PythonCommand = "python"
            };
        }

        /// <summary>
        /// Capture an error pattern to the local KG
        /// </summary>
        public async Task<string> CaptureErrorAsync(
            string signature,
            string category = "Error",
            string language = "csharp",
            string severity = "medium",
            string? description = null)
        {
            var descValue = description != null ? $"'{EscapePython(description)}'" : "None";
            var pythonCode = $@"
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('{_dbPath}')
pattern_id = kg.capture_error(
    error_signature='{EscapePython(signature)}',
    error_category='{EscapePython(category)}',
    language='{EscapePython(language)}',
    description={descValue},
    severity='{EscapePython(severity)}'
)
print(pattern_id)
";

            return await RunPythonAsync(pythonCode);
        }

        /// <summary>
        /// Capture an error from a .NET Exception
        /// </summary>
        public async Task<string> CaptureErrorFromExceptionAsync(
            Exception exception,
            string language = "csharp",
            string severity = "medium")
        {
            var stackTrace = exception.StackTrace?.Substring(0, Math.Min(500, exception.StackTrace.Length ?? 0));
            return await CaptureErrorAsync(
                exception.Message,
                exception.GetType().Name,
                language,
                severity,
                stackTrace
            );
        }

        /// <summary>
        /// Search for similar error patterns
        /// </summary>
        public async Task<List<ErrorPattern>> SearchPatternsAsync(string query, int limit = 5)
        {
            var pythonCode = $@"
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('{_dbPath}')
patterns = kg.search_patterns('{EscapePython(query)}', {limit})
print(json.dumps(patterns, default=str))
";

            var result = await RunPythonAsync(pythonCode);
            var patterns = JsonSerializer.Deserialize<List<ErrorPattern>>(result);
            return patterns ?? new List<ErrorPattern>();
        }

        /// <summary>
        /// Add a solution to an existing pattern
        /// </summary>
        public async Task<string> AddSolutionAsync(
            string patternId,
            string solutionText,
            string effectiveness = "worked")
        {
            var pythonCode = $@"
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('{_dbPath}')
solution_id = kg.add_solution(
    pattern_id='{EscapePython(patternId)}',
    solution_text='{EscapePython(solutionText)}',
    effectiveness='{EscapePython(effectiveness)}'
)
print(solution_id)
";

            return await RunPythonAsync(pythonCode);
        }

        /// <summary>
        /// Get summary statistics
        /// </summary>
        public async Task<Dictionary<string, object>> GetSummaryAsync()
        {
            var pythonCode = $@"
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('{_dbPath}')
summary = kg.get_pattern_summary()
print(json.dumps(summary, default=str))
";

            var result = await RunPythonAsync(pythonCode);
            var summary = JsonSerializer.Deserialize<Dictionary<string, object>>(result);
            return summary ?? new Dictionary<string, object>();
        }

        /// <summary>
        /// Fire-and-forget error capture (non-blocking)
        /// </summary>
        public void CaptureErrorFireAndForget(
            string signature,
            string category = "Error",
            string language = "csharp",
            string severity = "medium")
        {
            Task.Run(async () =>
            {
                try
                {
                    await CaptureErrorAsync(signature, category, language, severity);
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"[LocalKG] Failed to capture error: {ex.Message}");
                }
            });
        }

        /// <summary>
        /// Escape string for Python code
        /// </summary>
        private static string EscapePython(string str)
        {
            return str.Replace("\\", "\\\\")
                      .Replace("'", "\\'")
                      .Replace("\n", "\\n");
        }

        /// <summary>
        /// Run Python code and return stdout
        /// </summary>
        private async Task<string> RunPythonAsync(string code)
        {
            var psi = new ProcessStartInfo
            {
                FileName = _pythonCommand,
                Arguments = $"-c \"{code.Replace("\"", "\\\"")}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = psi };
            process.Start();

            var stdout = await process.StandardOutput.ReadToEndAsync();
            var stderr = await process.StandardError.ReadToEndAsync();

            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                throw new Exception($"Python process failed (exit {process.ExitCode}): {stderr}");
            }

            return stdout.Trim();
        }

        /// <summary>
        /// Get global singleton instance
        /// </summary>
        public static LocalKGBridge GetInstance(string? dbPath = null)
        {
            if (_instance == null || dbPath != null)
            {
                lock (_lock)
                {
                    if (_instance == null || dbPath != null)
                    {
                        _instance = new LocalKGBridge(dbPath);
                    }
                }
            }
            return _instance;
        }
    }
}

