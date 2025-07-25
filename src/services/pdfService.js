const axios = require('axios');
const FormData = require('form-data');
const config = require('../config/environment');
const logger = require('../utils/logger');

class PDFService {
  constructor() {
    this.latexOnlineUrl = config.LATEX_ONLINE_URL;
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes cache for PDFs
  }

  async compileToPDF(latexContent, options = {}) {
    try {
      logger.info('Starting PDF compilation');
      
      // Generate cache key
      const cacheKey = this.generateCacheKey(latexContent);
      
      // Check cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        logger.info('Returning cached PDF');
        return cached;
      }
      
      const result = await this.compileWithLatexOnline(latexContent, options);
      
      // Cache the result
      this.setCache(cacheKey, result);
      
      logger.info('PDF compilation completed successfully');
      return result;
      
    } catch (error) {
      logger.error('PDF compilation failed:', error);
      throw new Error(`PDF compilation failed: ${error.message}`);
    }
  }

  async compileWithLatexOnline(latexContent, options = {}) {
    try {
      const contentSizeKB = Math.round(Buffer.byteLength(latexContent, 'utf8') / 1024);
      logger.info(`LaTeX content size: ${contentSizeKB}KB`);
      
      // Check if content is too large for external service
      if (contentSizeKB > 50) {
        logger.warn(`⚠️  LaTeX content is ${contentSizeKB}KB, which may be too large for external service. Consider optimizing content.`);
      }
      
      logger.info('LaTeX content preview:', latexContent.substring(0, 200) + '...');
      
      // LaTeX-Online requires GET with properly encoded text parameter
      const params = new URLSearchParams();
      params.append('text', latexContent);
      params.append('force', 'true');
      
      // Add compilation options
      if (options.compiler) {
        params.append('command', options.compiler);
      }
      
      const requestUrl = `${this.latexOnlineUrl}?${params.toString()}`;
      logger.info('Request URL length:', requestUrl.length);
      logger.info('Making request to LaTeX-Online');
      
      // Make GET request to latex-online service
      const response = await axios.get(requestUrl, {
        headers: {
          'User-Agent': 'Resume-Editor-AI/2.0'
        },
        responseType: 'arraybuffer',
        timeout: 60000, // 60 seconds timeout for LaTeX compilation
        maxContentLength: 50 * 1024 * 1024, // 50MB max
        maxBodyLength: 50 * 1024 * 1024
      });

      logger.info('LaTeX-Online response status:', response.status);

      if (response.status !== 200) {
        throw new Error(`LaTeX compilation service returned status ${response.status}`);
      }

      // Check if response is actually a PDF
      const buffer = Buffer.from(response.data);
      if (!this.isPDF(buffer)) {
        // If it's not a PDF, it might be an error message
        const errorText = buffer.toString('utf8');
        throw new Error(`LaTeX compilation failed: ${errorText}`);
      }

      logger.info('PDF generated successfully, size:', buffer.length);
      return {
        pdf: buffer,
        size: buffer.length,
        contentType: 'application/pdf'
      };

    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new Error('LaTeX compilation service is unavailable. Please try again later.');
      }
      
      if (error.response?.status === 414) {
        // 414 Request-URI Too Large - this is our main issue
        const contentSizeKB = Math.round(Buffer.byteLength(latexContent, 'utf8') / 1024);
        logger.error(`⚠️  PDF generation failed: Content too large (${contentSizeKB}KB). This usually happens with AI-enhanced resumes that have excessive bold formatting.`);
        throw new Error(`Resume content is too large for PDF generation (${contentSizeKB}KB). Please try reducing the amount of formatting or content, or use a simpler template.`);
      }
      
      if (error.response?.status === 400) {
        // 400 errors from LaTeX-Online usually contain compilation errors
        const errorData = error.response.data;
        const errorText = Buffer.isBuffer(errorData) ? errorData.toString('utf8') : errorData;
        logger.error('LaTeX compilation error (400):', errorText);
        throw new Error(`LaTeX compilation failed: ${errorText}`);
      }
      
      logger.error('LaTeX-Online compilation error:', error);
      logger.error('Error response status:', error.response?.status);
      logger.error('Error response data:', error.response?.data);
      throw error;
    }
  }

  isPDF(buffer) {
    // Check PDF magic number
    return buffer.length >= 4 && buffer.toString('ascii', 0, 4) === '%PDF';
  }

  generateCacheKey(latexContent) {
    const hash = require('crypto').createHash('md5').update(latexContent).digest('hex');
    return `pdf_${hash}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    // Remove expired cache
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  setCache(key, data) {
    // Only cache if PDF is not too large (limit to 5MB)
    if (data.pdf && data.pdf.length <= 5 * 1024 * 1024) {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      
      // Clean old cache entries periodically
      if (this.cache.size > 50) {
        this.cleanOldCache();
      }
    }
  }

  cleanOldCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  clearCache() {
    this.cache.clear();
    logger.info('PDF cache cleared');
  }

  async getCompilationStatus() {
    try {
      // Simple health check for the LaTeX service
      const response = await axios.get(this.latexOnlineUrl.replace('/compile', '/health'), {
        timeout: 5000
      });
      
      return {
        available: response.status === 200,
        url: this.latexOnlineUrl
      };
    } catch (error) {
      return {
        available: false,
        url: this.latexOnlineUrl,
        error: error.message
      };
    }
  }

}

module.exports = new PDFService();