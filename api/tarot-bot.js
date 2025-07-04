const axios = require('axios');

module.exports = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768', // ✅ Supported Groq model
        messages: [
          {
            role: 'system',
            content: 'You are a mystical tarot bot. Answer in short poetic language.',
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

    const botReply = response.data?.choices?.[0]?.message?.content || '✨ The spirits are silent.';
    return res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error('[Groq API Error]', error.response?.data || error.message);
    return res.status(500).json({ error: 'Groq API failed.' });
  }
};
