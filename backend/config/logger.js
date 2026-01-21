const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Ensure logs directory exists
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Custom format to filter logs by type
const filterByType = (type) =>
  winston.format((info) => {
    return info.type === type ? info : false;
  })();

// Log level configuration
const getLogLevel = () => {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

const logger = winston.createLogger({
  level: getLogLevel(),
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // All logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: getLogLevel(),
    }),

    // Errors only
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      level: 'error',
    }),

    // Database operations
    new DailyRotateFile({
      filename: path.join(logsDir, 'database-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'info',
      format: winston.format.combine(
        filterByType('database'),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.json()
      ),
    }),

    // Authentication logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'auth-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      level: 'info',
      format: winston.format.combine(
        filterByType('auth'),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.json()
      ),
    }),

    // Security events
    new DailyRotateFile({
      filename: path.join(logsDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '90d', // Keep security logs longer
      level: 'warn',
      format: winston.format.combine(
        filterByType('security'),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.json()
      ),
    }),

    // Performance logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d',
      level: 'info',
      format: winston.format.combine(
        filterByType('performance'),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.json()
      ),
    }),
  ],
});

// Console logging for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, type, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}] ${type ? `[${type}] ` : ''}${message} ${metaStr}`;
        })
      ),
    })
  );
}

module.exports = logger;
