
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, ArrowRight, DollarSign } from "lucide-react";

export const SalesPipeline = () => {
  const stages = [
    { name: "Leads", count: 45, value: 125000, color: "bg-blue-500" },
    { name: "Qualificação", count: 28, value: 89000, color: "bg-yellow-500" },
    { name: "Proposta", count: 15, value: 65000, color: "bg-orange-500" },
    { name: "Negociação", count: 8, value: 42000, color: "bg-purple-500" },
    { name: "Fechamento", count: 3, value: 18000, color: "bg-green-500" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pipeline de Vendas</h2>
          <p className="text-muted-foreground">Acompanhe oportunidades em cada etapa</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Oportunidade
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {stages.map((stage, index) => (
          <Card key={stage.name} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stage.count}</div>
                <div className="text-sm text-muted-foreground">
                  R$ {stage.value.toLocaleString()}
                </div>
                <Progress value={(stage.count / 45) * 100} className="h-2" />
              </div>
            </CardContent>
            {index < stages.length - 1 && (
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
