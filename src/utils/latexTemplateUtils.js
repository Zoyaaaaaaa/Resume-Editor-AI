const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class LaTeXTemplateDiscovery {
  constructor() {
    this.templatesDir = path.join(__dirname, '..', 'templates');
  }

  /**
   * Discover all available LaTeX templates by scanning the templates directory
   * @returns {Array} Array of template names
   */
  discoverLatexTemplates() {
    try {
      if (!fs.existsSync(this.templatesDir)) {
        logger.warn('Templates directory not found:', this.templatesDir);
        return [];
      }

      const entries = fs.readdirSync(this.templatesDir);
      const templates = entries
        .filter(file => file.endsWith('.js') && file !== 'index.js')
        .map(file => file.replace('.js', ''))
        .filter(name => this.validateLatexTemplate(name));

      logger.info(`Discovered LaTeX templates: ${templates.join(', ')}`);
      return templates;
    } catch (error) {
      logger.error('Failed to discover LaTeX templates:', error);
      return [];
    }
  }

  /**
   * Validate that a LaTeX template has the required structure
   * @param {string} templateName 
   * @returns {boolean}
   */
  validateLatexTemplate(templateName) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.js`);
      
      if (!fs.existsSync(templatePath)) {
        return false;
      }

      // Try to load the module to ensure it's valid
      try {
        delete require.cache[require.resolve(templatePath)];
        const templateModule = require(templatePath);
        
        // Check if it exports a generate function
        const expectedFunctionName = `generate${templateName.charAt(0).toUpperCase() + templateName.slice(1)}Template`;
        
        if (!templateModule[expectedFunctionName] || typeof templateModule[expectedFunctionName] !== 'function') {
          logger.warn(`LaTeX template ${templateName} missing required function: ${expectedFunctionName}`);
          return false;
        }

        return true;
      } catch (requireError) {
        logger.warn(`LaTeX template ${templateName} has invalid module structure:`, requireError.message);
        return false;
      }
    } catch (error) {
      logger.warn(`Failed to validate LaTeX template ${templateName}:`, error);
      return false;
    }
  }

  /**
   * Load a LaTeX template dynamically
   * @param {string} templateName 
   * @returns {Object}
   */
  loadLatexTemplate(templateName) {
    try {
      if (!this.validateLatexTemplate(templateName)) {
        throw new Error(`Invalid LaTeX template: ${templateName}`);
      }

      const templatePath = path.join(this.templatesDir, `${templateName}.js`);
      
      // Clear require cache to ensure fresh load
      delete require.cache[require.resolve(templatePath)];
      const templateModule = require(templatePath);
      
      const expectedFunctionName = `generate${templateName.charAt(0).toUpperCase() + templateName.slice(1)}Template`;
      const generateFunction = templateModule[expectedFunctionName];

      return {
        name: templateName.charAt(0).toUpperCase() + templateName.slice(1),
        description: `${templateName.charAt(0).toUpperCase() + templateName.slice(1)} resume template`,
        generate: generateFunction
      };
    } catch (error) {
      logger.error(`Failed to load LaTeX template ${templateName}:`, error);
      throw new Error(`Failed to load LaTeX template: ${error.message}`);
    }
  }

  /**
   * Get all discovered LaTeX templates
   * @returns {Object}
   */
  getAllLatexTemplates() {
    const templateNames = this.discoverLatexTemplates();
    const templates = {};

    for (const templateName of templateNames) {
      try {
        templates[templateName] = this.loadLatexTemplate(templateName);
      } catch (error) {
        logger.error(`Failed to load LaTeX template ${templateName}:`, error);
      }
    }

    return templates;
  }
}

module.exports = new LaTeXTemplateDiscovery();