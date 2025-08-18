# 📖 Documentação dos Endpoints

> Referência completa dos principais endpoints da API, exemplos de uso, padrões de resposta, auditoria e limites de requisição.

---

## 🔐 Autenticação
- `POST /api/auth/login` — Login do usuário
- `POST /api/auth/register` — Registro de usuário
- `GET /api/auth/me` — Dados do usuário autenticado

### Exemplo de resposta
```json
{
  "success": true,
  "data": {
    "id": "1",
    "email": "user@email.com",
    "role": "admin",
    "permissions": ["canEditUser", "canViewReports"],
    "profile": { /* ... */ }
  }
}
```

## 👤 Usuários
- `GET /api/users/list` — Listar usuários
- `PUT /api/users/permissions/:id` — Editar permissões
- `POST /api/users/create` — Criar usuário

## 📤 Uploads
- `POST /api/files/upload` — Upload de arquivo
- `POST /api/files/upload-to-bucket` — Upload para bucket específico

## ⚠️ Exemplos de erro
```json
{
  "success": false,
  "error": "Mensagem detalhada do erro"
}
```

## 📦 Padrão de Resposta
Todas as respostas seguem o padrão `{ success, data, error }`.

## 🔒 Observações
- Todas rotas protegidas exigem JWT no header `Authorization`.

## 🕵️ Auditoria
- Todas ações sensíveis (criação, alteração, exclusão, login) são registradas na tabela `audit_logs`.
- Exemplo de registro:
```json
{
  "user_id": "1",
  "action": "login",
  "details": "{\"email\":\"user@email.com\"}",
  "date": "2025-07-30T12:00:00Z",
  "route": "/api/auth/login"
}
```

## 🚦 Rate Limit
- Limite de 100 requisições por IP a cada 15 minutos.
- Resposta ao exceder:
```json
{
  "success": false,
  "error": "Limite de requisições excedido"
}
```

---

> Consulte também: [Documentação da API](api.md) | [Changelog](../Changelog.md)
