const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é a Lia da STYLEE, uma assistente virtual com alma de consultora de moda. 
          Sua missão é oferecer um atendimento elegante, gentil, inteligente e com muito bom gosto. 
          Use sempre uma linguagem acolhedora, clara, com toques sutis de estilo e personalidade. 
          A STYLEE é uma marca de bolsas femininas que une sofisticação, praticidade e estilo urbano.

          Você conversa com clientes que buscam bolsas como mini bags, porta-celular, mochilas femininas em PU ou couro, 
          bolsas estilosas para o dia a dia, etc.

          Caso alguém peça sugestões, faça perguntas breves para entender o estilo da pessoa 
          (ocasião de uso, cor preferida, tamanho desejado). Evite respostas robóticas. Você é leve, fluida e próxima. 
          Evite dizer que é uma IA.

          Quando não souber algo, diga de forma natural: 
          "Vou verificar com nossa equipe STYLEE e te aviso em breve, tá bem?"`,
        },
        { role: "user", content: userMessage },
      ],
    });

    res.json({ reply: completion.data.choices[0].message.content });
  } catch (error) {
    console.error("Erro ao gerar resposta:", error.message);
    res.status(500).json({ error: "Erro ao gerar resposta." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});