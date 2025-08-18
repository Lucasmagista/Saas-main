import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, 
  PhoneMissed, 
  PhoneIncoming, 
  PhoneOutgoing,
  Video,
  Mic,
  MicOff,
  Volume2,
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  Play,
  Download,
  Star,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInteractions, useCreateInteraction } from "@/hooks/useAdvancedCRM";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContactData {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  email: string;
}

interface CallData {
  id: string;
  contact: string;
  phone: string;
  avatar: string | null;
  type: 'incoming' | 'outgoing' | 'missed';
  status: 'completed' | 'missed' | 'ongoing';
  duration: string;
  timestamp: string;
  recording: boolean;
}

interface ScheduledCall {
  id: string;
  contact: string;
  participants: string[];
  time: string;
  duration: string;
  type: 'video' | 'audio';
  status: 'upcoming' | 'ongoing' | 'completed';
}

export function CallCenter() {
  const { toast } = useToast();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [callHistory, setCallHistory] = useState<CallData[]>([]);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCallContact, setActiveCallContact] = useState<{name: string, phone: string, avatar?: string}>({
    name: '',
    phone: '',
    avatar: undefined
  });

  const { data: interactions, isLoading: loadingInteractions } = useInteractions();
  const createInteractionMutation = useCreateInteraction();

  // Função para buscar contatos reais do Supabase
  const fetchContacts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url, email')
        .not('phone', 'is', null)
        .limit(20);

      if (error) throw error;
      
      setContacts(data || []);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      toast({
        title: "Erro ao carregar contatos",
        description: "Não foi possível carregar a lista de contatos.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Função para carregar histórico de chamadas dos interactions
  const loadCallHistory = useCallback(() => {
    if (!interactions) return;

    const callInteractions = interactions
      .filter(interaction => interaction.type === 'call')
      .map(interaction => ({
        id: interaction.id,
        contact: interaction.metadata?.contact_name || 'Contato',
        phone: interaction.metadata?.phone || '',
        avatar: interaction.metadata?.avatar_url || null,
        type: (interaction.metadata?.call_type || 'outgoing') as 'incoming' | 'outgoing' | 'missed',
        status: (interaction.completed_at ? 'completed' : 'missed') as 'completed' | 'missed' | 'ongoing',
        duration: interaction.duration ? `${Math.floor(interaction.duration / 60)}m ${interaction.duration % 60}s` : '-',
        timestamp: format(new Date(interaction.created_at), "dd/MM/yyyy, HH:mm", { locale: ptBR }),
        recording: interaction.metadata?.has_recording || false
      }));

    setCallHistory(callInteractions);
  }, [interactions]);

  // Função para carregar chamadas agendadas
  const loadScheduledCalls = useCallback(() => {
    if (!interactions) return;

    const scheduled = interactions
      .filter(interaction => interaction.type === 'meeting' && interaction.scheduled_at && !interaction.completed_at)
      .map(interaction => ({
        id: interaction.id,
        contact: interaction.subject || 'Reunião',
        participants: interaction.metadata?.participants || ['Participante'],
        time: format(new Date(interaction.scheduled_at), "HH:mm", { locale: ptBR }),
        duration: interaction.metadata?.duration || '30 min',
        type: (interaction.metadata?.call_type || 'video') as 'video' | 'audio',
        status: 'upcoming' as const
      }));

    setScheduledCalls(scheduled);
  }, [interactions]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    loadCallHistory();
    loadScheduledCalls();
    setLoading(loadingInteractions);
  }, [interactions, loadingInteractions, loadCallHistory, loadScheduledCalls]);

  const renderCallHistoryContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      );
    }

    if (callHistory.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Nenhuma chamada encontrada</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {callHistory
          .filter(call => 
            searchTerm === "" || 
            call.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.phone.includes(searchTerm)
          )
          .map((call) => (
            <div key={call.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
              <div className="flex-shrink-0">
                {getCallIcon(call.type, call.status)}
              </div>
              <Avatar className="w-10 h-10">
                <AvatarImage src={call.avatar || undefined} />
                <AvatarFallback>
                  {call.contact.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                <Button variant="ghost" size="sm" onClick={() => startCall(call.contact, call.phone, call.avatar || undefined)}>
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    );
  };

  const renderContactsContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Carregando contatos...</p>
        </div>
      );
    }

    if (contacts.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Nenhum contato encontrado</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {contacts.map((contact) => (
          <div key={contact.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
            <Avatar className="w-10 h-10">
              <AvatarImage src={contact.avatar_url || undefined} />
              <AvatarFallback>
                {contact.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium">{contact.full_name || 'Sem nome'}</h4>
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
              <p className="text-xs text-muted-foreground">{contact.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Star className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => startCall(contact.full_name || 'Contato', contact.phone || undefined, contact.avatar_url || undefined)}
              >
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
    );
  };

  const renderScheduledCallsContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Carregando reuniões...</p>
        </div>
      );
    }

    if (scheduledCalls.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Nenhuma chamada agendada</p>
        </div>
      );
    }

    return (
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
    );
  };

  const getCallIcon = (type: string, status: string) => {
    if (status === "missed") return <PhoneMissed className="w-4 h-4 text-red-500" />;
    if (type === "incoming") return <PhoneIncoming className="w-4 h-4 text-green-500" />;
    if (type === "outgoing") return <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
    return <Phone className="w-4 h-4 text-muted-foreground" />;
  };

  const startCall = (contact: string, phone?: string, avatar?: string) => {
    setIsCallActive(true);
    setActiveCallContact({
      name: contact,
      phone: phone || '',
      avatar: avatar
    });
    
    // Criar uma nova interação de chamada
    createInteractionMutation.mutate({
      organization_id: '', // Será preenchido com a organização do usuário
      lead_id: '', // Pode ser vinculado a um lead
      opportunity_id: '', 
      user_id: '', // Será preenchido com o ID do usuário atual
      type: 'call',
      subject: `Chamada para ${contact}`,
      content: '',
      duration: 0,
      outcome: '',
      next_action: '',
      scheduled_at: new Date().toISOString(),
      completed_at: '',
      metadata: {
        contact_name: contact,
        phone: phone || '',
        call_type: 'outgoing',
        call_status: 'ongoing'
      }
    });

    toast({
      title: "Chamada iniciada",
      description: `Ligando para ${contact}...`,
    });
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsMuted(false);
    setActiveCallContact({ name: '', phone: '', avatar: undefined });
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
                  <AvatarImage src={activeCallContact.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {activeCallContact.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{activeCallContact.name || 'Contato'}</h3>
                <p className="text-muted-foreground">{activeCallContact.phone}</p>
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
                {renderCallHistoryContent()}
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
                {renderContactsContent()}
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
              {renderScheduledCallsContent()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}