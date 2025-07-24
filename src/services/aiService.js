const axios = require('axios');
const config = require('../config/environment');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.apiKey = config.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  async parseResume(resumeText) {
    try {
      logger.info('Starting resume parsing with AI');
      
      const prompt = `Parse the following resume text and extract structured information. Return a JSON object with the following structure:
{
  "personalInfo": {
    "name": "string",
    "email": "string", 
    "phone": "string",
    "linkedin": "string",
    "website": "string",
    "address": "string"
  },
  "professionalSummary": "string",
  "experience": [
    {
      "position": "string",
      "company": "string", 
      "location": "string",
      "dates": "string",
      "details": "string (bullet points separated by newlines)"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "dates": "string",
      "gpa": "string",
      "details": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "type": "string",
      "location": "string", 
      "dates": "string",
      "details": "string"
    }
  ],
  "skills": {
    "Languages": "string",
    "Frameworks": "string",
    "Tools": "string",
    "Concepts": "string"
  },
  "certifications": ["string"],
  "positions": ["string"],
  "interests": "string"
}

Resume text to parse:
${resumeText}

Return only the JSON object, no additional text.`;

      const response = await this.callGeminiAPI(prompt);
      
      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      logger.info('Resume parsing completed successfully');
      
      return parsedData;
      
    } catch (error) {
      logger.error('Resume parsing failed:', error);
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
  }

  async calculateATSScore(resumeData, jobDescription = '') {
    try {
      logger.info('Calculating ATS score');
      
      const resumeText = this.convertResumeDataToText(resumeData);
      
      const prompt = `Analyze this resume for ATS (Applicant Tracking System) compatibility and provide a comprehensive score and feedback.

${jobDescription ? `Job Description for comparison:
${jobDescription}

` : ''}Resume Content:
${resumeText}

Provide a JSON response with this structure:
{
  "score": 85,
  "maxScore": 100,
  "feedback": {
    "strengths": ["List of strengths"],
    "improvements": ["List of areas to improve"],
    "keywords": {
      "found": ["keywords found in resume"],
      "missing": ["important keywords missing"],
      "suggestions": ["suggested keywords to add"]
    },
    "formatting": {
      "score": 90,
      "issues": ["formatting issues if any"]
    },
    "content": {
      "score": 80,
      "feedback": "Content quality feedback"
    }
  },
  "recommendations": ["Specific actionable recommendations"]
}

Return only the JSON object.`;

      const response = await this.callGeminiAPI(prompt);
      
      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in ATS score response');
      }
      
      const atsAnalysis = JSON.parse(jsonMatch[0]);
      logger.info(`ATS score calculated: ${atsAnalysis.score}/${atsAnalysis.maxScore}`);
      
      return atsAnalysis;
      
    } catch (error) {
      logger.error('ATS score calculation failed:', error);
      throw new Error(`ATS score calculation failed: ${error.message}`);
    }
  }

  async enhanceSection(sectionData, sectionType, jobDescription = '') {
    try {
      logger.info(`Enhancing ${sectionType} section`);
      
      const prompt = this.generateEnhancementPrompt(sectionData, sectionType, jobDescription);
      const response = await this.callGeminiAPI(prompt);
      
      logger.info(`${sectionType} section enhancement completed`);
      return response.trim();
      
    } catch (error) {
      logger.error(`Section enhancement failed for ${sectionType}:`, error);
      throw new Error(`Section enhancement failed: ${error.message}`);
    }
  }

  generateEnhancementPrompt(sectionData, sectionType, jobDescription) {
    const basePrompt = `Enhance the following ${sectionType} section for a resume to make it more impactful and ATS-friendly.`;
    
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nTailor the enhancements to align with this job description.` : '';
    
    switch (sectionType) {
      case 'professionalSummary':
        return `${basePrompt}
        
Current summary:
${sectionData}

Requirements:
- Make it concise (2-3 sentences)
- Include relevant keywords
- Highlight key achievements
- Make it compelling and professional${jobContext}

Return only the enhanced summary, no additional text.`;

      case 'experience':
        return `${basePrompt}
        
Current experience entry:
Position: ${sectionData.position}
Company: ${sectionData.company}
Details: ${sectionData.details}

Requirements:
- Use action verbs and quantify achievements
- Make bullet points more impactful
- Include relevant keywords
- Show progression and impact${jobContext}

Return only the enhanced bullet points (one per line), no additional text.`;

      case 'skills':
        return `${basePrompt}
        
Current skills:
${JSON.stringify(sectionData, null, 2)}

Requirements:
- Organize skills by relevance
- Include trending technologies
- Remove outdated skills
- Add missing relevant skills${jobContext}

Return only the enhanced skills in the same JSON format, no additional text.`;

      default:
        return `${basePrompt}
        
Current content:
${typeof sectionData === 'object' ? JSON.stringify(sectionData, null, 2) : sectionData}

Enhance this content to be more professional, impactful, and ATS-friendly.${jobContext}

Return only the enhanced content, no additional text.`;
    }
  }

  async callGeminiAPI(prompt) {
    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured');
      }
      
      const response = await axios.post(
        this.baseUrl,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      return response.data.candidates[0].content.parts[0].text;
      
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('AI service rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 401) {
        throw new Error('AI service authentication failed. Please check API key.');
      } else if (error.response?.status === 404) {
        throw new Error('AI service endpoint not found. The Gemini API model may be unavailable.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid request to AI service. Please check the request format.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('AI service request timed out. Please try again.');
      }
      
      logger.error('Gemini API call failed:', error);
      logger.error('Response status:', error.response?.status);
      logger.error('Response data:', error.response?.data);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  convertResumeDataToText(resumeData) {
    let text = '';
    
    if (resumeData.personalInfo) {
      text += `Name: ${resumeData.personalInfo.name || ''}\n`;
      text += `Email: ${resumeData.personalInfo.email || ''}\n`;
      text += `Phone: ${resumeData.personalInfo.phone || ''}\n\n`;
    }
    
    if (resumeData.professionalSummary) {
      text += `Professional Summary:\n${resumeData.professionalSummary}\n\n`;
    }
    
    if (resumeData.experience?.length > 0) {
      text += 'Experience:\n';
      resumeData.experience.forEach(exp => {
        text += `${exp.position} at ${exp.company} (${exp.dates})\n`;
        text += `${exp.details || ''}\n\n`;
      });
    }
    
    if (resumeData.education?.length > 0) {
      text += 'Education:\n';
      resumeData.education.forEach(edu => {
        text += `${edu.degree} from ${edu.institution} (${edu.dates})\n`;
      });
      text += '\n';
    }
    
    if (resumeData.skills) {
      text += 'Skills:\n';
      Object.entries(resumeData.skills).forEach(([category, skills]) => {
        text += `${category}: ${Array.isArray(skills) ? skills.join(', ') : skills}\n`;
      });
      text += '\n';
    }
    
    return text;
  }

  async getServiceStatus() {
    try {
      const testPrompt = 'Return "OK" if the service is working.';
      const response = await this.callGeminiAPI(testPrompt);
      
      return {
        available: response.includes('OK'),
        apiKey: this.apiKey ? 'configured' : 'missing'
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        apiKey: this.apiKey ? 'configured' : 'missing'
      };
    }
  }
}

module.exports = new AIService();