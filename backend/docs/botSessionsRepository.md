# 🗃️ botSessionsRepository.cjs

> Repositório responsável por persistir, atualizar e consultar sessões de bots no Supabase.

---

## 🔑 Métodos Disponíveis
| Método                  | Descrição                                      |
|-------------------------|------------------------------------------------|
| `insert(session)`       | Insere uma nova sessão                         |
| `update(sessionId, up)` | Atualiza campos de uma sessão existente         |
| `getById(sessionId)`    | Busca uma sessão pelo ID                       |
| `getAll()`              | Lista todas as sessões                         |

## 💻 Exemplo de Uso
```js
const repo = require('./botSessionsRepository.cjs');
await repo.insert({ session_id: 'bot1', status: 'active', qr_data: '...' });
const sess = await repo.getById('bot1');
await repo.update('bot1', { status: 'inactive' });
```

## 🛠️ Melhorias Sugeridas
- Adicionar validação de dados.
- Implementar deleção de sessões.
- Buscar sessões por status.
- Adicionar paginação para grandes volumes.
- Implementar logs de auditoria.

---

> Consulte também: [Persistência de Sessões](bot_sessions.md) | [Migrações](migracoes.md)
