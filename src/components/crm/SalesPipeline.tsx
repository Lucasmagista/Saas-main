
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { makeAuthenticatedRequest } from '@/utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

interface Opportunity {
  id: string;
  title: string;
  stage: string;
  value: number;
  probability: number;
  expected_close_date: string;
  lead_id: string;
  assigned_to: string;
  created_at: string;
}

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  probability: number;
  color: string;
}

/**
 * Componente de Pipeline de Vendas que utiliza dados reais da API backend.
 * 
 * Este componente calcula automaticamente as métricas do pipeline baseadas na tabela
 * `opportunities` do backend e agrupa as oportunidades por etapa (`stage`).
 */
export const SalesPipeline: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeAuthenticatedRequest(`${API_BASE}/api/opportunities`);
      const opportunitiesData: Opportunity[] = response.data || [];
      setOpportunities(opportunitiesData);

      // Calcular estágios do pipeline
      const stages = calculatePipelineStages(opportunitiesData);
      setPipelineStages(stages);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar oportunidades');
      console.error('Erro ao buscar oportunidades:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePipelineStages = (opps: Opportunity[]): PipelineStage[] => {
    const stageConfig = [
      { stage: 'qualified', label: 'Qualificadas', color: 'bg-blue-500' },
      { stage: 'proposal', label: 'Propostas', color: 'bg-yellow-500' },
      { stage: 'negotiation', label: 'Negociação', color: 'bg-orange-500' },
      { stage: 'closed', label: 'Fechadas', color: 'bg-green-500' },
      { stage: 'lost', label: 'Perdidas', color: 'bg-red-500' }
    ];

    return stageConfig.map(config => {
      const stageOpps = opps.filter(opp => opp.stage === config.stage);
      const count = stageOpps.length;
      const value = stageOpps.reduce((sum, opp) => sum + (opp.value || 0), 0);
      const avgProbability = count > 0 
        ? stageOpps.reduce((sum, opp) => sum + (opp.probability || 0), 0) / count 
        : 0;

      return {
        stage: config.label,
        count,
        value,
        probability: avgProbability,
        color: config.color
      };
    });
  };

  const getTotalValue = () => {
    return opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
  };

  const getWeightedValue = () => {
    return opportunities.reduce((sum, opp) => {
      const probability = opp.probability || 0;
      return sum + ((opp.value || 0) * probability / 100);
    }, 0);
  };

  const getAverageDealSize = () => {
    if (opportunities.length === 0) return 0;
    return getTotalValue() / opportunities.length;
  };

  const getWinRate = () => {
    const closed = opportunities.filter(opp => opp.stage === 'closed').length;
    const total = opportunities.filter(opp => 
      ['closed', 'lost'].includes(opp.stage)
    ).length;
    return total > 0 ? (closed / total) * 100 : 0;
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Vendas</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Vendas</CardTitle>
          <CardDescription>Erro ao carregar dados: {error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalValue = getTotalValue();
  const weightedValue = getWeightedValue();
  const averageDealSize = getAverageDealSize();
  const winRate = getWinRate();
  const totalOpps = opportunities.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalValue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Valor total do pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Ponderado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {weightedValue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Baseado na probabilidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {averageDealSize.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Valor médio por oportunidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Oportunidades fechadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline por Estágio</CardTitle>
          <CardDescription>Distribuição de oportunidades e valores por estágio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {pipelineStages.map((stage) => (
            <div key={stage.stage} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{stage.count}</Badge>
                  <div>
                    <div className="font-medium">{stage.stage}</div>
                    <div className="text-sm text-muted-foreground">
                      R$ {stage.value.toLocaleString('pt-BR')} • {stage.probability.toFixed(0)}% prob.
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {totalOpps > 0 ? ((stage.count / totalOpps) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {totalValue > 0 ? ((stage.value / totalValue) * 100).toFixed(1) : 0}% do valor
                  </div>
                </div>
              </div>
              <Progress 
                value={totalOpps > 0 ? (stage.count / totalOpps) * 100 : 0} 
                className="h-2" 
              />
            </div>
          ))}
          
          {pipelineStages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma oportunidade encontrada.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Oportunidades Recentes</CardTitle>
          <CardDescription>Últimas oportunidades adicionadas ao pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {opportunities
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 5)
              .map((opp) => (
                <div key={opp.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{opp.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {opp.stage} • {opp.probability}% de probabilidade
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      R$ {opp.value.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(opp.expected_close_date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            
            {opportunities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma oportunidade encontrada.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
