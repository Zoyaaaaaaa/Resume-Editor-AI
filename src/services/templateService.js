const { generateTemplate, getAvailableTemplates, validateTemplateData } = require('../templates');
const logger = require('../utils/logger');

class TemplateService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  async generateLatex(templateName, data) {
    try {
      logger.info(`Generating LaTeX for template: ${templateName}`);
      
      // Validate input data
      validateTemplateData(data);
      
      // Generate cache key
      const cacheKey = this.generateCacheKey(templateName, data);
      
      // Check cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        logger.info('Returning cached LaTeX template');
        return cached;
      }
      
      // Generate new template
      const latex = generateTemplate(templateName, data);
      
      // Cache the result
      this.setCache(cacheKey, latex);
      
      logger.info('LaTeX template generated successfully');
      return latex;
      
    } catch (error) {
      logger.error('Error generating LaTeX template:', error);
      throw error;
    }
  }

  getTemplates() {
    try {
      return getAvailableTemplates();
    } catch (error) {
      logger.error('Error getting available templates:', error);
      throw error;
    }
  }

  validateData(data) {
    try {
      return validateTemplateData(data);
    } catch (error) {
      logger.error('Template data validation failed:', error);
      throw error;
    }
  }

  generateCacheKey(templateName, data) {
    // Create a simple hash of the data for caching
    const dataString = JSON.stringify(data);
    const hash = require('crypto').createHash('md5').update(dataString).digest('hex');
    return `${templateName}_${hash}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    // Remove expired cache
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Clean old cache entries periodically
    if (this.cache.size > 100) {
      this.cleanOldCache();
    }
  }

  cleanOldCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  clearCache() {
    this.cache.clear();
    logger.info('Template cache cleared');
  }
}

module.exports = new TemplateService();