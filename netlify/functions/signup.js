const bcrypt = require('bcryptjs');
const connectDB = require('../utils/db');
const { generateToken } = require('../utils/auth');

exports.handler = async (event) => {
  const { email, password } = JSON.parse(event.body);
  const db = await connectDB();
  const existing = await db.collection('users').findOne({ email });

  if (existing) {
    return { statusCode: 400, body: 'User already exists.' };
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = { email, password: hashed };
  await db.collection('users').insertOne(user);

  const token = generateToken({ email });
  return {
    statusCode: 200,
    body: JSON.stringify({ token, email }),
  };
};
