/**
 * Nebula Protocol - Centralized Configuration
 * 
 * All environment-based configuration in one place.
 * Makes deployment and environment management easier.
 */

export default {
  // API Server Configuration
  api: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'change_this_in_production',
    jwtExpiry: process.env.JWT_EXPIRY || '24h',
    logLevel: process.env.LOG_LEVEL || 'info',
    corsOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },

  // Cache Configuration
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    defaultTTL: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes
    docTTL: parseInt(process.env.DOC_CACHE_TTL) || 86400, // 24 hours
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS) || 1000,
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 60, // seconds
  },

  // Database Configuration
  database: {
    // PostgreSQL (Central Knowledge Graph)
    postgres: {
      enabled: !!process.env.POSTGRES_HOST,
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      database: process.env.POSTGRES_DB || 'nebula_kg',
      user: process.env.POSTGRES_USER || 'nebula_user',
      password: process.env.POSTGRES_PASSWORD,
      maxConnections: parseInt(process.env.POSTGRES_MAX_CONNECTIONS) || 20,
      idleTimeoutMs: parseInt(process.env.POSTGRES_IDLE_TIMEOUT) || 30000,
      connectionTimeoutMs: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT) || 2000,
    },
    
    // Redis (Documentation Caching)
    redis: {
      enabled: !!process.env.REDIS_HOST,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB) || 0,
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'nebula:',
    },

    // SQLite (Project Memory)
    sqlite: {
      walMode: true,
      foreignKeys: true,
      timeout: parseInt(process.env.SQLITE_TIMEOUT) || 5000,
    },
  },

  // Rate Limiting Configuration
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    project: {
      max: parseInt(process.env.RATE_LIMIT_PROJECT) || 100,
      windowMinutes: 15,
    },
    docs: {
      max: parseInt(process.env.RATE_LIMIT_DOCS) || 50,
      windowMinutes: 15,
    },
    kg: {
      max: parseInt(process.env.RATE_LIMIT_KG) || 200,
      windowMinutes: 15,
    },
  },

  // Documentation Service Configuration
  docs: {
    cacheTTL: parseInt(process.env.DOC_CACHE_TTL) || 86400, // 24 hours
    fetchTimeout: parseInt(process.env.DOC_FETCH_TIMEOUT) || 5000, // 5 seconds
    maxRetries: parseInt(process.env.DOC_FETCH_RETRIES) || 3,
    prefetchEnabled: process.env.DOC_PREFETCH_ENABLED !== 'false',
    prefetchDelay: parseInt(process.env.DOC_PREFETCH_DELAY) || 5000, // 5 seconds
    backgroundRefresh: process.env.DOC_BACKGROUND_REFRESH !== 'false',
    refreshInterval: parseInt(process.env.DOC_REFRESH_INTERVAL) || 3600000, // 1 hour
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
    errorFile: process.env.LOG_ERROR_FILE || 'logs/error.log',
    combinedFile: process.env.LOG_COMBINED_FILE || 'logs/combined.log',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 14, // days
    colorize: process.env.LOG_COLORIZE !== 'false',
  },

  // Project Storage Configuration (Git-First)
  storage: {
    projectsDir: process.env.PROJECTS_DIR || '/app/projects',
    maxProjectSize: parseInt(process.env.MAX_PROJECT_SIZE) || 1024 * 1024 * 100, // 100MB
    maxProjects: parseInt(process.env.MAX_PROJECTS) || 1000,
    cleanupEnabled: process.env.STORAGE_CLEANUP_ENABLED !== 'false',
    cleanupInterval: parseInt(process.env.STORAGE_CLEANUP_INTERVAL) || 86400000, // 24 hours
    maxAge: parseInt(process.env.PROJECT_MAX_AGE) || 2592000000, // 30 days
    gitRequired: process.env.GIT_REQUIRED !== 'false', // Require Git for all projects
  },

  // Git Integration Configuration
  git: {
    enabled: process.env.GIT_ENABLED !== 'false',
    autoCommit: process.env.GIT_AUTO_COMMIT !== 'false',
    autoPush: process.env.GIT_AUTO_PUSH !== 'false',
    commitOnStarSystem: process.env.GIT_COMMIT_ON_STAR_SYSTEM !== 'false',
    commitOnStarGate: process.env.GIT_COMMIT_ON_STAR_GATE !== 'false',
    commitOnErrorResolution: process.env.GIT_COMMIT_ON_ERROR_RESOLUTION === 'true',
    defaultBranch: process.env.GIT_DEFAULT_BRANCH || 'main',
    shallowClone: process.env.GIT_SHALLOW_CLONE === 'true',
    // Supported providers: github, gitlab, bitbucket, custom
    defaultProvider: process.env.GIT_DEFAULT_PROVIDER || 'github',
  },

  // Batch Operations Configuration
  batch: {
    maxErrors: parseInt(process.env.BATCH_MAX_ERRORS) || 100,
    maxSolutions: parseInt(process.env.BATCH_MAX_SOLUTIONS) || 100,
    maxStarGates: parseInt(process.env.BATCH_MAX_STAR_GATES) || 50,
  },

  // Validation Configuration
  validation: {
    maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH) || 5000,
    maxStackTraceLength: parseInt(process.env.MAX_STACK_TRACE_LENGTH) || 10000,
    maxDescriptionLength: parseInt(process.env.MAX_DESCRIPTION_LENGTH) || 5000,
    maxNotesLength: parseInt(process.env.MAX_NOTES_LENGTH) || 2000,
  },

  // Performance Monitoring
  monitoring: {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    metricsInterval: parseInt(process.env.METRICS_INTERVAL) || 60000, // 1 minute
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
  },

  // Security Configuration
  security: {
    helmet: {
      enabled: process.env.HELMET_ENABLED !== 'false',
      contentSecurityPolicy: process.env.CSP_ENABLED !== 'false',
    },
    cors: {
      enabled: process.env.CORS_ENABLED !== 'false',
      credentials: process.env.CORS_CREDENTIALS !== 'false',
    },
  },

  // Feature Flags
  features: {
    centralKG: process.env.FEATURE_CENTRAL_KG !== 'false',
    documentation: process.env.FEATURE_DOCUMENTATION !== 'false',
    batchOperations: process.env.FEATURE_BATCH_OPS !== 'false',
    caching: process.env.FEATURE_CACHING !== 'false',
    compression: process.env.FEATURE_COMPRESSION !== 'false',
  },

  // Development/Debug
  debug: {
    verbose: process.env.DEBUG_VERBOSE === 'true',
    sqlLog: process.env.DEBUG_SQL === 'true',
    httpLog: process.env.DEBUG_HTTP === 'true',
    cacheLog: process.env.DEBUG_CACHE === 'true',
  },
};

