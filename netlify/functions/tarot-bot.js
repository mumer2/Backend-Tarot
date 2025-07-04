const axios = require('axios');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Only POST method is allowed.' }),
    };
  }

  const { prompt } = JSON.parse(event.body);

  if (!prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Prompt is missing.' }),
    };
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content:
              'You are a magical Tarot AI. Give mystical advice with poetic language.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: reply || '✨ The spirits are silent.' }),
    };
  } catch (error) {
    console.error('[Groq API Error]', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Groq API failed.' }),
    };
  }
};
