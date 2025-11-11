/**
 * Swift Bridge for Nebula Local KG
 *
 * Provides a Swift interface to interact with the Python-based Local Knowledge Graph.
 *
 * Usage:
 *   import NebulaKG
 *   
 *   let kg = LocalKGBridge()
 *   Task {
 *       let patternId = try await kg.captureError(
 *           signature: "Fatal error: Index out of range",
 *           category: "FatalError",
 *           language: "swift",
 *           severity: "critical"
 *       )
 *   }
 */

import Foundation

public struct NebulaConfig: Codable {
    public var language: String?
    public var framework: String?
    public var localKgDb: String?
    public var centralKgUrl: String?
    public var pythonCommand: String?
    public var autoSync: Bool?
    
    enum CodingKeys: String, CodingKey {
        case language
        case framework
        case localKgDb = "local_kg_db"
        case centralKgUrl = "central_kg_url"
        case pythonCommand = "python_command"
        case autoSync = "auto_sync"
    }
}

public struct ErrorCapture {
    public var signature: String
    public var category: String
    public var language: String
    public var severity: String
    public var description: String?
    
    public init(signature: String, category: String = "Error", language: String = "swift", severity: String = "medium", description: String? = nil) {
        self.signature = signature
        self.category = category
        self.language = language
        self.severity = severity
        self.description = description
    }
}

public struct ErrorPattern: Codable {
    public var id: String
    public var errorSignature: String
    public var errorCategory: String
    public var language: String
    public var severity: String
    public var description: String?
    public var occurrenceCount: Int
    public var firstSeen: String
    public var lastSeen: String
    public var solutionCount: Int
    
    enum CodingKeys: String, CodingKey {
        case id
        case errorSignature = "error_signature"
        case errorCategory = "error_category"
        case language
        case severity
        case description
        case occurrenceCount = "occurrence_count"
        case firstSeen = "first_seen"
        case lastSeen = "last_seen"
        case solutionCount = "solution_count"
    }
}

public enum LocalKGError: Error {
    case configLoadFailed
    case pythonProcessFailed(String)
    case jsonDecodeFailed(Error)
}

public class LocalKGBridge {
    private let config: NebulaConfig
    private let dbPath: String
    private let pythonCommand: String
    private static var instance: LocalKGBridge?
    
    /// Create a new bridge instance
    public init(dbPath: String? = nil) throws {
        self.config = try Self.loadConfig()
        self.dbPath = dbPath ?? config.localKgDb ?? "local_kg/nebula_protocol_local.db"
        self.pythonCommand = config.pythonCommand ?? "python"
    }
    
    /// Load configuration from .nebula/config.json or environment variables
    private static func loadConfig() throws -> NebulaConfig {
        // Priority 1: .nebula/config.json
        let configPath = ".nebula/config.json"
        if FileManager.default.fileExists(atPath: configPath) {
            if let data = try? Data(contentsOf: URL(fileURLWithPath: configPath)),
               let config = try? JSONDecoder().decode(NebulaConfig.self, from: data) {
                return config
            }
        }
        
        // Priority 2: Environment variables
        if let language = ProcessInfo.processInfo.environment["NEBULA_LANGUAGE"] {
            return NebulaConfig(
                language: language,
                framework: nil,
                localKgDb: ProcessInfo.processInfo.environment["NEBULA_LOCAL_KG_DB"] ?? "local_kg/project_local.db",
                centralKgUrl: nil,
                pythonCommand: ProcessInfo.processInfo.environment["PYTHON_CMD"] ?? "python",
                autoSync: nil
            )
        }
        
        // Priority 3: Defaults
        return NebulaConfig(
            language: "swift",
            framework: nil,
            localKgDb: "local_kg/nebula_protocol_local.db",
            centralKgUrl: nil,
            pythonCommand: "python",
            autoSync: true
        )
    }
    
    /// Capture an error pattern to the local KG
    public func captureError(
        signature: String,
        category: String = "Error",
        language: String = "swift",
        severity: String = "medium",
        description: String? = nil
    ) async throws -> String {
        let descValue = description != nil ? "'\(escapePython(description!))'" : "None"
        
        let pythonCode = """
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('\(dbPath)')
pattern_id = kg.capture_error(
    error_signature='\(escapePython(signature))',
    error_category='\(escapePython(category))',
    language='\(escapePython(language))',
    description=\(descValue),
    severity='\(escapePython(severity))'
)
print(pattern_id)
"""
        
        return try await runPython(pythonCode)
    }
    
    /// Capture an error from a Swift Error
    public func captureErrorFromSwiftError(
        _ error: Error,
        language: String = "swift",
        severity: String = "medium"
    ) async throws -> String {
        let description = String(describing: error)
        let category = String(describing: type(of: error))
        return try await captureError(
            signature: description,
            category: category,
            language: language,
            severity: severity
        )
    }
    
    /// Search for similar error patterns
    public func searchPatterns(query: String, limit: Int = 5) async throws -> [ErrorPattern] {
        let pythonCode = """
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('\(dbPath)')
patterns = kg.search_patterns('\(escapePython(query))', \(limit))
print(json.dumps(patterns, default=str))
"""
        
        let result = try await runPython(pythonCode)
        
        guard let data = result.data(using: .utf8) else {
            throw LocalKGError.jsonDecodeFailed(NSError(domain: "LocalKG", code: -1))
        }
        
        do {
            return try JSONDecoder().decode([ErrorPattern].self, from: data)
        } catch {
            throw LocalKGError.jsonDecodeFailed(error)
        }
    }
    
    /// Add a solution to an existing pattern
    public func addSolution(
        patternId: String,
        solutionText: String,
        effectiveness: String = "worked"
    ) async throws -> String {
        let pythonCode = """
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('\(dbPath)')
solution_id = kg.add_solution(
    pattern_id='\(escapePython(patternId))',
    solution_text='\(escapePython(solutionText))',
    effectiveness='\(escapePython(effectiveness))'
)
print(solution_id)
"""
        
        return try await runPython(pythonCode)
    }
    
    /// Fire-and-forget error capture (non-blocking)
    public func captureErrorAsync(
        signature: String,
        category: String = "Error",
        language: String = "swift",
        severity: String = "medium"
    ) {
        Task {
            do {
                _ = try await captureError(
                    signature: signature,
                    category: category,
                    language: language,
                    severity: severity
                )
            } catch {
                print("[LocalKG] Failed to capture error: \(error.localizedDescription)")
            }
        }
    }
    
    /// Escape string for Python code
    private func escapePython(_ str: String) -> String {
        return str
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "'", with: "\\'")
            .replacingOccurrences(of: "\n", with: "\\n")
    }
    
    /// Run Python code and return stdout
    private func runPython(_ code: String) async throws -> String {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
        process.arguments = [pythonCommand, "-c", code]
        
        let outputPipe = Pipe()
        let errorPipe = Pipe()
        process.standardOutput = outputPipe
        process.standardError = errorPipe
        
        try process.run()
        process.waitUntilExit()
        
        let outputData = outputPipe.fileHandleForReading.readDataToEndOfFile()
        let errorData = errorPipe.fileHandleForReading.readDataToEndOfFile()
        
        if process.terminationStatus != 0 {
            let errorMessage = String(data: errorData, encoding: .utf8) ?? "Unknown error"
            throw LocalKGError.pythonProcessFailed(errorMessage)
        }
        
        guard let output = String(data: outputData, encoding: .utf8) else {
            throw LocalKGError.pythonProcessFailed("Failed to decode output")
        }
        
        return output.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    
    /// Get global singleton instance
    public static func shared(dbPath: String? = nil) throws -> LocalKGBridge {
        if instance == nil || dbPath != nil {
            instance = try LocalKGBridge(dbPath: dbPath)
        }
        return instance!
    }
}

// Example usage
#if DEBUG
func exampleUsage() {
    Task {
        do {
            let kg = try LocalKGBridge.shared()
            
            // Capture an error
            let patternId = try await kg.captureError(
                signature: "Index out of range",
                category: "IndexError",
                language: "swift",
                severity: "high"
            )
            print("Captured error: \(patternId)")
            
            // Search for patterns
            let patterns = try await kg.searchPatterns(query: "index", limit: 5)
            print("Found \(patterns.count) patterns")
            
        } catch {
            print("Error: \(error)")
        }
    }
}
#endif

