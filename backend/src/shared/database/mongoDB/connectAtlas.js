const mongoose = require('mongoose');
const { logDatabase } = require('../../utils/log-helpers');

const connectAtlas = async () => {
  const uri = process.env.MONGO_ATLAS_URI;

  if (!uri) {
    throw new Error('MONGO_ATLAS_URI environment variable is not set');
  }

  await mongoose.connect(uri, {
    retryWrites: true,
    w: 'majority'
  });

  logDatabase('connect', 'MongoDB', {
    connectionType: 'atlas',
    environment: process.env.NODE_ENV || 'development'
  });
};

module.exports = connectAtlas;
