const aiServiceCoordinator = require('../services/ai');
const logger = require('./logger');

/**
 * Get available templates dynamically
 * @returns {Array} Array of available template names
 */
function getAvailableTemplates() {
  try {
    return aiServiceCoordinator.getAvailableTemplates();
  } catch (error) {
    logger.error('Failed to get available templates:', error);
    // Fallback to known templates
    return ['professional', 'modern'];
  }
}

/**
 * Create validation middleware for template names
 * @returns {Function} Express validator function
 */
function createTemplateValidator() {
  return (value) => {
    const availableTemplates = getAvailableTemplates();
    if (!availableTemplates.includes(value)) {
      throw new Error(`Invalid template name. Available templates: ${availableTemplates.join(', ')}`);
    }
    return true;
  };
}

/**
 * Check if a template is supported
 * @param {string} templateName 
 * @returns {boolean}
 */
function isTemplateSupported(templateName) {
  const availableTemplates = getAvailableTemplates();
  return availableTemplates.includes(templateName);
}

/**
 * Get template capabilities
 * @param {string} templateName 
 * @returns {Object}
 */
async function getTemplateCapabilities(templateName) {
  try {
    return await aiServiceCoordinator.getTemplateCapabilities(templateName);
  } catch (error) {
    logger.error(`Failed to get capabilities for template ${templateName}:`, error);
    return null;
  }
}

module.exports = {
  getAvailableTemplates,
  createTemplateValidator,
  isTemplateSupported,
  getTemplateCapabilities
};