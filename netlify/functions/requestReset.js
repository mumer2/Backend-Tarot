const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email is required' }),
      };
    }

    await client.connect();
    const db = client.db('tarot-station');
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString(); // OTP or token

    await db.collection('reset_tokens').insertOne({
      email,
      token,
      createdAt: new Date(),
    });

    await transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Your password reset code is: <strong>${token}</strong></p>`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent' }),
    };
  } catch (err) {
    console.error('Reset error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: err.message }),
    };
  }
};
