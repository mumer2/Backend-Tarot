const connectDB = require('../utils/db');
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email } = JSON.parse(event.body);
  if (!email) {
    return { statusCode: 400, body: 'Email required' };
  }

  const db = await connectDB();
  const user = await db.collection('users').findOne({ email });

  if (!user) {
    return { statusCode: 404, body: 'User not found' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + 1000 * 60 * 15; // 15 min

  await db.collection('reset_tokens').insertOne({
    email,
    token,
    expiresAt: new Date(expiry),
  });

  const resetLink = `tarotstation://reset-password?token=${token}`;

  console.log(`Reset link: ${resetLink}`); // Later replace with email sending

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Reset link generated (check console).' }),
  };
};
