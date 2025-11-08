/**
 * Retroactive error logging for Project 1 Setup phase
 * 
 * This logs the errors encountered during Constellation 0 implementation
 * so they can be learned from and help future projects via Central KG.
 */

import { ProjectMemory } from './project-memory.js';

const pm = new ProjectMemory('../..', 'todo-list-cli', 'python');

console.log('📝 Logging setup errors to Project Memory...\n');

// Error 1: Unicode Encoding in Windows
const error1Result = pm.logError({
  level: 'ERROR',
  phase: 'Constellation 0: Setup',
  constellation: 'Environment',
  filePath: 'verify_env.py',
  lineNumber: 46,
  errorCode: 'UnicodeEncodeError',
  message: 'charmap codec cannot encode character \\U0001f50d (magnifying glass emoji) in position 0: character maps to undefined',
  stackTrace: `File "verify_env.py", line 46, in main
    print("🔍 Verifying Development Environment...")
UnicodeEncodeError: 'charmap' codec can't encode character '\\U0001f50d' in position 0: character maps to <undefined>`,
  context: 'Windows PowerShell console uses cp1252 encoding by default which cannot display unicode emoji characters. Python print() fails when attempting to output emoji to Windows console.'
});

console.log(`✓ Logged Error 1: Unicode Encoding (ID: ${error1Result.errorId})`);

// Solution 1
pm.recordSolution({
  errorId: error1Result.errorId,
  solution: 'Replace emoji characters with ASCII equivalents for Windows console compatibility',
  codeChanges: `Changed unicode emojis to ASCII markers:
- "🔍" → "Verifying"  
- "✅" → "[OK]"
- "❌" → "[FAIL]"
- "✅" → "[SUCCESS]"
- "❌" → "[ERROR]"`,
  appliedBy: 'ai',
  effectiveness: 5,
  notes: 'Immediate fix. All environment checks now pass on Windows. Alternative would be to set PYTHONIOENCODING=utf-8 env var but ASCII is more portable.'
});

console.log('✓ Recorded Solution 1\n');

// Error 2: PowerShell mkdir syntax
const error2Result = pm.logError({
  level: 'ERROR',
  phase: 'Constellation 0: Setup',
  constellation: 'Structure',
  filePath: 'N/A',
  lineNumber: 0,
  errorCode: 'PowerShell_ParameterBinding',
  message: 'mkdir -p does not accept multiple positional parameters in PowerShell',
  stackTrace: `mkdir : A positional parameter cannot be found that accepts argument 'tests'.
At line:1 char:1
+ mkdir -p src/todo tests docs
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidArgument: (:) [mkdir], ParameterBindingException`,
  context: 'PowerShell mkdir command (alias for New-Item) has different syntax than bash mkdir. Cannot accept multiple directory paths in one command like "mkdir -p dir1 dir2 dir3".'
});

console.log(`✓ Logged Error 2: PowerShell mkdir (ID: ${error2Result.errorId})`);

// Solution 2
pm.recordSolution({
  errorId: error2Result.errorId,
  solution: 'Use separate mkdir commands, New-Item cmdlet, or implicit directory creation via file writes',
  codeChanges: `Workaround: Created files directly which auto-created parent directories
Alternative 1: mkdir src/todo; mkdir tests; mkdir docs
Alternative 2: New-Item -ItemType Directory -Path src/todo,tests,docs -Force`,
  appliedBy: 'ai',
  effectiveness: 4,
  notes: 'Workaround successful but less elegant than bash "mkdir -p dir1 dir2 dir3". File-based creation worked because Python/Node create parent dirs automatically.'
});

console.log('✓ Recorded Solution 2\n');

// Error 3: PowerShell git commit multiline message
const error3Result = pm.logError({
  level: 'ERROR',
  phase: 'Constellation 0: Setup',
  constellation: 'Structure',
  filePath: 'N/A',
  lineNumber: 0,
  errorCode: 'PowerShell_ParseError',
  message: 'PowerShell cannot parse multiline git commit messages using backtick-n escape sequence',
  stackTrace: `ParserError: The token is not a valid statement separator in this version.
At line:1 char:58
+ git commit -m "title\`nline2\`nline3"
+                                      ~~`,
  context: 'PowerShell does not properly expand backtick-n escape sequences inside double-quoted strings passed to external commands like git. The backtick-n is passed literally to git instead of being converted to newlines.'
});

console.log(`✓ Logged Error 3: PowerShell git commit (ID: ${error3Result.errorId})`);

// Solution 3
pm.recordSolution({
  errorId: error3Result.errorId,
  solution: 'Use multiple -m flags for multiline git commit messages (cross-platform solution)',
  codeChanges: `Instead of:
  git commit -m "title\`nline2\`nline3"

Use:
  git commit -m "title" -m "line2" -m "line3"

Each -m flag creates a new paragraph in the commit message.`,
  appliedBy: 'ai',
  effectiveness: 5,
  notes: 'Clean, cross-platform solution. Works identically in PowerShell, CMD, bash, zsh. Git properly formats multiple -m flags as separate paragraphs.'
});

console.log('✓ Recorded Solution 3\n');

// Display final statistics
const stats = pm.getStatistics();
console.log('📊 Project Memory Statistics:');
console.log(JSON.stringify(stats, null, 2));

pm.close();
console.log('\n✅ All setup errors logged successfully!');
console.log('💡 These will now sync to Central KG to help future Python projects.');

