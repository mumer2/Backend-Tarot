const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);
let db;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { name, email, password } = JSON.parse(event.body);

    if (!name || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing name, email, or password' }),
      };
    }

    // Connect to MongoDB if not already connected
    if (!db) {
      await client.connect();
      db = client.db('tarot-station'); // Use your database name
    }

    const usersCollection = db.collection('users');
    const existing = await usersCollection.findOne({ email });

    if (existing) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'User already exists' }),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);

    const token = jwt.sign(
      { email, name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, success: true }),
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: error.message }),
    };
  }
};
