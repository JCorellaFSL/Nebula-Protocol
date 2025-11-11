/**
 * Dart/Flutter Bridge for Nebula Local KG
 *
 * Provides a Dart interface to interact with the Python-based Local Knowledge Graph.
 *
 * Usage:
 *   import 'package:nebula_kg/local_kg_bridge.dart';
 *   
 *   final kg = LocalKGBridge();
 *   final patternId = await kg.captureError(
 *     signature: 'RangeError: Index out of range',
 *     category: 'RangeError',
 *     language: 'dart',
 *     severity: 'high',
 *   );
 */

import 'dart:async';
import 'dart:convert';
import 'dart:io';

class NebulaConfig {
  final String? language;
  final String? framework;
  final String? localKgDb;
  final String? centralKgUrl;
  final String? pythonCommand;
  final bool? autoSync;

  NebulaConfig({
    this.language,
    this.framework,
    this.localKgDb,
    this.centralKgUrl,
    this.pythonCommand,
    this.autoSync,
  });

  factory NebulaConfig.fromJson(Map<String, dynamic> json) {
    return NebulaConfig(
      language: json['language'] as String?,
      framework: json['framework'] as String?,
      localKgDb: json['local_kg_db'] as String?,
      centralKgUrl: json['central_kg_url'] as String?,
      pythonCommand: json['python_command'] as String?,
      autoSync: json['auto_sync'] as bool?,
    );
  }
}

class ErrorPattern {
  final String id;
  final String errorSignature;
  final String errorCategory;
  final String language;
  final String severity;
  final String? description;
  final int occurrenceCount;
  final String firstSeen;
  final String lastSeen;
  final int solutionCount;

  ErrorPattern({
    required this.id,
    required this.errorSignature,
    required this.errorCategory,
    required this.language,
    required this.severity,
    this.description,
    required this.occurrenceCount,
    required this.firstSeen,
    required this.lastSeen,
    required this.solutionCount,
  });

  factory ErrorPattern.fromJson(Map<String, dynamic> json) {
    return ErrorPattern(
      id: json['id'] as String,
      errorSignature: json['error_signature'] as String,
      errorCategory: json['error_category'] as String,
      language: json['language'] as String,
      severity: json['severity'] as String,
      description: json['description'] as String?,
      occurrenceCount: json['occurrence_count'] as int,
      firstSeen: json['first_seen'] as String,
      lastSeen: json['last_seen'] as String,
      solutionCount: json['solution_count'] as int,
    );
  }
}

class LocalKGException implements Exception {
  final String message;
  LocalKGException(this.message);

  @override
  String toString() => 'LocalKGException: $message';
}

class LocalKGBridge {
  late final NebulaConfig config;
  late final String dbPath;
  late final String pythonCommand;
  static LocalKGBridge? _instance;

  /// Create a new bridge instance
  LocalKGBridge({String? dbPath}) {
    config = _loadConfig();
    this.dbPath = dbPath ?? config.localKgDb ?? 'local_kg/nebula_protocol_local.db';
    pythonCommand = config.pythonCommand ?? 'python';
  }

  /// Load configuration from .nebula/config.json or environment variables
  static NebulaConfig _loadConfig() {
    // Priority 1: .nebula/config.json
    final configFile = File('.nebula/config.json');
    if (configFile.existsSync()) {
      try {
        final jsonString = configFile.readAsStringSync();
        final json = jsonDecode(jsonString) as Map<String, dynamic>;
        return NebulaConfig.fromJson(json);
      } catch (e) {
        // Fall through to environment variables
      }
    }

    // Priority 2: Environment variables
    final language = Platform.environment['NEBULA_LANGUAGE'];
    if (language != null) {
      return NebulaConfig(
        language: language,
        localKgDb: Platform.environment['NEBULA_LOCAL_KG_DB'] ?? 'local_kg/project_local.db',
        pythonCommand: Platform.environment['PYTHON_CMD'] ?? 'python',
      );
    }

    // Priority 3: Defaults
    return NebulaConfig(
      language: 'dart',
      localKgDb: 'local_kg/nebula_protocol_local.db',
      pythonCommand: 'python',
    );
  }

  /// Capture an error pattern to the local KG
  Future<String> captureError({
    required String signature,
    String category = 'Error',
    String language = 'dart',
    String severity = 'medium',
    String? description,
  }) async {
    final descValue = description != null ? "'${_escapePython(description)}'" : 'None';

    final pythonCode = '''
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('$dbPath')
pattern_id = kg.capture_error(
    error_signature='${_escapePython(signature)}',
    error_category='${_escapePython(category)}',
    language='${_escapePython(language)}',
    description=$descValue,
    severity='${_escapePython(severity)}'
)
print(pattern_id)
''';

    return await _runPython(pythonCode);
  }

  /// Capture an error from a Dart Exception
  Future<String> captureErrorFromException(
    Object error, {
    StackTrace? stackTrace,
    String language = 'dart',
    String severity = 'medium',
  }) async {
    final stackString = stackTrace?.toString().substring(0, 500) ?? '';
    return await captureError(
      signature: error.toString(),
      category: error.runtimeType.toString(),
      language: language,
      severity: severity,
      description: stackString,
    );
  }

  /// Search for similar error patterns
  Future<List<ErrorPattern>> searchPatterns(String query, {int limit = 5}) async {
    final pythonCode = '''
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('$dbPath')
patterns = kg.search_patterns('${_escapePython(query)}', $limit)
print(json.dumps(patterns, default=str))
''';

    final result = await _runPython(pythonCode);
    final List<dynamic> jsonList = jsonDecode(result) as List<dynamic>;
    return jsonList.map((json) => ErrorPattern.fromJson(json as Map<String, dynamic>)).toList();
  }

  /// Add a solution to an existing pattern
  Future<String> addSolution({
    required String patternId,
    required String solutionText,
    String effectiveness = 'worked',
  }) async {
    final pythonCode = '''
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('$dbPath')
solution_id = kg.add_solution(
    pattern_id='${_escapePython(patternId)}',
    solution_text='${_escapePython(solutionText)}',
    effectiveness='${_escapePython(effectiveness)}'
)
print(solution_id)
''';

    return await _runPython(pythonCode);
  }

  /// Get summary statistics
  Future<Map<String, dynamic>> getSummary() async {
    final pythonCode = '''
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('$dbPath')
summary = kg.get_pattern_summary()
print(json.dumps(summary, default=str))
''';

    final result = await _runPython(pythonCode);
    return jsonDecode(result) as Map<String, dynamic>;
  }

  /// Fire-and-forget error capture (non-blocking)
  void captureErrorAsync({
    required String signature,
    String category = 'Error',
    String language = 'dart',
    String severity = 'medium',
  }) {
    captureError(
      signature: signature,
      category: category,
      language: language,
      severity: severity,
    ).catchError((error) {
      print('[LocalKG] Failed to capture error: $error');
    });
  }

  /// Escape string for Python code
  String _escapePython(String str) {
    return str
        .replaceAll('\\', '\\\\')
        .replaceAll("'", "\\'")
        .replaceAll('\n', '\\n');
  }

  /// Run Python code and return stdout
  Future<String> _runPython(String code) async {
    final result = await Process.run(
      pythonCommand,
      ['-c', code],
      workingDirectory: '.',
    );

    if (result.exitCode != 0) {
      throw LocalKGException(
        'Python process failed (exit ${result.exitCode}): ${result.stderr}',
      );
    }

    return (result.stdout as String).trim();
  }

  /// Get global singleton instance
  static LocalKGBridge getInstance({String? dbPath}) {
    if (_instance == null || dbPath != null) {
      _instance = LocalKGBridge(dbPath: dbPath);
    }
    return _instance!;
  }
}

// Example usage
void main() async {
  final kg = LocalKGBridge.getInstance();

  try {
    // Capture an error
    final patternId = await kg.captureError(
      signature: 'RangeError: Index out of range: 5',
      category: 'RangeError',
      language: 'dart',
      severity: 'high',
    );
    print('Captured error: $patternId');

    // Search for patterns
    final patterns = await kg.searchPatterns('RangeError', limit: 5);
    print('Found ${patterns.length} patterns');
  } catch (e) {
    print('Error: $e');
  }
}

