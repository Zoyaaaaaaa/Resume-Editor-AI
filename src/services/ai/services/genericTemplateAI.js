const BaseAIService = require('../baseAIService');
const fs = require('fs');
const path = require('path');
const logger = require('../../../utils/logger');

class GenericTemplateAI extends BaseAIService {
  constructor(templateName) {
    super();
    this.templateName = templateName;
    this.promptsPath = path.join(__dirname, '..', 'prompts', templateName);
    this.supportedSections = [
      'professionalSummary',
      'experience', 
      'skills',
      'projects',
      'education'
    ];
    
    // Load prompts dynamically
    this.loadPrompts();
  }

  loadPrompts() {
    try {
      // Check if template prompts directory exists
      if (!fs.existsSync(this.promptsPath)) {
        throw new Error(`Template prompts directory not found: ${this.promptsPath}`);
      }

      // Load full resume prompts
      const fullResumePath = path.join(this.promptsPath, 'fullResume.js');
      if (fs.existsSync(fullResumePath)) {
        // Clear cache to ensure fresh load
        delete require.cache[require.resolve(fullResumePath)];
        this.fullResumePrompts = require(fullResumePath);
      } else {
        logger.warn(`No fullResume.js found for template: ${this.templateName}`);
        this.fullResumePrompts = {};
      }

      // Load section prompts
      const sectionsPath = path.join(this.promptsPath, 'sections.js');
      if (fs.existsSync(sectionsPath)) {
        // Clear cache to ensure fresh load
        delete require.cache[require.resolve(sectionsPath)];
        this.sectionPrompts = require(sectionsPath);
      } else {
        logger.warn(`No sections.js found for template: ${this.templateName}`);
        this.sectionPrompts = {};
      }

      logger.info(`Loaded prompts for template: ${this.templateName}`);
    } catch (error) {
      logger.error(`Failed to load prompts for template ${this.templateName}:`, error);
      throw new Error(`Failed to load template prompts: ${error.message}`);
    }
  }

  async enhanceFullResume(resumeData, jobDescription = '', enhancementType = 'general') {
    try {
      logger.info(`Enhancing full resume with ${this.templateName} template (${enhancementType})`);
      
      if (!this.fullResumePrompts || Object.keys(this.fullResumePrompts).length === 0) {
        throw new Error(`No full resume prompts available for template: ${this.templateName}`);
      }

      let prompt;
      
      // Try different enhancement types
      if (enhancementType === 'ats-optimization' && this.fullResumePrompts.enhanceForATS) {
        prompt = this.fullResumePrompts.enhanceForATS(resumeData, jobDescription);
      } else if (enhancementType === 'creativity-focused' && this.fullResumePrompts.enhanceForCreativity) {
        prompt = this.fullResumePrompts.enhanceForCreativity(resumeData, jobDescription);
      } else if (this.fullResumePrompts.enhanceFullResume) {
        prompt = this.fullResumePrompts.enhanceFullResume(resumeData, jobDescription);
      } else {
        throw new Error(`No suitable full resume prompt found for enhancement type: ${enhancementType}`);
      }

      const response = await this.callGeminiAPI(prompt);
      
      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const enhancedData = JSON.parse(jsonMatch[0]);
      logger.info(`${this.templateName} template full resume enhancement completed successfully`);
      
      return {
        enhanced: enhancedData,
        templateUsed: this.templateName,
        enhancementType,
        original: resumeData
      };
      
    } catch (error) {
      logger.error(`${this.templateName} template full resume enhancement failed:`, error);
      throw new Error(`${this.templateName} template enhancement failed: ${error.message}`);
    }
  }

  async enhanceSection(sectionData, sectionType, jobDescription = '') {
    try {
      if (!this.supportedSections.includes(sectionType)) {
        throw new Error(`Unsupported section type: ${sectionType}. Supported sections: ${this.supportedSections.join(', ')}`);
      }

      logger.info(`Enhancing ${sectionType} section with ${this.templateName} template`);
      
      if (!this.sectionPrompts || Object.keys(this.sectionPrompts).length === 0) {
        throw new Error(`No section prompts available for template: ${this.templateName}`);
      }

      const promptFunction = this.sectionPrompts[sectionType];
      if (!promptFunction || typeof promptFunction !== 'function') {
        throw new Error(`No prompt found for section type: ${sectionType} in template: ${this.templateName}`);
      }

      const prompt = promptFunction(sectionData, jobDescription);
      const response = await this.callGeminiAPI(prompt);
      
      logger.info(`${this.templateName} template ${sectionType} section enhancement completed`);
      
      // For skills section, try to parse JSON response
      if (sectionType === 'skills') {
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const enhancedSkills = JSON.parse(jsonMatch[0]);
            return {
              enhanced: enhancedSkills,
              templateUsed: this.templateName,
              sectionType,
              original: sectionData
            };
          }
        } catch (parseError) {
          logger.warn('Could not parse skills as JSON, returning as text');
        }
      }
      
      return {
        enhanced: response.trim(),
        templateUsed: this.templateName,
        sectionType,
        original: sectionData
      };
      
    } catch (error) {
      logger.error(`${this.templateName} template section enhancement failed for ${sectionType}:`, error);
      throw new Error(`${this.templateName} template section enhancement failed: ${error.message}`);
    }
  }

  getAvailablePrompts() {
    return {
      fullResume: Object.keys(this.fullResumePrompts || {}),
      sections: Object.keys(this.sectionPrompts || {})
    };
  }

  getSupportedSections() {
    return [...this.supportedSections];
  }

  getEnhancementTypes() {
    const types = ['general'];
    
    if (this.fullResumePrompts?.enhanceForATS) {
      types.push('ats-optimization');
    }
    if (this.fullResumePrompts?.enhanceForCreativity) {
      types.push('creativity-focused');
    }
    if (this.fullResumePrompts?.enhanceForTechInnovation) {
      types.push('tech-innovation');
    }
    if (this.fullResumePrompts?.enhanceForUXFocus) {
      types.push('user-experience-focused');
    }
    
    return types;
  }

  getTemplateInfo() {
    return {
      name: this.templateName,
      description: `AI service for ${this.templateName} template with dynamic prompt loading`,
      promptsPath: this.promptsPath,
      availablePrompts: this.getAvailablePrompts(),
      supportedSections: this.getSupportedSections(),
      enhancementTypes: this.getEnhancementTypes()
    };
  }
}

module.exports = GenericTemplateAI;