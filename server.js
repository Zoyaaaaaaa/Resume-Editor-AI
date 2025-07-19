const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const config = require('./config');

const app = express();

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Multer for file uploads
const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Resume endpoint
app.post('/api/parse-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.body.resumeContent) {
            return res.status(400).json({ error: 'No resume content provided' });
        }

        let resumeContent = req.body.resumeContent;
        
        // Handle binary PDF data if sent from frontend
        if (resumeContent.startsWith('[PDF_BINARY_DATA]')) {
            const base64Data = resumeContent.replace('[PDF_BINARY_DATA]', '');
            resumeContent = `PDF binary data provided (${Math.round(base64Data.length / 1024)}KB)`;
        }
        
        // Prepare prompt for Gemini
        const prompt = `Please extract the following information from this resume and return it as a JSON object. If any field is not found, use null or empty string.

Required JSON structure:
{
    "fullName": "string",
    "email": "string", 
    "phone": "string",
    "address": "string",
    "linkedin": "string (just the URL part after linkedin.com/)",
    "website": "string",
    "summary": "string (professional summary or objective)",
    "skills": "string (all technical skills separated by commas on a single line)",
    "experiences": [
        {
            "jobTitle": "string",
            "company": "string", 
            "duration": "string",
            "location": "string",
            "description": "string (achievements and responsibilities, one per line)"
        }
    ],
    "education": [
        {
            "degree": "string",
            "institution": "string",
            "year": "string", 
            "gpa": "string"
        }
    ],
    "projects": [
        {
            "name": "string",
            "description": "string (project details, one per line)",
            "technologies": "string",
            "year": "string",
            "location": "string"
        }
    ]
}

Resume content: ${resumeContent}

Return ONLY the JSON object, no additional text.`;

        console.log('Processing resume with content length:', resumeContent.length);
        
        
        if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.status(500).json({ 
                error: 'Gemini API key not configured',
                details: 'Please update GEMINI_API_KEY in config.js'
            });
        }
I
        const response = await fetch(`${config.GEMINI_API_URL}?key=${config.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);
            return res.status(500).json({ 
                error: `Gemini API error: ${response.status}`,
                details: response.status === 400 ? 'Invalid API key or request format' : errorText
            });
        }

        const result = await response.json();
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
            return res.status(500).json({ error: 'No response from Gemini API' });
        }

        try {
            
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('No JSON found in Gemini response:', generatedText);
                return res.status(500).json({ error: 'Invalid response format from AI' });
            }
            
            const parsedData = JSON.parse(jsonMatch[0]);
            res.json({ success: true, data: parsedData });
            
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', generatedText);
            res.status(500).json({ 
                error: 'Failed to parse AI response',
                details: parseError.message
            });
        }

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});




// Start server
const PORT = process.env.PORT || config.SERVER_PORT;
app.listen(PORT, () => {
    console.log(`Resume Editor AI server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
    
    if (config.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.warn('\n⚠️  WARNING: Please update your Gemini API key in config.js');
        console.warn('   Get your API key from: https://makersuite.google.com/app/apikey\n');
    }
});