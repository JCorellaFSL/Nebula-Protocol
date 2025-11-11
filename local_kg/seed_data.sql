-- Seed data: Real errors encountered during Nebula Protocol development
-- Documents actual issues for future project template generation

-- Pattern 1: Missing package.json in generated project
INSERT OR IGNORE INTO local_patterns (
    id,
    error_signature,
    error_category,
    language,
    description,
    context_json,
    severity
) VALUES (
    'protocol_missing_package_json',
    'ENOENT: no such file or directory, open ''package.json''',
    'ProjectCreationError',
    'node',
    'Generated project missing package.json file after template instantiation',
    json('{"template": "react-typescript", "step": "dependency_resolution", "generator": "nebula-init"}'),
    'critical'
);

INSERT OR IGNORE INTO local_pattern_technologies (pattern_id, technology_slug)
VALUES 
    ('protocol_missing_package_json', 'node'),
    ('protocol_missing_package_json', 'npm'),
    ('protocol_missing_package_json', 'javascript');

-- Solution for missing package.json
INSERT OR IGNORE INTO local_solutions (
    id,
    pattern_id,
    title,
    description,
    code_snippet,
    resolution_steps,
    time_to_resolve_minutes,
    was_successful
) VALUES (
    'sol_verify_template_files',
    'protocol_missing_package_json',
    'Add file existence verification to template generator',
    'Template generator should verify all required files are created before marking project as ready. Add checksums for critical files.',
    '// In nebula-init-python.py
required_files = [''package.json'', ''tsconfig.json'', ''README.md'']
for file in required_files:
    if not os.path.exists(project_path / file):
        raise TemplateError(f"Required file {file} not created")',
    '1. Identify required files for template type
2. Add verification step after file generation
3. Throw detailed error if files missing
4. Add logging for which step failed
5. Test with clean directory',
    45,
    1
);

-- Pattern 2: Git initialization fails on Windows
INSERT OR IGNORE INTO local_patterns (
    id,
    error_signature,
    error_category,
    language,
    description,
    context_json,
    severity
) VALUES (
    'protocol_git_init_windows',
    'spawn git ENOENT',
    'GitError',
    'node',
    'Git command not found in PATH on Windows when initializing new project',
    json('{"os": "Windows", "command": "git init", "path": "%PATH%"}'),
    'high'
);

INSERT OR IGNORE INTO local_pattern_technologies (pattern_id, technology_slug)
VALUES 
    ('protocol_git_init_windows', 'git'),
    ('protocol_git_init_windows', 'windows'),
    ('protocol_git_init_windows', 'node');

-- Solution for Git not in PATH
INSERT OR IGNORE INTO local_solutions (
    id,
    pattern_id,
    title,
    description,
    code_snippet,
    resolution_steps,
    time_to_resolve_minutes,
    was_successful
) VALUES (
    'sol_detect_git_path',
    'protocol_git_init_windows',
    'Detect Git installation location on Windows',
    'Check common Git install locations on Windows and use full path if not in PATH. Provide helpful error message if Git not found.',
    'const gitPaths = [
  process.env.GIT_INSTALL_ROOT,
  "C:\\\\Program Files\\\\Git\\\\cmd\\\\git.exe",
  "C:\\\\Program Files (x86)\\\\Git\\\\cmd\\\\git.exe"
];
const gitPath = gitPaths.find(p => p && fs.existsSync(p)) || "git";',
    '1. Check if "git" command works
2. If not, search common Windows install locations
3. Use full path to git.exe if found
4. If not found, show installation instructions
5. Add --no-verify flag for hooks that might fail',
    20,
    1
);

-- Pattern 3: Template variable substitution failure
INSERT OR IGNORE INTO local_patterns (
    id,
    error_signature,
    error_category,
    language,
    description,
    context_json,
    severity
) VALUES (
    'protocol_template_var_undefined',
    'ReferenceError: PROJECT_NAME is not defined',
    'TemplateError',
    'javascript',
    'Template variable not replaced during project generation, resulting in undefined variable in generated code',
    json('{"template": "rust-axum", "variable": "PROJECT_NAME", "file": "Cargo.toml"}'),
    'high'
);

INSERT OR IGNORE INTO local_pattern_technologies (pattern_id, technology_slug)
VALUES 
    ('protocol_template_var_undefined', 'javascript'),
    ('protocol_template_var_undefined', 'templates');

-- Solution for template variable issues
INSERT OR IGNORE INTO local_solutions (
    id,
    pattern_id,
    title,
    description,
    code_snippet,
    resolution_steps,
    time_to_resolve_minutes,
    was_successful
) VALUES (
    'sol_validate_template_vars',
    'protocol_template_var_undefined',
    'Validate all template variables before generation',
    'Pre-process template files to extract required variables, validate they are provided, and show clear error if missing.',
    '// Extract variables from template
const requiredVars = new Set();
const varPattern = /{{\\s*([A-Z_]+)\\s*}}/g;
let match;
while ((match = varPattern.exec(templateContent)) !== null) {
  requiredVars.add(match[1]);
}

// Validate
for (const varName of requiredVars) {
  if (!projectConfig[varName]) {
    throw new Error(`Missing required variable: ${varName}`);
  }
}',
    '1. Parse template files for {{VARIABLE}} patterns
2. Build list of required variables
3. Check all are present in config before generation
4. Show clear error with variable name if missing
5. Add default values for optional variables',
    30,
    1
);

-- Pattern 4: Constellation analyzer out of memory
INSERT OR IGNORE INTO local_patterns (
    id,
    error_signature,
    error_category,
    language,
    description,
    context_json,
    severity
) VALUES (
    'protocol_analyzer_oom',
    'JavaScript heap out of memory',
    'PerformanceError',
    'node',
    'Constellation analyzer runs out of memory when processing large project trees or many simultaneous projects',
    json('{"projects": 150, "heap_limit": "512MB", "actual_usage": "1.2GB"}'),
    'medium'
);

INSERT OR IGNORE INTO local_pattern_technologies (pattern_id, technology_slug)
VALUES 
    ('protocol_analyzer_oom', 'node'),
    ('protocol_analyzer_oom', 'javascript');

-- Solution for memory issues
INSERT OR IGNORE INTO local_solutions (
    id,
    pattern_id,
    title,
    description,
    code_snippet,
    resolution_steps,
    time_to_resolve_minutes,
    was_successful
) VALUES (
    'sol_increase_node_memory',
    'protocol_analyzer_oom',
    'Increase Node.js heap size and add streaming processing',
    'Set NODE_OPTIONS to increase max heap size and process large datasets in chunks rather than all at once.',
    '// In package.json scripts
"scripts": {
  "analyze": "NODE_OPTIONS=''--max-old-space-size=4096'' node constellation-analyzer.js"
}

// In analyzer - process in batches
async function analyzeProjects(projects) {
  const batchSize = 10;
  for (let i = 0; i < projects.length; i += batchSize) {
    const batch = projects.slice(i, i + batchSize);
    await processBatch(batch);
    global.gc && global.gc(); // Trigger GC if available
  }
}',
    '1. Add NODE_OPTIONS to increase heap (2-4GB)
2. Process projects in batches of 10-20
3. Clear large objects after batch processing
4. Use streams for file I/O instead of loading all in memory
5. Add --expose-gc flag and manually trigger GC between batches',
    25,
    1
);

-- Pattern 5: Template file permissions on Linux
INSERT OR IGNORE INTO local_patterns (
    id,
    error_signature,
    error_category,
    language,
    description,
    context_json,
    severity
) VALUES (
    'protocol_template_permissions',
    'EACCES: permission denied',
    'FileSystemError',
    'node',
    'Generated files not executable on Linux/Mac after template instantiation (e.g., start.sh script)',
    json('{"os": "linux", "file": "scripts/start.sh", "expected_mode": "755"}'),
    'medium'
);

INSERT OR IGNORE INTO local_pattern_technologies (pattern_id, technology_slug)
VALUES 
    ('protocol_template_permissions', 'node'),
    ('protocol_template_permissions', 'linux'),
    ('protocol_template_permissions', 'filesystem');

-- Solution for file permissions
INSERT OR IGNORE INTO local_solutions (
    id,
    pattern_id,
    title,
    description,
    code_snippet,
    resolution_steps,
    time_to_resolve_minutes,
    was_successful
) VALUES (
    'sol_set_executable_permissions',
    'protocol_template_permissions',
    'Explicitly set file permissions after generation',
    'After copying template files, explicitly set executable permissions on script files based on platform.',
    'import { chmod } from ''fs/promises'';

const executableFiles = [
  ''scripts/start.sh'',
  ''scripts/stop.sh'',
  ''scripts/deploy.sh''
];

for (const file of executableFiles) {
  const filePath = path.join(projectDir, file);
  if (fs.existsSync(filePath)) {
    await chmod(filePath, 0o755); // rwxr-xr-x
  }
}',
    '1. Identify which files should be executable (.sh, .py scripts)
2. After template generation, iterate executable files
3. Use fs.chmod() to set 0o755 permissions
4. Handle Windows gracefully (permissions not same concept)
5. Log which files were made executable',
    15,
    1
);

-- Pattern 6: Central KG connection timeout during sync
INSERT OR IGNORE INTO local_patterns (
    id,
    error_signature,
    error_category,
    language,
    description,
    context_json,
    severity
) VALUES (
    'protocol_central_kg_timeout',
    'ETIMEDOUT: connect ETIMEDOUT',
    'NetworkError',
    'node',
    'Connection to Central KG times out when attempting to sync project patterns, blocking project creation',
    json('{"url": "http://localhost:8080", "timeout": "5000ms", "retry_count": 0}'),
    'low'
);

INSERT OR IGNORE INTO local_pattern_technologies (pattern_id, technology_slug)
VALUES 
    ('protocol_central_kg_timeout', 'http'),
    ('protocol_central_kg_timeout', 'node');

-- Solution for connection timeout
INSERT OR IGNORE INTO local_solutions (
    id,
    pattern_id,
    title,
    description,
    code_snippet,
    resolution_steps,
    time_to_resolve_minutes,
    was_successful
) VALUES (
    'sol_async_sync_with_retry',
    'protocol_central_kg_timeout',
    'Make Central KG sync async with retry logic',
    'Sync to Central KG should not block project creation. Use async fire-and-forget with exponential backoff retry.',
    '// Fire-and-forget sync
async function syncToCentralKG(pattern) {
  const maxRetries = 3;
  let delay = 1000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fetch(centralKgUrl, {
        method: ''POST'',
        body: JSON.stringify(pattern),
        timeout: 5000
      });
      return; // Success
    } catch (error) {
      if (i < maxRetries - 1) {
        await sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }
  }
  // Failed all retries - log but don''t throw
  console.warn(''Central KG sync failed after retries'');
}

// Don''t await
syncToCentralKG(pattern).catch(console.error);',
    '1. Make Central KG sync non-blocking
2. Implement retry logic with exponential backoff (1s, 2s, 4s)
3. Set reasonable timeout (5-10s)
4. Log failures but don''t throw errors
5. Queue failed syncs for later retry (optional)',
    20,
    1
);

