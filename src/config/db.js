const mongoose = require('mongoose');
const env = require('./env');

/**
 * Connect to MongoDB using MONGO_URI (or MONGO_URL) env var.
 * Logs success / failure and exits the process on failure.
 */
async function connectDb() {
  const uri = env.mongoUri;

  if (!uri) {
    console.error('❌  MONGO_URI (or MONGO_URL) environment variable is required');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: 'trippio' });
    console.log(`✅  MongoDB connected – ${mongoose.connection.host}`);
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDb;
