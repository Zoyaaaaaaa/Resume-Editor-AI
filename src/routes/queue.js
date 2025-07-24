const express = require('express');
const { getQueueStats, getJobStatus, aiQueue, pdfQueue, cleanQueues } = require('../config/queue');
const logger = require('../utils/logger');

const router = express.Router();

// Get queue statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await getQueueStats();
    
    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        queues: stats
      }
    });
    
  } catch (error) {
    logger.error('Error getting queue stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get queue statistics'
    });
  }
});

// Get specific job status
router.get('/job/:queueType/:jobId', async (req, res) => {
  try {
    const { queueType, jobId } = req.params;
    
    let queue;
    switch (queueType) {
      case 'ai':
        queue = aiQueue;
        break;
      case 'pdf':
        queue = pdfQueue;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid queue type. Use "ai" or "pdf"'
        });
    }
    
    const jobStatus = await getJobStatus(queue, jobId);
    
    res.json({
      success: true,
      data: jobStatus
    });
    
  } catch (error) {
    logger.error(`Error getting job status for ${req.params.jobId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to get job status'
    });
  }
});

// Clean old completed and failed jobs
router.post('/clean', async (req, res) => {
  try {
    await cleanQueues();
    
    res.json({
      success: true,
      message: 'Queue cleanup completed successfully'
    });
    
  } catch (error) {
    logger.error('Error cleaning queues:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clean queues'
    });
  }
});

// Get active jobs for a specific queue
router.get('/:queueType/active', async (req, res) => {
  try {
    const { queueType } = req.params;
    
    let queue;
    switch (queueType) {
      case 'ai':
        queue = aiQueue;
        break;
      case 'pdf':
        queue = pdfQueue;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid queue type. Use "ai" or "pdf"'
        });
    }
    
    const activeJobs = await queue.getActive();
    const jobsData = await Promise.all(
      activeJobs.map(async (job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        progress: job.progress(),
        createdAt: new Date(job.timestamp),
        processedAt: job.processedOn ? new Date(job.processedOn) : null
      }))
    );
    
    res.json({
      success: true,
      data: {
        queueType,
        activeJobs: jobsData,
        count: jobsData.length
      }
    });
    
  } catch (error) {
    logger.error(`Error getting active jobs for ${req.params.queueType}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active jobs'
    });
  }
});

// Pause/Resume queue
router.post('/:queueType/:action', async (req, res) => {
  try {
    const { queueType, action } = req.params;
    
    if (!['pause', 'resume'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use "pause" or "resume"'
      });
    }
    
    let queue;
    switch (queueType) {
      case 'ai':
        queue = aiQueue;
        break;
      case 'pdf':
        queue = pdfQueue;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid queue type. Use "ai" or "pdf"'
        });
    }
    
    if (action === 'pause') {
      await queue.pause();
      logger.info(`${queueType} queue paused`);
    } else {
      await queue.resume();
      logger.info(`${queueType} queue resumed`);
    }
    
    res.json({
      success: true,
      message: `${queueType} queue ${action}d successfully`
    });
    
  } catch (error) {
    logger.error(`Error ${req.params.action}ing ${req.params.queueType} queue:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to ${req.params.action} queue`
    });
  }
});

module.exports = router;