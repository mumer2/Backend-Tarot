const axios = require('axios');

exports.handler = async function (event, context) {
  console.log("🔮 Tarot bot triggered");
  try {
    const body = JSON.parse(event.body || '{}');
    console.log("📥 Prompt received:", body.prompt);

    if (!body.prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing prompt' }),
      };
    }

    // ... OpenAI API call here
  } catch (error) {
    console.error('🔥 Tarot Function Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};
