
-- Tabela para conversas e mensagens
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  lead_id UUID REFERENCES public.leads(id),
  channel VARCHAR(50) NOT NULL DEFAULT 'whatsapp', -- whatsapp, telegram, instagram, etc
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, archived, closed
  assigned_agent UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL, -- user, agent, bot
  sender_id UUID, -- user_id or agent_id
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- text, image, document, audio, video
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Tabela para templates de mensagens mais robusta
CREATE TABLE public.message_templates_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  channel VARCHAR(50) NOT NULL DEFAULT 'whatsapp',
  language VARCHAR(10) DEFAULT 'pt-BR',
  subject VARCHAR(255),
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  media_urls TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para automações de resposta
CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL, -- keyword, time_based, event_based
  trigger_conditions JSONB NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- send_message, assign_agent, create_lead, webhook
  action_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para chatbots
CREATE TABLE public.chatbots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  channel VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  knowledge_base JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para pipeline de vendas mais detalhada
CREATE TABLE public.sales_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  pipeline_id UUID REFERENCES public.sales_pipeline(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  probability INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para interações detalhadas
CREATE TABLE public.interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  lead_id UUID REFERENCES public.leads(id),
  opportunity_id UUID REFERENCES public.opportunities(id),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL, -- call, email, meeting, whatsapp, note
  subject VARCHAR(255),
  content TEXT,
  duration INTEGER, -- em minutos
  outcome VARCHAR(100),
  next_action VARCHAR(255),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para notificações push
CREATE TABLE public.push_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  category VARCHAR(100),
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para configurações de notificação
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  notification_types JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para integrações externas
CREATE TABLE public.external_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- api, webhook, zapier, etc
  config JSONB NOT NULL,
  credentials JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para webhooks
CREATE TABLE public.webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  webhook_id UUID REFERENCES public.webhooks(id),
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP WITH TIME ZONE,
  response_status INTEGER,
  response_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para cache de dados
CREATE TABLE public.cache_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  cache_key VARCHAR(255) NOT NULL,
  cache_value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para monitoramento de performance
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  metric_name VARCHAR(255) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para logs de auditoria expandida
CREATE TABLE public.audit_logs_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para configurações customizáveis
CREATE TABLE public.ui_customizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES auth.users(id),
  component_name VARCHAR(255) NOT NULL,
  customization_data JSONB NOT NULL,
  is_global BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_conversations_org_id ON public.conversations(organization_id);
CREATE INDEX idx_conversations_lead_id ON public.conversations(lead_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_automation_rules_org_id ON public.automation_rules(organization_id);
CREATE INDEX idx_automation_rules_active ON public.automation_rules(is_active);
CREATE INDEX idx_interactions_lead_id ON public.interactions(lead_id);
CREATE INDEX idx_interactions_opportunity_id ON public.interactions(opportunity_id);
CREATE INDEX idx_interactions_created_at ON public.interactions(created_at);
CREATE INDEX idx_cache_entries_key ON public.cache_entries(cache_key);
CREATE INDEX idx_cache_entries_expires ON public.cache_entries(expires_at);
CREATE INDEX idx_performance_metrics_org_id ON public.performance_metrics(organization_id);
CREATE INDEX idx_performance_metrics_name ON public.performance_metrics(metric_name);
CREATE INDEX idx_audit_logs_v2_org_id ON public.audit_logs_v2(organization_id);
CREATE INDEX idx_audit_logs_v2_user_id ON public.audit_logs_v2(user_id);
CREATE INDEX idx_audit_logs_v2_created_at ON public.audit_logs_v2(created_at);

-- Políticas RLS para as novas tabelas
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_customizations ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de acesso por organização
CREATE POLICY "Users can view organization conversations" ON public.conversations
  FOR SELECT USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can create organization conversations" ON public.conversations
  FOR INSERT WITH CHECK (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can update organization conversations" ON public.conversations
  FOR UPDATE USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can view conversation messages" ON public.messages
  FOR SELECT USING (conversation_id IN (
    SELECT id FROM public.conversations WHERE organization_id = get_user_organization(auth.uid())
  ));

CREATE POLICY "Users can create conversation messages" ON public.messages
  FOR INSERT WITH CHECK (conversation_id IN (
    SELECT id FROM public.conversations WHERE organization_id = get_user_organization(auth.uid())
  ));

CREATE POLICY "Users can view organization templates" ON public.message_templates_v2
  FOR SELECT USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can manage organization templates" ON public.message_templates_v2
  FOR ALL USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can view organization automation rules" ON public.automation_rules
  FOR SELECT USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can manage organization automation rules" ON public.automation_rules
  FOR ALL USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can view organization chatbots" ON public.chatbots
  FOR SELECT USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can manage organization chatbots" ON public.chatbots
  FOR ALL USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can view organization sales stages" ON public.sales_stages
  FOR SELECT USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can manage organization sales stages" ON public.sales_stages
  FOR ALL USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can view organization interactions" ON public.interactions
  FOR SELECT USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can create organization interactions" ON public.interactions
  FOR INSERT WITH CHECK (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can update organization interactions" ON public.interactions
  FOR UPDATE USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can view their push notifications" ON public.push_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their push notifications" ON public.push_notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view their notification preferences" ON public.notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view organization integrations" ON public.external_integrations
  FOR SELECT USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Admins can manage organization integrations" ON public.external_integrations
  FOR ALL USING (organization_id = get_user_organization(auth.uid()) AND 
    (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'super_admin'::user_role)));

CREATE POLICY "Users can view organization webhook events" ON public.webhook_events
  FOR SELECT USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can view organization cache entries" ON public.cache_entries
  FOR SELECT USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can manage organization cache entries" ON public.cache_entries
  FOR ALL USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can view organization performance metrics" ON public.performance_metrics
  FOR SELECT USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can create organization performance metrics" ON public.performance_metrics
  FOR INSERT WITH CHECK (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can view organization audit logs" ON public.audit_logs_v2
  FOR SELECT USING (organization_id = get_user_organization(auth.uid()));

CREATE POLICY "Users can view their ui customizations" ON public.ui_customizations
  FOR SELECT USING (user_id = auth.uid() OR 
    (is_global = true AND organization_id = get_user_organization(auth.uid())));

CREATE POLICY "Users can manage their ui customizations" ON public.ui_customizations
  FOR ALL USING (user_id = auth.uid() OR 
    (is_global = true AND organization_id = get_user_organization(auth.uid()) AND 
     (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'super_admin'::user_role))));

-- Triggers para updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_message_templates_v2_updated_at
  BEFORE UPDATE ON public.message_templates_v2
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_chatbots_updated_at
  BEFORE UPDATE ON public.chatbots
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_external_integrations_updated_at
  BEFORE UPDATE ON public.external_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_ui_customizations_updated_at
  BEFORE UPDATE ON public.ui_customizations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para limpeza automática de cache expirado
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.cache_entries WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para métricas de performance
CREATE OR REPLACE FUNCTION public.record_performance_metric(
  p_organization_id UUID,
  p_metric_name VARCHAR(255),
  p_metric_value NUMERIC,
  p_metric_type VARCHAR(50),
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.performance_metrics (
    organization_id, metric_name, metric_value, metric_type, metadata
  ) VALUES (
    p_organization_id, p_metric_name, p_metric_value, p_metric_type, p_metadata
  );
END;
$$ LANGUAGE plpgsql;

-- Função para log de auditoria
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_organization_id UUID,
  p_user_id UUID,
  p_action VARCHAR(255),
  p_resource_type VARCHAR(100),
  p_resource_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_logs_v2 (
    organization_id, user_id, action, resource_type, resource_id, 
    old_values, new_values, metadata
  ) VALUES (
    p_organization_id, p_user_id, p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_metadata
  );
END;
$$ LANGUAGE plpgsql;
