// Tipos para dados vindos da API backend
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { makeAuthenticatedRequest } from '@/utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
  value: number;
}

interface Lead {
  id: string;
  status: string;
  created_at: string;
}

interface Opportunity {
  id: string;
  stage: string;
  value: number;
  created_at: string;
}

/**
 * Componente de Funil de Conversão que utiliza dados reais da API backend.
 * 
 * Este componente calcula automaticamente as métricas de conversão baseadas nas
 * leads e oportunidades cadastradas no backend.  Para cada etapa o número
 * de leads/oportunidades é contado e a porcentagem de conversão é calculada.
 * 
 * O funil segue o fluxo: Leads → Qualificadas → Propostas → Negociação → Fechadas
 */
export const ConversionFunnel: React.FC = () => {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateFunnel = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar leads da API
      const leadsResponse = await makeAuthenticatedRequest(`${API_BASE}/api/leads`);
      const leads: Lead[] = leadsResponse.data || [];

      // Buscar oportunidades da API
      const oppsResponse = await makeAuthenticatedRequest(`${API_BASE}/api/opportunities`);
      const opportunities: Opportunity[] = oppsResponse.data || [];

      // Calcular métricas do funil
      const totalLeads = leads.length;
      const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
      const proposals = opportunities.filter(opp => opp.stage === 'proposal').length;
      const negotiations = opportunities.filter(opp => opp.stage === 'negotiation').length;
      const closed = opportunities.filter(opp => opp.stage === 'closed').length;

      // Calcular valores
      const totalValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
      const closedValue = opportunities
        .filter(opp => opp.stage === 'closed')
        .reduce((sum, opp) => sum + (opp.value || 0), 0);

      // Criar dados do funil
      const funnel: FunnelData[] = [
        {
          stage: 'Leads',
          count: totalLeads,
          percentage: 100,
          value: 0
        },
        {
          stage: 'Qualificadas',
          count: qualifiedLeads,
          percentage: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
          value: 0
        },
        {
          stage: 'Propostas',
          count: proposals,
          percentage: totalLeads > 0 ? (proposals / totalLeads) * 100 : 0,
          value: 0
        },
        {
          stage: 'Negociação',
          count: negotiations,
          percentage: totalLeads > 0 ? (negotiations / totalLeads) * 100 : 0,
          value: 0
        },
        {
          stage: 'Fechadas',
          count: closed,
          percentage: totalLeads > 0 ? (closed / totalLeads) * 100 : 0,
          value: closedValue
        }
      ];

      setFunnelData(funnel);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados do funil');
      console.error('Erro ao calcular funil:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateFunnel();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Erro ao carregar dados: {error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
        <CardDescription>
          Métricas de conversão baseadas em dados reais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {funnelData.map((stage, index) => (
          <div key={stage.stage} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant={index === funnelData.length - 1 ? "default" : "secondary"}>
                  {stage.count}
                </Badge>
                <span className="font-medium">{stage.stage}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {stage.percentage.toFixed(1)}%
                </div>
                {stage.value > 0 && (
                  <div className="text-xs text-muted-foreground">
                    R$ {stage.value.toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
            <Progress value={stage.percentage} className="h-2" />
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Taxa de Conversão Total</span>
            <span className="text-sm text-muted-foreground">
              {funnelData.length > 0 && funnelData[funnelData.length - 1].percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
