const mongoose = require('mongoose');

const connectAtlas = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  await mongoose.connect(uri, {
    retryWrites: true,
    w: 'majority'
  });

  console.log('Connected to MongoDB Atlas');
};

module.exports = connectAtlas;
