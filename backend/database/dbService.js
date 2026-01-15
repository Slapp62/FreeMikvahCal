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
