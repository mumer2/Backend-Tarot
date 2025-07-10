// netlify/functions/getTransactions.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

exports.handler = async (event) => {
  const client = new MongoClient(process.env.MONGO_URI);
  const userId = event.queryStringParameters.userId;

  try {
    await client.connect();
    const db = client.db('tarot-station');

    const history = await db
      .collection('wallet_transactions')
      .find({ userId })
      .sort({ date: -1 })
      .toArray();

    return {
      statusCode: 200,
      body: JSON.stringify(history),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    await client.close();
  }
};
