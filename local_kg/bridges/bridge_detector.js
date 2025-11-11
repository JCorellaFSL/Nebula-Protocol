/**
 * Bridge Auto-Detection Module
 * 
 * Automatically detects project language and copies appropriate bridge.
 * Used by init-nebula-project.js during project initialization.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Language detection patterns
 */
const LANGUAGE_PATTERNS = {
  rust: {
    files: ['Cargo.toml', 'Cargo.lock'],
    bridge: 'bridge_rust.rs',
    targetPath: (projectRoot) => path.join(projectRoot, 'src', 'local_kg_bridge.rs'),
    priority: 1
  },
  python: {
    files: ['requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile'],
    bridge: 'bridge_python.py',
    targetPath: (projectRoot) => path.join(projectRoot, 'local_kg_bridge.py'),
    priority: 1,
    note: 'Python can use local_kg directly - bridge is optional'
  },
  javascript: {
    files: ['package.json'],
    bridge: 'bridge_javascript.js',
    targetPath: (projectRoot) => path.join(projectRoot, 'local_kg_bridge.js'),
    priority: 2,
    check: (projectRoot) => {
      const pkgPath = path.join(projectRoot, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        return !pkg.dependencies?.typescript && !pkg.devDependencies?.typescript;
      }
      return false;
    }
  },
  typescript: {
    files: ['tsconfig.json'],
    bridge: 'bridge_typescript.ts',
    targetPath: (projectRoot) => path.join(projectRoot, 'local_kg_bridge.ts'),
    priority: 1,
    check: (projectRoot) => {
      // TypeScript takes priority if both package.json and tsconfig.json exist
      return fs.existsSync(path.join(projectRoot, 'tsconfig.json'));
    }
  },
  java: {
    files: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
    bridge: 'bridge_java.java',
    targetPath: (projectRoot) => path.join(projectRoot, 'src', 'main', 'java', 'com', 'nebula', 'kg', 'LocalKGBridge.java'),
    priority: 1
  },
  csharp: {
    files: ['.csproj', '.sln', '.fsproj'],
    bridge: 'bridge_csharp.cs',
    targetPath: (projectRoot) => path.join(projectRoot, 'NebulaKG', 'LocalKGBridge.cs'),
    priority: 1,
    check: (projectRoot) => {
      // Check for any .csproj file
      const files = fs.readdirSync(projectRoot);
      return files.some(f => f.endsWith('.csproj'));
    }
  },
  go: {
    files: ['go.mod', 'go.sum'],
    bridge: 'bridge_go.go',
    targetPath: (projectRoot) => path.join(projectRoot, 'local_kg', 'bridge.go'),
    priority: 1
  },
  php: {
    files: ['composer.json', 'composer.lock'],
    bridge: 'bridge_php.php',
    targetPath: (projectRoot) => path.join(projectRoot, 'local_kg_bridge.php'),
    priority: 1
  },
  swift: {
    files: ['Package.swift', '.xcodeproj'],
    bridge: 'bridge_swift.swift',
    targetPath: (projectRoot) => path.join(projectRoot, 'Sources', 'NebulaKG', 'LocalKGBridge.swift'),
    priority: 1,
    check: (projectRoot) => {
      const files = fs.readdirSync(projectRoot);
      return files.some(f => f.endsWith('.xcodeproj') || f === 'Package.swift');
    }
  },
  kotlin: {
    files: ['build.gradle.kts', 'settings.gradle.kts'],
    bridge: 'bridge_kotlin.kt',
    targetPath: (projectRoot) => path.join(projectRoot, 'src', 'main', 'kotlin', 'com', 'nebula', 'kg', 'LocalKGBridge.kt'),
    priority: 2,
    check: (projectRoot) => {
      // Kotlin takes priority if build.gradle.kts exists
      return fs.existsSync(path.join(projectRoot, 'build.gradle.kts'));
    }
  },
  dart: {
    files: ['pubspec.yaml', 'pubspec.lock'],
    bridge: 'bridge_dart.dart',
    targetPath: (projectRoot) => path.join(projectRoot, 'lib', 'local_kg_bridge.dart'),
    priority: 1
  },
  flutter: {
    files: ['pubspec.yaml'],
    bridge: 'bridge_dart.dart', // Flutter uses Dart bridge
    targetPath: (projectRoot) => path.join(projectRoot, 'lib', 'local_kg_bridge.dart'),
    priority: 2, // Lower priority than dart, but check for Flutter keywords
    check: (projectRoot) => {
      const pubspecPath = path.join(projectRoot, 'pubspec.yaml');
      if (fs.existsSync(pubspecPath)) {
        const content = fs.readFileSync(pubspecPath, 'utf8');
        return content.includes('flutter:');
      }
      return false;
    }
  }
};

/**
 * Detect project language based on files
 */
export function detectLanguage(projectRoot = process.cwd()) {
  const detectedLanguages = [];

  for (const [language, config] of Object.entries(LANGUAGE_PATTERNS)) {
    // Check file patterns
    const hasLanguageFiles = config.files.some(file => {
      if (file.startsWith('.')) {
        // For extensions like .csproj, check if any file has that extension
        const files = fs.readdirSync(projectRoot);
        return files.some(f => f.endsWith(file));
      }
      return fs.existsSync(path.join(projectRoot, file));
    });

    if (hasLanguageFiles) {
      // Run custom check if provided
      if (config.check) {
        if (config.check(projectRoot)) {
          detectedLanguages.push({ language, config, priority: config.priority });
        }
      } else {
        detectedLanguages.push({ language, config, priority: config.priority });
      }
    }
  }

  // Sort by priority (lower number = higher priority)
  detectedLanguages.sort((a, b) => a.priority - b.priority);

  return detectedLanguages.length > 0 ? detectedLanguages[0].language : 'generic';
}

/**
 * Copy appropriate bridge file to project
 */
export function installBridge(language, projectRoot = process.cwd()) {
  const config = LANGUAGE_PATTERNS[language];

  if (!config) {
    console.log(`⚠️  No bridge available for language: ${language}`);
    return false;
  }

  if (config.note) {
    console.log(`ℹ️  ${config.note}`);
  }

  const sourceBridge = path.join(__dirname, config.bridge);
  const targetPath = config.targetPath(projectRoot);

  if (!fs.existsSync(sourceBridge)) {
    console.log(`❌ Bridge file not found: ${config.bridge}`);
    return false;
  }

  // Create target directory if it doesn't exist
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy bridge file
  try {
    fs.copyFileSync(sourceBridge, targetPath);
    console.log(`✅ Installed ${language} bridge: ${path.relative(projectRoot, targetPath)}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to install bridge: ${error.message}`);
    return false;
  }
}

/**
 * Get bridge installation instructions for a language
 */
export function getBridgeInstructions(language) {
  const config = LANGUAGE_PATTERNS[language];

  if (!config) {
    return 'No specific instructions available.';
  }

  const instructions = {
    rust: `
Add to Cargo.toml:
[dependencies]
tokio = { version = "1", features = ["process", "rt"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
`,
    javascript: `
Add to package.json:
{
  "type": "module"
}

Usage:
import { LocalKGBridge } from './local_kg_bridge.js';
const kg = new LocalKGBridge();
`,
    typescript: `
Ensure tsconfig.json has:
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node"
  }
}

Usage:
import { LocalKGBridge } from './local_kg_bridge';
const kg = new LocalKGBridge();
`,
    java: `
Add to pom.xml (Maven):
<dependency>
  <groupId>com.google.code.gson</groupId>
  <artifactId>gson</artifactId>
  <version>2.10.1</version>
</dependency>

Or build.gradle (Gradle):
implementation 'com.google.code.gson:gson:2.10.1'
`,
    csharp: `
Add to .csproj:
<ItemGroup>
  <PackageReference Include="System.Text.Json" Version="8.0.0" />
</ItemGroup>

Usage:
using Nebula.KG;
var kg = new LocalKGBridge();
`,
    go: `
No additional dependencies required.

Usage:
import "your-project/local_kg/bridges"
kg, err := bridges.NewLocalKGBridge("")
`,
    php: `
No additional dependencies required (JSON is built-in).

Usage:
require_once 'local_kg_bridge.php';
$kg = new LocalKGBridge();
`,
    swift: `
No additional dependencies required.

Usage:
import NebulaKG
let kg = try LocalKGBridge.shared()
`,
    kotlin: `
Add to build.gradle.kts:
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
}

Usage:
import com.nebula.kg.LocalKGBridge
val kg = LocalKGBridge.getInstance()
`,
    dart: `
No additional dependencies required (dart:convert is built-in).

Usage:
import 'package:your_project/local_kg_bridge.dart';
final kg = LocalKGBridge.getInstance();
`,
    flutter: `
No additional dependencies required (dart:convert is built-in).

Usage:
import 'package:your_project/local_kg_bridge.dart';
final kg = LocalKGBridge.getInstance();
`,
    python: `
Python can use the local_kg module directly:

from local_kg.local_kg import get_local_kg
kg = get_local_kg()

Or use the bridge for consistency:
from local_kg.bridges.bridge_python import LocalKGBridge
kg = LocalKGBridge()
`
  };

  return instructions[language] || 'No specific instructions available.';
}

/**
 * Print detection report
 */
export function printDetectionReport(projectRoot = process.cwd()) {
  console.log('\n🔍 Analyzing project structure...\n');

  const language = detectLanguage(projectRoot);

  console.log(`Detected language: ${language}`);

  if (language !== 'generic') {
    const config = LANGUAGE_PATTERNS[language];
    console.log(`Bridge file: ${config.bridge}`);
    console.log(`Target location: ${config.targetPath(projectRoot)}`);

    if (config.note) {
      console.log(`Note: ${config.note}`);
    }

    console.log('\n📦 Installation Instructions:');
    console.log(getBridgeInstructions(language));
  } else {
    console.log('\n⚠️  Could not auto-detect language.');
    console.log('Please manually specify language when initializing:');
    console.log('  node init-nebula-project.js <language> <project-name>');
    console.log('\nSupported languages:');
    Object.keys(LANGUAGE_PATTERNS).forEach(lang => {
      console.log(`  - ${lang}`);
    });
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const projectRoot = process.argv[3] || process.cwd();

  switch (command) {
    case 'detect':
      printDetectionReport(projectRoot);
      break;
    case 'install':
      const language = detectLanguage(projectRoot);
      if (language !== 'generic') {
        installBridge(language, projectRoot);
      } else {
        console.log('❌ Could not detect language. Please specify manually.');
      }
      break;
    default:
      console.log('Usage:');
      console.log('  node bridge_detector.js detect [project-root]');
      console.log('  node bridge_detector.js install [project-root]');
  }
}

