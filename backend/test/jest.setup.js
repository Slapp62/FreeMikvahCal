process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret';
process.env.MONGO_LOCAL_URI = process.env.MONGO_LOCAL_URI || 'mongodb://localhost:27017/freemikvahcal-test';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

