#!/usr/bin/env node

/**
 * Nebula Framework Project Initializer
 * 
 * Sets up project-local Nebula tools including:
 * - Project memory database
 * - Local MCP server configuration
 * - Git ignore rules
 * - Build exclusion setup
 * - MANDATORY Central KG Connection check
 * 
 * Usage: node init-nebula-project.js [project-type] [project-name]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check if Git is installed
function checkGitInstallation() {
  try {
    execSync('git --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('\n⚠️  ERROR: Git is not installed or not in PATH');
    console.error('Please install Git: https://git-scm.com/downloads');
    console.error('Git is REQUIRED for the Nebula Protocol (Git-first architecture)\n');
    return false;
  }
}

// Check Central KG connection via HTTP Health Check
function checkCentralKG() {
  return new Promise((resolve) => {
    console.log('\n🧠 Checking Central Knowledge Graph connection...');
    
    const req = http.get('http://localhost:8080/health', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Central KG connected (HTTP 200 OK)');
        resolve(true);
      } else {
        console.log(`⚠️  Central KG responded with status: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (e) => {
      console.log(`⚠️  Central KG unreachable: ${e.message}`);
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      console.log('⚠️  Central KG connection timed out');
      resolve(false);
    });
  });
}

// Initialize Git repository
function initializeGit(projectPath) {
  try {
    try {
      execSync('git rev-parse --git-dir', { cwd: projectPath, stdio: 'pipe' });
      console.log('✅ Git repository already initialized\n');
      return true;
    } catch (error) {
      // Not a git repo, initialize it
    }

    console.log('🔧 Initializing Git repository...');
    execSync('git init', { cwd: projectPath, stdio: 'pipe' });
    execSync('git checkout -b main', { cwd: projectPath, stdio: 'pipe' });
    console.log('✅ Git repository initialized\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Git:', error.message);
    return false;
  }
}

// Supported project types
const PROJECT_TYPES = ['flutter', 'tauri', 'python', 'rust', 'dioxus'];
const COMPLEXITY_LEVELS = ['simple', 'moderate', 'complex'];

const args = process.argv.slice(2);
const projectType = args[0] || 'generic';
const projectName = args[1] || 'my-project';
const projectComplexity = args[2] || 'moderate';

if (!PROJECT_TYPES.includes(projectType) && projectType !== 'generic') {
  console.error(`\n❌ Unknown project type: ${projectType}`);
  console.error(`\n✅ Supported types: ${PROJECT_TYPES.join(', ')}, generic\n`);
  process.exit(1);
}

console.log('\n🌌 Initializing Nebula Framework for your project...\n');
console.log(`📦 Project Type: ${projectType}`);
console.log(`📂 Project Name: ${projectName}`);
console.log(`🎯 Complexity Level: ${projectComplexity}\n`);

// Check Git installation (REQUIRED)
if (!checkGitInstallation()) {
  process.exit(1);
}

// Create .nebula directory structure
function createNebulaDirectory() {
  console.log('📁 Creating .nebula directory structure...');
  
  const nebulaDir = path.join(process.cwd(), '.nebula');
  const logsDir = path.join(nebulaDir, 'logs');
  const toolsDir = path.join(nebulaDir, 'tools');
  
  [nebulaDir, logsDir, toolsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  ✅ Created: ${path.relative(process.cwd(), dir)}`);
    }
  });
}

// Copy project memory tools
function copyProjectMemoryTools() {
  console.log('\n📋 Copying project memory tools...');
  
  const filesToCopy = [
    { src: 'project-memory.js', dest: '.nebula/tools/project-memory.js' },
    { src: 'verify-nebula.js', dest: 'verify-nebula.js' } // Copy verification tool
  ];
  
  filesToCopy.forEach(file => {
    const sourceFile = path.join(__dirname, file.src);
    const targetFile = path.join(process.cwd(), file.dest);
    
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`  ✅ Copied: ${file.dest}`);
    } else {
      console.log(`  ⚠️  Warning: ${file.src} not found in framework`);
    }
  });
}

// Create package.json for local tools
function createToolsPackageJson() {
  console.log('\n📦 Setting up local tool dependencies...');
  
  const packageJsonPath = path.join(process.cwd(), '.nebula', 'tools', 'package.json');
  
  const packageJson = {
    name: `${projectName}-nebula-tools`,
    version: "0.1.0",
    private: true,
    type: "module",
    dependencies: {
      "better-sqlite3": "^9.2.2",
      "zod": "^3.22.4"
    }
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`  ✅ Created: .nebula/tools/package.json`);
  
  console.log('\n📥 Installing dependencies...');
  try {
    execSync('npm install', {
      cwd: path.join(process.cwd(), '.nebula', 'tools'),
      stdio: 'inherit'
    });
    console.log('  ✅ Dependencies installed');
  } catch (error) {
    console.log('  ⚠️  Failed to install dependencies. Run manually:');
    console.log('     cd .nebula/tools && npm install');
  }
}

// Update .gitignore
function updateGitignore() {
  console.log('\n🔒 Updating .gitignore...');
  
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const nebulaIgnoreRules = `
# Nebula Framework - Development Tools
.nebula/logs/
.nebula/project_memory.sqlite
.nebula/project_memory.sqlite-shm
.nebula/project_memory.sqlite-wal
.nebula/tools/node_modules/
`;

  if (fs.existsSync(gitignorePath)) {
    const currentContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!currentContent.includes('.nebula/logs/')) {
      fs.appendFileSync(gitignorePath, nebulaIgnoreRules);
      console.log('  ✅ Added Nebula rules to .gitignore');
    }
  } else {
    fs.writeFileSync(gitignorePath, nebulaIgnoreRules.trim() + '\n');
    console.log('  ✅ Created .gitignore with Nebula rules');
  }
}

// Create build exclusions
function createBuildExclusions() {
  console.log('\n🚫 Setting up build exclusions...');
  
  switch (projectType) {
    case 'rust':
    case 'dioxus':
      console.log('  ℹ️  Add to Cargo.toml: exclude = [".nebula/"]');
      break;
    case 'flutter':
      console.log('  ✅ Flutter uses .gitignore (already configured)');
      break;
    case 'python':
      const manifestPath = path.join(process.cwd(), 'MANIFEST.in');
      if (!fs.existsSync(manifestPath)) {
        fs.writeFileSync(manifestPath, 'prune .nebula\n');
        console.log('  ✅ Created MANIFEST.in with exclusion');
      }
      break;
  }
}

// Copy framework adaptation
function copyFrameworkAdaptation() {
  console.log('\n📚 Copying framework adaptation...');
  
  const adaptationMap = {
    flutter: 'FLUTTER_NEBULA_ADAPTATION.md',
    tauri: 'TAURI_NEBULA_ADAPTATION.md',
    python: 'PYTHON_NEBULA_ADAPTATION.md',
    rust: 'RUST_NEBULA_ADAPTATION.md',
    dioxus: 'DIOXUS_NEBULA_ADAPTATION.md',
    generic: 'Nebula_Protocol.md'
  };
  
  const sourceFile = path.join(__dirname, adaptationMap[projectType]);
  const targetFile = path.join(process.cwd(), 'docs', adaptationMap[projectType]);
  
  if (!fs.existsSync(path.join(process.cwd(), 'docs'))) {
    fs.mkdirSync(path.join(process.cwd(), 'docs'));
  }
  
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`  ✅ Copied: ${adaptationMap[projectType]}`);
  }
  
  const coreSource = path.join(__dirname, 'Nebula_Protocol.md');
  const coreTarget = path.join(process.cwd(), 'docs', 'Nebula_Protocol.md');
  if (fs.existsSync(coreSource)) {
    fs.copyFileSync(coreSource, coreTarget);
    console.log(`  ✅ Copied: Nebula_Protocol.md`);
  }
}

// Get Constellation Structure
function getConstellationStructure(complexity) {
  if (complexity === 'simple') {
    return [
      { num: 0, name: 'SETUP', desc: 'Project initialization and setup' },
      { num: 1, name: 'CORE', desc: 'Core functionality implementation' },
      { num: 2, name: 'DEPLOYMENT', desc: 'Deployment and distribution' }
    ];
  } else if (complexity === 'moderate') {
    return [
      { num: 0, name: 'SETUP', desc: 'Project initialization and setup' },
      { num: 1, name: 'CORE', desc: 'Core functionality implementation' },
      { num: 2, name: 'FEATURES', desc: 'Feature development' },
      { num: 3, name: 'INTEGRATION', desc: 'Testing and integration' },
      { num: 4, name: 'DEPLOYMENT', desc: 'Deployment and distribution' }
    ];
  } else {
    return [
      { num: 0, name: 'SETUP', desc: 'Project initialization and environment' },
      { num: 1, name: 'CORE', desc: 'Core architecture and backend' },
      { num: 2, name: 'FEATURES', desc: 'Feature development' },
      { num: 3, name: 'INTEGRATION', desc: 'Testing and integration' },
      { num: 4, name: 'DEPLOYMENT', desc: 'Deployment and distribution' },
      { note: 'Star Systems can be added within constellations as complexity emerges' }
    ];
  }
}

// Create ROADMAP.md
function createInitialRoadmap() {
  console.log('\n🗺️  Creating initial ROADMAP.md...');
  
  const constellations = getConstellationStructure(projectComplexity);
  let constellationSections = '';
  constellations.forEach((c) => {
    if (c.note) {
      constellationSections += `\n**Note:** ${c.note}\n`;
      return;
    }
    const version = `0.${c.num + 1}.0`;
    const status = c.num === 0 ? '🔄 In Progress' : '⏳ Pending';
    constellationSections += `
### Constellation ${c.num}: ${c.name} (→ ${version})
- **Status:** ${status}
- **Document:** \`CONSTELLATION_${c.num}_${c.name}.md\`
- **Star Gate:** \`STAR_GATE_${c.num}_${c.name}.md\`
- **Description:** ${c.desc}
- **Objectives:** TBD
`;
  });

  const roadmapContent = `# ${projectName} - Nebula Roadmap

## Project Overview
${projectName} - A ${projectType} project following the Nebula Framework
**Complexity:** ${projectComplexity}

## Development Constellations
${constellationSections}

## Compliance
- [ ] All Star Gates Passed
- [ ] Error Logging Active
- [ ] Central KG Connected
`;

  const roadmapPath = path.join(process.cwd(), 'ROADMAP.md');
  if (!fs.existsSync(roadmapPath)) {
    fs.writeFileSync(roadmapPath, roadmapContent);
    console.log('  ✅ Created: ROADMAP.md');
  }
}

// Create .nebula/README.md
function createNebulaReadme() {
  console.log('\n📖 Creating .nebula/README.md...');
  const readmeContent = `# Nebula Framework Tools
  
MANDATORY:
1. Project Memory (.nebula/project_memory.sqlite)
2. Error Logging (.nebula/logs/)
3. Central KG Connection (via Docker)
`;
  fs.writeFileSync(path.join(process.cwd(), '.nebula', 'README.md'), readmeContent);
  console.log('  ✅ Created: .nebula/README.md');
}

async function main() {
  // BLOCKING CHECK: Central KG must be available
  const centralKGAvailable = await checkCentralKG();
  if (!centralKGAvailable) {
    console.error('\n❌ FATAL: Central Knowledge Graph is NOT accessible.');
    console.error('   Compliance requires a live connection to the Central KG.');
    console.error('   1. Run: docker-compose up -d');
    console.error('   2. Verify: http://localhost:8080/health');
    console.error('   3. Retry initialization');
    process.exit(1); // Fail fast
  }

  try {
    createNebulaDirectory();
    copyProjectMemoryTools();
    createToolsPackageJson();
    updateGitignore();
    createBuildExclusions();
    copyFrameworkAdaptation();
    createInitialRoadmap();
    createNebulaReadme();
    
    console.log('\n🔧 Initializing Git...');
    initializeGit(process.cwd());
    
    console.log('\n✅ Nebula Framework Initialized & Compliant');
    console.log('   - Central KG: CONNECTED');
    console.log('   - Local Memory: INITIALIZED');
    console.log('   - Logging: ENABLED');
    console.log('\n🚀 Run "node verify-nebula.js" at any time to check compliance.');
    
  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

main();
