const axios = require('axios');

module.exports = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
        },
      }
    );

    const output = response.data[0]?.generated_text || "✨ The cards are unclear...";
    res.status(200).json({ reply: output });
  } catch (error) {
    console.error('HuggingFace API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get reply from model.' });
  }
};
