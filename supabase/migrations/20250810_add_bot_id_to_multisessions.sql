-- Migration para adicionar o campo bot_id na tabela multisessions
ALTER TABLE public.multisessions ADD COLUMN IF NOT EXISTS bot_id uuid REFERENCES public.bots(id);

-- Opcional: index para buscas rápidas por bot
CREATE INDEX IF NOT EXISTS multisessions_bot_id_idx ON public.multisessions (bot_id);
