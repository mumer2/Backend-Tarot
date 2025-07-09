const connectDB = require('../utils/db');
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  const { email } = JSON.parse(event.body);
  const db = await connectDB();
  const user = await db.collection('users').findOne({ email });

  if (!user) return { statusCode: 404, body: 'User not found' };

  const token = Math.floor(100000 + Math.random() * 900000).toString();
  await db.collection('users').updateOne({ email }, { $set: { resetCode: token } });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    subject: 'Reset Code',
    text: `Your reset code is: ${token}`,
  });

  return { statusCode: 200, body: 'Reset code sent to email' };
};
