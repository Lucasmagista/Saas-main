import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Send, 
  Users,
  Hash,
  MessageCircle,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function TeamChat() {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");

  // Função para mostrar que a funcionalidade não está implementada ainda
  const showNotImplemented = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O chat interno da equipe será implementado em breve.",
      variant: "default"
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    showNotImplemented();
    setNewMessage("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
      {/* Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Chat da Equipe
          </CardTitle>
          <CardDescription>
            Comunicação interna da equipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Buscar conversas..."
              className="pl-10"
              onClick={showNotImplemented}
            />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Canais
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chat em desenvolvimento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chat da Equipe</CardTitle>
            <Button variant="outline" size="icon" onClick={showNotImplemented}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          {/* Messages Area */}
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="space-y-4">
              <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
              <div>
                <h3 className="font-semibold">Chat Interno em Desenvolvimento</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  O sistema de chat da equipe será implementado em breve.<br/>
                  Por enquanto, utilize outros canais de comunicação.
                </p>
              </div>
              <Button onClick={showNotImplemented} variant="outline">
                Saiba Mais
              </Button>
            </div>
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              onClick={showNotImplemented}
            />
            <Button type="submit" size="icon" disabled>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
