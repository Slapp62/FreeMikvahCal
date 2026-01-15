# Backend Setup Instructions for Niddah/Mikvah Tracking Application

## Context
I'm building a web application for Orthodox Jewish women to track their niddah cycles and mikvah dates. The application requires a Node.js/Express backend with MongoDB, following a specific architectural pattern from a template project.

## Project Structure Required
Create a monorepo with the following structure:

```
project-root/
├── frontend/              # React frontend (ALREADY EXISTS - DO NOT MODIFY)
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/               # Express backend (CREATE THIS)
│   ├── config/
│   │   ├── logger.js
│   │   ├── passport.js
│   │   └── sessionConfig.js
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── cycleController.js
│   │   └── notificationController.js
│   ├── cronJobs/
│   │   ├── cycleCleanup.js
│   │   └── notificationScheduler.js
│   ├── database/
│   │   ├── dbService.js
│   │   └── mongoDB/
│   │       ├── connectLocally.js
│   │       └── connectAtlas.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── rateLimiter.js
│   │   ├── userValidation.js
│   │   ├── cycleValidation.js
│   │   └── logging/
│   │       ├── httpLogger.js
│   │       └── errorLogger.js
│   ├── models/
│   │   ├── Users.js
│   │   ├── Cycles.js
│   │   ├── Preferences.js
│   │   ├── Notifications.js
│   │   └── ActivityLogs.js
│   ├── routes/
│   │   ├── main.js
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── cycleRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── cycleService.js
│   │   └── notificationService.js
│   ├── utils/
│   │   ├── functionHandlers.js
│   │   ├── normalizeResponses.js
│   │   ├── logHelpers.js
│   │   └── hebrewCalendar.js
│   ├── validation/
│   │   └── Joi/
│   │       ├── userSchemas.js
│   │       ├── cycleSchemas.js
│   │       └── authSchemas.js
│   ├── .env.example
│   ├── .gitignore
│   ├── app.js
│   ├── index.js
│   └── package.json
├── docs/
└── README.md
```

## Step 1: Initialize Backend Directory

1. Create the `backend` directory structure as shown above
2. Initialize npm in the backend directory
3. Set up package.json with the following details:
   - Name: "niddah-tracker-backend"
   - Version: "1.0.0"
   - Type: "commonjs" (use CommonJS modules, not ES6)
   - Main: "index.js"
   - Scripts:
     - `start`: "node index.js"
     - `dev`: "nodemon index.js"
     - `test`: "jest --coverage"

## Step 2: Install Dependencies

Install all required packages:

```bash
# Core dependencies
npm install express@5.x
npm install mongoose@8.x
npm install dotenv

# Authentication & Security
npm install passport passport-local passport-google-oauth20
npm install express-session connect-mongo
npm install bcryptjs
npm install helmet cors
npm install express-mongo-sanitize
npm install express-rate-limit

# Validation
npm install joi

# Logging
npm install winston winston-daily-rotate-file
npm install morgan

# Scheduled Tasks
npm install node-cron

# Hebrew Calendar
npm install @hebcal/core

# Development dependencies
npm install --save-dev nodemon
npm install --save-dev jest supertest
npm install --save-dev eslint
```

## Step 3: Environment Configuration

Create `.env.example` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/niddah-tracker
MONGO_URI_TEST=mongodb://localhost:27017/niddah-tracker-test

# Session
SESSION_SECRET=your-super-secret-key-change-in-production

# Google OAuth (optional for later)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

Create actual `.env` file (copy from .env.example with real values)

Create `.gitignore`:

```gitignore
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.production

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/
.nyc_output/
```

## Step 4: Database Models

### 4.1 Users Model (`models/Users.js`)

```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  // Authentication
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: { 
    type: String, 
    required: function() { return !this.googleId; },
    minlength: 8
  },
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  
  // Profile
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, trim: true },
  dateOfBirth: { type: Date },
  
  // Location
  location: {
    city: String,
    geonameId: Number,
    lat: Number,
    lng: Number,
    timezone: String,
    _id: false
  },
  
  // Jewish Community Settings
  ethnicity: {
    type: String,
    enum: ['ashkenazi', 'sephardi', 'teimani', 'other'],
    default: null
  },
  
  specialOnahs: {
    onatOhrZarua: { type: Boolean, default: false },
    beinonitOn31: { type: Boolean, default: false },
    _id: false
  },
  
  // Account Status
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  
  // Security
  loginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null },
  lastLogin: { type: Date },
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Profile Status
  profileComplete: { type: Boolean, default: false },
  onboardingCompleted: { type: Boolean, default: false },
  
  // Privacy & GDPR
  consents: {
    dataProcessing: {
      granted: { type: Boolean, required: true },
      timestamp: { type: Date, required: true },
      ipAddress: String,
      userAgent: String,
      _id: false
    },
    _id: false
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ isDeleted: 1, deletedAt: 1 });

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Custom validation
userSchema.pre('validate', function(next) {
  if (!this.password && !this.googleId) {
    next(new Error('User must have either password or Google account'));
  }
  next();
});

module.exports = mongoose.model('Users', userSchema);
```

### 4.2 Cycles Model (`models/Cycles.js`)

```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const cycleSchema = new Schema({
  // User Reference
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true, 
    index: true 
  },
  
  // Cycle Dates
  niddahStartDate: { type: Date, required: true },
  hefsekTaharaDate: { type: Date },
  shivaNekiyimStartDate: { type: Date },
  mikvahDate: { type: Date },
  
  // Cycle Status
  status: { 
    type: String, 
    enum: ['niddah', 'shiva_nekiyim', 'completed'],
    default: 'niddah',
    index: true
  },
  
  // Cycle Measurements
  cycleLength: { type: Number },
  haflagah: { type: Number },
  
  // Vest Onot - Computed in pre-save hook
  vestOnot: {
    yomHachodesh: { type: Date },
    ohrHachodesh: { type: Date },
    haflagah: { type: Date },
    onahBeinonit: { type: Date },
    
    metadata: {
      yomHachodesh: {
        hebrewDate: String,
        dayOfWeek: Number,
        _id: false
      },
      ohrHachodesh: {
        hebrewDate: String,
        dayOfWeek: Number,
        _id: false
      },
      haflagah: {
        interval: Number,
        hebrewDate: String,
        dayOfWeek: Number,
        _id: false
      },
      onahBeinonit: {
        calculatedFrom: Number,
        averageLength: Number,
        hebrewDate: String,
        dayOfWeek: Number,
        _id: false
      },
      _id: false
    },
    _id: false
  },
  
  // Bedikot tracking
  bedikot: [{
    date: { type: Date, required: true },
    dayNumber: { type: Number, min: 1, max: 7 },
    timeOfDay: { 
      type: String, 
      enum: ['morning', 'evening', 'both'] 
    },
    results: {
      morning: { 
        type: String, 
        enum: ['clean', 'questionable', 'not_clean'] 
      },
      evening: { 
        type: String, 
        enum: ['clean', 'questionable', 'not_clean'] 
      },
      _id: false
    },
    notes: { type: String, maxlength: 200 }
  }],
  
  // Notes
  notes: { type: String, maxlength: 500 },
  privateNotes: { type: String, maxlength: 500 },
  
  // Reminders tracking
  remindersSent: {
    hefsekTahara: { type: Boolean, default: false },
    shivaNekiyim: { type: Boolean, default: false },
    mikvah: { type: Boolean, default: false },
    vestOnot: {
      yomHachodesh: { type: Boolean, default: false },
      ohrHachodesh: { type: Boolean, default: false },
      haflagah: { type: Boolean, default: false },
      onahBeinonit: { type: Boolean, default: false },
      _id: false
    },
    _id: false
  },
  
  // Soft delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  
  // Auto-expire after 2 years
  expiresAt: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 2);
      return date;
    },
    index: { expireAfterSeconds: 0 }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
cycleSchema.index({ userId: 1, niddahStartDate: -1 });
cycleSchema.index({ userId: 1, status: 1 });
cycleSchema.index({ userId: 1, 'vestOnot.onahBeinonit': 1 });

// PRE-SAVE HOOK: Calculate vest onot
cycleSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('niddahStartDate') || this.isModified('mikvahDate')) {
    
    // Calculate cycle length
    if (this.mikvahDate) {
      this.cycleLength = Math.ceil(
        (this.mikvahDate - this.niddahStartDate) / (1000 * 60 * 60 * 24)
      );
    }
    
    // Get previous cycles for calculations
    const previousCycles = await this.constructor
      .find({
        userId: this.userId,
        _id: { $ne: this._id },
        status: 'completed',
        niddahStartDate: { $lt: this.niddahStartDate }
      })
      .sort({ niddahStartDate: -1 })
      .limit(3)
      .select('niddahStartDate cycleLength');
    
    // Calculate haflagah
    if (previousCycles.length > 0) {
      const lastCycle = previousCycles[0];
      this.haflagah = Math.ceil(
        (this.niddahStartDate - lastCycle.niddahStartDate) / (1000 * 60 * 60 * 24)
      );
    }
    
    // Calculate vest onot
    await this.calculateVestOnot(previousCycles);
  }
  
  this.updatedAt = Date.now();
  next();
});

// PRE-VALIDATE HOOK: Ensure dates are logical
cycleSchema.pre('validate', function(next) {
  if (this.hefsekTaharaDate && this.niddahStartDate) {
    if (this.hefsekTaharaDate < this.niddahStartDate) {
      this.invalidate('hefsekTaharaDate', 
        'Hefsek Tahara cannot be before Niddah start');
    }
  }
  
  if (this.shivaNekiyimStartDate && this.hefsekTaharaDate) {
    if (this.shivaNekiyimStartDate < this.hefsekTaharaDate) {
      this.invalidate('shivaNekiyimStartDate', 
        'Shiva Nekiyim cannot start before Hefsek Tahara');
    }
  }
  
  if (this.mikvahDate && this.shivaNekiyimStartDate) {
    const daysDiff = Math.ceil(
      (this.mikvahDate - this.shivaNekiyimStartDate) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff < 7) {
      this.invalidate('mikvahDate', 
        'Mikvah must be at least 7 days after Shiva Nekiyim start');
    }
  }
  
  next();
});

// METHOD: Calculate vest onot
cycleSchema.methods.calculateVestOnot = async function(previousCycles) {
  const { HebrewCalendar } = require('@hebcal/core');
  
  // 1. Ohr Hachodesh - 30 days
  this.vestOnot.ohrHachodesh = new Date(this.niddahStartDate);
  this.vestOnot.ohrHachodesh.setDate(this.vestOnot.ohrHachodesh.getDate() + 30);
  
  const hDate1 = new HebrewCalendar.HDate(this.vestOnot.ohrHachodesh);
  this.vestOnot.metadata.ohrHachodesh = {
    hebrewDate: hDate1.toString(),
    dayOfWeek: this.vestOnot.ohrHachodesh.getDay()
  };
  
  // 2. Yom Hachodesh - Same Hebrew date next month
  const startHDate = new HebrewCalendar.HDate(this.niddahStartDate);
  const nextMonth = startHDate.next();
  this.vestOnot.yomHachodesh = nextMonth.greg();
  
  this.vestOnot.metadata.yomHachodesh = {
    hebrewDate: nextMonth.toString(),
    dayOfWeek: this.vestOnot.yomHachodesh.getDay()
  };
  
  // 3. Haflagah - Based on interval
  if (this.haflagah && previousCycles.length > 0) {
    this.vestOnot.haflagah = new Date(this.niddahStartDate);
    this.vestOnot.haflagah.setDate(this.vestOnot.haflagah.getDate() + this.haflagah);
    
    const hDate3 = new HebrewCalendar.HDate(this.vestOnot.haflagah);
    this.vestOnot.metadata.haflagah = {
      interval: this.haflagah,
      hebrewDate: hDate3.toString(),
      dayOfWeek: this.vestOnot.haflagah.getDay()
    };
  }
  
  // 4. Onah Beinonit - Average cycle length
  if (previousCycles.length >= 3) {
    const completedCycles = previousCycles.filter(c => c.cycleLength);
    const sum = completedCycles.reduce((acc, c) => acc + c.cycleLength, 0);
    const average = Math.round(sum / completedCycles.length);
    
    this.vestOnot.onahBeinonit = new Date(this.niddahStartDate);
    this.vestOnot.onahBeinonit.setDate(this.vestOnot.onahBeinonit.getDate() + average);
    
    const hDate4 = new HebrewCalendar.HDate(this.vestOnot.onahBeinonit);
    this.vestOnot.metadata.onahBeinonit = {
      calculatedFrom: completedCycles.length,
      averageLength: average,
      hebrewDate: hDate4.toString(),
      dayOfWeek: this.vestOnot.onahBeinonit.getDay()
    };
  }
};

// METHOD: Check if in shiva nekiyim period
cycleSchema.methods.isInShivaNekiyim = function() {
  if (!this.shivaNekiyimStartDate || this.status === 'completed') {
    return false;
  }
  
  const now = new Date();
  const sevenDaysLater = new Date(this.shivaNekiyimStartDate);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  
  return now >= this.shivaNekiyimStartDate && now <= sevenDaysLater;
};

module.exports = mongoose.model('Cycles', cycleSchema);
```

### 4.3 Preferences Model (`models/Preferences.js`)

```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const preferencesSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true, 
    unique: true 
  },
  
  // Calendar Preferences
  hebrewCalendar: { type: Boolean, default: true },
  defaultCycleLength: { type: Number, default: 28, min: 20, max: 40 },
  
  // Notifications
  notifications: {
    enabled: { type: Boolean, default: true },
    hefsekTaharaReminder: { type: Boolean, default: true },
    shivaNekiyimReminder: { type: Boolean, default: true },
    mikvahReminder: { type: Boolean, default: true },
    vestOnotReminder: { type: Boolean, default: true },
    reminderTime: { type: String, default: '09:00' },
    _id: false
  },
  
  // Privacy
  privacyMode: { type: Boolean, default: false },
  
  // Display
  language: { 
    type: String, 
    enum: ['he', 'en'], 
    default: 'he' 
  },
  
  // Data Retention
  dataRetention: {
    keepCycles: { 
      type: Number, 
      default: 24,
      min: 12,
      max: 48
    },
    autoDelete: { 
      type: Boolean, 
      default: true 
    },
    _id: false
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

preferencesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Preferences', preferencesSchema);
```

### 4.4 Notifications Model (`models/Notifications.js`)

```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true,
    index: true 
  },
  
  cycleId: {
    type: Schema.Types.ObjectId,
    ref: 'Cycles'
  },
  
  type: {
    type: String,
    enum: [
      'hefsek_tahara',
      'shiva_nekiyim_start',
      'bedika_reminder',
      'mikvah_night',
      'vest_onah'
    ],
    required: true
  },
  
  scheduledFor: { type: Date, required: true, index: true },
  
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  hebrewDate: String,
  
  sentAt: Date,
  deliveryMethod: {
    type: String,
    enum: ['email', 'push', 'sms']
  },
  
  failureReason: String,
  retryCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  
  expiresAt: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    },
    index: { expireAfterSeconds: 0 }
  }
});

notificationSchema.index({ userId: 1, status: 1, scheduledFor: 1 });

module.exports = mongoose.model('Notifications', notificationSchema);
```

### 4.5 Activity Logs Model (`models/ActivityLogs.js`)

```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const activityLogSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true,
    index: true 
  },
  
  action: {
    type: String,
    enum: [
      'cycle_created',
      'cycle_updated', 
      'cycle_deleted',
      'bedika_added',
      'mikvah_marked',
      'reminder_sent',
      'settings_changed',
      'login',
      'logout'
    ],
    required: true
  },
  
  entityType: {
    type: String,
    enum: ['cycle', 'user', 'preference', 'bedika', 'auth']
  },
  
  entityId: { type: Schema.Types.ObjectId },
  
  changes: {
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
    _id: false
  },
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
    _id: false
  },
  
  expiresAt: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 90);
      return date;
    },
    index: { expireAfterSeconds: 0 }
  }
});

activityLogSchema.index({ userId: 1, 'metadata.timestamp': -1 });

module.exports = mongoose.model('ActivityLogs', activityLogSchema);
```

## Step 5: Database Connection

### 5.1 Database Service (`database/dbService.js`)

```javascript
const connectLocally = require('./mongoDB/connectLocally');
const connectAtlas = require('./mongoDB/connectAtlas');

const connectDB = async () => {
  const env = process.env.NODE_ENV || 'development';
  
  try {
    if (env === 'production') {
      await connectAtlas();
    } else {
      await connectLocally();
    }
    console.log(`MongoDB connected successfully (${env})`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB };
```

### 5.2 Local Connection (`database/mongoDB/connectLocally.js`)

```javascript
const mongoose = require('mongoose');

const connectLocally = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/niddah-tracker';
  
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  console.log('Connected to local MongoDB:', uri);
};

module.exports = connectLocally;
```

### 5.3 Atlas Connection (`database/mongoDB/connectAtlas.js`)

```javascript
const mongoose = require('mongoose');

const connectAtlas = async () => {
  const uri = process.env.MONGO_URI;
  
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not set');
  }
  
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority'
  });
  
  console.log('Connected to MongoDB Atlas');
};

module.exports = connectAtlas;
```

## Step 6: Utility Functions

### 6.1 Error Handlers (`utils/functionHandlers.js`)

```javascript
/**
 * Throw error with status code (for services)
 */
const throwError = (statusCode, message) => {
  const error = new Error(message);
  error.status = statusCode;
  throw error;
};

/**
 * Pass error to next middleware (for controllers)
 */
const nextError = (next, statusCode, message) => {
  const error = new Error(message);
  error.status = statusCode;
  next(error);
};

/**
 * Handle error response (for global error handler)
 */
const handleError = (res, statusCode, message) => {
  res.status(statusCode).json({
    error: true,
    message: message || 'An error occurred'
  });
};

module.exports = {
  throwError,
  nextError,
  handleError
};
```

### 6.2 Response Normalization (`utils/normalizeResponses.js`)

```javascript
/**
 * Remove sensitive fields from user object
 */
const normalizeUser = (user) => {
  if (!user) return null;
  
  const normalized = user.toObject ? user.toObject() : { ...user };
  
  delete normalized.password;
  delete normalized.resetPasswordToken;
  delete normalized.emailVerificationToken;
  delete normalized.loginAttempts;
  delete normalized.lockoutUntil;
  delete normalized.__v;
  
  return normalized;
};

/**
 * Normalize cycle data
 */
const normalizeCycle = (cycle) => {
  if (!cycle) return null;
  
  const normalized = cycle.toObject ? cycle.toObject() : { ...cycle };
  
  delete normalized.__v;
  delete normalized.isDeleted;
  delete normalized.deletedAt;
  
  return normalized;
};

/**
 * Normalize array of cycles
 */
const normalizeCycles = (cycles) => {
  if (!Array.isArray(cycles)) return [];
  return cycles.map(normalizeCycle);
};

module.exports = {
  normalizeUser,
  normalizeCycle,
  normalizeCycles
};
```

### 6.3 Logging Helpers (`utils/logHelpers.js`)

```javascript
const logger = require('../config/logger');

const logAuth = (action, userId, metadata = {}) => {
  logger.info('Authentication event', {
    type: 'auth',
    action,
    userId,
    ...metadata
  });
};

const logDatabase = (operation, model, metadata = {}) => {
  logger.info('Database operation', {
    type: 'database',
    operation,
    model,
    ...metadata
  });
};

const logSecurity = (eventType, metadata = {}) => {
  logger.warn('Security event', {
    type: 'security',
    eventType,
    ...metadata
  });
};

const logError = (error, context = {}) => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

module.exports = {
  logAuth,
  logDatabase,
  logSecurity,
  logError
};
```

## Step 7: Configuration Files

### 7.1 Winston Logger (`config/logger.js`)

```javascript
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Ensure logs directory exists
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Daily rotating file for all logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'info'
    }),
    // Separate file for errors
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      level: 'error'
    })
  ]
});

// Console logging for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

### 7.2 Session Config (`config/sessionConfig.js`)

```javascript
const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600, // Lazy session update (seconds)
    crypto: {
      secret: process.env.SESSION_SECRET || 'change-this-secret-in-production'
    }
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

module.exports = sessionConfig;
```

### 7.3 Passport Config (`config/passport.js`)

```javascript
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Users = require('../models/Users');

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Find user
      const user = await Users.findOne({ 
        email: email.toLowerCase(),
        isDeleted: false 
      });
      
      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }
      
      // Check account lockout
      if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
        return done(null, false, { 
          message: 'Account locked. Try again later.' 
        });
      }
      
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        // Increment login attempts
        user.loginAttempts += 1;
        
        if (user.loginAttempts >= 5) {
          user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }
        
        await user.save();
        return done(null, false, { message: 'Invalid credentials' });
      }
      
      // Reset login attempts on success
      user.loginAttempts = 0;
      user.lockoutUntil = null;
      user.lastLogin = Date.now();
      await user.save();
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

module.exports = passport;
```

## Step 8: Middleware

### 8.1 Auth Middleware (`middleware/authMiddleware.js`)

```javascript
const { nextError } = require('../utils/functionHandlers');

/**
 * Ensure user is authenticated
 */
const authenticateUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  nextError(next, 401, 'Authentication required');
};

/**
 * Check if user owns the resource
 */
const userOwnsResource = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user._id.toString() === resourceUserId) {
    return next();
  }
  
  nextError(next, 403, 'Access denied');
};

module.exports = {
  authenticateUser,
  userOwnsResource
};
```

### 8.2 Rate Limiter (`middleware/rateLimiter.js`)

```javascript
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter
};
```

### 8.3 HTTP Logger (`middleware/logging/httpLogger.js`)

```javascript
const morgan = require('morgan');
const logger = require('../../config/logger');

// Custom token for user ID
morgan.token('user-id', (req) => {
  return req.user ? req.user._id : 'anonymous';
});

// Create custom format
const format = ':method :url :status :res[content-length] - :response-time ms - user::user-id';

// Stream to Winston
const stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

const httpLogger = morgan(format, { stream });

module.exports = httpLogger;
```

### 8.4 Error Logger (`middleware/logging/errorLogger.js`)

```javascript
const logger = require('../../config/logger');

const errorLogger = (error, req, res, next) => {
  logger.error('Request error', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?._id,
    body: req.body,
    params: req.params
  });
  
  next(error);
};

module.exports = errorLogger;
```

## Step 9: Core Application Files

### 9.1 Main Entry Point (`index.js`)

```javascript
require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./database/dbService');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

// Connect to database first
connectDB()
  .then(() => {
    // Start server after DB connection
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to start server', { error: error.message });
    console.error('Failed to start server:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { error: err.message });
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  process.exit(1);
});
```

### 9.2 Express App (`app.js`)

```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const sessionConfig = require('./config/sessionConfig');
const mongoSanitize = require('express-mongo-sanitize');
const httpLogger = require('./middleware/logging/httpLogger');
const errorLogger = require('./middleware/logging/errorLogger');
const { handleError } = require('./utils/functionHandlers');
const mainRouter = require('./routes/main');

const app = express();

// Trust proxy (for production behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers
app.use(helmet());

// CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// HTTP request logging
app.use(httpLogger);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize data
app.use(mongoSanitize());

// Session middleware
app.use(session(sessionConfig));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api', mainRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error logging middleware
app.use(errorLogger);

// Global error handler
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  const message = error.message || 'Internal server error';
  
  handleError(res, statusCode, message);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
```

## Step 10: Routes Setup

### 10.1 Main Router (`routes/main.js`)

```javascript
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const cycleRoutes = require('./cycleRoutes');

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cycles', cycleRoutes);

module.exports = router;
```

### 10.2 Auth Routes Stub (`routes/authRoutes.js`)

```javascript
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register
router.post('/register', authLimiter, (req, res) => {
  res.json({ message: 'Register endpoint - to be implemented' });
});

// POST /api/auth/login
router.post('/login', authLimiter, (req, res) => {
  res.json({ message: 'Login endpoint - to be implemented' });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - to be implemented' });
});

// GET /api/auth/session
router.get('/session', (req, res) => {
  res.json({ 
    authenticated: req.isAuthenticated(),
    user: req.user || null
  });
});

module.exports = router;
```

### 10.3 User Routes Stub (`routes/userRoutes.js`)

```javascript
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting and authentication to all routes
router.use(apiLimiter);
router.use(authenticateUser);

// GET /api/users/me
router.get('/me', (req, res) => {
  res.json({ message: 'Get current user - to be implemented' });
});

// PUT /api/users/me
router.put('/me', (req, res) => {
  res.json({ message: 'Update current user - to be implemented' });
});

// GET /api/users/preferences
router.get('/preferences', (req, res) => {
  res.json({ message: 'Get user preferences - to be implemented' });
});

// PUT /api/users/preferences
router.put('/preferences', (req, res) => {
  res.json({ message: 'Update preferences - to be implemented' });
});

module.exports = router;
```

### 10.4 Cycle Routes Stub (`routes/cycleRoutes.js`)

```javascript
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply middleware to all routes
router.use(apiLimiter);
router.use(authenticateUser);

// GET /api/cycles
router.get('/', (req, res) => {
  res.json({ message: 'Get user cycles - to be implemented' });
});

// POST /api/cycles
router.post('/', (req, res) => {
  res.json({ message: 'Create cycle - to be implemented' });
});

// GET /api/cycles/:id
router.get('/:id', (req, res) => {
  res.json({ message: 'Get specific cycle - to be implemented' });
});

// PUT /api/cycles/:id
router.put('/:id', (req, res) => {
  res.json({ message: 'Update cycle - to be implemented' });
});

// DELETE /api/cycles/:id
router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete cycle - to be implemented' });
});

module.exports = router;
```

## Step 11: Cron Jobs

### 11.1 Cycle Cleanup (`cronJobs/cycleCleanup.js`)

```javascript
const cron = require('node-cron');
const Cycles = require('../models/Cycles');
const { logDatabase } = require('../utils/logHelpers');

const cleanupOldCycles = async () => {
  try {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const result = await Cycles.deleteMany({
      createdAt: { $lt: twoYearsAgo },
      isDeleted: false
    });

    logDatabase('delete_many', 'Cycles', {
      deletedCount: result.deletedCount,
      olderThan: twoYearsAgo,
      reason: 'automatic_retention_policy'
    });

    console.log(`Cleaned up ${result.deletedCount} cycles older than 2 years`);
  } catch (error) {
    console.error('Error in cycle cleanup cron:', error);
  }
};

const scheduleCycleCleanup = () => {
  // Run daily at 2:00 AM
  cron.schedule('0 2 * * *', cleanupOldCycles);
  console.log('Cycle cleanup cron job scheduled (2:00 AM daily)');
};

module.exports = { scheduleCycleCleanup };
```

## Step 12: Testing Setup

Create `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js'
  ],
  verbose: true
};
```

## Step 13: Validation Setup (Stub for later)

Create placeholder directories:
- `validation/Joi/userSchemas.js` - User validation schemas
- `validation/Joi/cycleSchemas.js` - Cycle validation schemas  
- `validation/Joi/authSchemas.js` - Auth validation schemas

## Final Steps

1. **Test the setup**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Verify**:
   - Server starts on port 5000
   - Database connects successfully
   - Hit `http://localhost:5000/health` - should return OK
   - Hit `http://localhost:5000/api/auth/session` - should return auth status

3. **Next implementations needed**:
   - Complete controller implementations
   - Complete service layer
   - Joi validation schemas
   - Complete CRUD operations
   - Notification scheduler cron job
   - Tests

## Key Points

- All models are complete with indexes, hooks, and methods
- Security middleware is in place (helmet, rate limiting, sanitization)
- Session-based authentication with Passport.js
- Winston logging configured
- Error handling utilities ready
- Hebrew calendar integration with @hebcal/core
- Route stubs ready for controller implementation
- Cron job for data retention
- GDPR-compliant with activity logs

The backend structure is production-ready with proper security, logging, and scalability patterns from the template.
