import React, { useState, useRef } from 'react';
import { Plus, Bot, Play, Pause, Settings, Download, Upload, Eye, Loader2, Phone, MessageCircle, Zap, BarChart3, Calendar, Activity, FileText, Archive, ChevronRight, ChevronDown, FolderIcon, File as FileIcon, CheckCircle, XCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useBotsUnified, useCreateBotUnified, useBotStatusUnified, useImportBotUnified, useAnalyzeFolderUnified, type UnifiedBot } from '@/hooks/useBotsUnified';
import { BotConfigurationDialog } from './BotConfigurationDialog';
import JSZip from 'jszip';

// Helper para obter token JWT do localStorage
function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || '';
}

// Helper para uploads (multipart/form-data) autenticados
async function makeAuthenticatedUpload(url: string, formData: FormData): Promise<Response> {
  const token = getToken();
  
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });
}

interface FolderAnalysis {
  totalFiles: number;
  fileTypes: Record<string, number>;
  mainFile: string | null;
  hasPackageJson: boolean;
  hasConfigFiles: boolean;
  folders: string[];
  supportedFiles: File[];
  isValidBot: boolean;
  estimatedSize: number;
}

type BotType = 'whatsapp' | 'telegram' | 'discord' | 'chat';

const BotManagement = () => {
  const { data: bots = [], isLoading, refetch } = useBotsUnified();
  const createBot = useCreateBotUnified();
  const toggleStatus = useBotStatusUnified();
  const importBot = useImportBotUnified();
  const analyzeFolder = useAnalyzeFolderUnified();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedBot] = useState<UnifiedBot | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importType, setImportType] = useState<'json' | 'folder' | 'archive' | 'remote'>('json');
  // Estados para análise de arquivos
  const [folderAnalysis, setFolderAnalysis] = useState<{
    totalFiles: number;
    estimatedSize: number;
    mainFile: string | null;
    hasPackageJson: boolean;
    fileTypes: Record<string, number>;
    isValidBot: boolean;
    files: FileInfo[];
    structure: FileTreeNode[];
  } | null>(null);
  
  // Estados para pré-visualização de importação
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedFilePaths, setSelectedFilePaths] = useState<Set<string>>(new Set());
  const [botConfig, setBotConfig] = useState({
    name: '',
    description: '',
    type: 'whatsapp' as 'whatsapp' | 'telegram' | 'multi-session',
    version: '1.0.0'
  });

  // Interfaces para estrutura de arquivos
  interface FileInfo {
    name: string;
    path: string;
    size: number;
    type: string;
    content?: string;
    lastModified: number;
    isDirectory: boolean;
  }

  interface FileTreeNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    size?: number;
    children?: FileTreeNode[];
    isExpanded?: boolean;
  }
  
  const [importedFiles, setImportedFiles] = useState<FileInfo[]>([]);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedBotForConfig, setSelectedBotForConfig] = useState<UnifiedBot | null>(null);
  const [showBotConfigDialog, setShowBotConfigDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const archiveInputRef = useRef<HTMLInputElement>(null);

  const [newBot, setNewBot] = useState({
    name: '',
    description: '',
    type: 'whatsapp' as BotType,
    phone: '',
    token: '',
    webhook: ''
  });

  const resetNewBot = () => {
    setNewBot({
      name: '',
      description: '',
      type: 'whatsapp' as BotType,
      phone: '',
      token: '',
      webhook: ''
    });
  };

  const handleCreateBot = async () => {
    if (!newBot.name || !newBot.description) {
      toast.error('Nome e descrição são obrigatórios');
      return;
    }

    if (newBot.type === 'whatsapp' && !newBot.phone) {
      toast.error('Número do WhatsApp é obrigatório');
      return;
    }

    if ((newBot.type === 'telegram' || newBot.type === 'discord') && !newBot.token) {
      toast.error('Token é obrigatório para este tipo de bot');
      return;
    }

    try {
      await createBot.mutateAsync({
        name: newBot.name,
        description: newBot.description,
        type: newBot.type,
        phone: newBot.phone || undefined,
        token: newBot.token || undefined,
        webhook: newBot.webhook || undefined,
        config: {
          phone: newBot.phone,
          token: newBot.token,
          webhook: newBot.webhook
        }
      });

      toast.success('Bot criado com sucesso!');
      setShowCreateDialog(false);
      resetNewBot();
    } catch (error) {
      console.error('Erro ao criar bot:', error);
      toast.error('Erro ao criar bot');
    }
  };

  // Funções auxiliares para manipulação de arquivos
  const convertFilesToFileInfo = (files: File[]): FileInfo[] => {
    return files.map(file => ({
      name: file.name,
      path: file.webkitRelativePath || file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      lastModified: file.lastModified,
      isDirectory: false
    }));
  };

  const buildFileTree = (files: FileInfo[]): FileTreeNode[] => {
    const tree: FileTreeNode[] = [];
    const nodeMap: Record<string, FileTreeNode> = {};

    files.forEach(file => {
      const pathParts = file.path.split('/');
      let currentPath = '';
      
      pathParts.forEach((part, index) => {
        const isLast = index === pathParts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!nodeMap[currentPath]) {
          const node: FileTreeNode = {
            name: part,
            path: currentPath,
            type: isLast && !file.isDirectory ? 'file' : 'directory',
            size: isLast && !file.isDirectory ? file.size : undefined,
            children: isLast && !file.isDirectory ? undefined : [],
            isExpanded: false
          };
          
          nodeMap[currentPath] = node;
          
          if (index === 0) {
            tree.push(node);
          } else {
            const parentPath = pathParts.slice(0, index).join('/');
            const parent = nodeMap[parentPath];
            if (parent?.children) {
              parent.children.push(node);
            }
          }
        }
      });
    });

    return tree;
  };

  // Função helper para criar File objects compatíveis
  const createFileFromContent = (content: Blob, name: string, relativePath?: string): File => {
    const file = content as File;
    
    // Adicionar propriedades necessárias
    Object.defineProperty(file, 'name', {
      value: name,
      writable: false
    });
    
    if (relativePath) {
      Object.defineProperty(file, 'webkitRelativePath', {
        value: relativePath,
        writable: false
      });
    }
    
    return file;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleToggleStatus = async (botId: string) => {
    try {
      const bot = bots.find(b => b.id === botId);
      const action = bot?.is_active ? 'stop' : 'start';
      await toggleStatus.mutateAsync({ id: botId, action });
      toast.success('Status do bot atualizado!');
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do bot');
    }
  };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          JSON.parse(content); // Validar se é JSON válido
          setImportError(null);
          toast.success('Arquivo JSON válido selecionado!');
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          setImportError('Formato de arquivo inválido. Por favor, selecione um arquivo JSON válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleArchiveUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const supportedFormats = ['.zip', '.rar', '.7z', '.tar', '.tar.gz'];
      const isArchive = supportedFormats.some(format => 
        file.name.toLowerCase().endsWith(format.replace('.', ''))
      );

      if (!isArchive) {
        setImportError('Formato não suportado. Use: ZIP, RAR, 7Z, TAR, TAR.GZ');
        return;
      }

      setIsExtracting(true);
      setImportError(null);

      try {
        // Para arquivos ZIP, podemos usar a API nativa do navegador
        if (file.name.toLowerCase().endsWith('.zip')) {
          await handleZipExtraction(file);
        } else {
          // Para outros formatos, enviar para o backend
          await handleOtherArchiveFormats(file);
        }
      } catch (error) {
        console.error('Erro ao extrair arquivo:', error);
        setImportError('Erro ao extrair o arquivo compactado.');
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const handleZipExtraction = async (zipFile: File) => {
    try {
      const zip = new JSZip();
      
      const zipContent = await zip.loadAsync(zipFile);
      const extractedFiles: File[] = [];

      // Processar todos os arquivos do ZIP
      for (const [path, file] of Object.entries(zipContent.files)) {
        if (!file.dir && !path.includes('__MACOSX') && !path.startsWith('.')) {
          const content = await file.async('blob');
          const extractedFile = createFileFromContent(content, file.name, path);
          extractedFiles.push(extractedFile);
        }
      }

      if (extractedFiles.length === 0) {
        setImportError('Nenhum arquivo válido encontrado no arquivo ZIP.');
        return;
      }

      const fileInfos = convertFilesToFileInfo(extractedFiles);
      setImportedFiles(fileInfos);
      
      // Analisar arquivos extraídos
      const analysis = await analyzeFolder.mutateAsync(extractedFiles);
      const enhancedAnalysis = {
        ...analysis,
        files: fileInfos,
        structure: buildFileTree(fileInfos)
      };
      setFolderAnalysis(enhancedAnalysis);
      setShowPreviewDialog(true);
      
      if (!analysis.isValidBot) {
        setImportError('O arquivo ZIP não parece conter um bot válido.');
      } else {
        toast.success(`ZIP extraído: ${analysis.totalFiles} arquivos encontrados`);
      }

    } catch (error) {
      console.error('Erro ao extrair ZIP:', error);
      setImportError('Erro ao extrair o arquivo ZIP. Verifique se o arquivo não está corrompido.');
    }
  };

  const handleOtherArchiveFormats = async (archiveFile: File) => {
    // Enviar para o backend para extração de outros formatos
    const formData = new FormData();
    formData.append('archive', archiveFile);

    try {
      const response = await makeAuthenticatedUpload(`${import.meta.env?.VITE_API_BASE || 'http://localhost:3002'}/api/bots/extract-archive`, formData);

      if (!response.ok) {
        throw new Error('Erro ao extrair arquivo no servidor');
      }

      const result = await response.json();
      
      // Converter resposta do backend em arquivos File
      const extractedFiles: File[] = result.files.map((fileData: { content: string; name: string; mimeType: string; path: string }) => {
        const blob = new Blob([atob(fileData.content)], { type: fileData.mimeType });
        const file = createFileFromContent(blob, fileData.name, fileData.path);
        return file;
      });

      const fileInfos = convertFilesToFileInfo(extractedFiles);
      setImportedFiles(fileInfos);
      
      const analysis = await analyzeFolder.mutateAsync(extractedFiles);
      const enhancedAnalysis = {
        ...analysis,
        files: fileInfos,
        structure: buildFileTree(fileInfos)
      };
      setFolderAnalysis(enhancedAnalysis);
      setShowPreviewDialog(true);
      
      if (!analysis.isValidBot) {
        setImportError('O arquivo compactado não parece conter um bot válido.');
      } else {
        toast.success(`Arquivo extraído: ${analysis.totalFiles} arquivos encontrados`);
      }

    } catch (error) {
      console.error('Erro na extração pelo backend:', error);
      setImportError('Erro ao extrair o arquivo. Verifique se o formato é suportado.');
    }
  };

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const fileInfos = convertFilesToFileInfo(fileArray);
      setImportedFiles(fileInfos);
      
      try {
        const analysis = await analyzeFolder.mutateAsync(fileArray);
        const enhancedAnalysis = {
          ...analysis,
          files: fileInfos,
          structure: buildFileTree(fileInfos)
        };
        setFolderAnalysis(enhancedAnalysis);
        setImportError(null);
        setShowPreviewDialog(true);
        
        if (!analysis.isValidBot) {
          setImportError('A pasta selecionada não parece conter um bot válido. Verifique se existe package.json, arquivo principal (index.js, main.js) ou arquivos de configuração.');
        } else {
          toast.success(`Pasta analisada: ${analysis.totalFiles} arquivos encontrados`);
        }
      } catch (error) {
        console.error('Erro ao analisar pasta:', error);
        setImportError('Erro ao analisar a estrutura da pasta.');
      }
    }
  };

  const handleImportBot = async () => {
    try {
      if (importType === 'json' && fileInputRef.current?.files?.[0]) {
        await importBot.mutateAsync({
          type: 'local',
          files: fileInputRef.current.files
        });
      } else if ((importType === 'folder' || importType === 'archive') && showPreviewDialog) {
        // Para importação de pasta/arquivo com pré-visualização
        const selectedFiles = importedFiles.filter(fileInfo => 
          selectedFilePaths.has(fileInfo.path)
        );
        
        // Criar dados de bot a partir da configuração
        const botData = {
          name: botConfig.name,
          description: botConfig.description,
          type: botConfig.type,
          version: botConfig.version,
          files: selectedFiles,
          totalFiles: selectedFiles.length,
          estimatedSize: selectedFiles.reduce((total, file) => total + file.size, 0)
        };
        
        await importBot.mutateAsync({
          type: 'folder',
          botData: botData
        });
        
        setShowPreviewDialog(false);
        toast.success(`Bot "${botConfig.name}" importado com sucesso!`);
      } else if ((importType === 'folder' || importType === 'archive') && importedFiles.length > 0) {
        // Importação direta sem pré-visualização (modo legacy)
        // Converter FileInfo para um formato que o backend possa processar
        const fileData = importedFiles.map(fileInfo => ({
          name: fileInfo.name,
          path: fileInfo.path,
          size: fileInfo.size,
          type: fileInfo.type,
          lastModified: fileInfo.lastModified,
          isDirectory: fileInfo.isDirectory
        }));
        
        await importBot.mutateAsync({
          type: 'folder',
          botData: {
            name: 'Bot Importado',
            description: 'Bot importado automaticamente',
            type: 'whatsapp',
            version: '1.0.0',
            files: fileData,
            totalFiles: fileData.length,
            estimatedSize: fileData.reduce((total, file) => total + file.size, 0)
          }
        });
      } else if (importType === 'remote' && remoteUrl) {
        await importBot.mutateAsync({
          type: 'remote',
          url: remoteUrl
        });
      } else {
        setImportError('Por favor, selecione um arquivo, pasta ou URL válida.');
        return;
      }

      setShowImportDialog(false);
      setImportError(null);
      setFolderAnalysis(null);
      setImportedFiles([]);
      setSelectedFilePaths(new Set());
      setRemoteUrl('');
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('Erro ao importar bot');
    }
  };

  // Componente de árvore de arquivos
  const FileTreeNode: React.FC<{ 
    node: FileTreeNode; 
    level: number;
    onToggle: (path: string) => void;
    onFileSelect: (path: string, selected: boolean) => void;
    selectedPaths: Set<string>;
  }> = ({ node, level, onToggle, onFileSelect, selectedPaths }) => {
    const isSelected = selectedPaths.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.isExpanded;

    const getFileIcon = (name: string, type: 'file' | 'directory') => {
      if (type === 'directory') {
        return <FolderIcon className="w-4 h-4 text-blue-500" />;
      }
      
      const ext = name.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
          return <FileText className="w-4 h-4 text-yellow-500" />;
        case 'json':
          return <FileText className="w-4 h-4 text-green-500" />;
        case 'md':
          return <FileText className="w-4 h-4 text-gray-500" />;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
          return <Eye className="w-4 h-4 text-purple-500" />;
        default:
          return <FileIcon className="w-4 h-4 text-gray-400" />;
      }
    };

    return (
      <div>
        <div 
          className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded cursor-pointer group pl-${level * 5}`}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onToggle(node.path)}
              aria-label={isExpanded ? 'Recolher pasta' : 'Expandir pasta'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
          
          {!hasChildren && <div className="w-6" />}
          
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onFileSelect(node.path, e.target.checked)}
            className="w-4 h-4"
            aria-label={`Selecionar arquivo ${node.name}`}
            title={`Selecionar ${node.name}`}
          />
          
          {getFileIcon(node.name, node.type)}
          
          <span className="flex-1 text-sm font-medium">
            {node.name}
          </span>
          
          {!!(node.type === 'file' && node.size) && (
            <span className="text-xs text-gray-500">
              {formatFileSize(node.size)}
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children?.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                level={level + 1}
                onToggle={onToggle}
                onFileSelect={onFileSelect}
                selectedPaths={selectedPaths}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Handlers para árvore de arquivos
  const toggleTreeNode = (path: string) => {
    if (folderAnalysis) {
      const toggleNodeRecursively = (nodes: FileTreeNode[]): FileTreeNode[] => {
        return nodes.map(node => {
          if (node.path === path) {
            return { ...node, isExpanded: !node.isExpanded };
          } else if (node.children) {
            return { ...node, children: toggleNodeRecursively(node.children) };
          }
          return node;
        });
      };

      setFolderAnalysis({
        ...folderAnalysis,
        structure: toggleNodeRecursively(folderAnalysis.structure)
      });
    }
  };

  const handleFileSelection = (path: string, selected: boolean) => {
    const newSelection = new Set(selectedFilePaths);
    if (selected) {
      newSelection.add(path);
    } else {
      newSelection.delete(path);
    }
    setSelectedFilePaths(newSelection);
  };

  const selectAllFiles = () => {
    if (folderAnalysis) {
      const allPaths = folderAnalysis.files.map(f => f.path);
      setSelectedFilePaths(new Set(allPaths));
    }
  };

  const deselectAllFiles = () => {
    setSelectedFilePaths(new Set());
  };

  const exportBots = () => {
    const exportData = {
      bots: bots,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bots-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Bots exportados com sucesso!');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'error': return 'Erro';
      default: return 'Inativo';
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'whatsapp':
        return <Phone className="w-4 h-4" />;
      case 'telegram':
      case 'discord':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Carregando bots...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Bots</h2>
          <p className="text-muted-foreground">
            Gerencie seus bots de automação e integrações
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportBots}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Bot
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bots.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bots Ativos</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bots.filter(bot => bot.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bots.reduce((acc, bot) => acc + (bot.totalRuns || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {bots.filter(bot => bot.status === 'error').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <Card key={bot.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(bot.type)}
                  <CardTitle className="text-lg">{bot.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(bot.status)}`} />
                  <Badge variant={bot.status === 'active' ? 'default' : 'secondary'}>
                    {getStatusText(bot.status)}
                  </Badge>
                </div>
              </div>
              <CardDescription>{bot.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Versão: {bot.version}</div>
                <div>Última atividade: {bot.lastRun}</div>
                <div>Uptime: {bot.is_active ? 'Online' : 'Offline'}</div>
                <div>Execuções: {bot.totalRuns || 0}</div>
              </div>

              {bot.status === 'active' && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Performance</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(bot.id)}
                disabled={toggleStatus.isPending}
              >
                {bot.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Iniciar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedBotForConfig(bot);
                  setShowBotConfigDialog(true);
                }}
              >
                <Settings className="w-4 h-4 mr-1" />
                Config
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                Logs
              </Button>
            </CardFooter>
          </Card>
        ))}

        {bots.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum bot encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro bot de automação
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Bot
            </Button>
          </div>
        )}
      </div>

      {/* Create Bot Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Bot</DialogTitle>
            <DialogDescription>
              Configure um novo bot de automação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bot-name">Nome do Bot</Label>
              <Input
                id="bot-name"
                value={newBot.name}
                onChange={(e) => setNewBot({...newBot, name: e.target.value})}
                placeholder="Nome do bot"
              />
            </div>
            <div>
              <Label htmlFor="bot-description">Descrição</Label>
              <Textarea
                id="bot-description"
                value={newBot.description}
                onChange={(e) => setNewBot({...newBot, description: e.target.value})}
                placeholder="Descrição do bot"
              />
            </div>
            <div>
              <Label htmlFor="bot-type">Plataforma</Label>
              <Select 
                value={newBot.type} 
                onValueChange={(value: string) => setNewBot({...newBot, type: value as BotType})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newBot.type === "whatsapp" && (
              <div>
                <Label htmlFor="bot-phone">Número do WhatsApp</Label>
                <Input
                  id="bot-phone"
                  value={newBot.phone}
                  onChange={(e) => setNewBot({...newBot, phone: e.target.value})}
                  placeholder="+55 11 99999-9999"
                />
              </div>
            )}
            {(newBot.type === "telegram" || newBot.type === "discord") && (
              <div>
                <Label htmlFor="bot-token">Token do Bot</Label>
                <Input
                  id="bot-token"
                  type="password"
                  value={newBot.token}
                  onChange={(e) => setNewBot({...newBot, token: e.target.value})}
                  placeholder="Cole o token aqui"
                />
              </div>
            )}
            <div>
              <Label htmlFor="bot-webhook">Webhook URL (Opcional)</Label>
              <Input
                id="bot-webhook"
                value={newBot.webhook}
                onChange={(e) => setNewBot({...newBot, webhook: e.target.value})}
                placeholder="https://webhook.site/your-unique-id"
              />
            </div>
            <Button 
              onClick={handleCreateBot} 
              className="w-full"
              disabled={createBot.isPending}
            >
              {createBot.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Bot
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar Bots</DialogTitle>
            <DialogDescription>
              Escolha como deseja importar seu bot
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={importType} onValueChange={(value) => setImportType(value as 'json' | 'folder' | 'archive' | 'remote')}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="json">Arquivo JSON</TabsTrigger>
              <TabsTrigger value="folder">Pasta Completa</TabsTrigger>
              <TabsTrigger value="archive">Arquivo ZIP/RAR</TabsTrigger>
              <TabsTrigger value="remote">URL Remota</TabsTrigger>
            </TabsList>

            <TabsContent value="json" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Selecionar Arquivo JSON
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Importar bot a partir de um arquivo de configuração JSON
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Selecionar arquivo JSON para importação"
                  title="Selecionar arquivo JSON"
                />
              </div>
            </TabsContent>

            <TabsContent value="folder" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <Button
                  variant="outline"
                  onClick={() => folderInputRef.current?.click()}
                >
                  Selecionar Pasta
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Importar pasta completa com todos os arquivos do bot
                </p>
                <input
                  ref={folderInputRef}
                  type="file"
                  multiple
                  onChange={handleFolderUpload}
                  className="hidden"
                  aria-label="Selecionar pasta para importação"
                  title="Selecionar pasta"
                  {...({ webkitdirectory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
                />
              </div>

              {folderAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Análise da Pasta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total de arquivos:</span> {folderAnalysis.totalFiles}
                      </div>
                      <div>
                        <span className="font-medium">Tamanho estimado:</span> {formatFileSize(folderAnalysis.estimatedSize)}
                      </div>
                      <div>
                        <span className="font-medium">Arquivo principal:</span> {folderAnalysis.mainFile || 'Não encontrado'}
                      </div>
                      <div>
                        <span className="font-medium">Package.json:</span> {folderAnalysis.hasPackageJson ? '✅' : '❌'}
                      </div>
                    </div>
                    
                    {Object.keys(folderAnalysis.fileTypes).length > 0 && (
                      <div>
                        <span className="font-medium">Tipos de arquivo:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(folderAnalysis.fileTypes).map(([ext, count]) => (
                            <Badge key={ext} variant="outline" className="text-xs">
                              .{ext} ({String(count)})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${folderAnalysis.isValidBot ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={folderAnalysis.isValidBot ? 'text-green-700' : 'text-red-700'}>
                        {folderAnalysis.isValidBot ? 'Bot válido detectado' : 'Estrutura de bot inválida'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="archive" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <Button
                  variant="outline"
                  onClick={() => archiveInputRef.current?.click()}
                  disabled={isExtracting}
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extraindo...
                    </>
                  ) : (
                    'Selecionar Arquivo Compactado'
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Suporta ZIP, RAR, 7Z, TAR, TAR.GZ
                </p>
                <input
                  ref={archiveInputRef}
                  type="file"
                  accept=".zip,.rar,.7z,.tar,.gz"
                  onChange={handleArchiveUpload}
                  className="hidden"
                  aria-label="Selecionar arquivo compactado para importação"
                  title="Selecionar arquivo compactado"
                />
              </div>

              {folderAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Análise do Arquivo Extraído</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total de arquivos:</span> {folderAnalysis.totalFiles}
                      </div>
                      <div>
                        <span className="font-medium">Tamanho estimado:</span> {formatFileSize(folderAnalysis.estimatedSize)}
                      </div>
                      <div>
                        <span className="font-medium">Arquivo principal:</span> {folderAnalysis.mainFile || 'Não encontrado'}
                      </div>
                      <div>
                        <span className="font-medium">Package.json:</span> {folderAnalysis.hasPackageJson ? '✅' : '❌'}
                      </div>
                    </div>
                    
                    {Object.keys(folderAnalysis.fileTypes).length > 0 && (
                      <div>
                        <span className="font-medium">Tipos de arquivo:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(folderAnalysis.fileTypes).map(([ext, count]) => (
                            <Badge key={ext} variant="outline" className="text-xs">
                              .{ext} ({String(count)})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${folderAnalysis.isValidBot ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={folderAnalysis.isValidBot ? 'text-green-700' : 'text-red-700'}>
                        {folderAnalysis.isValidBot ? 'Bot válido detectado' : 'Estrutura de bot inválida'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="remote" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="remote-url">URL do Repositório</Label>
                  <Input
                    id="remote-url"
                    placeholder="https://github.com/usuario/meu-bot"
                    value={remoteUrl}
                    onChange={(e) => setRemoteUrl(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Suporta repositórios GitHub, GitLab e outras URLs públicas
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {importError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-700">{importError}</p>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowImportDialog(false);
                setImportError(null);
                setFolderAnalysis(null);
                setImportedFiles([]);
                setRemoteUrl('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleImportBot}
              disabled={importBot.isPending}
            >
              {importBot.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                'Importar Bot'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog - Tela melhorada de pré-visualização de arquivos importados */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Pré-visualização da Importação
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes do bot e selecione os arquivos que deseja importar
            </DialogDescription>
          </DialogHeader>
          
          {folderAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Painel esquerdo - Configuração do Bot */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      Configuração do Bot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="bot-name">Nome do Bot</Label>
                      <Input
                        id="bot-name"
                        value={botConfig.name}
                        onChange={(e) => setBotConfig({...botConfig, name: e.target.value})}
                        placeholder="Nome do seu bot"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bot-description">Descrição</Label>
                      <Input
                        id="bot-description"
                        value={botConfig.description}
                        onChange={(e) => setBotConfig({...botConfig, description: e.target.value})}
                        placeholder="Descrição do bot"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bot-type">Tipo de Bot</Label>
                      <Select 
                        value={botConfig.type} 
                        onValueChange={(value: 'whatsapp' | 'telegram' | 'multi-session') => setBotConfig({...botConfig, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="telegram">Telegram</SelectItem>
                          <SelectItem value="multi-session">Multi Session</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="bot-version">Versão</Label>
                      <Input
                        id="bot-version"
                        value={botConfig.version}
                        onChange={(e) => setBotConfig({...botConfig, version: e.target.value})}
                        placeholder="1.0.0"
                      />
                    </div>
                    
                    {/* Status do Bot Detectado */}
                    <div className="p-4 rounded-lg border bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        {folderAnalysis.isValidBot ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-medium">
                          {folderAnalysis.isValidBot ? 'Bot Válido' : 'Bot Inválido'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {folderAnalysis.isValidBot 
                          ? 'Estrutura de bot válida detectada!' 
                          : 'Alguns arquivos importantes podem estar faltando.'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Estatísticas dos Arquivos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total de arquivos:</span>
                        <div className="text-xl font-bold">{folderAnalysis.totalFiles}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Tamanho total:</span>
                        <div className="text-xl font-bold">{formatFileSize(folderAnalysis.estimatedSize)}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Info className="w-4 h-4" />
                        Arquivo principal:
                      </div>
                      <div className="text-sm font-medium">
                        {folderAnalysis.mainFile || 'Não encontrado'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <FileIcon className="w-4 h-4" />
                        Package.json:
                      </div>
                      <div className="text-sm font-medium">
                        {folderAnalysis.hasPackageJson ? '✅ Encontrado' : '❌ Não encontrado'}
                      </div>
                    </div>
                    
                    {Object.keys(folderAnalysis.fileTypes).length > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Tipos de arquivo:</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(folderAnalysis.fileTypes).map(([ext, count]) => (
                            <Badge key={ext} variant="outline" className="text-xs">
                              .{ext} ({String(count)})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Painel direito - Árvore de Arquivos */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FolderIcon className="w-4 h-4" />
                        Estrutura de Arquivos
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAllFiles}
                          className="text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Selecionar Todos
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={deselectAllFiles}
                          className="text-xs"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Desmarcar Todos
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedFilePaths.size} de {folderAnalysis.totalFiles} arquivos selecionados
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-1">
                        {folderAnalysis.structure.map((node) => (
                          <FileTreeNode
                            key={node.path}
                            node={node}
                            level={0}
                            onToggle={toggleTreeNode}
                            onFileSelect={handleFileSelection}
                            selectedPaths={selectedFilePaths}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPreviewDialog(false);
                setShowImportDialog(true);
              }}
            >
              Voltar
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowPreviewDialog(false);
                  setFolderAnalysis(null);
                  setImportedFiles([]);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleImportBot}
                disabled={selectedFilePaths.size === 0 || !botConfig.name || importBot.isPending}
              >
                {importBot.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Confirmar Importação
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
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
                <div className="space-y-4">
                  <div>
                    <Label>Webhook URL</Label>
                    <Input defaultValue={selectedBot.config?.webhook || ''} />
                  </div>
                  {selectedBot.type === 'whatsapp' && (
                    <div>
                      <Label>Número do WhatsApp</Label>
                      <Input defaultValue={selectedBot.config?.phone || selectedBot.session_name || ''} />
                    </div>
                  )}
                  {(selectedBot.type === 'telegram' || selectedBot.type === 'discord') && (
                    <div>
                      <Label>Token</Label>
                      <Input type="password" defaultValue={selectedBot.config?.token || ''} />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Configurações de agendamento em breve
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Logs do bot em breve
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancelar
            </Button>
            <Button>Salvar Configurações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Configuração Avançada */}
      <BotConfigurationDialog
        bot={selectedBotForConfig}
        open={showBotConfigDialog}
        onOpenChange={setShowBotConfigDialog}
        importedFiles={importedFiles.map(file => new File([], file.name))} // Converter FileInfo para File
        autoAnalyze={true}
        onBotUpdated={() => {
          refetch();
          setShowBotConfigDialog(false);
        }}
      />
    </div>
  );
};

export default BotManagement;