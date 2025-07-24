const pdfService = require('../services/pdfService');
const templateService = require('../services/templateService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class PDFController {
  async generatePDF(req, res) {
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

      const { templateName, data, options = {} } = req.body;
      
      logger.info(`Generating PDF for template: ${templateName}`);
      
      // First generate LaTeX
      const latex = await templateService.generateLatex(templateName, data);
      
      // Then compile to PDF
      const result = await pdfService.compileToPDF(latex, options);
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
      res.setHeader('Content-Length', result.size);
      
      // Send the PDF
      res.send(result.pdf);
      
    } catch (error) {
      logger.error('PDF generation error:', error);
      
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
      
      if (error.message.includes('unavailable') || error.message.includes('service')) {
        return res.status(503).json({
          success: false,
          error: 'PDF generation service is temporarily unavailable'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate PDF'
      });
    }
  }

  async compilePDF(req, res) {
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

      const { latex, options = {} } = req.body;
      
      logger.info('Compiling LaTeX to PDF');
      
      const result = await pdfService.compileToPDF(latex, options);
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
      res.setHeader('Content-Length', result.size);
      
      // Send the PDF
      res.send(result.pdf);
      
    } catch (error) {
      logger.error('PDF compilation error:', error);
      
      if (error.message.includes('unavailable') || error.message.includes('service')) {
        return res.status(503).json({
          success: false,
          error: 'PDF compilation service is temporarily unavailable'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to compile PDF'
      });
    }
  }

  async getStatus(req, res) {
    try {
      const status = await pdfService.getCompilationStatus();
      
      res.json({
        success: true,
        data: status
      });
      
    } catch (error) {
      logger.error('Error checking PDF service status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check PDF service status'
      });
    }
  }

  async clearCache(req, res) {
    try {
      pdfService.clearCache();
      
      res.json({
        success: true,
        message: 'PDF cache cleared successfully'
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

module.exports = new PDFController();