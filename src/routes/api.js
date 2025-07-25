const express = require('express');
const { body, param, query } = require('express-validator');
const templateController = require('../controllers/templateController');
const pdfController = require('../controllers/pdfController');
const aiController = require('../controllers/aiController');
const { aiLimiter, pdfLimiter, generalLimiter } = require('../middleware/rateLimiter');
const { getAvailableTemplates, createTemplateValidator } = require('../utils/templateUtils');

// Import additional route modules
const queueRoutes = require('./queue');
const systemRoutes = require('./system');

const router = express.Router();

// ===========================================
// TEMPLATE ROUTES
// ===========================================

/**
 * GET /api/templates
 * Get all available resume templates
 */
router.get('/templates', templateController.getTemplates);

/**
 * POST /api/templates/generate
 * Generate LaTeX code from template and data
 */
router.post('/templates/generate', [
  body('templateName')
    .notEmpty()
    .withMessage('Template name is required')
    .custom(createTemplateValidator()),
  body('data')
    .isObject()
    .withMessage('Resume data must be an object'),
  body('data.personalInfo.name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('data.personalInfo.email')
    .isEmail()
    .withMessage('Valid email is required')
], templateController.generateLatex);

/**
 * POST /api/templates/validate
 * Validate resume data structure
 */
router.post('/templates/validate', [
  body('data').isObject().withMessage('Resume data must be an object')
], templateController.validateData);

/**
 * GET /api/templates/:templateName/preview
 * Get template preview information
 */
router.get('/templates/:templateName/preview', [
  param('templateName')
    .custom(createTemplateValidator())
], (req, res) => {
  const { templateName } = req.params;
  const templates = {
    professional: {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, traditional resume format suitable for corporate environments',
      features: ['Clean layout', 'Professional formatting', 'ATS-friendly', 'Traditional design'],
      preview: '/assets/previews/professional.png'
    },
    modern: {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary design with colors and icons, perfect for creative roles',
      features: ['Colorful design', 'Icon integration', 'Modern typography', 'Creative layout'],
      preview: '/assets/previews/modern.png'
    }
  };

  res.json({
    success: true,
    data: templates[templateName] || null
  });
});

/**
 * DELETE /api/templates/cache
 * Clear template cache (admin only)
 */
router.delete('/templates/cache', templateController.clearCache);

// ===========================================
// PDF ROUTES
// ===========================================

/**
 * POST /api/pdf/generate
 * Generate PDF from template and resume data
 */
router.post('/pdf/generate', pdfLimiter, [
  body('templateName')
    .notEmpty()
    .withMessage('Template name is required')
    .custom(createTemplateValidator()),
  body('data')
    .isObject()
    .withMessage('Resume data must be an object'),
  body('data.personalInfo.name')
    .notEmpty()
    .withMessage('Name is required'),
  body('data.personalInfo.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object')
], pdfController.generatePDF);

/**
 * POST /api/pdf/compile
 * Compile LaTeX directly to PDF
 */
router.post('/pdf/compile', pdfLimiter, [
  body('latex')
    .notEmpty()
    .withMessage('LaTeX content is required')
    .isLength({ min: 100, max: 50000 })
    .withMessage('LaTeX content must be between 100 and 50,000 characters'),
  body('options.compiler')
    .optional()
    .isIn(['pdflatex', 'xelatex', 'lualatex'])
    .withMessage('Invalid compiler option')
], pdfController.compilePDF);

/**
 * GET /api/pdf/status
 * Check PDF compilation service status
 */
router.get('/pdf/status', pdfController.getStatus);

/**
 * DELETE /api/pdf/cache
 * Clear PDF cache
 */
router.delete('/pdf/cache', pdfController.clearCache);

// ===========================================
// AI ROUTES
// ===========================================

/**
 * POST /api/ai/parse-resume
 * Parse uploaded PDF resume using AI
 */
router.post('/ai/parse-resume', 
  aiLimiter,
  aiController.upload.single('resume'),
  aiController.parseResume
);

/**
 * POST /api/ai/parse-text
 * Parse resume from plain text using AI
 */
router.post('/ai/parse-text', aiLimiter, [
  body('resumeText')
    .notEmpty()
    .withMessage('Resume text is required')
    .isLength({ min: 50, max: 10000 })
    .withMessage('Resume text must be between 50 and 10,000 characters')
], aiController.parseResumeText);

/**
 * POST /api/ai/ats-score
 * Calculate ATS compatibility score
 */
router.post('/ai/ats-score', aiLimiter, [
  body('resumeData')
    .isObject()
    .withMessage('Resume data must be an object'),
  body('jobDescription')
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage('Job description must be a string with max 5000 characters')
], aiController.calculateATSScore);

/**
 * POST /api/ai/enhance-section
 * Enhance a specific resume section using AI (now template-aware)
 */
router.post('/ai/enhance-section', aiLimiter, [
  body('sectionData')
    .exists()
    .withMessage('Section data is required'),
  body('sectionType')
    .notEmpty()
    .withMessage('Section type is required')
    .isIn(['professionalSummary', 'experience', 'skills', 'education', 'projects'])
    .withMessage('Invalid section type'),
  body('jobDescription')
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage('Job description must be a string with max 5000 characters'),
  body('templateName')
    .optional()
    .custom(createTemplateValidator())
], aiController.enhanceSection);

/**
 * POST /api/ai/bulk-enhance
 * Enhance multiple resume sections in batch
 */
router.post('/ai/bulk-enhance', aiLimiter, [
  body('sections')
    .isArray({ min: 1, max: 5 })
    .withMessage('Sections must be an array with 1-5 items'),
  body('sections.*.sectionType')
    .isIn(['professionalSummary', 'experience', 'skills', 'education', 'projects'])
    .withMessage('Invalid section type'),
  body('sections.*.sectionData')
    .exists()
    .withMessage('Section data is required for all sections'),
  body('jobDescription')
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage('Job description must be a string with max 5000 characters')
], async (req, res) => {
  // This would be implemented in the AI controller
  res.status(501).json({
    success: false,
    error: 'Bulk enhancement feature coming soon'
  });
});

/**
 * GET /api/ai/status
 * Check AI service status and availability
 */
router.get('/ai/status', aiController.getStatus);

/**
 * GET /api/ai/enhanced-status
 * Check enhanced AI service status with template information
 */
router.get('/ai/enhanced-status', aiController.getEnhancedStatus);

/**
 * POST /api/ai/enhance-full-resume
 * Enhance full resume using template-specific AI prompts
 */
router.post('/ai/enhance-full-resume', aiLimiter, [
  body('templateName')
    .notEmpty()
    .withMessage('Template name is required')
    .custom(createTemplateValidator()),
  body('resumeData')
    .isObject()
    .withMessage('Resume data must be an object'),
  body('jobDescription')
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage('Job description must be a string with max 5000 characters'),
  body('enhancementType')
    .optional()
    .isString()
    .isIn(['general', 'ats-optimization', 'executive-level', 'creativity-focused', 'tech-innovation', 'user-experience-focused'])
    .withMessage('Invalid enhancement type')
], aiController.enhanceFullResume);

/**
 * POST /api/ai/enhance-section-template
 * Enhance resume section using template-specific AI prompts
 */
router.post('/ai/enhance-section-template', aiLimiter, [
  body('templateName')
    .notEmpty()
    .withMessage('Template name is required')
    .custom(createTemplateValidator()),
  body('sectionData')
    .exists()
    .withMessage('Section data is required'),
  body('sectionType')
    .notEmpty()
    .withMessage('Section type is required')
    .isIn(['professionalSummary', 'experience', 'skills', 'education', 'projects'])
    .withMessage('Invalid section type'),
  body('jobDescription')
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage('Job description must be a string with max 5000 characters')
], aiController.enhanceSectionWithTemplate);

/**
 * POST /api/ai/template-recommendation
 * Get AI recommendation for best resume template based on content and job description
 */
router.post('/ai/template-recommendation', aiLimiter, [
  body('resumeData')
    .isObject()
    .withMessage('Resume data must be an object'),
  body('jobDescription')
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage('Job description must be a string with max 5000 characters')
], aiController.getTemplateRecommendation);

/**
 * GET /api/ai/templates
 * Get available AI templates and their information
 */
router.get('/ai/templates', aiController.getAvailableTemplates);

/**
 * GET /api/ai/templates/:templateName/capabilities
 * Get capabilities and supported features for a specific template
 */
router.get('/ai/templates/:templateName/capabilities', [
  param('templateName')
    .custom(createTemplateValidator())
], aiController.getTemplateCapabilities);

/**
 * GET /api/ai/templates/capabilities
 * Get capabilities for all available templates
 */
router.get('/ai/templates/capabilities', (req, res, next) => {
  req.params.templateName = null;
  aiController.getTemplateCapabilities(req, res, next);
});

/**
 * GET /api/ai/usage
 * Get AI service usage statistics
 */
router.get('/ai/usage', (req, res) => {
  // This would track API usage, token consumption, etc.
  res.json({
    success: true,
    data: {
      message: 'Usage tracking feature coming soon',
      endpoints: {
        'parse-resume': 'PDF resume parsing',
        'parse-text': 'Text resume parsing', 
        'ats-score': 'ATS compatibility scoring',
        'enhance-section': 'Section enhancement (backward compatible)',
        'enhance-full-resume': 'Template-aware full resume enhancement',
        'enhance-section-template': 'Template-aware section enhancement',
        'template-recommendation': 'AI-powered template recommendation',
        'templates': 'Available AI templates',
        'capabilities': 'Template capabilities and features'
      }
    }
  });
});

// ===========================================
// QUEUE MANAGEMENT ROUTES
// ===========================================

/**
 * Queue management routes
 * /api/queue/* - Handle background job processing
 */
router.use('/queue', queueRoutes);

// ===========================================
// SYSTEM & MONITORING ROUTES
// ===========================================

/**
 * System monitoring and health routes
 * /api/system/* - System information and health checks
 */
router.use('/system', systemRoutes);

// ===========================================
// UTILITY ROUTES
// ===========================================

/**
 * GET /api/health
 * Basic health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * GET /api/version
 * Get application version and build information
 */
router.get('/version', (req, res) => {
  const packageJson = require('../../package.json');
  
  res.json({
    success: true,
    data: {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * GET /api/features
 * Get available features and capabilities
 */
router.get('/features', (req, res) => {
  res.json({
    success: true,
    data: {
      templates: getAvailableTemplates(),
      aiFeatures: [
        'resume-parsing',
        'ats-scoring', 
        'content-enhancement',
        'keyword-optimization'
      ],
      exportFormats: ['pdf', 'latex'],
      maxFileSize: '10MB',
      supportedFormats: ['pdf'],
      rateLimit: {
        general: '100 requests per 15 minutes',
        ai: '10 requests per minute',
        pdf: '20 requests per 5 minutes'
      },
      cache: {
        templates: '5 minutes',
        pdf: '10 minutes',
        redis: 'available'
      }
    }
  });
});

module.exports = router;