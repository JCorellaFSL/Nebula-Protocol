#!/usr/bin/env node

/**
 * Nebula Framework - Enhanced Constellation Analyzer
 * 
 * Analyzes constellation/star system complexity with focus on:
 * - LLM context window optimization
 * - Cognitive load management
 * - Engineering problem decomposition
 * - Separation of concerns (overview vs. technical)
 * 
 * Designed for the two-tier documentation system:
 * - Constellations: Non-technical overview (WHAT/WHY) - should be concise
 * - Star Systems: Technical details (HOW) - can be more detailed
 * 
 * Usage: node constellation-analyzer-enhanced.js [file-or-directory]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for complexity thresholds
// Based on LLM context window optimization and cognitive load management
const CONFIG = {
  // Token limits (aligned with LLM context efficiency)
  OPTIMAL_MIN_TOKENS: 1000,    // Below this = too granular
  OPTIMAL_MAX_TOKENS: 4000,    // Above this = context overload
  CRITICAL_MAX_TOKENS: 6000,   // Hard limit - must split
  
  // Task limits (aligned with working memory constraints)
  OPTIMAL_MIN_TASKS: 3,        // Below this = consider merging
  OPTIMAL_MAX_TASKS: 8,        // Above this = cognitive overload
  CRITICAL_MAX_TASKS: 12,      // Hard limit - must split
  
  // Section limits (document structure)
  OPTIMAL_MAX_SECTIONS: 12,    // Above this = navigation difficulty
  CRITICAL_MAX_SECTIONS: 18,   // Hard limit - must reorganize
  
  // Task quality metrics
  MIN_WORDS_PER_TASK: 50,      // Below this = insufficient detail
  MAX_WORDS_PER_TASK: 500,     // Above this = task too broad
  
  // Context efficiency (what percentage of 8k context should we target?)
  TARGET_CONTEXT_USAGE: 0.5,   // Use ~50% of available context
  CONTEXT_WINDOW_SIZE: 8000,   // Assume 8k context window for planning
};

function countTokens(text) {
  // Simple token count: split by whitespace
  return text.split(/\s+/).filter(Boolean).length;
}

function analyzeConstellation(filePath) {
  if (!fs.existsSync(filePath)) {
    return `Error: File not found at ${filePath}`;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);

  let report = `\n${'='.repeat(70)}\n`;
  report += `  CONSTELLATION ANALYSIS: ${filename}\n`;
  report += `${'='.repeat(70)}\n\n`;

  // === TOKEN ANALYSIS ===
  const totalTokens = countTokens(content);
  const contextUsage = (totalTokens / CONFIG.CONTEXT_WINDOW_SIZE) * 100;
  
  report += `TOKEN ANALYSIS:\n`;
  report += `   Total Tokens: ${totalTokens}\n`;
  report += `   Context Usage: ${contextUsage.toFixed(1)}% of ${CONFIG.CONTEXT_WINDOW_SIZE} token window\n`;
  report += `   Optimal Range: ${CONFIG.OPTIMAL_MIN_TOKENS}-${CONFIG.OPTIMAL_MAX_TOKENS} tokens\n`;
  
  if (totalTokens < CONFIG.OPTIMAL_MIN_TOKENS) {
    report += `   Status: [YELLOW] TOO GRANULAR - Consider merging\n`;
  } else if (totalTokens <= CONFIG.OPTIMAL_MAX_TOKENS) {
    report += `   Status: [GREEN] OPTIMAL - Good context efficiency\n`;
  } else if (totalTokens <= CONFIG.CRITICAL_MAX_TOKENS) {
    report += `   Status: [YELLOW] LARGE - Consider splitting\n`;
  } else {
    report += `   Status: [RED] CRITICAL - MUST split\n`;
  }
  report += `\n`;

  // === TASK ANALYSIS ===
  const tasks = content.match(/^- \*\*Task [0-9\.]+\:\*\* /gm) || [];
  const estimatedTasks = tasks.length > 0 ? tasks.length : (content.match(/^- /gm) || []).length;
  
  report += `TASK ANALYSIS:\n`;
  report += `   Task Count: ${estimatedTasks}\n`;
  report += `   Optimal Range: ${CONFIG.OPTIMAL_MIN_TASKS}-${CONFIG.OPTIMAL_MAX_TASKS} tasks\n`;
  
  if (estimatedTasks < CONFIG.OPTIMAL_MIN_TASKS) {
    report += `   Status: [YELLOW] TOO FEW - Consider merging\n`;
  } else if (estimatedTasks <= CONFIG.OPTIMAL_MAX_TASKS) {
    report += `   Status: [GREEN] OPTIMAL - Manageable\n`;
  } else if (estimatedTasks <= CONFIG.CRITICAL_MAX_TASKS) {
    report += `   Status: [YELLOW] MANY - Approaching limit\n`;
  } else {
    report += `   Status: [RED] CRITICAL - Too many tasks\n`;
  }
  
  // Task quality analysis
  const avgWordsPerTask = Math.floor(countTokens(content) / estimatedTasks);
  report += `   Avg Words/Task: ~${avgWordsPerTask}\n`;
  if (avgWordsPerTask < CONFIG.MIN_WORDS_PER_TASK) {
    report += `   Quality: [YELLOW] Tasks may lack detail\n`;
  } else if (avgWordsPerTask > CONFIG.MAX_WORDS_PER_TASK) {
    report += `   Quality: [YELLOW] Tasks may be too broad\n`;
  } else {
    report += `   Quality: [GREEN] Good granularity\n`;
  }
  report += `\n`;

  // === STRUCTURE ANALYSIS ===
  const sections = content.match(/^### /gm) || [];
  const subsections = content.match(/^#### /gm) || [];
  
  report += `STRUCTURE ANALYSIS:\n`;
  report += `   Major Sections: ${sections.length}\n`;
  report += `   Subsections: ${subsections.length}\n`;
  report += `   Optimal Max: ${CONFIG.OPTIMAL_MAX_SECTIONS}\n`;
  
  if (sections.length <= CONFIG.OPTIMAL_MAX_SECTIONS) {
    report += `   Status: [GREEN] OPTIMAL - Good structure\n`;
  } else if (sections.length <= CONFIG.CRITICAL_MAX_SECTIONS) {
    report += `   Status: [YELLOW] DENSE - Many sections\n`;
  } else {
    report += `   Status: [RED] CRITICAL - Too many sections\n`;
  }
  report += `\n`;

  // === COMPLEXITY SCORE ===
  let complexityScore = 0;
  let maxScore = 0;
  
  // Token scoring (40% weight)
  maxScore += 40;
  if (totalTokens <= CONFIG.OPTIMAL_MAX_TOKENS) complexityScore += 40;
  else if (totalTokens <= CONFIG.CRITICAL_MAX_TOKENS) complexityScore += 20;
  
  // Task scoring (40% weight)
  maxScore += 40;
  if (estimatedTasks <= CONFIG.OPTIMAL_MAX_TASKS) complexityScore += 40;
  else if (estimatedTasks <= CONFIG.CRITICAL_MAX_TASKS) complexityScore += 20;
  
  // Structure scoring (20% weight)
  maxScore += 20;
  if (sections.length <= CONFIG.OPTIMAL_MAX_SECTIONS) complexityScore += 20;
  else if (sections.length <= CONFIG.CRITICAL_MAX_SECTIONS) complexityScore += 10;
  
  const complexityPercent = Math.round((complexityScore / maxScore) * 100);
  
  report += `OVERALL COMPLEXITY SCORE: ${complexityScore}/${maxScore} (${complexityPercent}%)\n`;
  if (complexityPercent >= 80) {
    report += `   Rating: [GREEN] EXCELLENT - Optimal for LLM\n`;
  } else if (complexityPercent >= 60) {
    report += `   Rating: [YELLOW] ACCEPTABLE - Usable\n`;
  } else if (complexityPercent >= 40) {
    report += `   Rating: [ORANGE] NEEDS WORK - Should refactor\n`;
  } else {
    report += `   Rating: [RED] CRITICAL - Must restructure\n`;
  }
  report += `\n`;

  // === RECOMMENDATIONS ===
  report += `${'='.repeat(70)}\n`;
  report += `RECOMMENDATIONS:\n\n`;
  
  // Detect document type
  const isConstellation = filename.includes('CONSTELLATION');
  const isStarSystem = filename.includes('STAR_SYSTEM');
  
  if (isConstellation && totalTokens > 2000) {
    report += `[YELLOW] NOTE: This is a CONSTELLATION (overview document)\n`;
    report += `Constellations should be concise (WHAT/WHY only):\n`;
    report += `  - Focus on strategic goals and success criteria\n`;
    report += `  - Avoid technical implementation details\n`;
    report += `  - Move HOW to Star System documents\n`;
    report += `  - Target: 1000-2000 tokens for readability\n\n`;
  }
  
  if (isStarSystem && totalTokens < 1500) {
    report += `[YELLOW] NOTE: This is a STAR SYSTEM (technical document)\n`;
    report += `Star Systems should provide detailed HOW guidance:\n`;
    report += `  - Include step-by-step implementation\n`;
    report += `  - Provide code examples and patterns\n`;
    report += `  - Specify technical requirements\n`;
    report += `  - Target: 2000-4000 tokens for completeness\n\n`;
  }
  
  const needsSplit = totalTokens > CONFIG.OPTIMAL_MAX_TOKENS || 
                     estimatedTasks > CONFIG.OPTIMAL_MAX_TASKS || 
                     sections.length > CONFIG.OPTIMAL_MAX_SECTIONS;
  
  const tooSmall = totalTokens < CONFIG.OPTIMAL_MIN_TOKENS || 
                   estimatedTasks < CONFIG.OPTIMAL_MIN_TASKS;

  if (needsSplit) {
    report += `[RED] ACTION REQUIRED: Split into Star Systems\n\n`;
    report += `This exceeds optimal limits for LLM context efficiency.\n`;
    report += `Breaking it down will:\n`;
    report += `  + Improve AI code generation quality\n`;
    report += `  + Reduce context switching\n`;
    report += `  + Enable parallel development\n`;
    report += `  + Make testing more focused\n\n`;
    
    report += `HOW TO SPLIT:\n`;
    const match = filename.match(/CONSTELLATION_(\d+)_/);
    const constellationNum = match ? match[1] : 'X';
    
    report += `1. Create Star System files:\n`;
    report += `   - STAR_SYSTEM_${constellationNum}.1_[COMPONENT_A].md\n`;
    report += `   - STAR_SYSTEM_${constellationNum}.2_[COMPONENT_B].md\n`;
    report += `   - STAR_SYSTEM_${constellationNum}.3_[COMPONENT_C].md\n\n`;
    
    report += `2. Target 1000-4000 tokens per Star System\n`;
    report += `3. Move 3-8 related tasks per Star System\n`;
    report += `4. Update main constellation to reference Star Systems\n\n`;
    
  } else if (tooSmall) {
    report += `[YELLOW] CONSIDERATION: May be too granular\n\n`;
    report += `This has minimal content. Consider:\n`;
    report += `  - Merging with related constellation\n`;
    report += `  - Expanding scope with additional tasks\n`;
    report += `  - Combining with similar small files\n\n`;
    report += `However, if truly discrete, small size is acceptable.\n\n`;
    
  } else {
    report += `[GREEN] OPTIMAL: No changes needed\n\n`;
    report += `This is well-sized for:\n`;
    report += `  + Efficient LLM context usage (~${contextUsage.toFixed(0)}%)\n`;
    report += `  + Manageable task count (${estimatedTasks})\n`;
    report += `  + Clear structure (${sections.length} sections)\n\n`;
    report += `Continue as-is. Re-analyze if scope expands.\n\n`;
  }

  report += `${'='.repeat(70)}\n`;
  report += `ENGINEERING PRINCIPLE:\n`;
  report += `  "Break complex problems into manageable chunks."\n`;
  report += `  More well-scoped files = Better engineering\n`;
  report += `${'='.repeat(70)}\n`;
  
  return report;
}

// Main execution
if (process.argv.length < 3) {
  console.log("Usage: node constellation-analyzer-enhanced.js <file>");
  console.log("Example: node constellation-analyzer-enhanced.js CONSTELLATION_1_CORE.md");
  process.exit(1);
}

const filePath = process.argv[2];
console.log(analyzeConstellation(filePath));

