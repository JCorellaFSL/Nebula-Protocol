#!/usr/bin/env node

/**
 * Nebula Framework Project Initializer
 * 
 * Sets up project-local Nebula tools including:
 * - Project memory database
 * - Local MCP server configuration
 * - Git ignore rules
 * - Build exclusion setup
 * 
 * Usage: node init-nebula-project.js [project-type] [project-name]
 * Example: node init-nebula-project.js rust my-todo-app
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Supported project types
const PROJECT_TYPES = ['flutter', 'tauri', 'python', 'rust', 'dioxus'];

// Parse command line arguments
const args = process.argv.slice(2);
const projectType = args[0] || 'generic';
const projectName = args[1] || 'my-project';

if (!PROJECT_TYPES.includes(projectType) && projectType !== 'generic') {
  console.error(`\n❌ Unknown project type: ${projectType}`);
  console.error(`\n✅ Supported types: ${PROJECT_TYPES.join(', ')}, generic\n`);
  process.exit(1);
}

console.log('\n🌌 Initializing Nebula Framework for your project...\n');
console.log(`📦 Project Type: ${projectType}`);
console.log(`📂 Project Name: ${projectName}\n`);

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
    } else {
      console.log(`  ⏭️  Exists: ${path.relative(process.cwd(), dir)}`);
    }
  });
}

// Copy project memory script
function copyProjectMemoryTools() {
  console.log('\n📋 Copying project memory tools...');
  
  const sourceFile = path.join(__dirname, 'project-memory.js');
  const targetFile = path.join(process.cwd(), '.nebula', 'tools', 'project-memory.js');
  
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`  ✅ Copied: project-memory.js`);
  } else {
    console.log(`  ⚠️  Warning: project-memory.js not found in framework`);
  }
}

// Create package.json for local tools (if needed)
function createToolsPackageJson() {
  console.log('\n📦 Setting up local tool dependencies...');
  
  const packageJsonPath = path.join(process.cwd(), '.nebula', 'tools', 'package.json');
  
  const packageJson = {
    name: `${projectName}-nebula-tools`,
    version: "0.1.0",
    description: "Local Nebula Framework tools for project memory and knowledge graph",
    type: "module",
    private: true,
    dependencies: {
      "better-sqlite3": "^9.2.2",
      "zod": "^3.22.4"
    }
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`  ✅ Created: .nebula/tools/package.json`);
  
  // Install dependencies
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

// Create .gitignore entries
function updateGitignore() {
  console.log('\n🔒 Updating .gitignore...');
  
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const nebulaIgnoreRules = `
# Nebula Framework - Development Tools (keep out of builds)
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
    } else {
      console.log('  ⏭️  .gitignore already contains Nebula rules');
    }
  } else {
    fs.writeFileSync(gitignorePath, nebulaIgnoreRules.trim() + '\n');
    console.log('  ✅ Created .gitignore with Nebula rules');
  }
}

// Create framework-specific exclusion files
function createBuildExclusions() {
  console.log('\n🚫 Setting up build exclusions...');
  
  switch (projectType) {
    case 'rust':
    case 'dioxus':
      // Add to Cargo.toml exclude
      console.log('  ℹ️  Add to Cargo.toml:');
      console.log('     exclude = [".nebula/"]');
      break;
      
    case 'flutter':
      // Flutter uses .gitignore for build exclusions
      console.log('  ✅ Flutter uses .gitignore (already configured)');
      break;
      
    case 'tauri':
      // Tauri uses .gitignore and tauri.conf.json
      console.log('  ℹ️  Add to tauri.conf.json bundle.resources:');
      console.log('     Ensure .nebula is not in resources list');
      break;
      
    case 'python':
      // Create MANIFEST.in
      const manifestPath = path.join(process.cwd(), 'MANIFEST.in');
      if (!fs.existsSync(manifestPath)) {
        fs.writeFileSync(manifestPath, 'prune .nebula\n');
        console.log('  ✅ Created MANIFEST.in with exclusion');
      } else {
        console.log('  ℹ️  Add to MANIFEST.in: prune .nebula');
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
  
  // Create docs directory if it doesn't exist
  if (!fs.existsSync(path.join(process.cwd(), 'docs'))) {
    fs.mkdirSync(path.join(process.cwd(), 'docs'));
  }
  
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`  ✅ Copied: ${adaptationMap[projectType]}`);
  } else {
    console.log(`  ⚠️  Framework adaptation not found: ${adaptationMap[projectType]}`);
  }
  
  // Also copy core protocol
  const coreSource = path.join(__dirname, 'Nebula_Protocol.md');
  const coreTarget = path.join(process.cwd(), 'docs', 'Nebula_Protocol.md');
  if (fs.existsSync(coreSource)) {
    fs.copyFileSync(coreSource, coreTarget);
    console.log(`  ✅ Copied: Nebula_Protocol.md`);
  }
}

// Create initial ROADMAP.md
function createInitialRoadmap() {
  console.log('\n🗺️  Creating initial ROADMAP.md...');
  
  const roadmapContent = `# ${projectName} - Nebula Roadmap

## Project Overview
${projectName} - A ${projectType} project following the Nebula Framework

## Technology Stack
- **Framework:** ${projectType.charAt(0).toUpperCase() + projectType.slice(1)}
- **Development Approach:** AI-assisted with Nebula Protocol
- **Version:** 0.0.1 (pre-Phase 0)

## Development Phases

### Phase 0: Setup & Foundation (→ 0.1.0)
- **Status:** 🔄 In Progress
- **Constellation:** ROADMAP_PHASE_0_SETUP.md
- **Objectives:** 
  - Project initialization
  - Development environment setup
  - Logging infrastructure (MANDATORY)
  - Project memory initialization
- **Key Deliverables:**
  - Basic project structure
  - Dependencies installed
  - Logging operational
  - Development tools configured

### Phase 1: Core Development (→ 0.2.0)
- **Status:** ⏳ Pending
- **Constellation:** ROADMAP_PHASE_1_CORE.md
- **Objectives:** Core backend/logic implementation
- **Key Deliverables:** TBD

### Phase 1.5: Basic UI (→ 0.3.0) **MANDATORY**
- **Status:** ⏳ Pending
- **Constellation:** ROADMAP_PHASE_1.5_BASIC_UI.md
- **Objectives:** Make Phase 1 features usable through basic UI
- **Key Deliverables:** Functional, testable user interface

### Phase 2: Feature Development (→ 0.4.0)
- **Status:** ⏳ Pending
- **Constellation:** ROADMAP_PHASE_2_FEATURES.md
- **Objectives:** Implement specific features
- **Key Deliverables:** TBD

### Phase 3: Integration & Testing (→ 0.5.0)
- **Status:** ⏳ Pending
- **Constellation:** ROADMAP_PHASE_3_INTEGRATION.md
- **Objectives:** Testing, optimization, integration
- **Key Deliverables:** Tested, integrated application

### Phase 3.5: UI Polish (→ 0.6.0) **MANDATORY**
- **Status:** ⏳ Pending
- **Constellation:** ROADMAP_PHASE_3.5_UI_POLISH.md
- **Objectives:** Professional UI refinement
- **Key Deliverables:** Production-ready interface

### Phase 4: Deployment (→ 1.0.0)
- **Status:** ⏳ Pending
- **Constellation:** ROADMAP_PHASE_4_DEPLOYMENT.md
- **Objectives:** Deploy and distribute
- **Key Deliverables:** Live, accessible application

## Success Criteria
- [ ] All phases completed with quality gates passed
- [ ] Application is usable and testable (Phase 1.5+)
- [ ] UI is professional and polished (Phase 3.5+)
- [ ] Deployed and accessible (Phase 4)

## Project Memory
This project uses Nebula's project memory system located in \`.nebula/\`
- Error logs automatically tracked
- Pattern recognition enabled
- Decision history maintained
- Context snapshots saved

---
**Framework:** [Nebula Protocol](docs/Nebula_Protocol.md)
**Adaptation:** [${projectType.toUpperCase()}_NEBULA_ADAPTATION.md](docs/${adaptationMap[projectType]})
`;

  const roadmapPath = path.join(process.cwd(), 'ROADMAP.md');
  if (!fs.existsSync(roadmapPath)) {
    fs.writeFileSync(roadmapPath, roadmapContent);
    console.log('  ✅ Created: ROADMAP.md');
  } else {
    console.log('  ⏭️  ROADMAP.md already exists');
  }
  
  const adaptationMap = {
    flutter: 'FLUTTER_NEBULA_ADAPTATION.md',
    tauri: 'TAURI_NEBULA_ADAPTATION.md',
    python: 'PYTHON_NEBULA_ADAPTATION.md',
    rust: 'RUST_NEBULA_ADAPTATION.md',
    dioxus: 'DIOXUS_NEBULA_ADAPTATION.md',
    generic: 'Nebula_Protocol.md'
  };
}

// Create README instructions
function createNebulaReadme() {
  console.log('\n📖 Creating .nebula/README.md...');
  
  const readmeContent = `# Nebula Framework - Project Tools

This directory contains project-local Nebula Framework tools.

## 📁 Directory Structure

\`\`\`
.nebula/
├── logs/                    # Development and error logs
│   ├── dev.log             # General development logs
│   └── errors.log          # Error-specific logs (feeds project memory)
├── tools/                   # Local Nebula tools
│   ├── project-memory.js   # Project memory database manager
│   ├── package.json        # Tool dependencies
│   └── node_modules/       # Dependencies (gitignored)
├── project_memory.sqlite    # Project knowledge database
└── README.md               # This file
\`\`\`

## 🔧 What's Included

### Project Memory (SQLite Database)
- **Error tracking:** All errors automatically logged with context
- **Pattern recognition:** Recurring errors identified
- **Solution tracking:** Records what worked and effectiveness
- **Decision history:** Architectural decisions preserved
- **Context snapshots:** Session state for continuity

### Logs Directory
- **dev.log:** Development activity logs
- **errors.log:** Error-specific logs (JSON format)
- **Automatic cleanup:** Configurable retention (7 days dev, permanent errors)

## 🚫 Build Exclusions

This directory is **automatically excluded** from production builds:
- Added to \`.gitignore\` (logs, databases, node_modules)
- Framework-specific exclusions configured
- Safe to keep in repository (contains useful project memory)

## 💡 Usage

### Initialize Project Memory
\`\`\`bash
cd .nebula/tools
node -e "import('./project-memory.js').then(m => new m.ProjectMemory(process.cwd() + '/../..', '${projectName}', '${projectType}'))"
\`\`\`

### Query Error Patterns
\`\`\`javascript
import { ProjectMemory } from './.nebula/tools/project-memory.js';
const pm = new ProjectMemory(process.cwd(), '${projectName}', '${projectType}');
const patterns = pm.getErrorPatterns();
console.log(patterns);
\`\`\`

### Access via MCP (Cloud)
The cloud MCP server can read documentation, but for project memory access,
you need the local tools in this directory.

## 🔄 Maintenance

### Update Tools
\`\`\`bash
cd .nebula/tools
npm update
\`\`\`

### Backup Project Memory
\`\`\`bash
cp .nebula/project_memory.sqlite .nebula/project_memory.backup.sqlite
\`\`\`

### Clean Old Logs
Logs older than configured retention are automatically cleaned.
Manual cleanup:
\`\`\`bash
rm .nebula/logs/dev.log
rm .nebula/logs/errors.log
\`\`\`

---

**This directory is part of the Nebula Framework**
Documentation: docs/Nebula_Protocol.md
`;

  const readmePath = path.join(process.cwd(), '.nebula', 'README.md');
  fs.writeFileSync(readmePath, readmeContent);
  console.log('  ✅ Created: .nebula/README.md');
}

// Initialize project memory database
async function initializeProjectMemory() {
  console.log('\n🧠 Initializing project memory database...');
  
  try {
    const { ProjectMemory } = await import('./project-memory.js');
    const pm = new ProjectMemory(process.cwd(), projectName, projectType);
    console.log('  ✅ Project memory initialized');
  } catch (error) {
    console.log('  ⚠️  Could not initialize project memory automatically');
    console.log('     Run manually after dependencies install:');
    console.log(`     cd .nebula/tools && node -e "import('./project-memory.js').then(m => new m.ProjectMemory('../..', '${projectName}', '${projectType}'))"`);
  }
}

// Main execution
async function main() {
  try {
    createNebulaDirectory();
    copyProjectMemoryTools();
    createToolsPackageJson();
    updateGitignore();
    createBuildExclusions();
    copyFrameworkAdaptation();
    createInitialRoadmap();
    createNebulaReadme();
    
    console.log('\n✅ Nebula Framework initialization complete!\n');
    console.log('📋 Next Steps:\n');
    console.log('1. Review ROADMAP.md and customize for your project');
    console.log('2. Create constellation documents for each phase');
    console.log(`3. Reference docs/${projectType.toUpperCase()}_NEBULA_ADAPTATION.md for guidance`);
    console.log('4. Start Phase 0: Setup & Foundation\n');
    console.log('🔧 Project memory tools available in .nebula/tools/');
    console.log('📊 Logs will be saved to .nebula/logs/');
    console.log('🧠 Error patterns and solutions tracked automatically\n');
    
  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

// Run initialization
main();

