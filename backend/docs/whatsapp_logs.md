# Persistência de Logs e QR Codes do WhatsApp via WPPConnect

Este serviço implementa a integração completa entre o backend Node.js e o Supabase para registro de eventos do WhatsApp, utilizando WPPConnect.

## Tabelas
- **whatsapp_logs**: Armazena todos os eventos de envio, recebimento e falha de mensagens WhatsApp.
- **qr_codes**: Armazena todos os QR Codes gerados para autenticação dos bots.

## Fluxo de Persistência
1. **Mensagens Recebidas/Enviadas**
   - Toda mensagem recebida ou enviada pelo WPPConnect é registrada em `whatsapp_logs`.
   - Campos: `bot_id`, `direction` (`sent`, `received`, `error`), `number`, `message`, `event_type`, `created_at`.
2. **QR Codes**
   - Todo QR Code gerado pelo WPPConnect é salvo em `qr_codes`.
   - Campos: `bot_id`, `qr_code`, `status` (`pending`, `scanned`, `expired`), `created_at`.

## Exemplo de Uso
```js
const wppconnect = require('@wppconnect-team/wppconnect');
const whatsappLogsRepo = require('../repositories/whatsappLogsRepository.cjs');
const qrCodesRepo = require('../repositories/qrCodesRepository.cjs');

// Evento de mensagem recebida
client.onMessage(async (message) => {
  await whatsappLogsRepo.insert({
    bot_id: null,
    direction: 'received',
    number: message.from,
    message: message.body,
    event_type: 'message',
  });
});

// Evento de QR Code gerado
client.on('qr', async (qrCode) => {
  await qrCodesRepo.insert({
    bot_id: null,
    qr_code: qrCode,
    status: 'pending',
  });
});
```


## Auditoria e Consulta
- Para consultar logs por número:
  ```js
  const logs = await whatsappLogsRepo.listByNumber('5511999999999');
  ```
- Para consultar QR Codes por bot:
  ```js
  const qrs = await qrCodesRepo.listByBot(bot_id);
  ```

### Exemplo de consulta SQL
```sql
-- Buscar todos os logs de mensagens recebidas de um número
SELECT * FROM whatsapp_logs WHERE number = '5511999999999' AND direction = 'received' ORDER BY created_at DESC;

-- Buscar QR Codes pendentes
SELECT * FROM qr_codes WHERE status = 'pending' ORDER BY created_at DESC;
```

### Campos das tabelas
#### whatsapp_logs
- `id`: UUID do log
- `bot_id`: UUID do bot (pode ser null)
- `direction`: 'sent', 'received', 'error'
- `number`: número do contato
- `message`: texto da mensagem
- `event_type`: tipo do evento ('message', 'status', 'error', etc)
- `created_at`: data/hora do evento

#### qr_codes
- `id`: UUID do registro
- `bot_id`: UUID do bot (pode ser null)
- `qr_code`: string do QR Code
- `status`: 'pending', 'scanned', 'expired'
- `created_at`: data/hora de geração


### Integração REST (Exemplos de endpoints)
```http
# Listar logs de mensagens por número
GET /api/whatsapp/logs?number=5511999999999

# Listar logs por período
GET /api/whatsapp/logs?from=2025-08-01T00:00:00Z&to=2025-08-01T23:59:59Z

# Listar QR Codes por bot
GET /api/whatsapp/qrcodes?bot_id=xxxx

# Criar novo log (exemplo de POST)
POST /api/whatsapp/logs
Content-Type: application/json
{
  "bot_id": "xxxx",
  "direction": "sent",
  "number": "5511999999999",
  "message": "Olá!",
  "event_type": "message"
}

# Criar novo QR Code
POST /api/whatsapp/qrcodes
Content-Type: application/json
{
  "bot_id": "xxxx",
  "qr_code": "base64string",
  "status": "pending"
}
```

#### Autenticação
Todos os endpoints devem ser protegidos por autenticação JWT. Exemplo de uso:

```http
GET /api/whatsapp/logs?number=5511999999999
Authorization: Bearer <seu_token_jwt>
```
No backend, utilize middleware para validar o token e garantir acesso apenas a usuários autorizados.

### Dashboards e Monitoramento
Sugestões de dashboards para visualização dos dados:
- **Mensagens por período**: Gráfico de barras mostrando quantidade de mensagens enviadas/recebidas por dia.
- **Status dos QR Codes**: Tabela ou gráfico de pizza mostrando QR Codes pendentes, escaneados e expirados.
- **Logs de erro**: Listagem dos eventos com `direction = 'error'` para monitorar falhas.
- **Busca por número**: Campo de busca para consultar histórico completo de um contato.

Ferramentas recomendadas:
- Supabase Dashboard (SQL direto)
- Metabase, Grafana, Retool, Power BI (conectando ao banco via Postgres)
- Dashboards customizados em React/Next.js usando os endpoints REST acima



### Tratamento de Erros
- Todos os inserts são protegidos por try/catch.
- Em caso de erro de conexão ou permissão, o erro é logado e não interrompe o fluxo principal do bot.
- Os endpoints REST devem retornar status HTTP apropriados (200, 201, 400, 401, 500) e mensagens claras para o frontend.

## Observações
- As tabelas são criadas via migration SQL.
- O serviço é retrocompatível, mantendo logs também em `bot_logs`.
- Todos os eventos relevantes do WhatsApp são persistidos para garantir rastreabilidade e auditoria.
- Recomenda-se criar índices nos campos `number` e `created_at` para consultas rápidas.

---
Última atualização: 01/08/2025
