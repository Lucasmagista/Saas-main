# 🗄️ Migrações de Banco de Dados

> Scripts e orientações para criação e atualização das principais tabelas do backend.

---

## 📦 Tabela `bot_sessions`
Arquivo: `backend/migrations/create_bot_sessions.sql`
```sql
-- Criação da tabela bot_sessions no Supabase
create table if not exists bot_sessions (
  session_id text primary key,
  created_at timestamptz not null default now(),
  last_message text,
  status text not null default 'inactive',
  qr_data text,
  updated_at timestamptz not null default now()
);
create index if not exists idx_bot_sessions_status on bot_sessions(status);
```

## 🤖 Tabela `multisessions`
Arquivo: `supabase/migrations/20250731100000-add-multisessions-table.sql`
```sql
-- Migration to add multisessions table for managing multiple bot sessions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS public.multisessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    platform text NOT NULL,
    session_name text,
    phone_number text,
    is_active boolean NOT NULL DEFAULT false,
    organization_id uuid REFERENCES public.organizations(id),
    config jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS multisessions_org_platform_idx ON public.multisessions (organization_id, platform, is_active);
```

## 🛠️ Como Executar Migrações
1. Acesse o painel do Supabase > SQL Editor.
2. Cole o conteúdo do arquivo desejado.
3. Clique em "Run" para aplicar a migração.

## 🔎 Recomendações
- Sempre faça backup antes de rodar migrações em produção.
- Use índices para otimizar consultas frequentes.
- Documente alterações no [Changelog](../Changelog.md).

---

> Consulte também: [Persistência de Sessões](bot_sessions.md) | [Repositório de Sessões](botSessionsRepository.md)
