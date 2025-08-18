// Helper para chamadas à API REST
function getToken() {
  // Tenta primeiro 'accessToken', depois 'jwt' para compatibilidade
  return localStorage.getItem('accessToken') || localStorage.getItem('jwt') || '';
}

const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:3002';

export const api = {
  get: (url: string) => fetch(`${API_BASE}${url}`, {
    credentials: 'include',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  }).then(r => {
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    return r.json();
  }),
  post: (url: string, body: unknown) => fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(body),
    credentials: 'include'
  }).then(r => {
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    return r.json();
  }),
  put: (url: string, body: unknown) => fetch(`${API_BASE}${url}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(body),
    credentials: 'include'
  }).then(r => {
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    return r.json();
  }),
  delete: (url: string) => fetch(`${API_BASE}${url}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    credentials: 'include'
  }).then(r => {
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    return r.json();
  }),
};
