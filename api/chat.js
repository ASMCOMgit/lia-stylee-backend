export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensagem não fornecida.' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um assistente de moda da STYLEE, especializado em recomendar bolsas femininas sofisticadas com base no estilo da cliente. Seja direto e elegante nas respostas."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    const data = await response.json();

    if (response.status !== 200) {
      console.error("Erro da OpenAI:", data);
      return res.status(500).json({ error: 'Erro na resposta da IA.' });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    res.status(200).json({ reply });
  } catch (err) {
    console.error("Erro geral:", err);
    res.status(500).json({ error: 'Erro ao processar a requisição.' });
  }
}
