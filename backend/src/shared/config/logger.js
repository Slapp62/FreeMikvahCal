/**
 * Winston Logger Configuration for FreeMikvahCal Backend
 *
 * This logger uses a type-based filtering system to route logs to specific files.
 * Each log can include a 'type' field that determines which specialized log file it goes to.
 *
 * AVAILABLE LOG TYPES:
 * - 'database' - Database operations (connections, queries, migrations)
 * - 'auth' - Authentication events (login, logout, registration, OAuth)
 * - 'security' - Security events (failed logins, suspicious activity, rate limiting)
 * - 'performance' - Performance metrics (slow operations, timing data)
 * - 'error' - Error events (automatically set for error-level logs)
 *
 * LOG FILES AND RETENTION:
 * - application-*.log - All logs (14 day retention)
 * - error-*.log - Error level only (30 day retention)
 * - database-*.log - Database operations (14 day retention)
 * - auth-*.log - Authentication events (30 day retention)
 * - security-*.log - Security events (90 day retention - compliance)
 * - performance-*.log - Performance metrics (7 day retention)
 *
 * USAGE EXAMPLES:
 *
 * // Using helper functions (recommended):
 * const { logAuth, logDatabase, logError, logSecurity, logPerformance } = require('../utils/log-helpers');
 * logAuth('login_success', userId, { ip: req.ip });
 * logDatabase('query', 'Users', { operation: 'find' });
 * logError(error, { context: 'controller.action' });
 *
 * // Direct usage:
 * logger.info('User logged in', { type: 'auth', userId: '123' });
 * logger.error('Database connection failed', { type: 'database', error: err.message });
 *
 * CONSOLE OUTPUT (Development Only):
 * - Color-coded with Chalk for easy visual scanning
 * - Type badges for quick log category identification
 * - Highlighted context fields (userId, correlationId, duration)
 * - Performance-aware duration coloring (green < 500ms, yellow < 1000ms, red >= 1000ms)
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const chalk = require('chalk');

// Ensure logs directory exists
const fs = require('fs');
const logsDir = path.join(__dirname, '../../../logs'); // Backend root level
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Custom format to filter logs by type
 * This enables routing logs with specific 'type' fields to dedicated log files
 *
 * @param {string} type - The log type to filter for (e.g., 'auth', 'database')
 * @returns {Function} Winston format function
 */
const filterByType = (type) => winston.format((info) => {
  return info.type === type ? info : false;
})();

/**
 * Get log level based on environment
 * - Production: 'info' (hides debug logs)
 * - Development: 'debug' (shows all logs)
 * - Override with LOG_LEVEL environment variable
 *
 * @returns {string} The log level to use
 */
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
      format: 'YYYY-MM-DD HH:mm:ss'
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
      level: getLogLevel()
    }),

    // Errors only
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      level: 'error'
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
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      )
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
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      )
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
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      )
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
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      )
    })
  ]
});

/**
 * Custom console formatter with Chalk for color-coded output in development
 *
 * Color scheme:
 * - Timestamp: Gray
 * - Log levels: Built-in Winston colors (error: red, warn: yellow, info: green, debug: blue)
 * - Type badges: Cyan background with black text
 * - Messages: White (default) or level-specific colors
 * - Metadata: Dim gray for readability
 * - Special fields (userId, correlationId, duration): Highlighted in magenta
 */
const consoleFormat = winston.format.printf(({ level, message, timestamp, type, userId, correlationId, duration, ...meta }) => {
  // Format timestamp
  const ts = chalk.gray(timestamp);

  // Format type badge if present
  let typeBadge = '';
  if (type) {
    const typeColors = {
      'database': chalk.bgCyan.black,
      'auth': chalk.bgGreen.black,
      'security': chalk.bgRed.white,
      'performance': chalk.bgYellow.black,
      'error': chalk.bgRed.white
    };
    const colorFn = typeColors[type] || chalk.bgBlue.white;
    typeBadge = colorFn(` ${type.toUpperCase()} `);
  }

  // Format message with level-appropriate color
  let coloredMessage = message;
  if (level.includes('error')) {
    coloredMessage = chalk.red(message);
  } else if (level.includes('warn')) {
    coloredMessage = chalk.yellow(message);
  } else if (level.includes('info')) {
    coloredMessage = chalk.white(message);
  } else if (level.includes('debug')) {
    coloredMessage = chalk.blue(message);
  }

  // Build context info line with special fields highlighted
  let contextInfo = '';
  const contextParts = [];

  if (userId) {
    contextParts.push(chalk.magenta(`user:${userId}`));
  }
  if (correlationId) {
    contextParts.push(chalk.cyan(`correlation:${correlationId}`));
  }
  if (duration !== undefined) {
    const durationColor = duration > 1000 ? chalk.red : duration > 500 ? chalk.yellow : chalk.green;
    contextParts.push(durationColor(`${duration}ms`));
  }

  if (contextParts.length > 0) {
    contextInfo = ' ' + chalk.dim('[') + contextParts.join(chalk.dim(' | ')) + chalk.dim(']');
  }

  // Format remaining metadata (excluding special fields we already handled)
  const metaKeys = Object.keys(meta);
  let metaStr = '';
  if (metaKeys.length > 0) {
    metaStr = '\n' + chalk.dim(JSON.stringify(meta, null, 2));
  }

  return `${ts} ${level} ${typeBadge ? typeBadge + ' ' : ''}${coloredMessage}${contextInfo}${metaStr}`;
});

// Console logging for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    level: 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      consoleFormat
    )
  }));
}

module.exports = logger;
