const mongoose = require('mongoose');

/**
 * Connect to MongoDB using MONGO_URL env var.
 * Logs success / failure and exits the process on failure.
 */
async function connectDb() {
  const uri = process.env.MONGO_URL;

  if (!uri) {
    console.error('❌  MONGO_URL environment variable is required');
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
