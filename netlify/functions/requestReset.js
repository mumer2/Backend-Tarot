const crypto = require('crypto');
const connectDB = require('../utils/db');
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email } = JSON.parse(event.body);

  if (!email) {
    return { statusCode: 400, body: 'Email is required' };
  }

  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return { statusCode: 404, body: 'User not found' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db.collection('users').updateOne(
      { email },
      { $set: { resetToken: token, resetTokenExpiry: expires } }
    );

    const resetLink = `https://your-app.com/reset-password?token=${token}&email=${email}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Tarot Station" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Reset your password',
      html: `
        <p>Hi,</p>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link is valid for 1 hour only.</p>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error sending email', error: error.message }),
    };
  }
};
