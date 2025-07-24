# Resume Editor AI - Routes Overview

## Quick Reference

This document provides a concise overview of all available API routes organized by functionality. For detailed documentation with request/response examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

**Base URL:** `http://localhost:3000/api`

## 📁 Route Categories

### 🎨 Template Management
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `GET` | `/api/templates` | List all available templates | General |
| `GET` | `/api/templates/:name/preview` | Get template preview info | General |
| `POST` | `/api/templates/generate` | Generate LaTeX from template | General |
| `POST` | `/api/templates/validate` | Validate resume data | General |
| `DELETE` | `/api/templates/cache` | Clear template cache | General |

### 📄 PDF Operations
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/pdf/generate` | Generate PDF from template+data | PDF (20/5min) |
| `POST` | `/api/pdf/compile` | Compile LaTeX to PDF | PDF (20/5min) |
| `GET` | `/api/pdf/status` | Check PDF service status | General |
| `DELETE` | `/api/pdf/cache` | Clear PDF cache | General |

### 🤖 AI Services
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/ai/parse-resume` | Parse uploaded PDF resume | AI (10/min) |
| `POST` | `/api/ai/parse-text` | Parse text resume | AI (10/min) |
| `POST` | `/api/ai/ats-score` | Calculate ATS score | AI (10/min) |
| `POST` | `/api/ai/enhance-section` | Enhance resume section | AI (10/min) |
| `POST` | `/api/ai/bulk-enhance` | Bulk section enhancement | AI (10/min) |
| `GET` | `/api/ai/status` | Check AI service status | General |
| `GET` | `/api/ai/usage` | Get AI usage stats | General |

### ⚙️ Queue Management
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `GET` | `/api/queue/stats` | Get queue statistics | General |
| `GET` | `/api/queue/job/:type/:id` | Get job status | General |
| `GET` | `/api/queue/:type/active` | Get active jobs | General |
| `POST` | `/api/queue/:type/:action` | Pause/resume queue | General |
| `POST` | `/api/queue/clean` | Clean old jobs | General |

### 🔍 System Monitoring
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `GET` | `/api/system/health` | Comprehensive health check | General |
| `GET` | `/api/system/info` | System information | General |
| `GET` | `/api/system/metrics` | Performance metrics | General |
| `GET` | `/api/system/logs/:type` | Application logs | General |
| `POST` | `/api/system/cache/clear` | Clear all caches | General |
| `POST` | `/api/system/gc` | Force garbage collection | General |

### 🔧 Utility Routes
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `GET` | `/api/health` | Basic health check | General |
| `GET` | `/api/version` | Application version | General |
| `GET` | `/api/features` | Available features | General |

---

## 📊 Response Patterns

### Success Response
```json
{
  "success": true,
  "data": { /* Response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Validation errors (optional)
}
```

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345678
```

---

## 🚀 Common Workflows

### 1. Resume Upload & Processing
```
POST /api/ai/parse-resume
  ↓
POST /api/ai/ats-score
  ↓
POST /api/ai/enhance-section (multiple calls)
  ↓
POST /api/pdf/generate
```

### 2. Manual Resume Building
```
POST /api/templates/validate
  ↓
POST /api/templates/generate
  ↓
POST /api/pdf/compile
```

### 3. System Health Check
```
GET /api/health
  ↓
GET /api/system/health
  ↓
GET /api/queue/stats
```

---

## 🔐 Security Features

- **Rate Limiting**: Multiple tiers (General, AI, PDF)
- **Input Validation**: Express-validator for all inputs
- **File Upload**: Multer with 10MB limit, PDF only
- **CORS**: Configurable cross-origin policies
- **Helmet**: Security headers protection

---

## 📈 Performance Features

- **Caching**: Redis-backed template and PDF caching
- **Queue System**: Bull.js for heavy AI operations
- **Clustering**: PM2 for multi-core utilization
- **Compression**: Gzip response compression
- **Monitoring**: Winston logging with rotation

---

## 🏗️ Architecture Overview

```
Frontend (React/HTML)
         ↓
    API Gateway
         ↓
┌────────┬────────┬────────┐
│Template│   AI   │  PDF   │
│Service │Service │Service │
└────────┴────────┴────────┘
         ↓
┌────────┬────────┐
│ Redis  │ Queue  │
│ Cache  │System  │
└────────┴────────┘
```

---

## 📝 Data Models

### Resume Data Structure
```json
{
  "personalInfo": {
    "name": "string*",
    "email": "email*", 
    "phone": "string",
    "location": "string",
    "linkedin": "url",
    "website": "url"
  },
  "professionalSummary": "string",
  "experience": [{
    "position": "string",
    "company": "string",
    "location": "string", 
    "dates": "string",
    "details": "string"
  }],
  "education": [{
    "institution": "string",
    "degree": "string",
    "dates": "string",
    "gpa": "string"
  }],
  "projects": [{
    "name": "string",
    "type": "string",
    "dates": "string", 
    "details": "string"
  }],
  "skills": {
    "category": "string"
  },
  "certifications": ["string"],
  "positions": ["string"],
  "interests": "string"
}
```

### ATS Score Response
```json
{
  "score": 85,
  "maxScore": 100,
  "feedback": {
    "strengths": ["string"],
    "improvements": ["string"],
    "keywords": {
      "found": ["string"],
      "missing": ["string"], 
      "suggestions": ["string"]
    },
    "formatting": {
      "score": 90,
      "issues": ["string"]
    },
    "content": {
      "score": 80,
      "feedback": "string"
    }
  },
  "recommendations": ["string"]
}
```

---

## 🔧 Development Setup

### Environment Variables
```env
NODE_ENV=development
PORT=3000
GEMINI_API_KEY=your_key_here
REDIS_URL=redis://localhost:6379
LATEX_ONLINE_URL=https://latexonline.cc/compile
```

### Start Commands
```bash
# Development
npm run dev

# Production with clustering  
npm run cluster

# Health check
curl http://localhost:3000/api/health
```

---

## 🐛 Error Codes Reference

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input/validation failed |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 501 | Not Implemented | Feature not available |
| 503 | Service Unavailable | External service down |

---

## 📞 Support

For detailed API documentation, see `API_DOCUMENTATION.md`.

For implementation examples, check the frontend code in `/public/js/app.js`.

For production deployment, see `README.md`.