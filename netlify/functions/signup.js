const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = {}; // In-memory mock DB (replace with real DB)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, password } = JSON.parse(event.body);
    if (!email || !password) {
      return { statusCode: 400, body: 'Missing fields' };
    }

    if (users[email]) {
      return { statusCode: 409, body: 'User already exists' };
    }

    const hashed = await bcrypt.hash(password, 10);
    users[email] = { email, password: hashed };

    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'your-secret-key');
    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: err.message }),
    };
  }
};
