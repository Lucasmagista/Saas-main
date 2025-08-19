# 📚 Documentação da API

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints](#endpoints)
   - [Autenticação](#autenticação-1)
   - [Usuários](#usuários)
   - [Bots](#bots)
   - [Webhooks](#webhooks)
   - [Organizações](#organizações)
4. [Códigos de Erro](#códigos-de-erro)
5. [Exemplos](#exemplos)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks-1)

---

## 🌐 Visão Geral

A API da plataforma SaaS é uma API RESTful que permite gerenciar bots do WhatsApp, usuários, organizações e webhooks.

**Base URL:** `https://api.saas-platform.com/v1`

**Versão:** 1.0.0

**Formato de Resposta:** JSON

---

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Todos os endpoints protegidos requerem um token válido no header `Authorization`.

### Headers Obrigatórios

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Tipos de Token

- **Access Token**: Token de curta duração (15 minutos) para acesso à API
- **Refresh Token**: Token de longa duração (7 dias) para renovar access tokens

---

## 🚀 Endpoints

### Autenticação

#### POST /auth/login

Realiza login do usuário.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "1",
    "email": "user@example.com",
    "full_name": "João Silva",
    "role": "admin"
  }
}
```

#### POST /auth/register

Registra um novo usuário.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "Novo Usuário"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Conta criada com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "2",
    "email": "newuser@example.com",
    "full_name": "Novo Usuário",
    "role": "user"
  }
}
```

#### POST /auth/refresh

Renova o access token usando refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token renovado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

#### POST /auth/logout

Realiza logout do usuário.

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

#### POST /auth/forgot-password

Solicita recuperação de senha.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Se o email estiver cadastrado, você receberá instruções de recuperação"
}
```

#### POST /auth/reset-password

Redefine a senha usando token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Senha redefinida com sucesso"
}
```

#### GET /auth/me

Obtém dados do usuário autenticado.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "user@example.com",
    "full_name": "João Silva",
    "role": "admin",
    "is_active": true
  }
}
```

#### POST /auth/change-password

Altera a senha do usuário.

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

### Usuários

#### GET /users

Lista todos os usuários (apenas admin).

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `search` (string): Termo de busca
- `role` (string): Filtrar por role

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "email": "user@example.com",
      "full_name": "João Silva",
      "role": "admin",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### GET /users/:id

Obtém dados de um usuário específico.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "user@example.com",
    "full_name": "João Silva",
    "role": "admin",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /users/:id

Atualiza dados de um usuário.

**Request Body:**
```json
{
  "full_name": "João Silva Atualizado",
  "role": "user",
  "is_active": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "full_name": "João Silva Atualizado",
    "role": "user",
    "is_active": true
  }
}
```

#### DELETE /users/:id

Remove um usuário.

**Response (200):**
```json
{
  "success": true,
  "message": "Usuário removido com sucesso"
}
```

### Bots

#### GET /bots

Lista todos os bots do usuário.

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `status` (string): Filtrar por status (active, inactive)
- `search` (string): Termo de busca

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Bot Suporte",
      "session_name": "bot_suporte",
      "qrcode": null,
      "is_active": false,
      "description": "Bot para atendimento ao cliente",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### GET /bots/:id

Obtém dados de um bot específico.

**Response (200):**
```json
{
  "success": true,
  "bot": {
    "id": "1",
    "name": "Bot Suporte",
    "session_name": "bot_suporte",
    "qrcode": null,
    "is_active": false,
    "description": "Bot para atendimento ao cliente",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /bots

Cria um novo bot.

**Request Body:**
```json
{
  "name": "Novo Bot",
  "description": "Descrição do bot",
  "type": "whatsapp"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Bot criado com sucesso",
  "bot": {
    "id": "2",
    "name": "Novo Bot",
    "session_name": "novo_bot",
    "qrcode": null,
    "is_active": false,
    "description": "Descrição do bot",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /bots/:id

Atualiza dados de um bot.

**Request Body:**
```json
{
  "name": "Bot Atualizado",
  "description": "Nova descrição"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bot atualizado com sucesso",
  "bot": {
    "id": "1",
    "name": "Bot Atualizado",
    "session_name": "bot_suporte",
    "qrcode": null,
    "is_active": false,
    "description": "Nova descrição",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### DELETE /bots/:id

Remove um bot.

**Response (200):**
```json
{
  "success": true,
  "message": "Bot removido com sucesso"
}
```

#### POST /bots/:id/start

Inicia uma sessão do bot.

**Response (200):**
```json
{
  "success": true,
  "message": "Sessão iniciada",
  "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### POST /bots/:id/stop

Para uma sessão do bot.

**Response (200):**
```json
{
  "success": true,
  "message": "Sessão encerrada"
}
```

#### GET /bots/:id/status

Obtém o status atual do bot.

**Response (200):**
```json
{
  "success": true,
  "active": true,
  "lastActivity": "2024-01-01T00:00:00Z"
}
```

#### GET /bots/:id/qrcode

Obtém o QR code atual do bot.

**Response (200):**
```json
{
  "success": true,
  "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### GET /bots/:id/logs

Obtém logs do bot.

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 100)
- `direction` (string): Filtrar por direção (received, sent)
- `type` (string): Filtrar por tipo (text, image, audio, etc.)

**Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "id": "1",
      "bot_id": "1",
      "timestamp": "2024-01-01T00:00:00Z",
      "direction": "received",
      "message": "Olá!",
      "type": "text",
      "from": "5511999999999",
      "to": "5511888888888"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 1,
    "pages": 1
  }
}
```

#### POST /bots/import/local

Importa bot de arquivos locais.

**Request Body (multipart/form-data):**
```
files: [arquivo1.js, arquivo2.json, ...]
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bot importado com sucesso",
  "bot": {
    "id": "3",
    "name": "Bot Importado",
    "session_name": "bot_importado",
    "files": ["arquivo1.js", "arquivo2.json"]
  }
}
```

#### POST /bots/import/remote

Importa bot de repositório remoto.

**Request Body:**
```json
{
  "url": "https://github.com/user/repo",
  "type": "github"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bot importado com sucesso",
  "bot": {
    "id": "4",
    "name": "Bot Remoto",
    "session_name": "bot_remoto",
    "repository": "https://github.com/user/repo"
  }
}
```

### Webhooks

#### GET /webhooks

Lista webhooks configurados.

**Response (200):**
```json
{
  "success": true,
  "webhooks": [
    {
      "id": "1",
      "name": "Webhook Principal",
      "url": "https://api.example.com/webhook",
      "events": ["message_received", "message_sent"],
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /webhooks

Cria um novo webhook.

**Request Body:**
```json
{
  "name": "Novo Webhook",
  "url": "https://api.example.com/webhook",
  "events": ["message_received"],
  "secret": "webhook_secret"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Webhook criado com sucesso",
  "webhook": {
    "id": "2",
    "name": "Novo Webhook",
    "url": "https://api.example.com/webhook",
    "events": ["message_received"],
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /webhooks/:id

Atualiza um webhook.

**Request Body:**
```json
{
  "name": "Webhook Atualizado",
  "url": "https://api.example.com/webhook/v2",
  "events": ["message_received", "message_sent"],
  "is_active": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook atualizado com sucesso"
}
```

#### DELETE /webhooks/:id

Remove um webhook.

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook removido com sucesso"
}
```

#### POST /webhooks/:id/test

Testa um webhook.

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook testado com sucesso",
  "response": {
    "status": 200,
    "body": "OK"
  }
}
```

### Organizações

#### GET /organizations

Lista organizações do usuário.

**Response (200):**
```json
{
  "success": true,
  "organizations": [
    {
      "id": "1",
      "name": "Empresa ABC",
      "domain": "empresaabc.com",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /organizations/:id

Obtém dados de uma organização.

**Response (200):**
```json
{
  "success": true,
  "organization": {
    "id": "1",
    "name": "Empresa ABC",
    "domain": "empresaabc.com",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /organizations

Cria uma nova organização.

**Request Body:**
```json
{
  "name": "Nova Empresa",
  "domain": "novaempresa.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Organização criada com sucesso",
  "organization": {
    "id": "2",
    "name": "Nova Empresa",
    "domain": "novaempresa.com",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## ❌ Códigos de Erro

### Códigos HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 409 | Conflito |
| 422 | Dados inválidos |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |

### Códigos de Erro Específicos

| Código | Descrição |
|--------|-----------|
| `INVALID_CREDENTIALS` | Credenciais inválidas |
| `ACCOUNT_DISABLED` | Conta desativada |
| `EMAIL_EXISTS` | Email já cadastrado |
| `INVALID_REFRESH_TOKEN` | Refresh token inválido |
| `NOT_AUTHENTICATED` | Não autenticado |
| `USER_NOT_FOUND` | Usuário não encontrado |
| `INVALID_PASSWORD` | Senha incorreta |
| `INVALID_TOKEN` | Token inválido |
| `INTERNAL_ERROR` | Erro interno |

### Exemplo de Resposta de Erro

```json
{
  "success": false,
  "error": "Credenciais inválidas",
  "code": "INVALID_CREDENTIALS",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## 💡 Exemplos

### Exemplo de Login

```bash
curl -X POST https://api.saas-platform.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Exemplo de Listagem de Bots

```bash
curl -X GET https://api.saas-platform.com/v1/bots \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Exemplo de Criação de Bot

```bash
curl -X POST https://api.saas-platform.com/v1/bots \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meu Bot",
    "description": "Bot para atendimento",
    "type": "whatsapp"
  }'
```

### Exemplo de Início de Sessão

```bash
curl -X POST https://api.saas-platform.com/v1/bots/1/start \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## ⚡ Rate Limiting

A API implementa rate limiting para proteger contra abuso:

- **Limite Geral**: 1000 requisições por hora por IP
- **Autenticação**: 5 tentativas por minuto por IP
- **Bots**: 100 requisições por minuto por usuário

### Headers de Rate Limiting

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Resposta quando excedido

```json
{
  "success": false,
  "error": "Rate limit excedido",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 3600
}
```

---

## 🔗 Webhooks

### Eventos Disponíveis

- `message_received`: Mensagem recebida
- `message_sent`: Mensagem enviada
- `session_started`: Sessão iniciada
- `session_ended`: Sessão encerrada
- `qrcode_generated`: QR code gerado

### Formato do Payload

```json
{
  "event": "message_received",
  "timestamp": "2024-01-01T00:00:00Z",
  "bot_id": "1",
  "data": {
    "from": "5511999999999",
    "to": "5511888888888",
    "message": "Olá!",
    "type": "text",
    "media_url": null
  }
}
```

### Assinatura de Segurança

Webhooks incluem uma assinatura HMAC-SHA256 para verificação:

```http
X-Webhook-Signature: sha256=abc123...
```

### Verificação da Assinatura

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha256=', '')),
    Buffer.from(expectedSignature)
  );
}
```

### Retry Policy

Webhooks são reenviados automaticamente em caso de falha:

- **Tentativas**: 3 tentativas
- **Backoff**: Exponencial (1s, 2s, 4s)
- **Timeout**: 10 segundos por tentativa

---

## 📞 Suporte

Para suporte técnico:

- **Email**: support@saas-platform.com
- **Documentação**: https://docs.saas-platform.com
- **Status**: https://status.saas-platform.com
- **Discord**: https://discord.gg/saas-platform

---

## 📄 Licença

Esta documentação está licenciada sob a licença MIT.