// Tipos para dados vindos do Supabase
interface Lead {
  id: string;
}

interface Opportunity {
  stage: string | null;
  value: number | null;
}


import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Users, Target, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

interface ConversionMetric {
  totalConversion: number;
  bestConversion: number;
  worstConversion: number;
  bestStageLabel: string;
  worstStageLabel: string;
  averageValue: number;
}

/**
 * Componente para visualização do funil de conversão.  
 * Este componente calcula dinamicamente as etapas com base na quantidade de
 * leads e oportunidades cadastradas no Supabase.  Para cada etapa o número
 * de registros e a percentagem relativa à etapa inicial (Leads) são
 * calculados.  Métricas como taxa total de conversão, melhor etapa,
 * maior perda e valor médio das oportunidades também são extraídas a partir
 * dos dados reais.
 */
export const ConversionFunnel = () => {
  const [stages, setStages] = useState<FunnelStage[]>([]);
  const [metrics, setMetrics] = useState<ConversionMetric>({
    totalConversion: 0,
    bestConversion: 0,
    worstConversion: 0,
    bestStageLabel: '-',
    worstStageLabel: '-',
    averageValue: 0,
  });


  useEffect(() => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-purple-500',
    ];
    const fetchData = async () => {
      try {
        const { data: leadsRaw, error: leadsError } = await supabase
          .from('leads')
          .select('id');
        const leads = leadsRaw as Lead[] | null;
        if (leadsError) {
          console.error('Erro ao buscar leads:', leadsError.message);
          return;
        }
        const { data: oppsRaw, error: oppsError } = await supabase
          .from('opportunities')
          .select('stage, value');
        const opps = oppsRaw as Opportunity[] | null;
        if (oppsError) {
          console.error('Erro ao buscar oportunidades:', oppsError.message);
          return;
        }
        const leadsCount = (leads || []).length;
        // Agrupar oportunidades por estágio
        const oppGrouped: Record<string, { count: number; valueSum: number }> = {};
        (opps || []).forEach((o) => {
          const stageName = o.stage || 'Outro';
          if (!oppGrouped[stageName]) {
            oppGrouped[stageName] = { count: 0, valueSum: 0 };
          }
          oppGrouped[stageName].count += 1;
          oppGrouped[stageName].valueSum += Number(o.value ?? 0);
        });
        // Construir lista de etapas iniciando por Leads
        const stageEntries: FunnelStage[] = [];
        // Primeira etapa são os leads
        stageEntries.push({
          stage: 'Leads',
          count: leadsCount,
          percentage: 100,
          color: colors[0],
        });
        // Demais etapas provenientes das oportunidades agrupadas
        let colorIndex = 1;
        Object.keys(oppGrouped)
          .sort((a, b) => oppGrouped[b].count - oppGrouped[a].count)
          .forEach((stage) => {
            const count = oppGrouped[stage].count;
            const percentage = leadsCount > 0 ? (count / leadsCount) * 100 : 0;
            stageEntries.push({
              stage,
              count,
              percentage: Number(percentage.toFixed(2)),
              color: colors[colorIndex % colors.length],
            });
            colorIndex += 1;
          });
        setStages(stageEntries);
        // Calcular métricas adicionais
        if (stageEntries.length >= 2) {
          const convRates: number[] = [];
          let bestIndex = 0;
          let worstIndex = 0;
          for (let i = 0; i < stageEntries.length - 1; i++) {
            const rate = stageEntries[i].count > 0 ? (stageEntries[i + 1].count / stageEntries[i].count) * 100 : 0;
            convRates.push(rate);
            if (i === 0 || rate > convRates[bestIndex]) bestIndex = i;
            if (i === 0 || rate < convRates[worstIndex]) worstIndex = i;
          }
          const totalConv = stageEntries.length > 1 && stageEntries[0].count > 0
            ? (stageEntries[stageEntries.length - 1].count / stageEntries[0].count) * 100
            : 0;
          // Calcular valor médio das oportunidades
          const oppValues = (opps || []).map((o) => Number(o.value ?? 0));
          const avgValue = oppValues.length ? oppValues.reduce((a, v) => a + v, 0) / oppValues.length : 0;
          setMetrics({
            totalConversion: Number(totalConv.toFixed(2)),
            bestConversion: convRates.length > 0 ? Number(convRates[bestIndex]?.toFixed(2)) : 0,
            worstConversion: convRates.length > 0 ? Number(convRates[worstIndex]?.toFixed(2)) : 0,
            bestStageLabel:
              convRates.length > 0 && stageEntries[bestIndex + 1]
                ? `${stageEntries[bestIndex].stage} → ${stageEntries[bestIndex + 1].stage}`
                : '-',
            worstStageLabel:
              convRates.length > 0 && stageEntries[worstIndex + 1]
                ? `${stageEntries[worstIndex].stage} → ${stageEntries[worstIndex + 1].stage}`
                : '-',
            averageValue: Number(avgValue.toFixed(2)),
          });
        }
      } catch (err) {
        console.error('Erro inesperado ao carregar funil:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Funil de Conversão</h2>
          <p className="text-muted-foreground">Análise da jornada do cliente com dados reais</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Taxa de Conversão Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalConversion.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Leads → {stages[stages.length - 1]?.stage ?? '-'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Melhor Etapa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.bestConversion.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">{metrics.bestStageLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Maior Perda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.worstConversion.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">{metrics.worstStageLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valor Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {metrics.averageValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Por oportunidade</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visualização do Funil</CardTitle>
          <CardDescription>Fluxo de conversão por etapa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{stage.stage}</h4>
                  <div className="text-right">
                    <div className="font-bold">{stage.count.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{stage.percentage.toFixed(2)}%</div>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={stage.percentage} className="h-8" />
                  <div
                    className={`absolute left-0 top-0 h-8 rounded ${stage.color} opacity-70`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
                {index < stages.length - 1 && (
                  <div className="mt-2 text-center text-sm text-muted-foreground">
                    ↓{' '}
                    {stage.count > 0
                      ? ((stages[index + 1].count / stage.count) * 100).toFixed(2)
                      : '0.00'}
                    % de conversão
                  </div>
                )}
              </div>
            ))}
            {stages.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum dado disponível para o funil.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
