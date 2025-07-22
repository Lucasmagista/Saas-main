
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Edit, Copy } from "lucide-react";

export const EmailTemplates = () => {
  const templates = [
    { id: 1, name: "Boas-vindas", type: "onboarding", status: "active", usage: 245 },
    { id: 2, name: "Recuperação de Senha", type: "security", status: "active", usage: 89 },
    { id: 3, name: "Confirmação de Pedido", type: "transactional", status: "active", usage: 156 },
    { id: 4, name: "Newsletter Semanal", type: "marketing", status: "draft", usage: 0 }
  ];

  const getTypeColor = (type: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (type) {
      case "onboarding": return "default";
      case "security": return "destructive";
      case "transactional": return "secondary";
      case "marketing": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Templates de Email</h2>
          <p className="text-muted-foreground">Gerenciar templates de email</p>
        </div>
        <Button>
          <Mail className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="space-y-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    <Badge variant={getTypeColor(template.type)}>
                      {template.type}
                    </Badge>
                    <Badge variant={template.status === "active" ? "default" : "outline"}>
                      {template.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Usado {template.usage} vezes este mês
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
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
