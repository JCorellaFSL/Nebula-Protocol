#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function checkProtocolAdherence() {
    console.log(`${GREEN}🛡️  Nebula Protocol Verification Sequence Initiated...${RESET}`);
    
    const cwd = process.cwd();
    let violations = 0;
    let warnings = 0;

    // 1. Roadmap Existence
    if (!fs.existsSync(path.join(cwd, 'ROADMAP.md'))) {
        console.error(`${RED}❌ FATAL: ROADMAP.md not found in project root!${RESET}`);
        console.error(`   The Roadmap is the central anchor of the Nebula Protocol.`);
        process.exit(1);
    }
    const roadmap = fs.readFileSync(path.join(cwd, 'ROADMAP.md'), 'utf8');

    // 2. Constellation & Star System Hierarchy Check
    console.log(`\n${YELLOW}running_hierarchy_check...${RESET}`);
    
    const files = fs.readdirSync(cwd);
    const starSystems = files.filter(f => f.startsWith('STAR_SYSTEM_') && f.endsWith('.md'));
    
    if (starSystems.length === 0) {
        console.warn(`${YELLOW}⚠️  No Star Systems found. Is this a new project?${RESET}`);
    }

    starSystems.forEach(sysFile => {
        // Pattern: STAR_SYSTEM_([Major].[Minor])_...
        // We need to handle STAR_SYSTEM_1.1_... matching to CONSTELLATION_1_...
        const match = sysFile.match(/STAR_SYSTEM_(\d+(\.\d+)?)\./);
        
        if (!match) {
            console.warn(`${YELLOW}⚠️  Skipping malformed filename: ${sysFile}${RESET}`);
            return;
        }

        const sysId = match[1]; 
        // Extract Major version (e.g., "1.1" -> "1") for Constellation mapping
        const constId = sysId.split('.')[0];

        // Regex to find the parent Constellation file
        // Must match CONSTELLATION_1_... or ROADMAP_PHASE_1_... (legacy)
        const constPattern = new RegExp(`(CONSTELLATION|ROADMAP_PHASE)_${constId}_.*\\.md`);
        const constFile = files.find(f => constPattern.test(f));

        if (!constFile) {
            console.error(`${RED}❌ VIOLATION: Orphaned Star System${RESET}`);
            console.error(`   File: ${sysFile}`);
            console.error(`   Error: No parent CONSTELLATION_${constId}_*.md found.`);
            console.error(`   Rule: Every Star System must belong to a defined Constellation.`);
            violations++;
        } else {
            // Verify the Star System is actually linked/referenced in the Roadmap
            // (Strictly speaking it should be in the Constellation file, but checking Roadmap is a good proxy for high-level visibility)
            
            // Check if Constellation is in Roadmap
            if (!roadmap.includes(constFile)) {
                 console.error(`${RED}❌ VIOLATION: Hidden Constellation${RESET}`);
                 console.error(`   File: ${constFile}`);
                 console.error(`   Error: Not referenced in ROADMAP.md`);
                 violations++;
            } else {
                // Optional: Check if Star System is referenced in Constellation file
                const constContent = fs.readFileSync(path.join(cwd, constFile), 'utf8');
                if (!constContent.includes(sysFile)) {
                    console.warn(`${YELLOW}⚠️  Warning: ${sysFile} not explicitly linked in ${constFile}${RESET}`);
                    warnings++;
                } else {
                    console.log(`✅ Verified: ${sysFile} -> ${constFile}`);
                }
            }
        }
    });

    // 3. Check for Safeguard Scripts
    // Future expansion: Ensure verification scripts are present or installed

    console.log(`\n${YELLOW}verification_summary:${RESET}`);
    if (violations > 0) {
        console.error(`${RED}🛑 Verification FAILED: ${violations} critical violations found.${RESET}`);
        console.error(`${RED}   The Nebula Protocol requires strict adherence to the Cosmic Hierarchy.${RESET}`);
        process.exit(1);
    } else {
        console.log(`${GREEN}✨ Verification PASSED.${RESET}`);
        if (warnings > 0) console.log(`${YELLOW}   (${warnings} non-critical warnings)${RESET}`);
        console.log(`${GREEN}   Protocol integrity maintained.${RESET}`);
    }
}

checkProtocolAdherence();

