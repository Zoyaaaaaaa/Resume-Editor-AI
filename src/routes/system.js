const express = require('express');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const redisService = require('../config/redis');
const pdfService = require('../services/pdfService');
const aiService = require('../services/aiService');
const templateService = require('../services/templateService');
const { getQueueStats } = require('../config/queue');
const logger = require('../utils/logger');

const router = express.Router();

// Comprehensive health check
router.get('/health', async (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    checks: {}
  };

  try {
    // Check Redis connection
    const redisStatus = await redisService.getStatus();
    healthData.checks.redis = {
      status: redisStatus.connected ? 'healthy' : 'unhealthy',
      details: redisStatus
    };

    // Check AI service
    const aiStatus = await aiService.getServiceStatus();
    healthData.checks.ai = {
      status: aiStatus.available ? 'healthy' : 'unhealthy',
      details: aiStatus
    };

    // Check PDF service
    const pdfStatus = await pdfService.getCompilationStatus();
    healthData.checks.pdf = {
      status: pdfStatus.available ? 'healthy' : 'unhealthy',
      details: pdfStatus
    };

    // Check queue system
    try {
      const queueStats = await getQueueStats();
      healthData.checks.queues = {
        status: 'healthy',
        details: queueStats
      };
    } catch (error) {
      healthData.checks.queues = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Determine overall status
    const unhealthyChecks = Object.values(healthData.checks).filter(
      check => check.status === 'unhealthy'
    );

    if (unhealthyChecks.length > 0) {
      healthData.status = 'degraded';
      res.status(200); // Still return 200 for degraded service
    }

    res.json({
      success: true,
      data: healthData
    });

  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      success: false,
      data: {
        ...healthData,
        status: 'unhealthy',
        error: error.message
      }
    });
  }
});

// System information
router.get('/info', (req, res) => {
  try {
    const systemInfo = {
      server: {
        platform: process.platform,
        architecture: process.arch,
        nodeVersion: process.version,
        pid: process.pid,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      system: {
        hostname: os.hostname(),
        type: os.type(),
        release: os.release(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length,
        loadAverage: os.loadavg()
      },
      process: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        env: process.env.NODE_ENV || 'development'
      }
    };

    res.json({
      success: true,
      data: systemInfo
    });

  } catch (error) {
    logger.error('System info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system information'
    });
  }
});

// Get application metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      system: {
        loadAverage: os.loadavg(),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
        cpuCount: os.cpus().length
      }
    };

    // Add queue metrics if available
    try {
      const queueStats = await getQueueStats();
      metrics.queues = queueStats;
    } catch (error) {
      logger.warn('Could not get queue metrics:', error);
    }

    // Add cache hit rates if Redis is available
    try {
      const redisStatus = await redisService.getStatus();
      metrics.cache = {
        connected: redisStatus.connected,
        status: redisStatus.connected ? 'operational' : 'unavailable'
      };
    } catch (error) {
      metrics.cache = { status: 'unavailable' };
    }

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    logger.error('Metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics'
    });
  }
});

// Get application logs (last N entries)
router.get('/logs/:type?', async (req, res) => {
  try {
    const { type = 'combined' } = req.params;
    const { lines = 100 } = req.query;

    const validTypes = ['combined', 'error', 'access'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid log type. Valid types: ${validTypes.join(', ')}`
      });
    }

    const logFile = path.join(process.cwd(), 'logs', `${type}.log`);
    
    try {
      const logContent = await fs.readFile(logFile, 'utf8');
      const logLines = logContent.split('\n').filter(line => line.trim());
      const recentLines = logLines.slice(-parseInt(lines));

      res.json({
        success: true,
        data: {
          type,
          totalLines: logLines.length,
          returnedLines: recentLines.length,
          logs: recentLines.map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return { message: line, timestamp: null };
            }
          })
        }
      });

    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        res.json({
          success: true,
          data: {
            type,
            totalLines: 0,
            returnedLines: 0,
            logs: [],
            message: 'Log file not found'
          }
        });
      } else {
        throw fileError;
      }
    }

  } catch (error) {
    logger.error('Logs retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve logs'
    });
  }
});

// Clear all caches
router.post('/cache/clear', async (req, res) => {
  try {
    const results = {};

    // Clear template cache
    try {
      templateService.clearCache();
      results.templates = 'cleared';
    } catch (error) {
      results.templates = `error: ${error.message}`;
    }

    // Clear PDF cache
    try {
      pdfService.clearCache();
      results.pdf = 'cleared';
    } catch (error) {
      results.pdf = `error: ${error.message}`;
    }

    // Clear Redis cache
    try {
      const redisCleared = await redisService.flushAll();
      results.redis = redisCleared ? 'cleared' : 'unavailable';
    } catch (error) {
      results.redis = `error: ${error.message}`;
    }

    res.json({
      success: true,
      data: {
        message: 'Cache clearing completed',
        results
      }
    });

  } catch (error) {
    logger.error('Cache clearing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear caches'
    });
  }
});

// Force garbage collection (if available)
router.post('/gc', (req, res) => {
  try {
    if (global.gc) {
      const memBefore = process.memoryUsage();
      global.gc();
      const memAfter = process.memoryUsage();

      res.json({
        success: true,
        data: {
          message: 'Garbage collection forced',
          memoryBefore: memBefore,
          memoryAfter: memAfter,
          freed: {
            rss: memBefore.rss - memAfter.rss,
            heapUsed: memBefore.heapUsed - memAfter.heapUsed,
            external: memBefore.external - memAfter.external
          }
        }
      });
    } else {
      res.json({
        success: false,
        error: 'Garbage collection not available. Start with --expose-gc flag.'
      });
    }

  } catch (error) {
    logger.error('Garbage collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform garbage collection'
    });
  }
});

module.exports = router;