# Getting Started with FreeMikvahCal Backend

## Prerequisites

Before running the backend, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **MongoDB** (v6 or higher)
   - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud)
   - Verify installation: `mongod --version`

3. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

## Quick Start

### 1. Install Dependencies

The dependencies have already been installed. If you need to reinstall:

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

The `.env` file is already configured with:
- `MONGO_URI=mongodb://localhost:27017/freeMikvahCal`
- `PORT=5000`
- `NODE_ENV=development`
- `SESSION_SECRET=<your-secret>`
- `FRONTEND_URL=http://localhost:5173`

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
# or
mongod --dbpath /path/to/data/directory
```

**Option B: MongoDB Atlas**
- Update `MONGO_URI` in `.env` with your Atlas connection string
- Example: `MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/freeMikvahCal`

### 4. Start the Backend Server

**Development Mode (with auto-reload):**
```bash
cd backend
npm run dev
```

**Production Mode:**
```bash
cd backend
npm start
```

You should see:
```
Connected to local MongoDB: mongodb://localhost:27017/freeMikvahCal
MongoDB connected successfully (development)
Server running on port 5000
Environment: development
Cycle cleanup cron job scheduled (2:00 AM daily)
```

## Verify Installation

### Test Health Endpoint

Open your browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T09:00:00.000Z"
}
```

### Test Session Endpoint

```bash
curl http://localhost:5000/api/auth/session
```

Expected response:
```json
{
  "authenticated": false,
  "user": null
}
```

## Current Implementation Status

### ✅ Fully Implemented
- Project structure and organization
- All 5 database models (Users, Cycles, Preferences, Notifications, ActivityLogs)
- Database connection (local and Atlas)
- Configuration files (logger, session, passport)
- Middleware (auth, rate limiting, logging, error handling)
- Route structure with stubs
- Utility functions
- Cron job for data cleanup
- Security features (Helmet, CORS, sanitization, rate limiting)
- Winston logging with daily rotation
- Session-based authentication setup

### ⏳ To Be Implemented
- Controller implementations
- Service layer (business logic)
- Joi validation schemas
- Authentication endpoints (register, login, logout)
- User CRUD operations
- Cycle CRUD operations
- Notification scheduler
- Tests (Jest + Supertest)

## API Endpoints

All endpoints are accessible at `http://localhost:5000/api`

### Working Endpoints
- `GET /health` - Health check ✅
- `GET /api/auth/session` - Check authentication status ✅

### Stub Endpoints (return placeholder messages)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update preferences
- `GET /api/cycles` - List user cycles
- `POST /api/cycles` - Create new cycle
- `GET /api/cycles/:id` - Get specific cycle
- `PUT /api/cycles/:id` - Update cycle
- `DELETE /api/cycles/:id` - Delete cycle

## Project Structure

```
backend/
├── config/                  # Configuration files
│   ├── logger.js           # Winston logger
│   ├── passport.js         # Passport authentication
│   └── sessionConfig.js    # Express session
├── controllers/            # (To be implemented)
├── cronJobs/               # Scheduled tasks
│   └── cycleCleanup.js    # Auto-delete old cycles
├── database/               # Database connection
│   ├── dbService.js
│   └── mongoDB/
│       ├── connectLocally.js
│       └── connectAtlas.js
├── middleware/             # Express middleware
│   ├── authMiddleware.js
│   ├── rateLimiter.js
│   └── logging/
├── models/                 # Mongoose models
│   ├── Users.js
│   ├── Cycles.js
│   ├── Preferences.js
│   ├── Notifications.js
│   └── ActivityLogs.js
├── routes/                 # API routes
│   ├── main.js
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── cycleRoutes.js
├── services/              # (To be implemented)
├── utils/                 # Utility functions
│   ├── functionHandlers.js
│   ├── normalizeResponses.js
│   └── logHelpers.js
├── validation/            # (To be implemented)
├── app.js                 # Express app
├── index.js              # Entry point
└── package.json          # Dependencies
```

## Logs

Logs are written to the `backend/logs/` directory:
- `application-YYYY-MM-DD.log` - All logs (retained 14 days)
- `error-YYYY-MM-DD.log` - Error logs only (retained 30 days)

View logs:
```bash
cd backend/logs
tail -f application-*.log
```

## Troubleshooting

### MongoDB Connection Error
**Error:** `MongoDB connection error`

**Solution:**
1. Ensure MongoDB is running: `mongod --version`
2. Check connection string in `.env`
3. For local MongoDB, ensure it's accessible at `localhost:27017`
4. For Atlas, ensure your IP is whitelisted and credentials are correct

### Port Already in Use
**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change port in `.env`: `PORT=5001`
2. Or kill existing process: `lsof -ti:5000 | xargs kill` (macOS/Linux)

### Module Not Found
**Error:** `Cannot find module 'xxx'`

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Start MongoDB** if not already running
2. **Start the backend server**: `npm run dev`
3. **Verify endpoints** work with curl or Postman
4. **Implement controllers and services** for full functionality
5. **Connect frontend** to backend API

## Development Workflow

1. Make changes to code
2. Server auto-reloads (with nodemon)
3. Check logs for errors
4. Test endpoints with curl or Postman
5. Write tests in `__tests__` directory

## Security Notes

- Session secrets use secure random strings
- Passwords will be hashed with bcryptjs (when auth is implemented)
- Rate limiting prevents brute force attacks
- MongoDB sanitization prevents NoSQL injection
- Helmet.js adds security headers
- CORS configured for frontend origin only

## Documentation

- Backend README: `backend/README.md`
- Architecture Template: `ARCHITECTURE_TEMPLATE.md`
- Setup Instructions: `BACKEND_SETUP_PROMPT.md`
- Implementation Summary: `BACKEND_IMPLEMENTATION_SUMMARY.md`

## Support

For issues or questions:
1. Check the logs in `backend/logs/`
2. Review the documentation files
3. Check MongoDB connection
4. Verify environment variables in `.env`
