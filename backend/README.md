# Niddah Tracker Backend

Backend for the Niddah/Mikvah tracking application built with Node.js, Express, and MongoDB.

## Setup

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running locally (or MongoDB Atlas connection string)
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - Set `MONGO_URI` to your MongoDB connection string
   - Set `SESSION_SECRET` to a secure random string
   - Configure other environment variables as needed

### Running the Application

#### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for auto-reloading.

#### Production Mode
```bash
npm start
```

### Testing

Run tests:
```bash
npm test
```

## Project Structure

```
backend/
├── config/              # Configuration files (logger, passport, session)
├── controllers/         # Request handlers (to be implemented)
├── cronJobs/           # Scheduled tasks (cycle cleanup)
├── database/           # Database connection
│   ├── dbService.js
│   └── mongoDB/
│       ├── connectLocally.js
│       └── connectAtlas.js
├── middleware/         # Express middleware
│   ├── authMiddleware.js
│   ├── rateLimiter.js
│   └── logging/
├── models/             # Mongoose schemas
│   ├── Users.js
│   ├── Cycles.js
│   ├── Preferences.js
│   ├── Notifications.js
│   └── ActivityLogs.js
├── routes/             # API routes
│   ├── main.js
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── cycleRoutes.js
├── services/           # Business logic (to be implemented)
├── utils/              # Utility functions
│   ├── functionHandlers.js
│   ├── normalizeResponses.js
│   └── logHelpers.js
├── validation/         # Joi validation schemas (to be implemented)
├── app.js             # Express app configuration
├── index.js           # Application entry point
└── package.json       # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (to be implemented)
- `POST /api/auth/login` - Login user (to be implemented)
- `POST /api/auth/logout` - Logout user (to be implemented)
- `GET /api/auth/session` - Get session status

### Users
- `GET /api/users/me` - Get current user (requires auth)
- `PUT /api/users/me` - Update current user (requires auth)
- `GET /api/users/preferences` - Get user preferences (requires auth)
- `PUT /api/users/preferences` - Update preferences (requires auth)

### Cycles
- `GET /api/cycles` - Get user cycles (requires auth)
- `POST /api/cycles` - Create new cycle (requires auth)
- `GET /api/cycles/:id` - Get specific cycle (requires auth)
- `PUT /api/cycles/:id` - Update cycle (requires auth)
- `DELETE /api/cycles/:id` - Delete cycle (requires auth)

### Health Check
- `GET /health` - Health check endpoint

## Features

### Implemented
- ✅ Database models with Mongoose schemas
- ✅ Session-based authentication setup
- ✅ Security middleware (Helmet, CORS, sanitization)
- ✅ Rate limiting
- ✅ Winston logging with daily rotation
- ✅ Error handling utilities
- ✅ Hebrew calendar integration (@hebcal/core)
- ✅ Cron job for data retention
- ✅ Route structure with stubs

### To Be Implemented
- ⏳ Controller implementations
- ⏳ Service layer (business logic)
- ⏳ Joi validation schemas
- ⏳ Authentication endpoints (register, login, logout)
- ⏳ User CRUD operations
- ⏳ Cycle CRUD operations
- ⏳ Notification scheduler cron job
- ⏳ Tests (Jest + Supertest)

## Security Features

- Helmet.js for security headers
- CORS configuration
- MongoDB sanitization (NoSQL injection prevention)
- Rate limiting on auth and API endpoints
- Session security (httpOnly, secure cookies)
- Password hashing with bcryptjs
- Login attempt tracking and account lockout

## Logging

Logs are stored in the `logs/` directory:
- `application-YYYY-MM-DD.log` - All logs (retained 14 days)
- `error-YYYY-MM-DD.log` - Error logs only (retained 30 days)

Console logging is enabled in development mode.

## Environment Variables

See `.env.example` for all required environment variables.

## License

ISC
