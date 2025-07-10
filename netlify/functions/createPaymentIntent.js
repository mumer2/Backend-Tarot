const stripe = require('stripe')(process.env.Secret_key);
const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { amount, userId } = JSON.parse(event.body);

    // 🛡️ Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid or missing amount' }),
      };
    }

    // 🛡️ Validate userId
    if (!userId || typeof userId !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid or missing userId' }),
      };
    }

    // 🧾 Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.floor(amount * 100), // convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { userId },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (error) {
    console.error('❌ Stripe error:', error.message);

    // 🧠 Handle specific Stripe errors if needed
    if (error.type === 'StripeCardError') {
      return {
        statusCode: 402,
        body: JSON.stringify({ message: error.message }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error: ' + error.message }),
    };
  }
};
