const aiService = require('../services/aiService');
const aiServiceCoordinator = require('../services/ai');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const pdf2pic = require('pdf2pic');
const sharp = require('sharp');
const pdfPoppler = require('pdf-poppler');

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
    // Bind methods to preserve 'this' context when used as callbacks
    this.parseResume = this.parseResume.bind(this);
    this.convertPdfToImages = this.convertPdfToImages.bind(this);
    this.calculateATSScore = this.calculateATSScore.bind(this);
    this.enhanceSection = this.enhanceSection.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.parseResumeText = this.parseResumeText.bind(this);
    this.enhanceFullResume = this.enhanceFullResume.bind(this);
    this.enhanceSectionWithTemplate = this.enhanceSectionWithTemplate.bind(this);
    this.getTemplateRecommendation = this.getTemplateRecommendation.bind(this);
    this.getTemplateCapabilities = this.getTemplateCapabilities.bind(this);
    this.getAvailableTemplates = this.getAvailableTemplates.bind(this);
    this.getEnhancedStatus = this.getEnhancedStatus.bind(this);
  }

  async convertPdfToImages(pdfBuffer) {
    try {
      logger.info('Converting PDF to images for vision processing using system poppler');
      
      const fs = require('fs');
      const path = require('path');
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Write buffer to temporary file
      const tempPdfPath = path.join('./temp', `temp_${Date.now()}.pdf`);
      const outputPrefix = path.join('./temp', `resume_${Date.now()}`);
      
      fs.writeFileSync(tempPdfPath, pdfBuffer);
      
      // Use system's pdftoppm (more reliable than bundled binary)
      const command = `pdftoppm -png -r 300 -scale-to 2048 "${tempPdfPath}" "${outputPrefix}"`;
      
      logger.info(`Executing: ${command}`);
      await execAsync(command);
      
      // Find generated PNG files
      const tempDir = './temp';
      const files = fs.readdirSync(tempDir);
      const pngFiles = files
        .filter(file => file.startsWith(path.basename(outputPrefix)) && file.endsWith('.png'))
        .sort()
        .map(file => path.join(tempDir, file));
      
      if (pngFiles.length === 0) {
        throw new Error('No PNG files were generated from PDF');
      }
      
      // Read the generated images into buffers
      const imageBuffers = [];
      for (const imagePath of pngFiles) {
        const imageBuffer = fs.readFileSync(imagePath);
        
        // Optimize with Sharp for better OCR
        const optimizedBuffer = await sharp(imageBuffer)
          .sharpen() // Sharpen text for better OCR
          .modulate({
            brightness: 1.1, // Slightly brighten
            contrast: 1.2    // Increase contrast
          })
          .png({ 
            quality: 100, // Maximum quality for OCR
            compressionLevel: 1
          })
          .resize(3000, 4000, { // Higher resolution for better text recognition
            fit: 'inside',
            withoutEnlargement: true
          })
          .toBuffer();
          
        imageBuffers.push(optimizedBuffer);
        
        // Clean up temporary image file
        fs.unlinkSync(imagePath);
      }
      
      // Clean up temporary PDF file
      fs.unlinkSync(tempPdfPath);
      
      logger.info(`Successfully converted PDF to ${imageBuffers.length} optimized images`);
      return imageBuffers;
      
    } catch (error) {
      logger.error('PDF to image conversion failed:', error);
      throw new Error(`PDF to image conversion failed: ${error.message}`);
    }
  }

  async parseResume(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No PDF file uploaded'
        });
      }

      logger.info('Parsing uploaded resume PDF using vision-based approach');
      
      // Convert PDF to images
      const imageBuffers = await this.convertPdfToImages(req.file.buffer);
      
      if (!imageBuffers || imageBuffers.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Could not convert PDF to images'
        });
      }
      
      // Parse using vision-based approach
      const parsedData = await aiService.parseResumeFromImages(imageBuffers);
      
      // Also extract text as fallback info (but don't use for parsing)
      let extractedText = '';
      try {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text;
      } catch (textError) {
        logger.warn('Text extraction failed, but image parsing succeeded:', textError);
      }
      
      res.json({
        success: true,
        data: {
          parsed: parsedData,
          extractedText: extractedText, // For debugging/fallback purposes
          fileName: req.file.originalname,
          fileSize: req.file.size,
          pagesProcessed: imageBuffers.length,
          processingMethod: 'vision-based'
        }
      });
      
    } catch (error) {
      logger.error('Image-based resume parsing failed:', error);
      
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

      const { sectionData, sectionType, jobDescription, templateName } = req.body;
      
      // Use template-specific enhancement if templateName is provided, otherwise default to professional
      const templateToUse = templateName || 'professional';
      
      logger.info(`Enhancing ${sectionType} section with ${templateToUse} template`);
      
      // Use template-specific enhancement
      const enhancedResult = await aiServiceCoordinator.enhanceSectionWithTemplate(
        templateToUse, 
        sectionData, 
        sectionType, 
        jobDescription || ''
      );
      
      res.json({
        success: true,
        data: {
          enhanced: enhancedResult.enhanced,
          templateUsed: enhancedResult.templateUsed,
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

  // NEW TEMPLATE-AWARE METHODS

  async enhanceFullResume(req, res) {
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

      const { templateName, resumeData, jobDescription, enhancementType } = req.body;
      
      logger.info(`Enhancing full resume with template: ${templateName}`);
      
      const enhancedResult = await aiServiceCoordinator.enhanceFullResume(
        templateName, 
        resumeData, 
        jobDescription || '', 
        enhancementType || 'general'
      );
      
      res.json({
        success: true,
        data: enhancedResult
      });
      
    } catch (error) {
      logger.error('Template-aware full resume enhancement error:', error);
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('not found') || error.message.includes('Unsupported template')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to enhance full resume'
      });
    }
  }

  async enhanceSectionWithTemplate(req, res) {
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

      const { templateName, sectionData, sectionType, jobDescription } = req.body;
      
      logger.info(`Enhancing ${sectionType} section with template: ${templateName}`);
      
      const enhancedResult = await aiServiceCoordinator.enhanceSectionWithTemplate(
        templateName, 
        sectionData, 
        sectionType, 
        jobDescription || ''
      );
      
      res.json({
        success: true,
        data: enhancedResult
      });
      
    } catch (error) {
      logger.error('Template-aware section enhancement error:', error);
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('not found') || error.message.includes('Unsupported')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to enhance section with template'
      });
    }
  }

  async getTemplateRecommendation(req, res) {
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
      
      logger.info('Getting template recommendation');
      
      const recommendation = await aiServiceCoordinator.getTemplateRecommendation(
        resumeData, 
        jobDescription || ''
      );
      
      res.json({
        success: true,
        data: recommendation
      });
      
    } catch (error) {
      logger.error('Template recommendation error:', error);
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to get template recommendation'
      });
    }
  }

  async getTemplateCapabilities(req, res) {
    try {
      const { templateName } = req.params;
      
      logger.info(`Getting capabilities for template: ${templateName || 'all'}`);
      
      const capabilities = await aiServiceCoordinator.getTemplateCapabilities(templateName);
      
      res.json({
        success: true,
        data: capabilities
      });
      
    } catch (error) {
      logger.error('Template capabilities error:', error);
      
      if (error.message.includes('not found') || error.message.includes('Unsupported template')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to get template capabilities'
      });
    }
  }

  async getAvailableTemplates(req, res) {
    try {
      logger.info('Getting available templates');
      
      const templates = aiServiceCoordinator.getAvailableTemplates();
      
      res.json({
        success: true,
        data: {
          templates,
          count: templates.length
        }
      });
      
    } catch (error) {
      logger.error('Available templates error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to get available templates'
      });
    }
  }

  async getEnhancedStatus(req, res) {
    try {
      const status = await aiServiceCoordinator.getEnhancedServiceStatus();
      
      res.json({
        success: true,
        data: status
      });
      
    } catch (error) {
      logger.error('Error checking enhanced AI service status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check enhanced AI service status'
      });
    }
  }
}

module.exports = new AIController();