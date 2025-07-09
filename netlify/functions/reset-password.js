const bcrypt = require('bcryptjs');
const connectDB = require('../utils/db');

exports.handler = async (event) => {
  const { email, resetCode, newPassword } = JSON.parse(event.body);
  const db = await connectDB();
  const user = await db.collection('users').findOne({ email });

  if (!user || user.resetCode !== resetCode) {
    return { statusCode: 400, body: 'Invalid reset code' };
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await db.collection('users').updateOne(
    { email },
    { $set: { password: hashed }, $unset: { resetCode: '' } }
  );

  return { statusCode: 200, body: 'Password updated successfully' };
};
