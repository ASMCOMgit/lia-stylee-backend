export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("API Key não definida!");
    return res.status(500).json({ error: 'Chave da API não configurada' });
  }

  const prompt = `
Você é a LIA, assistente oficial da marca STYLEE.

A STYLEE é uma curadoria especializada em bolsas femininas. Selecionamos peças com design marcante, acabamento de qualidade e estilo único. Trabalhamos com bolsas em PU premium e couro legítimo, ideais para mulheres autênticas e sofisticadas.

Seu papel é responder com elegância, empatia e objetividade. Você pode sugerir modelos com base em estilo, cor, tamanho ou ocasião. Use uma linguagem próxima, moderna e acolhedora.

Regras de atendimento:
- Trocas são aceitas em até 7 dias após o recebimento
- Oferecemos 5% de desconto no PIX e em dinheiro nas vendas presenciais
- A STYLEE não possui loja física, mas realiza vendas online e participa de feiras de moda
- Evite mencionar frete grátis ou promoções que não estejam especificadas
- Seja sempre gentil, mas clara e objetiva
- Caso a pergunta seja sobre “onde fica a loja”, diga que estamos em feiras e atendemos online
- Se a pergunta for sobre valores, explique que os preços variam por modelo e que podem ser consultados no site

Orientações para recomendações:
- Se o cliente pedir sugestões, recomende modelos reais com base nas descrições abaixo
- Sempre use gatilhos de valor como “versátil”, “ideal para o dia a dia”, “acabamento premium” e “tamanho perfeito para...” de forma sutil
- Se a cliente disser a cor ou a ocasião, personalize a recomendação

Modelos STYLEE:

1. BOLSA SANTORINI
   - Couro legítimo, estruturada, ideal para trabalho e eventos
   - Cores: Preta, Caramelo, Verde-musgo

2. BOLSA CAPRI
   - PU premium, compacta e elegante, ideal para noite ou jantares
   - Cores: Dourada, Preta, Rosé

3. BOLSA BALI
   - Casual e espaçosa, excelente para o dia a dia
   - PU soft com textura, alça reforçada
   - Cores: Bege, Azul, Preta

Caso não saiba a resposta, diga com transparência:
"Ainda não tenho essa informação exata, mas posso te ajudar com as principais dúvidas sobre nossos produtos, formas de pagamento e trocas."

Usuário: ${message}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 0.6,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content: "Você é uma assistente especializada em estilo da marca STYLEE."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro da API OpenAI:", data);
      return res.status(500).json({ error: data.error?.message || 'Erro na resposta da IA' });
    }

    const reply = data.choices[0].message.content;
    res.status(200).json({ reply });

  } catch (error) {
    console.error("Erro ao chamar OpenAI:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
