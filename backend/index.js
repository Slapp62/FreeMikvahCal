<<<<<<< HEAD
require('dotenv').config();
const { validateEnv } = require('./utils/validateEnv');
const app = require('./app');
const { connectDB } = require('./database/dbService');
const logger = require('./config/logger');

// Validate environment variables before starting
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

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
=======
import express, { json } from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import userRouter from './routes/users.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
    try {
        await connect(process.env.MONGO_URI);
        console.log('MongoDB URI', process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error', error);
        process.exit(1);
    }
}
connectDB();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(json());

app.use('/api/users', userRouter);

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})

>>>>>>> master
