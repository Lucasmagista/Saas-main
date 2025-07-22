import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  Upload, 
  FolderOpen, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  FileText,
  Code,
  Zap,
  Download,
  Globe,
  HardDrive,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Copy,
  Activity,
  BarChart3,
  MessageSquare,
  Clock,
  Users,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Bot {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  status: "active" | "inactive" | "error";
  type: "local" | "remote";
  source: string;
  lastRun: string;
  totalRuns: number;
  config: Record<string, any>;
  files: string[];
  dependencies: string[];
  entryPoint: string;
}

interface ScanResult {
  isValid: boolean;
  entryPoint?: string;
  configFile?: string;
  dependencies: string[];
  files: string[];
  errors: string[];
  warnings: string[];
}

export function BotManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [bots, setBots] = useState<Bot[]>([
    {
      id: "1",
      name: "WhatsApp Auto Reply",
      description: "Bot para respostas automáticas no WhatsApp",
      version: "1.2.0",
      author: "Equipe Interna",
      status: "active",
      type: "local",
      source: "/bots/whatsapp-reply",
      lastRun: "2024-01-20 14:30",
      totalRuns: 1247,
      config: {
        responseDelay: 2000,
        workingHours: "9-18",
        language: "pt-BR"
      },
      files: ["index.js", "config.json", "responses.json"],
      dependencies: ["whatsapp-web.js", "node-cron"],
      entryPoint: "index.js"
    },
    {
      id: "2", 
      name: "Email Classifier",
      description: "Classificação automática de emails recebidos",
      version: "2.1.5",
      author: "AI Labs",
      status: "inactive",
      type: "remote",
      source: "https://github.com/ai-labs/email-classifier",
      lastRun: "2024-01-19 10:15",
      totalRuns: 892,
      config: {
        categories: ["support", "sales", "billing"],
        confidence: 0.8
      },
      files: ["main.py", "classifier.py", "requirements.txt"],
      dependencies: ["tensorflow", "scikit-learn", "pandas"],
      entryPoint: "main.py"
    }
  ]);

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [importType, setImportType] = useState<"local" | "remote">("local");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [importPath, setImportPath] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simular scanner de arquivos
  const scanBotFiles = async (files: FileList | string) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResult(null);

    // Simular processo de scanning
    const steps = [
      "Analisando estrutura de arquivos...",
      "Procurando arquivo principal...",
      "Verificando dependências...",
      "Validando configurações...",
      "Verificando compatibilidade...",
      "Finalizando análise..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setScanProgress((i + 1) * (100 / steps.length));
    }

    // Simular resultado do scan
    const mockResult: ScanResult = {
      isValid: Math.random() > 0.3, // 70% chance de ser válido
      entryPoint: "index.js",
      configFile: "config.json",
      dependencies: ["express", "axios", "lodash"],
      files: ["index.js", "config.json", "package.json", "README.md"],
      errors: Math.random() > 0.7 ? ["Arquivo package.json não encontrado"] : [],
      warnings: ["Dependência 'axios' pode estar desatualizada"]
    };

    setScanResult(mockResult);
    setIsScanning(false);

    if (mockResult.isValid) {
      toast({
        title: "Scanner Completo",
        description: "Bot validado com sucesso! Pronto para importação.",
      });
    } else {
      toast({
        title: "Problemas Encontrados",
        description: "Revise a pasta do bot antes de importar.",
        variant: "destructive"
      });
    }
  };

  const handleLocalImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      scanBotFiles(files);
    }
  };

  const handleRemoteImport = () => {
    if (!importPath.trim()) {
      toast({
        title: "Erro",
        description: "Digite a URL do repositório",
        variant: "destructive"
      });
      return;
    }
    scanBotFiles(importPath);
  };

  const importBot = () => {
    if (!scanResult?.isValid) {
      toast({
        title: "Erro", 
        description: "Corrija os problemas antes de importar",
        variant: "destructive"
      });
      return;
    }

    const newBot: Bot = {
      id: Date.now().toString(),
      name: `Novo Bot ${bots.length + 1}`,
      description: "Bot importado",
      version: "1.0.0",
      author: "Usuário",
      status: "inactive",
      type: importType,
      source: importType === "local" ? "Pasta Local" : importPath,
      lastRun: "Nunca",
      totalRuns: 0,
      config: {},
      files: scanResult.files,
      dependencies: scanResult.dependencies,
      entryPoint: scanResult.entryPoint || "index.js"
    };

    setBots([...bots, newBot]);
    setShowImportDialog(false);
    setScanResult(null);
    setImportPath("");

    toast({
      title: "Bot Importado",
      description: "Bot adicionado com sucesso ao sistema"
    });
  };

  const toggleBotStatus = (botId: string) => {
    setBots(bots.map(bot => 
      bot.id === botId 
        ? { ...bot, status: bot.status === "active" ? "inactive" : "active" }
        : bot
    ));

    const bot = bots.find(b => b.id === botId);
    toast({
      title: `Bot ${bot?.status === "active" ? "Pausado" : "Ativado"}`,
      description: `${bot?.name} foi ${bot?.status === "active" ? "pausado" : "ativado"} com sucesso`
    });
  };

  const deleteBot = (botId: string) => {
    setBots(bots.filter(bot => bot.id !== botId));
    toast({
      title: "Bot Removido",
      description: "Bot removido do sistema"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "error": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Activity className="w-3 h-3" />;
      case "inactive": return <Pause className="w-3 h-3" />;
      case "error": return <AlertTriangle className="w-3 h-3" />;
      default: return <Bot className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Bots</h2>
          <p className="text-muted-foreground">
            Importe, configure e gerencie seus bots de automação
          </p>
        </div>
        <Button onClick={() => setShowImportDialog(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Importar Bot
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{bots.length}</p>
                <p className="text-sm text-muted-foreground">Total de Bots</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{bots.filter(b => b.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Bots Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{bots.reduce((acc, bot) => acc + bot.totalRuns, 0)}</p>
                <p className="text-sm text-muted-foreground">Execuções Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{bots.filter(b => b.status === "error").length}</p>
                <p className="text-sm text-muted-foreground">Com Erro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="active">Bots Ativos</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {bots.map((bot) => (
              <Card key={bot.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                        <Bot className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {bot.name}
                          <Badge className={getStatusColor(bot.status)}>
                            {getStatusIcon(bot.status)}
                            {bot.status === "active" ? "Ativo" : bot.status === "inactive" ? "Inativo" : "Erro"}
                          </Badge>
                          <Badge variant="outline">
                            {bot.type === "local" ? <HardDrive className="w-3 h-3 mr-1" /> : <Globe className="w-3 h-3 mr-1" />}
                            {bot.type === "local" ? "Local" : "Remoto"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{bot.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBot(bot);
                          setShowConfigDialog(true);
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleBotStatus(bot.id)}
                      >
                        {bot.status === "active" ? 
                          <Pause className="w-4 h-4" /> : 
                          <Play className="w-4 h-4" />
                        }
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBot(bot.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Versão</Label>
                      <p className="font-medium">{bot.version}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Autor</Label>
                      <p className="font-medium">{bot.author}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Última Execução</Label>
                      <p className="font-medium">{bot.lastRun}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total de Execuções</Label>
                      <p className="font-medium">{bot.totalRuns.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Arquivos Principais</Label>
                    <div className="flex flex-wrap gap-1">
                      {bot.files.map((file) => (
                        <Badge key={file} variant="secondary" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {bots.filter(bot => bot.status === "active").map((bot) => (
              <Card key={bot.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <h4 className="font-medium">{bot.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Executando • {bot.totalRuns} runs
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">CPU</p>
                        <p className="font-medium">12%</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Memória</p>
                        <p className="font-medium">45 MB</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace de Bots</CardTitle>
              <CardDescription>
                Descubra e instale bots criados pela comunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Marketplace em desenvolvimento. Em breve você poderá descobrir e instalar bots da comunidade.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 font-mono text-sm">
                  <div className="p-2 bg-muted rounded text-green-600">
                    [2024-01-20 14:30:15] WhatsApp Auto Reply: Mensagem processada com sucesso
                  </div>
                  <div className="p-2 bg-muted rounded text-blue-600">
                    [2024-01-20 14:29:45] Email Classifier: Iniciando classificação de emails
                  </div>
                  <div className="p-2 bg-muted rounded text-orange-600">
                    [2024-01-20 14:28:30] WhatsApp Auto Reply: Warning - Rate limit próximo
                  </div>
                  <div className="p-2 bg-muted rounded text-red-600">
                    [2024-01-20 14:25:10] Email Classifier: Erro ao conectar com API
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar Novo Bot</DialogTitle>
            <DialogDescription>
              Escolha a origem do bot e faça o upload dos arquivos
            </DialogDescription>
          </DialogHeader>

          <Tabs value={importType} onValueChange={(value) => setImportType(value as "local" | "remote")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="local">
                <HardDrive className="w-4 h-4 mr-2" />
                Pasta Local
              </TabsTrigger>
              <TabsTrigger value="remote">
                <Globe className="w-4 h-4 mr-2" />
                Repositório
              </TabsTrigger>
            </TabsList>

            <TabsContent value="local" className="space-y-4">
              <div className="space-y-4">
                <Button 
                  onClick={handleLocalImport}
                  className="w-full h-20 border-2 border-dashed"
                  variant="outline"
                >
                  <div className="text-center">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2" />
                    <p>Selecionar Pasta do Bot</p>
                    <p className="text-xs text-muted-foreground">
                      Escolha a pasta contendo os arquivos do bot
                    </p>
                  </div>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </TabsContent>

            <TabsContent value="remote" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="repo-url">URL do Repositório</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/usuario/meu-bot"
                    value={importPath}
                    onChange={(e) => setImportPath(e.target.value)}
                  />
                </div>
                <Button onClick={handleRemoteImport} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar e Analisar
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Scanner Animation */}
          {isScanning && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <Search className="w-12 h-12 mx-auto text-blue-600 animate-pulse" />
                    <div className="absolute inset-0 w-12 h-12 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <p className="font-medium">Analisando arquivos do bot...</p>
                    <Progress value={scanProgress} className="mt-2" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {scanProgress.toFixed(0)}% concluído
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scan Results */}
          {scanResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {scanResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  Resultado da Análise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanResult.isValid ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Arquivo Principal</Label>
                        <p className="font-medium">{scanResult.entryPoint}</p>
                      </div>
                      <div>
                        <Label>Arquivo de Config</Label>
                        <p className="font-medium">{scanResult.configFile || "Não encontrado"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Arquivos Encontrados ({scanResult.files.length})</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {scanResult.files.map((file) => (
                          <Badge key={file} variant="secondary" className="text-xs">
                            {file}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Dependências ({scanResult.dependencies.length})</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {scanResult.dependencies.map((dep) => (
                          <Badge key={dep} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-red-600">
                      <Label>Erros Encontrados</Label>
                      {scanResult.errors.map((error, index) => (
                        <p key={index} className="text-sm mt-1">• {error}</p>
                      ))}
                    </div>
                  </div>
                )}

                {scanResult.warnings.length > 0 && (
                  <div className="text-orange-600">
                    <Label>Avisos</Label>
                    {scanResult.warnings.map((warning, index) => (
                      <p key={index} className="text-sm mt-1">• {warning}</p>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={importBot} 
                    disabled={!scanResult.isValid}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Bot
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setScanResult(null)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Novo Scan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      {/* Bot Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Bot: {selectedBot?.name}</DialogTitle>
            <DialogDescription>
              Ajuste as configurações e parâmetros do bot
            </DialogDescription>
          </DialogHeader>

          {selectedBot && (
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList>
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="config">Configurações</TabsTrigger>
                <TabsTrigger value="schedule">Agendamento</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Bot</Label>
                    <Input defaultValue={selectedBot.name} />
                  </div>
                  <div>
                    <Label>Versão</Label>
                    <Input defaultValue={selectedBot.version} />
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input defaultValue={selectedBot.description} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked={selectedBot.status === "active"} />
                  <Label>Bot Ativo</Label>
                </div>
              </TabsContent>

              <TabsContent value="config" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Bot</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(selectedBot.config).map(([key, value]) => (
                      <div key={key}>
                        <Label>{key}</Label>
                        <Input defaultValue={String(value)} />
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Configuração
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>Agendamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Frequência de Execução</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="interval">Por Intervalo</SelectItem>
                          <SelectItem value="cron">Expressão Cron</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Expressão Cron</Label>
                      <Input placeholder="0 */5 * * * *" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs">
                <Card>
                  <CardHeader>
                    <CardTitle>Logs do Bot</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-1 font-mono text-xs">
                        <p>[2024-01-20 14:30] Bot iniciado com sucesso</p>
                        <p>[2024-01-20 14:31] Processando tarefa #1247</p>
                        <p>[2024-01-20 14:32] Tarefa concluída</p>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancelar
            </Button>
            <Button>
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}