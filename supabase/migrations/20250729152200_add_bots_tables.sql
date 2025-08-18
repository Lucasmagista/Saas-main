-- Migration to add bots and bot_logs tables for multi-session WhatsApp integration

-- Enable extension for uuid generation if not already present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create bots table
CREATE TABLE IF NOT EXISTS public.bots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    session_name text,
    qrcode text,
    is_active boolean NOT NULL DEFAULT false,
    organization_id uuid REFERENCES public.organizations(id),
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create bot_logs table
CREATE TABLE IF NOT EXISTS public.bot_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id uuid NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    timestamp timestamptz NOT NULL DEFAULT now(),
    direction text NOT NULL,
    message text NOT NULL,
    type text
);

-- Index to quickly query logs by bot_id and timestamp
CREATE INDEX IF NOT EXISTS bot_logs_bot_id_timestamp_idx ON public.bot_logs (bot_id, timestamp);