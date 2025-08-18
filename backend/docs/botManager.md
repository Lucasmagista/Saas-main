# 🧠 botManager.cjs

> Módulo responsável por gerenciar sessões de bots, integrando com WPPConnect e persistindo dados críticos no Supabase.

---

## ⚙️ Principais Funções
| Função                   | Descrição                                                        |
|--------------------------|------------------------------------------------------------------|
| `startSession(bot)`      | Inicia ou recupera uma sessão, persistindo QR Code e status       |
| `stopSession(botId)`     | Encerra a sessão, atualizando status no banco                    |
| `getQrcode(botId)`       | Retorna o QR Code atual da sessão                                |
| `getPersistedSession(id)`| Busca a sessão persistida no banco                               |

## 🔄 Fluxo de Funcionamento
1. Ao iniciar, verifica se há sessão ativa em memória.
2. Se não houver, tenta recuperar do banco.
3. Ao receber QR Code ou mensagem, atualiza o banco.
4. Ao encerrar, marca a sessão como inativa.

## 💻 Exemplo de Uso
```js
const botManager = require('./botManager.cjs');
await botManager.startSession({ session_id: 'bot1' });
```

## 📝 Recomendações
- Adicione logs estruturados para facilitar auditoria.
- Implemente limpeza automática de sessões inativas.
- Documente e teste todos os fluxos.
- Utilize tipagem e validação de dados para maior robustez.

---

> Consulte também: [Persistência de Sessões](bot_sessions.md) | [Repositório de Sessões](botSessionsRepository.md)
