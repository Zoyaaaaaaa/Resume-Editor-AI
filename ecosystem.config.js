module.exports = {
  apps: [
    {
      name: 'resume-editor-ai',
      script: 'src/app.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      // Performance optimizations
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      
      // Logging
      log_file: 'logs/combined.log',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto-restart configuration
      min_uptime: '10s',
      max_restarts: 10,
      
      // Health checks
      health_check_grace_period: 3000,
      
      // Environment-specific settings
      node_args: '--max-old-space-size=2048'
    }
  ]
};