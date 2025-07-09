// netlify/functions/utils/db.js
const { MongoClient } = require('mongodb');

let cachedDB = null;

const uri = process.env.MONGO_URI;

async function connectDB() {
  if (cachedDB) return cachedDB;

  if (!uri) {
    throw new Error('MONGO_URI not defined in environment variables');
  }

  const client = new MongoClient(uri);
  await client.connect();
  cachedDB = client.db(); // Use default DB
  return cachedDB;
}

module.exports = connectDB;
