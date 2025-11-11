/**
 * Kotlin Bridge for Nebula Local KG
 *
 * Provides a Kotlin interface to interact with the Python-based Local Knowledge Graph.
 *
 * Usage:
 *   import com.nebula.kg.LocalKGBridge
 *   
 *   val kg = LocalKGBridge()
 *   runBlocking {
 *       val patternId = kg.captureError(
 *           signature = "KotlinNullPointerException",
 *           category = "NullPointerException",
 *           language = "kotlin",
 *           severity = "high"
 *       )
 *   }
 */

package com.nebula.kg

import kotlinx.coroutines.*
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.File
import java.io.BufferedReader

@Serializable
data class NebulaConfig(
    val language: String? = null,
    val framework: String? = null,
    @SerialName("local_kg_db") val localKgDb: String? = null,
    @SerialName("central_kg_url") val centralKgUrl: String? = null,
    @SerialName("python_command") val pythonCommand: String? = null,
    @SerialName("auto_sync") val autoSync: Boolean? = null
)

@Serializable
data class ErrorCapture(
    val signature: String,
    val category: String = "Error",
    val language: String = "kotlin",
    val severity: String = "medium",
    val description: String? = null
)

@Serializable
data class ErrorPattern(
    val id: String,
    @SerialName("error_signature") val errorSignature: String,
    @SerialName("error_category") val errorCategory: String,
    val language: String,
    val severity: String,
    val description: String? = null,
    @SerialName("occurrence_count") val occurrenceCount: Int,
    @SerialName("first_seen") val firstSeen: String,
    @SerialName("last_seen") val lastSeen: String,
    @SerialName("solution_count") val solutionCount: Int
)

@Serializable
data class PatternSummary(
    @SerialName("total_patterns") val totalPatterns: Int,
    @SerialName("total_solutions") val totalSolutions: Int,
    val languages: Map<String, Int>,
    @SerialName("top_errors") val topErrors: List<JsonElement>
)

class LocalKGException(message: String, cause: Throwable? = null) : Exception(message, cause)

class LocalKGBridge(dbPath: String? = null) {
    private val config: NebulaConfig = loadConfig()
    private val dbPath: String = dbPath ?: config.localKgDb ?: "local_kg/nebula_protocol_local.db"
    private val pythonCommand: String = config.pythonCommand ?: "python"
    private val json = Json { ignoreUnknownKeys = true }

    companion object {
        @Volatile
        private var instance: LocalKGBridge? = null

        /**
         * Get global singleton instance
         */
        fun getInstance(dbPath: String? = null): LocalKGBridge {
            return instance ?: synchronized(this) {
                instance ?: LocalKGBridge(dbPath).also { instance = it }
            }
        }

        /**
         * Load configuration from .nebula/config.json or environment variables
         */
        private fun loadConfig(): NebulaConfig {
            // Priority 1: .nebula/config.json
            val configFile = File(".nebula/config.json")
            if (configFile.exists()) {
                try {
                    val jsonString = configFile.readText()
                    return Json.decodeFromString(jsonString)
                } catch (e: Exception) {
                    // Fall through to environment variables
                }
            }

            // Priority 2: Environment variables
            val language = System.getenv("NEBULA_LANGUAGE")
            if (language != null) {
                return NebulaConfig(
                    language = language,
                    localKgDb = System.getenv("NEBULA_LOCAL_KG_DB") ?: "local_kg/project_local.db",
                    pythonCommand = System.getenv("PYTHON_CMD") ?: "python"
                )
            }

            // Priority 3: Defaults
            return NebulaConfig(
                language = "kotlin",
                localKgDb = "local_kg/nebula_protocol_local.db",
                pythonCommand = "python"
            )
        }
    }

    /**
     * Capture an error pattern to the local KG
     */
    suspend fun captureError(
        signature: String,
        category: String = "Error",
        language: String = "kotlin",
        severity: String = "medium",
        description: String? = null
    ): String = withContext(Dispatchers.IO) {
        val descValue = description?.let { "'${escapePython(it)}'" } ?: "None"

        val pythonCode = """
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('$dbPath')
pattern_id = kg.capture_error(
    error_signature='${escapePython(signature)}',
    error_category='${escapePython(category)}',
    language='${escapePython(language)}',
    description=$descValue,
    severity='${escapePython(severity)}'
)
print(pattern_id)
        """.trimIndent()

        runPython(pythonCode)
    }

    /**
     * Capture an error from a Kotlin Throwable
     */
    suspend fun captureErrorFromThrowable(
        throwable: Throwable,
        language: String = "kotlin",
        severity: String = "medium"
    ): String {
        val stackTrace = throwable.stackTraceToString().take(500)
        return captureError(
            signature = throwable.message ?: throwable.toString(),
            category = throwable::class.simpleName ?: "Exception",
            language = language,
            severity = severity,
            description = stackTrace
        )
    }

    /**
     * Search for similar error patterns
     */
    suspend fun searchPatterns(query: String, limit: Int = 5): List<ErrorPattern> = withContext(Dispatchers.IO) {
        val pythonCode = """
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('$dbPath')
patterns = kg.search_patterns('${escapePython(query)}', $limit)
print(json.dumps(patterns, default=str))
        """.trimIndent()

        val result = runPython(pythonCode)
        json.decodeFromString<List<ErrorPattern>>(result)
    }

    /**
     * Add a solution to an existing pattern
     */
    suspend fun addSolution(
        patternId: String,
        solutionText: String,
        effectiveness: String = "worked"
    ): String = withContext(Dispatchers.IO) {
        val pythonCode = """
import sys
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('$dbPath')
solution_id = kg.add_solution(
    pattern_id='${escapePython(patternId)}',
    solution_text='${escapePython(solutionText)}',
    effectiveness='${escapePython(effectiveness)}'
)
print(solution_id)
        """.trimIndent()

        runPython(pythonCode)
    }

    /**
     * Get summary statistics
     */
    suspend fun getSummary(): PatternSummary = withContext(Dispatchers.IO) {
        val pythonCode = """
import sys
import json
sys.path.insert(0, '.')
from local_kg.local_kg import get_local_kg

kg = get_local_kg('$dbPath')
summary = kg.get_pattern_summary()
print(json.dumps(summary, default=str))
        """.trimIndent()

        val result = runPython(pythonCode)
        json.decodeFromString<PatternSummary>(result)
    }

    /**
     * Fire-and-forget error capture (non-blocking)
     */
    fun captureErrorAsync(
        signature: String,
        category: String = "Error",
        language: String = "kotlin",
        severity: String = "medium"
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                captureError(signature, category, language, severity)
            } catch (e: Exception) {
                System.err.println("[LocalKG] Failed to capture error: ${e.message}")
            }
        }
    }

    /**
     * Escape string for Python code
     */
    private fun escapePython(str: String): String {
        return str
            .replace("\\", "\\\\")
            .replace("'", "\\'")
            .replace("\n", "\\n")
    }

    /**
     * Run Python code and return stdout
     */
    private fun runPython(code: String): String {
        val process = ProcessBuilder(pythonCommand, "-c", code)
            .directory(File("."))
            .redirectErrorStream(false)
            .start()

        val output = process.inputStream.bufferedReader().use(BufferedReader::readText)
        val error = process.errorStream.bufferedReader().use(BufferedReader::readText)

        val exitCode = process.waitFor()

        if (exitCode != 0) {
            throw LocalKGException("Python process failed (exit $exitCode): $error")
        }

        return output.trim()
    }
}

// Example usage
fun main() = runBlocking {
    val kg = LocalKGBridge.getInstance()

    try {
        // Capture an error
        val patternId = kg.captureError(
            signature = "NullPointerException: Cannot invoke method on null",
            category = "NullPointerException",
            language = "kotlin",
            severity = "high"
        )
        println("Captured error: $patternId")

        // Search for patterns
        val patterns = kg.searchPatterns("NullPointer", 5)
        println("Found ${patterns.size} patterns")

    } catch (e: Exception) {
        println("Error: ${e.message}")
    }
}

