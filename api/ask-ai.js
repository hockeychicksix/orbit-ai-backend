export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Missing prompt' });
  }

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that turns brain dumps from moms into clear prioritized to-do lists.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await openaiResponse.json();

    // Debug logging (optional, remove before production)
    console.log('OpenAI response:', JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices.length) {
      return res.status(500).json({ message: 'Invalid OpenAI response', data });
    }

    const result = data.choices[0].message.content;
    res.status(200).json({ result });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
}
