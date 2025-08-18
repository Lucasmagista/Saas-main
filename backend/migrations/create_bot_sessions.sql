-- Criação da tabela bot_sessions no Supabase
create table if not exists bot_sessions (
  session_id text primary key,
  created_at timestamptz not null default now(),
  last_message text,
  status text not null default 'inactive',
  qr_data text,
  updated_at timestamptz not null default now()
);

-- Índice para buscas rápidas por status
create index if not exists idx_bot_sessions_status on bot_sessions(status);
