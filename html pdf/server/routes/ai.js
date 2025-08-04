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
    
    // Add safety check
    if (!roleInfo) {
        throw new Error(`Invalid role: ${role}. Must be one of: software, datascience, consulting`);
    }
    
    let prompt = '';

    const warning = enhancementCount > 2
        ? `ENHANCEMENT #${enhancementCount}: Previous attempts may have quality issues. Focus on IMPACT framework and avoid repetition and reduce 4-5 chars.\n\n`
        : '';

    switch (section) {
        case 'experience':
            if (role === 'software') {
                prompt = `
**Enhance this software/IT experience for maximum technical impact.**

**Original:** "${content}"
${context ? `**Context:** ${context}` : ''}
${jobDescription ? `**Target:** ${jobDescription}` : ''}

**Requirements:**
- **Action verbs:** ${roleInfo.actionVerbs.slice(0, 8).join(', ')}
- **Keywords:** ${roleInfo.keywords.slice(0, 6).join(', ')}
- **Tech stack:** ${roleInfo.skills.slice(0, 8).join(', ')}
- **Structure:** Action + Tech + Implementation + Impact
- STRICTLY MAINTAIN->**Characters:** 105-110 per bullet point (including all spaces/punctuation) if not posioble just double it nothing else so that entire meaing is preserved.
- **Format:** 3 clean bullet points with • symbol only

**Standards:**
- No numbering (1, 2, 3) or "Here are" preambles
- Bold key technologies, zero filler words
- No fabricated metrics, eliminate orphan words
- Professional, ATS-friendly language

**Return Format:**
• [Enhanced bullet point 1]
• [Enhanced bullet point 2]
• [Enhanced bullet point 3]

**Return:** Only the 3 bullet points, nothing else.
`.trim();
            } else if (role === 'datascience') {
                prompt = `
**Enhance this data science experience for analytical impact.**

**Original:** "${content}"
${context ? `**Context:** ${context}` : ''}
${jobDescription ? `**Target:** ${jobDescription}` : ''}

**Requirements:**
- **Action verbs:** ${roleInfo.actionVerbs.slice(0, 8).join(', ')}
- **Keywords:** ${roleInfo.keywords.slice(0, 6).join(', ')}
- **Tools:** ${roleInfo.skills.slice(0, 8).join(', ')}
- **Structure:** Action + Data/Model + Method + **Measurable Impact**
- **Characters:** 105-110  per bullet point (including all spaces/punctuation)
- **Format:** 3 clean bullet points with • symbol only

**Standards:**
- No numbering (1, 2, 3) or "Here are" preambles
- Bold analytical terms, no fluff
- **Impact-driven:** Emphasize outcomes and insights delivered
- No fabricated accuracy metrics
- Eliminate unnecessary words

**Return Format:**
• [Enhanced bullet point 1]
• [Enhanced bullet point 2]
• [Enhanced bullet point 3]

**Return:** Only the 3 bullet points, nothing else.
`.trim();
            } else {  // consulting
                prompt = `
**Enhance this consulting experience for strategic impact.**

**Original:** "${content}"
${context ? `**Context:** ${context}` : ''}
${jobDescription ? `**Target:** ${jobDescription}` : ''}

**Requirements:**
- **Action verbs:** ${roleInfo.actionVerbs.slice(0, 8).join(', ')}
- **Keywords:** ${roleInfo.keywords.slice(0, 6).join(', ')}
- **Skills:** ${roleInfo.skills.slice(0, 6).join(', ')}
- **Structure:** Action + Client/Business + Method + **Business Value**
- **Characters:** 105-110  per bullet point (including all spaces/punctuation)

**Standards:**
- No fabricated financial figures
- Bold strategic terms, crisp professional tone
- **Value-focused:** Highlight client outcomes and business impact
- Eliminate filler words

**Return Format:**
• [Enhanced bullet point]

**Return:** Only the single bullet point, nothing else.
`.trim();
            }
            break;

        case 'projects':
            if (role === 'software') {
                prompt = `
**Enhance this software project for technical showcase.**

**Original:** "${content}"
${context ? `**Context:** ${context}` : ''}
${jobDescription ? `**Target:** ${jobDescription}` : ''}

**Requirements:**
- **Action verbs:** ${roleInfo.actionVerbs.slice(0, 6).join(', ')}
- **Tech stack:** ${roleInfo.skills.slice(0, 8).join(', ')}
- **Keywords:** ${roleInfo.keywords.slice(0, 4).join(', ')}
- **Structure:** Action + Tech + Implementation + **Performance Outcome**
- **Characters:** 105-110  per bullet point (including all spaces/punctuation)
- **Format:** 3 clean bullet points with • symbol only

**Standards:**
- No numbering (1, 2, 3) or "Here are" preambles
- Bold technologies and implementations
- **Results-oriented:** Focus on system performance and user impact
- Zero unnecessary words or cryptic abbreviations
- No fabricated performance metrics

**Return Format:**
• [Enhanced bullet point 1]
• [Enhanced bullet point 2] 
• [Enhanced bullet point 3]

**Return:** Only the 3 bullet points, nothing else.
`.trim();
            } else if (role === 'datascience') {
                prompt = `
**Enhance this data science project for analytical showcase.**

**Original:** "${content}"
${context ? `**Context:** ${context}` : ''}
${jobDescription ? `**Target:** ${jobDescription}` : ''}

**Requirements:**
- **Action verbs:** ${roleInfo.actionVerbs.slice(0, 6).join(', ')}
- **Tools:** ${roleInfo.skills.slice(0, 8).join(', ')}
- **Keywords:** ${roleInfo.keywords.slice(0, 4).join(', ')}
- **Structure:** Action + Data/Model + Method + **Research Insight**
- **Characters:** 105-110  per bullet point (including all spaces/punctuation)
- **Format:** 3 clean bullet points with • symbol only

**Standards:**
- No numbering (1, 2, 3) or "Here are" preambles
- Bold analytical methods and tools
- **Discovery-focused:** Emphasize insights and methodology breakthroughs
- Crisp methodology focus, eliminate jargon
- No fabricated accuracy metrics

**Return Format:**
• [Enhanced bullet point 1]
• [Enhanced bullet point 2]
• [Enhanced bullet point 3]

**Return:** Only the 3 bullet points, nothing else.
`.trim();
            } else {  // consulting
                prompt = `
**Enhance this consulting project for strategic showcase.**

**Original:** "${content}"
${context ? `**Context:** ${context}` : ''}
${jobDescription ? `**Target:** ${jobDescription}` : ''}

**Requirements:**
- **Action verbs:** ${roleInfo.actionVerbs.slice(0, 6).join(', ')}
- **Frameworks:** ${roleInfo.skills.slice(0, 6).join(', ')}
- **Keywords:** ${roleInfo.keywords.slice(0, 4).join(', ')}
- **Structure:** Action + Client/Business + Method + Value
- **Lines:** 1-2 lines maximum, strategic focus
- **Characters:** 130-280 total (accounting for 2 lines)
- **Format:** Return 3 variants, each 1-2 lines

**Standards:**
- No fabricated impact figures
- Bold strategic methodologies
- Professional, direct tone
- Zero filler content

**Return:** 1 strategic project description, 1-2 lines.
`.trim();
            }
            break;

        case 'education':
            prompt = `
**Enhance this education point for academic impact.**

**Original:** "${content}"
${context ? `**Context:** ${context}` : ''}

**Requirements:**
- **Action verbs:** Completed, Achieved, Specialized, Graduated, Earned
- **Structure:** Degree + Institution + **Academic Achievement** (if mentioned)
- **Characters:** 105-110  per bullet point (including all spaces/punctuation)

**Standards:**
- No fabricated GPA or honors
- Bold degree type, institution, achievements
- **Achievement-focused:** Highlight honors, specializations, relevant coursework
- Crisp academic tone
- Eliminate unnecessary descriptors

**Return:** 1 enhanced education point, 1-2 lines.
`.trim();
            break;

        case 'areasOfInterest':
            prompt = `
**Transform into 5 professional interest domains.**

**Original:** "${content}"
${context ? `**Context:** ${context}` : ''}

**Requirements:**
- **Format:** Domain1 | Domain2 | Domain3 | Domain4 | Domain5
- **Focus:** Emerging tech, methodologies, trends for ${role}
- **Characters:**105-110  total per domain
- **Style:** Bold key terms, specific yet broad domains

**Standards:**
- Zero filler words
- **Future-focused:** Emphasize cutting-edge and emerging areas
- Professional terminology
- Relevant to career path
- No cryptic abbreviations

**Return:** 5 domains separated by pipes, 1-2 lines.
`.trim();
            break;

        case 'positionOfResponsibility':
            prompt = `
**Enhance this leadership position for management impact.**

**Original:** "${content}"
${context ? `**Context:** ${context}` : ''}

**Requirements:**
- **Action verbs:** Led, Managed, Coordinated, Facilitated, Mentored, Organized
- **Structure:** Role + Scope + **Leadership Impact** (if mentioned)
- **Characters:** 105-110  per bullet point (including all spaces/punctuation)

**Standards:**
- No fabricated team sizes or metrics
- Bold leadership role and responsibilities
- **Impact-driven:** Emphasize team development and organizational outcomes
- Impactful, professional tone
- Eliminate redundant words

**Return:** 1 enhanced leadership statement, 1-2 lines.
`.trim();
            break;

        default:
            throw new Error(`Unsupported section: ${section}`);
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
