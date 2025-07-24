const Bull = require('bull');
const config = require('./environment');
const logger = require('../utils/logger');

// Create queue instances with error handling
let aiQueue = null;
let pdfQueue = null;

try {
  aiQueue = new Bull('AI Processing', {
    redis: {
      host: config.QUEUE.REDIS_HOST,
      port: config.QUEUE.REDIS_PORT,
      db: config.QUEUE.REDIS_DB,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: 10,
      removeOnFail: 10
    }
  });

  pdfQueue = new Bull('PDF Generation', {
    redis: {
      host: config.QUEUE.REDIS_HOST,
      port: config.QUEUE.REDIS_PORT,
      db: config.QUEUE.REDIS_DB,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true
    },
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: 5,
      removeOnFail: 5
    }
  });

  logger.info('Queue system initialized (requires Redis)');
} catch (error) {
  logger.info('Queue system unavailable - will process jobs synchronously:', error.message);
}

// AI Queue processors (only if queues are available)
if (aiQueue) {
  aiQueue.process('parseResume', 5, async (job) => {
    const { resumeText } = job.data;
    const aiService = require('../services/aiService');
    
    logger.info(`Processing resume parsing job ${job.id}`);
    
    try {
      const result = await aiService.parseResume(resumeText);
      logger.info(`Resume parsing job ${job.id} completed`);
      return result;
    } catch (error) {
      logger.error(`Resume parsing job ${job.id} failed:`, error);
      throw error;
    }
  });

  aiQueue.process('calculateATS', 3, async (job) => {
    const { resumeData, jobDescription } = job.data;
    const aiService = require('../services/aiService');
    
    logger.info(`Processing ATS calculation job ${job.id}`);
    
    try {
      const result = await aiService.calculateATSScore(resumeData, jobDescription);
      logger.info(`ATS calculation job ${job.id} completed`);
      return result;
    } catch (error) {
      logger.error(`ATS calculation job ${job.id} failed:`, error);
      throw error;
    }
  });

  aiQueue.process('enhanceSection', 5, async (job) => {
    const { sectionData, sectionType, jobDescription } = job.data;
    const aiService = require('../services/aiService');
    
    logger.info(`Processing section enhancement job ${job.id} for ${sectionType}`);
    
    try {
      const result = await aiService.enhanceSection(sectionData, sectionType, jobDescription);
      logger.info(`Section enhancement job ${job.id} completed`);
      return result;
    } catch (error) {
      logger.error(`Section enhancement job ${job.id} failed:`, error);
      throw error;
    }
  });
}

// PDF Queue processors (only if queues are available)
if (pdfQueue) {
  pdfQueue.process('generatePDF', 3, async (job) => {
    const { latex, options } = job.data;
    const pdfService = require('../services/pdfService');
    
    logger.info(`Processing PDF generation job ${job.id}`);
    
    try {
      const result = await pdfService.compileToPDF(latex, options);
      logger.info(`PDF generation job ${job.id} completed`);
      return {
        pdf: result.pdf.toString('base64'), // Convert to base64 for JSON serialization
        size: result.size,
        contentType: result.contentType
      };
    } catch (error) {
      logger.error(`PDF generation job ${job.id} failed:`, error);
      throw error;
    }
  });
}

// Queue event handlers (only if queues are available)
if (aiQueue) {
  aiQueue.on('completed', (job, result) => {
    logger.info(`AI job ${job.id} completed successfully`);
  });

  aiQueue.on('failed', (job, err) => {
    logger.error(`AI job ${job.id} failed:`, err);
  });

  aiQueue.on('stalled', (job) => {
    logger.warn(`AI job ${job.id} stalled`);
  });
}

if (pdfQueue) {
  pdfQueue.on('completed', (job, result) => {
    logger.info(`PDF job ${job.id} completed successfully`);
  });

  pdfQueue.on('failed', (job, err) => {
    logger.error(`PDF job ${job.id} failed:`, err);
  });

  pdfQueue.on('stalled', (job) => {
    logger.warn(`PDF job ${job.id} stalled`);
  });
}

// Queue management functions
async function addAIJob(type, data, options = {}) {
  if (!aiQueue) {
    logger.info('Queue system unavailable - processing AI job synchronously');
    // Process immediately without queue
    const aiService = require('../services/aiService');
    switch (type) {
      case 'parseResume':
        return await aiService.parseResume(data.resumeText);
      case 'calculateATS':
        return await aiService.calculateATSScore(data.resumeData, data.jobDescription);
      case 'enhanceSection':
        return await aiService.enhanceSection(data.sectionData, data.sectionType, data.jobDescription);
      default:
        throw new Error(`Unknown AI job type: ${type}`);
    }
  }

  try {
    const job = await aiQueue.add(type, data, {
      priority: options.priority || 0,
      delay: options.delay || 0,
      ...options
    });
    
    logger.info(`Added AI job ${job.id} of type ${type}`);
    return job;
    
  } catch (error) {
    logger.error(`Failed to add AI job of type ${type}:`, error);
    throw error;
  }
}

async function addPDFJob(type, data, options = {}) {
  if (!pdfQueue) {
    logger.info('Queue system unavailable - processing PDF job synchronously');
    // Process immediately without queue
    const pdfService = require('../services/pdfService');
    switch (type) {
      case 'generatePDF':
        const result = await pdfService.compileToPDF(data.latex, data.options);
        return {
          pdf: result.pdf.toString('base64'),
          size: result.size,
          contentType: result.contentType
        };
      default:
        throw new Error(`Unknown PDF job type: ${type}`);
    }
  }

  try {
    const job = await pdfQueue.add(type, data, {
      priority: options.priority || 0,
      delay: options.delay || 0,
      ...options
    });
    
    logger.info(`Added PDF job ${job.id} of type ${type}`);
    return job;
    
  } catch (error) {
    logger.error(`Failed to add PDF job of type ${type}:`, error);
    throw error;
  }
}

async function getJobStatus(queue, jobId) {
  if (!queue) {
    return { status: 'queue_unavailable', message: 'Queue system not available' };
  }

  try {
    const job = await queue.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }
    
    const state = await job.getState();
    return {
      id: job.id,
      status: state,
      progress: job.progress(),
      data: job.data,
      result: job.returnvalue,
      error: job.failedReason,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : null,
      finishedAt: job.finishedOn ? new Date(job.finishedOn) : null
    };
    
  } catch (error) {
    logger.error(`Failed to get job status for ${jobId}:`, error);
    throw error;
  }
}

async function getQueueStats() {
  if (!aiQueue || !pdfQueue) {
    return {
      ai: { waiting: 0, active: 0, completed: 0, failed: 0, status: 'unavailable' },
      pdf: { waiting: 0, active: 0, completed: 0, failed: 0, status: 'unavailable' }
    };
  }

  try {
    const [aiWaiting, aiActive, aiCompleted, aiFailed] = await Promise.all([
      aiQueue.getWaiting(),
      aiQueue.getActive(),
      aiQueue.getCompleted(),
      aiQueue.getFailed()
    ]);
    
    const [pdfWaiting, pdfActive, pdfCompleted, pdfFailed] = await Promise.all([
      pdfQueue.getWaiting(),
      pdfQueue.getActive(),
      pdfQueue.getCompleted(),
      pdfQueue.getFailed()
    ]);
    
    return {
      ai: {
        waiting: aiWaiting.length,
        active: aiActive.length,
        completed: aiCompleted.length,
        failed: aiFailed.length,
        status: 'available'
      },
      pdf: {
        waiting: pdfWaiting.length,
        active: pdfActive.length,
        completed: pdfCompleted.length,
        failed: pdfFailed.length,
        status: 'available'
      }
    };
    
  } catch (error) {
    logger.error('Failed to get queue stats:', error);
    throw error;
  }
}

async function cleanQueues() {
  if (!aiQueue || !pdfQueue) {
    logger.info('Queue cleanup skipped - queues not available');
    return;
  }

  try {
    await Promise.all([
      aiQueue.clean(24 * 60 * 60 * 1000, 'completed'),
      aiQueue.clean(24 * 60 * 60 * 1000, 'failed'),
      pdfQueue.clean(6 * 60 * 60 * 1000, 'completed'),
      pdfQueue.clean(6 * 60 * 60 * 1000, 'failed')
    ]);
    
    logger.info('Queue cleanup completed');
  } catch (error) {
    logger.error('Queue cleanup failed:', error);
  }
}

// Clean queues periodically
setInterval(cleanQueues, 60 * 60 * 1000); // Every hour

module.exports = {
  aiQueue,
  pdfQueue,
  addAIJob,
  addPDFJob,
  getJobStatus,
  getQueueStats,
  cleanQueues
};