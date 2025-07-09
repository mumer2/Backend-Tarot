// netlify/functions/utils/db.js

const { MongoClient } = require('mongodb');

let cachedClient = null;

const uri = process.env.MONGO_URI;

async function connectDB() {
  if (cachedClient) return cachedClient;

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client.db(); // get default DB
  return cachedClient;
}

module.exports = connectDB;
