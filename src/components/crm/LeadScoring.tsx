
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Users, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeadData {
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  tags: string[] | null;
}

/**
 * Componente de Lead Scoring que utiliza dados reais da tabela `leads` do Supabase.
 * Cada lead recebe uma pontuação calculada a partir do status e do número de
 * tags associadas.  A pontuação é meramente ilustrativa e pode ser
 * ajustada conforme regras de negócio reais.  Os leads são listados e
 * categorizados em quentes, mornos ou frios com base nessa pontuação.
 */
export const LeadScoring = () => {
  const [leads, setLeads] = useState<LeadData[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('name, company, email, phone, status, tags');
        if (error) {
          console.error('Erro ao buscar leads:', error.message);
          return;
        }
        setLeads((data || []) as LeadData[]);
      } catch (err) {
        console.error('Erro inesperado ao carregar leads:', err);
      }
    };
    fetchLeads();
  }, []);

  // Função para calcular uma pontuação simples para cada lead.  A pontuação
  // parte de 50 e aumenta conforme o status e o número de tags.  Leads com
  // status "hot" recebem +40 pontos, "warm" +20 e outros nenhum ajuste.
  const computeScore = (lead: LeadData): number => {
    let score = 50;
    if (lead.status) {
      const normalized = lead.status.toLowerCase();
      if (normalized.includes('hot')) score += 40;
      else if (normalized.includes('warm')) score += 20;
      else if (normalized.includes('cold') || normalized.includes('new')) score += 0;
    }
    const tagBonus = (lead.tags?.length || 0) * 2;
    score += tagBonus;
    return Math.min(score, 100);
  };

  const sortedLeads = [...leads]
    .map((lead) => ({ ...lead, score: computeScore(lead) }))
    .sort((a, b) => b.score - a.score);

  const hotCount = sortedLeads.filter((l) => l.score >= 80).length;
  const warmCount = sortedLeads.filter((l) => l.score >= 60 && l.score < 80).length;
  const coldCount = sortedLeads.filter((l) => l.score < 60).length;
  const averageScore = sortedLeads.length
    ? sortedLeads.reduce((acc, l) => acc + l.score, 0) / sortedLeads.length
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (score: number): 'default' | 'secondary' | 'outline' | 'destructive' => {
    if (score >= 80) return 'destructive';
    if (score >= 60) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Lead Scoring</h2>
          <p className="text-muted-foreground">Pontuação automática baseada em dados reais</p>
        </div>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Configurar Critérios
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Leads Quentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotCount}</div>
            <p className="text-xs text-muted-foreground">Score &gt;= 80</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads Mornos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warmCount}</div>
            <p className="text-xs text-muted-foreground">Score 60–79</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Leads Frios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coldCount}</div>
            <p className="text-xs text-muted-foreground">Score &lt; 60</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Média geral dos leads</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads por Pontuação</CardTitle>
          <CardDescription>Lista ordenada por score de qualificação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedLeads.map((lead) => (
              <div
                key={`${lead.email ?? lead.name}-${lead.company ?? ''}`}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-semibold">{lead.name}</h4>
                    {lead.company && (
                      <p className="text-sm text-muted-foreground">{lead.company}</p>
                    )}
                    {lead.email && (
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                      {lead.score}
                    </div>
                    <Progress value={lead.score} className="w-20 h-2" />
                  </div>
                  <Badge variant={getStatusBadge(lead.score)}>
                    {lead.score >= 80 ? 'hot' : lead.score >= 60 ? 'warm' : 'cold'}
                  </Badge>
                  <Button size="sm">Contatar</Button>
                </div>
              </div>
            ))}
            {sortedLeads.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum lead encontrado.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
