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

    const formData = new FormData();
    formData.append('text', latexContent);
    formData.append('force', 'true');
    if (options.compiler) {
      formData.append('command', options.compiler);
    }

    logger.info('Making POST request to LaTeX-Online');

    const response = await axios.post(this.latexOnlineUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'User-Agent': 'Resume-Editor-AI/2.0'
      },
      responseType: 'arraybuffer',
      timeout: 60000,
      maxContentLength: 50 * 1024 * 1024,
      maxBodyLength: 50 * 1024 * 1024
    });

    if (response.status !== 200) {
      throw new Error(`LaTeX compilation service returned status ${response.status}`);
    }

    const buffer = Buffer.from(response.data);
    if (!this.isPDF(buffer)) {
      const errorText = buffer.toString('utf8');
      throw new Error(`LaTeX compilation failed: ${errorText}`);
    }

    return { pdf: buffer, size: buffer.length, contentType: 'application/pdf' };
  } catch (error) {
    // same error handling as before
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