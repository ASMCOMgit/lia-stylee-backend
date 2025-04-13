const { Configuration, OpenAIApi } = require("openai");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mensagem não fornecida." });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    return res.status(500).json({ error: "Chave da OpenAI não configurada." });
  }

  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });

  const openai = new OpenAIApi(configuration);

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em moda e estilo da marca STYLEE.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.data.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Erro na chamada da OpenAI:", err.response?.data || err.message);
    return res.status(500).json({ error: "Erro na resposta da IA." });
  }
};
