import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Bot, ChevronRight } from "lucide-react";

// Modelos suportados (pode ser expandido facilmente)
const AI_MODELS = [
  {
    id: "openai",
    name: "OpenAI (GPT-4, GPT-3.5)",
    envKey: "OPENAI_API_KEY",
    description: "Modelos da OpenAI, incluindo GPT-4 Turbo e GPT-3.5 Turbo.",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/openai.svg",
    docs: "https://platform.openai.com/docs/",
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    envKey: "CLAUDE_API_KEY",
    description: "Modelos Claude 3 Opus, Sonnet, Haiku (Anthropic).",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/anthropic.svg",
    docs: "https://docs.anthropic.com/claude/",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    envKey: "DEEPSEEK_API_KEY",
    description: "Modelos DeepSeek (open source, code e chat).",
    logo: "https://deepseek.com/favicon.ico",
    docs: "https://platform.deepseek.com/docs/",
  },
  {
    id: "qwen",
    name: "Qwen (Alibaba)",
    envKey: "QWEN_API_KEY",
    description: "Modelos Qwen da Alibaba Cloud.",
    logo: "https://qianwen-res.oss-cn-beijing.aliyuncs.com/qianwen/favicon.ico",
    docs: "https://help.aliyun.com/zh/dashscope/developer-reference/api-overview",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    envKey: "GEMINI_API_KEY",
    description: "Modelos Gemini da Google (ex-Bard).",
    logo: "https://ai.google.dev/static/images/favicon.ico",
    docs: "https://ai.google.dev/docs/",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    envKey: "MISTRAL_API_KEY",
    description: "Modelos Mistral (open source e API).",
    logo: "https://mistral.ai/favicon.ico",
    docs: "https://docs.mistral.ai/",
  },
  {
    id: "llama",
    name: "Meta Llama",
    envKey: "LLAMA_API_KEY",
    description: "Modelos Llama da Meta (via API ou local).",
    logo: "https://llama.meta.com/favicon.ico",
    docs: "https://llama.meta.com/docs/",
  },
];


// Busca modelos disponíveis do backend
async function fetchAvailableModels() {
  const res = await fetch("/api/ai-assistant/models");
  if (!res.ok) return AI_MODELS.map((m) => ({ ...m, available: false }));
  const data = await res.json();
  // Mescla info local com info do backend
  return AI_MODELS.map((m) => {
    const found = data.find((d) => d.id === m.id);
    return { ...m, available: found ? found.available : false };
  });
}

// CORREÇÃO: Adicionada a definição do componente funcional
export default function AIAssistantPage() {
  const [availableModels, setAvailableModels] = useState(AI_MODELS.map(m => ({ ...m, available: false })));
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [input, setInput] = useState("");
  // Histórico separado por modelo
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Configurações rápidas
  const [temperature, setTemperature] = useState(1);
  const [maxTokens, setMaxTokens] = useState(1024);

  useEffect(() => {
    fetchAvailableModels().then(setAvailableModels);
  }, []);

  const currentModel = availableModels.find((m) => m.id === selectedModel);
  // Mensagens do modelo atual
  const messages = history[selectedModel] || [
    { role: "assistant", content: "Olá! Escolha um modelo de IA ao lado e comece a conversar." },
  ];

  // Envio real para o backend
  const sendMessage = async () => {
    if (!input.trim() || !currentModel?.available) return;
    const newHistory = { ...history };
    const userMsg = { role: "user", content: input };
    
    // Garante que o histórico para o modelo selecionado existe antes de adicionar a mensagem
    if (!newHistory[selectedModel]) {
      newHistory[selectedModel] = [];
    }
    
    newHistory[selectedModel] = [...newHistory[selectedModel], userMsg];
    
    setHistory(newHistory);
    setLoading(true);
    setInput("");
    setError("");

    try {
      const res = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: currentModel.id,
          messages: newHistory[selectedModel],
          config: { temperature, max_tokens: maxTokens },
        }),
      });
      if (!res.ok) throw new Error("Erro ao consultar IA");
      const data = await res.json();
      const updatedHistory = { ...newHistory };
      updatedHistory[selectedModel] = [
        ...updatedHistory[selectedModel],
        { role: "assistant", content: data.response || "(Sem resposta)" },
      ];
      setHistory(updatedHistory);
    } catch (err) {
      const errorHistory = { ...newHistory };
      errorHistory[selectedModel] = [
        ...errorHistory[selectedModel],
        { role: "assistant", content: "Erro ao consultar IA: " + (err.message || err) },
      ];
      setHistory(errorHistory);
      setError("Erro ao consultar IA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex flex-col lg:flex-row gap-8">
      {/* Sidebar de modelos */}
      <aside className="w-full max-w-xs flex-shrink-0">
        <Card className="mb-6">
          <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Bot className="w-5 h-5 text-purple-600" />
      Modelos de IA
    </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {availableModels.map((model) => (
                <Button
                  key={model.id}
                  variant={selectedModel === model.id ? "default" : "outline"}
                  className="flex items-center gap-2 justify-start"
                  onClick={() => setSelectedModel(model.id)}
                  disabled={!model.available}
                >
                  <img src={model.logo} alt={model.name} className="w-5 h-5 rounded" />
                  <span>{model.name}</span>
                  {!model.available && (
                    <Badge variant="destructive" className="ml-2">Indisponível</Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        {currentModel && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src={currentModel.logo} alt={currentModel.name} className="w-6 h-6 rounded" />
                {currentModel.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 mb-2">{currentModel.description}</p>
              <a href={currentModel.docs} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">Ver documentação</a>
            </CardContent>
          </Card>
        )}
      </aside>

      {/* Área de chat */}
      <main className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Chat com IA
              <span className="ml-2 text-xs text-gray-500">({currentModel?.name})</span>
            </CardTitle>
            {/* Configurações rápidas */}
            <div className="flex gap-4 mt-4 items-center">
              <div className="flex flex-col">
                <label htmlFor="temperature-range" className="text-xs text-gray-500">Temperatura</label>
                <input
                  id="temperature-range"
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={e => setTemperature(Number(e.target.value))}
                  className="w-32"
                  aria-labelledby="temperature-range-label"
                />
                <span className="text-xs text-gray-700">{temperature}</span>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Max Tokens</label>
                <input
                  type="number"
                  min={128}
                  max={4096}
                  value={maxTokens}
                  onChange={e => setMaxTokens(Number(e.target.value))}
                  className="w-24 border rounded px-1 py-0.5 text-xs"
                  placeholder="Max tokens"
                />
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => setHistory(h => ({ ...h, [selectedModel]: [{ role: 'assistant', content: 'Histórico limpo.' }] }))}>
                Limpar histórico
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-white border shadow-sm"}`}>
                    <span className="text-sm whitespace-pre-wrap">{msg.content}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm p-3 rounded-lg flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-auto">
              <Input
                placeholder={`Digite sua pergunta para ${currentModel?.name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // Impede submit/reload
                    if (!loading && input.trim()) {
                      sendMessage();
                    }
                  }
                }}
                disabled={loading}
                className="flex-1"
              />
              <Button type="button" onClick={sendMessage} disabled={loading || !input.trim()}>
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
// CORREÇÃO: Fechamento da função do componente