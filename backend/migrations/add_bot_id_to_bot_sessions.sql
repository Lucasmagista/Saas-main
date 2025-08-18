-- Adiciona o campo bot_id à tabela bot_sessions para permitir atribuição de bot à sessão
alter table bot_sessions add column if not exists bot_id uuid references bots(id);
