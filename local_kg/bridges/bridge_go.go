/**
 * Go Bridge for Nebula Local KG
 *
 * Provides a Go interface to interact with the Python-based Local Knowledge Graph.
 *
 * Usage:
 *   import "your-project/local_kg/bridges"
 *
 *   kg, err := bridges.NewLocalKGBridge("")
 *   if err != nil {
 *       log.Fatal(err)
 *   }
 *   patternID, err := kg.CaptureError("error message", "ErrorType", "go", "high")
 */

package bridges

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
)

// NebulaConfig represents the configuration for the bridge
type NebulaConfig struct {
	Language      string `json:"language"`
	Framework     string `json:"framework"`
	LocalKgDb     string `json:"local_kg_db"`
	CentralKgUrl  string `json:"central_kg_url"`
	PythonCommand string `json:"python_command"`
	AutoSync      bool   `json:"auto_sync"`
}

// ErrorCapture represents an error to be captured
type ErrorCapture struct {
	Signature    string   `json:"signature"`
	Category     string   `json:"category"`
	Language     string   `json:"language"`
	Severity     string   `json:"severity"`
	Description  string   `json:"description,omitempty"`
	Technologies []string `json:"technologies,omitempty"`
}

// ErrorPattern represents a captured error pattern
type ErrorPattern struct {
	ID              string `json:"id"`
	ErrorSignature  string `json:"error_signature"`
	ErrorCategory   string `json:"error_category"`
	Language        string `json:"language"`
	Severity        string `json:"severity"`
	Description     string `json:"description"`
	OccurrenceCount int    `json:"occurrence_count"`
	FirstSeen       string `json:"first_seen"`
	LastSeen        string `json:"last_seen"`
	SolutionCount   int    `json:"solution_count"`
}

// PatternSummary represents statistics about patterns
type PatternSummary struct {
	TotalPatterns  int                    `json:"total_patterns"`
	TotalSolutions int                    `json:"total_solutions"`
	Languages      map[string]int         `json:"languages"`
	TopErrors      []map[string]interface{} `json:"top_errors"`
}

// LocalKGBridge provides Go interface to Python Local KG
type LocalKGBridge struct {
	config        NebulaConfig
	dbPath        string
	pythonCommand string
	mu            sync.Mutex
}

var (
	globalInstance *LocalKGBridge
	once           sync.Once
)

// NewLocalKGBridge creates a new bridge instance
func NewLocalKGBridge(dbPath string) (*LocalKGBridge, error) {
	config, err := loadConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to load config: %w", err)
	}

	if dbPath == "" {
		dbPath = config.LocalKgDb
		if dbPath == "" {
			dbPath = "local_kg/nebula_protocol_local.db"
		}
	}

	pythonCmd := config.PythonCommand
	if pythonCmd == "" {
		pythonCmd = "python"
	}

	return &LocalKGBridge{
		config:        config,
		dbPath:        dbPath,
		pythonCommand: pythonCmd,
	}, nil
}

// loadConfig loads configuration from .nebula/config.json or environment variables
func loadConfig() (NebulaConfig, error) {
	// Priority 1: .nebula/config.json
	configPath := filepath.Join(".nebula", "config.json")
	if _, err := os.Stat(configPath); err == nil {
		data, err := ioutil.ReadFile(configPath)
		if err == nil {
			var config NebulaConfig
			if err := json.Unmarshal(data, &config); err == nil {
				return config, nil
			}
		}
	}

	// Priority 2: Environment variables
	if language := os.Getenv("NEBULA_LANGUAGE"); language != "" {
		return NebulaConfig{
			Language:      language,
			LocalKgDb:     getEnvOrDefault("NEBULA_LOCAL_KG_DB", "local_kg/project_local.db"),
			PythonCommand: getEnvOrDefault("PYTHON_CMD", "python"),
		}, nil
	}

	// Priority 3: Defaults
	return NebulaConfig{
		Language:      "go",
		LocalKgDb:     "local_kg/nebula_protocol_local.db",
		PythonCommand: "python",
	}, nil
}

// CaptureError captures an error pattern to the local KG
func (kg *LocalKGBridge) CaptureError(signature, category, language, severity string) (string, error) {
	return kg.CaptureErrorWithDescription(signature, category, language, severity, "")
}

// CaptureErrorWithDescription captures an error with optional description
func (kg *LocalKGBridge) CaptureErrorWithDescription(signature, category, language, severity, description string) (string, error) {
	descValue := "None"
	if description != "" {
		descValue = fmt.Sprintf("'%s'", escapePython(description))
	}

	pythonCode := fmt.Sprintf(`
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('%s')
pattern_id = kg.capture_error(
    error_signature='%s',
    error_category='%s',
    language='%s',
    description=%s,
    severity='%s'
)
print(pattern_id)
`,
		kg.dbPath,
		escapePython(signature),
		escapePython(category),
		escapePython(language),
		descValue,
		escapePython(severity),
	)

	return kg.runPython(pythonCode)
}

// CaptureErrorFromError captures a Go error
func (kg *LocalKGBridge) CaptureErrorFromError(err error, language, severity string) (string, error) {
	return kg.CaptureError(
		err.Error(),
		fmt.Sprintf("%T", err),
		language,
		severity,
	)
}

// SearchPatterns searches for similar error patterns
func (kg *LocalKGBridge) SearchPatterns(query string, limit int) ([]ErrorPattern, error) {
	pythonCode := fmt.Sprintf(`
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('%s')
patterns = kg.search_patterns('%s', %d)
print(json.dumps(patterns, default=str))
`,
		kg.dbPath,
		escapePython(query),
		limit,
	)

	result, err := kg.runPython(pythonCode)
	if err != nil {
		return nil, err
	}

	var patterns []ErrorPattern
	if err := json.Unmarshal([]byte(result), &patterns); err != nil {
		return nil, fmt.Errorf("failed to parse patterns: %w", err)
	}

	return patterns, nil
}

// AddSolution adds a solution to an existing pattern
func (kg *LocalKGBridge) AddSolution(patternID, solutionText, effectiveness string) (string, error) {
	pythonCode := fmt.Sprintf(`
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('%s')
solution_id = kg.add_solution(
    pattern_id='%s',
    solution_text='%s',
    effectiveness='%s'
)
print(solution_id)
`,
		kg.dbPath,
		escapePython(patternID),
		escapePython(solutionText),
		escapePython(effectiveness),
	)

	return kg.runPython(pythonCode)
}

// GetSummary gets summary statistics
func (kg *LocalKGBridge) GetSummary() (*PatternSummary, error) {
	pythonCode := fmt.Sprintf(`
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('%s')
summary = kg.get_pattern_summary()
print(json.dumps(summary, default=str))
`,
		kg.dbPath,
	)

	result, err := kg.runPython(pythonCode)
	if err != nil {
		return nil, err
	}

	var summary PatternSummary
	if err := json.Unmarshal([]byte(result), &summary); err != nil {
		return nil, fmt.Errorf("failed to parse summary: %w", err)
	}

	return &summary, nil
}

// CaptureErrorAsync captures error in a goroutine (non-blocking)
func (kg *LocalKGBridge) CaptureErrorAsync(signature, category, language, severity string) {
	go func() {
		if _, err := kg.CaptureError(signature, category, language, severity); err != nil {
			fmt.Fprintf(os.Stderr, "[LocalKG] Failed to capture error: %v\n", err)
		}
	}()
}

// escapePython escapes a string for Python code
func escapePython(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "'", "\\'")
	s = strings.ReplaceAll(s, "\n", "\\n")
	return s
}

// runPython runs Python code and returns stdout
func (kg *LocalKGBridge) runPython(code string) (string, error) {
	kg.mu.Lock()
	defer kg.mu.Unlock()

	cmd := exec.Command(kg.pythonCommand, "-c", code)
	cmd.Dir = "."

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("python process failed: %s: %w", stderr.String(), err)
	}

	return strings.TrimSpace(stdout.String()), nil
}

// GetGlobalInstance gets or creates the global singleton instance
func GetGlobalInstance(dbPath string) (*LocalKGBridge, error) {
	var err error
	once.Do(func() {
		globalInstance, err = NewLocalKGBridge(dbPath)
	})
	return globalInstance, err
}

// getEnvOrDefault gets environment variable or returns default
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

