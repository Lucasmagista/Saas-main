
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Users, Mail } from "lucide-react";

export const LeadScoring = () => {
  const leads = [
    { name: "João Silva", company: "Tech Corp", score: 85, status: "hot", email: "joao@techcorp.com", phone: "(11) 99999-9999" },
    { name: "Maria Santos", company: "Digital Ltd", score: 72, status: "warm", email: "maria@digital.com", phone: "(11) 88888-8888" },
    { name: "Pedro Costa", company: "Start Inc", score: 45, status: "cold", email: "pedro@start.com", phone: "(11) 77777-7777" },
    { name: "Ana Oliveira", company: "Growth Co", score: 91, status: "hot", email: "ana@growth.com", phone: "(11) 66666-6666" }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "hot": return "destructive";
      case "warm": return "secondary";
      case "cold": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Lead Scoring</h2>
          <p className="text-muted-foreground">Pontuação automática baseada em comportamento</p>
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Score &gt; 80</p>
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
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Score 60-79</p>
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
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Score &lt; 60</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">+12% este mês</p>
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
            {leads.map((lead) => (
              <div key={lead.email} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-semibold">{lead.name}</h4>
                    <p className="text-sm text-muted-foreground">{lead.company}</p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                      {lead.score}
                    </div>
                    <Progress value={lead.score} className="w-20 h-2" />
                  </div>
                  <Badge variant={getStatusBadge(lead.status)}>
                    {lead.status}
                  </Badge>
                  <Button size="sm">Contatar</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
