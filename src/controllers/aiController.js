const aiService = require('../services/aiService');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

class AIController {
  constructor() {
    this.upload = upload;
  }

  async parseResume(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No PDF file uploaded'
        });
      }

      logger.info('Parsing uploaded resume PDF');
      
      // Extract text from PDF
      const pdfData = await pdfParse(req.file.buffer);
      const resumeText = pdfData.text;
      
      if (!resumeText || resumeText.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Could not extract text from PDF'
        });
      }
      
      // Parse with AI
      const parsedData = await aiService.parseResume(resumeText);
      
      res.json({
        success: true,
        data: {
          parsed: parsedData,
          extractedText: resumeText,
          fileName: req.file.originalname,
          fileSize: req.file.size
        }
      });
      
    } catch (error) {
      logger.error('Resume parsing error:', error);
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('authentication')) {
        return res.status(500).json({
          success: false,
          error: 'AI service configuration error'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to parse resume'
      });
    }
  }

  async calculateATSScore(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { resumeData, jobDescription } = req.body;
      
      logger.info('Calculating ATS score');
      
      const atsAnalysis = await aiService.calculateATSScore(resumeData, jobDescription);
      
      res.json({
        success: true,
        data: atsAnalysis
      });
      
    } catch (error) {
      logger.error('ATS score calculation error:', error);
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to calculate ATS score'
      });
    }
  }

  async enhanceSection(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { sectionData, sectionType, jobDescription } = req.body;
      
      logger.info(`Enhancing ${sectionType} section`);
      
      const enhancedContent = await aiService.enhanceSection(sectionData, sectionType, jobDescription);
      
      res.json({
        success: true,
        data: {
          enhanced: enhancedContent,
          sectionType,
          original: sectionData
        }
      });
      
    } catch (error) {
      logger.error('Section enhancement error:', error);
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to enhance section'
      });
    }
  }

  async getStatus(req, res) {
    try {
      const status = await aiService.getServiceStatus();
      
      res.json({
        success: true,
        data: status
      });
      
    } catch (error) {
      logger.error('Error checking AI service status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check AI service status'
      });
    }
  }

  async parseResumeText(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { resumeText } = req.body;
      
      logger.info('Parsing resume text');
      
      const parsedData = await aiService.parseResume(resumeText);
      
      res.json({
        success: true,
        data: {
          parsed: parsedData,
          inputText: resumeText
        }
      });
      
    } catch (error) {
      logger.error('Resume text parsing error:', error);
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to parse resume text'
      });
    }
  }
}

module.exports = new AIController();