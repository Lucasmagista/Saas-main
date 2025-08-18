// Rota de backend para proxy de múltiplos modelos de IA
const express = require('express');
const router = express.Router();

// Aqui você pode importar SDKs oficiais ou usar fetch/axios para cada modelo
// Exemplo: const { OpenAI } = require('openai');

// Simulação de leitura das chaves do .env
const availableModels = [
  { id: 'openai', env: 'OPENAI_API_KEY', name: 'OpenAI' },
  { id: 'claude', env: 'CLAUDE_API_KEY', name: 'Claude' },
  { id: 'deepseek', env: 'DEEPSEEK_API_KEY', name: 'DeepSeek' },
  { id: 'qwen', env: 'QWEN_API_KEY', name: 'Qwen' },
  { id: 'gemini', env: 'GEMINI_API_KEY', name: 'Gemini' },
  { id: 'mistral', env: 'MISTRAL_API_KEY', name: 'Mistral' },
  { id: 'llama', env: 'LLAMA_API_KEY', name: 'Llama' },
];

// Endpoint para listar modelos disponíveis
router.get('/models', (req, res) => {
  const models = availableModels.map((m) => ({
    id: m.id,
    name: m.name,
    available: !!process.env[m.env],
  }));
  res.json(models);
});

// Endpoint principal do chat
router.post('/chat', async (req, res) => {
  const { model, messages, config } = req.body;
  if (!model || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Parâmetros inválidos.' });
  }
  try {
    let response = '';
    const temperature = config?.temperature ?? 1;
    const max_tokens = config?.max_tokens ?? 1024;
    const fetch = require('node-fetch');
    // --- Mapeamento de modelo e provedor ---
    let provider = model;
    let modelName = model;
    // Exemplo: 'openai/gpt-5' => provider: 'openai', modelName: 'gpt-5'
    if (model.includes('/')) {
      const [prov, mod] = model.split('/');
      provider = prov;
      modelName = mod;
    }
    // OPENAI
    if (provider === 'openai') {
      // Se modelName não for informado, usa 'gpt-4o' como padrão
      const openaiModel = modelName && modelName !== 'openai' ? modelName : 'gpt-4o';
      const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: openaiModel,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature,
          max_tokens
        })
      });
      const data = await apiRes.json();
      response = data.choices?.[0]?.message?.content || '[Sem resposta da OpenAI]';
    }
    // CLAUDE (Anthropic)
    else if (provider === 'claude') {
      const claudeModel = modelName && modelName !== 'claude' ? modelName : 'claude-3-sonnet-20240229';
      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: claudeModel,
          max_tokens,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature
        })
      });
      const data = await apiRes.json();
      response = data.content?.[0]?.text || '[Sem resposta da Claude]';
    }
    // GEMINI (Google)
    else if (provider === 'gemini') {
      const geminiModel = modelName && modelName !== 'gemini' ? modelName : 'gemini-pro';
      const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: messages.map(m => ({ text: m.content })) }],
          generationConfig: { temperature, maxOutputTokens: max_tokens }
        })
      });
      const data = await apiRes.json();
      response = data.candidates?.[0]?.content?.parts?.[0]?.text || '[Sem resposta da Gemini]';
    }
    // MISTRAL
    else if (provider === 'mistral') {
      const mistralModel = modelName && modelName !== 'mistral' ? modelName : 'mistral-large-latest';
      const apiRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: mistralModel,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature,
          max_tokens
        })
      });
      const data = await apiRes.json();
      response = data.choices?.[0]?.message?.content || '[Sem resposta da Mistral]';
    }
    // DEEPSEEK
    else if (provider === 'deepseek') {
      const deepseekModel = modelName && modelName !== 'deepseek' ? modelName : 'deepseek-chat';
      const apiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: deepseekModel,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature,
          max_tokens
        })
      });
      const data = await apiRes.json();
      response = data.choices?.[0]?.message?.content || '[Sem resposta da DeepSeek]';
    }
    // QWEN
    else if (provider === 'qwen') {
      const qwenModel = modelName && modelName !== 'qwen' ? modelName : 'qwen-turbo';
      const apiRes = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: qwenModel,
          input: { messages: messages.map(m => ({ role: m.role, content: m.content })) },
          parameters: { temperature, max_tokens }
        })
      });
      const data = await apiRes.json();
      response = data.output?.choices?.[0]?.message?.content || '[Sem resposta da Qwen]';
    }
    // LLAMA (Meta)
    else if (provider === 'llama') {
      response = '[Integração Llama não implementada: configure endpoint]';
    }
    else {
      response = '[Provider/model não suportado neste backend]';
    }
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar IA', details: err.message });
  }
});

module.exports = router;
