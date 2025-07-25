const axios = require('axios');
const config = require('../../config/environment');
const logger = require('../../utils/logger');

class BaseAIService {
  constructor() {
    this.apiKey = config.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    this.visionUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  async callGeminiAPI(prompt, maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
            timeout: 45000 // 45 seconds timeout
          }
        );

        if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Invalid response format from Gemini API');
        }

        return response.data.candidates[0].content.parts[0].text;
        
      } catch (error) {
        // If this is a 503 or 502 error and we have retries left, wait and retry
        if ((error.response?.status === 503 || error.response?.status === 502) && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          logger.warn(`Gemini API returned ${error.response.status}, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // If we've exhausted retries or it's a different error, handle it
        if (error.response?.status === 429) {
          throw new Error('AI service rate limit exceeded. Please try again later.');
        } else if (error.response?.status === 401) {
          throw new Error('AI service authentication failed. Please check API key.');
        } else if (error.response?.status === 404) {
          throw new Error('AI service endpoint not found. The Gemini API model may be unavailable.');
        } else if (error.response?.status === 400) {
          throw new Error('Invalid request to AI service. Please check the request format.');
        } else if (error.response?.status === 503) {
          throw new Error('AI service temporarily unavailable (503). The Gemini API may be overloaded. Please try again in a few minutes.');
        } else if (error.response?.status === 502) {
          throw new Error('AI service gateway error (502). Please try again.');
        } else if (error.code === 'ETIMEDOUT') {
          throw new Error('AI service request timed out. Please try again.');
        }
        
        logger.error('Gemini API call failed:', error);
        logger.error('Response status:', error.response?.status);
        logger.error('Response data:', error.response?.data);
        throw new Error(`AI service error: ${error.message}`);
      }
    }
    
    // This should never be reached, but just in case
    throw new Error('Maximum retries exceeded');
  }

  async callGeminiVisionAPI(prompt, imageBuffer, mimeType = 'image/png') {
    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured');
      }
      
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      
      const response = await axios.post(
        this.visionUrl,
        {
          contents: [{
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          timeout: 90000 // 90 seconds timeout for vision processing
        }
      );

      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini Vision API');
      }

      return response.data.candidates[0].content.parts[0].text;
      
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('AI service rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 401) {
        throw new Error('AI service authentication failed. Please check API key.');
      } else if (error.response?.status === 404) {
        throw new Error('AI service endpoint not found. The Gemini Vision API may be unavailable.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid request to AI service. Please check the request format.');
      } else if (error.response?.status === 503) {
        throw new Error('AI service temporarily unavailable (503). The Gemini API may be overloaded. Please try again in a few minutes.');
      } else if (error.response?.status === 502) {
        throw new Error('AI service gateway error (502). Please try again.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('AI service request timed out. Please try again.');
      }
      
      logger.error('Gemini Vision API call failed:', error);
      logger.error('Response status:', error.response?.status);
      logger.error('Response data:', error.response?.data);
      throw new Error(`AI Vision service error: ${error.message}`);
    }
  }

  preprocessResumeText(text) {
    if (!text) return text;
    
    // Only fix hyphenated words that are broken across lines, preserve normal line breaks
    let cleanedText = text
      // Fix ONLY hyphenated words that span across lines
      .replace(/(\w+)-\s*\n\s*([a-z]+)/g, '$1$2\n')  // Join the word but preserve line break
      // Fix hyphenated words on same line with space after hyphen
      .replace(/(\w+)-\s+([a-z]+)/g, '$1$2');
    
    // Split text into lines and process
    const lines = cleanedText.split('\n').map(line => line.trim());
    const processedLines = [];
    let currentBulletPoint = '';
    let inBulletSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (line.length === 0) {
        if (currentBulletPoint) {
          processedLines.push(currentBulletPoint);
          currentBulletPoint = '';
        }
        processedLines.push('');
        inBulletSection = false;
        continue;
      }
      
      // Check if this line starts with a bullet symbol
      const bulletMatch = line.match(/^\s*([•·▪▫▸▹►▻◆◇◈◉◎●○\-–—*+])\s*(.+)/);
      
      if (bulletMatch) {
        // Save previous bullet point if exists
        if (currentBulletPoint) {
          processedLines.push(currentBulletPoint);
        }
        // Start new bullet point
        currentBulletPoint = `${bulletMatch[1]} ${bulletMatch[2]}`;
        inBulletSection = true;
      } else if (inBulletSection && currentBulletPoint) {
        // This is a continuation line - check if it looks like it belongs to previous bullet
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
        const isNextLineBullet = nextLine.match(/^\s*[•·▪▫▸▹►▻◆◇◈◉◎●○\-–—*+]\s*/);
        const isSection = line.match(/^[A-Z\s]+$/) && line.length < 50; // Section headers
        
        // More aggressive continuation detection for split bullet points
        const endsWithIncompleteWord = currentBulletPoint.match(/\b\w+,$/); // ends with comma
        const startsWithLowercase = line.match(/^[a-z]/); // starts with lowercase
        const isShortLine = line.length < 100; // likely continuation if short
        
        if (!isNextLineBullet && !isSection && (endsWithIncompleteWord || startsWithLowercase || isShortLine)) {
          // Add space and continue the bullet point
          currentBulletPoint += ' ' + line;
        } else {
          // This line doesn't belong to the bullet, save current and add this line
          if (currentBulletPoint) {
            processedLines.push(currentBulletPoint);
            currentBulletPoint = '';
          }
          processedLines.push(line);
          inBulletSection = false;
        }
      } else {
        // Regular line (not part of bullet points)
        if (currentBulletPoint) {
          processedLines.push(currentBulletPoint);
          currentBulletPoint = '';
        }
        processedLines.push(line);
        inBulletSection = false;
      }
    }
    
    // Don't forget the last bullet point
    if (currentBulletPoint) {
      processedLines.push(currentBulletPoint);
    }
    
    return processedLines.join('\n');
  }

  async parseResumeFromImages(imageBuffers) {
    try {
      logger.info('Starting image-based resume parsing with AI Vision');
      
      const prompt = `You are an expert at reading text from images. 

CRITICAL: Every word you output must be a complete, correctly spelled English word. 

DO NOT output broken words like "us ing" or "fe at ures" or "Eng ineered".
These are OCR errors. Fix them to "using", "features", and "Engineered".

Read the resume image and write normal English words.

📝 EXAMPLES OF PERFECT OCR:
❌ WRONG: "Built a re al-time ch at applic ati on us ing Dj ango Ch annels"
✅ CORRECT: "Built a real-time chat application using Django Channels"

❌ WRONG: "Eng ineered a tom ato d ise ase detecti on system"  
✅ CORRECT: "Engineered a tomato disease detection system"

Return a JSON object with the following structure:

{
  "personalInfo": {
    "name": "string",
    "email": "string", 
    "phone": "string",
    "linkedin": "string",
    "website": "string",
    "address": "string"
  },
  "professionalSummary": "string (use **text** for any bold words)",
  "experience": [
    {
      "position": "string",
      "company": "string", 
      "location": "string",
      "dates": "string",
      "details": "string (each complete bullet point on new line, use **text** for bold words)"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "dates": "string",
      "gpa": "string",
      "details": "string (each complete bullet point on new line, use **text** for bold words)"
    }
  ],
  "projects": [
    {
      "name": "string",
      "type": "string",
      "location": "string", 
      "dates": "string",
      "details": "string (each complete bullet point on new line, use **text** for bold words)"
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

📝 EXAMPLES OF MEANINGFUL VS BROKEN OCR:

❌ BROKEN OCR (meaningless):
"Built a RESTful e-commerce b a ckend us in g Dj a ngo REST Fr a mework with fe at ures like product list in gs, c a rt, and order m a nagement."

✅ MEANINGFUL OCR (tells a clear story):
"Built a RESTful e-commerce backend using **Django** REST Framework with features like product listings, cart, and order management."

🧠 THOUGHT PROCESS FOR EACH WORD:
- "b a ckend" → I recognize this as "backend" (server-side development)
- "us in g" → This is clearly "using" (common English word)
- "fe at ures" → In software context, this is "features" (functionality)
- "list in gs" → In e-commerce, this means "listings" (product listings)

💡 CONTEXT UNDERSTANDING:
- What technology? Django = Python web framework
- What type of project? E-commerce = online shopping site  
- What makes sense? "features" not "fe at ures"
- What would a developer write? "backend using Django"

🎯 BE INTELLIGENT: Don't just read letters, understand the story!

KEY REMINDERS:
- Use **text** to mark any text that appears bold in the original document  
- Each bullet point should be complete and on its own line in the details field
- NEVER remove spaces between words
- NEVER split single bullet points across multiple lines in output
- Always read the COMPLETE visual bullet point, even if it wraps to next line
- DO NOT include bullet symbols (•, -, *, +) in the details field - only include the text content
- Each line in details should be clean text without any bullet symbols

Return only the JSON object, no additional text.`;

      let allResults = [];
      
      // Process each page image
      for (let i = 0; i < imageBuffers.length; i++) {
        logger.info(`Processing page ${i + 1} of ${imageBuffers.length}`);
        
        const pagePrompt = imageBuffers.length > 1 
          ? `${prompt}\n\nNote: This is page ${i + 1} of ${imageBuffers.length}. Extract information from this page and merge logically with other pages.`
          : prompt;
          
        const response = await this.callGeminiVisionAPI(pagePrompt, imageBuffers[i], 'image/png');
        
        // Parse the JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error(`No valid JSON found in AI response for page ${i + 1}`);
        }
        
        const pageData = JSON.parse(jsonMatch[0]);
        allResults.push(pageData);
      }
      
      // Merge results from multiple pages
      const mergedData = this.mergeMultiPageResults(allResults);
      
      // Post-process to fix common spacing and formatting issues
      const cleanedData = this.postProcessVisualParsingResults(mergedData);
      
      logger.info('Image-based resume parsing completed successfully');
      
      return cleanedData;
      
    } catch (error) {
      logger.error('Image-based resume parsing failed:', error);
      throw new Error(`Image-based resume parsing failed: ${error.message}`);
    }
  }

  mergeMultiPageResults(results) {
    if (results.length === 1) {
      return results[0];
    }
    
    // Merge multiple pages intelligently
    const merged = {
      personalInfo: {},
      professionalSummary: '',
      experience: [],
      education: [],
      projects: [],
      skills: {},
      certifications: [],
      positions: [],
      interests: ''
    };
    
    results.forEach((result, index) => {
      // Personal info from first page
      if (index === 0 || Object.keys(merged.personalInfo).length === 0) {
        merged.personalInfo = { ...merged.personalInfo, ...result.personalInfo };
      }
      
      // Professional summary from first non-empty
      if (!merged.professionalSummary && result.professionalSummary) {
        merged.professionalSummary = result.professionalSummary;
      }
      
      // Concatenate arrays
      if (result.experience) merged.experience = merged.experience.concat(result.experience);
      if (result.education) merged.education = merged.education.concat(result.education);
      if (result.projects) merged.projects = merged.projects.concat(result.projects);
      if (result.certifications) merged.certifications = merged.certifications.concat(result.certifications);
      if (result.positions) merged.positions = merged.positions.concat(result.positions);
      
      // Merge skills
      merged.skills = { ...merged.skills, ...result.skills };
      
      // Interests from last non-empty
      if (result.interests) {
        merged.interests = result.interests;
      }
    });
    
    return merged;
  }

  // Generalized word boundary fixing function
  fixWordBoundaries(text) {
    if (!text || typeof text !== 'string') return text;
    
    let fixedText = text;
    
    console.log('Before fixing:', fixedText);
    
    // Step 1: Remove bullet symbols
    fixedText = fixedText.replace(/^[•·▪▫▸▹►▻◆◇◈◉◎●○\-–—*+]\s*/gm, '');
    
    // Step 2: Fix hyphenated words across lines
    fixedText = fixedText.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');
    
    // Step 3: VERY aggressive intra-word spacing fix
    // This handles ALL patterns like "Eng ineered", "us in g", "fe at ures"
    fixedText = fixedText.replace(/\b([a-zA-Z]{1,3})(\s+[a-zA-Z]{1,4})+\b/g, (match) => {
      const parts = match.trim().split(/\s+/);
      const joined = parts.join('');
      
      // More aggressive: if total length makes sense and no obvious separate words, join
      if (joined.length >= 3 && joined.length <= 20) {
        // Don't join if it contains obvious separate words
        const separateWords = ['and', 'or', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'of', 'is', 'are', 'was', 'were'];
        if (!parts.some(part => separateWords.includes(part.toLowerCase()))) {
          console.log(`Fixing: "${match}" -> "${joined}"`);
          return joined;
        }
      }
      
      return match;
    });
    
    // Step 4: Fix common concatenated word patterns
    fixedText = fixedText
      // Add space before common words that are concatenated
      .replace(/([a-z])(using|with|for|and|to|in|on|at|by|of|the|from|into|onto)/gi, '$1 $2')
      // Add space after common words that are concatenated  
      .replace(/(using|with|for|and|to|in|on|at|by|of|the|from|into|onto)([A-Z][a-z])/g, '$1 $2')
      // Fix camelCase boundaries
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Add space between letter and number
      .replace(/([a-z])(\d)/g, '$1 $2')
      .replace(/(\d)([a-z])/g, '$1 $2');
    
    // Step 5: Clean up and return
    const result = fixedText.replace(/\s+/g, ' ').trim();
    console.log('After fixing:', result);
    return result;
  }
  
  // Helper function to determine if parts look like a broken word
  isLikelyBrokenWord(parts) {
    if (parts.length < 2 || parts.length > 7) return false;
    
    // Check if this looks like a broken word vs multiple valid words
    const joinedWord = parts.join('').toLowerCase();
    const avgPartLength = parts.reduce((sum, part) => sum + part.length, 0) / parts.length;
    
    // Heuristics to identify broken words:
    // 1. Average part length is very small (likely OCR broke up a word)
    // 2. Contains common patterns that indicate broken words
    // 3. Joined word length suggests it's a single word, not multiple words
    
    if (avgPartLength <= 2.5 && joinedWord.length >= 4) {
      return true; // Very small parts, likely broken
    }
    
    // Check for common broken word patterns
    const commonBrokenPatterns = [
      /^[a-z]{1,2}[aeiou][a-z]/, // Short parts with vowels
      /ing$/, /tion$/, /ment$/, /ness$/, /able$/, /ible$/, // Common suffixes
      /^(un|re|pre|dis|mis|over|under|out|up)/, // Common prefixes
      /^(back|front|data|manage|develop|implement|analyz|perform)/ // Common tech terms
    ];
    
    if (commonBrokenPatterns.some(pattern => pattern.test(joinedWord))) {
      return true;
    }
    
    // Don't fix if it contains obvious separate words
    const obviousSeparateWords = ['and', 'or', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'of', 'is', 'are', 'was', 'were', 'have', 'has', 'had'];
    if (parts.some(part => obviousSeparateWords.includes(part.toLowerCase()))) {
      return false;
    }
    
    return avgPartLength <= 3 && joinedWord.length >= 6; // Conservative default
  }

  postProcessVisualParsingResults(data) {
    // Only fix hyphenated words that are broken across lines, preserve normal line breaks
    const fixHyphenatedWords = (text) => {
      if (!text || typeof text !== 'string') return text;
      
      // ONLY fix words that are actually hyphenated and broken
      // This should match: "man-\nual" but NOT normal line breaks
      return text
        // Fix ONLY hyphenated words that span across lines (word + hyphen + newline + word continuation)
        .replace(/(\w+)-\s*\n\s*([a-z]+)/g, '$1$2\n')  // Join the word but keep the line break
        // Fix hyphenated words on same line with space after hyphen
        .replace(/(\w+)-\s+([a-z]+)/g, '$1$2');
    };

    const processedData = JSON.parse(JSON.stringify(data)); // Deep clone

    // Process professional summary
    if (processedData.professionalSummary) {
      processedData.professionalSummary = fixHyphenatedWords(processedData.professionalSummary);
    }

    // Process experience details
    if (processedData.experience && Array.isArray(processedData.experience)) {
      processedData.experience.forEach(exp => {
        if (exp.details) {
          exp.details = fixHyphenatedWords(exp.details);
        }
        ['position', 'company', 'location'].forEach(field => {
          if (exp[field]) {
            exp[field] = fixHyphenatedWords(exp[field]);
          }
        });
      });
    }

    // Process education details
    if (processedData.education && Array.isArray(processedData.education)) {
      processedData.education.forEach(edu => {
        if (edu.details) {
          edu.details = fixHyphenatedWords(edu.details);
        }
        ['institution', 'degree'].forEach(field => {
          if (edu[field]) {
            edu[field] = fixHyphenatedWords(edu[field]);
          }
        });
      });
    }

    // Process project details
    if (processedData.projects && Array.isArray(processedData.projects)) {
      processedData.projects.forEach(proj => {
        if (proj.details) {
          proj.details = fixHyphenatedWords(proj.details);
        }
        ['name', 'type'].forEach(field => {
          if (proj[field]) {
            proj[field] = fixHyphenatedWords(proj[field]);
          }
        });
      });
    }

    // Process skills
    if (processedData.skills && typeof processedData.skills === 'object') {
      Object.keys(processedData.skills).forEach(category => {
        if (processedData.skills[category]) {
          processedData.skills[category] = fixHyphenatedWords(processedData.skills[category]);
        }
      });
    }

    return processedData;
  }

  async parseResume(resumeText) {
    try {
      logger.info('Starting resume parsing with AI');
      
      // Preprocess the text to handle PDF extraction issues
      const cleanedText = this.preprocessResumeText(resumeText);
      
      const prompt = `You are parsing text from a software developer's resume. Some words have been broken by OCR and have spaces where they shouldn't.

Your job: Write each word correctly in proper English.

Examples:
- "us ing" should be "using"
- "Eng ineered" should be "Engineered"  
- "fe atures" should be "features"

Remove bullet symbols (•, -, *, +) and output properly spelled words in the JSON format below.

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
      "details": "string (each point on new line with no bullet symbols)"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "dates": "string",
      "gpa": "string",
      "details": "string (each point on new line with no bullet symbols)"
    }
  ],
  "projects": [
    {
      "name": "string",
      "type": "string",
      "location": "string", 
      "dates": "string",
      "details": "string (each point on new line with no bullet symbols)"
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

Example of intelligent parsing:
❌ RAW TEXT: "Built a RESTful e-commerce b a ckend us in g Dj a ngo with fe atures like c a rt"
✅ PARSED: "Built a RESTful e-commerce backend using Django with features like cart"

💡 CONTEXT UNDERSTANDING:
- "b a ckend" → "backend" (server-side development)
- "us in g" → "using" (common English word)  
- "Dj a ngo" → "Django" (Python web framework)
- "fe atures" → "features" (functionality)
- "c a rt" → "cart" (shopping cart)

Resume text to parse:
${cleanedText}

Return only the JSON object with clean text formatting as specified above, no additional text.`;

      const response = await this.callGeminiAPI(prompt);
      
      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Post-process to ensure consistent bullet point formatting
      this.formatBulletPoints(parsedData);
      
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

  formatBulletPoints(data) {
    // Helper function to properly parse bullet points by merging continuation lines
    const formatText = (text) => {
      if (!text || typeof text !== 'string') return text;
      
      // Split text into lines
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const bulletPoints = [];
      let currentPoint = '';
      
      for (const line of lines) {
        // Check if this line starts with a bullet symbol
        const isBulletStart = /^\s*[•·▪▫▸▹►▻◆◇◈◉◎●○\-–—*+]\s*/.test(line);
        
        if (isBulletStart) {
          // If we have a current point, save it
          if (currentPoint.trim()) {
            bulletPoints.push(currentPoint.trim());
          }
          // Start new point, removing the bullet symbol
          currentPoint = line.replace(/^\s*[•·▪▫▸▹►▻◆◇◈◉◎●○\-–—*+]\s*/, '').trim();
        } else if (currentPoint) {
          // This is a continuation line, add it to current point
          currentPoint += ' ' + line.trim();
        } else {
          // This is content without a bullet, treat as a standalone point
          // But still remove any leading bullet symbols that might have been missed
          const cleanedLine = line.replace(/^\s*[•·▪▫▸▹►▻◆◇◈◉◎●○\-–—*+]\s*/, '').trim();
          bulletPoints.push(cleanedLine);
        }
      }
      
      // Don't forget the last point
      if (currentPoint.trim()) {
        bulletPoints.push(currentPoint.trim());
      }
      
      // Return points as-is since Gemini is producing correct output
      return bulletPoints.join('\n');
    };

    // Format experience details
    if (data.experience && Array.isArray(data.experience)) {
      data.experience.forEach(exp => {
        if (exp.details) {
          exp.details = formatText(exp.details);
        }
      });
    }

    // Format education details
    if (data.education && Array.isArray(data.education)) {
      data.education.forEach(edu => {
        if (edu.details) {
          edu.details = formatText(edu.details);
        }
      });
    }

    // Format project details
    if (data.projects && Array.isArray(data.projects)) {
      data.projects.forEach(proj => {
        if (proj.details) {
          proj.details = formatText(proj.details);
        }
      });
    }

    // Format positions of responsibility
    if (data.positions && Array.isArray(data.positions)) {
      data.positions = data.positions.map(pos => {
        if (typeof pos === 'string') {
          return pos.replace(/^\s*[•·▪▫▸▹►▻◆◇◈◉◎●○\-–—*+]\s*/, '').trim();
        }
        return pos;
      });
    }

    return data;
  }

  // Markdown formatting utilities
  convertMarkdownToHtml(text) {
    if (!text || typeof text !== 'string') return text;
    
    return text
      // Convert **bold** to <strong>bold</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert *italic* to <em>italic</em> (optional for future use)
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  }

  convertHtmlToMarkdown(text) {
    if (!text || typeof text !== 'string') return text;
    
    return text
      // Convert <strong>bold</strong> to **bold**
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      // Convert <b>bold</b> to **bold**
      .replace(/<b>(.*?)<\/b>/g, '**$1**')
      // Convert <em>italic</em> to *italic* (optional for future use)
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      // Convert <i>italic</i> to *italic*
      .replace(/<i>(.*?)<\/i>/g, '*$1*');
  }

  convertMarkdownToLatex(text) {
    if (!text || typeof text !== 'string') return text;
    
    return text
      // Convert **bold** to \textbf{bold}
      .replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}')
      // Convert *italic* to \textit{italic} (optional for future use)
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '\\textit{$1}');
  }

  // Process resume data to add formatting conversions
  processFormattedResumeData(data, outputFormat = 'html') {
    const processText = (text) => {
      if (!text) return text;
      
      switch (outputFormat) {
        case 'html':
          return this.convertMarkdownToHtml(text);
        case 'latex':
          return this.convertMarkdownToLatex(text);
        case 'markdown':
          return text; // Already in markdown format
        default:
          return text;
      }
    };

    const processedData = JSON.parse(JSON.stringify(data)); // Deep clone

    // Process professional summary
    if (processedData.professionalSummary) {
      processedData.professionalSummary = processText(processedData.professionalSummary);
    }

    // Process experience details
    if (processedData.experience && Array.isArray(processedData.experience)) {
      processedData.experience.forEach(exp => {
        if (exp.details) {
          exp.details = processText(exp.details);
        }
      });
    }

    // Process education details
    if (processedData.education && Array.isArray(processedData.education)) {
      processedData.education.forEach(edu => {
        if (edu.details) {
          edu.details = processText(edu.details);
        }
      });
    }

    // Process project details
    if (processedData.projects && Array.isArray(processedData.projects)) {
      processedData.projects.forEach(proj => {
        if (proj.details) {
          proj.details = processText(proj.details);
        }
      });
    }

    // Process skills (they might contain formatted text)
    if (processedData.skills && typeof processedData.skills === 'object') {
      Object.keys(processedData.skills).forEach(category => {
        if (processedData.skills[category]) {
          processedData.skills[category] = processText(processedData.skills[category]);
        }
      });
    }

    return processedData;
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

module.exports = BaseAIService;