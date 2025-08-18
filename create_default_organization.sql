-- Criar organização padrão se não existir
INSERT INTO public.organizations (name, domain, settings)
SELECT 'Organização Padrão', 'default.local', '{}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM public.organizations LIMIT 1
);
