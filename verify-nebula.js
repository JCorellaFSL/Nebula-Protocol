#!/usr/bin/env node

/**
 * Nebula Protocol Verification Tool
 * 
 * Enforces strict adherence to the Nebula Protocol:
 * 1. Verifies Cosmic Hierarchy (Roadmap -> Constellations -> Star Systems)
 * 2. Checks for mandatory Project Memory infrastructure
 * 3. Validates Central KG connection
 * 4. Ensures Star Gates are present
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REQUIRED_FILES = ['ROADMAP.md'];
const NEBULA_DIR = '.nebula';

async function checkCentralKGConnection() {
  try {
    // Expecting the Central KG API to be running on localhost:8080 (via Nginx)
    const response = await fetch('http://localhost:8080/health');
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

function verifyStructure() {
  const errors = [];
  const cwd = process.cwd();

  // 1. Check Root Files
  REQUIRED_FILES.forEach(file => {
    if (!fs.existsSync(path.join(cwd, file))) {
      errors.push(`❌ Missing mandatory file: ${file}`);
    }
  });

  // 2. Check Nebula Directory
  if (!fs.existsSync(path.join(cwd, NEBULA_DIR))) {
    errors.push(`❌ Missing .nebula directory (Project Memory is required)`);
  } else {
    // Check for logs and tools
    if (!fs.existsSync(path.join(cwd, NEBULA_DIR, 'logs'))) {
      errors.push(`❌ Missing .nebula/logs directory`);
    }
    if (!fs.existsSync(path.join(cwd, NEBULA_DIR, 'project_memory.sqlite'))) {
      // It might not exist yet if no errors occurred, but we should warn if it's effectively disabled
      // Actually, init script creates it or the tools to create it.
      // Let's check for the tools at least.
      if (!fs.existsSync(path.join(cwd, NEBULA_DIR, 'tools'))) {
        errors.push(`❌ Missing .nebula/tools directory`);
      }
    }
  }

  // 3. Check Constellation/Star Gate Integrity
  // Scan for CONSTELLATION_*.md and ensure matching STAR_GATE_*.md
  const files = fs.readdirSync(cwd);
  const constellations = files.filter(f => f.match(/^CONSTELLATION_\d+.*\.md$/));
  
  constellations.forEach(constellation => {
    const match = constellation.match(/^CONSTELLATION_(\d+)(.*)\.md$/);
    if (match) {
      const num = match[1];
      const suffix = match[2]; // e.g. "_SETUP"
      
      // Check for Star Gate
      // Star Gate might be named STAR_GATE_0_SETUP.md
      const starGatePattern = new RegExp(`^STAR_GATE_${num}.*\\.md$`);
      const hasStarGate = files.some(f => starGatePattern.test(f));
      
      if (!hasStarGate) {
        errors.push(`❌ Constellation ${num} missing matching STAR_GATE_${num} document`);
      }
    }
  });

  return errors;
}

async function main() {
  console.log('\n🌌 Verifying Nebula Protocol Compliance...\n');
  
  const complianceErrors = verifyStructure();
  
  // Check Central KG
  console.log('🧠 Checking Central Knowledge Graph Connection...');
  const kgConnected = await checkCentralKGConnection();
  
  if (!kgConnected) {
    complianceErrors.push('❌ Central Knowledge Graph unreachable (Required for compliance)');
    console.log('   -> Ensure Docker containers are running (docker-compose up -d)');
  } else {
    console.log('✅ Central Knowledge Graph connected');
  }

  if (complianceErrors.length > 0) {
    console.error('\n⚠️  PROTOCOL VIOLATIONS FOUND:');
    complianceErrors.forEach(e => console.error(e));
    console.error('\n🚫 Compliance verification FAILED. Please fix violations immediately.\n');
    process.exit(1);
  } else {
    console.log('\n✅ Protocol Compliance Verified. All systems nominal.\n');
    process.exit(0);
  }
}

main();

