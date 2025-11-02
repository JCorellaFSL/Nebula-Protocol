#!/usr/bin/env node

/**
 * Nebula Framework - Constellation Analyzer
 * 
 * Analyzes constellation complexity and recommends structural improvements:
 * - Token count analysis
 * - Task complexity assessment
 * - Star System expansion recommendations
 * - Consolidation opportunities
 * 
 * Usage: node constellation-analyzer.js [constellation-file.md]
 */

import fs from 'fs';
import path from 'path';

// Token estimation (rough): ~4 characters per token
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Count tasks in constellation
function countTasks(content) {
  // Look for task markers: - [ ], numbered lists, ## headers
  const taskMarkers = [
    /^- \[ \]/gm,           // Checkbox tasks
    /^\d+\.\s/gm,           // Numbered lists
    /^#{2,3}\s[^#]/gm       // H2/H3 headers as tasks
  ];
  
  let totalTasks = 0;
  taskMarkers.forEach(marker => {
    const matches = content.match(marker);
    if (matches) totalTasks += matches.length;
  });
  
  return totalTasks;
}

// Extract sections
function extractSections(content) {
  const sections = {};
  const sectionRegex = /^##\s+(.+)$/gm;
  let match;
  const sectionNames = [];
  
  while ((match = sectionRegex.exec(content)) !== null) {
    sectionNames.push(match[1]);
  }
  
  return sectionNames;
}

// Analyze constellation complexity
function analyzeConstellation(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // Extract constellation info
  const constellationMatch = fileName.match(/CONSTELLATION_(\d+)_([A-Z_]+)\.md/i);
  const starSystemMatch = fileName.match(/STAR_SYSTEM_(\d+\.\d+)_([A-Z_]+)\.md/i);
  
  let type, number, name;
  if (constellationMatch) {
    type = 'Constellation';
    number = constellationMatch[1];
    name = constellationMatch[2];
  } else if (starSystemMatch) {
    type = 'Star System';
    number = starSystemMatch[1];
    name = starSystemMatch[2];
  } else {
    console.warn(`⚠️  File doesn't match expected naming: ${fileName}`);
    type = 'Unknown';
    number = '?';
    name = fileName.replace('.md', '');
  }
  
  // Metrics
  const tokens = estimateTokens(content);
  const tasks = countTasks(content);
  const sections = extractSections(content);
  const lines = content.split('\n').length;
  
  // Complexity assessment
  let complexity = 'simple';
  let issues = [];
  let recommendations = [];
  
  // Token threshold
  if (tokens > 4000) {
    complexity = 'complex';
    issues.push(`Token count ${tokens} exceeds recommended 4000`);
    recommendations.push('Consider splitting into Star Systems');
  } else if (tokens > 3000) {
    complexity = 'moderate';
    issues.push(`Token count ${tokens} approaching limit`);
  }
  
  // Task threshold
  if (tasks > 10) {
    if (complexity === 'simple') complexity = 'moderate';
    issues.push(`Task count ${tasks} exceeds recommended 8-10`);
    recommendations.push('Break down into smaller, focused tasks');
  } else if (tasks > 15) {
    complexity = 'complex';
    recommendations.push('Split into multiple Star Systems by feature area');
  }
  
  // Scope assessment (rough heuristic)
  const codeBlocks = (content.match(/```/g) || []).length / 2;
  if (codeBlocks > 5) {
    if (complexity === 'simple') complexity = 'moderate';
    issues.push(`High code block count (${codeBlocks}) suggests implementation details`);
    recommendations.push('Move detailed implementation to separate documents');
  }
  
  // Star System opportunities
  const potentialStarSystems = [];
  if (type === 'Constellation' && complexity !== 'simple') {
    // Look for major sections that could become Star Systems
    sections.forEach(section => {
      const sectionContent = extractSectionContent(content, section);
      const sectionTokens = estimateTokens(sectionContent);
      const sectionTasks = countTasks(sectionContent);
      
      if (sectionTokens > 500 || sectionTasks > 3) {
        potentialStarSystems.push({
          section,
          tokens: sectionTokens,
          tasks: sectionTasks,
          suggested: `STAR_SYSTEM_${number}.${potentialStarSystems.length + 1}_${toSlug(section).toUpperCase()}.md`
        });
      }
    });
  }
  
  return {
    file: fileName,
    type,
    number,
    name,
    metrics: {
      tokens,
      tasks,
      sections: sections.length,
      lines,
      codeBlocks
    },
    complexity,
    issues,
    recommendations,
    potentialStarSystems
  };
}

// Extract content of a specific section
function extractSectionContent(content, sectionName) {
  const regex = new RegExp(`^##\\s+${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'gm');
  const match = regex.exec(content);
  
  if (!match) return '';
  
  const startIndex = match.index + match[0].length;
  const nextSectionRegex = /^##\s+/gm;
  nextSectionRegex.lastIndex = startIndex;
  const nextMatch = nextSectionRegex.exec(content);
  
  if (nextMatch) {
    return content.substring(startIndex, nextMatch.index);
  } else {
    return content.substring(startIndex);
  }
}

// Convert to slug
function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Format output
function printAnalysis(analysis) {
  console.log('\n🌌 Nebula Framework - Constellation Analysis\n');
  console.log(`📄 File: ${analysis.file}`);
  console.log(`📊 Type: ${analysis.type} ${analysis.number} - ${analysis.name}\n`);
  
  console.log('📈 Metrics:');
  console.log(`   Tokens: ${analysis.metrics.tokens} / 4000 (${((analysis.metrics.tokens / 4000) * 100).toFixed(1)}%)`);
  console.log(`   Tasks: ${analysis.metrics.tasks} (recommended: 8-10)`);
  console.log(`   Sections: ${analysis.metrics.sections}`);
  console.log(`   Lines: ${analysis.metrics.lines}`);
  console.log(`   Code Blocks: ${analysis.metrics.codeBlocks}\n`);
  
  console.log(`🎯 Complexity: ${analysis.complexity.toUpperCase()}`);
  
  if (analysis.complexity === 'simple') {
    console.log(`   ✅ Good structure - no changes needed\n`);
  } else if (analysis.complexity === 'moderate') {
    console.log(`   ⚠️  Approaching complexity limits\n`);
  } else {
    console.log(`   ❌ Exceeds recommended complexity\n`);
  }
  
  if (analysis.issues.length > 0) {
    console.log('⚠️  Issues Detected:');
    analysis.issues.forEach(issue => console.log(`   - ${issue}`));
    console.log();
  }
  
  if (analysis.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    analysis.recommendations.forEach(rec => console.log(`   - ${rec}`));
    console.log();
  }
  
  if (analysis.potentialStarSystems.length > 0) {
    console.log('🪐 Potential Star System Expansions:');
    analysis.potentialStarSystems.forEach((ss, index) => {
      console.log(`\n   ${index + 1}. Section: "${ss.section}"`);
      console.log(`      Tokens: ${ss.tokens}, Tasks: ${ss.tasks}`);
      console.log(`      Suggested file: ${ss.suggested}`);
    });
    console.log();
  }
  
  // Final verdict
  if (analysis.complexity === 'complex') {
    console.log('🔴 ACTION REQUIRED: This constellation should be split into Star Systems\n');
  } else if (analysis.complexity === 'moderate') {
    console.log('🟡 WATCH: Monitor this constellation as it grows\n');
  } else {
    console.log('🟢 HEALTHY: Constellation is well-structured\n');
  }
}

// Analyze multiple files (directory scan)
function analyzeDirectory(dirPath) {
  const files = fs.readdirSync(dirPath)
    .filter(f => f.match(/CONSTELLATION_\d+_[A-Z_]+\.md/i) || f.match(/STAR_SYSTEM_\d+\.\d+_[A-Z_]+\.md/i));
  
  if (files.length === 0) {
    console.log('❌ No constellation or star system files found in directory');
    return;
  }
  
  console.log(`\n📊 Analyzing ${files.length} files in ${dirPath}...\n`);
  
  const analyses = files.map(f => analyzeConstellation(path.join(dirPath, f)));
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    SUMMARY REPORT');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const totalConstellations = analyses.filter(a => a.type === 'Constellation').length;
  const totalStarSystems = analyses.filter(a => a.type === 'Star System').length;
  const complexFiles = analyses.filter(a => a.complexity === 'complex').length;
  const moderateFiles = analyses.filter(a => a.complexity === 'moderate').length;
  
  console.log(`📁 Total Files: ${analyses.length}`);
  console.log(`   ⭐ Constellations: ${totalConstellations}`);
  console.log(`   🪐 Star Systems: ${totalStarSystems}\n`);
  
  console.log(`🎯 Complexity Distribution:`);
  console.log(`   🔴 Complex: ${complexFiles} files need splitting`);
  console.log(`   🟡 Moderate: ${moderateFiles} files approaching limits`);
  console.log(`   🟢 Simple: ${analyses.length - complexFiles - moderateFiles} files healthy\n`);
  
  if (complexFiles > 0) {
    console.log('🚨 Files Requiring Immediate Action:');
    analyses
      .filter(a => a.complexity === 'complex')
      .forEach(a => console.log(`   - ${a.file} (${a.metrics.tokens} tokens, ${a.metrics.tasks} tasks)`));
    console.log();
  }
  
  if (moderateFiles > 0) {
    console.log('⚠️  Files to Monitor:');
    analyses
      .filter(a => a.complexity === 'moderate')
      .forEach(a => console.log(`   - ${a.file} (${a.metrics.tokens} tokens, ${a.metrics.tasks} tasks)`));
    console.log();
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node constellation-analyzer.js <file-or-directory>');
  console.log('\nExamples:');
  console.log('  node constellation-analyzer.js CONSTELLATION_1_CORE.md');
  console.log('  node constellation-analyzer.js ./project-dir');
  process.exit(1);
}

const target = args[0];

if (!fs.existsSync(target)) {
  console.error(`❌ Path not found: ${target}`);
  process.exit(1);
}

const stats = fs.statSync(target);

if (stats.isDirectory()) {
  analyzeDirectory(target);
} else if (stats.isFile()) {
  const analysis = analyzeConstellation(target);
  printAnalysis(analysis);
} else {
  console.error(`❌ Invalid target: ${target}`);
  process.exit(1);
}

