const axios = require('axios');

exports.handler = async function (event, context) {
  const { prompt } = JSON.parse(event.body || '{}');

  if (!prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No prompt provided' }),
    };
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a mystical tarot bot. Respond in symbolic and spiritual tone.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: response.data.choices[0].message.content }),
    };
  } catch (error) {
    console.error('OpenAI API failed:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OpenAI request failed' }),
    };
  }
};
