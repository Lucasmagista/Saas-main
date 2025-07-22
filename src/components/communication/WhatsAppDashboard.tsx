
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone,
  Video,
  Archive,
  Star,
  QrCode,
  Zap,
  Bot,
  Settings,
  Filter,
  Download,
  MessageCircle,
  Clock,
  CheckCheck,
  Check,
  Users,
  Wifi,
  WifiOff,
  Play,
  Pause,
  RotateCcw,
  Plus,
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConversations, useSendMessage } from "@/hooks/useConversations";
import { useRealTimeConversations } from "@/hooks/useRealTimeConversations";
import { useWhatsAppSessions, useCreateWhatsAppSession, useGenerateQRCode } from "@/hooks/useWhatsAppIntegration";
import { useBots } from "@/hooks/useBots";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function WhatsAppDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewSession, setShowNewSession] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedQRSession, setSelectedQRSession] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionPhone, setNewSessionPhone] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: whatsappSessions, isLoading: sessionsLoading } = useWhatsAppSessions();
  const { data: bots, isLoading: botsLoading } = useBots();
  const { onlineUsers } = useRealTimeConversations();
  const sendMessage = useSendMessage();
  const createSession = useCreateWhatsAppSession();
  const generateQRCode = useGenerateQRCode();

  const whatsappConversations = conversations?.filter(conv => conv.channel === 'whatsapp') || [];
  const selectedConv = whatsappConversations.find(c => c.id === selectedConversation);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      await sendMessage.mutateAsync({
        conversation_id: selectedConversation,
        content: newMessage,
        sender_type: 'agent',
        sender_id: user.id,
        message_type: 'text',
      });

      setNewMessage("");
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim() || !newSessionPhone.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createSession.mutateAsync({
        name: newSessionName,
        phone_number: newSessionPhone,
      });

      setNewSessionName("");
      setNewSessionPhone("");
      setShowNewSession(false);
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
    }
  };

  const handleGenerateQRCode = async (sessionId: string) => {
    try {
      const result = await generateQRCode.mutateAsync(sessionId);
      setSelectedQRSession(sessionId);
      setShowQRCode(true);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-500";
      case "connecting": return "bg-yellow-500";
      case "disconnected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getMessageStatus = (status: string) => {
    switch (status) {
      case "sent": return <Check className="w-3 h-3 text-muted-foreground" />;
      case "delivered": return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case "read": return <CheckCheck className="w-3 h-3 text-primary" />;
      default: return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const filteredConversations = whatsappConversations.filter(conv =>
    conv.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lead?.phone?.includes(searchTerm)
  );

  const activeSessions = whatsappSessions?.filter(s => s.status === 'connected').length || 0;
  const totalConversations = whatsappConversations.length;
  const activeBots = bots?.filter(b => b.is_active && b.channel === 'whatsapp').length || 0;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              {whatsappSessions?.length || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bots Ativos</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBots}</div>
            <p className="text-xs text-muted-foreground">
              Respondendo automaticamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessões WhatsApp */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sessões WhatsApp</CardTitle>
              <CardDescription>Gerencie suas conexões do WhatsApp</CardDescription>
            </div>
            <Dialog open={showNewSession} onOpenChange={setShowNewSession}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Sessão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Sessão WhatsApp</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="session-name">Nome da Sessão</Label>
                    <Input
                      id="session-name"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="Ex: Atendimento Principal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="session-phone">Número do WhatsApp</Label>
                    <Input
                      id="session-phone"
                      value={newSessionPhone}
                      onChange={(e) => setNewSessionPhone(e.target.value)}
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                  <Button onClick={handleCreateSession} className="w-full">
                    Criar Sessão
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {whatsappSessions?.map((session) => (
                <Card key={session.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                        <div>
                          <h4 className="font-semibold">{session.name}</h4>
                          <p className="text-sm text-muted-foreground">{session.phone_number}</p>
                        </div>
                      </div>
                      <Badge variant={session.status === 'connected' ? 'default' : 'secondary'}>
                        {session.status === 'connected' ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(session.last_activity), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateQRCode(session.id)}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interface de Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Lista de Conversas */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversas</CardTitle>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              {conversationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-1 p-3">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conversation.id 
                          ? "bg-accent" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.lead?.name}`} />
                            <AvatarFallback>
                              {conversation.lead?.name?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          {onlineUsers[conversation.lead_id || ''] && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {conversation.lead?.name || 'Sem nome'}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conversation.last_message_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {conversation.lead?.phone || 'Sem telefone'}
                          </p>
                          {conversation.tags && conversation.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {conversation.tags.slice(0, 2).map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs px-1 py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de Chat */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConv ? (
            <>
              {/* Cabeçalho do Chat */}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConv.lead?.name}`} />
                        <AvatarFallback>
                          {selectedConv.lead?.name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      {onlineUsers[selectedConv.lead_id || ''] && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedConv.lead?.name || 'Sem nome'}</h3>
                      <p className="text-sm text-muted-foreground">{selectedConv.lead?.phone || 'Sem telefone'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              {/* Área de Mensagens */}
              <CardContent className="flex-1 p-4 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {/* Mensagens serão carregadas aqui via ConversationView */}
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione uma conversa para ver as mensagens</p>
                    </div>
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Input de Mensagem */}
                <div className="border-t pt-4">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm" type="button">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" type="button">
                      <Bot className="w-4 h-4" />
                    </Button>
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={!newMessage.trim() || sendMessage.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                  
                  {/* Ações Rápidas */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Zap className="w-3 h-3 mr-1" />
                      Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bot className="w-3 h-3 mr-1" />
                      Bot
                    </Button>
                    <Button variant="outline" size="sm">
                      <Star className="w-3 h-3 mr-1" />
                      Favoritar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
                <p className="text-muted-foreground">
                  Escolha uma conversa da lista para começar a enviar mensagens
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modal QR Code */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
              <QrCode className="w-32 h-32 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Escaneie este código com seu WhatsApp
              </p>
              <p className="text-xs text-muted-foreground">
                1. Abra o WhatsApp no seu celular<br />
                2. Vá em Configurações {' > '} Dispositivos conectados<br />
                3. Toque em "Conectar dispositivo"<br />
                4. Escaneie este código
              </p>
            </div>
            <Button 
              onClick={() => selectedQRSession && handleGenerateQRCode(selectedQRSession)}
              disabled={generateQRCode.isPending}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Gerar Novo QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
