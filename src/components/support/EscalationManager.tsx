
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, Clock, ArrowUp } from "lucide-react";

export const EscalationManager = () => {
  const escalations = [
    { id: 1, ticket: "#1234", issue: "Sistema indisponível", level: "critical", assignedTo: "Manager", escalatedAt: "1h ago", reason: "SLA breach" },
    { id: 2, ticket: "#1235", issue: "Falha no pagamento", level: "high", assignedTo: "Senior Tech", escalatedAt: "3h ago", reason: "Complex issue" },
    { id: 3, ticket: "#1236", issue: "Bug na integração", level: "medium", assignedTo: "Team Lead", escalatedAt: "6h ago", reason: "Multiple attempts" },
    { id: 4, ticket: "#1237", issue: "Dúvida sobre recursos", level: "low", assignedTo: "Specialist", escalatedAt: "1d ago", reason: "Expert needed" }
  ];

  const getLevelColor = (level: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (level) {
      case "critical": return "destructive";
      case "high": return "secondary";
      case "medium": return "outline";
      case "low": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Escalação</h2>
          <p className="text-muted-foreground">Controlar escalações de suporte</p>
        </div>
        <Button>
          <ArrowUp className="h-4 w-4 mr-2" />
          Nova Escalação
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Escalações Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Críticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
            <p className="text-xs text-muted-foreground">Requer atenção imediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2h</div>
            <p className="text-xs text-muted-foreground">Para resolução</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Taxa de Escalação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12%</div>
            <p className="text-xs text-muted-foreground">Dos tickets totais</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {escalations.map((escalation) => (
          <Card key={escalation.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{escalation.ticket} - {escalation.issue}</h3>
                    <Badge variant={getLevelColor(escalation.level)}>
                      {escalation.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Responsável: {escalation.assignedTo}</span>
                    <span>Escalado: {escalation.escalatedAt}</span>
                    <span>Motivo: {escalation.reason}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Reatribuir
                  </Button>
                  <Button size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
