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


            

            function generatePrompt(section, content, context, jobDescription, jobRole, enhancementCount = 1) {
    const role = roleData[jobRole];
    let prompt = '';
   
    // Enhancement tracking warning
    const enhancementWarning = enhancementCount > 2 ?
        `⚠️ ENHANCEMENT #${enhancementCount}: Previous attempts may have quality issues. Focus on IMPACT framework and avoid repetition.\n\n` : '';
   
    switch (section) {
        case 'experience':
            if (jobRole === 'software') {
                prompt = `${enhancementWarning}**Create exactly 3 IMPACTFUL bullet points** from this software/IT experience using the WHAT-HOW-EFFECT framework.


**Original point:** "${content}"
${context ? `**Context/Role:** ${context}` : ''}
${jobDescription ? `**Target Position:** ${jobDescription}` : ''}


**CRITICAL IMPACT FRAMEWORK (MANDATORY):**
Each bullet point MUST follow: **WHAT (Action) + HOW (Method/Technology) + EFFECT (Result/Impact)**


**WHAT**: Clear action verb describing what you did
**HOW**: Specific method, technology, or approach used (ONLY from original content)
**EFFECT**: Measurable outcome, learning, or impact achieved


**TECHNOLOGY GUARDRAILS:**
-   ONLY use technologies/frameworks EXPLICITLY mentioned in original content
-   NEVER fabricate or add technologies not present in original text
-   DO NOT assume programming languages, tools, or frameworks
-   NO invented metrics, user counts, or performance numbers
-   Focus on methodology and technical approach when specific tools aren't mentioned


**QUALITY CONTROLS:**
- **Character count**: 79-85 characters (primary target) OR 160-170 characters if needed for complete IMPACT
- **Orphan words**: Ensure no single words hanging at line end (count spaces)
- **No repetition**: Each bullet must be unique and non-overlapping
- **Email/contact validation**: Preserve exact formatting without spaces
- **Action verbs**: ${role.actionVerbs.slice(0, 8).join(', ')}
- **Technical keywords**: ${role.keywords.slice(0, 6).join(', ')} (only if present in original)


**STRUCTURE REQUIREMENTS:**
- Bold key technical terms that appear in original content
- Professional technical language appropriate for ${jobRole} role
- Complete sentences with proper grammar
- No sentence fragments or incomplete thoughts


**RETURN FORMAT:**
Return EXACTLY 3 bullet points, each following WHAT-HOW-EFFECT structure.
NO explanations, character counts, or additional text.`;


            } else if (jobRole === 'datascience') {
                prompt = `${enhancementWarning}**Create exactly 3 IMPACTFUL bullet points** from this data science experience using the WHAT-HOW-EFFECT framework.


**Original point:** "${content}"
${context ? `**Context/Role:** ${context}` : ''}
${jobDescription ? `**Target Position:** ${jobDescription}` : ''}


**CRITICAL IMPACT FRAMEWORK (MANDATORY):**
Each bullet point MUST follow: **WHAT (Analysis) + HOW (Method/Tools) + EFFECT (Insight/Learning)**


**WHAT**: Analytical action describing the data work performed
**HOW**: Specific analytical method, algorithm, or tool used (ONLY from original)
**EFFECT**: Insights gained, patterns discovered, or analytical learning achieved


**DATA SCIENCE GUARDRAILS:**
-   ONLY use DS tools/methods EXPLICITLY mentioned in original content
-   NEVER add ML models, algorithms, or libraries not present
-   DO NOT fabricate accuracy percentages, dataset sizes, or performance metrics
-   NO invented business impact or cost savings
-   Focus on analytical methodology and learning process


**QUALITY CONTROLS:**
- **Character count**: 79-85 characters (primary) OR 160-170 characters for complete IMPACT
- **Orphan words**: Ensure complete phrases, no hanging words
- **No repetition**: Each bullet showcases different analytical aspects
- **Analytical verbs**: ${role.actionVerbs.slice(0, 8).join(', ')}
- **DS keywords**: ${role.keywords.slice(0, 6).join(', ')} (only if in original)


**STRUCTURE REQUIREMENTS:**
- Bold analytical terms present in original content
- Emphasize methodology over results when metrics aren't provided
- Professional analytical language
- Complete analytical narrative in each bullet


**RETURN FORMAT:**
Return EXACTLY 3 bullet points following WHAT-HOW-EFFECT for data science.
NO explanations or additional text.`;


            } else {
                prompt = `${enhancementWarning}**Create exactly 3 IMPACTFUL bullet points** from this consulting experience using the WHAT-HOW-EFFECT framework.


**Original point:** "${content}"
${context ? `**Context/Role:** ${context}` : ''}
${jobDescription ? `**Target Position:** ${jobDescription}` : ''}


**CRITICAL IMPACT FRAMEWORK (MANDATORY):**
Each bullet point MUST follow: **WHAT (Strategy) + HOW (Framework/Approach) + EFFECT (Value/Outcome)**


**WHAT**: Strategic action or business initiative undertaken
**HOW**: Methodology, framework, or approach used (ONLY from original)
**EFFECT**: Business value, strategic outcome, or client benefit achieved


**CONSULTING GUARDRAILS:**
-   ONLY use frameworks/methodologies EXPLICITLY mentioned in original
-   NEVER add consulting frameworks (McKinsey, BCG methods) not present
-   DO NOT fabricate revenue figures, cost savings, or business metrics
-   NO invented client outcomes or market impact
-   Focus on strategic thinking and problem-solving approach


**QUALITY CONTROLS:**
- **Character count**: 79-85 characters (primary) OR 160-170 characters for complete IMPACT
- **Orphan words**: Ensure complete business phrases
- **No repetition**: Each bullet addresses different strategic aspects
- **Strategic verbs**: ${role.actionVerbs.slice(0, 8).join(', ')}
- **Business keywords**: ${role.keywords.slice(0, 6).join(', ')} (only if in original)


**STRUCTURE REQUIREMENTS:**
- Bold strategic terms from original content
- Professional business language with strategic focus
- Client-focused perspective when applicable
- Complete strategic narrative


**RETURN FORMAT:**
Return EXACTLY 3 bullet points following WHAT-HOW-EFFECT for consulting.
NO explanations or additional text.`;
            }
            break;


        case 'projects':
            if (jobRole === 'software') {
                prompt = `${enhancementWarning}**Create exactly 3 IMPACTFUL bullet points** from this software project using the WHAT-HOW-EFFECT framework.


**Original point:** "${content}"
${context ? `**Project Context:** ${context}` : ''}
${jobDescription ? `**Target Role:** ${jobDescription}` : ''}


**CRITICAL IMPACT FRAMEWORK (MANDATORY):**
Each bullet point MUST follow: **WHAT (Development) + HOW (Technology/Method) + EFFECT (Learning/Outcome)**


**WHAT**: Technical development action or feature implemented
**HOW**: Specific technology stack or implementation approach (ONLY from original)
**EFFECT**: Technical learning, functionality achieved, or development outcome


**PROJECT GUARDRAILS:**
-   ONLY use technologies/frameworks EXPLICITLY mentioned in original
-   NEVER add programming languages, databases, or tools not specified
-   DO NOT fabricate user numbers, performance metrics, or deployment stats
-   NO invented technical achievements or system capabilities
-   Focus on technical learning and implementation process


**QUALITY CONTROLS:**
- **Character count**: 79-85 characters (primary) OR 160-170 characters for complete IMPACT
- **Orphan words**: Ensure complete technical phrases
- **No repetition**: Each bullet covers different technical aspects
- **Technical verbs**: ${role.actionVerbs.slice(0, 6).join(', ')}
- **Tech keywords**: ${role.keywords.slice(0, 4).join(', ')} (only if relevant)


**STRUCTURE REQUIREMENTS:**
- Bold technology names from original content
- Emphasize learning and technical growth
- Show problem-solving approach
- Complete technical narrative


**RETURN FORMAT:**
Return EXACTLY 3 bullet points following WHAT-HOW-EFFECT for software projects.
NO explanations or additional text.`;


            } else if (jobRole === 'datascience') {
                prompt = `${enhancementWarning}**Create exactly 3 IMPACTFUL bullet points** from this data science project using the WHAT-HOW-EFFECT framework.


**Original point:** "${content}"
${context ? `**Project Context:** ${context}` : ''}
${jobDescription ? `**Target Role:** ${jobDescription}` : ''}


**CRITICAL IMPACT FRAMEWORK (MANDATORY):**
Each bullet point MUST follow: **WHAT (Analysis) + HOW (DS Method/Tool) + EFFECT (Insight/Learning)**


**WHAT**: Data analysis or modeling work performed
**HOW**: Specific DS methodology or tool used (ONLY from original)
**EFFECT**: Analytical insights gained, patterns discovered, or learning achieved


**PROJECT GUARDRAILS:**
-   ONLY use DS tools/methods EXPLICITLY mentioned in original
-   NEVER add ML algorithms, libraries, or datasets not specified
-   DO NOT fabricate accuracy scores, model performance, or data sizes
-   NO invented analytical outcomes or predictive results
-   Focus on analytical methodology and learning process


**QUALITY CONTROLS:**
- **Character count**: 79-85 characters (primary) OR 160-170 characters for complete IMPACT
- **Orphan words**: Complete analytical phrases only
- **No repetition**: Each bullet shows different analytical work
- **Analytical verbs**: ${role.actionVerbs.slice(0, 6).join(', ')}
- **DS keywords**: ${role.keywords.slice(0, 4).join(', ')} (only if relevant)


**RETURN FORMAT:**
Return EXACTLY 3 bullet points following WHAT-HOW-EFFECT for DS projects.
NO explanations or additional text.`;


            } else {
                prompt = `${enhancementWarning}**Create exactly 3 IMPACTFUL bullet points** from this consulting project using the WHAT-HOW-EFFECT framework.


**Original point:** "${content}"
${context ? `**Project Context:** ${context}` : ''}
${jobDescription ? `**Target Role:** ${jobDescription}` : ''}


**CRITICAL IMPACT FRAMEWORK (MANDATORY):**
Each bullet point MUST follow: **WHAT (Strategy Work) + HOW (Method/Framework) + EFFECT (Value/Learning)**


**WHAT**: Strategic analysis or business work conducted
**HOW**: Specific methodology or approach used (ONLY from original)
**EFFECT**: Strategic insights, business value, or learning achieved


**PROJECT GUARDRAILS:**
-   ONLY use frameworks/methods EXPLICITLY mentioned in original
-   NEVER add consulting frameworks not specified in original
-   DO NOT fabricate business impact or financial results
-   NO invented strategic outcomes or client benefits
-   Focus on strategic learning and problem-solving approach


**QUALITY CONTROLS:**
- **Character count**: 79-85 characters (primary) OR 160-170 characters for complete IMPACT
- **Orphan words**: Complete strategic phrases only
- **No repetition**: Each bullet addresses different strategic work
- **Strategic verbs**: ${role.actionVerbs.slice(0, 6).join(', ')}
- **Business keywords**: ${role.keywords.slice(0, 4).join(', ')} (only if relevant)


**RETURN FORMAT:**
Return EXACTLY 3 bullet points following WHAT-HOW-EFFECT for consulting projects.
NO explanations or additional text.`;
            }
            break;


        case 'education':
            prompt = `${enhancementWarning}**Create exactly 1 SINGLE-LINE description** from this education entry highlighting academic foundation.


**Original point:** "${content}"
${context ? `**Academic Context:** ${context}` : ''}


**CRITICAL SINGLE-LINE REQUIREMENT:**
- MUST be exactly ONE continuous line of text
- NO bullet points, NO line breaks, NO multiple sentences
- Maximum 120 characters including spaces
- Professional academic summary in single sentence


**EDUCATION GUARDRAILS:**
-   ONLY mention coursework/activities EXPLICITLY stated in original
-   NEVER add subjects, courses, or achievements not present
-   DO NOT fabricate GPA, rankings, honors, or academic metrics
-   NO invented extracurricular activities or academic projects
-   Focus on academic foundation and learning mentioned


**FORMATTING REQUIREMENTS:**
- Keep numbers exactly as written: "9.20" stays "9.20", "8.90" stays "8.90"
- NO line breaks or multiple sentences
- Single continuous professional statement
- Bold relevant academic terms from original content only


**RETURN FORMAT:**
Return EXACTLY 1 single-line description (no bullet points).
NO explanations or additional text.`;
            break;


        case 'areasOfInterest':
            prompt = `${enhancementWarning}**Transform this into 5 professional interest domains** separated by pipe (|) symbols.


**Original content:** "${content}"
${context ? `**Context:** ${context}` : ''}


**QUALITY CONTROLS:**
- Create **5 broad professional domains** relevant to ${jobRole} career
- **No repetition**: Each domain must be distinct and non-overlapping
- **Format**: Domain 1 | Domain 2 | Domain 3 | Domain 4 | Domain 5
- **Bold key terms** within each domain using **term** format
- Focus on: emerging technologies, methodologies, industry trends, research areas
- Base on original content theme and career direction
- Professional language appropriate for ${jobRole} field


**DOMAIN REQUIREMENTS:**
- Each domain should be 2-4 words maximum
- Broad yet specific to show professional curiosity
- Connected to current industry developments
- Relevant to career growth in ${jobRole}
- No generic terms like "Technology" or "Business"


**RETURN FORMAT:**
Return ONLY the 5 domains separated by pipe symbols.
NO explanations or additional text.`;
            break;


        case 'positionOfResponsibility':
            prompt = `${enhancementWarning}**Create exactly 3 IMPACTFUL bullet points** from this leadership position using the WHAT-HOW-EFFECT framework.


**Original point:** "${content}"
${context ? `**Leadership Context:** ${context}` : ''}


**CRITICAL IMPACT FRAMEWORK (MANDATORY):**
Each bullet point MUST follow: **WHAT (Leadership Action) + HOW (Method/Approach) + EFFECT (Team/Organizational Impact)**


**WHAT**: Leadership action or responsibility undertaken
**HOW**: Specific leadership approach or method used (ONLY from original)
**EFFECT**: Team development, organizational outcome, or leadership learning


**LEADERSHIP GUARDRAILS:**
-   ONLY mention responsibilities EXPLICITLY stated in original
-   NEVER add team sizes, budget figures, or organizational metrics not present
-   DO NOT fabricate leadership achievements or impact numbers
-   NO invented organizational outcomes or team results
-   Focus on leadership approach and interpersonal skills demonstrated


**QUALITY CONTROLS:**
- **Character count**: 79-85 characters (primary) OR 160-170 characters for complete IMPACT
- **Orphan words**: Complete leadership phrases
- **No repetition**: Each bullet shows different leadership aspects
- **Leadership verbs**: Led, Managed, Coordinated, Facilitated, Mentored, Organized, Guided


**STRUCTURE REQUIREMENTS:**
- Bold leadership terms from original content
- Emphasize collaboration and responsibility
- Show leadership development and growth
- Professional leadership language


**RETURN FORMAT:**
Return EXACTLY 3 bullet points following WHAT-HOW-EFFECT for leadership.
NO explanations or additional text.`;
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
