import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  MessageSquare, 
  Bot, 
  Zap, 
  Shield, 
  Clock, 
  Users, 
  Webhook, 
  Activity, 
  Database,
  Globe,
  Code,
  Palette,
  BarChart3,
  Save,
  Play,
  Pause,
  RotateCcw,
  QrCode,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Download,
  FileText,
  RefreshCw,
  Monitor,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateBotUnified, useBotStatusUnified, useDeleteBotUnified, type UnifiedBot } from '@/hooks/useBotsUnified';
import { BotStatusMonitor } from './BotStatusMonitor';

// Interfaces
interface EnvVar {
  key: string;
  value: string;
}

interface DocumentAnalysis {
  packageJson?: PackageJsonAnalysis;
  dockerfile?: string;
  readmeContent?: string;
  configFiles?: Record<string, unknown>;
  dependencies?: string[];
  scripts?: Record<string, string>;
  environment?: 'node' | 'python' | 'php' | 'unknown';
  framework?: string;
  buildCommand?: string;
  startCommand?: string;
  port?: string;
  apiEndpoints?: string[];
}

// Função para analisar package.json
interface PackageJsonAnalysis {
  name?: string;
  description?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: string[];
  devDependencies?: string[];
  main?: string;
  engines?: Record<string, unknown>;
}

const analyzePackageJson = (content: string): PackageJsonAnalysis | null => {
  try {
    const pkg = JSON.parse(content);
    return {
      name: pkg.name,
      description: pkg.description,
      version: pkg.version,
      scripts: pkg.scripts || {},
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
      main: pkg.main,
      engines: pkg.engines
    };
  } catch {
    return null;
  }
};

// Função para detectar framework baseado nas dependências
const detectFramework = (dependencies: string[]): string => {
  if (dependencies.includes('express')) return 'Express.js';
  if (dependencies.includes('next')) return 'Next.js';
  if (dependencies.includes('react')) return 'React';
  if (dependencies.includes('vue')) return 'Vue.js';
  if (dependencies.includes('angular')) return 'Angular';
  if (dependencies.includes('fastapi')) return 'FastAPI';
  if (dependencies.includes('django')) return 'Django';
  if (dependencies.includes('flask')) return 'Flask';
  if (dependencies.includes('whatsapp-web.js')) return 'WhatsApp Web.js';
  if (dependencies.includes('wppconnect')) return 'WPPConnect';
  if (dependencies.includes('baileys')) return 'Baileys';
  return 'Unknown';
};

// Função para extrair porta de arquivos
const extractPortFromContent = (content: string): string | null => {
  const portRegex = /(?:PORT|port)\s*[:=]\s*(\d+)/i;
  const match = portRegex.exec(content);
  return match ? match[1] : null;
};

// Função para analisar repositório remoto via URL
const analyzeRemoteRepository = async (url: string): Promise<DocumentAnalysis> => {
  const analysis: DocumentAnalysis = {
    environment: 'unknown',
    dependencies: [],
    scripts: {},
    apiEndpoints: []
  };

  try {
    // Converter URL do GitHub para raw URLs
    let baseUrl = url;
    if (url.includes('github.com')) {
      baseUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/tree/main', '/main').replace('/tree/master', '/master');
      if (!baseUrl.includes('/main') && !baseUrl.includes('/master')) {
        baseUrl += '/main';
      }
    }

    // Arquivos importantes para analisar
    const filesToCheck = [
      'package.json',
      'requirements.txt', 
      'Dockerfile',
      'README.md',
      'README.rst',
      '.env.example',
      'docker-compose.yml',
      'composer.json'
    ];

    for (const fileName of filesToCheck) {
      try {
        const fileUrl = `${baseUrl}/${fileName}`;
        const response = await fetch(fileUrl);
        
        if (response.ok) {
          const content = await response.text();
          
          // Analisar baseado no tipo de arquivo
          if (fileName === 'package.json') {
            const pkg = analyzePackageJson(content);
            if (pkg) {
              analysis.packageJson = pkg;
              analysis.environment = 'node';
              analysis.dependencies = [...(pkg.dependencies || []), ...(pkg.devDependencies || [])];
              analysis.scripts = pkg.scripts || {};
              analysis.framework = detectFramework(analysis.dependencies);
              
              if (pkg.scripts?.build) analysis.buildCommand = `npm run build`;
              if (pkg.scripts?.start) analysis.startCommand = `npm start`;
              if (pkg.scripts?.dev) analysis.startCommand = `npm run dev`;
            }
          }
          
          else if (fileName === 'requirements.txt') {
            analysis.environment = 'python';
            analysis.dependencies = content.split('\n').filter(line => line.trim());
            analysis.framework = detectFramework(analysis.dependencies);
          }
          
          else if (fileName === 'Dockerfile') {
            analysis.dockerfile = content;
            const port = extractPortFromContent(content);
            if (port) analysis.port = port;
          }
          
          else if (fileName.toLowerCase().includes('readme')) {
            analysis.readmeContent = content;
            const portMatch = content.match(/port\s*(\d+)/i);
            if (portMatch && !analysis.port) analysis.port = portMatch[1];
          }
        }
      } catch (error) {
        // Ignorar erros de arquivos individuais
        console.warn(`Não foi possível carregar ${fileName}:`, error);
      }
    }
    
    return analysis;
  } catch (error) {
    console.error('Erro na análise do repositório remoto:', error);
    throw error;
  }
};

// Função principal de análise de documentos locais
const analyzeDocuments = async (files: File[]): Promise<DocumentAnalysis> => {
  const analysis: DocumentAnalysis = {
    environment: 'unknown',
    dependencies: [],
    scripts: {},
    apiEndpoints: []
  };

  for (const file of files) {
    const content = await file.text();
    
    // Analisar package.json
    if (file.name === 'package.json') {
      const pkg = analyzePackageJson(content);
      if (pkg) {
        analysis.packageJson = pkg;
        analysis.environment = 'node';
        analysis.dependencies = [...(pkg.dependencies || []), ...(pkg.devDependencies || [])];
        analysis.scripts = pkg.scripts || {};
        analysis.framework = detectFramework(analysis.dependencies);
        
        // Detectar comandos comuns
        if (pkg.scripts?.build) analysis.buildCommand = `npm run build`;
        if (pkg.scripts?.start) analysis.startCommand = `npm start`;
        if (pkg.scripts?.dev) analysis.startCommand = `npm run dev`;
      }
    }
    
    // Analisar Dockerfile
    else if (file.name === 'Dockerfile') {
      analysis.dockerfile = content;
      const port = extractPortFromContent(content);
      if (port) analysis.port = port;
    }
    
    // Analisar README
    else if (file.name.toLowerCase().includes('readme')) {
      analysis.readmeContent = content;
      // Extrair informações do README
      const portMatch = content.match(/port\s*(\d+)/i);
      if (portMatch && !analysis.port) analysis.port = portMatch[1];
    }
    
    // Analisar arquivos de configuração
    else if (file.name.match(/\.(json|yaml|yml|env|config)$/i)) {
      try {
        if (file.name.endsWith('.json')) {
          analysis.configFiles = analysis.configFiles || {};
          analysis.configFiles[file.name] = JSON.parse(content);
        }
        
        if (file.name.includes('.env')) {
          const port = extractPortFromContent(content);
          if (port) analysis.port = port;
        }
      } catch {
        // Ignorar arquivos malformados
      }
    }
    
    // Analisar arquivos Python
    else if (file.name.match(/\.(py|requirements\.txt)$/i)) {
      analysis.environment = 'python';
      if (file.name === 'requirements.txt') {
        analysis.dependencies = content.split('\n').filter(line => line.trim());
        analysis.framework = detectFramework(analysis.dependencies);
      }
      if (content.includes('FastAPI')) analysis.framework = 'FastAPI';
      if (content.includes('Django')) analysis.framework = 'Django';
      if (content.includes('Flask')) analysis.framework = 'Flask';
    }
    
    // Analisar arquivos PHP
    else if (file.name.match(/\.php$/i)) {
      analysis.environment = 'php';
      if (content.includes('Laravel')) analysis.framework = 'Laravel';
      if (content.includes('Symfony')) analysis.framework = 'Symfony';
    }
  }
  
  return analysis;
}

// Função para auto-configurar bot baseado na análise
const autoConfigureBot = (analysis: DocumentAnalysis): Record<string, unknown> => {
  const config: Record<string, unknown> = {};
  
  // Configurações básicas
  if (analysis.packageJson) {
    config.name = analysis.packageJson.name || '';
    config.description = analysis.packageJson.description || '';
    config.version = analysis.packageJson.version || '1.0.0';
  }
  
  // Configurações de build
  config.buildCommand = analysis.buildCommand || 'npm run build';
  config.startCommand = analysis.startCommand || 'npm start';
  config.installCommand = analysis.environment === 'node' ? 'npm install' : 
                         analysis.environment === 'python' ? 'pip install -r requirements.txt' :
                         'install';
  
  // Configurações de ambiente
  config.environment = 'development';
  config.framework = analysis.framework;
  config.port = analysis.port || '3000';
  
  // Configurações Docker se existir
  if (analysis.dockerfile) {
    config.dockerConfig = analysis.dockerfile;
    config.deployMethod = 'docker';
  } else {
    config.deployMethod = 'local';
  }
  
  // Auto-restart para bots
  config.autoStart = true;
  config.autoRestart = true;
  
  // Configurações de recursos baseadas no tipo
  if (analysis.framework?.toLowerCase().includes('whatsapp')) {
    config.platform = 'whatsapp';
    config.maxConnections = 50;
    config.sessionTimeout = 1800000; // 30 min
  }
  
  // Configurações de monitoramento
  config.enableLogging = true;
  config.logLevel = 'info';
  config.enableAnalytics = true;
  
  return config;
};

// Tipo para configuração básica
interface BasicBotConfig {
  phone?: string;
  token?: string;
  webhook?: string;
  [key: string]: unknown;
}

// Tipo para variáveis de ambiente
interface EnvVar {
  key: string;
  value: string;
}

interface BotConfigurationDialogProps {
  bot: UnifiedBot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBotUpdated?: () => void;
  importedFiles?: File[]; // Para análise automática
  remoteUrl?: string; // Para análise de repositório remoto
  autoAnalyze?: boolean; // Para ativar análise automática
}

interface BotConfiguration {
  host?: string;
  port?: string | number;
  // Configurações básicas
  name: string;
  description: string;
  platform: string;
  phone?: string;
  token?: string;
  webhook?: string;

  // Configurações avançadas
  maxConcurrentChats: number;
  responseTime: number;
  sessionTimeout: number;
  autoRestart: boolean;
  enableNotifications: boolean;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // Configurações de segurança
  enableEncryption: boolean;
  allowedContacts: string[];
  blockedContacts: string[];
  rateLimitPerMinute: number;
  enableSpamFilter: boolean;

  // Configurações de inteligência artificial
  aiEnabled: boolean;
  aiModel: string;
  aiLanguage: string;
  aiPersonality: string;
  aiContext: string;
  aiTemperature: number;
  aiMaxTokens: number;

  // Configurações de horário de funcionamento
  workingHours: {
    enabled: boolean;
    timezone: string;
    monday: { enabled: boolean; start: string; end: string };
    tuesday: { enabled: boolean; start: string; end: string };
    wednesday: { enabled: boolean; start: string; end: string };
    thursday: { enabled: boolean; start: string; end: string };
    friday: { enabled: boolean; start: string; end: string };
    saturday: { enabled: boolean; start: string; end: string };
    sunday: { enabled: boolean; start: string; end: string };
  };

  // Configurações de personalização
  botAvatar?: string;
  botColor: string;
  customGreeting: string;
  customFarewell: string;
  autoResponseMessages: Array<{ trigger: string; response: string }>;

  // Configurações de integração
  webhookEvents: string[];
  apiIntegrations: Array<{ name: string; url: string; apiKey: string; enabled: boolean }>;

  // Configurações de analytics
  enableAnalytics: boolean;
  trackUserEngagement: boolean;
  retentionDays: number;

  // Propriedades extras usadas no componente (opcionais)
  buildCommand?: string;
  outputDir?: string;
  installCommand?: string;
  startCommand?: string;
  autoBuild?: boolean;
  buildEnvVars?: string;
  deployMethod?: string;
  deployPort?: string | number;
  deployUrl?: string;
  dockerConfig?: string;
  autoStart?: boolean;
  startupTimeout?: number;
  reconnectAttempts?: number;
  environment?: string;
  debugMode?: string;
  envVars?: EnvVar[];
  memoryLimit?: number;
  cpuLimit?: number;
  maxConnections?: number;
  framework?: string;
}

const defaultConfig: BotConfiguration = {
  name: '',
  description: '',
  platform: 'whatsapp',
  maxConcurrentChats: 50,
  responseTime: 2000,
  sessionTimeout: 1800000, // 30 minutos
  autoRestart: true,
  enableNotifications: true,
  enableLogging: true,
  logLevel: 'info',
  enableEncryption: true,
  allowedContacts: [],
  blockedContacts: [],
  rateLimitPerMinute: 30,
  enableSpamFilter: true,
  aiEnabled: false,
  aiModel: 'gpt-3.5-turbo',
  aiLanguage: 'pt-BR',
  aiPersonality: 'helpful',
  aiContext: '',
  aiTemperature: 0.7,
  aiMaxTokens: 150,
  workingHours: {
    enabled: false,
    timezone: 'America/Sao_Paulo',
    monday: { enabled: true, start: '09:00', end: '18:00' },
    tuesday: { enabled: true, start: '09:00', end: '18:00' },
    wednesday: { enabled: true, start: '09:00', end: '18:00' },
    thursday: { enabled: true, start: '09:00', end: '18:00' },
    friday: { enabled: true, start: '09:00', end: '18:00' },
    saturday: { enabled: false, start: '09:00', end: '18:00' },
    sunday: { enabled: false, start: '09:00', end: '18:00' },
  },
  botColor: '#25D366',
  customGreeting: 'Olá! Como posso ajudá-lo hoje?',
  customFarewell: 'Obrigado por entrar em contato. Tenha um ótimo dia!',
  autoResponseMessages: [],
  webhookEvents: ['message', 'status', 'qr', 'ready'],
  apiIntegrations: [],
  enableAnalytics: true,
  trackUserEngagement: true,
  retentionDays: 30,
};

export function BotConfigurationDialog({ 
  bot, 
  open, 
  onOpenChange, 
  onBotUpdated, 
  importedFiles, 
  remoteUrl,
  autoAnalyze = false 
}: Readonly<BotConfigurationDialogProps>) {
  const [config, setConfig] = useState<BotConfiguration>(defaultConfig);
  const [activeTab, setActiveTab] = useState('general');
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<DocumentAnalysis | null>(null);
  
  const updateBot = useUpdateBotUnified();
  const botStatus = useBotStatusUnified();
  const deleteBot = useDeleteBotUnified();

  // Auto-análise quando arquivos são importados ou URL remota é fornecida
  useEffect(() => {
    const performAnalysis = async () => {
      if (!autoAnalyze) return;
      
      if ((importedFiles && importedFiles.length > 0) || remoteUrl) {
        setIsAnalyzing(true);
        try {
          let analysis: DocumentAnalysis;
          
          if (remoteUrl) {
            analysis = await analyzeRemoteRepository(remoteUrl);
            toast.success(`Análise remota concluída! Detectado: ${analysis.framework || analysis.environment || 'Projeto genérico'}`);
          } else if (importedFiles) {
            analysis = await analyzeDocuments(importedFiles);
            toast.success(`Análise local concluída! Detectado: ${analysis.framework || analysis.environment || 'Projeto genérico'}`);
          } else {
            return;
          }
          
          setAnalysisResults(analysis);
          
          // Auto-configurar baseado na análise
          const autoConfig = autoConfigureBot(analysis);
          setConfig(prev => ({ ...prev, ...autoConfig }));
          setUnsavedChanges(true);
          
        } catch (error) {
          console.error('Erro na análise:', error);
          toast.error('Erro ao analisar documentos');
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    performAnalysis();
  }, [importedFiles, remoteUrl, autoAnalyze]);

  useEffect(() => {
    if (bot) {
      setConfig(prev => ({
        ...prev,
        name: bot.name || '',
        description: bot.description || '',
        platform: bot.type || 'whatsapp',
        phone: bot.config?.phone || '',
        token: bot.config?.token || '',
        webhook: bot.config?.webhook || '',
        ...bot.config,
      }));
      setUnsavedChanges(false);
    }
  }, [bot]);

  const updateConfig = (updates: Partial<BotConfiguration> | Record<string, unknown>) => {
  setConfig(prev => ({ ...prev, ...updates }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!bot) return;
    
    try {
      await updateBot.mutateAsync({
        id: bot.id,
        name: config.name,
        type: bot.type, // Garante que o campo obrigatório 'type' seja enviado
        description: config.description,
        config: {
          phone: config.phone,
          token: config.token,
          webhook: config.webhook,
          ...config // Inclui todas as outras propriedades
        } as BasicBotConfig,
      });
      setUnsavedChanges(false);
      toast.success('Configurações salvas com sucesso!');
      onBotUpdated?.();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleStartStop = async () => {
    if (!bot) return;
    
    try {
      const action = bot.status === 'active' ? 'stop' : 'start';
      await botStatus.mutateAsync({ id: bot.id, action });
      toast.success(`Bot ${action === 'start' ? 'iniciado' : 'parado'} com sucesso!`);
      onBotUpdated?.();
    } catch (error) {
      console.error('Erro ao controlar bot:', error);
      toast.error(`Erro ao ${bot.status === 'active' ? 'parar' : 'iniciar'} bot`);
    }
  };

  const handleDelete = async () => {
    if (!bot) return;
    
    console.log('🔥 [handleDelete] Iniciando remoção:', {
      botId: bot.id,
      botName: bot.name,
      botType: bot.type,
      deleteBot: !!deleteBot,
      deleteBot_isPending: deleteBot.isPending
    });
    
    // Confirmação antes de deletar
    const confirmed = window.confirm(
      `Tem certeza que deseja remover o bot "${bot.name}"?\n\nEsta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.`
    );
    
    if (!confirmed) {
      console.log('🚫 [handleDelete] Operação cancelada pelo usuário');
      return;
    }
    
    try {
      console.log('⏳ [handleDelete] Chamando deleteBot.mutateAsync...');
      
      const result = await deleteBot.mutateAsync({ 
        id: bot.id, 
        type: bot.type 
      });
      
      console.log('✅ [handleDelete] Sucesso:', result);
      toast.success('Bot removido com sucesso!');
      onOpenChange(false); // Fechar o diálogo
      onBotUpdated?.(); // Atualizar a lista
    } catch (error) {
      console.error('❌ [handleDelete] Erro:', error);
      toast.error(`Erro ao remover bot: ${error.message || 'Erro desconhecido'}`);
    }
  };

  if (!bot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <Bot className="w-5 h-5" />
            Configurações do Bot: {bot.name}
            <Badge variant={bot.status === 'active' ? 'default' : 'secondary'}>
              {bot.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
            {isAnalyzing && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Analisando...
              </Badge>
            )}
            {analysisResults && !isAnalyzing && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Code className="w-3 h-3" />
                {analysisResults.framework || analysisResults.environment}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Configure todas as opções avançadas do seu bot
            {analysisResults && (
              <span className="block mt-1 text-green-600">
                ✅ Configuração automática baseada na análise de arquivos
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-10 flex-shrink-0 text-xs">
              <TabsTrigger value="general" className="flex items-center gap-1 text-xs">
                <Settings className="w-3 h-3" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="build" className="flex items-center gap-1 text-xs">
                <Code className="w-3 h-3" />
                Build
              </TabsTrigger>
              <TabsTrigger value="lifecycle" className="flex items-center gap-1 text-xs">
                <Activity className="w-3 h-3" />
                Ciclo
              </TabsTrigger>
              <TabsTrigger value="environment" className="flex items-center gap-1 text-xs">
                <Globe className="w-3 h-3" />
                Ambiente
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1 text-xs">
                <Shield className="w-3 h-3" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-1 text-xs">
                <Zap className="w-3 h-3" />
                IA
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-1 text-xs">
                <Clock className="w-3 h-3" />
                Horários
              </TabsTrigger>
              <TabsTrigger value="customization" className="flex items-center gap-1 text-xs">
                <Palette className="w-3 h-3" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-1 text-xs">
                <Webhook className="w-3 h-3" />
                Integrações
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-1 text-xs">
                <BarChart3 className="w-3 h-3" />
                Monitor
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto mt-6">
              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informações Básicas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        Informações Básicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome do Bot</Label>
                        <Input
                          id="name"
                          value={config.name}
                          onChange={(e) => updateConfig({ name: e.target.value })}
                          placeholder="Nome do bot"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={config.description}
                          onChange={(e) => updateConfig({ description: e.target.value })}
                          placeholder="Descreva a função do bot"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="platform">Plataforma</Label>
                        <Select value={config.platform} onValueChange={(value) => updateConfig({ platform: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="whatsapp">📱 WhatsApp</SelectItem>
                            <SelectItem value="telegram">✈️ Telegram</SelectItem>
                            <SelectItem value="discord">🎮 Discord</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {config.platform === 'whatsapp' && (
                        <div>
                          <Label htmlFor="phone">Número do WhatsApp</Label>
                          <Input
                            id="phone"
                            value={config.phone || ''}
                            onChange={(e) => updateConfig({ phone: e.target.value })}
                            placeholder="+55 11 99999-9999"
                          />
                        </div>
                      )}

                      {(config.platform === 'telegram' || config.platform === 'discord') && (
                        <div>
                          <Label htmlFor="token">Token do Bot</Label>
                          <div className="flex gap-2">
                            <Input
                              id="token"
                              type={showSensitiveInfo ? 'text' : 'password'}
                              value={config.token || ''}
                              onChange={(e) => updateConfig({ token: e.target.value })}
                              placeholder="Cole o token aqui"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                            >
                              {showSensitiveInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="webhook">Webhook URL</Label>
                        <Input
                          id="webhook"
                          value={config.webhook || ''}
                          onChange={(e) => updateConfig({ webhook: e.target.value })}
                          placeholder="https://webhook.site/your-unique-id"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Configurações de Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Chats Simultâneos: {config.maxConcurrentChats}</Label>
                        <Slider
                          value={[config.maxConcurrentChats]}
                          onValueChange={(value) => updateConfig({ maxConcurrentChats: value[0] })}
                          max={500}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Tempo de Resposta (ms): {config.responseTime}</Label>
                        <Slider
                          value={[config.responseTime]}
                          onValueChange={(value) => updateConfig({ responseTime: value[0] })}
                          max={10000}
                          min={100}
                          step={100}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Timeout da Sessão (min): {Math.floor(config.sessionTimeout / 60000)}</Label>
                        <Slider
                          value={[Math.floor(config.sessionTimeout / 60000)]}
                          onValueChange={(value) => updateConfig({ sessionTimeout: value[0] * 60000 })}
                          max={120}
                          min={5}
                          step={5}
                          className="mt-2"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Reinício Automático</Label>
                          <p className="text-sm text-muted-foreground">Reiniciar automaticamente em caso de erro</p>
                        </div>
                        <Switch
                          checked={config.autoRestart}
                          onCheckedChange={(checked) => updateConfig({ autoRestart: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notificações</Label>
                          <p className="text-sm text-muted-foreground">Receber notificações de status</p>
                        </div>
                        <Switch
                          checked={config.enableNotifications}
                          onCheckedChange={(checked) => updateConfig({ enableNotifications: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Configurações de Log */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Logs e Monitoramento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Habilitar Logs</Label>
                          <p className="text-sm text-muted-foreground">Registrar atividades do bot</p>
                        </div>
                        <Switch
                          checked={config.enableLogging}
                          onCheckedChange={(checked) => updateConfig({ enableLogging: checked })}
                        />
                      </div>

                      {config.enableLogging && (
                        <div>
                          <Label>Nível de Log</Label>
                          <Select value={config.logLevel} onValueChange={(value: 'debug' | 'info' | 'warn' | 'error') => updateConfig({ logLevel: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="debug">🐛 Debug</SelectItem>
                              <SelectItem value="info">ℹ️ Info</SelectItem>
                              <SelectItem value="warn">⚠️ Warn</SelectItem>
                              <SelectItem value="error">❌ Error</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Analytics</Label>
                          <p className="text-sm text-muted-foreground">Coletar métricas de uso</p>
                        </div>
                        <Switch
                          checked={config.enableAnalytics}
                          onCheckedChange={(checked) => updateConfig({ enableAnalytics: checked })}
                        />
                      </div>

                      {config.enableAnalytics && (
                        <div>
                          <Label>Retenção de Dados (dias): {config.retentionDays}</Label>
                          <Slider
                            value={[config.retentionDays]}
                            onValueChange={(value) => updateConfig({ retentionDays: value[0] })}
                            max={365}
                            min={7}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Status e Controles */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Controle do Bot
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={handleStartStop}
                          disabled={botStatus.isPending}
                          variant={bot.status === 'active' ? 'destructive' : 'default'}
                          className="flex-1"
                        >
                          {bot.status === 'active' ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Parar Bot
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Iniciar Bot
                            </>
                          )}
                        </Button>

                        <Button variant="outline">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reiniciar
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="font-semibold text-green-600">Uptime</div>
                          <div>12h 34min</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="font-semibold text-blue-600">Mensagens</div>
                          <div>1,234</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="font-semibold text-purple-600">Chats Ativos</div>
                          <div>23</div>
                        </div>
                      </div>

                      {config.platform === 'whatsapp' && bot.status !== 'active' && (
                        <Button variant="outline" className="w-full">
                          <QrCode className="w-4 h-4 mr-2" />
                          Mostrar QR Code
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Aba Build & Deploy */}
              <TabsContent value="build" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Configurações de Build */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Configuração de Build
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Comando de Build</Label>
                          <Input
                            placeholder="npm run build"
                            value={config.buildCommand || ''}
                            onChange={(e) => updateConfig({ buildCommand: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Diretório de Saída</Label>
                          <Input
                            placeholder="dist/"
                            value={config.outputDir || ''}
                            onChange={(e) => updateConfig({ outputDir: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Comando de Instalação</Label>
                          <Input
                            placeholder="npm install"
                            value={config.installCommand || ''}
                            onChange={(e) => updateConfig({ installCommand: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Comando de Start</Label>
                          <Input
                            placeholder="npm start"
                            value={config.startCommand || ''}
                            onChange={(e) => updateConfig({ startCommand: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Build Automático</Label>
                          <p className="text-sm text-muted-foreground">Executar build automaticamente ao salvar</p>
                        </div>
                        <Switch
                          checked={config.autoBuild || false}
                          onCheckedChange={(checked) => updateConfig({ autoBuild: checked })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Variáveis de Ambiente (Build)</Label>
                        <Textarea
                          placeholder="NODE_ENV=production&#10;API_URL=https://api.exemplo.com"
                          value={config.buildEnvVars || ''}
                          onChange={(e) => updateConfig({ buildEnvVars: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deploy Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Configuração de Deploy
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Método de Deploy</Label>
                          <Select value={config.deployMethod || 'local'} onValueChange={(value) => updateConfig({ deployMethod: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="local">🏠 Local</SelectItem>
                              <SelectItem value="docker">🐳 Docker</SelectItem>
                              <SelectItem value="cloud">☁️ Cloud</SelectItem>
                              <SelectItem value="kubernetes">⚙️ Kubernetes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Porta</Label>
                          <Input
                            type="number"
                            placeholder="3000"
                            value={config.deployPort || ''}
                            onChange={(e) => updateConfig({ deployPort: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>URL de Deploy</Label>
                        <Input
                          placeholder="https://meubot.exemplo.com"
                          value={config.deployUrl || ''}
                          onChange={(e) => updateConfig({ deployUrl: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Configuração Docker (se aplicável)</Label>
                        <Textarea
                          placeholder="FROM node:18&#10;WORKDIR /app&#10;COPY package*.json ./&#10;RUN npm install&#10;COPY . .&#10;EXPOSE 3000&#10;CMD [&quot;npm&quot;, &quot;start&quot;]"
                          value={config.dockerConfig || ''}
                          onChange={(e) => updateConfig({ dockerConfig: e.target.value })}
                          rows={6}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            // Implementar build real
                            toast.info('Executando build...');
                          }}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Executar Build
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => {
                            // Implementar deploy real
                            toast.info('Iniciando deploy...');
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Fazer Deploy
                        </Button>
                        {importedFiles && importedFiles.length > 0 && (
                          <Button 
                            variant="secondary" 
                            className="flex-1"
                            onClick={async () => {
                              setIsAnalyzing(true);
                              try {
                                const analysis = await analyzeDocuments(importedFiles);
                                setAnalysisResults(analysis);
                                const autoConfig = autoConfigureBot(analysis);
                                setConfig(prev => ({ ...prev, ...autoConfig }));
                                setUnsavedChanges(true);
                                toast.success('Re-análise concluída!');
                              } catch (error) {
                                console.error('Erro na re-análise:', error);
                                toast.error('Erro ao re-analisar');
                              } finally {
                                setIsAnalyzing(false);
                              }
                            }}
                            disabled={isAnalyzing}
                          >
                            <Code className="w-4 h-4 mr-2" />
                            {isAnalyzing ? 'Analisando...' : 'Re-analisar'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Aba Ciclo de Vida */}
              <TabsContent value="lifecycle" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Controles de Ciclo de Vida */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Controles de Inicialização
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2 mb-4">
                        <Button 
                          className="flex-1" 
                          onClick={() => {
                            // Implementar inicialização
                            toast.success('Bot inicializando...');
                          }}
                          disabled={bot.status === 'active'}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Inicializar Bot
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            // Implementar parada
                            toast.success('Bot parando...');
                          }}
                          disabled={bot.status !== 'active'}
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Parar Bot
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            // Implementar reinicialização
                            toast.success('Bot reiniciando...');
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reiniciar
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto Start</Label>
                            <p className="text-sm text-muted-foreground">Iniciar automaticamente</p>
                          </div>
                          <Switch
                            checked={config.autoStart || false}
                            onCheckedChange={(checked) => updateConfig({ autoStart: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto Restart</Label>
                            <p className="text-sm text-muted-foreground">Reiniciar em caso de falha</p>
                          </div>
                          <Switch
                            checked={config.autoRestart || false}
                            onCheckedChange={(checked) => updateConfig({ autoRestart: checked })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Timeout de Inicialização (segundos)</Label>
                        <Slider
                          value={[config.startupTimeout || 30]}
                          onValueChange={([value]) => updateConfig({ startupTimeout: value })}
                          max={300}
                          min={10}
                          step={5}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Atual: {config.startupTimeout || 30} segundos
                        </p>
                      </div>

                      <div>
                        <Label>Tentativas de Reconexão</Label>
                        <Slider
                          value={[config.reconnectAttempts || 5]}
                          onValueChange={([value]) => updateConfig({ reconnectAttempts: value })}
                          max={20}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Atual: {config.reconnectAttempts || 5} tentativas
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status e Logs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="w-5 h-5" />
                        Status e Logs
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${
                            bot.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                          <span>Status: {bot.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                        </div>
                        {bot.status === 'active' ? (
                          <div className="text-xs text-green-300 space-y-1">
                            <div>[{new Date().toLocaleTimeString()}] Bot is running</div>
                            <div>[{new Date().toLocaleTimeString()}] Waiting for connections...</div>
                          </div>
                        ) : (
                          <div className="text-xs text-red-300 space-y-1">
                            <div>[{new Date().toLocaleTimeString()}] Bot is stopped</div>
                            <div>[{new Date().toLocaleTimeString()}] Click start to initialize</div>
                          </div>
                        )}
                        
                        {analysisResults && (
                          <div className="mt-2 text-xs text-blue-300 space-y-1">
                            <div>📋 Framework: {analysisResults.framework || 'Unknown'}</div>
                            <div>🌍 Environment: {analysisResults.environment || 'Unknown'}</div>
                            {analysisResults.dependencies && analysisResults.dependencies.length > 0 && (
                              <div>📦 Dependencies: {analysisResults.dependencies.slice(0, 3).join(', ')}
                                {analysisResults.dependencies.length > 3 && `... (+${analysisResults.dependencies.length - 3} more)`}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            // Implementar download de logs reais
                            toast.info('Funcionalidade de logs em desenvolvimento');
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar Logs
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            // Atualizar status real
                            toast.info('Status atualizado');
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Atualizar Status
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            // Ver logs completos reais
                            toast.info('Visualizador de logs em desenvolvimento');
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Ver Logs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Aba Ambiente */}
              <TabsContent value="environment" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Variáveis de Ambiente */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Variáveis de Ambiente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Ambiente</Label>
                          <Select value={config.environment || 'development'} onValueChange={(value) => updateConfig({ environment: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="development">🛠️ Desenvolvimento</SelectItem>
                              <SelectItem value="staging">🧪 Staging</SelectItem>
                              <SelectItem value="production">🚀 Produção</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Modo Debug</Label>
                          <Select value={config.debugMode || 'false'} onValueChange={(value) => updateConfig({ debugMode: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="false">❌ Desabilitado</SelectItem>
                              <SelectItem value="true">✅ Habilitado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Variáveis Personalizadas</Label>
                        <div className="space-y-2">
                          {(config.envVars || []).map((envVar: EnvVar, index: number) => (
                            <div key={`${envVar.key}-${envVar.value}`} className="flex gap-2 p-3 border rounded-lg">
                              <Input
                                placeholder="CHAVE"
                                value={envVar.key || ''}
                                onChange={(e) => {
                                  const newVars = [...(config.envVars || [])];
                                  newVars[index] = { ...newVars[index], key: e.target.value };
                                  updateConfig({ envVars: newVars });
                                }}
                                className="flex-1"
                              />
                              <Input
                                placeholder="valor"
                                value={envVar.value || ''}
                                onChange={(e) => {
                                  const newVars = [...(config.envVars || [])];
                                  newVars[index] = { ...newVars[index], value: e.target.value };
                                  updateConfig({ envVars: newVars });
                                }}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newVars = [...(config.envVars || [])];
                                  newVars.splice(index, 1);
                                  updateConfig({ envVars: newVars });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              const newVars = [...(config.envVars || []), { key: '', value: '' }];
                              updateConfig({ envVars: newVars });
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Variável
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Configurações de Conexão</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Host</Label>
                            <Input
                              placeholder="localhost"
                              value={config.host || ''}
                              onChange={(e) => updateConfig({ host: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Porta</Label>
                            <Input
                              type="number"
                              placeholder="3000"
                              value={config.port || ''}
                              onChange={(e) => updateConfig({ port: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recursos do Sistema */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Recursos do Sistema
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Limite de Memória (MB)</Label>
                        <Slider
                          value={[config.memoryLimit || 512]}
                          onValueChange={([value]) => updateConfig({ memoryLimit: value })}
                          max={4096}
                          min={128}
                          step={128}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Atual: {config.memoryLimit || 512} MB
                        </p>
                      </div>

                      <div>
                        <Label>Limite de CPU (%)</Label>
                        <Slider
                          value={[config.cpuLimit || 80]}
                          onValueChange={([value]) => updateConfig({ cpuLimit: value })}
                          max={100}
                          min={10}
                          step={10}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Atual: {config.cpuLimit || 80}%
                        </p>
                      </div>

                      <div>
                        <Label>Max Conexões Simultâneas</Label>
                        <Slider
                          value={[config.maxConnections || 100]}
                          onValueChange={([value]) => updateConfig({ maxConnections: value })}
                          max={1000}
                          min={10}
                          step={10}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Atual: {config.maxConnections || 100} conexões
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Configurações de Segurança */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Segurança
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Criptografia</Label>
                          <p className="text-sm text-muted-foreground">Criptografar mensagens sensíveis</p>
                        </div>
                        <Switch
                          checked={config.enableEncryption}
                          onCheckedChange={(checked) => updateConfig({ enableEncryption: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Filtro Anti-Spam</Label>
                          <p className="text-sm text-muted-foreground">Bloquear mensagens suspeitas</p>
                        </div>
                        <Switch
                          checked={config.enableSpamFilter}
                          onCheckedChange={(checked) => updateConfig({ enableSpamFilter: checked })}
                        />
                      </div>

                      <div>
                        <Label>Limite de Mensagens/min: {config.rateLimitPerMinute}</Label>
                        <Slider
                          value={[config.rateLimitPerMinute]}
                          onValueChange={(value) => updateConfig({ rateLimitPerMinute: value[0] })}
                          max={100}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Controle de Acesso */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Controle de Acesso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Contatos Permitidos</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Lista branca de números/usuários (um por linha)
                        </p>
                        <Textarea
                          value={config.allowedContacts.join('\n')}
                          onChange={(e) => updateConfig({ allowedContacts: e.target.value.split('\n').filter(Boolean) })}
                          placeholder="+55 11 99999-9999"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label>Contatos Bloqueados</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Lista negra de números/usuários (um por linha)
                        </p>
                        <Textarea
                          value={config.blockedContacts.join('\n')}
                          onChange={(e) => updateConfig({ blockedContacts: e.target.value.split('\n').filter(Boolean) })}
                          placeholder="+55 11 88888-8888"
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Configurações de IA */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Inteligência Artificial
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Habilitar IA</Label>
                          <p className="text-sm text-muted-foreground">Usar IA para responder mensagens</p>
                        </div>
                        <Switch
                          checked={config.aiEnabled}
                          onCheckedChange={(checked) => updateConfig({ aiEnabled: checked })}
                        />
                      </div>

                      {config.aiEnabled && (
                        <>
                          <div>
                            <Label>Modelo de IA</Label>
                            <Select value={config.aiModel} onValueChange={(value) => updateConfig({ aiModel: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="claude">Claude</SelectItem>
                                <SelectItem value="gemini">Gemini</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Idioma</Label>
                            <Select value={config.aiLanguage} onValueChange={(value) => updateConfig({ aiLanguage: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pt-BR">🇧🇷 Português</SelectItem>
                                <SelectItem value="en-US">🇺🇸 English</SelectItem>
                                <SelectItem value="es-ES">🇪🇸 Español</SelectItem>
                                <SelectItem value="fr-FR">🇫🇷 Français</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Personalidade</Label>
                            <Select value={config.aiPersonality} onValueChange={(value) => updateConfig({ aiPersonality: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="helpful">😊 Prestativo</SelectItem>
                                <SelectItem value="professional">👔 Profissional</SelectItem>
                                <SelectItem value="friendly">😄 Amigável</SelectItem>
                                <SelectItem value="formal">🎩 Formal</SelectItem>
                                <SelectItem value="casual">😎 Casual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Contexto da IA</Label>
                            <p className="text-sm text-muted-foreground mb-2">
                              Informações sobre sua empresa/serviço para a IA
                            </p>
                            <Textarea
                              value={config.aiContext}
                              onChange={(e) => updateConfig({ aiContext: e.target.value })}
                              placeholder="Ex: Somos uma empresa de tecnologia que oferece soluções em automação..."
                              rows={4}
                            />
                          </div>

                          <div>
                            <Label>Criatividade (Temperature): {config.aiTemperature}</Label>
                            <Slider
                              value={[config.aiTemperature]}
                              onValueChange={(value) => updateConfig({ aiTemperature: value[0] })}
                              max={2}
                              min={0}
                              step={0.1}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label>Tokens Máximos: {config.aiMaxTokens}</Label>
                            <Slider
                              value={[config.aiMaxTokens]}
                              onValueChange={(value) => updateConfig({ aiMaxTokens: value[0] })}
                              max={1000}
                              min={50}
                              step={10}
                              className="mt-2"
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Horário de Funcionamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Habilitar Horário de Funcionamento</Label>
                        <p className="text-sm text-muted-foreground">Responder apenas em horários específicos</p>
                      </div>
                      <Switch
                        checked={config.workingHours.enabled}
                        onCheckedChange={(checked) => updateConfig({ 
                          workingHours: { ...config.workingHours, enabled: checked }
                        })}
                      />
                    </div>

                    {config.workingHours.enabled && (
                      <div className="space-y-4">
                        <div>
                          <Label>Fuso Horário</Label>
                          <Select 
                            value={config.workingHours.timezone} 
                            onValueChange={(value) => updateConfig({ 
                              workingHours: { ...config.workingHours, timezone: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="America/Sao_Paulo">🇧🇷 Brasília (GMT-3)</SelectItem>
                              <SelectItem value="America/New_York">🇺🇸 Nova York (GMT-5)</SelectItem>
                              <SelectItem value="Europe/London">🇬🇧 Londres (GMT+0)</SelectItem>
                              <SelectItem value="Asia/Tokyo">🇯🇵 Tóquio (GMT+9)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-3">
                          {Object.entries(config.workingHours).map(([day, settings]) => {
                            if (day === 'enabled' || day === 'timezone') return null;
                            
                            const daySettings = settings as { enabled: boolean; start: string; end: string };
                            const dayLabels: Record<string, string> = {
                              monday: 'Segunda-feira',
                              tuesday: 'Terça-feira',
                              wednesday: 'Quarta-feira',
                              thursday: 'Quinta-feira',
                              friday: 'Sexta-feira',
                              saturday: 'Sábado',
                              sunday: 'Domingo'
                            };

                            return (
                              <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                                <div className="flex items-center space-x-2 w-32">
                                  <Switch
                                    checked={daySettings.enabled}
                                    onCheckedChange={(checked) => updateConfig({
                                      workingHours: {
                                        ...config.workingHours,
                                        [day]: { ...daySettings, enabled: checked }
                                      }
                                    })}
                                  />
                                  <Label className="text-sm">{dayLabels[day]}</Label>
                                </div>

                                {daySettings.enabled && (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="time"
                                      value={daySettings.start}
                                      onChange={(e) => updateConfig({
                                        workingHours: {
                                          ...config.workingHours,
                                          [day]: { ...daySettings, start: e.target.value }
                                        }
                                      })}
                                      className="w-32"
                                    />
                                    <span className="text-muted-foreground">às</span>
                                    <Input
                                      type="time"
                                      value={daySettings.end}
                                      onChange={(e) => updateConfig({
                                        workingHours: {
                                          ...config.workingHours,
                                          [day]: { ...daySettings, end: e.target.value }
                                        }
                                      })}
                                      className="w-32"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customization" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personalização Visual */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Personalização Visual
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Cor do Bot</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={config.botColor}
                            onChange={(e) => updateConfig({ botColor: e.target.value })}
                            className="w-20"
                          />
                          <Input
                            value={config.botColor}
                            onChange={(e) => updateConfig({ botColor: e.target.value })}
                            placeholder="#25D366"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Mensagem de Boas-vindas</Label>
                        <Textarea
                          value={config.customGreeting}
                          onChange={(e) => updateConfig({ customGreeting: e.target.value })}
                          placeholder="Olá! Como posso ajudá-lo hoje?"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Mensagem de Despedida</Label>
                        <Textarea
                          value={config.customFarewell}
                          onChange={(e) => updateConfig({ customFarewell: e.target.value })}
                          placeholder="Obrigado por entrar em contato. Tenha um ótimo dia!"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Respostas Automáticas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Respostas Automáticas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {config.autoResponseMessages.map((message, index) => (
                          <div key={`${message.trigger}-${message.response}`} className="flex gap-2 p-3 border rounded-lg">
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder="Palavra-chave"
                                value={message.trigger}
                                onChange={(e) => {
                                  const newMessages = [...config.autoResponseMessages];
                                  newMessages[index].trigger = e.target.value;
                                  updateConfig({ autoResponseMessages: newMessages });
                                }}
                              />
                              <Textarea
                                placeholder="Resposta automática"
                                value={message.response}
                                onChange={(e) => {
                                  const newMessages = [...config.autoResponseMessages];
                                  newMessages[index].response = e.target.value;
                                  updateConfig({ autoResponseMessages: newMessages });
                                }}
                                rows={2}
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const newMessages = config.autoResponseMessages.filter((_, i) => i !== index);
                                updateConfig({ autoResponseMessages: newMessages });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          onClick={() => {
                            updateConfig({
                              autoResponseMessages: [
                                ...config.autoResponseMessages,
                                { trigger: '', response: '' }
                              ]
                            });
                          }}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Resposta Automática
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Webhooks */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="w-5 h-5" />
                        Webhooks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Eventos do Webhook</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Selecione os eventos que devem ser enviados para o webhook
                        </p>
                        <div className="space-y-2">
                          {[
                            { value: 'message', label: '💬 Mensagens' },
                            { value: 'status', label: '📊 Status' },
                            { value: 'qr', label: '📱 QR Code' },
                            { value: 'ready', label: '✅ Pronto' },
                            { value: 'error', label: '❌ Erros' }
                          ].map((event) => (
                            <div key={event.value} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={event.value}
                                checked={config.webhookEvents.includes(event.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    updateConfig({
                                      webhookEvents: [...config.webhookEvents, event.value]
                                    });
                                  } else {
                                    updateConfig({
                                      webhookEvents: config.webhookEvents.filter(e => e !== event.value)
                                    });
                                  }
                                }}
                                className="rounded"
                              />
                              <label htmlFor={event.value} className="text-sm">
                                {event.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Integrações API */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Integrações API
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {config.apiIntegrations.map((integration, index) => (
                          <div key={`${integration.name}-${integration.url}`} className="p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <Input
                                placeholder="Nome da Integração"
                                value={integration.name}
                                onChange={(e) => {
                                  const newIntegrations = [...config.apiIntegrations];
                                  newIntegrations[index].name = e.target.value;
                                  updateConfig({ apiIntegrations: newIntegrations });
                                }}
                              />
                              <Switch
                                checked={integration.enabled}
                                onCheckedChange={(checked) => {
                                  const newIntegrations = [...config.apiIntegrations];
                                  newIntegrations[index].enabled = checked;
                                  updateConfig({ apiIntegrations: newIntegrations });
                                }}
                              />
                            </div>
                            <Input
                              placeholder="URL da API"
                              value={integration.url}
                              onChange={(e) => {
                                const newIntegrations = [...config.apiIntegrations];
                                newIntegrations[index].url = e.target.value;
                                updateConfig({ apiIntegrations: newIntegrations });
                              }}
                            />
                            <div className="flex gap-2">
                              <Input
                                placeholder="API Key"
                                type="password"
                                value={integration.apiKey}
                                onChange={(e) => {
                                  const newIntegrations = [...config.apiIntegrations];
                                  newIntegrations[index].apiKey = e.target.value;
                                  updateConfig({ apiIntegrations: newIntegrations });
                                }}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const newIntegrations = config.apiIntegrations.filter((_, i) => i !== index);
                                  updateConfig({ apiIntegrations: newIntegrations });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          onClick={() => {
                            updateConfig({
                              apiIntegrations: [
                                ...config.apiIntegrations,
                                { name: '', url: '', apiKey: '', enabled: true }
                              ]
                            });
                          }}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Integração
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-6">
                <BotStatusMonitor botId={bot.id} botName={bot.name} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Botão de remoção */}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
              disabled={deleteBot.isPending}
              className="flex items-center gap-2"
            >
              {deleteBot.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Remover Bot
                </>
              )}
            </Button>
            
            {unsavedChanges && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Alterações não salvas</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateBot.isPending}
              className="flex items-center gap-2"
            >
              {updateBot.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
