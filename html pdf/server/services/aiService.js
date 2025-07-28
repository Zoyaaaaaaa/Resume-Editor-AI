const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
        this.model = null;
        
        if (this.genAI) {
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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

            // Test the service with a simple prompt
            const result = await this.model.generateContent('Hello');
            return { available: true, response: result.response.text() };
        } catch (error) {
            console.error('AI service status check failed:', error);
            return { available: false, reason: error.message };
        }
    }

    async structureResumeData(prompt) {
        if (!await this.isAvailable()) {
            throw new Error('AI service not available');
        }

        try {
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            
            console.log('Raw AI response:', responseText);
            
            // Clean the response text
            let cleanedText = responseText.trim();
            
            // Remove markdown code blocks if present
            cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            
            // Remove any leading/trailing non-JSON text
            const jsonStart = cleanedText.indexOf('{');
            const jsonEnd = cleanedText.lastIndexOf('}');
            
            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error('No valid JSON structure found in AI response');
            }
            
            const jsonText = cleanedText.substring(jsonStart, jsonEnd + 1);
            console.log('Extracted JSON text:', jsonText);
            
            // Parse the JSON
            const parsedData = JSON.parse(jsonText);
            
            // Validate that it has the expected structure
            if (!parsedData || typeof parsedData !== 'object') {
                throw new Error('Parsed data is not a valid object');
            }
            
            return parsedData;

        } catch (error) {
            console.error('AI structuring error:', error);
            console.error('Failed response text:', error.responseText || 'No response text');
            throw new Error(`Failed to structure resume data: ${error.message}`);
        }
    }

    async enhanceContent(options) {
        if (!await this.isAvailable()) {
            throw new Error('AI service not available - Gemini API key not configured');
        }

        const { section, content, jobDescription, enhancementType } = options;

        try {
            const prompt = this.createEnhancementPrompt(section, content, jobDescription, enhancementType);
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();

            // Parse the AI response
            const enhancedContent = this.parseEnhancementResponse(responseText);
            
            return enhancedContent;

        } catch (error) {
            console.error('Content enhancement error:', error);
            throw new Error(`Failed to enhance content: ${error.message}`);
        }
    }

    createEnhancementPrompt(section, content, jobDescription, enhancementType) {
        let prompt = `Please enhance the following ${section} section for a resume:\n\nOriginal Content:\n${content}\n\n`;

        if (jobDescription) {
            prompt += `Job Description for Reference:\n${jobDescription}\n\n`;
        }

        switch (enhancementType) {
            case 'ats-optimization':
                prompt += `Enhancement Type: ATS Optimization
Instructions:
1. Optimize for Applicant Tracking Systems (ATS)
2. Include relevant keywords that would match the job description
3. Use action verbs and quantifiable achievements
4. Ensure proper formatting for ATS parsing
5. Maintain professional tone and accuracy`;
                break;

            case 'keyword-enhancement':
                prompt += `Enhancement Type: Keyword Enhancement
Instructions:
1. Identify and incorporate industry-relevant keywords
2. Ensure keywords flow naturally in the content
3. Focus on technical skills and competencies
4. Maintain readability while optimizing for search`;
                break;

            default: // content-improvement
                prompt += `Enhancement Type: Content Improvement
Instructions:
1. Improve clarity and impact of the content
2. Use strong action verbs and specific achievements
3. Quantify results where possible
4. Ensure professional tone and proper grammar
5. Make the content more compelling to recruiters`;
        }

        prompt += `\n\nPlease provide:
1. Enhanced version of the content
2. List of improvements made
3. Keywords added (if applicable)

Format your response as JSON:
{
    "enhancedContent": "improved content here",
    "improvements": ["list of improvements made"],
    "keywordsAdded": ["list of keywords added"]
}`;

        return prompt;
    }

    parseEnhancementResponse(responseText) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    enhancedContent: parsed.enhancedContent || responseText,
                    improvements: parsed.improvements || [],
                    keywordsAdded: parsed.keywordsAdded || []
                };
            } else {
                // If no JSON found, return the text as enhanced content
                return {
                    enhancedContent: responseText.trim(),
                    improvements: ['Content enhanced by AI'],
                    keywordsAdded: []
                };
            }
        } catch (error) {
            console.warn('Failed to parse enhancement response as JSON:', error);
            return {
                enhancedContent: responseText.trim(),
                improvements: ['Content enhanced by AI'],
                keywordsAdded: []
            };
        }
    }

    async analyzeATSScore(resumeData, jobDescription) {
        if (!await this.isAvailable()) {
            throw new Error('AI service not available');
        }

        try {
            const prompt = `Analyze the following resume for ATS (Applicant Tracking System) compatibility and scoring:

Resume Data:
${JSON.stringify(resumeData, null, 2)}

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ''}

Please provide an ATS analysis with:
1. Overall ATS score (0-100)
2. Breakdown by categories (keywords, formatting, sections, etc.)
3. Specific suggestions for improvement
4. Important keywords that should be included

Format as JSON:
{
    "score": 85,
    "breakdown": {
        "keywords": 70,
        "formatting": 90,
        "sections": 85,
        "content": 80
    },
    "suggestions": ["list of improvement suggestions"],
    "keywords": ["important keywords to include"]
}`;

            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in ATS analysis response');
            }

            return JSON.parse(jsonMatch[0]);

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
            const prompt = `Extract important keywords, skills, and requirements from this job description:

${jobDescription}

Please categorize and return as JSON:
{
    "keywords": ["general keywords"],
    "skills": ["technical and soft skills"],
    "requirements": ["specific requirements"]
}`;

            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in keyword extraction response');
            }

            return JSON.parse(jsonMatch[0]);

        } catch (error) {
            console.error('Keyword extraction error:', error);
            throw new Error(`Failed to extract keywords: ${error.message}`);
        }
    }

    async generateContentSuggestions(options) {
        if (!await this.isAvailable()) {
            throw new Error('AI service not available');
        }

        const { section, role, industry, experienceLevel } = options;

        try {
            const prompt = `Generate content suggestions for a resume ${section} section:

Role: ${role || 'General'}
Industry: ${industry || 'General'}
Experience Level: ${experienceLevel || 'mid'}

Please provide 3-5 professional examples that would be appropriate for this ${section} section.

Format as JSON array:
{
    "suggestions": [
        "suggestion 1",
        "suggestion 2",
        "suggestion 3"
    ]
}`;

            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                // Fallback: parse as plain text
                const lines = responseText.split('\n').filter(line => line.trim());
                return { suggestions: lines };
            }

            const parsed = JSON.parse(jsonMatch[0]);
            return parsed;

        } catch (error) {
            console.error('Content suggestion error:', error);
            throw new Error(`Failed to generate content suggestions: ${error.message}`);
        }
    }

    // Utility method to clean up AI responses
    cleanResponse(text) {
        return text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
    }

    // Method to validate AI responses
    validateResponse(response, expectedFields = []) {
        if (!response || typeof response !== 'object') {
            return false;
        }

        return expectedFields.every(field => response.hasOwnProperty(field));
    }
}

module.exports = AIService;