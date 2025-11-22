#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import NodeCache from 'node-cache';
import winston from 'winston';
import morgan from 'morgan';
import { z } from 'zod';
import config from './src/config/index.js';
import { GitIntegration } from './src/git/git-integration.js';
import { BranchManagement } from './src/git/branch-management.js';
// import { CentralKGSync } from './src/kg/central-kg-sync.js';
import { ProjectMemory } from './project-memory.js';
import { StarChart } from './star-chart.js';
import { DocumentationService } from './nebula-docs-service.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from 'redis';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = config.api.port;
const JWT_SECRET = config.api.jwtSecret;

// ============================================================================
// LOGGING CONFIGURATION
// ============================================================================

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: config.logging.errorFile, 
      level: 'error',
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles
    }),
    new winston.transports.File({ 
      filename: config.logging.combinedFile,
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        config.logging.colorize ? winston.format.colorize() : winston.format.simple(),
        winston.format.simple()
      )
    })
  ]
});

// ============================================================================
// RESPONSE CACHING
// ============================================================================

const responseCache = new NodeCache({ 
  stdTTL: config.cache.defaultTTL,
  checkperiod: config.cache.checkPeriod,
  useClones: false,
  maxKeys: config.cache.maxKeys
});

// Initialize Redis client for doc caching
let redisClient = null;
if (config.database.redis.enabled) {
  redisClient = createClient({
    socket: {
      host: config.database.redis.host,
      port: config.database.redis.port
    },
    password: config.database.redis.password,
    database: config.database.redis.db
  });
  
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  redisClient.on('connect', () => console.log('Redis Client Connected'));
  
  redisClient.connect().catch(console.error);
}

// Initialize Documentation Service
const docService = new DocumentationService(redisClient);

// Initialize Git Integration Service
const gitService = new GitIntegration(config);

// Initialize PostgreSQL connection pool for Central KG
let pgPool = null;
// let centralKGSync = null;

if (config.database.postgres.enabled) {
  pgPool = new Pool({
    host: config.database.postgres.host,
    port: config.database.postgres.port,
    database: config.database.postgres.database,
    user: config.database.postgres.user,
    password: config.database.postgres.password,
    max: config.database.postgres.maxConnections,
    idleTimeoutMillis: config.database.postgres.idleTimeoutMs,
    connectionTimeoutMillis: config.database.postgres.connectionTimeoutMs
  });

  pgPool.on('error', (err) => {
    logger.error('PostgreSQL pool error', { error: err.message });
  });

  pgPool.on('connect', () => {
    logger.info('PostgreSQL connected');
  });

  // Deprecated JS sync disabled in favor of Python Local KG
  // centralKGSync = new CentralKGSync(pgPool);
  // logger.info('Central Knowledge Graph sync initialized');
} else {
  logger.warn('Central Knowledge Graph disabled (PostgreSQL not configured)');
}

// Prefetch common documentation on startup (async, don't block)
if (config.docs.prefetchEnabled) {
  setTimeout(() => {
    docService.prefetchCommonDocs().catch(err => {
      logger.error('Documentation prefetch failed', { error: err.message });
    });
  }, config.docs.prefetchDelay);
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Compression middleware (gzip/deflate)
app.use(compression({
  level: 6,
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging with Morgan
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Rate limiting (user-based when authenticated, IP-based otherwise)
const createRateLimiter = (maxRequests, windowMinutes) => {
  if (!config.rateLimit.enabled) {
    return (req, res, next) => next();
  }
  
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for ${req.user?.id || req.ip}`);
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: res.getHeader('Retry-After')
      });
    }
  });
};

// Different rate limits for different endpoints
app.use('/api/project', createRateLimiter(config.rateLimit.project.max, config.rateLimit.project.windowMinutes));
app.use('/api/docs', createRateLimiter(config.rateLimit.docs.max, config.rateLimit.docs.windowMinutes));
app.use('/api/kg', createRateLimiter(config.rateLimit.kg.max, config.rateLimit.kg.windowMinutes));

// Performance tracking middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      user: req.user?.id
    });
  });
  next();
});

// Cache middleware helper
function cacheMiddleware(ttl = 300) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    
    const key = `cache:${req.originalUrl || req.url}`;
    const cached = responseCache.get(key);
    
    if (cached) {
      logger.debug(`Cache hit: ${key}`);
      return res.json(cached);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      responseCache.set(key, body, ttl);
      return originalJson(body);
    };
    
    next();
  };
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const errorSchema = z.object({
  language: z.string().min(1).max(50),
  message: z.string().min(1).max(config.validation.maxMessageLength),
  stackTrace: z.string().max(config.validation.maxStackTraceLength).optional(),
  constellation: z.string().min(1).max(100).optional(),
  filePath: z.string().optional(),
  lineNumber: z.number().int().positive().optional(),
  errorCode: z.string().optional(),
  level: z.enum(['ERROR', 'CRITICAL']).default('ERROR')
});

const solutionSchema = z.object({
  errorId: z.string().uuid(),
  description: z.string().min(1).max(config.validation.maxDescriptionLength),
  codeChanges: z.string().optional(),
  appliedBy: z.enum(['ai', 'human']).default('ai'),
  effectiveness: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(config.validation.maxNotesLength).optional()
});

const starGateSchema = z.object({
  constellation: z.string().min(1).max(100),
  constellationNumber: z.number().int().positive(),
  status: z.enum(['passed', 'failed', 'pending', 'skipped']),
  testsAutomated: z.number().int().min(0).default(0),
  testsAutomatedPassing: z.number().int().min(0).default(0),
  testsManual: z.number().int().min(0).default(0),
  testsManualPassing: z.number().int().min(0).default(0),
  testsSkipped: z.number().int().min(0).default(0),
  skipReasons: z.string().optional(),
  performanceAcceptable: z.boolean().default(true),
  docsUpdated: z.boolean().default(true),
  breakingChanges: z.boolean().default(false),
  notes: z.string().optional()
});

const batchErrorsSchema = z.object({
  errors: z.array(errorSchema).min(1).max(config.batch.maxErrors)
});

const batchSolutionsSchema = z.object({
  solutions: z.array(solutionSchema).min(1).max(config.batch.maxSolutions)
});

// Validation middleware
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated; // Replace with validated data
      next();
    } catch (error) {
      logger.warn('Validation failed', { 
        path: req.path, 
        errors: error.errors 
      });
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
  };
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ============================================================================
// HEALTH CHECK & STATUS
// ============================================================================

app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    },
    checks: {}
  };

  // Check Redis
  if (redisClient) {
    try {
      await redisClient.ping();
      health.checks.redis = 'healthy';
    } catch (error) {
      health.checks.redis = 'unhealthy';
      health.status = 'degraded';
      logger.error('Redis health check failed', { error: error.message });
    }
  } else {
    health.checks.redis = 'not_configured';
  }

  // Check disk space (basic check)
  try {
    const stats = fs.statSync('.');
    health.checks.diskSpace = 'healthy';
  } catch (error) {
    health.checks.diskSpace = 'unknown';
  }

  // Check cache stats
  health.checks.cache = {
    status: 'healthy',
    keys: responseCache.keys().length,
    stats: responseCache.getStats()
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Kubernetes/Docker Swarm readiness check
app.get('/ready', async (req, res) => {
  try {
    if (redisClient) {
      await redisClient.ping();
    }
    res.status(200).json({ ready: true });
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });
    res.status(503).json({ ready: false, error: error.message });
  }
});

app.get('/api/status', authenticateToken, (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

app.post('/api/auth/token', (req, res) => {
  const { apiKey, projectId } = req.body;
  
  // TODO: Validate API key against database
  // For now, simple validation
  if (!apiKey || apiKey.length < 32) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  const token = jwt.sign(
    { projectId: projectId || 'default', apiKey },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    expiresIn: '24h',
    type: 'Bearer'
  });
});

// ============================================================================
// PROJECT MEMORY ENDPOINTS (GIT-FIRST ARCHITECTURE)
// ============================================================================

// Initialize project with Git (GIT-FIRST ARCHITECTURE)
app.post('/api/project/:projectId/init', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      name, 
      framework,
      gitRemote,
      gitProvider,
      gitUsername,
      gitToken,
      gitEmail,
      gitBranch
    } = req.body;

    // Validate Git remote if required
    if (config.storage.gitRequired && !gitRemote) {
      return res.status(400).json({
        error: 'Git remote is required',
        message: 'Projects must be connected to a Git repository (GitHub, GitLab, etc.)'
      });
    }

    // Initialize Git repository
    const gitResult = await gitService.initializeProject(projectId, {
      name,
      framework,
      gitRemote,
      gitProvider,
      gitUsername,
      gitToken,
      gitEmail,
      gitBranch
    });

    // Initialize project memory
    const memory = new ProjectMemory(gitResult.projectPath, name, framework);
    
    // Record Git info in project memory
    memory.recordDecision({
      phase: 'SETUP',
      constellation: 'Git Integration',
      decisionType: 'infrastructure',
      question: 'Where is the project stored?',
      chosenOption: `Git repository: ${gitRemote || 'local only'}`,
      rationale: 'Git-first architecture for scalable, stateless project storage',
      madeBy: 'system'
    });
    
    memory.close();

    logger.info('Project initialized with Git', { 
      projectId, 
      gitRemote: gitResult.gitRemote,
      gitInitialized: gitResult.gitInitialized
    });

    res.json({
      success: true,
      projectId,
      message: 'Project initialized with Git',
      ...gitResult
    });
  } catch (error) {
    logger.error('Project initialization failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Clone existing project from Git
app.post('/api/project/:projectId/clone', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { gitUrl, gitToken, gitBranch, shallow } = req.body;

    if (!gitUrl) {
      return res.status(400).json({ error: 'gitUrl is required' });
    }

    const result = await gitService.cloneProject(projectId, gitUrl, {
      gitToken,
      gitBranch,
      shallow
    });

    logger.info('Project cloned from Git', { projectId, gitUrl: result.gitRemote });

    res.json({
      success: true,
      message: 'Project cloned successfully',
      ...result
    });
  } catch (error) {
    logger.error('Project clone failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get Git status for project
app.get('/api/project/:projectId/git/status', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join(config.storage.projectsDir, projectId);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const status = await gitService.getStatus(projectPath);

    res.json({
      success: true,
      projectId,
      ...status
    });
  } catch (error) {
    logger.error('Git status failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Manual commit and push
app.post('/api/project/:projectId/git/commit', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, push = true, addAll = true, force = false } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Commit message is required' });
    }

    const projectPath = path.join(config.storage.projectsDir, projectId);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const result = await gitService.commitAndPush(projectPath, message, {
      addAll,
      push,
      force
    });

    logger.info('Git commit completed', { projectId, committed: result.committed, pushed: result.pushed });

    res.json({
      success: true,
      projectId,
      ...result
    });
  } catch (error) {
    logger.error('Git commit failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Pull latest changes
app.post('/api/project/:projectId/git/pull', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rebase = false } = req.body;

    const projectPath = path.join(config.storage.projectsDir, projectId);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const result = await gitService.pullChanges(projectPath, { rebase });

    logger.info('Git pull completed', { projectId });

    res.json({
      success: true,
      projectId,
      ...result
    });
  } catch (error) {
    logger.error('Git pull failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// GIT BRANCH MANAGEMENT ENDPOINTS (GIT CLIENT AGNOSTIC)
// Works with ANY Git client - GitHub Desktop, VS Code, CLI, etc.
// ============================================================================

// List all branches
app.get('/api/project/:projectId/git/branches', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join(config.storage.projectsDir, projectId);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const branchMgr = new BranchManagement(projectPath);
    const result = branchMgr.listBranches();

    res.json({
      success: true,
      projectId,
      ...result
    });
  } catch (error) {
    logger.error('List branches failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Create new branch
app.post('/api/project/:projectId/git/branch', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { branchName, fromBranch, checkout = true, push = false } = req.body;

    if (!branchName) {
      return res.status(400).json({ error: 'branchName is required' });
    }

    const projectPath = path.join(config.storage.projectsDir, projectId);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const branchMgr = new BranchManagement(projectPath);
    const result = branchMgr.createBranch(branchName, { fromBranch, checkout, push });

    logger.info('Branch created', { projectId, branchName, checkout });

    res.json({
      success: true,
      projectId,
      ...result
    });
  } catch (error) {
    logger.error('Create branch failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Switch branch (checkout)
app.post('/api/project/:projectId/git/checkout', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { branchName, createIfMissing = false, force = false } = req.body;

    if (!branchName) {
      return res.status(400).json({ error: 'branchName is required' });
    }

    const projectPath = path.join(config.storage.projectsDir, projectId);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const branchMgr = new BranchManagement(projectPath);
    const result = branchMgr.checkoutBranch(branchName, { createIfMissing, force });

    logger.info('Branch checkout', { projectId, branchName });

    res.json({
      success: true,
      projectId,
      ...result
    });
  } catch (error) {
    logger.error('Checkout branch failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Merge branch
app.post('/api/project/:projectId/git/merge', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      sourceBranch, 
      strategy = 'merge', 
      noFastForward = true,
      autoResolveConflicts = false,
      commitMessage 
    } = req.body;

    if (!sourceBranch) {
      return res.status(400).json({ error: 'sourceBranch is required' });
    }

    const projectPath = path.join(config.storage.projectsDir, projectId);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const branchMgr = new BranchManagement(projectPath);
    const result = branchMgr.mergeBranch(sourceBranch, {
      strategy,
      noFastForward,
      autoResolveConflicts,
      commitMessage
    });

    logger.info('Branch merge', { 
      projectId, 
      sourceBranch, 
      hasConflicts: result.hasConflicts 
    });

    res.json({
      success: true,
      projectId,
      ...result
    });
  } catch (error) {
    logger.error('Merge branch failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Delete branch
app.delete('/api/project/:projectId/git/branch/:branchName', authenticateToken, async (req, res) => {
  try {
    const { projectId, branchName } = req.params;
    const { force = false, deleteRemote = true } = req.body;

    const projectPath = path.join(config.storage.projectsDir, projectId);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const branchMgr = new BranchManagement(projectPath);
    const result = branchMgr.deleteBranch(branchName, { force, deleteRemote });

    logger.info('Branch deleted', { projectId, branchName });

    res.json({
      success: true,
      projectId,
      ...result
    });
  } catch (error) {
    logger.error('Delete branch failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get branch info
app.get('/api/project/:projectId/git/branch/:branchName?', authenticateToken, async (req, res) => {
  try {
    const { projectId, branchName } = req.params;
    const projectPath = path.join(config.storage.projectsDir, projectId);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const branchMgr = new BranchManagement(projectPath);
    const result = branchMgr.getBranchInfo(branchName || null);

    res.json({
      success: true,
      projectId,
      ...result
    });
  } catch (error) {
    logger.error('Get branch info failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Compare two branches
app.get('/api/project/:projectId/git/compare/:baseBranch/:compareBranch', authenticateToken, async (req, res) => {
  try {
    const { projectId, baseBranch, compareBranch } = req.params;
    const projectPath = path.join(config.storage.projectsDir, projectId);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const branchMgr = new BranchManagement(projectPath);
    const result = branchMgr.compareBranches(baseBranch, compareBranch);

    res.json({
      success: true,
      projectId,
      ...result
    });
  } catch (error) {
    logger.error('Compare branches failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get project version (cached for 1 min)
app.get('/api/project/:projectId/version', authenticateToken, cacheMiddleware(60), (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const version = memory.getVersion();
    memory.close();

    res.json(version);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bump version
app.post('/api/project/:projectId/version/bump', authenticateToken, (req, res) => {
  try {
    const { projectId } = req.params;
    const { component, resetLower } = req.body;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const version = memory.bumpVersion(component || 'patch', resetLower !== false);
    memory.close();

    res.json({
      success: true,
      ...version,
      message: `Version bumped: ${component || 'patch'}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set version manually
app.put('/api/project/:projectId/version', authenticateToken, (req, res) => {
  try {
    const { projectId } = req.params;
    const { constellation, starSystem, qualityGate, patch } = req.body;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const version = memory.setVersion(
      constellation || 0,
      starSystem || 0,
      qualityGate || 0,
      patch || 0
    );
    memory.close();

    res.json({
      success: true,
      ...version
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log error (with validation and automatic doc fetching)
app.post('/api/project/:projectId/error', authenticateToken, validateRequest(errorSchema), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { language, message, stackTrace, constellation, filePath, lineNumber, errorCode, level } = req.body;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const errorId = memory.recordError({
      phase: constellation || 'unknown',
      level: level || 'ERROR',
      message,
      stackTrace,
      filePath,
      lineNumber,
      errorCode
    });
    
    // Automatically fetch relevant documentation
    let docSuggestion = null;
    if (language && message) {
      const errorInfo = docService.extractErrorInfo(language, message);
      if (errorInfo) {
        try {
          const docs = await docService.fetchDocumentation(
            language,
            errorInfo.code,
            { docType: 'error' }
          );
          docSuggestion = docs.data;
          logger.info('Documentation fetched for error', { 
            language, 
            errorCode: errorInfo.code 
          });
        } catch (docError) {
          logger.error('Doc fetch error:', { error: docError.message });
        }
      }
    }
    
    memory.close();

    res.json({
      success: true,
      errorId,
      documentation: docSuggestion
    });
  } catch (error) {
    logger.error('Error logging failed', { error: error.message, projectId: req.params.projectId });
    res.status(500).json({ error: error.message });
  }
});

// Batch log errors (NEW - 10-100x faster bulk inserts)
app.post('/api/project/:projectId/errors/batch', authenticateToken, validateRequest(batchErrorsSchema), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { errors } = req.body;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const errorIds = [];
    
    // Use transaction for bulk insert
    const insertStmt = memory.db.prepare(`
      INSERT INTO error_log (id, timestamp, level, phase, constellation, file_path, line_number, error_code, message, stack_trace)
      VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = memory.db.transaction((errors) => {
      for (const error of errors) {
        const errorId = crypto.randomUUID();
        insertStmt.run(
          errorId,
          error.level || 'ERROR',
          error.constellation || 'unknown',
          error.constellation || 'unknown',
          error.filePath,
          error.lineNumber,
          error.errorCode,
          error.message,
          error.stackTrace
        );
        errorIds.push(errorId);
      }
    });
    
    transaction(errors);
    memory.close();

    logger.info('Batch errors logged', { count: errors.length, projectId });
    
    res.json({
      success: true,
      count: errors.length,
      errorIds
    });
  } catch (error) {
    logger.error('Batch error logging failed', { error: error.message, projectId: req.params.projectId });
    res.status(500).json({ error: error.message });
  }
});

// Record solution (with validation)
app.post('/api/project/:projectId/solution', authenticateToken, validateRequest(solutionSchema), (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const solutionId = memory.recordSolution(req.body);
    
    // Auto-bump patch version on solution
    const version = memory.bumpVersion('patch', false);
    memory.close();

    res.json({
      success: true,
      solutionId,
      version: version.version,
      message: 'Solution recorded and version bumped'
    });
  } catch (error) {
    logger.error('Solution recording failed', { error: error.message, projectId: req.params.projectId });
    res.status(500).json({ error: error.message });
  }
});

// Batch record solutions (NEW - 10-100x faster bulk inserts)
app.post('/api/project/:projectId/solutions/batch', authenticateToken, validateRequest(batchSolutionsSchema), (req, res) => {
  try {
    const { projectId } = req.params;
    const { solutions } = req.body;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const solutionIds = [];
    
    // Use transaction for bulk insert
    const insertStmt = memory.db.prepare(`
      INSERT INTO error_solutions (id, error_id, solution_description, code_changes, applied_by, effectiveness, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const updateStmt = memory.db.prepare(`
      UPDATE error_log SET resolved = 1, resolution_id = ? WHERE id = ?
    `);
    
    const transaction = memory.db.transaction((solutions) => {
      for (const solution of solutions) {
        const solutionId = crypto.randomUUID();
        insertStmt.run(
          solutionId,
          solution.errorId,
          solution.description,
          solution.codeChanges,
          solution.appliedBy || 'ai',
          solution.effectiveness,
          solution.notes
        );
        updateStmt.run(solutionId, solution.errorId);
        solutionIds.push(solutionId);
      }
    });
    
    transaction(solutions);
    
    // Auto-bump patch version on solution batch
    const version = memory.bumpVersion('patch', false);
    memory.close();

    logger.info('Batch solutions recorded', { count: solutions.length, projectId });
    
    res.json({
      success: true,
      count: solutions.length,
      solutionIds,
      version: version.version
    });
  } catch (error) {
    logger.error('Batch solution recording failed', { error: error.message, projectId: req.params.projectId });
    res.status(500).json({ error: error.message });
  }
});

// Find similar errors
app.post('/api/project/:projectId/errors/similar', authenticateToken, (req, res) => {
  try {
    const { projectId } = req.params;
    const { text, phase, tags, limit } = req.body;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const results = memory.findSimilarErrors({ text, phase, tags, limit });
    memory.close();

    res.json({
      success: true,
      count: results.length,
      errors: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get error patterns
app.get('/api/project/:projectId/patterns', authenticateToken, (req, res) => {
  try {
    const { projectId } = req.params;
    const { minOccurrences } = req.query;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const patterns = memory.getErrorPatterns(parseInt(minOccurrences) || 2);
    memory.close();

    res.json({
      success: true,
      count: patterns.length,
      patterns
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record decision
app.post('/api/project/:projectId/decision', authenticateToken, (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const decisionId = memory.recordDecision(req.body);
    memory.close();

    res.json({
      success: true,
      decisionId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record Star Gate (with validation)
app.post('/api/project/:projectId/star-gate', authenticateToken, validateRequest(starGateSchema), (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const gateId = memory.recordStarGate(req.body);
    
    // Auto-bump quality gate version
    const version = memory.bumpVersion('quality_gate', true);
    memory.close();

    res.json({
      success: true,
      gateId,
      version: version.version,
      message: 'Star Gate recorded and version bumped'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project statistics (cached for 5 min)
app.get('/api/project/:projectId/stats', authenticateToken, cacheMiddleware(300), (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const stats = memory.getStatistics();
    memory.close();

    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// STAR CHART (KNOWLEDGE GRAPH) ENDPOINTS
// ============================================================================

// Create/update KG node
app.post('/api/kg/node', authenticateToken, (req, res) => {
  try {
    const { nodeId, nodeType, constellation, properties } = req.body;
    
    const kg = new StarChart();
    const result = kg.upsertNode(nodeId, nodeType, constellation, properties || {});
    kg.close();

    res.json({
      success: true,
      nodeId: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Link KG nodes
app.post('/api/kg/link', authenticateToken, (req, res) => {
  try {
    const { fromNode, toNode, linkType, weight, properties } = req.body;
    
    const kg = new StarChart();
    const linkId = kg.linkNodes(fromNode, toNode, linkType, weight || 1.0, properties || {});
    kg.close();

    res.json({
      success: true,
      linkId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log KG event
app.post('/api/kg/event', authenticateToken, (req, res) => {
  try {
    const { eventType, constellation, nodeId, description, metadata } = req.body;
    
    const kg = new StarChart();
    const eventId = kg.logEvent(eventType, constellation, nodeId, description, metadata || {});
    kg.close();

    res.json({
      success: true,
      eventId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add lesson learned
app.post('/api/kg/lesson', authenticateToken, (req, res) => {
  try {
    const { constellation, category, lesson, context, impact } = req.body;
    
    const kg = new StarChart();
    const lessonId = kg.addLesson(constellation, category, lesson, context || '', impact || 3);
    kg.close();

    res.json({
      success: true,
      lessonId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lessons for phase
app.get('/api/kg/lessons/:constellation', authenticateToken, (req, res) => {
  try {
    const { constellation } = req.params;
    const { category, minImpact } = req.query;
    
    const kg = new StarChart();
    const lessons = kg.getLessonsForPhase(constellation, category, parseInt(minImpact) || 1);
    kg.close();

    res.json({
      success: true,
      count: lessons.length,
      lessons
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find similar failures
app.post('/api/kg/failures/similar', authenticateToken, (req, res) => {
  try {
    const { errorSignature, limit } = req.body;
    
    const kg = new StarChart();
    const failures = kg.findSimilarFailures(errorSignature, limit || 10);
    kg.close();

    res.json({
      success: true,
      count: failures.length,
      failures
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get node neighbors
app.get('/api/kg/node/:nodeId/neighbors', authenticateToken, (req, res) => {
  try {
    const { nodeId } = req.params;
    const { linkType, maxDepth } = req.query;
    
    const kg = new StarChart();
    const neighbors = kg.getNeighbors(nodeId, linkType, parseInt(maxDepth) || 1);
    kg.close();

    res.json({
      success: true,
      count: neighbors.length,
      neighbors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// DOCUMENTATION ENDPOINTS
// ============================================================================

// Fetch documentation for error/API
app.post('/api/docs/fetch', authenticateToken, async (req, res) => {
  try {
    const { language, query, docType = 'error', forceRefresh = false } = req.body;
    
    if (!language || !query) {
      return res.status(400).json({ error: 'Missing required fields: language, query' });
    }

    const result = await docService.fetchDocumentation(language, query, {
      docType,
      forceRefresh
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search documentation
app.get('/api/docs/search', authenticateToken, async (req, res) => {
  try {
    const { language, q, limit } = req.query;
    
    if (!language || !q) {
      return res.status(400).json({ error: 'Missing required params: language, q' });
    }

    const result = await docService.searchDocumentation(language, q, {
      limit: parseInt(limit) || 5
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get related documentation for error category
app.get('/api/docs/related', authenticateToken, async (req, res) => {
  try {
    const { language, errorPattern, errorCategory } = req.query;
    
    if (!language || !errorCategory) {
      return res.status(400).json({ error: 'Missing required params: language, errorCategory' });
    }

    const result = await docService.getRelatedDocs(language, errorPattern, errorCategory);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extract error info from message
app.post('/api/docs/extract-error', authenticateToken, (req, res) => {
  try {
    const { language, errorMessage } = req.body;
    
    if (!language || !errorMessage) {
      return res.status(400).json({ error: 'Missing required fields: language, errorMessage' });
    }

    const result = docService.extractErrorInfo(language, errorMessage);

    if (result) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.json({
        success: false,
        message: 'No error code/pattern found in message'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                                 ║
║   🌌 NEBULA PROTOCOL API SERVER                                ║
║                                                                 ║
║   Status:      Running                                         ║
║   Port:        ${PORT}                                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                 ║
║   Timestamp:   ${new Date().toISOString()}              ║
║                                                                 ║
║   Endpoints:                                                    ║
║   - Health:    GET  /health                                    ║
║   - Auth:      POST /api/auth/token                            ║
║   - Projects:  /api/project/:projectId/*                       ║
║   - KG:        /api/kg/*                                       ║
║                                                                 ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (redisClient) {
    await redisClient.quit();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  if (redisClient) {
    await redisClient.quit();
  }
  process.exit(0);
});

