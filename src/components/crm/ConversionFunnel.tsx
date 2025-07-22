
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Users, Target, DollarSign } from "lucide-react";

export const ConversionFunnel = () => {
  const funnelData = [
    { stage: "Visitantes", count: 10000, percentage: 100, color: "bg-blue-500" },
    { stage: "Leads", count: 2500, percentage: 25, color: "bg-green-500" },
    { stage: "Oportunidades", count: 750, percentage: 7.5, color: "bg-yellow-500" },
    { stage: "Propostas", count: 250, percentage: 2.5, color: "bg-orange-500" },
    { stage: "Vendas", count: 75, percentage: 0.75, color: "bg-red-500" }
  ];

  const conversionRates = [
    { from: "Visitantes", to: "Leads", rate: 25 },
    { from: "Leads", to: "Oportunidades", rate: 30 },
    { from: "Oportunidades", to: "Propostas", rate: 33.3 },
    { from: "Propostas", to: "Vendas", rate: 30 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Funil de Conversão</h2>
          <p className="text-muted-foreground">Análise da jornada do cliente</p>
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
            <div className="text-2xl font-bold">0.75%</div>
            <p className="text-xs text-muted-foreground">Visitantes → Vendas</p>
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
            <div className="text-2xl font-bold">33.3%</div>
            <p className="text-xs text-muted-foreground">Oportunidades → Propostas</p>
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
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">Visitantes → Leads</p>
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
            <div className="text-2xl font-bold">R$ 2.500</div>
            <p className="text-xs text-muted-foreground">Por venda fechada</p>
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
            {funnelData.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{stage.stage}</h4>
                  <div className="text-right">
                    <div className="font-bold">{stage.count.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{stage.percentage}%</div>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={stage.percentage} className="h-8" />
                  <div 
                    className={`absolute left-0 top-0 h-8 rounded ${stage.color} opacity-70`} 
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
                {index < funnelData.length - 1 && (
                  <div className="mt-2 text-center text-sm text-muted-foreground">
                    ↓ {conversionRates[index]?.rate}% de conversão
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
