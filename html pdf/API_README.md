# Resume Editor AI - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
No authentication required for local development.

---

## 📁 Resume Upload & Parsing

### Upload Resume
Parse an uploaded resume file and extract structured data.

**Endpoint:** `POST /parse-resume`

**Content-Type:** `multipart/form-data`

**Request Body:**
```javascript
FormData {
  resume: File // PDF, DOC, or DOCX file (max 10MB)
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Resume parsed successfully",
  "data": {
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+1 234 567 8900",
      "location": "New York, NY"
    },
    "areasOfInterest": "Machine Learning | Data Science | AI Research",
    "experience": [
      {
        "position": "Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "dates": "Jan 2023 - Present",
        "description": "Developed scalable web applications...",
        "bulletPoints": [
          "Built microservices handling 1M+ requests daily",
          "Reduced API response time by 40%"
        ]
      }
    ],
    "positionOfResponsibility": [
      {
        "position": "Team Lead",
        "organization": "Student Council",
        "institution": "University XYZ",
        "dates": "Sep 2022 - May 2023",
        "description": "Led a team of 10 students...",
        "bulletPoints": []
      }
    ],
    "projects": [
      {
        "title": "E-commerce Platform",
        "organization": "Personal Project",
        "duration": "Jun 2023 - Aug 2023",
        "technologies": "React, Node.js, MongoDB",
        "description": "Built a full-stack e-commerce platform...",
        "bulletPoints": []
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "institution": "University XYZ",
        "duration": "2020-2024",
        "grade": "3.8/4.0",
        "details": "Relevant coursework: Data Structures, Algorithms",
        "bulletPoints": []
      }
    ]
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid file format",
  "message": "Only PDF, DOC, and DOCX files are supported",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

---

## 🤖 AI Enhancement Services

### Point-wise Enhancement
Enhance a single bullet point using AI.

**Endpoint:** `POST /gemini/enhance-point`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "section": "experience", // Required: "experience" | "projects" | "education" | "areasOfInterest" | "positionOfResponsibility"
  "content": "Worked on data analysis projects", // Required: The text to enhance (1-1000 chars)
  "context": "Data Analyst at ABC Corp", // Optional: Additional context (max 2000 chars)
  "jobDescription": "Looking for data analyst with Python skills..." // Optional: Target job description (max 5000 chars)
}
```

**Success Response (200):**
```json
{
  "success": true,
  "originalContent": "Worked on data analysis projects",
  "enhancedContent": "Conducted comprehensive data analysis projects utilizing Python and SQL, resulting in 25% improvement in business decision-making accuracy",
  "section": "experience",
  "improvements": {
    "addedMetrics": true,
    "improvedActionVerbs": true,
    "addedTechnicalSkills": ["Python", "SQL"],
    "enhancementType": "quantification"
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid point enhancement request",
  "details": [
    {
      "field": "section",
      "message": "Section must be one of: experience, projects, education, areasOfInterest, positionOfResponsibility"
    }
  ],
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Section Enhancement (Legacy)
Enhance an entire section's content.

**Endpoint:** `POST /gemini/enhance`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "section": "experience", // Required
  "content": "Software Engineer at XYZ Corp...", // Required (10-5000 chars)
  "jobDescription": "Looking for senior developer...", // Optional
  "enhancementType": "content-improvement" // Optional: "ats-optimization" | "content-improvement" | "keyword-enhancement"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "originalContent": "Software Engineer at XYZ Corp...",
  "enhancedContent": {
    "enhancedContent": "Senior Software Engineer at XYZ Corp with 5+ years experience...",
    "improvements": [
      "Added quantifiable metrics",
      "Strengthened action verbs",
      "Included relevant keywords"
    ],
    "keywordsAdded": ["senior", "5+ years", "scalable"]
  },
  "section": "experience",
  "enhancementType": "content-improvement",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### ATS Score Analysis
Analyze resume compatibility with Applicant Tracking Systems.

**Endpoint:** `POST /gemini/ats-score`

**Request Body:**
```json
{
  "resumeData": {
    "personalInfo": { /* ... */ },
    "experience": [ /* ... */ ]
    // Full resume data object
  },
  "jobDescription": "We are looking for..." // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "score": 85,
  "breakdown": {
    "keywords": 70,
    "formatting": 90,
    "sections": 85,
    "content": 80
  },
  "suggestions": [
    "Add more industry-specific keywords",
    "Include quantifiable achievements",
    "Optimize section headers"
  ],
  "keywords": [
    "machine learning",
    "python",
    "data analysis"
  ],
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Extract Keywords
Extract relevant keywords from a job description.

**Endpoint:** `POST /gemini/extract-keywords`

**Request Body:**
```json
{
  "jobDescription": "We are seeking a software engineer with Python experience..." // Required (50-10000 chars)
}
```

**Success Response (200):**
```json
{
  "success": true,
  "keywords": ["software engineer", "python", "agile", "teamwork"],
  "skills": ["Python", "JavaScript", "React", "Node.js"],
  "requirements": ["3+ years experience", "Bachelor's degree"],
  "actionVerbs": ["develop", "implement", "optimize", "collaborate"],
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### AI Service Status
Check if AI enhancement services are available.

**Endpoint:** `GET /gemini/status`

**Success Response (200):**
```json
{
  "service": "AI Enhancement",
  "status": "available",
  "features": {
    "contentEnhancement": true,
    "atsAnalysis": true,
    "keywordExtraction": true,
    "contentSuggestions": true,
    "pointEnhancement": true
  },
  "provider": "Google Gemini AI",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

**Error Response (503):**
```json
{
  "service": "AI Enhancement",
  "status": "unavailable",
  "features": {
    "contentEnhancement": false,
    "atsAnalysis": false,
    "keywordExtraction": false,
    "contentSuggestions": false,
    "pointEnhancement": false
  },
  "provider": "Google Gemini AI",
  "details": "API key not configured",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

---

## 📄 PDF Generation

### Generate PDF
Create a PDF resume from structured data.

**Endpoint:** `POST /generate-pdf`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "personalInfo": {
    "fullName": "John Doe",
    "email": "john@email.com",
    "phone": "+1 234 567 8900",
    "location": "New York, NY"
  },
  "areasOfInterest": "Machine Learning | Data Science",
  "experience": [
    {
      "position": "Software Engineer",
      "company": "Tech Corp",
      "dates": "Jan 2023 - Present",
      "bulletPoints": [
        "Developed scalable applications",
        "Improved system performance by 40%"
      ]
    }
  ],
  "positionOfResponsibility": [],
  "projects": [],
  "education": []
}
```

**Success Response (200):**
- **Content-Type:** `application/pdf`
- **Headers:** `Content-Disposition: attachment; filename="resume.pdf"`
- **Body:** PDF file binary data

**Error Response (400):**
```json
{
  "success": false,
  "error": "PDF generation failed",
  "message": "Invalid resume data structure",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

---

## 🏥 Health & System Endpoints

### Health Check
Check if the API server is running.

**Endpoint:** `GET /health`

**Success Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Version Info
Get API version and available features.

**Endpoint:** `GET /version`

**Success Response (200):**
```json
{
  "version": "1.0.0",
  "features": [
    "resume-upload",
    "ai-enhancement", 
    "pdf-generation",
    "point-enhancement"
  ]
}
```

---

## 🚨 Error Handling

### Common Error Response Format
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human readable error message",
  "details": "Additional error details or validation errors",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### HTTP Status Codes
- **200** - Success
- **400** - Bad Request (validation errors, invalid data)
- **404** - Not Found
- **429** - Too Many Requests (rate limiting)
- **500** - Internal Server Error
- **503** - Service Unavailable (AI service down)

### Rate Limiting
- **Limit:** 100 requests per 15 minutes per IP
- **Headers:** 
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1642680000`

---

## 🔧 Data Models

### Personal Info Object
```typescript
interface PersonalInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
}
```

### Experience Object
```typescript
interface Experience {
  position?: string;
  company?: string;
  location?: string;
  dates?: string;
  description?: string;
  bulletPoints?: string[];
}
```

### Position of Responsibility Object
```typescript
interface PositionOfResponsibility {
  position?: string;
  organization?: string;
  institution?: string;
  dates?: string;
  description?: string;
  bulletPoints?: string[];
}
```

### Project Object
```typescript
interface Project {
  title?: string;
  organization?: string;
  duration?: string;
  technologies?: string;
  description?: string;
  bulletPoints?: string[];
}
```

### Education Object
```typescript
interface Education {
  degree?: string;
  field?: string;
  institution?: string;
  duration?: string;
  grade?: string;
  details?: string;
  bulletPoints?: string[];
}
```

---

## 🎯 Frontend Integration Examples

### Upload Resume Example
```javascript
const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  try {
    const response = await fetch('/api/parse-resume', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Resume data:', result.data);
      // Populate form with extracted data
      populateForm(result.data);
    } else {
      console.error('Upload failed:', result.message);
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

### Point Enhancement Example
```javascript
const enhancePoint = async (section, content, context) => {
  try {
    const response = await fetch('/api/gemini/enhance-point', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        section,
        content,
        context
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.enhancedContent;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Enhancement failed:', error);
    throw error;
  }
};

// Usage
const enhanced = await enhancePoint(
  'experience', 
  'Worked on data projects',
  'Data Analyst at XYZ Corp'
);
```

### Generate PDF Example
```javascript
const generatePDF = async (resumeData) => {
  try {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resumeData)
    });
    
    if (response.ok) {
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      a.click();
      
      URL.revokeObjectURL(url);
    } else {
      const error = await response.json();
      console.error('PDF generation failed:', error.message);
    }
  } catch (error) {
    console.error('PDF error:', error);
  }
};
```

---

## 🔐 Environment Variables

Create a `.env` file in the server directory:

```env
# Required for AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
PORT=3000
NODE_ENV=development
```

---

## 📝 Notes for Frontend Developers

1. **File Upload**: Use `FormData` for resume uploads, not JSON
2. **Error Handling**: Always check the `success` field in responses
3. **Rate Limiting**: Implement proper error handling for 429 responses
4. **AI Availability**: Check `/gemini/status` before using AI features
5. **PDF Generation**: Handle binary response data properly
6. **Bullet Points**: The `bulletPoints` array is prioritized over `description` text
7. **Section Names**: Use exact section names as specified in validation rules
8. **Content Length**: Respect the character limits for each field

## 🐛 Troubleshooting

- **AI features not working**: Check if `GEMINI_API_KEY` is set
- **File upload fails**: Ensure file size < 10MB and correct format
- **PDF generation slow**: Large resumes may take 10-15 seconds
- **Rate limiting**: Implement exponential backoff for retries

## 📞 Support

For technical issues or questions about this API, please refer to the server logs or contact the backend development team.