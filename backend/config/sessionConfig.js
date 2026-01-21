const session = require('express-session');
const MongoStore = require('connect-mongo');

// Use the appropriate MongoDB URI based on environment
const mongoUrl = process.env.NODE_ENV === 'production'
  ? process.env.MONGO_ATLAS_URI
  : process.env.MONGO_LOCAL_URI;

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUrl,
    touchAfter: 24 * 3600 // Lazy session update (seconds)
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax' // 'lax' is secure since frontend and backend are same domain on Render
  }
};

module.exports = sessionConfig;
