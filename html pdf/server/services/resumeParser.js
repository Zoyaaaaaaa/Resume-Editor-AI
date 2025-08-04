

//improved parsing
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const AIService = require('./aiService');

class ResumeParser {
    constructor() {
        this.aiService = new AIService();
        // Define common word patterns and technology terms that shouldn't be split
        this.preserveWords = new Set([
            'JavaScript', 'TypeScript', 'PowerBI', 'PowerPoint', 'GitHub', 'GitLab',
            'TensorFlow', 'PyTorch', 'OpenCV', 'MongoDB', 'PostgreSQL', 'MySQL',
            'ReactJS', 'NodeJS', 'AngularJS', 'VueJS', 'NextJS', 'ExpressJS',
            'RESTful', 'GraphQL', 'WebSocket', 'WebSockets', 'jQuery', 'Bootstrap',
            'Tailwind', 'Firebase', 'Supabase', 'Vercel', 'Netlify', 'Heroku',
            'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Jenkins', 'Redis',
            'Elasticsearch', 'RabbitMQ', 'Kafka', 'Nginx', 'Apache', 'Linux',
            'MacOS', 'Windows', 'Ubuntu', 'CentOS', 'Debian', 'Fedora',
            'IntelliJ', 'VSCode', 'PyCharm', 'WebStorm', 'Sublime', 'Atom',
            'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'InVision', 'Zeplin',
            'Jira', 'Confluence', 'Trello', 'Asana', 'Slack', 'Discord', 'Teams',
            'Salesforce', 'HubSpot', 'Mailchimp', 'SendGrid', 'Twilio', 'Stripe',
            'PayPal', 'Razorpay', 'Paytm', 'PhonePe', 'GooglePay', 'ApplePay',
            'iPhone', 'iPad', 'Android', 'iOS', 'macOS', 'watchOS', 'tvOS',
            'Flutter', 'ReactNative', 'Xamarin', 'Ionic', 'Cordova', 'PhoneGap',
            'Unity', 'Unreal', 'Godot', 'Blender', 'Maya', 'Cinema4D', '3dsMax',
            'AfterEffects', 'PremierePro', 'FinalCut', 'DaVinci', 'Audacity',
            'LogicPro', 'ProTools', 'Ableton', 'Cubase', 'Reaper', 'GarageBand'
        ]);
    }

    async parseResume(filePath, mimeType) {
        try {
            let extractedText = '';

            // Extract text based on file type
            switch (mimeType) {
                case 'application/pdf':
                    extractedText = await this.parsePDF(filePath);
                    break;
                case 'application/msword':
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    extractedText = await this.parseWord(filePath);
                    break;
                default:
                    throw new Error('Unsupported file type');
            }

            if (!extractedText || extractedText.trim().length < 50) {
                throw new Error('Could not extract sufficient text from the document');
            }

            // Use AI to structure the extracted text
            const structuredData = await this.structureWithAI(extractedText);

            return structuredData;

        } catch (error) {
            console.error('Resume parsing error:', error);
            throw new Error(`Failed to parse resume: ${error.message}`);
        }
    }

    async parsePDF(filePath) {
        try {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdf(dataBuffer);
            return data.text;
        } catch (error) {
            throw new Error(`PDF parsing failed: ${error.message}`);
        }
    }

    async parseWord(filePath) {
        try {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } catch (error) {
            throw new Error(`Word document parsing failed: ${error.message}`);
        }
    }

    async structureWithAI(extractedText) {
        console.log('Extracted text length:', extractedText.length);
        console.log('First 200 characters:', extractedText.substring(0, 200));
        
        // Check if AI service is available
        if (!await this.aiService.isAvailable()) {
            throw new Error('AI service not available. Please configure GEMINI_API_KEY.');
        }

        // Try AI parsing with multiple attempts and different strategies
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                attempts++;
                console.log(`AI parsing attempt ${attempts}/${maxAttempts}`);
                
                const prompt = this.createStructuringPrompt(extractedText, attempts);
                const structuredData = await this.aiService.structureResumeData(prompt);

                console.log('AI structured data:', JSON.stringify(structuredData, null, 2));

                // Validate the structured data
                const validatedData = this.validateStructuredData(structuredData);
                
                // Check if we got meaningful data
                if (this.hasMeaningfulData(validatedData)) {
                    console.log('AI parsing successful on attempt', attempts);
                    return validatedData;
                }
                
                console.log(`Attempt ${attempts} returned insufficient data, retrying...`);
                
            } catch (error) {
                console.error(`AI parsing attempt ${attempts} failed:`, error.message);
                
                if (attempts === maxAttempts) {
                    throw new Error(`AI parsing failed after ${maxAttempts} attempts: ${error.message}`);
                }
                
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        throw new Error('AI parsing failed to extract meaningful data after all attempts');
    }

createStructuringPrompt(text, attempt = 1, role = 'software', jobDescription = '') {
    // Clean the text first to fix spacing issues
    const cleanedText = this.cleanExtractedText(text);

    // Role-specific data similar to generatePrompt
    const roleData = {
        software: {
            actionVerbs: ['Developed', 'Built', 'Implemented', 'Designed', 'Architected', 'Optimized', 'Deployed', 'Engineered', 'Created', 'Integrated'],
            keywords: ['scalable', 'performance', 'architecture', 'full-stack', 'microservices', 'API', 'database', 'cloud'],
            skills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL', 'Git', 'Jenkins']
        },
        datascience: {
            actionVerbs: ['Analyzed', 'Modeled', 'Predicted', 'Visualized', 'Extracted', 'Processed', 'Trained', 'Evaluated', 'Discovered', 'Researched'],
            keywords: ['machine learning', 'statistical analysis', 'data pipeline', 'predictive modeling', 'insights', 'algorithms'],
            skills: ['Python', 'R', 'TensorFlow', 'PyTorch', 'Pandas', 'Scikit-learn', 'SQL', 'Tableau', 'Jupyter', 'Apache Spark']
        },
        consulting: {
            actionVerbs: ['Advised', 'Strategized', 'Consulted', 'Facilitated', 'Delivered', 'Recommended', 'Analyzed', 'Optimized'],
            keywords: ['strategy', 'business transformation', 'stakeholder management', 'process improvement', 'client solutions'],
            skills: ['Strategic Planning', 'Business Analysis', 'Project Management', 'Stakeholder Management', 'Process Optimization', 'Change Management']
        }
    };

    const roleInfo = roleData[role] || roleData.software;
    const warning = attempt > 2 ? `ENHANCEMENT #${attempt}: Previous attempts may have quality issues. Focus on IMPACT framework and avoid repetition.\n\n` : '';

    const basePrompt = `${warning}
You are an expert resume parser with strict quality controls for ${role} roles. Analyze the following resume text and extract ALL information into structured JSON format.

**ROLE-SPECIFIC OPTIMIZATION FOR ${role.toUpperCase()}:**
- **Priority Action Verbs:** ${roleInfo.actionVerbs.slice(0, 8).join(', ')}
- **Key Technologies:** ${roleInfo.skills.slice(0, 8).join(', ')}
- **Industry Keywords:** ${roleInfo.keywords.slice(0, 6).join(', ')}
${jobDescription ? `**Target Role:** ${jobDescription}` : ''}

**QUALITY CONTROL CHECKLIST:**
✓ Fix spacing issues carefully - preserve technology names and proper nouns  
✓ Ensure proper word spacing without breaking compound words  
✓ Validate email format (no spaces): user@domain.com  
✓ Sort dates chronologically (most recent first)  
✓ Avoid orphan words - complete phrases only  
✓ No repeated content within same sections  
✓ Convert periods used as line breaks to proper formatting  
✓ CRITICAL FORMATTING: Keep "U.S." as "US", preserve numbers exactly "9.20" stays "9.20"   
✓ Replace "Indian Institute of Technology Bombay" with "IIT Bombay"  
✓ Character limits: Experience/Projects (105-110 chars per bullet), Education (one line), Achievements (max 120 chars)

**EDUCATION FORMAT STRICTLY ENFORCED:**
- Format in ONE LINE ONLY: "Degree | Field | Institution | Duration | Grade | Location"
- Example: "Bachelor of Engineering | Computer Engineering | IIT Bombay | 06/2021-Present | GPA: 9.20 | Mumbai, India"
- No bullet points, single line format mandatory

**ACHIEVEMENTS FORMAT:**
- Awards, recognitions, competitions, certifications, honors
- SINGLE LINE description only (no bullet points, max 120 characters)
- Focus on the recognition/award itself and its significance
- Use achievement-focused action verbs: Awarded, Recognized, Achieved, Won, Earned

**PUBLICATIONS FORMAT:**
- Research papers, journal articles, conference papers, patents
- Include all authors, highlight if first/corresponding author
- SINGLE LINE description focusing on research contribution (max 120 characters)
- Sort by publication date (most recent first)
- Use research-focused verbs: Published, Authored, Presented, Contributed

**POSITION OF RESPONSIBILITY FORMAT:**
- Leadership roles, committee positions, organizational responsibilities
- EXACTLY 2 bullet points using "• " prefix (105-110 characters each)
- Each bullet follows WHAT-HOW-EFFECT structure
- Use leadership verbs: Led, Managed, Coordinated, Facilitated, Mentored, Organized

**SKILLS CATEGORIZATION RULES:**
- Languages: Programming languages (JavaScript, Python, Java, C++), markup/query languages (HTML, CSS, SQL), scripting languages (PHP, TypeScript)
- Frameworks: Web frameworks (React, Angular, Vue), backend frameworks (Node.js, Django, Spring), CSS frameworks (Bootstrap, Tailwind)
- Developer Tools: Version control (Git), IDEs (VS Code, PyCharm, IntelliJ), deployment (Docker, AWS, Azure), databases (MongoDB, PostgreSQL), testing tools (Jest, Postman)

**CRITICAL IMPACT FRAMEWORK:**
For Experience, Projects, and Position of Responsibility descriptions:
- MANDATORY: Each bullet point follows WHAT-HOW-EFFECT structure (105-110 characters)
- WHAT: Action/work performed using role-specific action verbs
- HOW: Method/technology/approach used (prioritize role-relevant tech)
- EFFECT: Result/impact/learning achieved (quantify when possible)
- NO numbering (1, 2, 3) or "Here are" preambles
- Bold key technologies and methodologies
- Professional, ATS-friendly language

Resume Text:
${cleanedText}

**EXACT JSON STRUCTURE REQUIRED:**
{
    "personalInfo": {
        "fullName": "full name from resume",
        "email": "email@domain.com (validate format - no spaces)",
        "phone": "phone number", 
        "location": "current location (convert U.S. to US, preserve number formatting)"
    },
    "areasOfInterest": "comma-separated professional interests (if missing, infer 3-4 from resume content based on ${role} focus)",
    "skillsData": {
        "languages": "programming languages and markup/query languages like JavaScript, Python, Java, C++, SQL, HTML/CSS, PHP, TypeScript, Go, Rust (comma-separated)",
        "frameworks": "frameworks, libraries, and platforms like React, Node.js, Django, Flask, Spring, Bootstrap, Angular, Vue, Express, Rails (comma-separated)", 
        "developerTools": "development tools, IDEs, and platforms like Git, Docker, VS Code, PyCharm, IntelliJ, Postman, AWS, Azure, Jenkins, Kubernetes (comma-separated)"
    },
    "experience": [
        {
            "position": "job title",
            "company": "company name",
            "location": "work location", 
            "dates": "employment period (sorted chronologically)",
            "description": "• WHAT action + HOW method + EFFECT result (105-110 chars)\\n• WHAT action + HOW method + EFFECT result (105-110 chars)\\n• WHAT action + HOW method + EFFECT result (105-110 chars)"
        }
    ],
    "achievements": [
        {
            "title": "achievement/award title",
            "organization": "awarding organization",
            "date": "achievement date (sorted chronologically)", 
            "description": "SINGLE-LINE description highlighting the recognition and its significance (no bullet points, max 120 characters)"
        }
    ],
    "publications": [
        {
            "title": "publication title",
            "authors": "author names (highlight if first author or corresponding author)",
            "journal": "journal/conference name",
            "date": "publication date (sorted chronologically)",
            "doi": "DOI or link if available",
            "description": "Brief description of research contribution or impact (max 120 characters, single line)"
        }
    ],
    "projects": [
        {
            "title": "project name",
            "organization": "organization or course",
            "duration": "project timeline (sorted chronologically)",
            "technologies": "technologies/tools used",
            "description": "• WHAT developed + HOW technology + EFFECT outcome (105-110 chars)\\n• WHAT implemented + HOW approach + EFFECT learning (105-110 chars)\\n• WHAT achieved + HOW method + EFFECT result (105-110 chars)"
        }
    ],
    "education": [
        {
            "degree": "Bachelor of Engineering",
            "field": "Computer Engineering", 
            "institution": "D. Y. Patil Institute of Engineering, Pune",
            "duration": "06/2021-Present",
            "grade": "GPA: 9",
            "location": "Raisamand, Rajasthan"
        }
    ],
    "positionOfResponsibility": [
        {
            "position": "leadership position/role name",
            "organization": "organization name",
            "institution": "institution name", 
            "dates": "time period (sorted chronologically)",
            "description": "• WHAT led/managed + HOW approach/method + EFFECT impact/outcome (105-110 chars)\\n• WHAT coordinated/organized + HOW strategy/technique + EFFECT result/learning (105-110 chars)"
        }
    ]
}`;

    if (attempt === 1) {
        return basePrompt + `

**FIRST ATTEMPT REQUIREMENTS:**
- Apply ALL quality controls from checklist with ${role}-specific focus
- CRITICAL: Properly categorize ALL skills using SKILLS CATEGORIZATION RULES above
- Extract skills from experience, projects, and explicit skills sections
- Implement IMPACT framework (WHAT-HOW-EFFECT) for Experience/Projects/Position of Responsibility bullet points ONLY  
- Format Experience/Projects as exactly 3 bullet points using "• " prefix (105-110 chars each)
- Format Position of Responsibility as exactly 2 bullet points using "• " prefix (105-110 chars each)
- Education: STRICTLY ONE LINE format (see EDUCATION FORMAT above)  
- Achievements: SINGLE LINE with recognition/award focus (NO bullet points, max 120 chars)
- Publications: SINGLE LINE with research contribution focus (NO bullet points), include all authors  
- Sort all dates chronologically (most recent first)  
- Validate email format strictly  
- Convert "U.S." to "US", preserve number formats exactly (9.20 stays 9.20)  
- Preserve technical terms exactly as written  
- Fix spacing issues without breaking compound words  
- Return ONLY valid JSON, no markdown or explanations  
- Ensure no content repetition within sections  
- Include publications section only if publications are found in resume
- Prioritize ${role}-relevant technologies and action verbs`;
    }

    if (attempt === 2) {
        return basePrompt + `

**RETRY INSTRUCTIONS (Attempt ${attempt}):**
- Previous attempt failed quality controls  
- MANDATORY: Apply IMPACT framework to Experience/Projects/Position of Responsibility bullet points  
- Character limits STRICTLY enforced: 105-110 per bullet point
- Achievements are awards/recognitions - NO bullet points, single line only (max 120 chars)
- Publications are research papers - NO bullet points, single line with research focus  
- Position of Responsibility gets EXACTLY 2 bullet points with WHAT-HOW-EFFECT (105-110 chars each)
- Double-check date sorting (chronological order)  
- Verify email format has no spaces  
- Ensure no repeated sentences in same sections  
- Fix any orphan words or incomplete phrases  
- Experience/Projects: 3 bullets, Position of Responsibility: 2 bullets, Achievements/Publications: single line  
- Education must be in ONE LINE format exactly  
- Include publications only if found in resume  
- Use ${role}-specific action verbs and technologies
- Return ONLY valid JSON format`;
    }

    return basePrompt + `

**FINAL ATTEMPT (${attempt}):**
- Extract available information even if incomplete  
- CRITICAL: Apply IMPACT framework to Experience/Projects/Position of Responsibility only  
- Character limits: 105-110 per bullet, max 120 for achievements/publications
- Achievements are single-line recognitions/awards (no bullets)  
- Publications are single-line research contributions (no bullets)  
- Position of Responsibility gets exactly 2 detailed bullet points (105-110 chars each)
- Ensure proper date sorting and email validation  
- Fix all spacing and formatting issues  
- Eliminate any content repetition  
- Use "IIT Bombay" format consistently  
- Preserve technical terms and proper nouns  
- Enforce correct formatting: Experience/Projects (3 bullets), Position of Responsibility (2 bullets), Achievements/Publications (single line)  
- Include publications section only if publications exist in resume  
- Prioritize ${role}-relevant content and terminology
- Return valid JSON with available information  
- Apply quality controls to maximum extent possible`;
}

    hasMeaningfulData(data) {
        // Check if the parsed data contains meaningful information
        if (!data) return false;
        
        // Check if we have at least personal info
        const hasPersonalInfo = data.personalInfo && (
            data.personalInfo.fullName || 
            data.personalInfo.email || 
            data.personalInfo.phone
        );
        
        // Check if we have at least one substantial section
        const hasExperience = data.experience && data.experience.length > 0 && 
            data.experience.some(exp => exp.position || exp.company || exp.description);
            
        const hasProjects = data.projects && data.projects.length > 0 && 
            data.projects.some(proj => proj.title || proj.description);
            
        const hasEducation = data.education && data.education.length > 0 && 
            data.education.some(edu => edu.degree || edu.institution);
            
        const hasPositionOfResponsibility = data.positionOfResponsibility && data.positionOfResponsibility.length > 0 && 
            data.positionOfResponsibility.some(pos => pos.position || pos.description);
            
        const hasAreasOfInterest = data.areasOfInterest && data.areasOfInterest.trim().length > 0;
        
        // Consider data meaningful if we have personal info AND at least one other section
        // return hasPersonalInfo && (hasExperience || hasProjects || hasEducation || hasPositionOfResponsibility || hasAreasOfInterest);
        return true;
    }

    validateStructuredData(data) {
        // Ensure the data has the correct structure
        const defaultStructure = {
            personalInfo: {
                fullName: '',
                email: '',
                phone: '',
                location: ''
            },
            areasOfInterest: '',
            skillsData: {
                languages: '',
                frameworks: '',
                developerTools: ''
            },
            skills: '',
            experience: [],
            achievements: [],
            projects: [],
            education: [],
            positionOfResponsibility: [],
            publications: [],
        };

        // Merge with defaults to ensure all fields exist
        const result = { ...defaultStructure };
        
        if (data && typeof data === 'object') {
            // Handle personal info
            if (data.personalInfo && typeof data.personalInfo === 'object') {
                result.personalInfo = { ...defaultStructure.personalInfo };
                Object.keys(data.personalInfo).forEach(key => {
                    if (data.personalInfo[key] !== null && data.personalInfo[key] !== undefined) {
                        result.personalInfo[key] = data.personalInfo[key];
                    }
                });
            }
            
            // Handle areas of interest and skills (convert null to empty string)
            result.areasOfInterest = data.areasOfInterest || '';
            
            // Handle structured skills data
            if (data.skillsData && typeof data.skillsData === 'object') {
                result.skillsData = {
                    languages: data.skillsData.languages || '',
                    frameworks: data.skillsData.frameworks || '',
                    developerTools: data.skillsData.developerTools || ''
                };
                
                // Create backward compatible skills string
                const allSkills = [];
                if (result.skillsData.languages) allSkills.push(result.skillsData.languages);
                if (result.skillsData.frameworks) allSkills.push(result.skillsData.frameworks);
                if (result.skillsData.developerTools) allSkills.push(result.skillsData.developerTools);
                result.skills = allSkills.join(', ');
            } else {
                result.skills = data.skills || '';
            }
            // Handle arrays - filter out entries with null/undefined values
            result.experience = Array.isArray(data.experience) ? 
                data.experience.filter(item => item && typeof item === 'object') : [];
            result.achievements = Array.isArray(data.achievements) ? 
                data.achievements.filter(item => item && typeof item === 'object') : [];
            result.projects = Array.isArray(data.projects) ? 
                data.projects.filter(item => item && typeof item === 'object') : [];
            result.education = Array.isArray(data.education) ? 
                data.education.filter(item => item && typeof item === 'object') : [];
            result.positionOfResponsibility = Array.isArray(data.positionOfResponsibility) ? 
                data.positionOfResponsibility.filter(item => item && typeof item === 'object') : [];
            result.publications = Array.isArray(data.publications) ? 
                data.publications.filter(item => item && typeof item === 'object') : [];
            
                
            // Clean up null values and fix text in array items
            result.experience = result.experience.map(item => this.processEntryWithBulletPoints(this.cleanAndFixText(this.cleanNullValues(item))));
            result.achievements = result.achievements.map(item => this.processEntryWithBulletPoints(this.cleanAndFixText(this.cleanNullValues(item))));
            result.projects = result.projects.map(item => this.processEntryWithBulletPoints(this.cleanAndFixText(this.cleanNullValues(item))));
            result.education = result.education.map(item => this.processEntryWithBulletPoints(this.cleanAndFixText(this.cleanNullValues(item))));
            result.publications = result.publications.map(item => this.processEntryWithBulletPoints(this.cleanAndFixText(this.cleanNullValues(item))));
            result.positionOfResponsibility = result.positionOfResponsibility.map(item => this.processEntryWithBulletPoints(this.cleanAndFixText(this.cleanNullValues(item))));
        }

        console.log('Validated structured data:', JSON.stringify(result, null, 2));
        return result;
    }
    
    cleanNullValues(obj) {
        const cleaned = {};
        Object.keys(obj).forEach(key => {
            cleaned[key] = obj[key] === null || obj[key] === undefined ? '' : obj[key];
        });
        return cleaned;
    }
    
    cleanAndFixText(obj) {
        const cleaned = {};
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                cleaned[key] = this.fixTextSpacing(obj[key]);
            } else {
                cleaned[key] = obj[key];
            }
        });
        return cleaned;
    }
    
    extractBulletPointsFromDescription(description) {
        if (!description) return [];
        
        const bullets = [];
        
        // Define action verbs at function scope
        const actionVerbs = ['Developed', 'Created', 'Implemented', 'Designed', 'Led', 
                           'Built', 'Managed', 'Achieved', 'Improved', 'Increased'];
        
        // Enhanced bullet detection with number preservation
        const lines = description.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        // First check for explicit bullet points
        const bulletMarkers = ['•', '*', '-', '+', '‣', '→'];
        const numberedMarkers = /^\d+[\.\)]\s+/;
        
        for (const line of lines) {
            // Check for bullet markers
            if (bulletMarkers.some(marker => line.startsWith(marker))) {
                const cleaned = line.substring(1).trim();
                if (cleaned.length > 5) {
                    bullets.push(cleaned);
                }
                continue;
            }
            
            // Check for numbered lists
            if (numberedMarkers.test(line)) {
                const cleaned = line.replace(numberedMarkers, '').trim();
                if (cleaned.length > 5) {
                    bullets.push(cleaned);
                }
                continue;
            }
            
            // Check for action verbs at start of line
            if (actionVerbs.some(verb => line.startsWith(verb))) {
                bullets.push(line);
                continue;
            }
        }
        
        // If we found bullets with markers, return them
        if (bullets.length > 0) {
            return bullets;
        }
        
        // Fallback: Split by sentences that contain action verbs
        const sentences = description.split(/(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 10);
            
        if (sentences.length > 1) {
            const actionPhrases = ['using', 'with', 'by', 'resulting in', 'leading to'];
            
            for (const sentence of sentences) {
                const hasActionVerb = actionVerbs.some(verb => 
                    sentence.startsWith(verb) || 
                    sentence.includes(` ${verb.toLowerCase()} `)
                );
                
                const hasActionPhrase = actionPhrases.some(phrase => 
                    sentence.toLowerCase().includes(phrase)
                );
                
                if (hasActionVerb || hasActionPhrase) {
                    bullets.push(sentence);
                }
            }
            
            if (bullets.length > 0) {
                return bullets;
            }
        }
        
        // Final fallback: Split by line breaks
        if (lines.length > 1) {
            return lines.filter(line => line.length > 10);
        }
        
        // If all else fails, return the entire description as one bullet
        return [description.trim()];
    }

    processEntryWithBulletPoints(entry) {
        // Ensure bulletPoints is an array
        if (!entry.bulletPoints) {
            entry.bulletPoints = [];
        }
        
        // Enhanced bullet point extraction with number preservation
        if (entry.description && entry.description.trim()) {
            const extractedBullets = this.extractBulletPointsFromDescription(entry.description);
            if (extractedBullets.length > 0) {
                entry.bulletPoints = [...entry.bulletPoints, ...extractedBullets];
            } else {
                // If no bullets extracted, treat entire description as one bullet point
                entry.bulletPoints.push(entry.description.trim());
            }
            entry.description = '';
        }
        
        // Enhanced education details handling
        if (entry.details && entry.details.trim()) {
            const extractedBullets = this.extractBulletPointsFromDescription(entry.details);
            if (extractedBullets.length > 0) {
                entry.bulletPoints = [...entry.bulletPoints, ...extractedBullets];
            } else {
                entry.bulletPoints.push(entry.details.trim());
            }
            entry.details = '';
        }
        
        // Enhanced bullet point cleaning with number preservation
        if (Array.isArray(entry.bulletPoints)) {
            entry.bulletPoints = entry.bulletPoints
                .filter(point => point && typeof point === 'string' && point.trim())
                .map(point => {
                    // Preserve numbers like 9.20 exactly
                    return point.replace(/^[•\-\*]\s*/, '').trim()
                        .replace(/(\d+\.\d+)/g, match => {
                            // If the number is followed by a space or punctuation, preserve it
                            return match;
                        });
                })
                .filter((point, index, arr) => {
                    // Remove duplicates while preserving case for numbers
                    const lowerPoint = point.toLowerCase();
                    return arr.findIndex(p => p.toLowerCase() === lowerPoint) === index;
                })
                .filter(point => point.length > 3);
        }
        
        // Enhanced education formatting
        if (entry.education) {
            entry.education = entry.education.map(edu => {
                if (edu.institution && edu.location) {
                    // Format: "University Name, State/Country | GPA: X.XX"
                    const locationParts = edu.location.split(',');
                    const shortLocation = locationParts.length > 1 
                        ? `${locationParts[0].trim()}, ${locationParts[1].trim()}`
                        : edu.location;
                    
                    let gradeInfo = '';
                    if (edu.grade) {
                        // Preserve exact grade format (9.20 stays 9.20)
                        gradeInfo = edu.grade.includes('GPA') 
                            ? edu.grade 
                            : `GPA: ${edu.grade}`;
                    }
                    
                    edu.formatted = `${edu.institution}, ${shortLocation}${gradeInfo ? ` | ${gradeInfo}` : ''}`;
                }
                return edu;
            });
        }
        
        return entry;
    }
    
    fixTextSpacing(text) {
        if (!text) return '';
        
        // Store original text for comparison
        let result = text;
        
        // Step 1: Handle specific known problematic patterns first
        const specificFixes = {
            'dailyWBRand': 'daily WBR and',
            'usingSQL,Python,': 'using SQL, Python,',
            'andMetabase': 'and Metabase',
            'maintainedJupyter': 'maintained Jupyter',
            'notebooksfor': 'notebooks for',
            'usingPython': 'using Python',
            'partnerslikeXpressBees,Delhivery,': 'partners like XpressBees, Delhivery,',
            'andEcom Express': 'and Ecom Express',
            'usingMySQL,QlikSense,': 'using MySQL, QlikSense,',
            'andAdvanced Excel': 'and Advanced Excel',
            'viaGoogle Sheets': 'via Google Sheets',
            'usingSqueezeNet': 'using SqueezeNet',
            'CNNfor': 'CNN for',
            'LeveragedTensorFlow,Keras,': 'Leveraged TensorFlow, Keras,',
            'andOpenCVfor': 'and OpenCV for',
            'DL ,': 'DL,',
            'aPower BI': 'a Power BI',
            'implementingautomated': 'implementing automated',
            'data scrapingfrom': 'data scraping from',
            'usingPandasandPower': 'using Pandas and Power',
            'Querywith': 'Query with',
            'RESTfule-commerce': 'RESTful e-commerce',
            'backendusingDjango': 'backend using Django',
            'IntegratedJWT': 'Integrated JWT',
            'authandpayment': 'auth and payment',
            'areal-time': 'a real-time',
            'applicationusingDjango': 'application using Django',
            'ChannelsandWebSocketsto': 'Channels and WebSockets to',
            'Implementedasynchronous': 'Implemented asynchronous',
            'handlinganduser': 'handling and user',
            'withJavaScript': 'with JavaScript'
        };
        
        // Apply specific fixes
        Object.entries(specificFixes).forEach(([wrong, correct]) => {
            result = result.replace(new RegExp(wrong, 'g'), correct);
        });
        
        // Step 2: Preserve known compound words and technology terms
        const preserveMap = new Map();
        let preserveCounter = 0;
        
        // Create temporary placeholders for words we want to preserve
        this.preserveWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = result.match(regex);
            if (matches) {
                matches.forEach(match => {
                    const placeholder = `__PRESERVE_${preserveCounter++}__`;
                    preserveMap.set(placeholder, match);
                    result = result.replace(match, placeholder);
                });
            }
        });
        
        // Step 3: Apply general spacing fixes carefully
        result = result
            // Fix concatenated words but be careful not to break preserved terms
            .replace(/([a-z])([A-Z])/g, (match, p1, p2) => {
                // Don't split if this looks like a preserved compound word
                const fullMatch = match;
                if (this.preserveWords.has(fullMatch)) {
                    return match;
                }
                return `${p1} ${p2}`;
            })
            // Add space between letters and numbers
            .replace(/([a-zA-Z])(\d)/g, '$1 $2')
            .replace(/(\d)([a-zA-Z])/g, '$1 $2')
            // Fix common concatenations with small words
            .replace(/([a-z])(and|or|the|of|in|at|to|for|with|from|by|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|must)([A-Z])/g, '$1 $2 $3')
            .replace(/(and|or|the|of|in|at|to|for|with|from|by|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|must)([A-Z][a-z])/g, '$1 $2')
            // Clean up multiple spaces
            .replace(/\s+/g, ' ')
            .trim();
        
        // Step 4: Restore preserved words
        preserveMap.forEach((original, placeholder) => {
            result = result.replace(placeholder, original);
        });
        
        // Step 5: Final cleanup
        result = result
            .replace(/\s+/g, ' ')
            .replace(/\s*,\s*/g, ', ')
            // Fix period spacing but preserve decimal numbers
            .replace(/(\d)\s*\.\s*(\d)/g, '$1.$2') // Fix decimal numbers first
            .replace(/([a-zA-Z])\s*\.\s*/g, '$1. ') // Then fix sentence periods
            .replace(/\s*;\s*/g, '; ')
            .replace(/\s*:\s*/g, ': ')
            .trim();
        
        return result;
    }

    cleanExtractedText(text) {
        if (!text) return '';
        
        // First pass: Fix obvious spacing issues from PDF extraction
        let cleaned = text
            // Remove excessive whitespace and normalize line breaks
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            // Fix common PDF extraction artifacts
            .replace(/([a-z])([A-Z])/g, (match, p1, p2, offset, string) => {
                // Check if this might be a legitimate compound word
                const before = string.substring(Math.max(0, offset - 10), offset);
                const after = string.substring(offset + 2, Math.min(string.length, offset + 12));
                const context = before + match + after;
                
                // Don't split if it looks like a technology term or proper noun
                for (let word of this.preserveWords) {
                    if (context.toLowerCase().includes(word.toLowerCase())) {
                        return match;
                    }
                }
                
                // Don't split if preceded by punctuation (likely start of sentence)
                if (/[.!?:]\s*$/.test(before)) {
                    return match;
                }
                
                return `${p1} ${p2}`;
            })
            // Fix number-letter combinations carefully
            .replace(/(\d)([A-Za-z])/g, (match, p1, p2, offset, string) => {
                // Don't split version numbers, model numbers, etc.
                const before = string.charAt(offset - 1);
                if (before === '.' || before === 'v' || before === 'V') {
                    return match;
                }
                return `${p1} ${p2}`;
            })
            .replace(/([A-Za-z])(\d)/g, (match, p1, p2, offset, string) => {
                // Don't split things like "CSS3", "HTML5", etc.
                const context = string.substring(Math.max(0, offset - 5), offset + 3);
                if (/CSS\d|HTML\d|JS\d|SQL\d/.test(context)) {
                    return match;
                }
                return `${p1} ${p2}`;
            })
            .trim();
        
        // Second pass: Apply the enhanced fixTextSpacing method
        return this.fixTextSpacing(cleaned);
    }
}

module.exports = ResumeParser;
