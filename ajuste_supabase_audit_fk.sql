-- Criação da foreign key entre audit_logs_v2 e profiles
-- Ajuste os nomes dos campos conforme o seu schema real!

ALTER TABLE public.audit_logs_v2
ADD CONSTRAINT fk_audit_user
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- Exemplo de query para buscar logs com join (após criar a FK):
-- select=id,action,resource_type,resource_id,user_id,ip_address,user_agent,old_values,new_values,created_at,profiles!inner(email,full_name)

-- Validação de colunas para backup_logs
-- Verifique se a coluna 'status' existe em backup_logs antes de usar o filtro status=eq.completed
-- Exemplo de query:
-- select=completed_at&status=eq.completed&order=completed_at.desc&limit=1

-- Se precisar de mais ajustes, envie o schema das tabelas.
