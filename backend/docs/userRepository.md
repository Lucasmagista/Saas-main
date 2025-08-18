# 👤 userRepository.cjs

> Repositório responsável por operações CRUD na tabela `users` do Supabase.

---

## 🔑 Métodos Disponíveis
| Método                        | Descrição                                      |
|-------------------------------|------------------------------------------------|
| `listAll()`                   | Lista todos os usuários cadastrados             |
| `update(id, updatedFields)`   | Atualiza os campos de um usuário pelo ID        |
| `remove(id)`                  | Remove um usuário pelo ID                      |

## 💻 Exemplo de Uso
```js
const userRepo = require('./userRepository.cjs');
const users = await userRepo.listAll();
await userRepo.update('uuid', { name: 'Novo Nome' });
await userRepo.remove('uuid');
```

## 🛠️ Recomendações
- Adicione validação de dados antes de atualizar ou remover.
- Implemente métodos para buscar usuário por ID ou e-mail.
- Adicione paginação para grandes volumes de dados.
- Implemente logs de auditoria para alterações sensíveis.

## 🗄️ Estrutura sugerida da tabela `users`
```sql
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  password text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active boolean not null default true
);
create index if not exists idx_users_email on users(email);
```
| Campo      | Tipo    | Descrição                        |
|------------|---------|----------------------------------|
| id         | uuid    | Identificador único do usuário    |
| email      | text    | E-mail do usuário (único)         |
| name       | text    | Nome do usuário                   |
| password   | text    | Senha (hash)                      |
| created_at | timestamptz | Data de criação                |
| updated_at | timestamptz | Data da última atualização     |
| is_active  | boolean | Usuário ativo ou não              |

---

> Consulte também: [Endpoints](endpoints.md) | [Changelog](../Changelog.md)
