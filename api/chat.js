
import { config } from "dotenv";
config();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { prompt } = req.body;
  const {
    OPENAI_API_KEY,
    TINY_API_URL
  } = process.env;

  if (!OPENAI_API_KEY || !TINY_API_URL) {
    return res.status(500).json({ error: "Variáveis de ambiente não configuradas corretamente" });
  }

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um assistente que converte comandos em português para chamadas da API V3 do Tiny ERP. Use os endpoints em português como '/produtos', '/contatos', etc. Responda com JSON contendo os campos: endpoint, method, payload e action. Ao criar produtos, use os campos nome, codigo, preco e estoque.saldo. Nunca use endpoints em inglês. Não explique. Responda apenas o JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
      })
    });

    const rawText = await openaiResponse.text();
    let gptResponse;
    try {
      gptResponse = JSON.parse(rawText);
    } catch (err) {
      return res.status(500).json({ error: "Erro ao interpretar resposta da OpenAI", raw: rawText });
    }

    const content = gptResponse.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: "Resposta da OpenAI vazia ou inválida", raw: gptResponse });
    }

    let command;
    try {
      command = JSON.parse(content);
    } catch (err) {
      return res.status(400).json({ error: "Resposta da OpenAI não está em formato JSON válido", content });
    }

    const { endpoint, method, payload, action } = command;

    if (action === "create" && method === "POST") {
      try {
        const tinyResponse = await fetch(`${TINY_API_URL}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${global.access_token}`
          },
          body: JSON.stringify(payload)
        });

        const tinyData = await tinyResponse.json();
        return res.status(200).json({
          mensagem: "Comando executado com sucesso.",
          requisicao: command,
          resposta: tinyData
        });
      } catch (err) {
        return res.status(500).json({ error: "Erro ao enviar requisição para o Tiny", detalhes: err.message });
      }
    }

    return res.status(200).json({
      mensagem: "Comando reconhecido, mas não executado automaticamente.",
      requisicao: command
    });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Erro inesperado no servidor" });
  }
}
