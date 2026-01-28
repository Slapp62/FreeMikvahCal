const connectLocally = require('../database/mongoDB/connectLocally');
const connectAtlas = require('../database/mongoDB/connectAtlas');
const logger = require('../config/logger');
const { logError } = require('../utils/log-helpers');

const connectDB = async () => {
  const env = process.env.NODE_ENV || 'development';
  const startTime = Date.now();

  try {
    if (env === 'production') {
      await connectAtlas();
    } else {
      await connectLocally();
    }

    const duration = Date.now() - startTime;
    logger.info('MongoDB connected successfully', {
      type: 'database',
      environment: env,
      connectionType: env === 'production' ? 'atlas' : 'local',
      duration
    });
  } catch (error) {
    logError(error, {
      operation: 'database_connection',
      environment: env
    });
    process.exit(1);
  }
};

module.exports = { connectDB };
