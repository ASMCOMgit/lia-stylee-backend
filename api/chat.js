export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("❌ API Key não definida!");
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
            content: "Você é a LIA, assistente virtual da STYLEE, uma marca brasileira de bolsas femininas com estilo autêntico e sofisticação. Sua missão é ajudar cada cliente a encontrar a bolsa ideal com base no seu gosto pessoal, ocasião ou estilo desejado. Responda sempre de forma elegante, acolhedora e objetiva, como se estivesse atendendo presencialmente no showroom da STYLEE. Se possível, recomende categorias como Mini Bags, Bolsas Porta-Celular, Bolsas em PU ou Mochilas Estilosas."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🔴 Erro da OpenAI:", data);
      return res.status(500).json({ error: data.error?.message || 'Erro na resposta da IA' });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("⚠️ Erro na requisição:", error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
