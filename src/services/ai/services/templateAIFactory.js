const fs = require('fs');
const path = require('path');
const logger = require('../../../utils/logger');
const GenericTemplateAI = require('./genericTemplateAI');

class TemplateAIFactory {
  constructor() {
    this.templateServices = new Map();
    this.promptsDir = path.join(__dirname, '..', 'prompts');
    this.registeredTemplates = [];
    
    // Auto-discover and register templates
    this.discoverAndRegisterTemplates();
  }

  /**
   * Auto-discover templates from the prompts directory and register them
   */
  discoverAndRegisterTemplates() {
    try {
      if (!fs.existsSync(this.promptsDir)) {
        logger.warn('Prompts directory not found:', this.promptsDir);
        return;
      }

      const entries = fs.readdirSync(this.promptsDir, { withFileTypes: true });
      const templateFolders = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

      logger.info(`Discovered template folders: ${templateFolders.join(', ')}`);

      for (const templateName of templateFolders) {
        try {
          if (this.validateTemplateStructure(templateName)) {
            // Register using GenericTemplateAI
            this.registerGenericTemplate(templateName);
          }
        } catch (error) {
          logger.error(`Failed to register template ${templateName}:`, error);
        }
      }

      logger.info(`Successfully registered templates: ${this.getAvailableTemplates().join(', ')}`);
    } catch (error) {
      logger.error('Failed to discover templates:', error);
    }
  }

  /**
   * Validate that a template has the required structure
   */
  validateTemplateStructure(templateName) {
    try {
      const templateDir = path.join(this.promptsDir, templateName);
      
      // Check required files exist
      const requiredFiles = ['fullResume.js', 'sections.js'];
      for (const file of requiredFiles) {
        const filePath = path.join(templateDir, file);
        if (!fs.existsSync(filePath)) {
          logger.warn(`Template ${templateName} missing required file: ${file}`);
          return false;
        }
      }

      // Try to load the modules to ensure they're valid
      try {
        const fullResumePath = path.join(templateDir, 'fullResume.js');
        const sectionsPath = path.join(templateDir, 'sections.js');
        
        const fullResumePrompts = require(fullResumePath);
        const sectionPrompts = require(sectionsPath);
        
        // Basic validation of required exports
        if (!fullResumePrompts || typeof fullResumePrompts !== 'object') {
          logger.warn(`Template ${templateName} fullResume.js does not export valid prompts object`);
          return false;
        }

        if (!sectionPrompts || typeof sectionPrompts !== 'object') {
          logger.warn(`Template ${templateName} sections.js does not export valid prompts object`);
          return false;
        }

        return true;
      } catch (requireError) {
        logger.warn(`Template ${templateName} has invalid module structure:`, requireError.message);
        return false;
      }
    } catch (error) {
      logger.warn(`Failed to validate template ${templateName}:`, error);
      return false;
    }
  }

  /**
   * Register a template using the generic template AI service
   */
  registerGenericTemplate(templateName) {
    try {
      const serviceInstance = new GenericTemplateAI(templateName);
      this.templateServices.set(templateName.toLowerCase(), serviceInstance);
      
      if (!this.registeredTemplates.includes(templateName.toLowerCase())) {
        this.registeredTemplates.push(templateName.toLowerCase());
      }
      
      logger.info(`Generic template AI service registered: ${templateName}`);
    } catch (error) {
      logger.error(`Failed to register generic template ${templateName}:`, error);
      throw error;
    }
  }

  registerTemplateService(templateName, serviceClass) {
    if (!templateName || typeof templateName !== 'string') {
      throw new Error('Template name must be a valid string');
    }
    
    if (!serviceClass) {
      throw new Error('Service class is required');
    }

    try {
      const serviceInstance = new serviceClass();
      this.templateServices.set(templateName.toLowerCase(), serviceInstance);
      
      if (!this.registeredTemplates.includes(templateName.toLowerCase())) {
        this.registeredTemplates.push(templateName.toLowerCase());
      }
      
      logger.info(`Template AI service registered: ${templateName}`);
    } catch (error) {
      logger.error(`Failed to register template AI service ${templateName}:`, error);
      throw new Error(`Failed to register template AI service: ${error.message}`);
    }
  }

  getTemplateService(templateName) {
    if (!templateName) {
      throw new Error('Template name is required');
    }

    const normalizedTemplateName = templateName.toLowerCase();
    
    if (!this.templateServices.has(normalizedTemplateName)) {
      throw new Error(`Template AI service not found: ${templateName}. Available templates: ${this.getAvailableTemplates().join(', ')}`);
    }

    return this.templateServices.get(normalizedTemplateName);
  }

  getAvailableTemplates() {
    return Array.from(this.templateServices.keys());
  }

  isTemplateSupported(templateName) {
    if (!templateName) return false;
    return this.templateServices.has(templateName.toLowerCase());
  }

  validateTemplateExists(templateName) {
    if (!this.isTemplateSupported(templateName)) {
      throw new Error(`Unsupported template: ${templateName}. Available templates: ${this.getAvailableTemplates().join(', ')}`);
    }
    return true;
  }

  async enhanceFullResume(templateName, resumeData, jobDescription = '') {
    try {
      this.validateTemplateExists(templateName);
      const service = this.getTemplateService(templateName);
      
      if (!service.enhanceFullResume) {
        throw new Error(`Template service ${templateName} does not support full resume enhancement`);
      }

      logger.info(`Enhancing full resume using ${templateName} template`);
      return await service.enhanceFullResume(resumeData, jobDescription);
    } catch (error) {
      logger.error(`Full resume enhancement failed for template ${templateName}:`, error);
      throw new Error(`Full resume enhancement failed: ${error.message}`);
    }
  }

  async enhanceSection(templateName, sectionData, sectionType, jobDescription = '') {
    try {
      this.validateTemplateExists(templateName);
      const service = this.getTemplateService(templateName);
      
      if (!service.enhanceSection) {
        throw new Error(`Template service ${templateName} does not support section enhancement`);
      }

      logger.info(`Enhancing ${sectionType} section using ${templateName} template`);
      return await service.enhanceSection(sectionData, sectionType, jobDescription);
    } catch (error) {
      logger.error(`Section enhancement failed for template ${templateName}, section ${sectionType}:`, error);
      throw new Error(`Section enhancement failed: ${error.message}`);
    }
  }

  async getTemplateCapabilities(templateName) {
    try {
      this.validateTemplateExists(templateName);
      const service = this.getTemplateService(templateName);
      
      return {
        templateName,
        supportsFullResume: typeof service.enhanceFullResume === 'function',
        supportsSectionEnhancement: typeof service.enhanceSection === 'function',
        availableSections: service.getSupportedSections ? service.getSupportedSections() : [
          'professionalSummary', 
          'experience', 
          'skills', 
          'projects', 
          'education'
        ],
        enhancementTypes: service.getEnhancementTypes ? service.getEnhancementTypes() : [
          'general',
          'ats-optimization'
        ]
      };
    } catch (error) {
      logger.error(`Failed to get capabilities for template ${templateName}:`, error);
      throw new Error(`Failed to get template capabilities: ${error.message}`);
    }
  }

  getFactoryStatus() {
    return {
      registeredTemplates: this.getAvailableTemplates(),
      totalServices: this.templateServices.size,
      factoryReady: this.templateServices.size > 0,
      supportedFeatures: {
        fullResumeEnhancement: true,
        sectionEnhancement: true,
        templateSpecificPrompts: true,
        jobDescriptionContext: true
      }
    };
  }
}

// Export singleton instance
module.exports = new TemplateAIFactory();