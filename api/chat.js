export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Mensagem é obrigatória" });
    }

    return res.status(200).json({
      reply: `Você procurou por: ${message}`
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
