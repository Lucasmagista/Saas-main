
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Target, TrendingUp } from "lucide-react";

export const SlaManager = () => {
  const slaMetrics = [
    { name: "Tempo de Primeira Resposta", target: 1, current: 0.8, unit: "hora", compliance: 95 },
    { name: "Tempo de Resolução", target: 24, current: 18, unit: "horas", compliance: 88 },
    { name: "Taxa de Resolução", target: 95, current: 92, unit: "%", compliance: 97 },
    { name: "Satisfação do Cliente", target: 4.5, current: 4.2, unit: "/5", compliance: 93 }
  ];

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 95) return "text-green-600";
    if (compliance >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de SLA</h2>
          <p className="text-muted-foreground">Monitorar acordos de nível de serviço</p>
        </div>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Configurar SLA
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              SLA Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">93%</div>
            <p className="text-xs text-muted-foreground">Conformidade média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Primeira Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48 min</div>
            <p className="text-xs text-muted-foreground">Tempo médio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tickets em Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">5</div>
            <p className="text-xs text-muted-foreground">Próximos ao prazo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+2%</div>
            <p className="text-xs text-muted-foreground">vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {slaMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{metric.name}</h3>
                  <div className={`text-lg font-bold ${getComplianceColor(metric.compliance)}`}>
                    {metric.compliance}%
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Meta: {metric.target} {metric.unit}</span>
                  <span>Atual: {metric.current} {metric.unit}</span>
                </div>
                <Progress value={metric.compliance} className="h-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
