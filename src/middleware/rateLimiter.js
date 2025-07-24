const rateLimit = require('express-rate-limit');
const config = require('../config/environment');
const logger = require('../utils/logger');

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.RATE_LIMIT.WINDOW_MS / 1000)
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(config.RATE_LIMIT.WINDOW_MS / 1000)
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiter for AI operations (more restrictive)
const aiLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: {
    error: 'Too many AI requests, please wait before trying again.',
    retryAfter: 60
  },
  handler: (req, res) => {
    logger.warn(`AI rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many AI requests, please wait before trying again.',
      retryAfter: 60
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

// PDF generation rate limiter
const pdfLimiter = rateLimit({
  windowMs: 300000, // 5 minutes
  max: 20, // 20 PDF generations per 5 minutes
  message: {
    error: 'Too many PDF generation requests, please wait before trying again.',
    retryAfter: 300
  },
  handler: (req, res) => {
    logger.warn(`PDF rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many PDF generation requests, please wait before trying again.',
      retryAfter: 300
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  aiLimiter,
  pdfLimiter
};