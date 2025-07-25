const aiServiceCoordinator = require('./ai');
const config = require('../config/environment');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.apiKey = config.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    this.coordinator = aiServiceCoordinator;
    
    // Log integration status
    logger.info('Legacy AI Service initialized with new template-aware architecture');
  }

  async parseResume(resumeText) {
    try {
      logger.info('Legacy AI Service: Delegating resume parsing to new architecture');
      
      // Delegate to the new coordinator's base functionality
      return await this.coordinator.parseResume(resumeText);
      
    } catch (error) {
      logger.error('Legacy AI Service: Resume parsing failed:', error);
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
  }

  async parseResumeFromImages(imageBuffers) {
    try {
      logger.info('Legacy AI Service: Delegating image-based resume parsing to new architecture');
      
      // Delegate to the new coordinator's image-based functionality
      return await this.coordinator.parseResumeFromImages(imageBuffers);
      
    } catch (error) {
      logger.error('Legacy AI Service: Image-based resume parsing failed:', error);
      throw new Error(`Image-based resume parsing failed: ${error.message}`);
    }
  }

  async calculateATSScore(resumeData, jobDescription = '') {
    try {
      logger.info('Legacy AI Service: Delegating ATS score calculation to new architecture');
      
      // Delegate to the new coordinator's base functionality
      return await this.coordinator.calculateATSScore(resumeData, jobDescription);
      
    } catch (error) {
      logger.error('Legacy AI Service: ATS score calculation failed:', error);
      throw new Error(`ATS score calculation failed: ${error.message}`);
    }
  }

  async enhanceSection(sectionData, sectionType, jobDescription = '') {
    try {
      logger.info(`Legacy AI Service: Delegating ${sectionType} section enhancement to new architecture (using professional template as default)`);
      
      // Delegate to the new coordinator with backward compatibility (defaults to professional template)
      const result = await this.coordinator.enhanceSection(sectionData, sectionType, jobDescription);
      
      // Maintain backward compatibility by returning just the enhanced content (not the full result object)
      if (result && typeof result === 'object' && result.enhanced) {
        return result.enhanced;
      }
      
      return result;
      
    } catch (error) {
      logger.error(`Legacy AI Service: Section enhancement failed for ${sectionType}:`, error);
      throw new Error(`Section enhancement failed: ${error.message}`);
    }
  }

  async getServiceStatus() {
    try {
      logger.info('Legacy AI Service: Delegating service status check to new architecture');
      
      // Get enhanced status from the new coordinator but return in legacy format
      const enhancedStatus = await this.coordinator.getEnhancedServiceStatus();
      
      // Return backward-compatible format
      return {
        available: enhancedStatus.available,
        apiKey: this.apiKey ? 'configured' : 'missing',
        legacy: true,
        enhanced: enhancedStatus
      };
      
    } catch (error) {
      logger.error('Legacy AI Service: Service status check failed:', error);
      return {
        available: false,
        error: error.message,
        apiKey: this.apiKey ? 'configured' : 'missing',
        legacy: true
      };
    }
  }

  // NEW METHODS - Expose new functionality through legacy interface

  async enhanceFullResumeWithTemplate(templateName, resumeData, jobDescription = '', enhancementType = 'general') {
    try {
      logger.info(`Legacy AI Service: Enhancing full resume with template: ${templateName}`);
      
      return await this.coordinator.enhanceFullResume(templateName, resumeData, jobDescription, enhancementType);
      
    } catch (error) {
      logger.error(`Legacy AI Service: Template-aware full resume enhancement failed:`, error);
      throw new Error(`Template-aware enhancement failed: ${error.message}`);
    }
  }

  async enhanceSectionWithTemplate(templateName, sectionData, sectionType, jobDescription = '') {
    try {
      logger.info(`Legacy AI Service: Enhancing ${sectionType} section with template: ${templateName}`);
      
      return await this.coordinator.enhanceSectionWithTemplate(templateName, sectionData, sectionType, jobDescription);
      
    } catch (error) {
      logger.error(`Legacy AI Service: Template-aware section enhancement failed:`, error);
      throw new Error(`Template-aware section enhancement failed: ${error.message}`);
    }
  }

  async getTemplateRecommendation(resumeData, jobDescription = '') {
    try {
      logger.info('Legacy AI Service: Getting template recommendation');
      
      return await this.coordinator.getTemplateRecommendation(resumeData, jobDescription);
      
    } catch (error) {
      logger.error('Legacy AI Service: Template recommendation failed:', error);
      throw new Error(`Template recommendation failed: ${error.message}`);
    }
  }

  getAvailableTemplates() {
    return this.coordinator.getAvailableTemplates();
  }

  isTemplateSupported(templateName) {
    return this.coordinator.isTemplateSupported(templateName);
  }

  // DEPRECATED METHODS - These are now handled by the coordinator but kept for compatibility
  // They will be removed in a future version

  generateEnhancementPrompt(sectionData, sectionType, jobDescription) {
    logger.warn('DEPRECATED: generateEnhancementPrompt method is deprecated. Use template-specific enhancements instead.');
    // Legacy method kept for compatibility - should not be used
    return `Legacy prompt generation - please use template-specific enhancement methods`;
  }

  async callGeminiAPI(prompt) {
    logger.warn('DEPRECATED: callGeminiAPI method is deprecated. All AI calls are now handled through the coordinator.');
    // Delegate to coordinator's base functionality
    return await this.coordinator.callGeminiAPI(prompt);
  }

  convertResumeDataToText(resumeData) {
    logger.warn('DEPRECATED: convertResumeDataToText method is deprecated. This functionality is now handled by the coordinator.');
    // Delegate to coordinator's base functionality
    return this.coordinator.convertResumeDataToText(resumeData);
  }
}

module.exports = new AIService();