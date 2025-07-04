const axios = require('axios');

module.exports = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/gpt2', // replace with better chat model
      { inputs: prompt },
      { headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` } }
    );

    const botReply = Array.isArray(response.data) ? response.data[0].generated_text : '';
    return res.status(200).json({ reply: botReply });
  } catch (err) {
    console.error('🤖 HF error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Inference API failed' });
  }
};
