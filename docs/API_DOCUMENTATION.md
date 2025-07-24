# Resume Editor AI - API Documentation

## Overview

The Resume Editor AI provides a comprehensive RESTful API for building professional resumes with AI enhancement, multiple templates, and ATS optimization. This documentation covers all available endpoints, request/response formats, error handling, and usage examples.

**Base URL:** `http://localhost:3000/api` (development)  
**Version:** 2.0.0  
**Content-Type:** `application/json`

## Authentication

Currently, the API does not require authentication for public endpoints. All requests are subject to rate limiting based on IP address.

## Rate Limiting

The API implements multiple rate limiting strategies:

- **General API**: 100 requests per 15 minutes
- **AI Operations**: 10 requests per minute  
- **PDF Generation**: 20 requests per 5 minutes

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit resets

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true|false,
  "data": { ... },        // Present on success
  "error": "message",     // Present on error
  "details": [ ... ]      // Validation errors (if applicable)
}
```

## Error Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (external service down)

---

# Template Routes

## GET /api/templates

Get all available resume templates.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "professional",
      "name": "Professional",
      "description": "Clean, traditional resume format suitable for corporate environments"
    },
    {
      "id": "modern", 
      "name": "Modern",
      "description": "Contemporary design with colors and icons, perfect for creative roles"
    }
  ]
}
```

## GET /api/templates/:templateName/preview

Get detailed information about a specific template.

**Parameters:**
- `templateName` (string) - Template identifier (`professional` | `modern`)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "professional",
    "name": "Professional",
    "description": "Clean, traditional resume format suitable for corporate environments",
    "features": [
      "Clean layout",
      "Professional formatting", 
      "ATS-friendly",
      "Traditional design"
    ],
    "preview": "/assets/previews/professional.png"
  }
}
```

## POST /api/templates/generate

Generate LaTeX code from template and resume data.

**Request Body:**
```json
{
  "templateName": "professional",
  "data": {
    "personalInfo": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1 (555) 123-4567",
      "location": "New York, NY",
      "linkedin": "https://linkedin.com/in/johndoe",
      "website": "https://johndoe.com"
    },
    "professionalSummary": "Experienced software engineer with 5+ years...",
    "experience": [
      {
        "position": "Senior Software Engineer",
        "company": "Tech Corp",
        "location": "New York, NY",
        "dates": "2020 - Present",
        "details": "Led development of microservices architecture\\nImplemented CI/CD pipelines\\nMentored junior developers"
      }
    ],
    "education": [
      {
        "institution": "University of Technology",
        "degree": "Bachelor of Science in Computer Science",
        "dates": "2015 - 2019",
        "gpa": "3.8/4.0"
      }
    ],
    "projects": [
      {
        "name": "E-commerce Platform",
        "type": "Full-Stack Application",
        "dates": "2021",
        "details": "Built scalable e-commerce platform using React and Node.js"
      }
    ],
    "skills": {
      "Languages": "JavaScript, Python, Java, TypeScript",
      "Frameworks": "React, Node.js, Express, Django",
      "Tools": "Docker, Kubernetes, AWS, Git",
      "Concepts": "Microservices, DevOps, Agile, Testing"
    },
    "certifications": [
      "AWS Certified Solutions Architect",
      "Google Cloud Professional Developer"
    ],
    "positions": [
      "Tech Lead at Innovation Lab",
      "Open Source Contributor"
    ],
    "interests": "Machine Learning, Photography, Rock Climbing"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "latex": "\\documentclass[9pt, a4paper]{article}...",
    "template": "professional",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## POST /api/templates/validate

Validate resume data structure before processing.

**Request Body:**
```json
{
  "data": {
    "personalInfo": {
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data validation passed"
}
```

## DELETE /api/templates/cache

Clear template cache (admin operation).

**Response:**
```json
{
  "success": true,
  "message": "Template cache cleared successfully"
}
```

---

# PDF Routes

## POST /api/pdf/generate

Generate PDF from template and resume data in one step.

**Rate Limited:** 20 requests per 5 minutes

**Request Body:**
```json
{
  "templateName": "professional",
  "data": { /* Resume data object */ },
  "options": {
    "compiler": "pdflatex",  // optional: pdflatex, xelatex, lualatex
    "timeout": 30000         // optional: compilation timeout in ms
  }
}
```

**Response:**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="resume.pdf"`
- Binary PDF data

**Error Response:**
```json
{
  "success": false,
  "error": "PDF generation service is temporarily unavailable"
}
```

## POST /api/pdf/compile

Compile LaTeX code directly to PDF.

**Rate Limited:** 20 requests per 5 minutes

**Request Body:**
```json
{
  "latex": "\\documentclass[9pt, a4paper]{article}...",
  "options": {
    "compiler": "pdflatex"
  }
}
```

**Response:**
- Binary PDF data with appropriate headers

## GET /api/pdf/status

Check PDF compilation service availability.

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "url": "https://latexonline.cc/compile",
    "responseTime": 250
  }
}
```

## DELETE /api/pdf/cache

Clear PDF compilation cache.

**Response:**
```json
{
  "success": true,
  "message": "PDF cache cleared successfully"
}
```

---

# AI Routes

All AI routes are rate limited to 10 requests per minute.

## POST /api/ai/parse-resume

Parse uploaded PDF resume using AI to extract structured data.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `resume` (file) - PDF file (max 10MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "parsed": {
      "personalInfo": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1 (555) 123-4567"
      },
      "professionalSummary": "Experienced software engineer...",
      "experience": [ /* Extracted experience */ ],
      "education": [ /* Extracted education */ ],
      "skills": { /* Extracted skills */ }
    },
    "extractedText": "Raw text extracted from PDF",
    "fileName": "john_doe_resume.pdf",
    "fileSize": 245760
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "No PDF file uploaded"
}
```

```json
{
  "success": false,
  "error": "Could not extract text from PDF"
}
```

## POST /api/ai/parse-text

Parse resume from plain text using AI.

**Request Body:**
```json
{
  "resumeText": "John Doe\nSoftware Engineer\n..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "parsed": { /* Structured resume data */ },
    "inputText": "Original text input"
  }
}
```

## POST /api/ai/ats-score

Calculate ATS (Applicant Tracking System) compatibility score.

**Request Body:**
```json
{
  "resumeData": { /* Complete resume data object */ },
  "jobDescription": "We are looking for a senior software engineer..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "maxScore": 100,
    "feedback": {
      "strengths": [
        "Clear contact information",
        "Relevant work experience",
        "Technical skills well-organized"
      ],
      "improvements": [
        "Add more quantified achievements",
        "Include industry-specific keywords",
        "Improve formatting consistency"
      ],
      "keywords": {
        "found": ["JavaScript", "React", "Node.js", "AWS"],
        "missing": ["Docker", "Kubernetes", "Microservices"],
        "suggestions": ["DevOps", "CI/CD", "Agile"]
      },
      "formatting": {
        "score": 90,
        "issues": ["Inconsistent bullet point formatting"]
      },
      "content": {
        "score": 80,
        "feedback": "Content is relevant but could benefit from more quantified achievements"
      }
    },
    "recommendations": [
      "Add metrics to your achievements (e.g., 'Improved performance by 40%')",
      "Include more technical keywords relevant to the role",
      "Ensure consistent formatting throughout the document"
    ]
  }
}
```

## POST /api/ai/enhance-section

Enhance a specific resume section using AI.

**Request Body:**
```json
{
  "sectionData": "Software engineer with experience in web development",
  "sectionType": "professionalSummary",  // professionalSummary, experience, skills, education, projects
  "jobDescription": "Optional job description for context"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enhanced": "Results-driven software engineer with 5+ years of experience developing scalable web applications using modern technologies...",
    "sectionType": "professionalSummary",
    "original": "Software engineer with experience in web development"
  }
}
```

## POST /api/ai/bulk-enhance

Enhance multiple resume sections in a single request.

**Status:** Coming Soon (returns 501)

**Request Body:**
```json
{
  "sections": [
    {
      "sectionType": "professionalSummary",
      "sectionData": "Current summary text"
    },
    {
      "sectionType": "skills",
      "sectionData": {
        "Languages": "JavaScript, Python",
        "Frameworks": "React, Django"
      }
    }
  ],
  "jobDescription": "Optional context"
}
```

## GET /api/ai/status

Check AI service status and availability.

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "apiKey": "configured",
    "model": "gemini-pro",
    "responseTime": 150
  }
}
```

## GET /api/ai/usage

Get AI service usage statistics.

**Status:** Coming Soon

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Usage tracking feature coming soon",
    "endpoints": {
      "parse-resume": "PDF resume parsing",
      "parse-text": "Text resume parsing",
      "ats-score": "ATS compatibility scoring",
      "enhance-section": "Section enhancement"
    }
  }
}
```

---

# Queue Management Routes

Monitor and manage background job processing.

## GET /api/queue/stats

Get statistics for all job queues.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "queues": {
      "ai": {
        "waiting": 2,
        "active": 1,
        "completed": 45,
        "failed": 3
      },
      "pdf": {
        "waiting": 0,
        "active": 0,
        "completed": 23,
        "failed": 1
      }
    }
  }
}
```

## GET /api/queue/job/:queueType/:jobId

Get status of a specific job.

**Parameters:**
- `queueType` - `ai` or `pdf`
- `jobId` - Job identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "status": "completed",
    "progress": 100,
    "data": { /* Original job data */ },
    "result": { /* Job result */ },
    "createdAt": "2024-01-15T10:25:00.000Z",
    "processedAt": "2024-01-15T10:25:05.000Z",
    "finishedAt": "2024-01-15T10:25:12.000Z"
  }
}
```

## GET /api/queue/:queueType/active

Get currently active jobs for a queue.

**Parameters:**
- `queueType` - `ai` or `pdf`

**Response:**
```json
{
  "success": true,
  "data": {
    "queueType": "ai",
    "activeJobs": [
      {
        "id": "124",
        "name": "parseResume",
        "progress": 50,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "processedAt": "2024-01-15T10:30:02.000Z"
      }
    ],
    "count": 1
  }
}
```

## POST /api/queue/:queueType/:action

Pause or resume a queue.

**Parameters:**
- `queueType` - `ai` or `pdf`
- `action` - `pause` or `resume`

**Response:**
```json
{
  "success": true,
  "message": "ai queue paused successfully"
}
```

## POST /api/queue/clean

Clean old completed and failed jobs.

**Response:**
```json
{
  "success": true,
  "message": "Queue cleanup completed successfully"
}
```

---

# System & Monitoring Routes

Monitor system health and performance.

## GET /api/system/health

Comprehensive health check of all system components.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "2.0.0",
    "environment": "production",
    "uptime": 86400,
    "checks": {
      "redis": {
        "status": "healthy",
        "details": {
          "connected": true,
          "response": "PONG",
          "url": "redis://localhost:6379"
        }
      },
      "ai": {
        "status": "healthy",
        "details": {
          "available": true,
          "apiKey": "configured"
        }
      },
      "pdf": {
        "status": "healthy",
        "details": {
          "available": true,
          "url": "https://latexonline.cc/compile"
        }
      },
      "queues": {
        "status": "healthy",
        "details": { /* Queue statistics */ }
      }
    }
  }
}
```

## GET /api/system/info

Get detailed system information.

**Response:**
```json
{
  "success": true,
  "data": {
    "server": {
      "platform": "linux",
      "architecture": "x64",
      "nodeVersion": "v18.17.0",
      "pid": 1234,
      "uptime": 86400,
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "system": {
      "hostname": "resume-api-01",
      "type": "Linux",
      "release": "5.4.0",
      "totalMemory": 8589934592,
      "freeMemory": 2147483648,
      "cpus": 4,
      "loadAverage": [0.1, 0.2, 0.15]
    },
    "process": {
      "memoryUsage": {
        "rss": 134217728,
        "heapTotal": 67108864,
        "heapUsed": 33554432,
        "external": 1048576
      },
      "cpuUsage": {
        "user": 1000000,
        "system": 500000
      },
      "env": "production"
    }
  }
}
```

## GET /api/system/metrics

Get application performance metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "server": {
      "uptime": 86400,
      "memory": { /* Memory usage */ },
      "cpu": { /* CPU usage */ }
    },
    "system": {
      "loadAverage": [0.1, 0.2, 0.15],
      "freeMemory": 2147483648,
      "totalMemory": 8589934592,
      "cpuCount": 4
    },
    "queues": { /* Queue statistics */ },
    "cache": {
      "connected": true,
      "status": "operational"
    }
  }
}
```

## GET /api/system/logs/:type

Get application logs.

**Parameters:**
- `type` - `combined`, `error`, or `access`

**Query Parameters:**
- `lines` - Number of recent lines to return (default: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "combined",
    "totalLines": 1000,
    "returnedLines": 100,
    "logs": [
      {
        "level": "info",
        "message": "Server started on port 3000",
        "timestamp": "2024-01-15T10:00:00.000Z",
        "service": "resume-editor-ai"
      }
    ]
  }
}
```

## POST /api/system/cache/clear

Clear all application caches.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Cache clearing completed",
    "results": {
      "templates": "cleared",
      "pdf": "cleared", 
      "redis": "cleared"
    }
  }
}
```

## POST /api/system/gc

Force garbage collection (requires --expose-gc flag).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Garbage collection forced",
    "memoryBefore": { /* Memory usage before GC */ },
    "memoryAfter": { /* Memory usage after GC */ },
    "freed": {
      "rss": 10485760,
      "heapUsed": 5242880,
      "external": 1048576
    }
  }
}
```

---

# Utility Routes

## GET /api/health

Basic health check endpoint.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "2.0.0",
  "environment": "production"
}
```

## GET /api/version

Get application version and build information.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "resume-editor-ai",
    "version": "2.0.0",
    "description": "Production-ready AI-powered resume builder",
    "nodeVersion": "v18.17.0",
    "environment": "production",
    "uptime": 86400,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## GET /api/features

Get available features and system capabilities.

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": ["professional", "modern"],
    "aiFeatures": [
      "resume-parsing",
      "ats-scoring",
      "content-enhancement", 
      "keyword-optimization"
    ],
    "exportFormats": ["pdf", "latex"],
    "maxFileSize": "10MB",
    "supportedFormats": ["pdf"],
    "rateLimit": {
      "general": "100 requests per 15 minutes",
      "ai": "10 requests per minute",
      "pdf": "20 requests per 5 minutes"
    },
    "cache": {
      "templates": "5 minutes",
      "pdf": "10 minutes",
      "redis": "available"
    }
  }
}
```

---

# Usage Examples

## Complete Resume Building Workflow

### 1. Upload and Parse Resume
```bash
curl -X POST http://localhost:3000/api/ai/parse-resume \
  -F "resume=@john_doe_resume.pdf"
```

### 2. Generate LaTeX Template
```bash
curl -X POST http://localhost:3000/api/templates/generate \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "professional",
    "data": {
      "personalInfo": {
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    }
  }'
```

### 3. Calculate ATS Score
```bash
curl -X POST http://localhost:3000/api/ai/ats-score \
  -H "Content-Type: application/json" \
  -d '{
    "resumeData": { /* Complete resume data */ },
    "jobDescription": "Senior Software Engineer position..."
  }'
```

### 4. Enhance Content
```bash
curl -X POST http://localhost:3000/api/ai/enhance-section \
  -H "Content-Type: application/json" \
  -d '{
    "sectionData": "Experienced developer",
    "sectionType": "professionalSummary"
  }'
```

### 5. Generate Final PDF
```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "professional",
    "data": { /* Final resume data */ }
  }' \
  --output resume.pdf
```

## Error Handling Examples

### Validation Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "data.personalInfo.name",
      "message": "Name is required"
    },
    {
      "field": "data.personalInfo.email", 
      "message": "Valid email is required"
    }
  ]
}
```

### Rate Limit Error Response
```json
{
  "success": false,
  "error": "Too many AI requests, please wait before trying again.",
  "retryAfter": 60
}
```

### Service Unavailable Response
```json
{
  "success": false,
  "error": "PDF generation service is temporarily unavailable"
}
```

---

# Development Notes

## Environment Variables Required

```env
GEMINI_API_KEY=your_api_key_here
REDIS_URL=redis://localhost:6379
LATEX_ONLINE_URL=https://latexonline.cc/compile
```

## Running the Server

```bash
# Development
npm run dev

# Production with clustering
npm run cluster
```

## Testing API Endpoints

A Postman collection is available at `/docs/Resume_Editor_AI.postman_collection.json` with example requests for all endpoints.

---

This documentation is automatically updated with each API version. For the latest changes, check the Git repository or the `/api/version` endpoint.