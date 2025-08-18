-- Migration to add multisessions table for managing multiple bot sessions

-- Enable uuid generation extension if it isn't already present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create multisessions table. Each record represents a unique session bound
-- to a communication channel (e.g. WhatsApp, Telegram). This table holds
-- metadata about the session such as the friendly name, platform, optional
-- session name used by the underlying provider, phone/identifier, whether
-- the session is currently active, any custom configuration and timestamps.
-- The organization_id can be used to scope sessions to a given tenant.
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

-- Index to quickly query active sessions by organization and platform
CREATE INDEX IF NOT EXISTS multisessions_org_platform_idx ON public.multisessions (organization_id, platform, is_active);