
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Clock } from "lucide-react";

export const LiveChat = () => {
  const chats = [
    { id: 1, customer: "João Silva", status: "active", agent: "Maria", duration: "5 min", messages: 12 },
    { id: 2, customer: "Ana Costa", status: "waiting", agent: null, duration: "2 min", messages: 3 },
    { id: 3, customer: "Pedro Santos", status: "active", agent: "Carlos", duration: "15 min", messages: 28 },
    { id: 4, customer: "Lucia Oliveira", status: "ended", agent: "Maria", duration: "12 min", messages: 18 }
  ];

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "active": return "default";
      case "waiting": return "destructive";
      case "ended": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Chat ao Vivo</h2>
          <p className="text-muted-foreground">Atendimento em tempo real</p>
        </div>
        <Button>
          <MessageCircle className="h-4 w-4 mr-2" />
          Iniciar Chat
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chats Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Na Fila
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Aguardando</p>
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
            <div className="text-2xl font-bold">8 min</div>
            <p className="text-xs text-muted-foreground">Por conversa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <p className="text-xs text-muted-foreground">Avaliação média</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {chats.map((chat) => (
          <Card key={chat.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{chat.customer}</h3>
                    <Badge variant={getStatusColor(chat.status)}>
                      {chat.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Agente: {chat.agent || "Aguardando"}</span>
                    <span>Duração: {chat.duration}</span>
                    <span>{chat.messages} mensagens</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Entrar
                  </Button>
                  <Button size="sm">
                    Ver Histórico
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
