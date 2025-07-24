const templateService = require('../services/templateService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class TemplateController {
  async getTemplates(req, res) {
    try {
      const templates = templateService.getTemplates();
      
      res.json({
        success: true,
        data: templates
      });
      
    } catch (error) {
      logger.error('Error fetching templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates'
      });
    }
  }

  async generateLatex(req, res) {
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

      const { templateName, data } = req.body;
      
      logger.info(`Generating LaTeX template: ${templateName}`);
      
      const latex = await templateService.generateLatex(templateName, data);
      
      res.json({
        success: true,
        data: {
          latex,
          template: templateName,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      logger.error('LaTeX generation error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('Validation')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate LaTeX template'
      });
    }
  }

  async validateData(req, res) {
    try {
      const { data } = req.body;
      
      templateService.validateData(data);
      
      res.json({
        success: true,
        message: 'Data validation passed'
      });
      
    } catch (error) {
      logger.error('Data validation error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async clearCache(req, res) {
    try {
      templateService.clearCache();
      
      res.json({
        success: true,
        message: 'Template cache cleared successfully'
      });
      
    } catch (error) {
      logger.error('Cache clearing error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache'
      });
    }
  }
}

module.exports = new TemplateController();