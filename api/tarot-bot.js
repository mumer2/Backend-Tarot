const axios = require('axios');

module.exports = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        inputs: `You are a wise and mystical Tarot bot. Answer concisely.\nUser: ${prompt}\nBot:`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 60_000,
      }
    );

    const reply = response.data?.[0]?.generated_text?.split('Bot:')[1]?.trim();
    res.status(200).json({ reply: reply || '✨ The spirits are silent...' });
  } catch (error) {
    console.error('HuggingFace error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch reply from model.' });
  }
};
