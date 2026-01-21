const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const sessionConfig = require('./config/sessionConfig');
const mongoSanitize = require('express-mongo-sanitize');
const correlationId = require('./middleware/logging/correlationId');
const httpLogger = require('./middleware/logging/httpLogger');
const errorLogger = require('./middleware/logging/errorLogger');
const { handleError } = require('./utils/functionHandlers');
const mainRouter = require('./routes/main');
const path = require('path');

const app = express();

// Trust proxy (for production behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // Start with default-src 'self'
        defaultSrc: ["'self'"],

        // Scripts: Fixed for Google Analytics, Ko-fi, and Google Login
        scriptSrc: [
          "'self'", 
          "'unsafe-inline'", 
          "https://storage.ko-fi.com", 
          "https://ko-fi.com", 
          "https://www.googletagmanager.com", 
          "https://www.google-analytics.com"
        ],

        // Frames: Added accounts.google.com for Google One Tap/Login if used
        frameSrc: ["'self'", "https://ko-fi.com", "https://accounts.google.com"],

        // Images: 'https:' allows all external HTTPS images
        imgSrc: ["'self'", "data:", "https:"],

        // Styles: Includes Google Fonts and Ko-fi
        styleSrc: [
          "'self'", 
          "'unsafe-inline'", 
          "https://fonts.googleapis.com", 
          "https://storage.ko-fi.com"
        ],

        // Fonts: THE FIX for your specific error
        fontSrc: ["'self'", "https://fonts.gstatic.com"],

        // Connections: XHR/Fetch targets
        connectSrc: [
          "'self'", 
          "https://accounts.google.com", 
          "https://freemikvahcal.com", 
          "https://freemikvahcal.onrender.com", 
          "https://www.google-analytics.com", 
          "https://analytics.google.com"
        ],

        // Form Actions: Redirect targets for OAuth
        formAction: ["'self'", "https://accounts.google.com"],

        // Best Practice: Block plugins like Flash
        objectSrc: ["'none'"],
        
        // Best Practice: Prevent site from being embedded in iFrames on other sites
        upgradeInsecureRequests: [],
      },
    },
  })
);

// CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Correlation ID for request tracing
app.use(correlationId);

// HTTP request logging
app.use(httpLogger);

// Body parsing with size limits (prevent DOS attacks)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize data
app.use(mongoSanitize());

// Session middleware
app.use(session(sessionConfig));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api', mainRouter);

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the public folder
  app.use(express.static(path.join(__dirname, 'public')));
  // Catch-all route: serve index.html for any non-API routes
  // This allows React Router to handle client-side routing
  app.get('/*path', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler (must be before error handler)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error logging middleware
app.use(errorLogger);

// Global error handler (must be last)
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  const message = error.message || 'Internal server error';

  handleError(res, statusCode, message);
});

module.exports = app;
