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
        body('jobDescription').optional().isString().trim().isLength({ max: 5000 }),
        body('jobRole').optional().isString().isIn(['software', 'datascience', 'consulting']).default('software')
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

            const { section, content, context, jobDescription, jobRole = 'software' } = req.body;
            console.log("SECTIONS:->>> ", section);
            console.log("CONTENT:->>> ", content);
            console.log("CONTEXT:->>> ", context);
            console.log("JOB DESCRIPTION:->>> ", jobDescription);
            console.log("JOB ROLE:->>> ", jobRole);

            // Role-specific data
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

            // Generate role and section-specific prompt
            function generatePrompt(section, content, context, jobDescription, jobRole) {
                const role = roleData[jobRole];
                let prompt = '';

                switch (section) {
                    case 'experience':
                        if (jobRole === 'software') {
                            prompt = `Enhance this software/IT experience point for maximum technical impact and professional presentation.

Original point: "${content}"
${context ? `Context/Role: ${context}` : ''}
${jobDescription ? `Target Position: ${jobDescription}` : ''}

TECHNICAL ENHANCEMENT REQUIREMENTS:
- Lead with powerful action verbs: ${role.actionVerbs.slice(0, 8).join(', ')}
- Incorporate technical impact keywords: ${role.keywords.slice(0, 6).join(', ')}
- Highlight relevant technologies: ${role.skills.slice(0, 8).join(', ')}
- Follow Action + Technology + Implementation + Quantified Impact structure
- Emphasize system improvements, performance gains, or user experience enhancements
- Include specific metrics, percentages, or measurable outcomes
- Focus on technical problem-solving and scalable solutions
-Do not lie and 

MANDATORY CHARACTER REQUIREMENTS:
- MUST BE exactly 90-95 characters (one PDF line) OR 190 characters (two PDF lines)
- Count ALL characters including spaces, punctuation, and special characters
- Example 95 chars: "Developed microservices architecture using Node.js reducing API response time by 40%"
- Example 190 chars: "Implemented distributed caching system using Redis and optimized database queries, improving application performance by 35% and reducing server load by 50% for 10K+ daily users"

QUALITY STANDARDS:
- Professional and impactful language
- ATS-friendly technical keywords
- Quantifiable business/technical impact
- Maintain truthfulness to original meaning
- NO bullet points, formatting, or character counts in response

Return ONLY the enhanced technical point meeting character requirements.`;

                        } else if (jobRole === 'datascience') {
                            prompt = `Enhance this data science experience point emphasizing analytical expertise and measurable business impact.

Original point: "${content}"
${context ? `Context/Role: ${context}` : ''}
${jobDescription ? `Target Position: ${jobDescription}` : ''}

DATA SCIENCE ENHANCEMENT REQUIREMENTS:
- Use analytical action verbs: ${role.actionVerbs.slice(0, 8).join(', ')}
- Include ML/analytics keywords: ${role.keywords.slice(0, 6).join(', ')}
- Highlight data science tools: ${role.skills.slice(0, 8).join(', ')}
- Follow Action + Data/Model + Methodology + Business Impact structure
- Emphasize model performance, data insights, and business value
- Include accuracy metrics, efficiency gains, or revenue impact
- Focus on end-to-end data science workflow and stakeholder value

MANDATORY CHARACTER REQUIREMENTS:
- MUST BE exactly 95 characters (one PDF line) OR 190 characters (two PDF lines)
- Count ALL characters including spaces, punctuation, and special characters
- Example 95 chars: "Built predictive model using Random Forest achieving 92% accuracy, increasing sales by 18%"

QUALITY STANDARDS:
- Emphasize data-driven decision making and quantifiable outcomes
- Include technical methodology and business impact
- ATS-friendly data science keywords
- Professional analytical language

Return ONLY the enhanced data science point meeting character requirements.`;

                        } else { // consulting
                            prompt = `Enhance this consulting experience point showcasing strategic thinking and client value delivery.

Original point: "${content}"
${context ? `Context/Role: ${context}` : ''}
${jobDescription ? `Target Position: ${jobDescription}` : ''}

CONSULTING ENHANCEMENT REQUIREMENTS:
- Use strategic action verbs: ${role.actionVerbs.slice(0, 8).join(', ')}
- Include business impact keywords: ${role.keywords.slice(0, 6).join(', ')}
- Highlight consulting tools/skills: ${role.skills.slice(0, 6).join(', ')}
- Follow Action + Client/Business + Methodology + Quantified Value structure
- Emphasize strategic solutions, process improvements, and measurable ROI
- Include cost savings, efficiency gains, or revenue increases
- Focus on client satisfaction and business transformation

MANDATORY CHARACTER REQUIREMENTS:
- MUST BE exactly 95 characters (one PDF line) OR 190 characters (two PDF lines)
- Count ALL characters including spaces, punctuation, and special characters

QUALITY STANDARDS:
- Professional business language with strategic focus
- Quantifiable client impact and business value
- ATS-friendly consulting keywords

Return ONLY the enhanced consulting point meeting character requirements.`;
                        }
                        break;

                    case 'projects':
                        if (jobRole === 'software') {
                            prompt = `Enhance this software project description highlighting technical implementation and measurable outcomes.

Original point: "${content}"
${context ? `Project Context: ${context}` : ''}
${jobDescription ? `Target Role: ${jobDescription}` : ''}

PROJECT ENHANCEMENT FOCUS:
- Start with technical action verbs: ${role.actionVerbs.slice(0, 6).join(', ')}
- Showcase technology stack and architecture decisions
- Include performance/impact metrics: ${role.keywords.slice(0, 4).join(', ')}
- Highlight technologies: ${role.skills.slice(0, 8).join(', ')}
- Emphasize technical challenges solved and scalable solutions
- Include user impact, performance improvements, or system metrics

MANDATORY CHARACTER REQUIREMENTS:
- MUST BE exactly 95 characters (one PDF line) OR 190 characters (two PDF lines)
- Focus on technical implementation, tools used, and quantifiable project success

Return ONLY the enhanced project description meeting character requirements.`;

                        } else if (jobRole === 'datascience') {
                            prompt = `Enhance this data science project showcasing analytical methodology and data-driven insights.

Original point: "${content}"
${context ? `Project Context: ${context}` : ''}
${jobDescription ? `Target Role: ${jobDescription}` : ''}

PROJECT ENHANCEMENT FOCUS:
- Use analytical action verbs: ${role.actionVerbs.slice(0, 6).join(', ')}
- Highlight data processing, modeling, and validation approaches
- Include impact keywords: ${role.keywords.slice(0, 4).join(', ')}
- Showcase DS tools: ${role.skills.slice(0, 8).join(', ')}
- Emphasize data sources, methodology, model performance, and business insights

MANDATORY CHARACTER REQUIREMENTS:
- MUST BE exactly 95 characters (one PDF line) OR 190 characters (two PDF lines)
- Focus on data analysis workflow, models, and quantifiable business impact

Return ONLY the enhanced project description meeting character requirements.`;

                        } else { // consulting
                            prompt = `Enhance this consulting project emphasizing strategic approach and client value delivered.

Original point: "${content}"
${context ? `Project Context: ${context}` : ''}
${jobDescription ? `Target Role: ${jobDescription}` : ''}

PROJECT ENHANCEMENT FOCUS:
- Lead with strategic action verbs: ${role.actionVerbs.slice(0, 6).join(', ')}
- Highlight problem-solving methodology and frameworks
- Include business impact: ${role.keywords.slice(0, 4).join(', ')}
- Showcase consulting tools: ${role.skills.slice(0, 6).join(', ')}
- Emphasize client challenge, strategic approach, and measurable outcomes

MANDATORY CHARACTER REQUIREMENTS:
- MUST BE exactly 95 characters (one PDF line) OR 190 characters (two PDF lines)
- Focus on strategic methodology and quantifiable client value

Return ONLY the enhanced project description meeting character requirements.`;
                        }
                        break;

                    case 'education':
                        prompt = `Enhance this education point highlighting academic achievements and relevant technical/analytical foundation.

Original point: "${content}"
${context ? `Academic Context: ${context}` : ''}

EDUCATION ENHANCEMENT:
- Use achievement-focused verbs: Completed, Achieved, Specialized, Graduated, Earned
- Highlight relevant coursework, GPA (if >3.5), academic projects, or honors
- Include technical skills gained or methodologies learned
- Mention leadership roles, research, or significant academic contributions

MANDATORY CHARACTER REQUIREMENTS:
- MUST BE exactly 95 characters (one PDF line) OR 190 characters (two PDF lines)
- Focus on academic excellence, relevant skills, and standout achievements

Return ONLY the enhanced education point meeting character requirements.`;
                        break;

                    case 'areasOfInterest':
                        prompt = `Enhance this areas of interest point showing professional curiosity and continuous learning alignment.

Original point: "${content}"
${context ? `Interest Context: ${context}` : ''}

INTEREST ENHANCEMENT:
- Use exploration verbs: Exploring, Researching, Passionate about, Investigating
- Connect interests to current industry trends and emerging technologies
- Show alignment with ${jobRole} career trajectory and professional growth
- Demonstrate continuous learning mindset and industry awareness

MANDATORY CHARACTER REQUIREMENTS:
- MUST BE exactly 95 characters (one PDF line) OR 190 characters (two PDF lines)
- Focus on professional development and industry-relevant interests

Return ONLY the enhanced interest statement meeting character requirements.`;
                        break;

                    case 'positionOfResponsibility':
                        prompt = `Enhance this leadership position showcasing management skills and organizational impact.

Original point: "${content}"
${context ? `Leadership Context: ${context}` : ''}

LEADERSHIP ENHANCEMENT:
- Use leadership verbs: Led, Managed, Coordinated, Facilitated, Mentored, Organized
- Highlight team size, scope of responsibility, or initiatives managed
- Include measurable outcomes: team performance, process improvements, or organizational impact
- Show people management, strategic thinking, and results delivery

MANDATORY CHARACTER REQUIREMENTS:
- MUST BE exactly 95 characters (one PDF line) OR 190 characters (two PDF lines)
- Focus on leadership impact, team development, and organizational value

Return ONLY the enhanced leadership statement meeting character requirements.`;
                        break;
                }

                return prompt;
            }

            const prompt = generatePrompt(section, content, context, jobDescription, jobRole);
            console.log("GENERATED PROMPT:->>> ", prompt);

            const enhancedContent = await aiService.generateContent(prompt);
            console.log("ENHANCED CONTENT-->>", enhancedContent);
            
            const cleanedContent = enhancedContent
                .trim()
                .replace(/^[•\-\*]\s*/, '') // Remove bullet points at start
                .replace(/\n[•\-\*]\s*/g, '\n') // Remove bullet points from new lines
                .replace(/^\d+\.\s*/, '') // Remove numbered lists
                .trim();

            res.json({
                success: true,
                originalContent: content,
                enhancedContent: cleanedContent,
                section,
                jobRole,
                improvements: {
                    addedMetrics: cleanedContent.includes('%') || /\d+/.test(cleanedContent),
                    improvedActionVerbs: true,
                    addedTechnicalSkills: roleData[jobRole].skills.some(skill => 
                        cleanedContent.toLowerCase().includes(skill.toLowerCase())
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