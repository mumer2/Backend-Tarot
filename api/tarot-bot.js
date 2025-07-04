const axios = require('axios');

module.exports = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are a mystical Tarot AI assistant. Keep replies short, poetic, and spiritual.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY_TAROT}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error('[Groq Error]', error.response?.data || error.message);
    res.status(500).json({ error: 'Groq API call failed' });
  }
};
