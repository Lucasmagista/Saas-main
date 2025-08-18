-- Migration: Criação das tabelas whatsapp_logs e qr_codes

-- Tabela para logs de eventos do WhatsApp (envio, recebimento, falha)
create table if not exists whatsapp_logs (
    id uuid primary key default gen_random_uuid(),
    bot_id uuid references bots(id),
    direction text not null check (direction in ('sent', 'received', 'error')),
    number text not null,
    message text,
    event_type text, -- ex: 'message', 'status', 'error'
    created_at timestamp with time zone default now()
);

-- Tabela para armazenar QR codes gerados para autenticação
create table if not exists qr_codes (
    id uuid primary key default gen_random_uuid(),
    bot_id uuid references bots(id),
    qr_code text not null,
    status text default 'pending', -- ex: 'pending', 'scanned', 'expired'
    created_at timestamp with time zone default now()
);
