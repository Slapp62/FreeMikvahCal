# Winston Logger Implementation Guide

## Overview

The FreeMikvahCal backend uses **Winston** for comprehensive, production-grade logging with a type-based filtering system that routes logs to specialized files.

## Features

- **Type-based log routing** - Logs automatically route to specific files based on their `type` field
- **Daily log rotation** - Automatic file rotation with configurable retention policies
- **Color-coded console output** - Chalk-powered color coding for easy visual scanning in development
- **Performance tracking** - Request timing and slow operation detection
- **Security compliance** - 90-day retention for security logs
- **Structured logging** - JSON format for easy parsing and analysis

## Log Types

Each log can include a `type` field that determines which specialized file it goes to:

| Type | Purpose | Retention | Log File |
|------|---------|-----------|----------|
| `database` | Database operations (connections, queries) | 14 days | `database-*.log` |
| `auth` | Authentication events (login, logout, OAuth) | 30 days | `auth-*.log` |
| `security` | Security events (failed logins, suspicious activity) | 90 days | `security-*.log` |
| `performance` | Performance metrics (slow requests, timing) | 7 days | `performance-*.log` |
| `error` | Error events | 30 days | `error-*.log` |

**All logs** also go to `application-*.log` (14 day retention) regardless of type.

## Usage Examples

### Using Helper Functions (Recommended)

The easiest way to log is using the helper functions in `src/shared/utils/log-helpers.js`:

```javascript
const { logAuth, logDatabase, logError, logSecurity, logPerformance, logBusiness } = require('../../shared/utils/log-helpers');

// Authentication events
logAuth('login_success', userId, { ip: req.ip, method: 'password' });
logAuth('logout', userId, { sessionDuration: 3600 });

// Database operations
logDatabase('query', 'Users', { operation: 'findById', duration: 15 });
logDatabase('connect', 'MongoDB', { connectionType: 'atlas' });

// Errors
logError(error, {
  context: 'cycle.controller.createCycle',
  userId: req.user._id
});

// Security events
logSecurity('rate_limit_exceeded', {
  ip: req.ip,
  endpoint: '/api/auth/login'
});

// Performance metrics
logPerformance('slow_query', 2500, {
  query: 'findUserCycles',
  userId
});

// Business events
logBusiness('cycle_created', {
  userId,
  cycleId,
  vestOnotCount: 3
});
```

### Direct Logger Usage

You can also use the logger directly:

```javascript
const logger = require('../config/logger');

logger.info('User logged in', {
  type: 'auth',
  userId: '123',
  ip: req.ip
});

logger.error('Database connection failed', {
  type: 'database',
  error: err.message,
  stack: err.stack
});

logger.warn('Suspicious activity detected', {
  type: 'security',
  ip: req.ip,
  attempts: 5
});
```

## Color-Coded Console Output (Development Only)

In development, logs are displayed with beautiful color-coding:

### Color Scheme

- **Timestamp**: Gray
- **Log Levels**:
  - `error`: Red
  - `warn`: Yellow
  - `info`: Green
  - `debug`: Blue
- **Type Badges**: Color-coded backgrounds
  - `DATABASE`: Cyan background
  - `AUTH`: Green background
  - `SECURITY`: Red background
  - `PERFORMANCE`: Yellow background
- **Context Fields**:
  - `userId`: Magenta
  - `correlationId`: Cyan
  - `duration`: Green (<500ms), Yellow (500ms-1s), Red (>1s)
- **Metadata**: Dim gray

### Example Output

```
2026-01-31 23:34:24 info  DATABASE  Database operation [user:507f1f77bcf86cd799439011 | 28ms]
2026-01-31 23:34:25 info  AUTH  User logged in [user:507f1f77bcf86cd799439011 | correlation:abc123]
2026-01-31 23:34:26 warn  SECURITY  Failed login attempt [correlation:def456]
2026-01-31 23:34:27 error Request error [user:507f1f77bcf86cd799439011 | 1250ms]
```

## Request Correlation IDs

Every HTTP request is automatically assigned a `correlationId` for tracing through the system:

```javascript
// Automatically added by correlation-id middleware
req.correlationId // e.g., "1a2b3c4d"

// Automatically included in all logs that have access to req
logger.info('Processing request', { correlationId: req.correlationId });
```

## Request Timing & Performance Tracking

The `request-timer` middleware automatically:

1. Records the start time of each request
2. Calculates duration when the response completes
3. Logs slow requests (>1000ms) as performance warnings

```javascript
// Automatically logged for slow requests:
logPerformance('slow_request', 1250, {
  method: 'POST',
  url: '/api/cycles',
  statusCode: 201,
  userId: '507f1f77bcf86cd799439011'
});
```

## Error Logging

The error logging middleware captures comprehensive error context:

```javascript
// Error logs automatically include:
{
  message: error.message,
  stack: error.stack,
  statusCode: error.statusCode || 500,
  url: req.originalUrl,
  method: req.method,
  correlationId: req.correlationId,
  userId: req.user?._id,
  userAgent: req.get('user-agent'),
  ip: req.ip,
  duration: Date.now() - req.startTime
}
```

## Business Event Logging

Log important business events for analytics and debugging:

```javascript
// Cycle created
logBusiness('cycle_created', {
  userId,
  cycleId,
  status: 'niddah',
  vestOnotCount: 3
});

// Cycle deleted
logBusiness('cycle_deleted', {
  userId,
  cycleId,
  futureCyclesToRecalculate: 2
});

// User account deleted
logBusiness('user_account_deleted', {
  userId,
  accountAgeInDays: 45,
  cycleCount: 12
});
```

## Log Files Location

All logs are stored in: `backend/logs/`

**Important**: The `logs/` folder is already in `.gitignore` and should never be committed to version control.

## Environment Configuration

### Log Level

Set the log level using the `LOG_LEVEL` environment variable:

```bash
# .env
LOG_LEVEL=debug  # Options: error, warn, info, debug
```

Default levels:
- **Production**: `info` (hides debug logs)
- **Development**: `debug` (shows all logs)

### Node Environment

The logger automatically adjusts based on `NODE_ENV`:

- **Development**: Console logging enabled with colors
- **Production**: Console logging disabled, file-only logging

## Best Practices

### DO ✓

- Use helper functions (`logAuth`, `logDatabase`, etc.) for consistency
- Include relevant context (userId, correlationId, etc.)
- Log errors with context using `logError(error, { context: 'module.function' })`
- Use structured metadata instead of string concatenation
- Log business events for important operations

### DON'T ✗

- Don't use `console.log/error/warn` - always use Winston
- Don't log sensitive data (passwords, tokens, full credit cards)
- Don't log entire request bodies in production
- Don't create custom log files outside of Winston
- Don't commit log files to version control

## Viewing Logs

### Development

Logs appear in the console with beautiful color-coding. Just run:

```bash
npm run dev
```

### Production

Logs are written to files only. View them with:

```bash
# All application logs
tail -f logs/application-2026-01-31.log

# Errors only
tail -f logs/error-2026-01-31.log

# Authentication events
tail -f logs/auth-2026-01-31.log

# Database operations
tail -f logs/database-2026-01-31.log

# Security events
tail -f logs/security-2026-01-31.log

# Performance metrics
tail -f logs/performance-2026-01-31.log
```

### Analyzing Logs

Since logs are in JSON format, you can easily parse and analyze them:

```bash
# Find all errors for a specific user
cat logs/error-*.log | grep "507f1f77bcf86cd799439011" | jq .

# Count login attempts today
cat logs/auth-2026-01-31.log | grep "login_attempt" | wc -l

# Find slow requests
cat logs/performance-*.log | jq 'select(.duration > 1000)'

# Search by correlation ID
grep -r "abc123" logs/
```

## Middleware Stack Order

The logging middleware is configured in this order in `app.js`:

1. `correlationId` - Assigns unique ID to each request
2. `requestTimer` - Records request start time
3. `httpLogger` - Logs all HTTP requests (Morgan + Winston)
4. ... (application routes) ...
5. `errorLogger` - Logs all errors before final handler
6. Global error handler - Sends error response

## Troubleshooting

### Logs not appearing

1. Check `NODE_ENV` - console logs only show in development
2. Verify log level - debug logs only show when `LOG_LEVEL=debug`
3. Check logs directory exists - should auto-create, but verify permissions

### Logs not rotating

1. Check disk space - rotation may fail if disk is full
2. Verify retention settings in `logger.js`
3. Check file permissions on logs directory

### Missing color output

1. Ensure you're in development mode (`NODE_ENV !== 'production'`)
2. Verify chalk is installed (`npm install chalk@4.1.2`)
3. Check terminal supports colors

## Summary

The Winston logging system provides:

- ✓ Comprehensive error tracking
- ✓ Performance monitoring
- ✓ Security audit trails
- ✓ Easy debugging with color-coded output
- ✓ Production-ready log management
- ✓ Automatic log rotation and retention
- ✓ Structured, parseable log format

For questions or issues, refer to the Winston documentation: https://github.com/winstonjs/winston
