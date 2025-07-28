# Resume Editor AI

A powerful, AI-enhanced resume editor with real-time PDF preview, built with vanilla JavaScript and Node.js.

## Features

- **Split-Screen Interface**: Form-based editor on the left, live PDF preview on the right
- **AI-Powered Enhancements**: Improve resume content using Google Gemini AI
- **Resume Upload & Parsing**: Upload existing resumes (PDF/Word) and extract data automatically
- **Dynamic Sections**: Add/remove experience, projects, education, and extracurricular activities
- **Text Formatting**: Bold, italic, and bullet point formatting support
- **ATS Optimization**: AI-powered suggestions for better Applicant Tracking System scores
- **PDF Download**: Generate and download professional PDFs
- **Auto-Save**: Automatic saving of form data to local storage
- **Professional Templates**: Clean, professional resume templates

## Tech Stack

### Frontend
- **HTML5**: Semantic markup with accessible form elements
- **CSS3**: Modern styling with Flexbox/Grid layout
- **Vanilla JavaScript**: No framework dependencies, lightweight and fast
- **Font Awesome**: Icons for enhanced UI

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **Puppeteer**: PDF generation
- **Multer**: File upload handling
- **Google Gemini 1.5 Flash**: Content enhancement and resume parsing

### Additional Libraries
- **pdf-parse**: PDF text extraction
- **mammoth**: Word document parsing
- **helmet**: Security middleware
- **cors**: Cross-origin resource sharing
- **express-rate-limit**: API rate limiting

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resume-editor-ai/html\ pdf
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure Gemini AI** (optional but recommended)
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add it to your `.env` file:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## Usage

### Basic Resume Creation

1. **Personal Information**: Fill in your basic details (name, email, phone, location)
2. **Areas of Interest**: Add your skills or areas of expertise
3. **Experience**: Add your work experience with descriptions
4. **Projects**: Include relevant projects with technologies used
5. **Education**: Add your educational background
6. **Extra-curricular**: Include activities, volunteering, etc.

### AI Enhancement

1. Click the **"AI Enhance"** button in any section
2. The AI will analyze and improve your content for:
   - Better ATS compatibility
   - More impactful language
   - Industry-relevant keywords
   - Professional formatting

### Resume Upload

1. Click **"Upload Resume"** in the header
2. Select a PDF or Word document
3. The AI will parse and populate the form automatically
4. Review and edit the extracted information

### PDF Download

1. Fill out your resume information
2. Preview updates in real-time on the right panel
3. Click **"Download PDF"** when ready
4. Get a professionally formatted PDF

## API Endpoints

### Resume Operations
- `POST /api/parse-resume` - Upload and parse resume files
- `POST /api/generate-pdf` - Generate PDF from form data
- `GET /api/templates` - Get available resume templates

### AI Enhancement
- `POST /api/enhance` - Enhance resume content with AI
- `POST /api/ats-score` - Analyze ATS compatibility score
- `POST /api/extract-keywords` - Extract keywords from job descriptions
- `POST /api/suggest-content` - Get AI content suggestions

### System
- `GET /api/health` - Health check endpoint
- `GET /api/version` - Get application version and features

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `GEMINI_API_KEY` | Google Gemini AI API key | - |
| `MAX_FILE_SIZE` | Maximum upload file size (bytes) | 10485760 |
| `RATE_LIMIT_MAX` | API rate limit per window | 100 |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | 900000 |

### File Upload Limits

- **Maximum file size**: 10MB
- **Supported formats**: PDF, DOC, DOCX
- **Processing timeout**: 30 seconds

## Development

### Project Structure

```
html pdf/
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   ├── app.js              # Main application logic
│   ├── formHandler.js      # Form management
│   └── pdfPreview.js       # PDF preview functionality
├── server/
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   └── utils/              # Utility functions
├── index.html              # Main HTML file
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (placeholder)

### Adding New Features

1. **Frontend**: Add UI components to HTML, style with CSS, implement logic in JS
2. **Backend**: Create new routes in `server/routes/`, add services in `server/services/`
3. **AI Integration**: Extend `aiService.js` for new AI features

## Deployment

### Production Setup

1. Set environment to production:
   ```bash
   NODE_ENV=production
   ```

2. Configure security settings:
   ```bash
   CORS_ORIGIN=https://yourdomain.com
   ```

3. Install only production dependencies:
   ```bash
   npm ci --production
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin policies
- **Rate Limiting**: API abuse prevention
- **File Validation**: Upload type and size restrictions
- **Input Sanitization**: XSS prevention
- **Secure File Handling**: Temporary file cleanup

## Browser Support

- **Chrome**: 90+ ✅
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

**AI features not working**
- Ensure `GEMINI_API_KEY` is set in `.env`
- Check API key validity and quotas

**PDF generation fails**
- Verify Puppeteer installation
- Check available system memory
- Review PDF timeout settings

**File upload issues**
- Verify file size limits
- Check supported file types
- Ensure temp directory permissions

**Preview not updating**
- Check browser console for JavaScript errors
- Verify form data is being captured
- Test with different browsers

### Debug Mode

Enable debug logging:
```bash
DEBUG=true npm run dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.

---

**Built with ❤️ for job seekers everywhere**