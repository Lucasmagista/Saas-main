// Tipos para Socket.IO client
export interface SocketIOClient {
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string) => void;
  disconnect: () => void;
  emit: (event: string, ...args: unknown[]) => void;
  id: string;
}

export interface SocketIOOptions {
  auth?: { token: string };
  transports?: string[];
  timeout?: number;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  forceNew?: boolean;
}

export type SocketIOStatic = (url: string, options?: SocketIOOptions) => SocketIOClient;

// Extende a interface Window para incluir socket.io
declare global {
  interface Window {
    io?: SocketIOStatic;
  }
}
