
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, FileText } from "lucide-react";

export const ComplianceManager = () => {
  const compliance = [
    { name: "GDPR", status: "compliant", score: 95, lastAudit: "2024-01-15" },
    { name: "SOC 2", status: "compliant", score: 92, lastAudit: "2024-01-10" },
    { name: "ISO 27001", status: "review", score: 88, lastAudit: "2024-01-05" },
    { name: "HIPAA", status: "non-compliant", score: 65, lastAudit: "2024-01-01" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "review": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "compliant": return "default";
      case "review": return "secondary";
      default: return "destructive";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Compliance</h2>
          <p className="text-muted-foreground">Monitorar conformidade regulatória</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Gerar Relatório
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conformes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2</div>
            <p className="text-xs text-muted-foreground">de 4 padrões</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Revisão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">1</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Não Conformes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1</div>
            <p className="text-xs text-muted-foreground">Ação necessária</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Conformidade geral</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {compliance.map((item) => (
          <Card key={item.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(item.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Score: {item.score}%</span>
                      <span>Última auditoria: {item.lastAudit}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={getStatusBadge(item.status)}>
                    {item.status}
                  </Badge>
                  <Button size="sm" variant="outline">
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
