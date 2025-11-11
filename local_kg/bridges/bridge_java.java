/**
 * Java Bridge for Nebula Local KG
 * 
 * Provides a Java interface to interact with the Python-based Local Knowledge Graph.
 * 
 * Usage:
 *   import com.nebula.kg.LocalKGBridge;
 *   
 *   LocalKGBridge kg = new LocalKGBridge();
 *   kg.captureError("NullPointerException", "NullPointerException", "java", "high");
 */

package com.nebula.kg;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import com.google.gson.*;

public class LocalKGBridge {
    private final String dbPath;
    private final String pythonCommand;
    private final ExecutorService executor;
    private static LocalKGBridge instance;

    /**
     * Create a new bridge instance
     */
    public LocalKGBridge() {
        this(null);
    }

    /**
     * Create a new bridge instance with custom DB path
     */
    public LocalKGBridge(String dbPath) {
        Map<String, Object> config = loadConfig();
        this.dbPath = dbPath != null ? dbPath : 
                      (String) config.getOrDefault("local_kg_db", "local_kg/nebula_protocol_local.db");
        this.pythonCommand = (String) config.getOrDefault("python_command", "python");
        this.executor = Executors.newCachedThreadPool();
    }

    /**
     * Load configuration from .nebula/config.json or environment variables
     */
    private Map<String, Object> loadConfig() {
        // Priority 1: .nebula/config.json
        Path configPath = Paths.get(".nebula", "config.json");
        if (Files.exists(configPath)) {
            try {
                String content = Files.readString(configPath);
                return new Gson().fromJson(content, Map.class);
            } catch (IOException e) {
                // Fall through to environment variables
            }
        }

        // Priority 2: Environment variables
        Map<String, Object> config = new HashMap<>();
        String language = System.getenv("NEBULA_LANGUAGE");
        if (language != null) {
            config.put("language", language);
            config.put("local_kg_db", 
                      System.getenv().getOrDefault("NEBULA_LOCAL_KG_DB", "local_kg/project_local.db"));
            config.put("python_command", 
                      System.getenv().getOrDefault("PYTHON_CMD", "python"));
            return config;
        }

        // Priority 3: Defaults
        config.put("language", "java");
        config.put("local_kg_db", "local_kg/nebula_protocol_local.db");
        config.put("python_command", "python");
        return config;
    }

    /**
     * Capture an error pattern to the local KG (blocking)
     */
    public String captureError(
        String signature,
        String category,
        String language,
        String severity
    ) throws IOException, InterruptedException {
        return captureError(signature, category, language, severity, null);
    }

    /**
     * Capture an error pattern to the local KG with description
     */
    public String captureError(
        String signature,
        String category,
        String language,
        String severity,
        String description
    ) throws IOException, InterruptedException {
        String pythonCode = String.format(
            "import sys\n" +
            "sys.path.insert(0, '.')\n" +
            "from local_kg.local_kg import get_local_kg\n" +
            "\n" +
            "kg = get_local_kg('%s')\n" +
            "pattern_id = kg.capture_error(\n" +
            "    error_signature='%s',\n" +
            "    error_category='%s',\n" +
            "    language='%s',\n" +
            "    description=%s,\n" +
            "    severity='%s'\n" +
            ")\n" +
            "print(pattern_id)\n",
            dbPath,
            escapePython(signature),
            escapePython(category),
            escapePython(language),
            description != null ? "'" + escapePython(description) + "'" : "None",
            escapePython(severity)
        );

        return runPython(pythonCode);
    }

    /**
     * Capture an error from a Java Exception
     */
    public String captureErrorFromException(
        Exception exception,
        String language,
        String severity
    ) throws IOException, InterruptedException {
        StringWriter sw = new StringWriter();
        exception.printStackTrace(new PrintWriter(sw));
        String stackTrace = sw.toString();
        
        return captureError(
            exception.getMessage() != null ? exception.getMessage() : exception.toString(),
            exception.getClass().getSimpleName(),
            language,
            severity,
            stackTrace.substring(0, Math.min(500, stackTrace.length()))  // First 500 chars
        );
    }

    /**
     * Search for similar error patterns
     */
    public List<Map<String, Object>> searchPatterns(String query, int limit) 
        throws IOException, InterruptedException {
        String pythonCode = String.format(
            "import sys\n" +
            "import json\n" +
            "sys.path.insert(0, '.')\n" +
            "from local_kg.local_kg import get_local_kg\n" +
            "\n" +
            "kg = get_local_kg('%s')\n" +
            "patterns = kg.search_patterns('%s', %d)\n" +
            "print(json.dumps(patterns, default=str))\n",
            dbPath,
            escapePython(query),
            limit
        );

        String result = runPython(pythonCode);
        return new Gson().fromJson(result, List.class);
    }

    /**
     * Add a solution to an existing pattern
     */
    public String addSolution(
        String patternId,
        String solutionText,
        String effectiveness
    ) throws IOException, InterruptedException {
        String pythonCode = String.format(
            "import sys\n" +
            "sys.path.insert(0, '.')\n" +
            "from local_kg.local_kg import get_local_kg\n" +
            "\n" +
            "kg = get_local_kg('%s')\n" +
            "solution_id = kg.add_solution(\n" +
            "    pattern_id='%s',\n" +
            "    solution_text='%s',\n" +
            "    effectiveness='%s'\n" +
            ")\n" +
            "print(solution_id)\n",
            dbPath,
            escapePython(patternId),
            escapePython(solutionText),
            escapePython(effectiveness)
        );

        return runPython(pythonCode);
    }

    /**
     * Get summary statistics
     */
    public Map<String, Object> getSummary() throws IOException, InterruptedException {
        String pythonCode = String.format(
            "import sys\n" +
            "import json\n" +
            "sys.path.insert(0, '.')\n" +
            "from local_kg.local_kg import get_local_kg\n" +
            "\n" +
            "kg = get_local_kg('%s')\n" +
            "summary = kg.get_pattern_summary()\n" +
            "print(json.dumps(summary, default=str))\n",
            dbPath
        );

        String result = runPython(pythonCode);
        return new Gson().fromJson(result, Map.class);
    }

    /**
     * Fire-and-forget error capture (non-blocking)
     */
    public void captureErrorAsync(
        String signature,
        String category,
        String language,
        String severity
    ) {
        executor.submit(() -> {
            try {
                captureError(signature, category, language, severity);
            } catch (Exception e) {
                System.err.println("[LocalKG] Failed to capture error: " + e.getMessage());
            }
        });
    }

    /**
     * Escape string for Python code
     */
    private String escapePython(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("'", "\\'")
                  .replace("\n", "\\n");
    }

    /**
     * Run Python code and return stdout
     */
    private String runPython(String code) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(pythonCommand, "-c", code);
        pb.directory(new File("."));
        pb.redirectErrorStream(false);
        
        Process process = pb.start();
        
        BufferedReader stdout = new BufferedReader(new InputStreamReader(process.getInputStream()));
        BufferedReader stderr = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        
        StringBuilder output = new StringBuilder();
        StringBuilder error = new StringBuilder();
        
        String line;
        while ((line = stdout.readLine()) != null) {
            output.append(line).append("\n");
        }
        while ((line = stderr.readLine()) != null) {
            error.append(line).append("\n");
        }
        
        int exitCode = process.waitFor();
        
        if (exitCode != 0) {
            throw new IOException("Python process failed (exit " + exitCode + "): " + error.toString());
        }
        
        return output.toString().trim();
    }

    /**
     * Get global singleton instance
     */
    public static synchronized LocalKGBridge getInstance() {
        if (instance == null) {
            instance = new LocalKGBridge();
        }
        return instance;
    }

    /**
     * Shutdown executor (call on application exit)
     */
    public void shutdown() {
        executor.shutdown();
    }
}

