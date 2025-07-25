/**
 * Utility to convert Markdown formatting to LaTeX formatting
 */

/**
 * Convert markdown bold formatting to LaTeX
 * @param {string} text - Text with markdown formatting
 * @returns {string} Text with LaTeX formatting
 */
function convertBoldToLatex(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Convert **text** to \textbf{text}
  // Use a more precise regex to avoid nested formatting issues
  return text.replace(/\*\*([^*]+)\*\*/g, '\\textbf{$1}');
}

/**
 * Convert markdown italic formatting to LaTeX
 * @param {string} text - Text with markdown formatting
 * @returns {string} Text with LaTeX formatting
 */
function convertItalicToLatex(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Convert *text* to \textit{text} (but avoid **text** patterns)
  return text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '\\textit{$1}');
}

/**
 * Convert all markdown formatting to LaTeX
 * @param {string} text - Text with markdown formatting
 * @returns {string} Text with LaTeX formatting
 */
function convertMarkdownToLatex(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let converted = text;
  
  // Convert bold first (to avoid conflicts with italic)
  converted = convertBoldToLatex(converted);
  
  // Convert italic
  converted = convertItalicToLatex(converted);
  
  return converted;
}

/**
 * Process resume data and convert all markdown to LaTeX
 * @param {Object} data - Resume data object
 * @returns {Object} Resume data with LaTeX formatting
 */
function processResumeDataMarkdown(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Deep clone to avoid modifying original
  const processedData = JSON.parse(JSON.stringify(data));

  // Process professional summary
  if (processedData.professionalSummary) {
    processedData.professionalSummary = convertMarkdownToLatex(processedData.professionalSummary);
  }

  // Process experience details
  if (processedData.experience && Array.isArray(processedData.experience)) {
    processedData.experience = processedData.experience.map(exp => ({
      ...exp,
      details: exp.details ? convertMarkdownToLatex(exp.details) : exp.details,
      position: exp.position ? convertMarkdownToLatex(exp.position) : exp.position,
      company: exp.company ? convertMarkdownToLatex(exp.company) : exp.company
    }));
  }

  // Process education details
  if (processedData.education && Array.isArray(processedData.education)) {
    processedData.education = processedData.education.map(edu => ({
      ...edu,
      details: edu.details ? convertMarkdownToLatex(edu.details) : edu.details,
      degree: edu.degree ? convertMarkdownToLatex(edu.degree) : edu.degree,
      institution: edu.institution ? convertMarkdownToLatex(edu.institution) : edu.institution
    }));
  }

  // Process projects details
  if (processedData.projects && Array.isArray(processedData.projects)) {
    processedData.projects = processedData.projects.map(proj => ({
      ...proj,
      details: proj.details ? convertMarkdownToLatex(proj.details) : proj.details,
      name: proj.name ? convertMarkdownToLatex(proj.name) : proj.name,
      type: proj.type ? convertMarkdownToLatex(proj.type) : proj.type
    }));
  }

  // Process skills (if they contain markdown)
  if (processedData.skills && typeof processedData.skills === 'object') {
    const processedSkills = {};
    for (const [category, skillList] of Object.entries(processedData.skills)) {
      if (typeof skillList === 'string') {
        processedSkills[convertMarkdownToLatex(category)] = convertMarkdownToLatex(skillList);
      } else if (Array.isArray(skillList)) {
        processedSkills[convertMarkdownToLatex(category)] = skillList.map(skill => 
          typeof skill === 'string' ? convertMarkdownToLatex(skill) : skill
        );
      } else {
        processedSkills[convertMarkdownToLatex(category)] = skillList;
      }
    }
    processedData.skills = processedSkills;
  }

  // Process other string arrays
  if (processedData.positions && Array.isArray(processedData.positions)) {
    processedData.positions = processedData.positions.map(pos => 
      typeof pos === 'string' ? convertMarkdownToLatex(pos) : pos
    );
  }

  if (processedData.certifications && Array.isArray(processedData.certifications)) {
    processedData.certifications = processedData.certifications.map(cert => 
      typeof cert === 'string' ? convertMarkdownToLatex(cert) : cert
    );
  }

  // Process interests
  if (processedData.interests) {
    processedData.interests = convertMarkdownToLatex(processedData.interests);
  }

  return processedData;
}

/**
 * Estimate the size of LaTeX content to prevent 414 errors
 * @param {string} latexContent - Generated LaTeX content
 * @returns {Object} Size information
 */
function estimateLatexSize(latexContent) {
  if (!latexContent) {
    return { size: 0, sizeKB: 0, tooLarge: false };
  }

  const sizeBytes = Buffer.byteLength(latexContent, 'utf8');
  const sizeKB = Math.round(sizeBytes / 1024);
  
  // Most LaTeX online services have limits around 100KB-200KB for GET requests
  // We'll use 50KB as a safe threshold
  const tooLarge = sizeBytes > 50 * 1024;

  return {
    size: sizeBytes,
    sizeKB,
    tooLarge,
    threshold: '50KB'
  };
}

module.exports = {
  convertBoldToLatex,
  convertItalicToLatex,
  convertMarkdownToLatex,
  processResumeDataMarkdown,
  estimateLatexSize
};