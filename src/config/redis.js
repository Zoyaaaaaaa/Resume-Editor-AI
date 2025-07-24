const redis = require('redis');
const config = require('./environment');
const logger = require('../utils/logger');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Check if Redis URL is configured
      if (!config.REDIS_URL || config.REDIS_URL === 'redis://localhost:6379') {
        logger.info('Redis not configured or using default localhost - skipping Redis connection');
        this.isConnected = false;
        return;
      }

      this.client = redis.createClient({
        url: config.REDIS_URL,
        socket: {
          connectTimeout: 5000,
          lazyConnect: true
        },
        // Disable automatic retries for initial connection
        retryDelayOnFailover: 0,
        enableAutoPipelining: true
      });

      // Set up minimal error handling
      this.client.on('error', (err) => {
        logger.warn('Redis connection issue - continuing without cache:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        logger.info('Redis client disconnected');
        this.isConnected = false;
      });

      // Try to connect with timeout
      const connectPromise = this.client.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      );

      await Promise.race([connectPromise, timeoutPromise]);
      logger.info('Redis connection established');
      
    } catch (error) {
      logger.info('Redis unavailable - running without cache:', error.message);
      this.isConnected = false;
      // Clean up client if it was created
      if (this.client) {
        try {
          this.client.removeAllListeners();
          this.client = null;
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }
    }
  }

  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.disconnect();
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }

  async get(key) {
    try {
      if (!this.isConnected || !this.client) {
        return null;
      }
      
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
      
    } catch (error) {
      logger.error(`Error getting key ${key} from Redis:`, error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }
      
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttlSeconds, serialized);
      return true;
      
    } catch (error) {
      logger.error(`Error setting key ${key} in Redis:`, error);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }
      
      await this.client.del(key);
      return true;
      
    } catch (error) {
      logger.error(`Error deleting key ${key} from Redis:`, error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }
      
      const exists = await this.client.exists(key);
      return exists === 1;
      
    } catch (error) {
      logger.error(`Error checking key ${key} existence in Redis:`, error);
      return false;
    }
  }

  async flushAll() {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }
      
      await this.client.flushAll();
      logger.info('Redis cache cleared');
      return true;
      
    } catch (error) {
      logger.error('Error flushing Redis cache:', error);
      return false;
    }
  }

  async getStatus() {
    try {
      if (!this.client) {
        return { connected: false, error: 'Client not initialized' };
      }
      
      if (!this.isConnected) {
        return { connected: false, error: 'Not connected' };
      }
      
      // Test connection with ping
      const pong = await this.client.ping();
      
      return {
        connected: true,
        response: pong,
        url: config.REDIS_URL
      };
      
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // Cache wrapper functions for common patterns
  async cacheWrapper(key, fetchFunction, ttlSeconds = 3600) {
    try {
      // Try to get from cache first
      const cached = await this.get(key);
      if (cached !== null) {
        logger.debug(`Cache hit for key: ${key}`);
        return cached;
      }
      
      // Cache miss - fetch data
      logger.debug(`Cache miss for key: ${key}`);
      const data = await fetchFunction();
      
      // Store in cache
      await this.set(key, data, ttlSeconds);
      
      return data;
      
    } catch (error) {
      logger.error(`Cache wrapper error for key ${key}:`, error);
      // If cache fails, still return the fetched data
      return await fetchFunction();
    }
  }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;