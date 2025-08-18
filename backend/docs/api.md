# 📚 Documentação da API

> Esta documentação cobre autenticação, autorização, upload de arquivos e exemplos de uso das rotas principais do backend.

---

## 🔐 Autenticação
- Todas as rotas protegidas exigem JWT no header `Authorization: Bearer <token>`.
- Tokens são gerados via `/api/auth/login` e renovados automaticamente pelo sistema de refresh tokens.

## 🔒 Autorização por Role
- Use o middleware `authorizeRole` para restringir acesso por perfil.
- Exemplo:
```js
const authorizeRole = require('../middleware/authorizeRole.cjs');
app.use('/api/admin', authenticateJWT, authorizeRole(['admin']));
```

## 📤 Upload de Arquivos
- `POST /api/files/upload` — Upload de arquivo simples
- `POST /api/files/upload-to-bucket` — Upload para bucket específico

## 🛡️ Rotas Protegidas
- Todas as rotas principais exigem JWT.
- Exemplo de requisição:
```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

## 📦 Padrão de Resposta
Todas as respostas seguem o padrão:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```
Em caso de erro:
```json
{
  "success": false,
  "error": "Mensagem detalhada do erro"
}
```

## 🧪 Exemplos de uso
Veja exemplos completos de endpoints e respostas em [docs/endpoints.md](endpoints.md).

---

> Consulte também: [Changelog](../Changelog.md) | [Guia de Contribuição](../CONTRIBUTING.md)
