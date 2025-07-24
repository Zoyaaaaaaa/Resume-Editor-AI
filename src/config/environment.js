const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // API Keys
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/resume_editor',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // External Services
  LATEX_ONLINE_URL: process.env.LATEX_ONLINE_URL || 'https://latexonline.cc/compile',
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'development_jwt_secret',
  SESSION_SECRET: process.env.SESSION_SECRET || 'development_session_secret',
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  // Queue Configuration
  QUEUE: {
    REDIS_HOST: process.env.QUEUE_REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.QUEUE_REDIS_PORT) || 6379,
    REDIS_DB: parseInt(process.env.QUEUE_REDIS_DB) || 1
  },

  // Validation
  validate() {
    const required = ['GEMINI_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};

module.exports = config;