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

            // Generate role and section-specific prompt with improved flexibility
            function generatePrompt(section, content, context, jobDescription, jobRole) {
                const role = roleData[jobRole];
                let prompt = '';

//                 switch (section) {
//                     case 'experience':
//                         if (jobRole === 'software') {
//                             prompt = `**Enhance this software/IT experience point** for maximum technical impact and professional presentation.

// **Original point:** "${content}"
// ${context ? `**Context/Role:** ${context}` : ''}
// ${jobDescription ? `**Target Position:** ${jobDescription}` : ''}

// **TECHNICAL ENHANCEMENT REQUIREMENTS:**
// - **Lead with powerful action verbs:** ${role.actionVerbs.slice(0, 8).join(', ')}
// - **Incorporate relevant technical keywords:** ${role.keywords.slice(0, 6).join(', ')}
// - **Highlight applicable technologies:** ${role.skills.slice(0, 8).join(', ')} (only if relevant to the original content)
// - Follow **Action + Technology + Implementation + Impact** structure
// - Emphasize technical problem-solving and solutions implemented
// - **Include specific outcomes ONLY if mentioned** in original content or context
// - Focus on technical contributions and their significance

// **WORD RANGE REQUIREMENTS:**
// - **Target: 10-20 words** for concise impact OR **40-50 words** for detailed description
// - Prioritize clarity and professional impact over strict word limits
// - Ensure content fits naturally within resume formatting

// **QUALITY STANDARDS:**
// - **Professional and impactful language**
// - **NO fabricated numbers or metrics** unless present in original
// - **Maintain complete truthfulness** to original meaning
// - ATS-friendly technical terminology
// - **Bold key technical terms** and achievements naturally

// **Return ONLY the enhanced technical point - no explanations or character counts.**`;

//                         } else if (jobRole === 'datascience') {
//                             prompt = `**Enhance this data science experience point** emphasizing analytical expertise and measurable impact.

// **Original point:** "${content}"
// ${context ? `**Context/Role:** ${context}` : ''}
// ${jobDescription ? `**Target Position:** ${jobDescription}` : ''}

// **DATA SCIENCE ENHANCEMENT REQUIREMENTS:**
// - **Use analytical action verbs:** ${role.actionVerbs.slice(0, 8).join(', ')}
// - **Include relevant ML/analytics keywords:** ${role.keywords.slice(0, 6).join(', ')}
// - **Highlight applicable data science tools:** ${role.skills.slice(0, 8).join(', ')} (only if relevant)
// - Follow **Action + Data/Model + Methodology + Impact** structure
// - Emphasize analytical approach and insights delivered
// - **Include metrics ONLY if mentioned** in original content
// - Focus on data-driven problem solving and methodology

// **WORD RANGE REQUIREMENTS:**
// - **Target: 12-20 words** for concise impact OR **30-40 words** for detailed description
// - Maintain natural flow and professional presentation

// **QUALITY STANDARDS:**
// - **NO fabricated accuracy percentages or performance metrics**
// - Emphasize analytical methodology and approach
// - **Bold key data science terms** and methodologies
// - Professional analytical language

// **Return ONLY the enhanced data science point.**`;

//                         } else { // consulting
//                             prompt = `**Enhance this consulting experience point** showcasing strategic thinking and client value delivery.

// **Original point:** "${content}"
// ${context ? `**Context/Role:** ${context}` : ''}
// ${jobDescription ? `**Target Position:** ${jobDescription}` : ''}

// **CONSULTING ENHANCEMENT REQUIREMENTS:**
// - **Use strategic action verbs:** ${role.actionVerbs.slice(0, 8).join(', ')}
// - **Include business impact keywords:** ${role.keywords.slice(0, 6).join(', ')}
// - **Highlight relevant consulting skills:** ${role.skills.slice(0, 6).join(', ')} (only if applicable)
// - Follow **Action + Client/Business + Methodology + Value** structure
// - Emphasize strategic solutions and problem-solving approach
// - **Include business outcomes ONLY if mentioned** in original
// - Focus on client value and strategic contributions

// **WORD RANGE REQUIREMENTS:**
// - **Target: 20-25 words** for concise impact OR **30-40 words** for detailed description

// **QUALITY STANDARDS:**
// - **NO fabricated cost savings or revenue figures**
// - Professional business language with strategic focus
// - **Bold key strategic terms** and methodologies

// **Return ONLY the enhanced consulting point.**`;
//                         }
//                         break;

//                     case 'projects':
//                         if (jobRole === 'software') {
//                             prompt = `**Enhance this software project description** highlighting technical implementation and outcomes.

// **Original point:** "${content}"
// ${context ? `**Project Context:** ${context}` : ''}
// ${jobDescription ? `**Target Role:** ${jobDescription}` : ''}

// **PROJECT ENHANCEMENT FOCUS:**
// - **Start with technical action verbs:** ${role.actionVerbs.slice(0, 6).join(', ')}
// - **Showcase relevant technology stack:** ${role.skills.slice(0, 8).join(', ')} (only if applicable to project)
// - **Highlight technical keywords:** ${role.keywords.slice(0, 4).join(', ')}
// - Emphasize technical challenges addressed and solutions implemented
// - **Include project outcomes ONLY if mentioned** in original content
// - Focus on technical implementation and learning

// **WORD RANGE:** **20-35 words** for comprehensive project description
// **NO fabricated user numbers or performance metrics**
// **Bold technical technologies** and key implementations

// **Return ONLY the enhanced project description.**`;

//                         } else if (jobRole === 'datascience') {
//                             prompt = `**Enhance this data science project** showcasing analytical methodology and insights.

// **Original point:** "${content}"
// ${context ? `**Project Context:** ${context}` : ''}
// ${jobDescription ? `**Target Role:** ${jobDescription}` : ''}

// **PROJECT ENHANCEMENT FOCUS:**
// - **Use analytical action verbs:** ${role.actionVerbs.slice(0, 6).join(', ')}
// - **Highlight relevant DS tools:** ${role.skills.slice(0, 8).join(', ')} (only if used in project)
// - **Include analytical keywords:** ${role.keywords.slice(0, 4).join(', ')}
// - Emphasize data sources, methodology, and analytical approach
// - **Include project insights ONLY if mentioned** in original
// - Focus on analytical workflow and learning outcomes

// **WORD RANGE:** **20-35 words**
// **NO fabricated accuracy metrics or model performance**
// **Bold key analytical methods** and tools used

// **Return ONLY the enhanced project description.**`;

//                         } else { // consulting
//                             prompt = `**Enhance this consulting project** emphasizing strategic approach and value delivered.

// **Original point:** "${content}"
// ${context ? `**Project Context:** ${context}` : ''}
// ${jobDescription ? `**Target Role:** ${jobDescription}` : ''}

// **PROJECT ENHANCEMENT FOCUS:**
// - **Lead with strategic action verbs:** ${role.actionVerbs.slice(0, 6).join(', ')}
// - **Highlight relevant frameworks:** ${role.skills.slice(0, 6).join(', ')} (only if applicable)
// - **Include business keywords:** ${role.keywords.slice(0, 4).join(', ')}
// - Emphasize problem-solving approach and strategic methodology
// - **Include project outcomes ONLY if mentioned** in original
// - Focus on strategic thinking and client approach

// **WORD RANGE:** **20-35 words**
// **NO fabricated business impact figures**
// **Bold strategic methodologies** and frameworks used

// **Return ONLY the enhanced project description.**`;
//                         }
//                         break;

//                     case 'education':
//                         prompt = `**Enhance this education point** highlighting academic achievements and relevant foundation.

// **Original point:** "${content}"
// ${context ? `**Academic Context:** ${context}` : ''}

// **EDUCATION ENHANCEMENT:**
// - **Use achievement-focused verbs:** Completed, Achieved, Specialized, Graduated, Earned
// - Highlight relevant coursework, academic projects, or honors **ONLY if mentioned**
// - Include technical skills or methodologies learned **if applicable**
// - Mention leadership roles or academic contributions **if present in original**

// **WORD RANGE:** **15-30 words**
// **NO fabricated GPA or academic honors**
// **Bold degree type, institution,** or significant academic achievements

// **Return ONLY the enhanced education point.**`;
//                         break;

//                     case 'areasOfInterest':
//                         prompt = `**Transform this into 5 key professional interest domains** separated by pipe (|) symbols.

// **Original content:** "${content}"
// ${context ? `**Context:** ${context}` : ''}

// **AREAS OF INTEREST FORMAT:**
// - Create **5 broad professional domains** relevant to ${jobRole} career
// - Use format: **Domain 1 | Domain 2 | Domain 3 | Domain 4 | Domain 5**
// - **Bold key terms** within each domain
// - Focus on: emerging technologies, methodologies, industry trends, research areas, professional development
// - Ensure domains are **broad yet specific** to show professional curiosity
// - Connect to current industry developments and career growth

// **EXAMPLES:**
// - Software: **Machine Learning** & AI | **Cloud Architecture** & DevOps | **Web3** & Blockchain | **Mobile Development** | **Cybersecurity** & Privacy
// - Data Science: **Deep Learning** & Neural Networks | **Big Data** Analytics | **MLOps** & Production Systems | **Computer Vision** | **NLP** & Language Models
// - Consulting: **Digital Transformation** | **Business Strategy** & Analytics | **Process Optimization** | **Change Management** | **Emerging Technologies**

// **Return ONLY the 5 domains separated by pipe symbols.**`;
//                         break;

//                     case 'positionOfResponsibility':
//                         prompt = `**Enhance this leadership position** showcasing management skills and organizational impact.

// **Original point:** "${content}"
// ${context ? `**Leadership Context:** ${context}` : ''}

// **LEADERSHIP ENHANCEMENT:**
// - **Use leadership verbs:** Led, Managed, Coordinated, Facilitated, Mentored, Organized
// - Highlight scope of responsibility or initiatives managed **if mentioned**
// - Include team impact or organizational contributions **ONLY if present** in original
// - Show leadership approach and people development skills
// - Emphasize collaboration and results delivery

// **WORD RANGE:** **20-35 words**
// **NO fabricated team sizes or performance metrics**
// **Bold leadership role** and key responsibilities

// **Return ONLY the enhanced leadership statement.**`;
//                         break;
//                 }
                switch (section) {
    case 'experience':
        if (jobRole === 'software') {
            prompt = `**Enhance this software/IT experience point** for maximum technical impact and professional presentation.

**Original point:** "${content}"
${context ? `**Context/Role:** ${context}` : ''}
${jobDescription ? `**Target Position:** ${jobDescription}` : ''}

**TECHNICAL ENHANCEMENT REQUIREMENTS:**
- **Lead with powerful action verbs:** ${role.actionVerbs.slice(0, 8).join(', ')}
- **Incorporate relevant technical keywords:** ${role.keywords.slice(0, 6).join(', ')}
- **Highlight applicable technologies:** ${role.skills.slice(0, 8).join(', ')} (only if relevant to the original content)
- Follow **Action + Technology + Implementation + Impact** structure
- Emphasize technical problem-solving and solutions implemented
- **Include specific outcomes ONLY if mentioned** in original content or context
- Focus on technical contributions and their significance

**CHARACTER LENGTH GUIDELINES:**
- **Target: 87–95 characters** for concise bullet OR **180–190 characters** for detailed point
- Fully utilize character space for impactful, clear, and professional results
- Prioritize meaningful enhancement over strict limits

**QUALITY STANDARDS:**
- **Professional and impactful language**
- **NO fabricated numbers or metrics** unless present in original
- **Maintain complete truthfulness** to original meaning
- ATS-friendly technical terminology
- **Bold key technical terms** and achievements naturally

**Return ONLY the enhanced technical point - no explanations or character counts.**`;

        } else if (jobRole === 'datascience') {
            prompt = `**Enhance this data science experience point** emphasizing analytical expertise and measurable impact.

**Original point:** "${content}"
${context ? `**Context/Role:** ${context}` : ''}
${jobDescription ? `**Target Position:** ${jobDescription}` : ''}

**DATA SCIENCE ENHANCEMENT REQUIREMENTS:**
- **Use analytical action verbs:** ${role.actionVerbs.slice(0, 8).join(', ')}
- **Include relevant ML/analytics keywords:** ${role.keywords.slice(0, 6).join(', ')}
- **Highlight applicable data science tools:** ${role.skills.slice(0, 8).join(', ')} (only if relevant)
- Follow **Action + Data/Model + Methodology + Impact** structure
- Emphasize analytical approach and insights delivered
- **Include metrics ONLY if mentioned** in original content
- Focus on data-driven problem solving and methodology

**CHARACTER LENGTH GUIDELINES:**
- **Target: 87–95 characters** for concise point OR **180–190 characters** for detailed point
- Fully utilize character count for analytical impact

**QUALITY STANDARDS:**
- **NO fabricated accuracy percentages or performance metrics**
- Emphasize analytical methodology and approach
- **Bold key data science terms** and methodologies
- Professional analytical language

**Return ONLY the enhanced data science point.**`;

        } else {
            prompt = `**Enhance this consulting experience point** showcasing strategic thinking and client value delivery.

**Original point:** "${content}"
${context ? `**Context/Role:** ${context}` : ''}
${jobDescription ? `**Target Position:** ${jobDescription}` : ''}

**CONSULTING ENHANCEMENT REQUIREMENTS:**
- **Use strategic action verbs:** ${role.actionVerbs.slice(0, 8).join(', ')}
- **Include business impact keywords:** ${role.keywords.slice(0, 6).join(', ')}
- **Highlight relevant consulting skills:** ${role.skills.slice(0, 6).join(', ')} (only if applicable)
- Follow **Action + Client/Business + Methodology + Value** structure
- Emphasize strategic solutions and problem-solving approach
- **Include business outcomes ONLY if mentioned** in original
- Focus on client value and strategic contributions

**CHARACTER LENGTH GUIDELINES:**
- **Target: 87–95 characters** for concise version OR **180–190 characters** for expanded version
- Fully utilize characters for maximum clarity and strategic impact

**QUALITY STANDARDS:**
- **NO fabricated cost savings or revenue figures**
- Professional business language with strategic focus
- **Bold key strategic terms** and methodologies

**Return ONLY the enhanced consulting point.**`;
        }
        break;

    case 'projects':
        if (jobRole === 'software') {
            prompt = `**Enhance this software project description** highlighting technical implementation and outcomes.

**Original point:** "${content}"
${context ? `**Project Context:** ${context}` : ''}
${jobDescription ? `**Target Role:** ${jobDescription}` : ''}

**PROJECT ENHANCEMENT FOCUS:**
- **Start with technical action verbs:** ${role.actionVerbs.slice(0, 6).join(', ')}
- **Showcase relevant technology stack:** ${role.skills.slice(0, 8).join(', ')} (only if applicable to project)
- **Highlight technical keywords:** ${role.keywords.slice(0, 4).join(', ')}
- Emphasize technical challenges addressed and solutions implemented
- **Include project outcomes ONLY if mentioned** in original content
- Focus on technical implementation and learning

**CHARACTER LENGTH GUIDELINES:**
- **Target: 87–95 characters** or **180–190 characters**
- Fully utilize space for rich technical expression
- **NO fabricated user numbers or performance metrics**
- **Bold technical technologies** and key implementations

**Return ONLY the enhanced project description.**`;

        } else if (jobRole === 'datascience') {
            prompt = `**Enhance this data science project** showcasing analytical methodology and insights.

**Original point:** "${content}"
${context ? `**Project Context:** ${context}` : ''}
${jobDescription ? `**Target Role:** ${jobDescription}` : ''}

**PROJECT ENHANCEMENT FOCUS:**
- **Use analytical action verbs:** ${role.actionVerbs.slice(0, 6).join(', ')}
- **Highlight relevant DS tools:** ${role.skills.slice(0, 8).join(', ')} (only if used in project)
- **Include analytical keywords:** ${role.keywords.slice(0, 4).join(', ')}
- Emphasize data sources, methodology, and analytical approach
- **Include project insights ONLY if mentioned** in original
- Focus on analytical workflow and learning outcomes

**CHARACTER LENGTH GUIDELINES:**
- **Target: 87–95 characters** or **180–190 characters**
- Fully utilize space for detailed insight without fabrication
- **Bold key analytical methods** and tools used

**Return ONLY the enhanced project description.**`;

        } else {
            prompt = `**Enhance this consulting project** emphasizing strategic approach and value delivered.

**Original point:** "${content}"
${context ? `**Project Context:** ${context}` : ''}
${jobDescription ? `**Target Role:** ${jobDescription}` : ''}

**PROJECT ENHANCEMENT FOCUS:**
- **Lead with strategic action verbs:** ${role.actionVerbs.slice(0, 6).join(', ')}
- **Highlight relevant frameworks:** ${role.skills.slice(0, 6).join(', ')} (only if applicable)
- **Include business keywords:** ${role.keywords.slice(0, 4).join(', ')}
- Emphasize problem-solving approach and strategic methodology
- **Include project outcomes ONLY if mentioned** in original
- Focus on strategic thinking and client approach

**CHARACTER LENGTH GUIDELINES:**
- **Target: 87–95 characters** or **180–190 characters**
- Fully utilize space for impactful, strategic content
- **NO fabricated business impact figures**
- **Bold strategic methodologies** and frameworks used

**Return ONLY the enhanced project description.**`;
        }
        break;

    case 'education':
        prompt = `**Enhance this education point** highlighting academic achievements and relevant foundation.

**Original point:** "${content}"
${context ? `**Academic Context:** ${context}` : ''}

**EDUCATION ENHANCEMENT:**
- **Use achievement-focused verbs:** Completed, Achieved, Specialized, Graduated, Earned
- Highlight relevant coursework, academic projects, or honors **ONLY if mentioned**
- Include technical skills or methodologies learned **if applicable**
- Mention leadership roles or academic contributions **if present in original**

**CHARACTER LENGTH GUIDELINES:**
- **Target: 87–95 characters** or **180–190 characters**
- No GPA, awards, or ranks should be fabricated
- **Bold degree, institution, or honors** only if present

**Return ONLY the enhanced education point.**`;
        break;

    case 'areasOfInterest':
        prompt = `**Transform this into 5 key professional interest domains** separated by pipe (|) symbols.

**Original content:** "${content}"
${context ? `**Context:** ${context}` : ''}

**AREAS OF INTEREST FORMAT:**
- Create **5 broad professional domains** relevant to ${jobRole} career
- Use format: **Domain 1 | Domain 2 | Domain 3 | Domain 4 | Domain 5**
- **Bold key terms** within each domain
- Focus on: emerging technologies, methodologies, industry trends, research areas, professional development
- Ensure domains are **broad yet specific** to show professional curiosity
- Connect to current industry developments and career growth

**Return ONLY the 5 domains separated by pipe symbols.**`;
        break;

    case 'positionOfResponsibility':
        prompt = `**Enhance this leadership position** showcasing management skills and organizational impact.

**Original point:** "${content}"
${context ? `**Leadership Context:** ${context}` : ''}

**LEADERSHIP ENHANCEMENT:**
- **Use leadership verbs:** Led, Managed, Coordinated, Facilitated, Mentored, Organized
- Highlight scope of responsibility or initiatives managed **if mentioned**
- Include team impact or organizational contributions **ONLY if present** in original
- Show leadership approach and people development skills
- Emphasize collaboration and results delivery

**CHARACTER LENGTH GUIDELINES:**
- **Target: 87–95 characters** or **180–190 characters**
- No fake team sizes, budgets, or results
- **Bold leadership roles** and responsibilities

**Return ONLY the enhanced leadership statement.**`;
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

// Generate Areas of Interest endpoint
router.post('/generate-interests', 
    checkAIService,
    [
        body('resumeData').isObject().withMessage('resumeData must be an object'),
        body('jobRole').optional().isString().isIn(['software', 'datascience', 'consulting']).default('software')
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

            const { resumeData, jobRole = 'software' } = req.body;

            // Create a summary of the resume for context
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

            const prompt = `Based on the following resume information, generate appropriate "Areas of Interest" for a ${jobRole} professional.

Resume Summary:
Experience: ${JSON.stringify(resumeSummary.experience, null, 2)}
Projects: ${JSON.stringify(resumeSummary.projects, null, 2)}
Education: ${JSON.stringify(resumeSummary.education, null, 2)}

REQUIREMENTS:
- Generate 4-6 relevant areas of interest based on the resume content
- Focus on current industry trends and emerging technologies relevant to ${jobRole}
- Make interests specific and professional (not generic)
- Connect interests to career growth and industry evolution
- Format as a single line separated by | (pipe) character
- Keep each interest concise (2-4 words)

EXAMPLES for ${jobRole}:
${jobRole === 'software' ? 'Cloud Architecture | Machine Learning | DevOps Automation | Microservices | Blockchain Technology | Edge Computing' : 
  jobRole === 'datascience' ? 'Deep Learning | MLOps | Computer Vision | Natural Language Processing | Big Data Analytics | AI Ethics' :
  'Digital Transformation | Strategic Analytics | Process Automation | Innovation Management | Sustainable Business | Market Intelligence'}

Return ONLY the pipe-separated areas of interest string, no additional text or formatting.`;

            const generatedInterests = await aiService.generateContent(prompt);
            const cleanedInterests = generatedInterests.trim().replace(/^["""']|["""']$/g, '');

            res.json({
                success: true,
                areasOfInterest: cleanedInterests,
                jobRole,
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