const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
        this.model = null;
        
        if (this.genAI) {
            this.model = this.genAI.getGenerativeModel({ 
                model: 'gemini-2.5-flash',
                generationConfig: {
                    temperature: 0.6,
                    topP: 0.9,
                    topK: 40
                }
            });
        }
    }

    async isAvailable() {
        return !!(this.apiKey && this.genAI && this.model);
    }

    async getServiceStatus() {
        try {
            if (!await this.isAvailable()) {
                return { available: false, reason: 'API key not configured' };
            }

            const result = await this.model.generateContent('Hello');
            return { 
                available: true, 
                response: await result.response.text() 
            };
        } catch (error) {
            console.error('AI service status check failed:', error);
            return { 
                available: false, 
                reason: error.message 
            };
        }
    }

    async generateContent(prompt, options = {}) {
        if (!await this.isAvailable()) {
            throw new Error('AI service not available');
        }

        try {
            const { format = 'text', retries = 2 } = options;
            let lastError = null;

            for (let i = 0; i <= retries; i++) {
                try {
                    const result = await this.model.generateContent(prompt);
                    console.log("GENERATE FUNCTION INVOKED---> ",result);
                    const responseText = await result.response.text();
                    
                    if (format === 'json') {
                        return this.parseJsonResponse(responseText);
                    }
                    return responseText;
                } catch (error) {
                    lastError = error;
                    if (i < retries) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                    }
                }
            }

            throw lastError || new Error('AI generation failed');
        } catch (error) {
            console.error('AI generation error:', error);
            throw new Error(`Failed to generate content: ${error.message}`);
        }
    }

    parseJsonResponse(responseText) {
        try {
            let cleanedText = responseText.trim()
                .replace(/```json\s*/g, '')
                .replace(/```\s*/g, '');
            
            const jsonStart = cleanedText.indexOf('{');
            const jsonEnd = cleanedText.lastIndexOf('}');
            
            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error('No valid JSON structure found');
            }
            
            const jsonText = cleanedText.substring(jsonStart, jsonEnd + 1);
            const parsedData = JSON.parse(jsonText);
            
            if (!parsedData || typeof parsedData !== 'object') {
                throw new Error('Parsed data is not a valid object');
            }
            
            return parsedData;
        } catch (error) {
            console.error('JSON parsing error:', error);
            throw new Error(`Failed to parse AI response: ${error.message}`);
        }
    }

    async structureResumeData(text) {
        try {
            const prompt = `Parse this resume text into structured JSON format:
            
${text}

Return data in this exact format:
{
    "personalInfo": {
        "fullName": "",
        "email": "",
        "phone": "",
        "address": "",
        "linkedIn": "",
        "portfolio": ""
    },
    "education": [{
        "degree": "",
        "institution": "",
        "year": "",
        "details": ""
    }],
    "experience": [{
        "title": "",
        "company": "",
        "duration": "",
        "description": ""
    }],
    "skills": [],
    "projects": [{
        "title": "",
        "description": ""
    }],
    "certifications": []
}`;

            return await this.generateContent(prompt, { format: 'json' });
        } catch (error) {
            console.error('Resume structuring error:', error);
            throw new Error(`Failed to structure resume data: ${error.message}`);
        }
    }

    async enhanceContent(options) {
        if (!await this.isAvailable()) {
            throw new Error('AI service not available');
        }

        const { section, content, jobDescription, enhancementType } = options;

        try {
            const prompt = this.createEnhancementPrompt(section, content, jobDescription, enhancementType);
            const response = await this.generateContent(prompt, { format: 'json' });
            
            return {
                enhancedContent: response.enhancedContent || '',
                improvements: response.improvements || [],
                keywordsAdded: response.keywordsAdded || []
            };
        } catch (error) {
            console.error('Content enhancement error:', error);
            throw new Error(`Failed to enhance content: ${error.message}`);
        }
    }

    createEnhancementPrompt(section, content, jobDescription, enhancementType) {
        let prompt = `Enhance this resume ${section} section professionally:\n\nOriginal:\n${content}\n\n`;
        if (jobDescription) {
            prompt += `Job Description:\n${jobDescription}\n\n`;
        }

        prompt += `Instructions:\n`;
        switch (enhancementType) {
            case 'ats-optimization':
                prompt += `- Optimize for ATS systems\n- Add relevant keywords\n- Use action verbs\n- Quantify achievements\n- Keep professional tone`;
                break;
            case 'keyword-enhancement':
                prompt += `- Add industry keywords\n- Maintain natural flow\n- Focus on technical skills\n- Ensure readability`;
                break;
            default:
                prompt += `- Improve clarity\n- Strengthen action verbs\n- Add quantifiable results\n- Enhance professionalism`;
        }

        prompt += `\n\nReturn JSON exactly like this:
{
    "enhancedContent": "enhanced text here",
    "improvements": ["list", "of", "improvements"],
    "keywordsAdded": ["list", "of", "keywords"]
}`;

        return prompt;
    }

    async analyzeATSScore(resumeData, jobDescription) {
        if (!await this.isAvailable()) {
            throw new Error('AI service not available');
        }

        try {
            const prompt = `Analyze this resume for ATS compatibility:
            
Resume:
${JSON.stringify(resumeData, null, 2)}

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ''}

Return JSON with:
- score (0-100)
- breakdown (keywords, formatting, sections, content)
- suggestions
- keywords to add

Format:
{
    "score": 85,
    "breakdown": {
        "keywords": 70,
        "formatting": 90,
        "sections": 85,
        "content": 80
    },
    "suggestions": [],
    "keywords": []
}`;

            return await this.generateContent(prompt, { format: 'json' });
        } catch (error) {
            console.error('ATS analysis error:', error);
            throw new Error(`Failed to analyze ATS score: ${error.message}`);
        }
    }

    async extractKeywords(jobDescription) {
        if (!await this.isAvailable()) {
            throw new Error('AI service not available');
        }

        try {
            const prompt = `Extract keywords from this job description:
            
${jobDescription}

Return JSON with categorized keywords:
{
    "keywords": [],
    "skills": [],
    "requirements": [],
    "actionVerbs": []
}`;

            return await this.generateContent(prompt, { format: 'json' });
        } catch (error) {
            console.error('Keyword extraction error:', error);
            throw new Error(`Failed to extract keywords: ${error.message}`);
        }
    }

    async generateContentSuggestions(options) {
        console.log("INVOKED GENERATE CONTENT SUGGESTIONS ->>> ",options);
        if (!await this.isAvailable()) {
            throw new Error('AI service not available');
        }

        const { section, role, industry, experienceLevel } = options;

        try {
            const prompt = `Generate ${section} section suggestions for:
- Role: ${role || 'General'}
- Industry: ${industry || 'General'}
- Level: ${experienceLevel || 'mid'}

Return JSON with suggestions array:
{
    "suggestions": []
}`;

            return await this.generateContent(prompt, { format: 'json' });
        } catch (error) {
            console.error('Content suggestion error:', error);
            throw new Error(`Failed to generate suggestions: ${error.message}`);
        }
    }
}

module.exports = AIService;