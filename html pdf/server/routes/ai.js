const express = require('express');
const { body, validationResult } = require('express-validator');
const AIService = require('../services/aiService');

const router = express.Router();
const aiService = new AIService();

// Middleware to check AI service availability
const checkAIService = async (req, res, next) => {
    try {
        const isAvailable = await aiService.isAvailable();
        if (!isAvailable) {
            return res.status(503).json({
                error: 'AI service unavailable',
                message: 'Gemini AI service is not configured',
                timestamp: new Date().toISOString()
            });
        }
        next();
    } catch (error) {
        next(error);
    }
};

// Validation middleware for AI enhancement
const validateEnhancementRequest = [
    body('section').isString().isIn([
        'experience', 
        'projects', 
        'education', 
        'extracurricular', 
        'skills', 
        'summary'
    ]),
    body('content').isString().trim().isLength({ min: 10, max: 5000 }),
    body('jobDescription').optional().isString().trim().isLength({ max: 10000 }),
    body('enhancementType').optional().isString().isIn([
        'ats-optimization', 
        'content-improvement', 
        'keyword-enhancement'
    ])
];

// AI Enhancement endpoint
router.post('/enhance', 
    checkAIService,
    validateEnhancementRequest, 
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Invalid enhancement request',
                    details: errors.array(),
                    timestamp: new Date().toISOString()
                });
            }

            const { section, content, jobDescription, enhancementType = 'content-improvement' } = req.body;

            const enhancedContent = await aiService.enhanceContent({
                section,
                content,
                jobDescription,
                enhancementType
            });

            res.json({
                success: true,
                originalContent: content,
                enhancedContent,
                section,
                enhancementType,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            next(error);
        }
    }
);

// ATS Score Analysis endpoint
router.post('/ats-score', 
    checkAIService,
    [
        body('resumeData').isObject(),
        body('jobDescription').optional().isString().trim().isLength({ max: 10000 })
    ], 
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Invalid ATS analysis request',
                    details: errors.array(),
                    timestamp: new Date().toISOString()
                });
            }

            const { resumeData, jobDescription } = req.body;
            const analysis = await aiService.analyzeATSScore(resumeData, jobDescription);

            res.json({
                success: true,
                ...analysis,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            next(error);
        }
    }
);

// Keyword extraction endpoint
router.post('/extract-keywords', 
    checkAIService,
    [
        body('jobDescription').isString().trim().isLength({ min: 50, max: 10000 })
    ], 
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Invalid keyword extraction request',
                    details: errors.array(),
                    timestamp: new Date().toISOString()
                });
            }

            const { jobDescription } = req.body;
            const keywords = await aiService.extractKeywords(jobDescription);

            res.json({
                success: true,
                ...keywords,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            next(error);
        }
    }
);

// Content suggestions endpoint
router.post('/suggest-content', 
    checkAIService,
    [
        body('section').isString().isIn(['experience', 'projects', 'skills', 'summary']),
        body('role').optional().isString().trim().isLength({ max: 100 }),
        body('industry').optional().isString().trim().isLength({ max: 50 }),
        body('experienceLevel').optional().isString().isIn(['entry', 'mid', 'senior', 'executive'])
    ], 
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Invalid content suggestion request',
                    details: errors.array(),
                    timestamp: new Date().toISOString()
                });
            }

            const { section, role, industry, experienceLevel } = req.body;
            const suggestions = await aiService.generateContentSuggestions({
                section,
                role,
                industry,
                experienceLevel
            });

            res.json({
                success: true,
                section,
                ...suggestions,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            next(error);
        }
    }
);

// Point-wise enhancement endpoint
router.post('/enhance-point', 
    checkAIService,
    [
        body('section').isString().isIn(['experience', 'projects', 'education', 'areasOfInterest', 'positionOfResponsibility']),
        body('content').isString().trim().isLength({ min: 1, max: 1000 }),
        body('context').optional().isString().trim().isLength({ max: 2000 }),
        body('jobDescription').optional().isString().trim().isLength({ max: 5000 })
    ], 
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Invalid point enhancement request',
                    details: errors.array(),
                    timestamp: new Date().toISOString()
                });
            }

            const { section, content, context, jobDescription } = req.body;

            // Create specific prompt for point enhancement focused on the 5 required sections
            let prompt = `Enhance this single resume point for a ${section} section. This should be for one of these sections: Areas of Interest, Education, Experience, Projects, or Position of Responsibility.\n\nOriginal point: "${content}"\n\n`;
            
            if (context) {
                prompt += `Context (position/project details): ${context}\n\n`;
            }
            
            if (jobDescription) {
                prompt += `Target job description: ${jobDescription}\n\n`;
            }

            prompt += `MANDATORY CHARACTER REQUIREMENTS:
- MUST BE exactly 95 characters (one PDF line) OR 190 characters (two PDF lines)
- Count ALL characters including spaces, punctuation, and special characters
- Example of 95 characters: "Developed automated data pipeline using Python and SQL, reducing processing time by 45%"
- Example of 94 characters: "Led cross-functional team of 8 developers, delivering 3 major features ahead of schedule"

Quality Instructions (while meeting character requirements):
- Make this point impactful and professional
- Use strong action verbs and quantifiable results where appropriate
- Ensure ATS-friendly keywords
- Maintain truthfulness to the original meaning
- DO NOT include bullet points (•) in the response
- DO NOT include character count in your response
- Return ONLY the enhanced text without any formatting, bullet points, or character counts

Return only the enhanced point text that MUST meet the character count requirements. Do not include the character count in your response.`;

            const enhancedContent = await aiService.generateContent(prompt);
            
            // Clean the response to ensure no bullet points
            const cleanedContent = enhancedContent
                .trim()
                .replace(/^[•\-\*]\s*/, '') // Remove bullet points at start
                .replace(/\n[•\-\*]\s*/g, '\n') // Remove bullet points from new lines
                .trim();

            res.json({
                success: true,
                originalContent: content,
                enhancedContent: cleanedContent,
                section,
                improvements: {
                    addedMetrics: cleanedContent.includes('%') || /\d+/.test(cleanedContent),
                    improvedActionVerbs: true,
                    addedTechnicalSkills: [],
                    enhancementType: 'content-improvement'
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Point enhancement error:', error);
            next(error);
        }
    }
);

// AI service status endpoint
router.get('/status', async (req, res, next) => {
    try {
        const status = await aiService.getServiceStatus();

        res.json({
            service: 'AI Enhancement',
            status: status.available ? 'available' : 'unavailable',
            features: {
                contentEnhancement: status.available,
                atsAnalysis: status.available,
                keywordExtraction: status.available,
                contentSuggestions: status.available,
                pointEnhancement: status.available
            },
            provider: 'Google Gemini AI',
            timestamp: new Date().toISOString(),
            details: status.available ? undefined : status.reason
        });

    } catch (error) {
        next(error);
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('AI route error:', err);

    const statusCode = err.message.includes('API_KEY') ? 503 : 
                      err.message.includes('quota') || err.message.includes('rate limit') ? 429 : 
                      500;

    res.status(statusCode).json({
        success: false,
        error: statusCode === 503 ? 'AI service unavailable' : 
               statusCode === 429 ? 'Rate limit exceeded' : 'AI service error',
        message: err.message,
        statusCode,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;