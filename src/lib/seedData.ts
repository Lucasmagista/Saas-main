import { supabase } from '@/integrations/supabase/client';

export const seedDashboardData = async () => {
  try {
    // Verificar se já existem dados
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('id')
      .limit(1);

    if (existingLeads && existingLeads.length > 0) {
      console.log('Dados já existem, pulando criação inicial');
      return;
    }

    console.log('Criando dados iniciais para o dashboard...');

    // Dados de exemplo para leads
    const sampleLeads = [
      {
        name: 'João Silva',
        email: 'joao.silva@techcorp.com',
        phone: '(11) 98765-4321',
        company: 'Tech Corp',
        status: 'qualified',
        source: 'website',
        tags: ['enterprise', 'hot']
      },
      {
        name: 'Maria Santos',
        email: 'maria.santos@startup.inc',
        phone: '(11) 99999-8888',
        company: 'StartUp Inc',
        status: 'contacted',
        source: 'linkedin',
        tags: ['startup', 'warm']
      },
      {
        name: 'Pedro Costa',
        email: 'pedro@enterprise.ltd',
        phone: '(11) 77777-6666',
        company: 'Enterprise Ltd',
        status: 'new',
        source: 'referral',
        tags: ['enterprise', 'cold']
      },
      {
        name: 'Ana Oliveira',
        email: 'ana@digital.agency',
        phone: '(11) 55555-4444',
        company: 'Digital Agency',
        status: 'qualified',
        source: 'google_ads',
        tags: ['agency', 'hot']
      },
      {
        name: 'Carlos Ferreira',
        email: 'carlos@retail.store',
        phone: '(11) 33333-2222',
        company: 'Retail Store',
        status: 'contacted',
        source: 'website',
        tags: ['retail', 'warm']
      }
    ];

    // Inserir leads
    const { data: insertedLeads, error: leadsError } = await supabase
      .from('leads')
      .insert(sampleLeads)
      .select();

    if (leadsError) {
      console.error('Erro ao criar leads:', leadsError);
      return;
    }

    console.log(`${insertedLeads?.length} leads criados com sucesso`);

    // Dados de exemplo para oportunidades
    const sampleOpportunities = [
      {
        title: 'Sistema CRM Completo - Tech Corp',
        description: 'Implementação de CRM personalizado com integração ERP',
        value: 150000,
        stage: 'Negociação',
        probability: 75,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lead_id: insertedLeads?.[0]?.id,
        pipeline_id: 'default',
        organization_id: 'temp-org',
        created_by: 'temp-user',
        assigned_to: 'temp-user'
      },
      {
        title: 'Consultoria Digital - StartUp Inc',
        description: 'Consultoria para transformação digital',
        value: 85000,
        stage: 'Proposta',
        probability: 60,
        expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        lead_id: insertedLeads?.[1]?.id,
        pipeline_id: 'default',
        organization_id: 'temp-org',
        created_by: 'temp-user',
        assigned_to: 'temp-user'
      },
      {
        title: 'Cloud Migration - Enterprise Ltd',
        description: 'Migração de infraestrutura para nuvem',
        value: 220000,
        stage: 'Qualificação',
        probability: 30,
        expected_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        lead_id: insertedLeads?.[2]?.id,
        pipeline_id: 'default',
        organization_id: 'temp-org',
        created_by: 'temp-user',
        assigned_to: 'temp-user'
      },
      {
        title: 'Automação Marketing - Digital Agency',
        description: 'Sistema de automação de marketing digital',
        value: 95000,
        stage: 'Negociação',
        probability: 80,
        expected_close_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        lead_id: insertedLeads?.[3]?.id,
        pipeline_id: 'default',
        organization_id: 'temp-org',
        created_by: 'temp-user',
        assigned_to: 'temp-user'
      },
      {
        title: 'E-commerce Platform - Retail Store',
        description: 'Desenvolvimento de plataforma e-commerce',
        value: 120000,
        stage: 'Fechado',
        probability: 100,
        expected_close_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        lead_id: insertedLeads?.[4]?.id,
        pipeline_id: 'default',
        organization_id: 'temp-org',
        created_by: 'temp-user',
        assigned_to: 'temp-user'
      }
    ];

    // Inserir oportunidades
    const { data: insertedOpportunities, error: opportunitiesError } = await supabase
      .from('opportunities')
      .insert(sampleOpportunities)
      .select();

    if (opportunitiesError) {
      console.error('Erro ao criar oportunidades:', opportunitiesError);
      return;
    }

    console.log(`${insertedOpportunities?.length} oportunidades criadas com sucesso`);

    // Dados de exemplo para atividades
    const sampleActivities = [
      {
        type: 'lead_created',
        title: 'Novo lead criado',
        description: 'Lead João Silva foi adicionado ao sistema',
        user_id: 'temp-user'
      },
      {
        type: 'opportunity_created',
        title: 'Nova oportunidade',
        description: 'Oportunidade Sistema CRM Completo criada',
        user_id: 'temp-user'
      },
      {
        type: 'call_made',
        title: 'Ligação realizada',
        description: 'Ligação para Maria Santos - StartUp Inc',
        user_id: 'temp-user'
      },
      {
        type: 'email_sent',
        title: 'E-mail enviado',
        description: 'Proposta enviada para Pedro Costa',
        user_id: 'temp-user'
      },
      {
        type: 'lead_updated',
        title: 'Lead atualizado',
        description: 'Status do lead Ana Oliveira alterado para qualificado',
        user_id: 'temp-user'
      }
    ];

    // Inserir atividades
    const { data: insertedActivities, error: activitiesError } = await supabase
      .from('activities')
      .insert(sampleActivities)
      .select();

    if (activitiesError) {
      console.error('Erro ao criar atividades:', activitiesError);
      return;
    }

    console.log(`${insertedActivities?.length} atividades criadas com sucesso`);
    console.log('Dashboard populado com dados iniciais!');

  } catch (error) {
    console.error('Erro ao criar dados iniciais:', error);
  }
};
