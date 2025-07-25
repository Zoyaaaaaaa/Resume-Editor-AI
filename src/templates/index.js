const latexTemplateUtils = require('../utils/latexTemplateUtils');

// Dynamically load all available templates
const templates = latexTemplateUtils.getAllLatexTemplates();

function generateTemplate(templateName, data) {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template '${templateName}' not found. Available templates: ${Object.keys(templates).join(', ')}`);
  }
  
  return template.generate(data);
}

function getAvailableTemplates() {
  return Object.keys(templates).map(key => ({
    id: key,
    name: templates[key].name,
    description: templates[key].description
  }));
}

function validateTemplateData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid template data: must be an object');
  }
  
  // Basic validation for required fields
  const errors = [];
  
  if (!data.personalInfo || !data.personalInfo.name) {
    errors.push('Personal info with name is required');
  }
  
  if (!data.personalInfo || !data.personalInfo.email) {
    errors.push('Email is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }
  
  return true;
}

module.exports = {
  generateTemplate,
  getAvailableTemplates,
  validateTemplateData,
  templates
};