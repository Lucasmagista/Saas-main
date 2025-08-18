import { authService } from './authService';

/**
 * Funções utilitárias para comunicação com o backend Express
 * responsável pela integração com o WhatsApp. O endereço base é
 * definido considerando que, em desenvolvimento, o backend roda na
 * porta 3002 enquanto o frontend executa em outra porta (Vite). Em
 * produção estes valores devem ser ajustados de acordo com a
 * configuração de deploy. Todos os métodos retornam promessas com
 * os dados já convertidos de JSON.
 */

const API_BASE_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3002/api/whatsapp` : 'http://localhost:3002/api/whatsapp';

// Helper para obter token JWT do localStorage
function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || '';
}

// Helper para fazer requisições com renovação automática de token
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!token) {
    throw new Error('Token de autenticação não encontrado. Faça login primeiro.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Se token expirou, tenta renovar automaticamente
  if (response.status === 401) {
    try {
      await authService.refreshTokens();
      
      // Tenta novamente com novo token
      const newToken = getToken();
      if (newToken) {
        const newHeaders = {
          ...headers,
          'Authorization': `Bearer ${newToken}`,
        };
        
        return await fetch(url, {
          ...options,
          headers: newHeaders,
          credentials: 'include',
        });
      }
    } catch (refreshError) {
      throw new Error('Token expirado. Faça login novamente.');
    }
  }

  return response;
}

export interface Message {
  id: string;
  number: string;
  message: string;
  fromMe: boolean;
  timestamp: string;
}

/**
 * Envia uma mensagem para o número especificado. Retorna a
 * mensagem com metadados retornados pelo backend.
 */
export async function sendMessageApi(number: string, message: string): Promise<Message> {
  const response = await makeAuthenticatedRequest(`${API_BASE_URL}/send`, {
    method: 'POST',
    body: JSON.stringify({ number, message }),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Token expirado. Faça login novamente.');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao enviar mensagem');
  }
  return response.json();
}

/**
 * Obtém a lista completa de mensagens armazenadas no backend. A
 * implementação de backend atualmente não suporta paginação.
 */
export interface PaginatedMessages {
  data: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Obtém mensagens com suporte a paginação. Por padrão, busca a
 * primeira página com 50 itens. Podem ser passados filtros
 * adicionais via query (ex.: number) para restringir o resultado.
 */
export async function getMessagesApi(page = 1, limit = 50, filters?: { number?: string; date?: string }): Promise<PaginatedMessages> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  if (filters?.number) {
    params.set('number', filters.number);
  }
  if (filters?.date) {
    params.set('date', filters.date);
  }
  
  const response = await makeAuthenticatedRequest(`${API_BASE_URL}/messages?${params.toString()}`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Token expirado. Faça login novamente.');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao obter mensagens');
  }
  
  const json = await response.json();
  if (Array.isArray(json)) {
    // Para compatibilidade com versões antigas que retornam array puro
    return { data: json, pagination: { page, limit, total: json.length, totalPages: 1 } };
  }
  return json as PaginatedMessages;
}