const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const config = require('./config/environment');
const logger = require('./utils/logger');
const { generalLimiter } = require('./middleware/rateLimiter');
const apiRoutes = require('./routes/api');
const redisService = require('./config/redis');

// Validate environment variables
try {
  config.validate();
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'", "blob:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: config.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with actual production domain
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Rate limiting
app.use(generalLimiter);

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API routes
app.use('/api', apiRoutes);

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - ${req.method} ${req.path} - ${req.ip}`);
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  // Don't leak error details in production
  const message = config.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: message
  });
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    await redisService.disconnect();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  try {
    await redisService.disconnect();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
  
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Connect to Redis (optional - app will work without it)
    await redisService.connect();
    
    const server = app.listen(config.PORT, () => {
      logger.info(`Resume Editor AI server running on port ${config.PORT}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${config.PORT}/api/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.PORT} is already in use`);
        process.exit(1);
      } else {
        logger.error('Server error:', error);
      }
    });

    return server;
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;