
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, Plus, Search } from "lucide-react";

export const HelpDesk = () => {
  const tickets = [
    { id: 1, title: "Login não funcionando", priority: "high", status: "open", customer: "João Silva", created: "2h ago" },
    { id: 2, title: "Erro ao exportar dados", priority: "medium", status: "in_progress", customer: "Maria Santos", created: "4h ago" },
    { id: 3, title: "Solicitação de nova feature", priority: "low", status: "pending", customer: "Pedro Costa", created: "1d ago" },
    { id: 4, title: "Problema com pagamento", priority: "high", status: "resolved", customer: "Ana Silva", created: "2d ago" }
  ];

  const getPriorityColor = (priority: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "default";
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "open": return "destructive";
      case "in_progress": return "secondary";
      case "pending": return "outline";
      case "resolved": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">HelpDesk</h2>
          <p className="text-muted-foreground">Gerenciar tickets de suporte</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Aguardando resposta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Sendo processados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Tickets fechados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5h</div>
            <p className="text-xs text-muted-foreground">Resolução</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar tickets..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abertos</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">#{ticket.id} - {ticket.title}</h3>
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Cliente: {ticket.customer}</span>
                    <span>Criado: {ticket.created}</span>
                  </div>
                </div>
                <Button size="sm">
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
