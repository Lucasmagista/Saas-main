import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Helper para obter token JWT do localStorage
function getToken(): string {
  if (typeof window === 'undefined') return '';
  const token = localStorage.getItem('accessToken') || '';
  console.log('🔑 [getToken]:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenStart: token ? token.substring(0, 20) + '...' : 'no token'
  });
  return token;
}

// Helper para fazer requisições autenticadas
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  
  console.log('🔐 [makeAuthenticatedRequest]:', {
    url,
    method: options.method || 'GET',
    hasToken: !!token,
    tokenLength: token?.length || 0
  });
  
  const headers = {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Adicionar timeout de 10 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    console.log('📤 [makeAuthenticatedRequest] Enviando requisição...');
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log('📡 [makeAuthenticatedRequest] Resposta recebida:', {
      url,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ [makeAuthenticatedRequest] Erro na requisição:', error);
    throw error;
  }
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

// Interfaces para tipos específicos
interface BotConfig {
  phone?: string;
  token?: string;
  webhook?: string;
  [key: string]: unknown;
}

interface ApiBot {
  id: string;
  name: string;
  description?: string;
  session_name?: string;
  qrcode?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  organization_id?: string;
}

// Interface unificada para bots
export interface UnifiedBot {
  id: string;
  name: string;
  description?: string | null;
  session_name?: string | null;
  qrcode?: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  organization_id?: string | null;
  channel?: string;
  config?: BotConfig;
  type?: string;
  // Campos extras para compatibilidade
  status?: 'active' | 'inactive' | 'error';
  version?: string;
  author?: string;
  source?: string;
  lastRun?: string;
  totalRuns?: number;
  files?: string[];
  dependencies?: string[];
  entryPoint?: string;
}

const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:3002';

// Hook unificado para listar todos os bots
export const useBotsUnified = () => {
  const { toast } = useToast();

  return useQuery<UnifiedBot[]>({
    queryKey: ['bots-unified'],
    queryFn: async () => {
      try {
        // Buscar da API backend (tabela bots)
        const apiResponse = await makeAuthenticatedRequest(`${API_BASE}/api/bots`);
        const apiBots = apiResponse.ok ? await apiResponse.json() : [];

        // Buscar do Supabase (tabela chatbots)
        const { data: chatbots, error } = await supabase
          .from('chatbots')
          .select('*')
          .order('created_at', { ascending: false });

        if (error && error.code !== 'PGRST116') { // Ignora erro de tabela não encontrada
          console.warn('Erro ao carregar chatbots:', error);
        }

        // Unificar os dados
        const unifiedBots: UnifiedBot[] = [
          // Bots da API backend
          ...(apiBots || []).map((bot: ApiBot) => ({
            id: bot.id,
            name: bot.name,
            description: bot.description,
            session_name: bot.session_name,
            qrcode: bot.qrcode,
            is_active: bot.is_active || false,
            created_at: bot.created_at || null,
            updated_at: bot.updated_at || null,
            organization_id: bot.organization_id,
            type: 'whatsapp',
            status: bot.is_active ? 'active' : 'inactive',
            version: '1.0.0',
            author: 'Sistema',
            source: bot.session_name || 'Local',
            lastRun: bot.updated_at || 'Nunca',
            totalRuns: 0,
            files: [],
            dependencies: [],
            entryPoint: 'index.js'
          })),
          // Chatbots do Supabase
          ...(chatbots || []).map((bot) => ({
            id: bot.id,
            name: bot.name,
            description: bot.description,
            channel: bot.channel,
            is_active: bot.is_active || false,
            config: bot.config as BotConfig || {},
            created_at: bot.created_at || null,
            updated_at: bot.updated_at || null,
            organization_id: bot.organization_id,
            knowledge_base: bot.knowledge_base,
            created_by: bot.created_by,
            type: bot.channel || 'chat',
            status: bot.is_active ? 'active' : 'inactive',
            version: '1.0.0',
            author: bot.created_by || 'Sistema',
            source: bot.channel || 'Chatbot',
            lastRun: bot.updated_at || 'Nunca',
            totalRuns: 0,
            files: [],
            dependencies: [],
            entryPoint: 'index.js'
          }))
        ];

        return unifiedBots;
      } catch (error: Error | unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        toast({
          title: 'Erro ao carregar bots',
          description: errorMessage,
          variant: 'destructive',
        });
        return [];
      }
    },
  });
};

// Hook para criar bot unificado
export const useCreateBotUnified = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (botData: {
      name: string;
      description?: string;
      type: 'whatsapp' | 'telegram' | 'discord' | 'chat' | string;
      config?: BotConfig;
      phone?: string;
      token?: string;
      webhook?: string;
    }) => {
      if (botData.type === 'whatsapp') {
        // Criar bot WhatsApp via API backend
        const response = await makeAuthenticatedRequest(`${API_BASE}/api/bots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: botData.name,
            description: botData.description || null,
            session_name: botData.name.toLowerCase().replace(/\s+/g, '_'),
            config: botData.config || {}
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao criar bot WhatsApp');
        }

        return await response.json();
      } else {
        // Criar chatbot via Supabase
        const { data, error } = await supabase
          .from('chatbots')
          .insert({
            name: botData.name,
            description: botData.description,
            channel: botData.type,
            config: (botData.config || {}) as never,
            is_active: false
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots-unified'] });
      toast({
        title: 'Bot criado',
        description: 'Bot criado com sucesso.',
      });
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao criar bot',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar bot
export const useUpdateBotUnified = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { id: string; name: string; type: string } & Partial<UnifiedBot>) => {
      const { id, name, type, ...updates } = params;
      if (type === 'whatsapp' || !type) {
        // Sempre envie name e type para o backend
        const body = {
          name,
          type,
          ...updates
        };
        const response = await makeAuthenticatedRequest(`${API_BASE}/api/bots/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao atualizar bot');
        }

        return await response.json();
      } else {
        // Atualizar via Supabase - apenas campos compatíveis
        const { data, error } = await supabase
          .from('chatbots')
          .update({
            name,
            description: updates.description,
            is_active: updates.is_active,
            config: updates.config ? (updates.config as never) : undefined
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots-unified'] });
      toast({
        title: 'Bot atualizado',
        description: 'Bot atualizado com sucesso.',
      });
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao atualizar bot',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// Hook para deletar bot
export const useDeleteBotUnified = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type?: string }) => {
      console.log('🗑️ [useDeleteBotUnified] Iniciando:', { id, type });
      
      if (type === 'whatsapp' || !type) {
        // Deletar via API backend
        const url = `${API_BASE}/api/bots/${id}`;
        console.log('🌐 [useDeleteBotUnified] URL:', url);
        
        const response = await makeAuthenticatedRequest(url, {
          method: 'DELETE',
        });

        console.log('📡 [useDeleteBotUnified] Resposta:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText
        });

        if (!response.ok) {
          let errorMessage = 'Erro ao deletar bot';
          try {
            const errorData = await response.json();
            console.log('❌ [useDeleteBotUnified] Erro da API:', errorData);
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            console.log('❌ [useDeleteBotUnified] Erro ao parsear:', parseError);
            errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('✅ [useDeleteBotUnified] Sucesso da API:', result);
        return result;
      } else {
        // Deletar via Supabase
        console.log('🗄️ [useDeleteBotUnified] Deletando via Supabase...');
        const { error } = await supabase
          .from('chatbots')
          .delete()
          .eq('id', id);

        if (error) {
          console.log('❌ [useDeleteBotUnified] Erro Supabase:', error);
          throw error;
        }
        
        console.log('✅ [useDeleteBotUnified] Sucesso Supabase');
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots-unified'] });
      toast({
        title: 'Bot removido',
        description: 'Bot removido com sucesso.',
      });
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao remover bot',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// Hook para controlar status do bot (start/stop)
export const useBotStatusUnified = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'start' | 'stop' }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/bots/${id}/${action}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro ao ${action === 'start' ? 'iniciar' : 'parar'} bot`);
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bots-unified'] });
      toast({
        title: `Bot ${variables.action === 'start' ? 'iniciado' : 'parado'}`,
        description: `Bot ${variables.action === 'start' ? 'iniciado' : 'parado'} com sucesso.`,
      });
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// Hook para importar bots
export const useImportBotUnified = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ type, files, url, folderFiles, botData }: {
      type: 'local' | 'remote' | 'folder';
      files?: FileList;
      url?: string;
      folderFiles?: File[];
      botData?: {
        name: string;
        description: string;
        type: string;
        version: string;
        files: Array<{
          name: string;
          path: string;
          size: number;
          type: string;
          lastModified: number;
          isDirectory: boolean;
        }>;
        totalFiles: number;
        estimatedSize: number;
      };
    }) => {
      if (type === 'folder' && (folderFiles || botData)) {
        const formData = new FormData();
        
        if (botData) {
          // Importar com dados configurados na pré-visualização
          formData.append('botConfig', JSON.stringify({
            name: botData.name,
            description: botData.description,
            type: botData.type,
            version: botData.version
          }));
          
          // Adicionar informações dos arquivos selecionados
          formData.append('selectedFiles', JSON.stringify(botData.files));
          
        } else if (folderFiles) {
          // Importar pasta com múltiplos arquivos (modo legacy)
          folderFiles.forEach((file, index) => {
            formData.append('files', file);
            formData.append(`filePaths[${index}]`, file.webkitRelativePath || file.name);
          });
        }

        const response = await makeAuthenticatedUpload(`${API_BASE}/api/bots/import/folder`, formData);

        if (!response.ok) {
          let errorMessage = 'Erro ao importar pasta de bot';
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // Se não conseguir parsear JSON, usar mensagem baseada no status
            if (response.status === 404) {
              errorMessage = 'Endpoint de importação não encontrado. Verifique se o servidor backend está rodando.';
            } else if (response.status === 500) {
              errorMessage = 'Erro interno do servidor durante importação.';
            } else {
              errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
            }
          }
          
          throw new Error(errorMessage);
        }

        return await response.json();
      } else if (type === 'local' && files) {
        // Importar arquivo único (JSON)
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append('files', file));

        const response = await makeAuthenticatedUpload(`${API_BASE}/api/bots/import/local`, formData);

        if (!response.ok) {
          let errorMessage = 'Erro ao importar bot local';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        return await response.json();
      } else if (type === 'remote' && url) {
        // Importar de repositório remoto (GitHub, etc.)
        const response = await makeAuthenticatedRequest(`${API_BASE}/api/bots/import/remote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          let errorMessage = 'Erro ao importar bot remoto';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        return await response.json();
      }

      throw new Error('Parâmetros inválidos para importação');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bots-unified'] });
      const count = Array.isArray(data) ? data.length : 1;
      toast({
        title: 'Importação concluída',
        description: `${count} bot(s) importado(s) com sucesso.`,
      });
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao importar bot',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// Hook para analisar estrutura de pasta antes da importação
export const useAnalyzeFolderUnified = () => {
  return useMutation({
    mutationFn: async (folderFiles: File[]) => {
      // Analisar estrutura da pasta localmente
      const structure = {
        totalFiles: folderFiles.length,
        fileTypes: {} as Record<string, number>,
        mainFile: null as string | null,
        hasPackageJson: false,
        hasConfigFiles: false,
        folders: new Set<string>(),
        supportedFiles: [] as File[],
      };

      folderFiles.forEach(file => {
        const path = file.webkitRelativePath || file.name;
        const extension = path.split('.').pop()?.toLowerCase() || '';
        const folderPath = path.split('/').slice(0, -1).join('/');
        
        if (folderPath) {
          structure.folders.add(folderPath);
        }

        // Contar tipos de arquivo
        structure.fileTypes[extension] = (structure.fileTypes[extension] || 0) + 1;

        // Verificar arquivos importantes
        if (file.name === 'package.json') {
          structure.hasPackageJson = true;
        }

        if (['config.json', 'bot.json', '.env', 'settings.json'].includes(file.name.toLowerCase())) {
          structure.hasConfigFiles = true;
        }

        // Detectar arquivo principal
        if (['index.js', 'main.js', 'bot.js', 'app.js'].includes(file.name.toLowerCase())) {
          structure.mainFile = file.name;
        }

        // Filtrar arquivos suportados (excluir node_modules, .git, etc.)
        if (!path.includes('node_modules') && 
            !path.includes('.git') && 
            !path.includes('.cache') &&
            !path.startsWith('.')) {
          structure.supportedFiles.push(file);
        }
      });

      return {
        ...structure,
        folders: Array.from(structure.folders),
        isValidBot: structure.hasPackageJson || structure.mainFile !== null || structure.hasConfigFiles,
        estimatedSize: folderFiles.reduce((acc, file) => acc + file.size, 0),
      };
    },
  });
};
