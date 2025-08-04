

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

//     createStructuringPrompt(text, attempt = 1) {
//     // Clean the text first to fix spacing issues
//     const cleanedText = this.cleanExtractedText(text);

//     const basePrompt = `
// You are an expert resume parser with strict quality controls. Analyze the following resume text and extract ALL information into structured JSON format.

// **QUALITY CONTROL CHECKLIST:**
//    Fix spacing issues carefully - preserve technology names and proper nouns  
//    Ensure proper word spacing without breaking compound words  
//    Validate email format (no spaces): user@domain.com  
//    Sort dates chronologically (most recent first)  
//    Avoid orphan words - complete phrases only  
//    No repeated content within same sections  
//    Convert periods used as line breaks to proper formatting  
//    CRITICAL FORMATTING: Keep "U.S." as "US", preserve numbers exactly "9.20" stays "9.20"   for all number percentiles and percentages make sure of it
//    Replace "Indian Institute of Technology Bombay" with "IIT Bombay"  

// **EDUCATION FORMAT STRICTLY ENFORCED:**
// - Format in ONE LINE ONLY: "GPA: X.XX | Location"
// - Example: "Mumbai, India"
// - description: STRICTLY SINGLE academic achievement or highlight (MAX 120 characters, no bullets)
// -Example:
//   "University of California, Los Angeles, CA
//    Master of Science in Electrical Engineering| GPA: 3.82/4.0"

// **CRITICAL IMPACT FRAMEWORK:**
// For Experience, Projects, and Position of Responsibility descriptions:
// - MANDATORY: Each bullet point follows WHAT-HOW-EFFECT structure
// - WHAT: Action/work performed  
// - HOW: Method/technology/approach used  
// - EFFECT: Result/impact/learning achieved  

// Resume Text:
// ${cleanedText}

// **EXACT JSON STRUCTURE REQUIRED:**
// {
//     "personalInfo": {
//         "fullName": "full name from resume",
//         "email": "email@domain.com (validate format - no spaces)",
//         "phone": "phone number", 
//         "location": "current location (convert U.S. to US, preserve number formatting)"
//     },
//     "areasOfInterest": "comma-separated professional interests (if missing, infer 3-4 from resume content)",
//     "experience": [
//         {
//             "position": "job title",
//             "company": "company name",
//             "location": "work location", 
//             "dates": "employment period (sorted chronologically)",
//             "description": "• WHAT action + HOW method + EFFECT result\\n• WHAT action + HOW method + EFFECT result\\n• WHAT action + HOW method + EFFECT result"
//         }
//     ],
//     "achievements": [
//         {
//             "title": "achievement title",
//             "organization": "organization name",
//             "date": "achievement date (sorted chronologically)", 
//             "description": "SINGLE-LINE description only (no bullet points, max 120 characters, highlight impact or recognition)"
//         }
//     ],
//     "projects": [
//         {
//             "title": "project name",
//             "organization": "organization or course",
//             "duration": "project timeline (sorted chronologically)",
//             "technologies": "technologies/tools used",
//             "description": "• WHAT developed + HOW technology + EFFECT outcome\\n• WHAT implemented + HOW approach + EFFECT learning\\n• WHAT achieved + HOW method + EFFECT result"
//         }
//     ],
//      "education": [
//         {
//             "degree": "Bachelor of Engineering",
//             "field": "Computer Engineering", 
//             "institution": "D. Y. Patil Institute of Engineering, Pune",
//             "duration": "06/2021-Present",
//             "grade": "GPA: 9",
//             "location": "Raisamand, Rajasthan",
//         }
//     ]
//     "positionOfResponsibility": [
//         {
//             "position": "position/role name",
//             "organization": "organization name",
//             "institution": "institution name", 
//             "dates": "time period (sorted chronologically)",
//             "description": "• WHAT led + HOW approach + EFFECT impact\\n• WHAT managed + HOW method + EFFECT outcome\\n• WHAT coordinated + HOW strategy + EFFECT result"
//         }
//     ]
// }`;

//     if (attempt === 1) {
//         return basePrompt + `

// **FIRST ATTEMPT REQUIREMENTS:**
// - Apply ALL quality controls from checklist  
// - Implement IMPACT framework (WHAT-HOW-EFFECT) for Experience/Projects/Leadership bullet points ONLY  
// - Format Experience/Projects/Leadership as exactly 3 bullet points using "• " prefix  
// - Education: STRICTLY ONE LINE format (see EDUCATION FORMAT above)  
// - Achievements: SINGLE LINE with strong impact focus  
// - Sort all dates chronologically (most recent first)  
// - Validate email format strictly  
// - Convert "U.S." to "US", preserve number formats exactly (9.20 stays 9.20)  
// - Preserve technical terms exactly as written  
// - Fix spacing issues without breaking compound words  
// - Return ONLY valid JSON, no markdown or explanations  
// - Ensure no content repetition within sections`;
//     }

//     if (attempt === 2) {
//         return basePrompt + `

// **RETRY INSTRUCTIONS (Attempt ${attempt}):**
// - Previous attempt failed quality controls  
// - MANDATORY: Apply IMPACT framework to ALL bullet point descriptions  
// - Double-check date sorting (chronological order)  
// - Verify email format has no spaces  
// - Ensure no repeated sentences in same sections  
// - Fix any orphan words or incomplete phrases  
// - MUST use exactly 3 bullet points for Experience/Projects/Leadership  
// - Education must be in ONE LINE format exactly  
// - Achievements must be one impactful line, max 120 characters  
// - Return ONLY valid JSON format`;
//     }

//     return basePrompt + `

// **FINAL ATTEMPT (${attempt}):**
// - Extract available information even if incomplete  
// - CRITICAL: Apply IMPACT framework wherever possible  
// - Ensure proper date sorting and email validation  
// - Fix all spacing and formatting issues  
// - Eliminate any content repetition  
// - Use "IIT Bombay" format consistently  
// - Preserve technical terms and proper nouns  
// - Enforce ONE LINE format for education & achievements  
// - Return valid JSON with available information  
// - Apply quality controls to maximum extent possible`;
//     }
createStructuringPrompt(text, attempt = 1) {
    // Clean the text first to fix spacing issues
    const cleanedText = this.cleanExtractedText(text);

    const basePrompt = `
You are an expert resume parser with strict quality controls. Analyze the following resume text and extract ALL information into structured JSON format.

**QUALITY CONTROL CHECKLIST:**
   Fix spacing issues carefully - preserve technology names and proper nouns  
   Ensure proper word spacing without breaking compound words  
   Validate email format (no spaces): user@domain.com  
   Sort dates chronologically (most recent first)  
   Avoid orphan words - complete phrases only  
   No repeated content within same sections  
   Convert periods used as line breaks to proper formatting  
   CRITICAL FORMATTING: Keep "U.S." as "US", preserve numbers exactly "9.20" stays "9.20"   for all number percentiles and percentages make sure of it
   Replace "Indian Institute of Technology Bombay" with "IIT Bombay"  

**EDUCATION FORMAT STRICTLY ENFORCED:**
- Format in ONE LINE ONLY: "GPA: X.XX | Location"
- Example: "Mumbai, India"
- description: STRICTLY SINGLE academic achievement or highlight (MAX 120 characters, no bullets)
-Example:
  "University of California, Los Angeles, CA
   Master of Science in Electrical Engineering| GPA: 3.82/4.0"

**ACHIEVEMENTS FORMAT:**
- Awards, recognitions, competitions, certifications, honors
- SINGLE LINE description only (no bullet points, max 120 characters)
- Focus on the recognition/award itself and its significance

**PUBLICATIONS FORMAT:**
- Research papers, journal articles, conference papers, patents
- Include all authors, highlight if first/corresponding author
- SINGLE LINE description focusing on research contribution (max 120 characters)
- Sort by publication date (most recent first)

**POSITION OF RESPONSIBILITY FORMAT:**
- Leadership roles, committee positions, organizational responsibilities
- EXACTLY 2 bullet points using "• " prefix
- Each bullet follows WHAT-HOW-EFFECT structure

**CRITICAL IMPACT FRAMEWORK:**
For Experience, Projects, and Position of Responsibility descriptions:
- MANDATORY: Each bullet point follows WHAT-HOW-EFFECT structure
- WHAT: Action/work performed  
- HOW: Method/technology/approach used  
- EFFECT: Result/impact/learning achieved  

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
    "areasOfInterest": "comma-separated professional interests (if missing, infer 3-4 from resume content)",
    "skills": "comma-separated skills(if missing, infer 3-4 from resume content)",
    "experience": [
        {
            "position": "job title",
            "company": "company name",
            "location": "work location", 
            "dates": "employment period (sorted chronologically)",
            "description": "• WHAT action + HOW method + EFFECT result\\n• WHAT action + HOW method + EFFECT result\\n• WHAT action + HOW method + EFFECT result"
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
            "description": "• WHAT developed + HOW technology + EFFECT outcome\\n• WHAT implemented + HOW approach + EFFECT learning\\n• WHAT achieved + HOW method + EFFECT result"
        }
    ],
     "education": [
        {
            "degree": "Bachelor of Engineering",
            "field": "Computer Engineering", 
            "institution": "D. Y. Patil Institute of Engineering, Pune",
            "duration": "06/2021-Present",
            "grade": "GPA: 9",
            "location": "Raisamand, Rajasthan",
        }
    ]
    "positionOfResponsibility": [
        {
            "position": "leadership position/role name",
            "organization": "organization name",
            "institution": "institution name", 
            "dates": "time period (sorted chronologically)",
            "description": "• WHAT led/managed + HOW approach/method + EFFECT impact/outcome\\n• WHAT coordinated/organized + HOW strategy/technique + EFFECT result/learning"
        }
    ]
}`;

    if (attempt === 1) {
        return basePrompt + `

**FIRST ATTEMPT REQUIREMENTS:**
- Apply ALL quality controls from checklist  
- Implement IMPACT framework (WHAT-HOW-EFFECT) for Experience/Projects/Position of Responsibility bullet points ONLY  
- Format Experience/Projects as exactly 3 bullet points using "• " prefix  
- Format Position of Responsibility as exactly 2 bullet points using "• " prefix  
- Education: STRICTLY ONE LINE format (see EDUCATION FORMAT above)  
- Achievements: SINGLE LINE with recognition/award focus (NO bullet points)  
- Publications: SINGLE LINE with research contribution focus (NO bullet points), include all authors  
- Sort all dates chronologically (most recent first)  
- Validate email format strictly  
- Convert "U.S." to "US", preserve number formats exactly (9.20 stays 9.20)  
- Preserve technical terms exactly as written  
- Fix spacing issues without breaking compound words  
- Return ONLY valid JSON, no markdown or explanations  
- Ensure no content repetition within sections  
- Include publications section only if publications are found in resume`;
    }

    if (attempt === 2) {
        return basePrompt + `

**RETRY INSTRUCTIONS (Attempt ${attempt}):**
- Previous attempt failed quality controls  
- MANDATORY: Apply IMPACT framework to Experience/Projects/Position of Responsibility bullet points  
- Achievements are awards/recognitions - NO bullet points, single line only  
- Publications are research papers - NO bullet points, single line with research focus  
- Position of Responsibility gets EXACTLY 2 bullet points with WHAT-HOW-EFFECT  
- Double-check date sorting (chronological order)  
- Verify email format has no spaces  
- Ensure no repeated sentences in same sections  
- Fix any orphan words or incomplete phrases  
- Experience/Projects: 3 bullets, Position of Responsibility: 2 bullets, Achievements/Publications: single line  
- Education must be in ONE LINE format exactly  
- Include publications only if found in resume  
- Return ONLY valid JSON format`;
    }

    return basePrompt + `

**FINAL ATTEMPT (${attempt}):**
- Extract available information even if incomplete  
- CRITICAL: Apply IMPACT framework to Experience/Projects/Position of Responsibility only  
- Achievements are single-line recognitions/awards (no bullets)  
- Publications are single-line research contributions (no bullets)  
- Position of Responsibility gets exactly 2 detailed bullet points  
- Ensure proper date sorting and email validation  
- Fix all spacing and formatting issues  
- Eliminate any content repetition  
- Use "IIT Bombay" format consistently  
- Preserve technical terms and proper nouns  
- Enforce correct formatting: Experience/Projects (3 bullets), Position of Responsibility (2 bullets), Achievements/Publications (single line)  
- Include publications section only if publications exist in resume  
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
            experience: [],
            achievements: [],
            projects: [],
            education: [],
            positionOfResponsibility: [],
            publications:[],
            skills:[],
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
            
            // Handle areas of interest (convert null to empty string)
            result.areasOfInterest = data.areasOfInterest || '';
            result.areasOfInterest = data.skills || '';
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
            result.publications = Array.isArray(data.skills) ? 
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
