/*!
 * Rust Bridge for Nebula Local KG
 * 
 * Provides a Rust interface to interact with the Python-based Local Knowledge Graph.
 * 
 * Usage:
 *   mod local_kg_bridge;
 *   use local_kg_bridge::LocalKGBridge;
 *   
 *   let kg = LocalKGBridge::new(None)?;
 *   kg.capture_error("E0308: mismatched types", "CompileError", "rust", "high").await?;
 */

use std::process::Command;
use std::fs;
use std::env;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct NebulaConfig {
    pub language: Option<String>,
    pub framework: Option<String>,
    pub local_kg_db: Option<String>,
    pub central_kg_url: Option<String>,
    pub python_command: Option<String>,
    pub auto_sync: Option<bool>,
}

#[derive(Debug, Clone)]
pub struct ErrorCapture {
    pub signature: String,
    pub category: String,
    pub language: String,
    pub severity: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ErrorPattern {
    pub id: String,
    pub error_signature: String,
    pub error_category: String,
    pub language: String,
    pub severity: String,
    pub description: Option<String>,
    pub occurrence_count: i32,
    pub first_seen: String,
    pub last_seen: String,
    pub solution_count: i32,
}

#[derive(Debug, Deserialize)]
pub struct PatternSummary {
    pub total_patterns: i32,
    pub total_solutions: i32,
    pub languages: serde_json::Value,
    pub top_errors: Vec<serde_json::Value>,
}

pub struct LocalKGBridge {
    config: NebulaConfig,
    db_path: String,
    python_cmd: String,
}

impl LocalKGBridge {
    /// Create a new bridge instance
    pub fn new(db_path: Option<&str>) -> Result<Self, Box<dyn std::error::Error>> {
        let config = Self::load_config()?;
        let db_path = db_path
            .map(String::from)
            .or_else(|| config.local_kg_db.clone())
            .unwrap_or_else(|| "local_kg/nebula_ide_local.db".to_string());
        let python_cmd = config.python_command.clone().unwrap_or_else(|| "python".to_string());

        Ok(Self {
            config,
            db_path,
            python_cmd,
        })
    }

    /// Load configuration from .nebula/config.json or environment variables
    fn load_config() -> Result<NebulaConfig, Box<dyn std::error::Error>> {
        // Priority 1: .nebula/config.json
        let config_path = ".nebula/config.json";
        if let Ok(contents) = fs::read_to_string(config_path) {
            return Ok(serde_json::from_str(&contents)?);
        }

        // Priority 2: Environment variables
        if let Ok(language) = env::var("NEBULA_LANGUAGE") {
            return Ok(NebulaConfig {
                language: Some(language),
                framework: env::var("NEBULA_FRAMEWORK").ok(),
                local_kg_db: env::var("NEBULA_LOCAL_KG_DB").ok(),
                central_kg_url: env::var("NEBULA_CENTRAL_KG_URL").ok(),
                python_command: env::var("PYTHON_CMD").ok(),
                auto_sync: None,
            });
        }

        // Priority 3: Defaults
        Ok(NebulaConfig {
            language: Some("rust".to_string()),
            framework: None,
            local_kg_db: Some("local_kg/nebula_ide_local.db".to_string()),
            central_kg_url: None,
            python_command: Some("python".to_string()),
            auto_sync: Some(true),
        })
    }

    /// Capture an error pattern to the local KG (async, non-blocking)
    pub async fn capture_error_async(
        &self,
        signature: &str,
        category: &str,
        language: &str,
        severity: &str,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let python_code = format!(
            r#"
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('{}')
pattern_id = kg.capture_error(
    error_signature='{}',
    error_category='{}',
    language='{}',
    severity='{}'
)
print(pattern_id)
"#,
            self.db_path,
            Self::escape_python(signature),
            Self::escape_python(category),
            Self::escape_python(language),
            Self::escape_python(severity)
        );

        self.run_python(&python_code).await
    }

    /// Search for similar error patterns
    pub async fn search_patterns(
        &self,
        query: &str,
        limit: usize,
    ) -> Result<Vec<ErrorPattern>, Box<dyn std::error::Error>> {
        let python_code = format!(
            r#"
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('{}')
patterns = kg.search_patterns('{}', {})
print(json.dumps(patterns, default=str))
"#,
            self.db_path,
            Self::escape_python(query),
            limit
        );

        let result = self.run_python(&python_code).await?;
        let patterns: Vec<ErrorPattern> = serde_json::from_str(&result)?;
        Ok(patterns)
    }

    /// Add a solution to an existing pattern
    pub async fn add_solution(
        &self,
        pattern_id: &str,
        solution_text: &str,
        effectiveness: &str,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let python_code = format!(
            r#"
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('{}')
solution_id = kg.add_solution(
    pattern_id='{}',
    solution_text='{}',
    effectiveness='{}'
)
print(solution_id)
"#,
            self.db_path,
            Self::escape_python(pattern_id),
            Self::escape_python(solution_text),
            Self::escape_python(effectiveness)
        );

        self.run_python(&python_code).await
    }

    /// Get summary statistics
    pub async fn get_summary(&self) -> Result<PatternSummary, Box<dyn std::error::Error>> {
        let python_code = format!(
            r#"
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('{}')
summary = kg.get_pattern_summary()
print(json.dumps(summary, default=str))
"#,
            self.db_path
        );

        let result = self.run_python(&python_code).await?;
        let summary: PatternSummary = serde_json::from_str(&result)?;
        Ok(summary)
    }

    /// Fire-and-forget error capture (spawns task, doesn't wait)
    pub fn capture_error_fire_and_forget(
        &self,
        signature: String,
        category: String,
        language: String,
        severity: String,
    ) {
        let db_path = self.db_path.clone();
        let python_cmd = self.python_cmd.clone();

        tokio::spawn(async move {
            let bridge = LocalKGBridge {
                config: NebulaConfig {
                    language: Some(language.clone()),
                    framework: None,
                    local_kg_db: Some(db_path.clone()),
                    central_kg_url: None,
                    python_command: Some(python_cmd.clone()),
                    auto_sync: None,
                },
                db_path,
                python_cmd,
            };

            if let Err(e) = bridge.capture_error_async(&signature, &category, &language, &severity).await {
                tracing::warn!("Failed to capture error to Local KG: {}", e);
            }
        });
    }

    /// Escape string for Python code
    fn escape_python(s: &str) -> String {
        s.replace('\\', "\\\\")
            .replace('\'', "\\'")
            .replace('\n', "\\n")
    }

    /// Run Python code and return stdout
    async fn run_python(&self, code: &str) -> Result<String, Box<dyn std::error::Error>> {
        let output = tokio::process::Command::new(&self.python_cmd)
            .arg("-c")
            .arg(code)
            .current_dir(".")
            .output()
            .await?;

        if output.status.success() {
            Ok(String::from_utf8(output.stdout)?.trim().to_string())
        } else {
            let stderr = String::from_utf8(output.stderr)?;
            Err(format!("Python process failed: {}", stderr).into())
        }
    }
}

/// Global singleton instance
static mut GLOBAL_INSTANCE: Option<LocalKGBridge> = None;

/// Get or create global singleton instance
pub fn get_local_kg(db_path: Option<&str>) -> Result<&'static LocalKGBridge, Box<dyn std::error::Error>> {
    unsafe {
        if GLOBAL_INSTANCE.is_none() {
            GLOBAL_INSTANCE = Some(LocalKGBridge::new(db_path)?);
        }
        Ok(GLOBAL_INSTANCE.as_ref().unwrap())
    }
}

