const axios = require('axios');

module.exports = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a mystical Tarot bot...' },
          { role: 'user', content: prompt },
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

    const reply = response.data.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('[OpenAI Error]', err.response?.data || err.message);
    return res.status(500).json({ error: 'OpenAI API failed' });
  }
};
