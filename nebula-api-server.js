#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { ProjectMemory } from './project-memory.js';
import { StarChart } from './star-chart.js';
import { DocumentationService } from './nebula-docs-service.js';
import fs from 'fs';
import path from 'path';
import { createClient } from 'redis';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

// Initialize Redis client for doc caching
let redisClient = null;
if (process.env.REDIS_HOST) {
  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT || 6379
    }
  });
  
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  redisClient.on('connect', () => console.log('Redis Client Connected'));
  
  redisClient.connect().catch(console.error);
}

// Initialize Documentation Service
const docService = new DocumentationService(redisClient);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

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

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: 'running',
      postgres: process.env.POSTGRES_HOST ? 'configured' : 'not_configured',
      redis: process.env.REDIS_HOST ? 'configured' : 'not_configured'
    }
  });
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
// PROJECT MEMORY ENDPOINTS
// ============================================================================

// Initialize project memory
app.post('/api/project/:projectId/init', authenticateToken, (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, framework } = req.body;
    
    const projectPath = path.join('/app/projects', projectId);
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    const memory = new ProjectMemory(projectPath, name, framework);
    memory.close();

    res.json({
      success: true,
      projectId,
      message: 'Project memory initialized',
      path: projectPath
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project version
app.get('/api/project/:projectId/version', authenticateToken, (req, res) => {
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

// Log error (with automatic doc fetching)
app.post('/api/project/:projectId/error', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { language, framework } = req.body;
    const projectPath = path.join('/app/projects', projectId);
    
    const memory = new ProjectMemory(projectPath);
    const result = memory.logError(req.body);
    
    // Automatically fetch relevant documentation
    let docSuggestion = null;
    if (language && req.body.message) {
      const errorInfo = docService.extractErrorInfo(language, req.body.message);
      if (errorInfo) {
        try {
          const docs = await docService.fetchDocumentation(
            language,
            errorInfo.code,
            { docType: 'error' }
          );
          docSuggestion = docs.data;
        } catch (docError) {
          console.error('Doc fetch error:', docError);
        }
      }
    }
    
    memory.close();

    res.json({
      success: true,
      ...result,
      documentation: docSuggestion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record solution
app.post('/api/project/:projectId/solution', authenticateToken, (req, res) => {
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

// Record Star Gate
app.post('/api/project/:projectId/star-gate', authenticateToken, (req, res) => {
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

// Get project statistics
app.get('/api/project/:projectId/stats', authenticateToken, (req, res) => {
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

