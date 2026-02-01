const mongoose = require('mongoose');
const { logDatabase } = require('../../utils/log-helpers');

const connectLocally = async () => {
  const uri = process.env.MONGO_LOCAL_URI || 'mongodb://localhost:27017/FreeMikvahCal';

  await mongoose.connect(uri);

  logDatabase('connect', 'MongoDB', {
    connectionType: 'local',
    uri: uri.replace(/\/\/.*@/, '//***@'), // Mask credentials if present
    environment: process.env.NODE_ENV || 'development'
  });
};

module.exports = connectLocally;
