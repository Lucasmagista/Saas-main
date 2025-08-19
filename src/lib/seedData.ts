import { makeAuthenticatedRequest } from '@/utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface SeedData {
  leads?: any[];
  opportunities?: any[];
  activities?: any[];
}

export const seedData = async (data: SeedData) => {
  try {
    console.log('Iniciando seed de dados...');

    // Verificar se já existem dados
    const existingLeads = await makeAuthenticatedRequest(`${API_BASE}/api/leads?limit=1`);
    
    if (existingLeads.data && existingLeads.data.length > 0) {
      console.log('Dados já existem, pulando seed...');
      return { success: true, message: 'Dados já existem' };
    }

    const results = {
      leads: [],
      opportunities: [],
      activities: []
    };

    // Seed de leads
    if (data.leads && data.leads.length > 0) {
      console.log('Criando leads...');
      try {
        const leadsResponse = await makeAuthenticatedRequest(`${API_BASE}/api/leads/bulk`, {
          method: 'POST',
          data: { leads: data.leads }
        });
        results.leads = leadsResponse.data;
        console.log(`${results.leads.length} leads criados`);
      } catch (error) {
        console.error('Erro ao criar leads:', error);
      }
    }

    // Seed de oportunidades
    if (data.opportunities && data.opportunities.length > 0) {
      console.log('Criando oportunidades...');
      try {
        const opportunitiesResponse = await makeAuthenticatedRequest(`${API_BASE}/api/opportunities/bulk`, {
          method: 'POST',
          data: { opportunities: data.opportunities }
        });
        results.opportunities = opportunitiesResponse.data;
        console.log(`${results.opportunities.length} oportunidades criadas`);
      } catch (error) {
        console.error('Erro ao criar oportunidades:', error);
      }
    }

    // Seed de atividades
    if (data.activities && data.activities.length > 0) {
      console.log('Criando atividades...');
      try {
        const activitiesResponse = await makeAuthenticatedRequest(`${API_BASE}/api/activities/bulk`, {
          method: 'POST',
          data: { activities: data.activities }
        });
        results.activities = activitiesResponse.data;
        console.log(`${results.activities.length} atividades criadas`);
      } catch (error) {
        console.error('Erro ao criar atividades:', error);
      }
    }

    console.log('Seed de dados concluído com sucesso!');
    return { success: true, results };

  } catch (error) {
    console.error('Erro durante seed de dados:', error);
    return { success: false, error };
  }
};

/**
 * Dados de exemplo para popular o sistema
 */

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  position: string;
  department: string;
  phone: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

interface Organization {
  id: string;
  name: string;
  domain: string;
  created_at: string;
  updated_at: string;
}

export const seedUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    full_name: 'Administrador',
    role: 'admin',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'user@example.com',
    full_name: 'Usuário Padrão',
    role: 'user',
    created_at: new Date().toISOString(),
  },
];

export const seedProfiles: Profile[] = [
  {
    id: '1',
    email: 'admin@example.com',
    full_name: 'Administrador do Sistema',
    position: 'Administrador',
    department: 'TI',
    phone: '+55 11 99999-9999',
    avatar_url: '/avatars/admin.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'user@example.com',
    full_name: 'Usuário Padrão',
    position: 'Desenvolvedor',
    department: 'Desenvolvimento',
    phone: '+55 11 88888-8888',
    avatar_url: '/avatars/user.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const seedOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Empresa Exemplo',
    domain: 'example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Dados de exemplo para seed
export const sampleLeads = [
  {
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '+5511999999999',
    company: 'Tech Solutions Ltda',
    position: 'CEO',
    source: 'website',
    status: 'new',
    score: 85,
    notes: 'Interessado em soluções de automação',
    tags: ['hot', 'decision-maker']
  },
  {
    name: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    phone: '+5511888888888',
    company: 'Digital Marketing Pro',
    position: 'Marketing Manager',
    source: 'linkedin',
    status: 'contacted',
    score: 72,
    notes: 'Buscando ferramentas de análise',
    tags: ['warm', 'influencer']
  },
  {
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@startup.com',
    phone: '+5511777777777',
    company: 'Inovação Startup',
    position: 'CTO',
    source: 'referral',
    status: 'qualified',
    score: 95,
    notes: 'Startup em crescimento, orçamento aprovado',
    tags: ['hot', 'budget-approved', 'decision-maker']
  }
];

export const sampleOpportunities = [
  {
    title: 'Implementação de CRM',
    lead_id: '1',
    value: 50000,
    stage: 'proposal',
    probability: 75,
    expected_close_date: '2024-03-15',
    description: 'Sistema completo de CRM para empresa de tecnologia',
    assigned_to: '1'
  },
  {
    title: 'Automação de Marketing',
    lead_id: '2',
    value: 25000,
    stage: 'negotiation',
    probability: 60,
    expected_close_date: '2024-02-28',
    description: 'Ferramentas de automação para campanhas de marketing',
    assigned_to: '1'
  },
  {
    title: 'Plataforma de E-commerce',
    lead_id: '3',
    value: 100000,
    stage: 'qualified',
    probability: 90,
    expected_close_date: '2024-04-30',
    description: 'Desenvolvimento de plataforma completa de e-commerce',
    assigned_to: '1'
  }
];

export const sampleActivities = [
  {
    type: 'call',
    subject: 'Ligação inicial com João Silva',
    description: 'Apresentação da solução e identificação de necessidades',
    lead_id: '1',
    due_date: '2024-01-15',
    status: 'completed',
    assigned_to: '1'
  },
  {
    type: 'meeting',
    subject: 'Demonstração para Maria Santos',
    description: 'Demonstração online da plataforma',
    lead_id: '2',
    due_date: '2024-01-20',
    status: 'scheduled',
    assigned_to: '1'
  },
  {
    type: 'email',
    subject: 'Proposta comercial para Carlos Oliveira',
    description: 'Envio da proposta detalhada',
    lead_id: '3',
    due_date: '2024-01-25',
    status: 'pending',
    assigned_to: '1'
  }
];

// Função para executar seed completo
export const runFullSeed = async () => {
  const seedDataInput = {
    leads: sampleLeads,
    opportunities: sampleOpportunities,
    activities: sampleActivities
  };

  return await seedData(seedDataInput);
};
