# 🚀 Resume Editor AI

[![Node.js](https://img.shields.io/badge/Node.js-18.17+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)]()

A comprehensive, production-ready AI-powered resume builder that combines intelligent content analysis, professional template generation, and ATS optimization. Built with Node.js, Express, and integrated with Google Gemini AI for advanced resume processing capabilities.

## ✨ Features

### 🤖 AI-Powered Functionality
- **Smart Resume Parsing**: Extract structured data from PDF resumes using Google Gemini AI
- **ATS Score Calculation**: Comprehensive Applicant Tracking System compatibility analysis
- **Content Enhancement**: AI-driven improvement of resume sections for better impact
- **Keyword Optimization**: Intelligent keyword suggestions based on job descriptions

### 📄 Professional Templates
- **Multiple Templates**: Professional and Modern layouts optimized for different industries
- **LaTeX Generation**: High-quality PDF output using LaTeX compilation
- **Cross-Browser PDF Preview**: Intelligent PDF display with browser compatibility fallbacks
- **Custom Styling**: Responsive design with professional typography

### ⚡ Performance & Scalability
- **Queue Management**: Background job processing with Bull.js and Redis
- **Intelligent Caching**: Multi-layer caching for templates and PDF generation
- **Rate Limiting**: Tiered rate limiting for different operation types
- **Clustering Support**: Multi-core processing with PM2 ecosystem

### 🔒 Enterprise Features
- **Health Monitoring**: Comprehensive system health checks and metrics
- **Error Handling**: Robust error handling with detailed logging
- **Input Validation**: Secure input validation and sanitization
- **LaTeX Security**: Special character escaping for safe PDF generation

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (HTML/CSS/JS)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  Express API Gateway                       │
│              (Rate Limiting, CORS, Security)               │
└─────┬─────────────┬─────────────┬─────────────┬─────────────┘
      │             │             │             │
┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
│ Template  │ │    AI     │ │    PDF    │ │  System   │
│ Service   │ │  Service  │ │  Service  │ │ Monitor   │
└─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
      │             │             │             │
┌─────▼─────────────▼─────────────▼─────────────▼─────┐
│              Redis Cache & Queue System             │
└─────────────────────────────────────────────────────┘
      │                       │
┌─────▼─────┐           ┌─────▼─────┐
│ LaTeX     │           │ Google    │
│ Online    │           │ Gemini    │
│ Service   │           │    AI     │
└───────────┘           └───────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.17+ 
- **npm** 8.0+
- **Redis** 6.0+ (optional but recommended)
- **Google Gemini API Key**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resume-editor-ai.git
   cd resume-editor-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start

   # Production with clustering
   npm run cluster
   ```

5. **Access the application**
   - **Frontend**: http://localhost:3000
   - **API**: http://localhost:3000/api
   - **Health Check**: http://localhost:3000/api/health

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following configuration:

```env
# === Core Configuration ===
NODE_ENV=production                    # development | production | test
PORT=3000                             # Server port

# === API Keys (REQUIRED) ===
GEMINI_API_KEY=your_google_gemini_api_key_here

# === External Services ===
LATEX_ONLINE_URL=https://latexonline.cc/compile

# === Database (Optional) ===
MONGODB_URI=mongodb://localhost:27017/resume_editor

# === Redis Configuration (Optional but Recommended) ===
REDIS_URL=redis://localhost:6379
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_DB=1

# === Security ===
JWT_SECRET=your_jwt_secret_for_future_auth
SESSION_SECRET=your_session_secret

# === Rate Limiting ===
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100          # Max requests per window
```

### Service Dependencies

#### Required Services
- **Google Gemini AI**: For resume parsing and content enhancement
  - Get API key: [Google AI Studio](https://makersuite.google.com/app/apikey)
  - Cost: Pay-per-use model
  
#### Recommended Services  
- **Redis**: For caching and queue management
  - Installation: `brew install redis` (macOS) or `sudo apt install redis` (Ubuntu)
  - Alternative: Use Redis Cloud for production

#### Optional Services
- **MongoDB**: For data persistence (future enhancement)
- **PM2**: For production process management

---

## 📁 Project Structure

```
resume-editor-ai/
├── 📁 public/                 # Frontend assets
│   ├── 📁 css/               # Stylesheets
│   │   └── styles.css        # Main application styles
│   ├── 📁 js/                # JavaScript
│   │   └── app.js           # Frontend application logic
│   └── index.html           # Main HTML page
├── 📁 src/                   # Backend source code
│   ├── 📁 config/           # Configuration modules
│   │   ├── environment.js   # Environment variable handling
│   │   ├── queue.js        # Queue system configuration
│   │   └── redis.js        # Redis connection setup
│   ├── 📁 controllers/      # Route handlers
│   │   ├── aiController.js  # AI service endpoints
│   │   ├── pdfController.js # PDF generation endpoints
│   │   └── templateController.js # Template management
│   ├── 📁 middleware/       # Express middleware
│   │   └── rateLimiter.js  # Rate limiting implementation
│   ├── 📁 routes/          # Route definitions
│   │   ├── api.js          # Main API routes
│   │   ├── queue.js        # Queue management routes
│   │   └── system.js       # System monitoring routes
│   ├── 📁 services/        # Business logic
│   │   ├── aiService.js    # Google Gemini AI integration
│   │   ├── pdfService.js   # LaTeX PDF compilation
│   │   └── templateService.js # Template processing
│   ├── 📁 templates/       # LaTeX templates
│   │   ├── index.js        # Template registry
│   │   ├── professional.js # Professional template
│   │   └── modern.js       # Modern template
│   ├── 📁 utils/           # Utility functions
│   │   └── logger.js       # Winston logging setup
│   └── app.js              # Express application entry point
├── 📁 docs/                # Documentation
│   ├── API_DOCUMENTATION.md # Comprehensive API docs
│   └── ROUTES_OVERVIEW.md   # Quick route reference
├── 📁 logs/                # Application logs
├── .env.example            # Environment template
├── .gitignore             # Git ignore rules
├── ecosystem.config.js    # PM2 configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

### Key Files Explained

#### Frontend (`/public/`)
- **`index.html`**: Single-page application with form sections and PDF preview
- **`css/styles.css`**: Responsive CSS with professional styling and PDF viewer
- **`js/app.js`**: ResumeEditorApp class handling UI interactions and API calls

#### Backend Services (`/src/services/`)
- **`aiService.js`**: Google Gemini AI integration for parsing and enhancement
- **`pdfService.js`**: LaTeX-Online service integration with caching
- **`templateService.js`**: Template management and LaTeX generation

#### Templates (`/src/templates/`)
- **`professional.js`**: Clean, traditional corporate template
- **`modern.js`**: Contemporary design with colors and icons
- **LaTeX Security**: All templates include special character escaping

#### Configuration (`/src/config/`)
- **`environment.js`**: Centralized environment variable management
- **`queue.js`**: Bull.js queue configuration for background jobs
- **`redis.js`**: Redis connection with fallback handling

---

## 🎯 Usage Guide

### Basic Resume Building Workflow

1. **Upload Resume** (Optional)
   - Drag and drop PDF resume
   - AI extracts and structures data automatically

2. **Fill/Edit Information**
   - Personal information
   - Professional summary
   - Work experience
   - Education details
   - Skills and certifications

3. **AI Enhancement** (Optional)
   - Click "Enhance with AI" on any section
   - Get ATS score and recommendations
   - Apply AI-suggested improvements

4. **Generate PDF**
   - Choose template (Professional/Modern)
   - Real-time preview updates
   - Download high-quality PDF

### API Integration

```javascript
// Example: Parse uploaded resume
const formData = new FormData();
formData.append('resume', pdfFile);

const response = await fetch('/api/ai/parse-resume', {
  method: 'POST',
  body: formData
});

const data = await response.json();
if (data.success) {
  console.log('Parsed resume data:', data.data.parsed);
}
```

```javascript
// Example: Generate PDF
const response = await fetch('/api/pdf/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateName: 'professional',
    data: resumeData
  })
});

const pdfBlob = await response.blob();
const url = URL.createObjectURL(pdfBlob);
```

---

## 🛠️ Development

### Development Scripts

```bash
# Start development server with hot reload
npm run dev

# Run linting
npm run lint

# Run tests (when implemented)
npm test

# Start production server
npm start

# Start with PM2 clustering
npm run cluster

# Check application health
npm run health-check
```

### Development Workflow

1. **Setup Development Environment**
   ```bash
   npm install
   cp .env.example .env
   # Configure your .env file
   npm run dev
   ```

2. **Make Changes**
   - Backend changes: Automatic restart with nodemon
   - Frontend changes: Refresh browser
   - Template changes: Clear cache via API

3. **Testing**
   ```bash
   # Test API endpoints
   curl http://localhost:3000/api/health
   
   # Test with sample data
   curl -X POST http://localhost:3000/api/templates/validate \
     -H "Content-Type: application/json" \
     -d '{"data": {"personalInfo": {"name": "Test User"}}}'
   ```

### Adding New Templates

1. **Create Template File**
   ```javascript
   // src/templates/your-template.js
   function generateYourTemplate(data) {
     // LaTeX generation logic with escapeLatex function
     return latexContent;
   }
   module.exports = { generateYourTemplate };
   ```

2. **Register Template**
   ```javascript
   // src/templates/index.js
   const { generateYourTemplate } = require('./your-template');
   
   const templates = {
     'your-template': generateYourTemplate,
     // ... existing templates
   };
   ```

3. **Update Frontend**
   ```html
   <!-- public/index.html -->
   <option value="your-template">Your Template</option>
   ```

### Adding New AI Features

1. **Extend AI Service**
   ```javascript
   // src/services/aiService.js
   async yourNewFeature(inputData) {
     const prompt = this.generateYourPrompt(inputData);
     return await this.callGeminiAPI(prompt);
   }
   ```

2. **Create Controller Endpoint**
   ```javascript
   // src/controllers/aiController.js
   exports.yourNewFeature = async (req, res) => {
     try {
       const result = await aiService.yourNewFeature(req.body);
       res.json({ success: true, data: result });
     } catch (error) {
       res.status(500).json({ success: false, error: error.message });
     }
   };
   ```

3. **Add Route**
   ```javascript
   // src/routes/api.js
   router.post('/ai/your-feature', aiController.yourNewFeature);
   ```

---

## 🚀 Production Deployment

### PM2 Deployment (Recommended)

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Configure Ecosystem**
   ```javascript
   // ecosystem.config.js (already included)
   module.exports = {
     apps: [{
       name: 'resume-editor-ai',
       script: 'src/app.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'development'
       },
       env_production: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

3. **Deploy**
   ```bash
   # Start production cluster
   pm2 start ecosystem.config.js --env production
   
   # Monitor processes
   pm2 monit
   
   # View logs
   pm2 logs
   
   # Restart all instances
   pm2 restart all
   ```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t resume-editor-ai .
docker run -p 3000:3000 --env-file .env resume-editor-ai
```

---

## 📊 Monitoring & Maintenance

### Health Monitoring

```bash
# Basic health check
curl http://localhost:3000/api/health

# Comprehensive system health
curl http://localhost:3000/api/system/health

# Service-specific status
curl http://localhost:3000/api/ai/status
curl http://localhost:3000/api/pdf/status
```

### Performance Monitoring

```bash
# System metrics
curl http://localhost:3000/api/system/metrics

# Queue statistics
curl http://localhost:3000/api/queue/stats

# Application logs
curl http://localhost:3000/api/system/logs/combined?lines=100
```

### Cache Management

```bash
# Clear all caches
curl -X POST http://localhost:3000/api/system/cache/clear

# Clear specific caches
curl -X DELETE http://localhost:3000/api/templates/cache
curl -X DELETE http://localhost:3000/api/pdf/cache
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. PDF Generation Fails
```
Error: LaTeX compilation failed
```
**Solutions:**
- Check LaTeX-Online service status: `GET /api/pdf/status`
- Verify internet connectivity
- Check for special characters in resume content (now auto-escaped)
- Clear PDF cache: `DELETE /api/pdf/cache`

#### 2. AI Service Unavailable
```
Error: AI service authentication failed
```
**Solutions:**
- Verify `GEMINI_API_KEY` in environment variables
- Check API key validity at Google AI Studio
- Monitor rate limits: `GET /api/ai/status`
- Check network connectivity to Google services

#### 3. Redis Connection Issues
```
Error: Redis connection failed
```
**Solutions:**
- Ensure Redis is running: `redis-cli ping`
- Check `REDIS_URL` configuration
- Application will work without Redis (degraded performance)
- Use Redis Cloud for production deployment

#### 4. Rate Limiting Issues
```
Error: Too many requests
```
**Solutions:**
- Check rate limit headers in response
- Implement exponential backoff in client
- Adjust rate limits in configuration
- Use queue system for batch operations

---

## 📖 API Documentation

For complete API documentation with request/response examples:
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Comprehensive API reference
- **[Routes Overview](./docs/ROUTES_OVERVIEW.md)** - Quick route reference

### Quick API Examples

```bash
# Parse resume from PDF
curl -X POST http://localhost:3000/api/ai/parse-resume \
  -F "resume=@resume.pdf"

# Generate PDF
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"templateName": "professional", "data": {...}}' \
  --output resume.pdf

# Get ATS score
curl -X POST http://localhost:3000/api/ai/ats-score \
  -H "Content-Type: application/json" \
  -d '{"resumeData": {...}, "jobDescription": "..."}'
```

---

## 🛡️ Security

### Input Validation
- All file uploads validated and limited to 10MB
- LaTeX content sanitized for special characters
- Express-validator for request validation

### Rate Limiting
- IP-based rate limiting with different tiers
- AI operations: 10 requests/minute
- PDF generation: 20 requests/5 minutes
- General API: 100 requests/15 minutes

### Environment Security
- API keys stored in environment variables
- No sensitive data in logs or error messages
- CORS configured for production domains

---

## 📊 Performance

### Optimization Features
- **Caching**: Redis-backed template and PDF caching
- **Compression**: Gzip response compression
- **Clustering**: Multi-core utilization with PM2
- **Queue System**: Background processing for heavy operations

### Benchmarks
- **PDF Generation**: ~2-5 seconds (depending on content size)
- **AI Parsing**: ~3-10 seconds (depending on resume complexity)
- **Template Rendering**: ~100-500ms (with caching)
- **API Response**: ~50-200ms (cached responses)

---

## 🤝 Contributing

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/resume-editor-ai.git
   cd resume-editor-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   # Configure your development environment
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

### Code Style

- **ESLint**: Follow the included ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Comments**: Document complex functions and business logic
- **Error Handling**: Always implement proper error handling

### Pull Request Process

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes with proper commit messages
3. Add tests for new functionality
4. Update documentation as needed
5. Submit pull request with detailed description

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced natural language processing
- **LaTeX-Online** for reliable PDF compilation service
- **Bull.js** for robust queue management
- **Express.js** ecosystem for web framework
- **Redis** for high-performance caching

---

## 📞 Support

### Documentation
- **[API Documentation](./docs/API_DOCUMENTATION.md)**
- **[Routes Overview](./docs/ROUTES_OVERVIEW.md)**

### Health Checks
- **Application**: http://localhost:3000/api/health
- **System**: http://localhost:3000/api/system/health

### Issues
For bug reports, feature requests, or support:
1. Check existing issues in the repository
2. Create a detailed issue with steps to reproduce
3. Include environment information and logs

---

## 🗺️ Roadmap

### Upcoming Features
- [ ] **User Authentication**: JWT-based user accounts
- [ ] **Template Builder**: Visual template customization
- [ ] **Batch Processing**: Multiple resume processing
- [ ] **Analytics Dashboard**: Usage statistics and metrics
- [ ] **Integration APIs**: Third-party service integrations
- [ ] **Mobile App**: React Native mobile application

### Planned Improvements
- [ ] **Database Integration**: PostgreSQL for data persistence
- [ ] **Real-time Updates**: WebSocket for live collaboration
- [ ] **Advanced AI**: Custom model training for industry-specific optimization
- [ ] **Internationalization**: Multi-language support
- [ ] **Accessibility**: WCAG 2.1 compliance
- [ ] **API Versioning**: Backward-compatible API versions

---

**Built with ❤️ for developers, by developers**

*Making professional resume building accessible, intelligent, and efficient.*