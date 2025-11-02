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

// Project complexity levels
const COMPLEXITY_LEVELS = ['simple', 'moderate', 'complex'];

// Parse command line arguments
const args = process.argv.slice(2);
const projectType = args[0] || 'generic';
const projectName = args[1] || 'my-project';
const projectComplexity = args[2] || 'moderate'; // NEW: complexity argument

if (!PROJECT_TYPES.includes(projectType) && projectType !== 'generic') {
  console.error(`\n❌ Unknown project type: ${projectType}`);
  console.error(`\n✅ Supported types: ${PROJECT_TYPES.join(', ')}, generic\n`);
  process.exit(1);
}

console.log('\n🌌 Initializing Nebula Framework for your project...\n');
console.log(`📦 Project Type: ${projectType}`);
console.log(`📂 Project Name: ${projectName}`);
console.log(`🎯 Complexity Level: ${projectComplexity}\n`);

if (!COMPLEXITY_LEVELS.includes(projectComplexity)) {
  console.log(`⚠️  Unknown complexity level: ${projectComplexity}`);
  console.log(`   Supported: ${COMPLEXITY_LEVELS.join(', ')}`);
  console.log(`   Using default: moderate\n`);
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

// Determine constellation structure based on complexity
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
  } else { // complex
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

// Create initial ROADMAP.md
function createInitialRoadmap() {
  console.log('\n🗺️  Creating initial ROADMAP.md (adaptive structure)...');
  
  const adaptationMap = {
    flutter: 'FLUTTER_NEBULA_ADAPTATION.md',
    tauri: 'TAURI_NEBULA_ADAPTATION.md',
    python: 'PYTHON_NEBULA_ADAPTATION.md',
    rust: 'RUST_NEBULA_ADAPTATION.md',
    dioxus: 'DIOXUS_NEBULA_ADAPTATION.md',
    generic: 'Nebula_Protocol.md'
  };
  
  const constellations = getConstellationStructure(projectComplexity);
  
  // Generate constellation sections
  let constellationSections = '';
  constellations.forEach((c, index) => {
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
- **Objectives:** TBD (define in constellation document)
- **Key Deliverables:** TBD

`;
  });

  const roadmapContent = `# ${projectName} - Nebula Roadmap

## Project Overview
${projectName} - A ${projectType} project following the Nebula Framework

**Complexity Level:** ${projectComplexity}  
**Adaptive Structure:** This project uses an ${projectComplexity} constellation structure that can expand organically as complexity emerges.

## Technology Stack
- **Framework:** ${projectType.charAt(0).toUpperCase() + projectType.slice(1)}
- **Development Approach:** AI-assisted with Nebula Protocol
- **Version:** 0.0.1 (pre-Constellation 0)

## Framework Terminology
- **🌌 Nebula:** This document - the main project roadmap
- **⭐ Constellations:** Major development phases (e.g., CONSTELLATION_0_SETUP.md)
- **🪐 Star Systems:** Sub-phases within constellations (e.g., STAR_SYSTEM_1.1_DATABASE.md)
- **🚪 Star Gates:** Quality checkpoints between constellations (e.g., STAR_GATE_0_SETUP.md)

## Development Constellations
${constellationSections}
## Adaptive Growth

This project starts with **${constellations.filter(c => !c.note).length} core constellations**.

### When to Expand into Star Systems:
- A constellation task becomes too large (>4000 tokens, >8-10 tasks)
- Clear sub-components emerge within a constellation
- Different testing strategies needed for components
- Parallel work streams are possible

### Example Star System Expansion:
If Constellation 1 (CORE) becomes complex:
\`\`\`
CONSTELLATION_1_CORE.md  →  Expands to:
  ├── STAR_SYSTEM_1.1_DATABASE.md
  ├── STAR_SYSTEM_1.2_API.md
  ├── STAR_SYSTEM_1.3_AUTH.md
  └── STAR_GATE_1_CORE.md (validates all star systems)
\`\`\`

## Star Gates (Quality Enforcement)

**Every constellation must pass through its Star Gate before proceeding.**

### Star Gate Requirements:
- ✅ **Automated Tests:** All tests passing (must genuinely test, not fake outcomes)
- 👤 **Manual Verification:** Human testing for user-facing features
- 📝 **Integration Check:** Verify no breaking changes to previous constellations
- 📊 **Performance:** Acceptable performance benchmarks
- 📚 **Documentation:** All docs updated

### Skip Documentation:
If tests are skipped, document:
- Reason for skip
- Risk assessment
- Mitigation plan
- Approval

**All Star Gate results are logged to project memory automatically.**

## Success Criteria
- [ ] All constellations completed with Star Gates passed
- [ ] Application is functional and tested
- [ ] No critical bugs or technical debt
- [ ] Deployed and accessible (if applicable)

## Project Memory (Automatic)
This project uses Nebula's mandatory project memory system in \`.nebula/\`:
- ✅ **Auto-enabled:** Error logs automatically tracked
- 🧠 **Pattern Recognition:** Recurring errors identified
- 📋 **Decision History:** Architectural decisions maintained
- 💾 **Context Snapshots:** Session state saved
- 🚪 **Star Gate Logs:** All quality gate results tracked

## Version Tracking (Automatic)
- **Constellation Complete:** Minor version bump (0.X.0 → 0.Y.0)
- **Star System Complete:** Patch version bump (0.X.Y → 0.X.Z)
- **Git Tags:** Automatic tags on constellation completion

---
**Framework:** [Nebula Protocol](docs/Nebula_Protocol.md)  
**Adaptation:** [${projectType.toUpperCase()}_NEBULA_ADAPTATION.md](docs/${adaptationMap[projectType]})  
**Updates:** [Update History](../updates/README.md)
`;

  const roadmapPath = path.join(process.cwd(), 'ROADMAP.md');
  if (!fs.existsSync(roadmapPath)) {
    fs.writeFileSync(roadmapPath, roadmapContent);
    console.log('  ✅ Created: ROADMAP.md');
  } else {
    console.log('  ⏭️  ROADMAP.md already exists');
  }
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
    const constellations = getConstellationStructure(projectComplexity);
    
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
    console.log('1. Review ROADMAP.md for your adaptive constellation structure');
    console.log(`2. Project complexity: ${projectComplexity} (${constellations.filter(c => !c.note).length} initial constellations)`);
    console.log('3. Create Star Gate documents for quality enforcement');
    console.log(`4. Reference docs/${projectType.toUpperCase()}_NEBULA_ADAPTATION.md for guidance`);
    console.log('5. Start Constellation 0: Setup\n');
    console.log('🌌 Cosmic Framework Active:');
    console.log('   ⭐ Constellations - Main development phases');
    console.log('   🪐 Star Systems - Granular breakdowns (add as needed)');
    console.log('   🚪 Star Gates - Mandatory quality checkpoints\n');
    console.log('🧠 Auto-enabled features:');
    console.log('   ✅ Project memory tracking (.nebula/project_memory.sqlite)');
    console.log('   ✅ Error logging (.nebula/logs/)');
    console.log('   ✅ Star Gate validation logging\n');
    
  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

// Run initialization
main();

