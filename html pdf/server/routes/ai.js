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

// Point enhancement endpoint
router.post('/enhance-point',
    checkAIService,
    [
        body('section').isString().isIn(['experience', 'projects', 'education', 'areasOfInterest', 'positionOfResponsibility']),
        body('content').isString().trim().isLength({ min: 1, max: 1000 }),
        body('context').optional().isString().trim().isLength({ max: 2000 }),
        body('jobDescription').optional().isString().trim().isLength({ max: 5000 }),
        body('role').optional().isString().isIn(['software', 'datascience', 'consulting']).default('software')
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

            const { section, content, context, jobDescription, role = 'software' } = req.body;
            console.log("SECTION: ", section);
            console.log("CONTENT: ", content);
            console.log("CONTEXT: ", context);
            console.log("JOB DESCRIPTION: ", jobDescription);
            console.log("ROLE: ", role);

            const roleData = {
                software: {
                    actionVerbs: ['Developed', 'Implemented', 'Designed', 'Architected', 'Optimized', 'Enhanced', 'Built', 'Deployed', 'Integrated', 'Debugged', 'Maintained', 'Scaled'],
                    keywords: ['Performance Optimization', 'System Architecture', 'User Experience', 'Scalability', 'API Integration', 'Database Optimization', 'Code Quality', 'Load Time', 'Throughput', 'Reliability'],
                    skills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Microservices', 'REST API', 'GraphQL', 'Redis']
                },
                datascience: {
                    actionVerbs: ['Analyzed', 'Modeled', 'Predicted', 'Optimized', 'Extracted', 'Automated', 'Validated', 'Implemented', 'Deployed', 'Visualized', 'Processed', 'Trained'],
                    keywords: ['Machine Learning', 'Data Pipeline', 'Model Accuracy', 'Feature Engineering', 'Statistical Analysis', 'Predictive Modeling', 'Data Visualization', 'Algorithm Optimization', 'Big Data', 'Business Intelligence'],
                    skills: ['Python', 'R', 'SQL', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Tableau', 'Power BI', 'Jupyter', 'Apache Spark', 'MLflow', 'Docker']
                },
                consulting: {
                    actionVerbs: ['Advised', 'Strategized', 'Facilitated', 'Analyzed', 'Optimized', 'Delivered', 'Coordinated', 'Implemented', 'Streamlined', 'Negotiated', 'Presented', 'Transformed'],
                    keywords: ['Strategic Planning', 'Process Optimization', 'Cost Reduction', 'ROI Improvement', 'Stakeholder Management', 'Business Transformation', 'Market Analysis', 'Operational Efficiency', 'Change Management', 'Client Satisfaction'],
                    skills: ['Business Analysis', 'Project Management', 'Excel', 'PowerPoint', 'Tableau', 'Process Mapping', 'Agile', 'Lean Six Sigma', 'Financial Modeling', 'Stakeholder Engagement']
                }
            };

            function generatePrompt(section, content, context, jobDescription, role, enhancementCount = 1) {
                const roleInfo = roleData[role];
                let prompt = '';

                const warning = enhancementCount > 2
                    ? `ENHANCEMENT #${enhancementCount}: Previous attempts may have quality issues. Focus on IMPACT framework and avoid repetition.\n\n`
                    : '';

                switch (section) {
                    case 'experience':
                        prompt = `${warning}**Create exactly 3 IMPACTFUL bullet points** from this ${role} experience using the WHAT-HOW-EFFECT framework.

**Original point:** "${content}"
${context ? `**Context/Role:** ${context}` : ''}
${jobDescription ? `**Target Position:** ${jobDescription}` : ''}

**CRITICAL IMPACT FRAMEWORK (MANDATORY):**
Each bullet point MUST follow: **WHAT (Action) + HOW (Method/Technology) + EFFECT (Result/Impact)**

**WHAT**: Clear action verb describing what you did
**HOW**: Specific method, technology, or approach used (ONLY from original content)
**EFFECT**: Measurable outcome, learning, or impact achieved

**TECHNOLOGY GUARDRAILS:**
- ONLY use technologies/frameworks EXPLICITLY mentioned in original content
- NEVER fabricate or add technologies not present in original text
- NO invented metrics or performance numbers

**QUALITY CONTROLS:**
- **Character count**: 79-85 characters (primary) OR 160-170 characters if needed
- **No orphan words**: Ensure complete phrases
- **No repetition**: Each bullet unique
- **Action verbs**: ${roleInfo.actionVerbs.slice(0, 8).join(', ')}
- **Technical keywords**: ${roleInfo.keywords.slice(0, 6).join(', ')}

**RETURN FORMAT:**
Return EXACTLY 3 bullet points, each following WHAT-HOW-EFFECT. NO explanations or additional text.`;
                        break;

                    case 'projects':
                        prompt = `${warning}**Create exactly 3 IMPACTFUL bullet points** from this ${role} project using the WHAT-HOW-EFFECT framework.

**Original point:** "${content}"
${context ? `**Project Context:** ${context}` : ''}
${jobDescription ? `**Target Role:** ${jobDescription}` : ''}

**CRITICAL IMPACT FRAMEWORK (MANDATORY):**
Each bullet point MUST follow: **WHAT (Development) + HOW (Technology) + EFFECT (Outcome)**

**WHAT**: Technical development action or feature implemented
**HOW**: Specific technology or implementation approach (ONLY from original)
**EFFECT**: Technical outcome or learning achieved

**PROJECT GUARDRAILS:**
- ONLY use technologies/frameworks EXPLICITLY mentioned
- NEVER fabricate metrics or user numbers

**QUALITY CONTROLS:**
- **Character count**: 79-85 characters (primary) OR 160-170 characters if needed
- **Technical verbs**: ${roleInfo.actionVerbs.slice(0, 6).join(', ')}
- **Tech keywords**: ${roleInfo.keywords.slice(0, 4).join(', ')}

**RETURN FORMAT:**
Return EXACTLY 3 bullet points. NO explanations or additional text.`;
                        break;

                    case 'education':
                        prompt = `${warning}**Create exactly 1 SINGLE-LINE description** from this education entry.

**Original point:** "${content}"
${context ? `**Academic Context:** ${context}` : ''}

**REQUIREMENTS:**
- Single continuous line (max 120 chars)
- NO line breaks or bullets

**RETURN FORMAT:**
Return EXACTLY 1 single-line description. NO additional text.`;
                        break;

                    case 'areasOfInterest':
                        prompt = `${warning}**Transform this into 5 professional interest domains** separated by |.

**Original content:** "${content}"

**REQUIREMENTS:**
- 5 distinct domains relevant to ${role}
- 2-4 words each, separated by |
- Bold key terms

**RETURN FORMAT:**
Return ONLY the pipe-separated domains.`;
                        break;

                    case 'positionOfResponsibility':
                        prompt = `${warning}**Create exactly 3 IMPACTFUL bullet points** from this leadership position.

**Original point:** "${content}"
${context ? `**Leadership Context:** ${context}` : ''}

**CRITICAL IMPACT FRAMEWORK:**
WHAT + HOW + EFFECT

**QUALITY CONTROLS:**
- 79-85 chars primary OR 160-170 chars detailed
- Leadership verbs: Led, Managed, Coordinated, Facilitated, Mentored

**RETURN FORMAT:**
Return EXACTLY 3 bullet points. NO additional text.`;
                        break;
                }

                return prompt;
            }

            const prompt = generatePrompt(section, content, context, jobDescription, role);
            const enhancedRaw = await aiService.generateContent(prompt);
            const cleaned = enhancedRaw
                .trim()
                .replace(/^[•\-\*]\s*/, '')
                .replace(/\n[•\-\*]\s*/g, '\n')
                .replace(/^\d+\.\s*/, '')
                .trim();

            res.json({
                success: true,
                originalContent: content,
                enhancedContent: cleaned,
                section,
                role,
                improvements: {
                    addedMetrics: /\d+/.test(cleaned),
                    improvedActionVerbs: true,
                    addedTechnicalSkills: roleData[role].skills.some(s =>
                        cleaned.toLowerCase().includes(s.toLowerCase())
                    ),
                    enhancementType: 'role-specific-improvement'
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Point enhancement error:', error);
            next(error);
        }
    }
);

// Generate Areas of Interest endpoint
router.post('/generate-interests',
    checkAIService,
    [
        body('resumeData').isObject().withMessage('resumeData must be an object'),
        body('role').optional().isString().isIn(['software', 'datascience', 'consulting']).default('software')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Invalid generate interests request',
                    details: errors.array(),
                    timestamp: new Date().toISOString()
                });
            }

            const { resumeData, role = 'software' } = req.body;

            const resumeSummary = {
                experience: resumeData.experience?.map(exp => ({
                    position: exp.position,
                    company: exp.company,
                    technologies: exp.bulletPoints?.join(' ') || ''
                })) || [],
                projects: resumeData.projects?.map(proj => ({
                    title: proj.title,
                    technologies: proj.technologies || '',
                    description: proj.bulletPoints?.join(' ') || ''
                })) || [],
                education: resumeData.education?.map(edu => ({
                    degree: edu.degree,
                    field: edu.field,
                    institution: edu.institution
                })) || []
            };

            const prompt = `Based on the following resume information, generate appropriate "Areas of Interest" for a ${role} professional.

Resume Summary:
Experience: ${JSON.stringify(resumeSummary.experience, null, 2)}
Projects: ${JSON.stringify(resumeSummary.projects, null, 2)}
Education: ${JSON.stringify(resumeSummary.education, null, 2)}

REQUIREMENTS:
- Generate 4-6 relevant areas of interest separated by |
- Focus on industry trends for ${role}
- Single line pipe-separated string

EXAMPLES:
${role === 'software'
                    ? 'Cloud Architecture | Machine Learning | DevOps Automation | Microservices | Edge Computing'
                    : role === 'datascience'
                        ? 'Deep Learning | MLOps | Computer Vision | Natural Language Processing | Big Data Analytics'
                        : 'Digital Transformation | Strategic Analytics | Process Automation | Innovation Management'}`;

            const generated = await aiService.generateContent(prompt);
            const cleanedInterests = generated.trim().replace(/^["']|["']$/g, '');

            res.json({
                success: true,
                areasOfInterest: cleanedInterests,
                role,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Generate interests error:', error);
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
        err.message.includes('quota') || err.message.includes('rate limit') ? 429 : 500;

    res.status(statusCode).json({
        success: false,
        error: statusCode === 503 ? 'AI service unavailable'
            : statusCode === 429 ? 'Rate limit exceeded'
                : 'AI service error',
        message: err.message,
        statusCode,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
