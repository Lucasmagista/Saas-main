-- Criação da tabela 'configs' para armazenar configurações globais
create table if not exists configs (
  key text primary key,
  value jsonb
);
