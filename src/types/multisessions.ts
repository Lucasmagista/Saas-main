// Types for Multi-Sessions components

export interface SessionData {
  id: string;
  name: string;
  platform: string;
  is_active?: boolean;
  active?: boolean;
  phone_number?: string;
  activeChats?: number;
  totalMessages?: number;
  uptime?: string;
  updated_at?: string;
  qrcode?: string | null;
}

export interface Session {
  id: string;
  name: string;
  platform: string;
  status: 'connected' | 'disconnected' | 'paused' | 'error';
  phoneNumber: string;
  activeChats: number;
  totalMessages: number;
  uptime: string;
  lastActivity: string;
  qrCode?: string | null;
}

export interface PlatformData {
  name: string;
  value: number;
  color: string;
}

export interface ChartDataPoint {
  time: string;
  [key: string]: string | number;
}

export interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}
