// Endpoint: /api/ai/chat
// Recebe provider, model e messages, responde com a IA real

const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const OPENAI_KEY = process.env.OPENAI_KEY;
const GEMINI_KEY = process.env.GEMINI_KEY;
const CLAUDE_KEY = process.env.CLAUDE_KEY;
const COHERE_KEY = process.env.COHERE_KEY;
const MISTRAL_KEY = process.env.MISTRAL_KEY;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const { provider, model, messages } = req.body;
  if (!provider || !model || !messages) return res.status(400).json({ error: 'Dados incompletos' });

  try {
    let response = '';
    if (provider === 'openai') {
      const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          stream: false
        })
      });
      const data = await apiRes.json();
      response = data.choices?.[0]?.message?.content || '[Sem resposta da OpenAI]';
    } else if (provider === 'google') {
      // Gemini API (exemplo simplificado, adapte para produção)
      const apiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + GEMINI_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: messages.map(m => ({ text: m.content })) }] })
      });
      const data = await apiRes.json();
      response = data.candidates?.[0]?.content?.parts?.[0]?.text || '[Sem resposta da Gemini]';
    } else if (provider === 'anthropic') {
      // Claude API (Anthropic)
      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': CLAUDE_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await apiRes.json();
      response = data.content?.[0]?.text || '[Sem resposta da Claude]';
    } else if (provider === 'cohere') {
      // Cohere Command R+
      const apiRes = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COHERE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          message: messages[messages.length - 1]?.content,
          chat_history: messages.slice(0, -1).map(m => ({ role: m.role, message: m.content }))
        })
      });
      const data = await apiRes.json();
      response = data.text || '[Sem resposta da Cohere]';
    } else if (provider === 'mistral') {
      // Mistral/Mixtral
      const apiRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MISTRAL_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          stream: false
        })
      });
      const data = await apiRes.json();
      response = data.choices?.[0]?.message?.content || '[Sem resposta da Mistral]';
    } else {
      response = '[Provider/model não suportado neste backend]';
    }
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar IA', details: err.message });
  }
};
