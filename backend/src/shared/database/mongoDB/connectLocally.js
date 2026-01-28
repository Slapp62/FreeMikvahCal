const mongoose = require('mongoose');

const connectLocally = async () => {
  const uri = process.env.MONGO_LOCAL_URI || 'mongodb://localhost:27017/FreeMikvahCal';

  await mongoose.connect(uri);

  console.log('Connected to local MongoDB:', uri);
};

module.exports = connectLocally;
