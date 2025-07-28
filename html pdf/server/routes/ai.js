const express = require('express');
const { body, validationResult } = require('express-validator');
const AIService = require('../services/aiService');

const router = express.Router();

// Validation middleware for AI enhancement
const validateEnhancementRequest = [
    body('section').isString().isIn(['experience', 'projects', 'education', 'extracurricular', 'skills', 'summary']),
    body('content').isString().trim().isLength({ min: 10, max: 2000 }),
    body('jobDescription').optional().isString().trim().isLength({ max: 1000 }),
    body('enhancementType').optional().isString().isIn(['ats-optimization', 'content-improvement', 'keyword-enhancement'])
];

// AI Enhancement endpoint
router.post('/enhance', validateEnhancementRequest, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Invalid enhancement request',
                details: errors.array(),
                timestamp: new Date().toISOString()
            });
        }

        const { section, content, jobDescription, enhancementType = 'content-improvement' } = req.body;

        console.log(`Enhancing ${section} section with AI`);

        const aiService = new AIService();
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
            improvements: enhancedContent.improvements || [],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI enhancement error:', error);

        // Handle specific AI service errors
        if (error.message.includes('API_KEY')) {
            return res.status(503).json({
                error: 'AI service unavailable',
                message: 'Gemini AI service is not configured',
                timestamp: new Date().toISOString()
            });
        }

        if (error.message.includes('quota') || error.message.includes('rate limit')) {
            return res.status(429).json({
                error: 'AI service rate limited',
                message: 'Please try again later',
                timestamp: new Date().toISOString()
            });
        }

        res.status(500).json({
            error: 'Failed to enhance content',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// ATS Score Analysis endpoint
router.post('/ats-score', [
    body('resumeData').isObject(),
    body('jobDescription').optional().isString().trim().isLength({ max: 2000 })
], async (req, res) => {
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

        console.log('Analyzing ATS score');

        const aiService = new AIService();
        const analysis = await aiService.analyzeATSScore(resumeData, jobDescription);

        res.json({
            success: true,
            score: analysis.score,
            breakdown: analysis.breakdown,
            suggestions: analysis.suggestions,
            keywords: analysis.keywords,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('ATS analysis error:', error);

        res.status(500).json({
            error: 'Failed to analyze ATS score',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// Keyword extraction endpoint
router.post('/extract-keywords', [
    body('jobDescription').isString().trim().isLength({ min: 50, max: 2000 })
], async (req, res) => {
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

        console.log('Extracting keywords from job description');

        const aiService = new AIService();
        const keywords = await aiService.extractKeywords(jobDescription);

        res.json({
            success: true,
            keywords: keywords.keywords,
            skills: keywords.skills,
            requirements: keywords.requirements,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Keyword extraction error:', error);

        res.status(500).json({
            error: 'Failed to extract keywords',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// Content suggestions endpoint
router.post('/suggest-content', [
    body('section').isString().isIn(['experience', 'projects', 'skills', 'summary']),
    body('role').optional().isString().trim().isLength({ max: 100 }),
    body('industry').optional().isString().trim().isLength({ max: 50 }),
    body('experience_level').optional().isString().isIn(['entry', 'mid', 'senior', 'executive'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Invalid content suggestion request',
                details: errors.array(),
                timestamp: new Date().toISOString()
            });
        }

        const { section, role, industry, experience_level } = req.body;

        console.log(`Generating content suggestions for ${section} section`);

        const aiService = new AIService();
        const suggestions = await aiService.generateContentSuggestions({
            section,
            role,
            industry,
            experienceLevel: experience_level
        });

        res.json({
            success: true,
            suggestions,
            section,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Content suggestion error:', error);

        res.status(500).json({
            error: 'Failed to generate content suggestions',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// AI service status endpoint
router.get('/status', async (req, res) => {
    try {
        const aiService = new AIService();
        const status = await aiService.getServiceStatus();

        res.json({
            service: 'AI Enhancement',
            status: status.available ? 'available' : 'unavailable',
            features: {
                contentEnhancement: status.available,
                atsAnalysis: status.available,
                keywordExtraction: status.available,
                contentSuggestions: status.available
            },
            provider: 'Google Gemini AI',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI status check error:', error);

        res.json({
            service: 'AI Enhancement',
            status: 'unavailable',
            error: 'Service check failed',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;