const bcrypt = require('bcryptjs');
const connectDB = require('../utils/db');
const { generateToken } = require('../utils/auth');

exports.handler = async (event) => {
  const { email, password } = JSON.parse(event.body);
  const db = await connectDB();
  const user = await db.collection('users').findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { statusCode: 401, body: 'Invalid credentials' };
  }

  const token = generateToken({ email });
  return {
    statusCode: 200,
    body: JSON.stringify({ token, email }),
  };
};
