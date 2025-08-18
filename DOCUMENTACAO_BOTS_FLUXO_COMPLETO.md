# Funcionamento do Sistema de Bots: Adição, Inicialização e Conexão

## 1. Visão Geral
Este documento detalha o fluxo completo do sistema de bots, desde a adição de um novo bot até o processo de inicialização, conexão via QR code e gerenciamento de sessões, logs e status. A análise é baseada no código-fonte do backend e descreve o que acontece em cada etapa, incluindo persistência de dados e integração com o WhatsApp via WPPConnect.

---

## 2. Adição de um Bot

### Como funciona
- O bot pode ser adicionado de três formas:
  - Upload de arquivos locais
  - Importação de repositório remoto (ex: GitHub)
  - Upload de pasta/arquivo compactado
- Ao adicionar, um registro é criado na tabela `bots` do Supabase, contendo:
  - `name`, `type`, `description`, `session_name`, `is_active` (inicialmente `false`), entre outros.
- O bot ainda não está ativo nem conectado após a adição.

---

## 3. Inicialização do Bot (Start)

### Fluxo ao clicar em "Iniciar"
1. O frontend faz uma requisição `POST /api/bots/:id/start`.
2. O backend executa o método `startSession` do `botManager.cjs` para o bot correspondente.
3. O sistema verifica se já existe uma sessão ativa em memória:
   - Se sim, retorna o QR code já existente (se houver).
   - Se não, cria uma nova sessão WPPConnect (`wppconnect.create`).
4. Eventos importantes durante a inicialização:
   - **QR Code:**
     - Gerado pelo WPPConnect.
     - Salvo em memória e persistido no Supabase (`bot_sessions` e campo `qrcode` da tabela `bots`).
     - Retornado para o frontend para exibição.
   - **Logs:**
     - Toda mensagem recebida/enviada é registrada em memória e persistida nas tabelas `bot_logs` e `multisession_logs`.
   - **Status:**
     - O status da sessão é atualizado para "active" no banco.
   - **Auditoria:**
     - Um log de auditoria é registrado.

---

## 4. Conexão ao Bot

- **QR Code:**
  - Assim que o bot é iniciado, o QR code é retornado e pode ser exibido na interface para escaneamento via WhatsApp.
  - O QR code também pode ser consultado depois via `GET /api/bots/:id/qrcode`.
- **Persistência:**
  - O QR code e o status ficam salvos no banco e podem ser recuperados mesmo após reinício do sistema.
- **Status:**
  - O status da sessão pode ser consultado via `GET /api/bots/:id/status`.
- **Logs:**
  - Mensagens trocadas pelo bot podem ser consultadas via `GET /api/bots/:id/logs`.

---

## 5. Endpoints e Funções Relevantes

- **Iniciar sessão:** `POST /api/bots/:id/start`
- **Parar sessão:** `POST /api/bots/:id/stop`
- **Status:** `GET /api/bots/:id/status`
- **QR code:** `GET /api/bots/:id/qrcode`
- **Logs:** `GET /api/bots/:id/logs`

---

## 6. Persistência e Estrutura de Dados

- **Tabela `bots`:**
  - Armazena dados principais do bot, status e QR code atual.
- **Tabela `bot_sessions`:**
  - Armazena sessões, QR codes, status e última mensagem.
- **Tabela `bot_logs` e `multisession_logs`:**
  - Armazenam logs de mensagens e eventos do bot.
- **Tabela `qr_codes`:**
  - Armazena todos os QR codes gerados para autenticação.

---

## 7. Resumo do Ciclo Completo

1. **Adiciona bot** → Registro no banco.
2. **Inicia bot** → Cria sessão WPPConnect, gera QR code, salva status/logs.
3. **Exibe QR code** → Usuário escaneia para conectar WhatsApp.
4. **Sessão ativa** → Mensagens e eventos são logados e persistidos.
5. **Consulta/controle** → Status, QR code e logs disponíveis via API.

---

## 8. Observações Finais


---

## 9. Estrutura das Tabelas (SQL)

### bots
```sql
create table if not exists bots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  description text,
  session_name text,
  is_active boolean default false,
  qrcode text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### bot_sessions
```sql
create table if not exists bot_sessions (
  session_id text primary key,
  created_at timestamptz not null default now(),
  last_message text,
  status text not null default 'inactive',
  qr_data text,
  updated_at timestamptz not null default now(),
  bot_id uuid references bots(id)
);
create index if not exists idx_bot_sessions_status on bot_sessions(status);
```

### bot_logs
```sql
create table if not exists bot_logs (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid references bots(id),
  direction text,
  message text,
  type text,
  created_at timestamptz default now()
);
```

### qr_codes
```sql
create table if not exists qr_codes (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid references bots(id),
  qr_code text,
  status text,
  created_at timestamptz default now()
);
```

### multisession_logs
```sql
create table if not exists multisession_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  direction text,
  message text,
  type text,
  created_at timestamptz default now()
);
```

---

## 10. Exemplos de Payloads e Endpoints

### Criação de bot
**POST /api/bots**
```json
{
  "name": "Meu Bot",
  "type": "whatsapp",
  "description": "Bot de testes"
}
```

### Resposta ao iniciar bot
**POST /api/bots/:id/start**
```json
{
  "message": "Sessão iniciada",
  "qrcode": "data:image/png;base64,..."
}
```

### Consulta de QR code
**GET /api/bots/:id/qrcode**
```json
{
  "qrcode": "data:image/png;base64,..."
}
```

### Consulta de status
**GET /api/bots/:id/status**
```json
{
  "active": true
}
```

### Consulta de logs
**GET /api/bots/:id/logs**
```json
{
  "logs": [
    {
      "timestamp": "2025-08-12T12:00:00Z",
      "direction": "sent",
      "message": "Olá!",
      "type": "chat"
    }
  ]
}
```

---

## 11. Fluxo Técnico Completo

1. **Adição**: POST `/api/bots` ou importação → registro em `bots`.
2. **Inicialização**: POST `/api/bots/:id/start` → cria sessão, gera QR, salva em memória e banco.
3. **Conexão**: QR exibido para usuário conectar WhatsApp.
4. **Persistência**: QR, status, logs e eventos salvos em várias tabelas.
5. **Consulta**: Status, QR e logs disponíveis via API.
6. **Parada**: POST `/api/bots/:id/stop` → encerra sessão, atualiza status.
7. **Remoção**: DELETE `/api/bots/:id` → remove bot e encerra sessão se ativa.

---

## 12. Logs, Auditoria e Monitoramento

- Toda mensagem recebida/enviada é logada em `bot_logs` e `multisession_logs`.
- QR codes são salvos em `qr_codes` e campo `qrcode` de `bots`.
- Auditoria de criação, atualização e remoção de bots via função `logAudit`.
- Recomenda-se dashboards para:
  - Mensagens por período
  - Status dos QR codes
  - Logs de erro
  - Busca por número

---

## 13. Segurança e Autenticação

- Todos os endpoints protegidos por JWT
- Middleware de autenticação no backend
- Recomenda-se uso de HTTPS

---

## 14. Observações Técnicas e Recomendações

- O sistema suporta múltiplos bots e sessões simultâneas
- Toda persistência é feita no Supabase
- O backend orquestra toda a lógica, persistência e integração com o WhatsApp
- Logs e QR codes são resilientes a reinício do serviço
- O código é modular e pode ser expandido para outros tipos de bots

---

## 15. Referências Cruzadas

- [backend/docs/bot_sessions.md](backend/docs/bot_sessions.md)
- [backend/docs/botSessionsRepository.md](backend/docs/botSessionsRepository.md)
- [backend/docs/whatsapp_logs.md](backend/docs/whatsapp_logs.md)
- [backend/docs/migracoes.md](backend/docs/migracoes.md)

---

## 16. Última atualização
12/08/2025

---

**Dúvidas, exemplos de integração frontend ou fluxogramas? Solicite!**

---

## Estrutura de Pastas e Arquivos Relevantes
- `backend/routes/bots.cjs`: Rotas REST para CRUD, start/stop, logs, QR code, importação de bots.
- `backend/services/botManager.cjs`: Gerencia sessões, integra com WPPConnect, controla QR, logs, status.
- `backend/repositories/botsRepository.cjs`: CRUD na tabela `bots`.
- `backend/repositories/botSessionsRepository.cjs`: CRUD na tabela `bot_sessions`.
- `backend/repositories/botLogsRepository.cjs`: Logs de mensagens dos bots.
- `backend/repositories/multisessionLogsRepository.cjs`: Logs de eventos de multi-sessão.
- `backend/repositories/qrCodesRepository.cjs`: Persistência de QR codes.
- `backend/services/wppconnect.cjs`: Integração com WhatsApp via WPPConnect.
- `backend/docs/bot_sessions.md`, `botSessionsRepository.md`, `whatsapp_logs.md`: Documentação técnica.
- `backend/migrations/*.sql`: Scripts de criação e alteração de tabelas.

---

## Fluxo Completo do Bot
### Adição
- POST `/api/bots` ou `/api/bots/import/local|remote|folder`
- Cria registro em `bots` (e possivelmente arquivos no servidor)

### Inicialização (Start)
- POST `/api/bots/:id/start`
- Busca bot, chama `startSession` (gera sessão WPPConnect)
- Se já existe sessão ativa, retorna QR code salvo
- Se não, cria nova sessão, gera QR code, salva em memória e banco
- Eventos de QR code e mensagens são persistidos em `bot_sessions`, `bots`, `qr_codes`, `bot_logs`, `multisession_logs`
- Retorna QR code para o frontend

### Conexão
- O QR code é exibido para o usuário conectar o WhatsApp
- O QR code pode ser consultado a qualquer momento via `/api/bots/:id/qrcode`
- O status da sessão pode ser consultado via `/api/bots/:id/status`
- Logs podem ser consultados via `/api/bots/:id/logs`

### Parada e Remoção
- POST `/api/bots/:id/stop` encerra a sessão, atualiza status, remove QR code
- DELETE `/api/bots/:id` remove o bot e encerra a sessão se ativa

---

## Endpoints REST (Exemplos)
- `POST /api/bots` - Cria bot
- `POST /api/bots/:id/start` - Inicia sessão
- `POST /api/bots/:id/stop` - Encerra sessão
- `GET /api/bots/:id/qrcode` - Retorna QR code
- `GET /api/bots/:id/status` - Status da sessão
- `GET /api/bots/:id/logs` - Logs do bot
- `DELETE /api/bots/:id` - Remove bot

### Exemplo de payload de criação de bot
```json
{
  "name": "Meu Bot",
  "type": "whatsapp",
  "description": "Bot de testes"
}
```

### Exemplo de resposta ao iniciar bot
```json
{
  "message": "Sessão iniciada",
  "qrcode": "data:image/png;base64,..."
}
```

---

## Logs, Auditoria e Monitoramento
- Toda mensagem recebida/enviada é logada em `bot_logs` e `multisession_logs`
- QR codes são salvos em `qr_codes` e campo `qrcode` de `bots`
- Auditoria de criação, atualização e remoção de bots via função `logAudit`
- Recomenda-se dashboards para:
  - Mensagens por período
  - Status dos QR codes
  - Logs de erro
  - Busca por número

---

## Segurança e Autenticação
- Todos os endpoints protegidos por JWT
- Middleware de autenticação no backend
- Recomenda-se uso de HTTPS

---

## Observações Técnicas e Recomendações
- O sistema suporta múltiplos bots e sessões simultâneas
- Toda persistência é feita no Supabase
- O backend orquestra toda a lógica, persistência e integração com o WhatsApp
- Logs e QR codes são resilientes a reinício do serviço
- O código é modular e pode ser expandido para outros tipos de bots

---

## Referências Cruzadas
- [backend/docs/bot_sessions.md](backend/docs/bot_sessions.md)
- [backend/docs/botSessionsRepository.md](backend/docs/botSessionsRepository.md)
- [backend/docs/whatsapp_logs.md](backend/docs/whatsapp_logs.md)
- [backend/docs/migracoes.md](backend/docs/migracoes.md)

---

## Última atualização
12/08/2025

---

**Dúvidas, exemplos de integração frontend ou fluxogramas? Solicite!**
