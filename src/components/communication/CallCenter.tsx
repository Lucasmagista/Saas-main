import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, 
  PhoneCall, 
  PhoneMissed, 
  PhoneIncoming, 
  PhoneOutgoing,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  Play,
  Pause,
  Download,
  Star,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CallCenter() {
  const { toast } = useToast();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock call history data
  const callHistory = [
    {
      id: "1",
      contact: "Ana Silva",
      phone: "+55 11 99999-9999",
      avatar: "/placeholder.svg",
      type: "incoming",
      status: "completed",
      duration: "5m 32s",
      timestamp: "Hoje, 14:32",
      recording: true
    },
    {
      id: "2",
      contact: "João Santos",
      phone: "+55 21 88888-8888",
      avatar: "/placeholder.svg",
      type: "outgoing",
      status: "completed",
      duration: "12m 15s",
      timestamp: "Hoje, 13:45",
      recording: true
    },
    {
      id: "3",
      contact: "Maria Costa",
      phone: "+55 11 77777-7777",
      avatar: "/placeholder.svg",
      type: "missed",
      status: "missed",
      duration: "-",
      timestamp: "Hoje, 12:20",
      recording: false
    },
    {
      id: "4",
      contact: "Carlos Oliveira",
      phone: "+55 85 66666-6666",
      avatar: "/placeholder.svg",
      type: "incoming",
      status: "completed",
      duration: "8m 43s",
      timestamp: "Ontem, 16:30",
      recording: true
    }
  ];

  // Mock scheduled calls
  const scheduledCalls = [
    {
      id: "1",
      contact: "Reunião Vendas",
      participants: ["Ana Silva", "João Santos", "Maria Costa"],
      time: "15:30",
      duration: "30 min",
      type: "video",
      status: "upcoming"
    },
    {
      id: "2",
      contact: "Demo Cliente",
      participants: ["Pedro Lima"],
      time: "16:00",
      duration: "45 min",
      type: "video",
      status: "upcoming"
    }
  ];

  const getCallIcon = (type: string, status: string) => {
    if (status === "missed") return <PhoneMissed className="w-4 h-4 text-red-500" />;
    if (type === "incoming") return <PhoneIncoming className="w-4 h-4 text-green-500" />;
    if (type === "outgoing") return <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
    return <Phone className="w-4 h-4 text-muted-foreground" />;
  };

  const startCall = (contact: string) => {
    setIsCallActive(true);
    toast({
      title: "Chamada iniciada",
      description: `Ligando para ${contact}...`,
    });
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsMuted(false);
    toast({
      title: "Chamada encerrada",
      description: "A chamada foi finalizada.",
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Microfone ativado" : "Microfone desativado",
      description: isMuted ? "Você pode falar agora." : "Seu microfone está mudo.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Active Call Interface */}
      {isCallActive && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-2xl">AS</AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Ana Silva</h3>
                <p className="text-muted-foreground">+55 11 99999-9999</p>
                <p className="text-sm text-primary font-medium">Conectando...</p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="lg"
                  onClick={toggleMute}
                  className="rounded-full w-12 h-12"
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endCall}
                  className="rounded-full w-16 h-16"
                >
                  <Phone className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12"
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
        </TabsList>

        {/* Call History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Histórico de Chamadas</CardTitle>
                  <CardDescription>Todas as suas chamadas recentes</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar chamadas..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {callHistory.map((call) => (
                    <div key={call.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex-shrink-0">
                        {getCallIcon(call.type, call.status)}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={call.avatar} />
                        <AvatarFallback>
                          {call.contact.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{call.contact}</h4>
                          <span className="text-xs text-muted-foreground">{call.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{call.phone}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={call.status === "missed" ? "destructive" : "secondary"} className="text-xs">
                            {call.status === "missed" ? "Perdida" : "Completada"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{call.duration}</span>
                          {call.recording && (
                            <Badge variant="outline" className="text-xs">
                              Gravada
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {call.recording && (
                          <Button variant="ghost" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => startCall(call.contact)}>
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Video className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contatos</CardTitle>
                  <CardDescription>Lista de contatos para chamadas</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Contato
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contatos..."
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {callHistory.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback>
                          {contact.contact.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{contact.contact}</h4>
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => startCall(contact.contact)}>
                          <Phone className="w-4 h-4 mr-2" />
                          Ligar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="w-4 h-4 mr-2" />
                          Vídeo
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Calls */}
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Chamadas Agendadas</CardTitle>
                  <CardDescription>Próximas reuniões e chamadas</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Chamada
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledCalls.map((call) => (
                  <div key={call.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {call.type === "video" ? (
                            <Video className="w-5 h-5 text-primary" />
                          ) : (
                            <Phone className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{call.contact}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {call.time} - {call.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {call.participants.length} participantes
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Reagendar
                        </Button>
                        <Button size="sm">
                          <Video className="w-4 h-4 mr-2" />
                          Entrar
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">
                        Participantes: {call.participants.join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}