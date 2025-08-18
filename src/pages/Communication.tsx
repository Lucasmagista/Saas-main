
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Video, 
  Users, 
  Settings, 
  Plus,
  Bot,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Activity
} from "lucide-react";
import WhatsAppDashboard from "@/components/communication/WhatsAppDashboard";
import { EmailCenter } from "@/components/communication/EmailCenter";
import { TeamChat } from "@/components/communication/TeamChat";
import { CallCenter } from "@/components/communication/CallCenter";
import { NotificationCenter } from "@/components/communication/NotificationCenter";
import { CommunicationAnalytics } from "@/components/communication/CommunicationAnalytics";
import { CommunicationSettings } from "@/components/communication/CommunicationSettings";
import { 
  NewConversationModal, 
  VideoCallModal 
} from "@/components/communication/CommunicationModals";
import { useConversations } from "@/hooks/useConversations";
import { useWhatsAppSessions } from "@/hooks/useWhatsAppIntegration";
import { useBots } from "@/hooks/useBots";

const Communication = () => {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [showSettings, setShowSettings] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const { data: conversations } = useConversations();
  const { data: whatsappSessions } = useWhatsAppSessions();
  const { data: bots } = useBots();

  // Estatísticas calculadas
  const whatsappConversations = conversations?.filter(conv => conv.channel === 'whatsapp').length || 0;
  const totalConversations = conversations?.length || 0;
  const activeSessions = whatsappSessions?.filter(session => session.status === 'connected').length || 0;
  const activeBots = bots?.filter(bot => bot.is_active).length || 0;

  // Communication stats baseados em dados reais. Exibimos apenas contadores, sem tendências estáticas.
  const stats = [
    {
      title: "Conversas WhatsApp",
      value: whatsappConversations.toString(),
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Sessões Ativas",
      value: activeSessions.toString(),
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Bots Ativos",
      value: activeBots.toString(),
      icon: Bot,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Total de Conversas",
      value: totalConversations.toString(),
      icon: Users,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Central de Comunicação</h1>
            <p className="text-muted-foreground mt-1">
              WhatsApp, Email, Chat interno e chamadas em uma plataforma unificada
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowVideoCall(true)}
            >
              <Video className="w-4 h-4 mr-2" />
              Videochamada
            </Button>
            <Button 
              size="sm"
              onClick={() => setShowNewConversation(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Conversa
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Communication Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-fit">
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="calls" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Chamadas</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="whatsapp" className="space-y-6">
            <WhatsAppDashboard />
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <EmailCenter />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <TeamChat />
          </TabsContent>

          <TabsContent value="calls" className="space-y-6">
            <CallCenter />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <CommunicationAnalytics />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <CommunicationSettings />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <NewConversationModal 
          open={showNewConversation} 
          onOpenChange={setShowNewConversation} 
        />
        <VideoCallModal 
          open={showVideoCall} 
          onOpenChange={setShowVideoCall} 
        />
      </div>
    </div>
  );
};

export default Communication;
