const templateAIFactory = require('./services/templateAIFactory');
const BaseAIService = require('./baseAIService');
const logger = require('../../utils/logger');

class AIServiceCoordinator extends BaseAIService {
  constructor() {
    super();
    this.factory = templateAIFactory;
    this.initialized = true; // Factory auto-discovers templates now
    
    logger.info('AI Service Coordinator initialized successfully');
    logger.info(`Available templates: ${this.factory.getAvailableTemplates().join(', ')}`);
  }

  // Template-aware full resume enhancement
  async enhanceFullResume(templateName, resumeData, jobDescription = '', enhancementType = 'general') {
    try {
      if (!this.initialized) {
        throw new Error('AI Service Coordinator not initialized');
      }

      logger.info(`Coordinating full resume enhancement for template: ${templateName}`);
      
      const result = await this.factory.enhanceFullResume(templateName, resumeData, jobDescription);
      
      // Add enhancement type if the template service supports it
      if (enhancementType !== 'general') {
        const service = this.factory.getTemplateService(templateName);
        if (service.enhanceForExecutiveLevel && enhancementType === 'executive-level') {
          return await service.enhanceForExecutiveLevel(resumeData, jobDescription);
        } else if (service.enhanceForTechInnovation && enhancementType === 'tech-innovation') {
          return await service.enhanceForTechInnovation(resumeData, jobDescription);
        } else if (service.enhanceForUXFocus && enhancementType === 'user-experience-focused') {
          return await service.enhanceForUXFocus(resumeData, jobDescription);
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`Template-aware full resume enhancement failed for ${templateName}:`, error);
      throw new Error(`Template-aware enhancement failed: ${error.message}`);
    }
  }

  // Template-aware section enhancement
  async enhanceSectionWithTemplate(templateName, sectionData, sectionType, jobDescription = '') {
    try {
      if (!this.initialized) {
        throw new Error('AI Service Coordinator not initialized');
      }

      logger.info(`Coordinating section enhancement for template: ${templateName}, section: ${sectionType}`);
      
      return await this.factory.enhanceSection(templateName, sectionData, sectionType, jobDescription);
    } catch (error) {
      logger.error(`Template-aware section enhancement failed for ${templateName}, section ${sectionType}:`, error);
      throw new Error(`Template-aware section enhancement failed: ${error.message}`);
    }
  }

  // Backward compatibility: Generic section enhancement (uses professional template as default)
  async enhanceSection(sectionData, sectionType, jobDescription = '') {
    try {
      logger.info(`Using backward compatible section enhancement (defaulting to professional template)`);
      return await this.enhanceSectionWithTemplate('professional', sectionData, sectionType, jobDescription);
    } catch (error) {
      logger.error('Backward compatible section enhancement failed:', error);
      throw new Error(`Section enhancement failed: ${error.message}`);
    }
  }

  // Get available templates and their capabilities
  async getTemplateCapabilities(templateName = null) {
    try {
      if (!this.initialized) {
        throw new Error('AI Service Coordinator not initialized');
      }

      if (templateName) {
        return await this.factory.getTemplateCapabilities(templateName);
      }

      // Return capabilities for all templates
      const templates = this.factory.getAvailableTemplates();
      const capabilities = {};
      
      for (const template of templates) {
        capabilities[template] = await this.factory.getTemplateCapabilities(template);
      }
      
      return capabilities;
    } catch (error) {
      logger.error('Failed to get template capabilities:', error);
      throw new Error(`Failed to get template capabilities: ${error.message}`);
    }
  }

  // Get template information and recommendations
  async getTemplateRecommendation(resumeData, jobDescription = '') {
    try {
      logger.info('Analyzing resume for template recommendation');
      
      const analysisPrompt = `Analyze this resume and job description to recommend the best template (professional or modern):

Resume Data:
${JSON.stringify(resumeData, null, 2)}

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ''}

Template Options:
1. Professional: Best for corporate, business, executive, traditional industries, ATS-heavy environments
2. Modern: Best for creative, tech, design, startup, innovation-focused roles

Consider:
- Industry type and company culture
- Role level and responsibilities  
- Required skills and technologies
- Creative vs. analytical focus
- Traditional vs. innovative environment

Return a JSON object with this structure:
{
  "recommendedTemplate": "professional|modern",
  "confidence": 0.85,
  "reasoning": "Detailed explanation of why this template is recommended",
  "alternativeTemplate": "modern|professional",
  "templateComparison": {
    "professional": {
      "score": 0.75,
      "pros": ["List of advantages"],
      "cons": ["List of disadvantages"]
    },
    "modern": {
      "score": 0.85,
      "pros": ["List of advantages"], 
      "cons": ["List of disadvantages"]
    }
  }
}

Return only the JSON object.`;

      const response = await this.callGeminiAPI(analysisPrompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in template recommendation response');
      }
      
      const recommendation = JSON.parse(jsonMatch[0]);
      logger.info(`Template recommendation completed: ${recommendation.recommendedTemplate} (confidence: ${recommendation.confidence})`);
      
      return recommendation;
    } catch (error) {
      logger.error('Template recommendation failed:', error);
      throw new Error(`Template recommendation failed: ${error.message}`);
    }
  }

  // Enhanced service status including template information
  async getEnhancedServiceStatus() {
    try {
      const baseStatus = await this.getServiceStatus();
      const factoryStatus = this.factory.getFactoryStatus();
      
      const templateInfo = {};
      for (const template of factoryStatus.registeredTemplates) {
        const service = this.factory.getTemplateService(template);
        templateInfo[template] = service.getTemplateInfo ? service.getTemplateInfo() : {
          name: template,
          description: 'Template-specific AI service'
        };
      }
      
      return {
        ...baseStatus,
        coordinator: {
          initialized: this.initialized,
          version: '2.0.0',
          features: [
            'template-aware-enhancement',
            'full-resume-enhancement', 
            'section-enhancement',
            'template-recommendation',
            'backward-compatibility'
          ]
        },
        factory: factoryStatus,
        templates: templateInfo
      };
    } catch (error) {
      logger.error('Enhanced service status check failed:', error);
      return {
        available: false,
        error: error.message,
        coordinator: {
          initialized: this.initialized,
          error: error.message
        }
      };
    }
  }

  // Utility methods
  getAvailableTemplates() {
    return this.factory.getAvailableTemplates();
  }

  isTemplateSupported(templateName) {
    return this.factory.isTemplateSupported(templateName);
  }

  validateTemplateExists(templateName) {
    return this.factory.validateTemplateExists(templateName);
  }
}

// Export singleton instance
module.exports = new AIServiceCoordinator();