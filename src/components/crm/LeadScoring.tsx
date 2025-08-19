
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { makeAuthenticatedRequest } from '@/utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  score: number;
  status: string;
  source: string;
  created_at: string;
}

interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Componente de Lead Scoring que utiliza dados reais da API backend.
 * 
 * Este componente calcula automaticamente a distribuição de scores das leads
 * e apresenta métricas de qualidade baseadas nos dados reais.
 */
export const LeadScoring: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeAuthenticatedRequest(`${API_BASE}/api/leads`);
      const leadsData: Lead[] = response.data || [];
      setLeads(leadsData);

      // Calcular distribuição de scores
      const distribution = calculateScoreDistribution(leadsData);
      setScoreDistribution(distribution);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar leads');
      console.error('Erro ao buscar leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateScoreDistribution = (leads: Lead[]): ScoreDistribution[] => {
    const total = leads.length;
    if (total === 0) return [];

    const ranges = [
      { min: 0, max: 20, label: '0-20', color: 'bg-red-500' },
      { min: 21, max: 40, label: '21-40', color: 'bg-orange-500' },
      { min: 41, max: 60, label: '41-60', color: 'bg-yellow-500' },
      { min: 61, max: 80, label: '61-80', color: 'bg-blue-500' },
      { min: 81, max: 100, label: '81-100', color: 'bg-green-500' }
    ];

    return ranges.map(range => {
      const count = leads.filter(lead => 
        lead.score >= range.min && lead.score <= range.max
      ).length;
      
      return {
        range: range.label,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: range.color
      };
    });
  };

  const getAverageScore = () => {
    if (leads.length === 0) return 0;
    const total = leads.reduce((sum, lead) => sum + lead.score, 0);
    return total / leads.length;
  };

  const getHighQualityLeads = () => {
    return leads.filter(lead => lead.score >= 70).length;
  };

  const getLowQualityLeads = () => {
    return leads.filter(lead => lead.score <= 30).length;
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Scoring</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Scoring</CardTitle>
          <CardDescription>Erro ao carregar dados: {error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const averageScore = getAverageScore();
  const highQualityCount = getHighQualityLeads();
  const lowQualityCount = getLowQualityLeads();
  const totalLeads = leads.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Pontuação média das leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leads de Alta Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{highQualityCount}</div>
            <p className="text-xs text-muted-foreground">
              Score ≥ 70 ({totalLeads > 0 ? ((highQualityCount / totalLeads) * 100).toFixed(1) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leads de Baixa Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowQualityCount}</div>
            <p className="text-xs text-muted-foreground">
              Score ≤ 30 ({totalLeads > 0 ? ((lowQualityCount / totalLeads) * 100).toFixed(1) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">Leads analisadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Scores</CardTitle>
          <CardDescription>Distribuição das leads por faixa de pontuação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scoreDistribution.map((item) => (
            <div key={item.range} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{item.count}</Badge>
                  <span className="font-medium">Score {item.range}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
          
          {scoreDistribution.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum dado disponível para análise.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Leads</CardTitle>
          <CardDescription>Leads com maior pontuação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leads
              .sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">{lead.company}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={lead.score >= 70 ? "default" : lead.score >= 40 ? "secondary" : "destructive"}>
                      Score: {lead.score}
                    </Badge>
                  </div>
                </div>
              ))}
            
            {leads.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma lead encontrada.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
