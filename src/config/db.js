const mongoose = require('mongoose');
const env = require('./env');

/** JSON.stringify on an Error yields `{}` — no message/stack — because
 * those are non-enumerable own properties. Pull out the parts that matter. */
function describeError(err) {
  if (!err) return err;
  return { name: err.name, message: err.message, code: err.code };
}

/** Strips the password out of a mongodb(+srv):// URI so it's safe to log. */
function redactUri(uri) {
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+(@)/, '$1***$2');
}

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

  console.log(`⏳  Connecting to MongoDB – ${redactUri(uri)}`);

  try {
    await mongoose.connect(uri, { dbName: 'trippio' });
    console.log(`✅  MongoDB connected – ${mongoose.connection.host}`);
  } catch (err) {
    // err.message alone is often just "connect ECONNREFUSED" or a generic
    // "no servers found" — the *why* (auth failure, TLS failure, DNS
    // failure, timeout) usually lives on these other fields instead.
    console.error('❌  MongoDB connection failed');
    console.error('    name:', err.name);
    console.error('    code:', err.code, err.codeName ?? '');
    console.error('    message:', err.message);
    // The per-server errors inside reason.servers are what actually explain
    // a ReplicaSetNoPrimary failure — each shard's real underlying error
    // (ETIMEDOUT, ECONNREFUSED, a TLS alert, DNS failure) lives here.
    const servers = err.reason?.servers ?? err.cause?.servers;
    const entries = servers instanceof Map ? servers.entries() : Object.entries(servers ?? {});
    for (const [address, desc] of entries) {
      console.error(`    server ${address}:`, JSON.stringify(describeError(desc.error)));
    }
    process.exit(1);
  }
}

module.exports = connectDb;
