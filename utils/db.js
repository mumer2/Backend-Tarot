const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db = null;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('tarot-station');
  }
  return db;
}

module.exports = connectDB;
