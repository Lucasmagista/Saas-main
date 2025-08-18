// Endpoint: /api/ai/providers
// Lista os provedores/modelos disponíveis para o frontend

// Exemplo: adapte para buscar do seu banco/config se necessário
module.exports = async (req, res) => {
  res.json([
    {
      id: 'openai',
      name: 'OpenAI',
      logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/openai.svg',
      docs: 'https://platform.openai.com/docs',
      description: 'Modelos de ponta da OpenAI.',
      versions: [
        { id: 'gpt-5', name: 'GPT-5 (Novo)', available: true },
        { id: 'gpt-4o', name: 'GPT-4o', available: true },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', available: true },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', available: true },
      ]
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/anthropic.svg',
      docs: 'https://docs.anthropic.com/claude',
      description: 'Família de modelos Claude.',
      versions: [
        { id: 'claude-4-opus', name: 'Claude 4 Opus (Novo)', available: true },
        { id: 'claude-3-opus', name: 'Claude 3 Opus', available: true },
        { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', available: true },
        { id: 'claude-3-haiku', name: 'Claude 3 Haiku', available: false },
      ]
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      logo: 'https://deepseek.com/favicon.ico',
      docs: 'https://platform.deepseek.com/docs',
      description: 'Modelos DeepSeek para código e linguagem.',
      versions: [
        { id: 'deepseek-coder', name: 'DeepSeek Coder', available: true },
        { id: 'deepseek-llm', name: 'DeepSeek LLM', available: true },
      ]
    },
    {
      id: 'qwen',
      name: 'Qwen',
      logo: 'https://qwen.openai.com/favicon.ico',
      docs: 'https://qwen.openai.com/docs',
      description: 'Modelos Qwen (Alibaba Cloud).',
      versions: [
        { id: 'qwen-2-72b', name: 'Qwen 2 72B', available: true },
        { id: 'qwen-2-14b', name: 'Qwen 2 14B', available: true },
      ]
    },
    {
      id: 'google',
      name: 'Google Gemini',
      logo: 'https://ai.google.dev/static/images/favicon.ico',
      docs: 'https://ai.google.dev/docs',
      description: 'Modelos poderosos da família Gemini.',
      versions: [
        { id: 'gemini-2-ultra', name: 'Gemini 2 Ultra (Novo)', available: true },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', available: true },
        { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', available: false },
      ]
    },
    {
      id: 'mistral',
      name: 'Mistral AI',
      logo: 'https://avatars.githubusercontent.com/u/139761605?s=200&v=4',
      docs: 'https://docs.mistral.ai/',
      description: 'Modelos open-source e comerciais Mistral/Mixtral.',
      versions: [
        { id: 'mixtral-8x22b', name: 'Mixtral 8x22B', available: true },
        { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', available: true },
      ]
    },
    {
      id: 'llama',
      name: 'Meta Llama',
      logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/meta.svg',
      docs: 'https://llama.meta.com/llama-downloads/',
      description: 'Modelos open-source Llama.',
      versions: [
        { id: 'llama-3-70b', name: 'Llama 3 70B', available: true },
        { id: 'llama-3-8b', name: 'Llama 3 8B', available: true },
      ]
    },
    {
      id: 'groq',
      name: 'Groq',
      logo: 'https://groq.com/favicon.ico',
      docs: 'https://console.groq.com/docs',
      description: 'Modelos Groq para inferência ultra-rápida.',
      versions: [
        { id: 'llama-3-70b-groq', name: 'Llama 3 70B (Groq)', available: true },
        { id: 'mixtral-8x7b-groq', name: 'Mixtral 8x7B (Groq)', available: true },
      ]
    },
    {
      id: 'perplexity',
      name: 'Perplexity AI',
      logo: 'https://www.perplexity.ai/favicon.ico',
      docs: 'https://docs.perplexity.ai/',
      description: 'Modelos Perplexity para busca e chat.',
      versions: [
        { id: 'pplx-70b-online', name: 'PPLX 70B Online', available: true },
        { id: 'pplx-llama-3', name: 'PPLX Llama 3', available: true },
      ]
    }
  ]);
};
