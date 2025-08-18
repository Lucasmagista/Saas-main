# 🤖 Persistência de Sessões de Bots

> Documentação detalhada sobre como o sistema salva, recupera e gerencia sessões de bots de forma resiliente e escalável.

---

## 📋 Visão Geral
A persistência de sessões garante que informações críticas (QR Code, status, última mensagem, etc.) não sejam perdidas em caso de reinício do serviço. Todas as sessões são salvas e atualizadas no Supabase, na tabela `bot_sessions`.

## 🗄️ Estrutura da Tabela `bot_sessions`
| Campo         | Tipo         | Descrição                                 |
|--------------|--------------|-------------------------------------------|
| session_id   | text (PK)    | Identificador único da sessão/bot         |
| created_at   | timestamptz  | Data de criação da sessão                 |
| last_message | text         | Última mensagem recebida/enviada          |
| status       | text         | Status da sessão (`active`, `inactive`)   |
| qr_data      | text         | Último QR Code gerado                     |
| updated_at   | timestamptz  | Última atualização                        |

## 🔄 Fluxo de Persistência
1. Ao iniciar uma sessão, o sistema busca no banco se já existe uma sessão persistida.
2. Sempre que um QR Code é gerado ou uma mensagem é recebida, a sessão é atualizada no banco.
3. Ao encerrar uma sessão, o status é atualizado para `inactive` e o QR Code é removido.

## 💻 Exemplo de Uso
```js
const botManager = require('../services/botManager.cjs');
await botManager.startSession({ session_id: 'bot1' });
```

## 📂 Arquivos Relacionados
- `backend/services/botManager.cjs`: Gerenciamento e persistência das sessões.
- `backend/repositories/botSessionsRepository.cjs`: CRUD de sessões no Supabase.
- `backend/migrations/create_bot_sessions.sql`: Script SQL para criação da tabela.

## 🛠️ Como Executar a Migração
1. Acesse o painel do Supabase > SQL Editor.
2. Copie o conteúdo de `backend/migrations/create_bot_sessions.sql`.
3. Cole e execute no editor do Supabase.

## 🔎 Recomendações e Observações
- O sistema suporta múltiplas sessões e pode ser expandido para outros tipos de bots.
- O repositório pode ser adaptado para outros bancos suportados pelo Supabase.
- Implemente logs e auditoria para rastreabilidade.

---

> Consulte também: [Repositório de Sessões](botSessionsRepository.md) | [Migrações](migracoes.md)
