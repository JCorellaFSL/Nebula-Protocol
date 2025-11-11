<?php
/**
 * PHP Bridge for Nebula Local KG
 *
 * Provides a PHP interface to interact with the Python-based Local Knowledge Graph.
 *
 * Usage:
 *   require_once 'local_kg/bridges/bridge_php.php';
 *   
 *   $kg = new LocalKGBridge();
 *   $patternId = $kg->captureError('Undefined variable', 'Notice', 'php', 'medium');
 */

class NebulaConfig {
    public $language;
    public $framework;
    public $local_kg_db;
    public $central_kg_url;
    public $python_command;
    public $auto_sync;

    public static function loadConfig() {
        // Priority 1: .nebula/config.json
        $configPath = '.nebula/config.json';
        if (file_exists($configPath)) {
            $json = file_get_contents($configPath);
            $data = json_decode($json, true);
            if ($data) {
                $config = new self();
                $config->language = $data['language'] ?? null;
                $config->framework = $data['framework'] ?? null;
                $config->local_kg_db = $data['local_kg_db'] ?? null;
                $config->central_kg_url = $data['central_kg_url'] ?? null;
                $config->python_command = $data['python_command'] ?? null;
                $config->auto_sync = $data['auto_sync'] ?? null;
                return $config;
            }
        }

        // Priority 2: Environment variables
        $language = getenv('NEBULA_LANGUAGE');
        if ($language !== false) {
            $config = new self();
            $config->language = $language;
            $config->local_kg_db = getenv('NEBULA_LOCAL_KG_DB') ?: 'local_kg/project_local.db';
            $config->python_command = getenv('PYTHON_CMD') ?: 'python';
            return $config;
        }

        // Priority 3: Defaults
        $config = new self();
        $config->language = 'php';
        $config->local_kg_db = 'local_kg/nebula_protocol_local.db';
        $config->python_command = 'python';
        return $config;
    }
}

class ErrorPattern {
    public $id;
    public $error_signature;
    public $error_category;
    public $language;
    public $severity;
    public $description;
    public $occurrence_count;
    public $first_seen;
    public $last_seen;
    public $solution_count;
}

class LocalKGBridge {
    private $config;
    private $dbPath;
    private $pythonCommand;
    private static $instance = null;

    /**
     * Create a new bridge instance
     */
    public function __construct($dbPath = null) {
        $this->config = NebulaConfig::loadConfig();
        $this->dbPath = $dbPath ?? $this->config->local_kg_db ?? 'local_kg/nebula_protocol_local.db';
        $this->pythonCommand = $this->config->python_command ?? 'python';
    }

    /**
     * Capture an error pattern to the local KG
     */
    public function captureError($signature, $category = 'Error', $language = 'php', $severity = 'medium', $description = null) {
        $descValue = $description !== null ? "'" . $this->escapePython($description) . "'" : 'None';

        $pythonCode = <<<PYTHON
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('{$this->dbPath}')
pattern_id = kg.capture_error(
    error_signature='{$this->escapePython($signature)}',
    error_category='{$this->escapePython($category)}',
    language='{$this->escapePython($language)}',
    description={$descValue},
    severity='{$this->escapePython($severity)}'
)
print(pattern_id)
PYTHON;

        return $this->runPython($pythonCode);
    }

    /**
     * Capture an error from a PHP Exception
     */
    public function captureErrorFromException($exception, $language = 'php', $severity = 'medium') {
        $stackTrace = substr($exception->getTraceAsString(), 0, 500);
        return $this->captureError(
            $exception->getMessage(),
            get_class($exception),
            $language,
            $severity,
            $stackTrace
        );
    }

    /**
     * Search for similar error patterns
     */
    public function searchPatterns($query, $limit = 5) {
        $pythonCode = <<<PYTHON
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('{$this->dbPath}')
patterns = kg.search_patterns('{$this->escapePython($query)}', {$limit})
print(json.dumps(patterns, default=str))
PYTHON;

        $result = $this->runPython($pythonCode);
        return json_decode($result, true);
    }

    /**
     * Add a solution to an existing pattern
     */
    public function addSolution($patternId, $solutionText, $effectiveness = 'worked') {
        $pythonCode = <<<PYTHON
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('{$this->dbPath}')
solution_id = kg.add_solution(
    pattern_id='{$this->escapePython($patternId)}',
    solution_text='{$this->escapePython($solutionText)}',
    effectiveness='{$this->escapePython($effectiveness)}'
)
print(solution_id)
PYTHON;

        return $this->runPython($pythonCode);
    }

    /**
     * Get summary statistics
     */
    public function getSummary() {
        $pythonCode = <<<PYTHON
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('{$this->dbPath}')
summary = kg.get_pattern_summary()
print(json.dumps(summary, default=str))
PYTHON;

        $result = $this->runPython($pythonCode);
        return json_decode($result, true);
    }

    /**
     * Fire-and-forget error capture (non-blocking via background process)
     */
    public function captureErrorAsync($signature, $category = 'Error', $language = 'php', $severity = 'medium') {
        // PHP doesn't have true async, but we can fork a background process
        $command = sprintf(
            '%s -c "import sys; sys.path.insert(0, \'.\'); from local_kg.local_kg import get_local_kg; kg = get_local_kg(\'%s\'); kg.capture_error(error_signature=\'%s\', error_category=\'%s\', language=\'%s\', severity=\'%s\')" > /dev/null 2>&1 &',
            $this->pythonCommand,
            $this->dbPath,
            $this->escapePython($signature),
            $this->escapePython($category),
            $this->escapePython($language),
            $this->escapePython($severity)
        );
        exec($command);
    }

    /**
     * Escape string for Python code
     */
    private function escapePython($str) {
        $str = str_replace('\\', '\\\\', $str);
        $str = str_replace("'", "\\'", $str);
        $str = str_replace("\n", "\\n", $str);
        return $str;
    }

    /**
     * Run Python code and return stdout
     */
    private function runPython($code) {
        $descriptorspec = array(
            0 => array("pipe", "r"),  // stdin
            1 => array("pipe", "w"),  // stdout
            2 => array("pipe", "w")   // stderr
        );

        $process = proc_open(
            $this->pythonCommand . ' -c ' . escapeshellarg($code),
            $descriptorspec,
            $pipes,
            getcwd()
        );

        if (is_resource($process)) {
            fclose($pipes[0]);

            $stdout = stream_get_contents($pipes[1]);
            fclose($pipes[1]);

            $stderr = stream_get_contents($pipes[2]);
            fclose($pipes[2]);

            $return_value = proc_close($process);

            if ($return_value !== 0) {
                throw new Exception("Python process failed (exit $return_value): $stderr");
            }

            return trim($stdout);
        }

        throw new Exception("Failed to spawn Python process");
    }

    /**
     * Get global singleton instance
     */
    public static function getInstance($dbPath = null) {
        if (self::$instance === null || $dbPath !== null) {
            self::$instance = new self($dbPath);
        }
        return self::$instance;
    }
}

// Example usage
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    try {
        $kg = new LocalKGBridge();
        
        // Simulate an error
        try {
            // This would throw an error
            $result = 10 / 0;
        } catch (Exception $e) {
            $patternId = $kg->captureErrorFromException($e);
            echo "Captured error: $patternId\n";
        }
        
        // Search for patterns
        $patterns = $kg->searchPatterns('division', 5);
        echo "Found " . count($patterns) . " patterns\n";
        
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}

