export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API não configurada' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 0.8,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: "Você é a LIA, assistente virtual da STYLEE..."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message });

    const reply = data.choices[0].message.content;
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
