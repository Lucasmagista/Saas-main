# Sistema de Refresh Tokens - SaasPro

## 📋 Visão Geral

Sistema completo de autenticação JWT com refresh tokens implementado para o SaasPro. Oferece renovação automática de tokens, logout seguro e suporte a múltiplos dispositivos.

## ⚙️ Configuração

### Backend (.env)
```env
# JWT - Configurações atualizadas
JWT_SECRET=a06b6952e5ff6f28aec780aa96afdc0fbd50c00d3534a29a9d25456b3397d1ad70fdf30d607882ff524326836a30b9cea17cc6828373c4e8cbd1acf8ede6b4de
JWT_EXPIRES_IN=1d           # Access token expira em 1 dia
REFRESH_TOKEN_EXPIRES_IN=30d # Refresh token expira em 30 dias
```

### Frontend
```bash
# Instalar dependências se necessário
npm install axios  # Para requisições HTTP
```

## 🔧 Como Funciona

### 1. **Access Token (1 dia)**
- Usado em todas as requisições autenticadas
- Expira em 1 dia para maior segurança
- Renovado automaticamente quando expira

### 2. **Refresh Token (30 dias)**
- Usado apenas para renovar access tokens
- Expira em 30 dias
- Quando expira, usuário precisa fazer login novamente

### 3. **Fluxo de Renovação**
```
1. Requisição → Access token expirado
2. Sistema detecta automaticamente
3. Usa refresh token para gerar novo access token
4. Repete requisição original com novo token
5. Usuário não percebe nada!
```

## 🚀 Uso no Frontend

### 1. Configurar AuthProvider no App.jsx
```jsx
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      {/* Sua aplicação */}
    </AuthProvider>
  );
}
```

### 2. Usar em componentes
```jsx
import { useAuth } from './hooks/useAuth';

function MeuComponente() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login('email@teste.com', 'senha123');
      console.log('Login sucesso!');
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bem-vindo, {user.email}!</p>
          <button onClick={logout}>Sair</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Entrar</button>
      )}
    </div>
  );
}
```

### 3. Fazer requisições autenticadas
```jsx
import { useAuthRequest } from './hooks/useAuth';

function MeuComponente() {
  const { makeRequest } = useAuthRequest();
  
  const buscarDados = async () => {
    try {
      const response = await makeRequest('/api/dados');
      console.log(response.data);
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };
}
```

### 4. Proteger rotas
```jsx
import { ProtectedRoute } from './hooks/useAuth';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

## 📡 Endpoints da API

### POST /api/auth/login
```json
// Request
{
  "email": "usuario@teste.com",
  "password": "senha123"
}

// Response
{
  "success": true,
  "message": "Login realizado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "1d",
  "user": {
    "id": "uuid",
    "email": "usuario@teste.com",
    "role": "user"
  }
}
```

### POST /api/auth/register
```json
// Request
{
  "email": "novo@teste.com",
  "password": "senha123"
}

// Response (similar ao login)
```

### POST /api/auth/refresh
```json
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Response
{
  "success": true,
  "message": "Tokens renovados com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "1d",
  "user": { ... }
}
```

### POST /api/auth/logout
```json
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Response
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### POST /api/auth/logout-all
```json
// Headers: Authorization: Bearer <access_token>

// Response
{
  "success": true,
  "message": "Logout realizado em 3 dispositivo(s)"
}
```

## 🛡️ Segurança

### Recursos de Segurança
- ✅ JWT Secret de 128 caracteres (ultra seguro)
- ✅ Access tokens de curta duração (1 dia)
- ✅ Refresh tokens de longa duração (30 dias)
- ✅ Revogação de tokens por dispositivo
- ✅ Limpeza automática de tokens expirados
- ✅ Detecção automática de tokens inválidos

### Boas Práticas Implementadas
- ✅ Tokens armazenados no localStorage (pode migrar para httpOnly cookies)
- ✅ Renovação preventiva antes da expiração
- ✅ Logout automático em caso de erro de autenticação
- ✅ Interceptors HTTP para renovação transparente
- ✅ Tratamento de erros específicos por tipo

## 🔍 Monitoramento

### Para Admins
```jsx
// Endpoint: GET /api/auth/token-stats
{
  "success": true,
  "data": {
    "activeRefreshTokens": 15,
    "tokensPerUser": {
      "user1-uuid": 2,
      "user2-uuid": 1,
      "user3-uuid": 3
    }
  }
}
```

### Logs Automáticos
- 🧹 Limpeza de tokens expirados a cada hora
- 🔄 Log de renovações automáticas
- ⚠️ Alertas de tentativas de uso de tokens inválidos

## 🚨 Tratamento de Erros

### Códigos de Erro
- `NO_TOKEN`: Token não fornecido
- `INVALID_FORMAT`: Formato inválido (não Bearer)
- `TOKEN_EXPIRED`: Access token expirado (renova automaticamente)
- `INVALID_TOKEN`: Token inválido ou corrompido

### Fluxo de Erro
1. **Token expirado**: Renovação automática
2. **Refresh token expirado**: Logout automático + redirect login
3. **Token inválido**: Logout automático
4. **Rede indisponível**: Retry com backoff

## 📱 Suporte Multi-Device

### Funcionalidades
- ✅ Login simultâneo em múltiplos dispositivos
- ✅ Logout individual por dispositivo
- ✅ Logout geral (todos os dispositivos)
- ✅ Monitoramento de sessões ativas

### Exemplo de Uso
```jsx
const { logoutAllDevices } = useAuth();

// Logout de todos os dispositivos
await logoutAllDevices();
```

## 🔧 Manutenção

### Limpeza de Tokens
```javascript
// Automática a cada hora
// Manual via código:
const cleaned = jwtService.cleanExpiredTokens();
console.log(`${cleaned} tokens expirados removidos`);
```

### Estatísticas
```javascript
const stats = jwtService.getTokenStats();
console.log('Tokens ativos:', stats.activeRefreshTokens);
console.log('Usuários conectados:', Object.keys(stats.tokensPerUser).length);
```

## 🎯 Próximos Passos

### Melhorias Possíveis
1. **HttpOnly Cookies**: Migrar de localStorage para cookies mais seguros
2. **Redis**: Usar Redis para armazenar refresh tokens em produção
3. **Rate Limiting**: Limitar tentativas de renovação por IP
4. **Auditoria**: Log detalhado de todas as ações de autenticação
5. **2FA**: Implementar autenticação de dois fatores
6. **Notificações**: Avisar sobre logins em novos dispositivos

### Em Produção
```env
# Usar HTTPS obrigatório
CORS_ORIGIN=https://seudominio.com
# Usar Redis para tokens
REDIS_URL=redis://seu-redis-url
# Configurar rate limiting mais restritivo
RATE_LIMIT=50
```

## 📚 Recursos Adicionais

- [JWT.io](https://jwt.io/) - Debug de tokens JWT
- [Auth0 Blog](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/) - Boas práticas
- [OWASP](https://owasp.org/www-project-cheat-sheets/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html) - Segurança JWT

---

**Sistema implementado com sucesso! 🎉**

O sistema de refresh tokens está funcionando com:
- ✅ Renovação automática transparente
- ✅ Logout seguro em múltiplos dispositivos  
- ✅ Monitoramento e estatísticas
- ✅ Tratamento robusto de erros
- ✅ Interface user-friendly
