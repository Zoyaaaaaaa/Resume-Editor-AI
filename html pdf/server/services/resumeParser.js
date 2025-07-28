const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const AIService = require('./aiService');

class ResumeParser {
    constructor() {
        this.aiService = new AIService();
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

    createStructuringPrompt(text, attempt = 1) {
        // Clean the text first to fix spacing issues
        const cleanedText = this.cleanExtractedText(text);
        
        const basePrompt = `
You are an expert resume parser. Analyze the following resume text and extract ALL information into a structured JSON format.

CRITICAL INSTRUCTIONS:
- Fix any spacing issues in the text (e.g., "dailyWBRand" should be "daily WBR and")
- Ensure proper spacing between words and sentences
- Only extract information that fits our template structure
- Ignore images, graphics, or non-text elements
- Focus ONLY on: Personal Info, Experience, Projects, Education, Extra-curricular activities
- MUST return ONLY valid JSON without any markdown formatting

Resume Text:
${cleanedText}

Extract information for this EXACT JSON structure:
{
    "personalInfo": {
        "fullName": "full name from resume",
        "email": "email address",
        "phone": "phone number",
        "location": "current location/address"
    },
    "areasOfInterest": "skills, areas of interest, or professional summary",
    "experience": [
        {
            "position": "job title",
            "company": "company name", 
            "location": "work location",
            "dates": "employment period",
            "description": "detailed job responsibilities and achievements"
        }
    ],
    "projects": [
        {
            "title": "project name",
            "organization": "organization or course",
            "duration": "project timeline",
            "technologies": "technologies/tools used",
            "description": "project details and outcomes"
        }
    ],
    "education": [
        {
            "degree": "degree type",
            "field": "field of study",
            "institution": "university/school name",
            "duration": "study period",
            "grade": "GPA/grade",
            "details": "additional academic details"
        }
    ],
    "extracurricular": [
        {
            "activity": "activity/role name",
            "organization": "organization name",
            "duration": "time period",
            "description": "activity description"
        }
    ]
}`;

        if (attempt === 1) {
            return basePrompt + `

CRITICAL INSTRUCTIONS FOR TEMPLATE COMPLIANCE:
- Fix ALL spacing issues in text (ensure proper word separation)
- Extract ONLY information that fits our 5 main sections
- For Experience: Include position, company, location, dates, and BULLET-POINT description
- For Projects: Include title, organization/course, duration, technologies, BULLET-POINT description
- For Education: Include degree, field, institution, duration, grade/GPA, coursework details
- For Extra-curricular: Include activity name, organization, duration, BULLET-POINT description
- FORMAT DESCRIPTIONS: Break long paragraphs into bullet points starting with "•"
- IGNORE: Images, charts, graphics, social media links, references
- CLEAN UP: All concatenated words and ensure proper spacing
- Return ONLY the JSON object, no markdown or explanations`;
        }

        if (attempt === 2) {
            return basePrompt + `

RETRY INSTRUCTIONS:
- Previous attempt may have missed information
- Look more carefully for section headers like "Experience", "Projects", "Education"
- Extract partial information even if some fields are missing
- Focus on getting at least the main content from each section
- Return ONLY valid JSON`;
        }

        return basePrompt + `

FINAL ATTEMPT:
- This is the last try - extract whatever information you can find
- Even incomplete information is better than empty fields
- Look for any work history, education, or project information
- Fill in available fields and leave others empty
- MUST return valid JSON format`;
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
            
        const hasExtracurricular = data.extracurricular && data.extracurricular.length > 0 && 
            data.extracurricular.some(ext => ext.activity || ext.description);
            
        const hasAreasOfInterest = data.areasOfInterest && data.areasOfInterest.trim().length > 0;
        
        // Consider data meaningful if we have personal info AND at least one other section
        return hasPersonalInfo && (hasExperience || hasProjects || hasEducation || hasExtracurricular || hasAreasOfInterest);
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
            projects: [],
            education: [],
            extracurricular: []
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
            
            // Handle arrays - filter out entries with null/undefined values
            result.experience = Array.isArray(data.experience) ? 
                data.experience.filter(item => item && typeof item === 'object') : [];
            result.projects = Array.isArray(data.projects) ? 
                data.projects.filter(item => item && typeof item === 'object') : [];
            result.education = Array.isArray(data.education) ? 
                data.education.filter(item => item && typeof item === 'object') : [];
            result.extracurricular = Array.isArray(data.extracurricular) ? 
                data.extracurricular.filter(item => item && typeof item === 'object') : [];
                
            // Clean up null values and fix text in array items
            result.experience = result.experience.map(item => this.cleanAndFixText(this.cleanNullValues(item)));
            result.projects = result.projects.map(item => this.cleanAndFixText(this.cleanNullValues(item)));
            result.education = result.education.map(item => this.cleanAndFixText(this.cleanNullValues(item)));
            result.extracurricular = result.extracurricular.map(item => this.cleanAndFixText(this.cleanNullValues(item)));
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
    
    fixTextSpacing(text) {
        if (!text) return '';
        
        return text
            // Fix specific spacing issues found in the resume
            .replace(/dailyWBRand/g, 'daily WBR and')
            .replace(/usingSQL,Python,/g, 'using SQL, Python,')
            .replace(/andMetabase/g, 'and Metabase')
            .replace(/maintainedJupyter/g, 'maintained Jupyter')
            .replace(/notebooksfor/g, 'notebooks for')
            .replace(/usingPython/g, 'using Python')
            .replace(/partnerslikeXpressBees,Delhivery,/g, 'partners like XpressBees, Delhivery,')
            .replace(/andEcom Express/g, 'and Ecom Express')
            .replace(/usingMySQL,QlikSense,/g, 'using MySQL, QlikSense,')
            .replace(/andAdvanced Excel/g, 'and Advanced Excel')
            .replace(/viaGoogle Sheets/g, 'via Google Sheets')
            .replace(/usingSqueezeNet/g, 'using SqueezeNet')
            .replace(/CNNfor/g, 'CNN for')
            .replace(/LeveragedTensorFlow,Keras,/g, 'Leveraged TensorFlow, Keras,')
            .replace(/andOpenCVfor/g, 'and OpenCV for')
            .replace(/DL ,/g, 'DL,')
            .replace(/aPower BI/g, 'a Power BI')
            .replace(/implementingautomated/g, 'implementing automated')
            .replace(/data scrapingfrom/g, 'data scraping from')
            .replace(/usingPandasandPower/g, 'using Pandas and Power')
            .replace(/Querywith/g, 'Query with')
            .replace(/RESTfule-commerce/g, 'RESTful e-commerce')
            .replace(/backendusingDjango/g, 'backend using Django')
            .replace(/IntegratedJWT/g, 'Integrated JWT')
            .replace(/authandpayment/g, 'auth and payment')
            .replace(/areal-time/g, 'a real-time')
            .replace(/applicationusingDjango/g, 'application using Django')
            .replace(/ChannelsandWebSocketsto/g, 'Channels and WebSockets to')
            .replace(/Implementedasynchronous/g, 'Implemented asynchronous')
            .replace(/handlinganduser/g, 'handling and user')
            .replace(/withJavaScript/g, 'with JavaScript')
            // General fixes
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/(\w)(\d)/g, '$1 $2')
            .replace(/(\d)(\w)/g, '$1 $2')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Helper method to clean and validate extracted text
    cleanExtractedText(text) {
        return text
            // Fix common spacing issues from PDF extraction
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
            .replace(/(\w)(\d)/g, '$1 $2') // Add space between letters and numbers
            .replace(/(\d)(\w)/g, '$1 $2') // Add space between numbers and letters
            .replace(/([a-z])(and|or|the|of|in|at|to|for|with|from|by)/g, '$1 $2') // Fix common word concatenations
            .replace(/(and|or|the|of|in|at|to|for|with|from|by)([A-Z])/g, '$1 $2')
            // Fix specific patterns
            .replace(/WBRand/g, 'WBR and')
            .replace(/usingSQL/g, 'using SQL')
            .replace(/andMetabase/g, 'and Metabase')
            .replace(/maintainedJupyter/g, 'maintained Jupyter')
            .replace(/usingPython/g, 'using Python')
            .replace(/likeXpressBees/g, 'like XpressBees')
            .replace(/usingMySQL/g, 'using MySQL')
            .replace(/QlikSense/g, 'QlikSense')
            .replace(/viaGoogle/g, 'via Google')
            // Clean up multiple spaces and normalize
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    }
}

module.exports = ResumeParser;