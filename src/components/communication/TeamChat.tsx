import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Plus,
  Users,
  Hash,
  AtSign,
  Star,
  Settings,
  Filter,
  Phone,
  Video,
  Archive,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function TeamChat() {
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<string | null>("general");
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for team channels and direct messages
  const channels = [
    {
      id: "general",
      name: "geral",
      type: "channel",
      unreadCount: 3,
      lastMessage: "João: Ótimo trabalho na apresentação!",
      timestamp: "14:32",
      members: 12,
      avatar: null
    },
    {
      id: "dev",
      name: "desenvolvimento",
      type: "channel", 
      unreadCount: 0,
      lastMessage: "Ana: Deploy realizado com sucesso",
      timestamp: "13:45",
      members: 8,
      avatar: null
    },
    {
      id: "design",
      name: "design",
      type: "channel",
      unreadCount: 1,
      lastMessage: "Maria: Novos protótipos prontos",
      timestamp: "12:30",
      members: 5,
      avatar: null
    }
  ];

  const directMessages = [
    {
      id: "ana",
      name: "Ana Silva",
      type: "dm",
      avatar: "/placeholder.svg",
      status: "online",
      unreadCount: 2,
      lastMessage: "Podemos revisar aquele documento?",
      timestamp: "14:15"
    },
    {
      id: "joao",
      name: "João Santos", 
      type: "dm",
      avatar: "/placeholder.svg",
      status: "away",
      unreadCount: 0,
      lastMessage: "Perfeito, obrigado pela ajuda!",
      timestamp: "11:45"
    },
    {
      id: "maria",
      name: "Maria Costa",
      type: "dm", 
      avatar: "/placeholder.svg",
      status: "offline",
      unreadCount: 0,
      lastMessage: "Vou enviar os arquivos amanhã",
      timestamp: "Ontem"
    }
  ];

  // Mock messages for selected chat
  const messages = [
    {
      id: 1,
      user: "Ana Silva",
      avatar: "/placeholder.svg",
      message: "Pessoal, como estão os preparativos para a apresentação de amanhã?",
      timestamp: "14:20",
      type: "text"
    },
    {
      id: 2,
      user: "João Santos",
      avatar: "/placeholder.svg",
      message: "Já finalizei minha parte! Os slides estão no drive.",
      timestamp: "14:22",
      type: "text"
    },
    {
      id: 3,
      user: "Você",
      avatar: "/placeholder.svg",
      message: "Excelente! Vou revisar agora.",
      timestamp: "14:25",
      type: "sent"
    },
    {
      id: 4,
      user: "Maria Costa",
      avatar: "/placeholder.svg", 
      message: "📎 apresentacao-final.pptx",
      timestamp: "14:28",
      type: "file"
    },
    {
      id: 5,
      user: "João Santos",
      avatar: "/placeholder.svg",
      message: "Ótimo trabalho na apresentação! 👏",
      timestamp: "14:32",
      type: "text"
    }
  ];

  const teamMembers = [
    {
      id: "1",
      name: "Ana Silva",
      role: "Product Manager",
      avatar: "/placeholder.svg",
      status: "online",
      lastSeen: "Agora"
    },
    {
      id: "2", 
      name: "João Santos",
      role: "Developer",
      avatar: "/placeholder.svg",
      status: "away",
      lastSeen: "5 min atrás"
    },
    {
      id: "3",
      name: "Maria Costa", 
      role: "Designer",
      avatar: "/placeholder.svg",
      status: "offline",
      lastSeen: "2 horas atrás"
    },
    {
      id: "4",
      name: "Carlos Oliveira",
      role: "QA Engineer", 
      avatar: "/placeholder.svg",
      status: "online",
      lastSeen: "Agora"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500"; 
      case "offline": return "bg-muted";
      default: return "bg-muted";
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada para o chat da equipe.",
      });
      setNewMessage("");
    }
  };

  const allChats = [...channels, ...directMessages];
  const filteredChats = allChats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChatData = allChats.find(c => c.id === selectedChat);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
      {/* Sidebar with Channels and DMs */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chat da Equipe</CardTitle>
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
          <ScrollArea className="h-[650px]">
            <div className="p-3 space-y-4">
              {/* Channels Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Canais
                  </h4>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {channels.filter(channel => 
                    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((channel) => (
                    <div
                      key={channel.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedChat === channel.id 
                          ? "bg-accent" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedChat(channel.id)}
                    >
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {channel.name}
                          </span>
                          {channel.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0">
                              {channel.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {channel.members} membros
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Direct Messages Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Mensagens Diretas
                  </h4>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {directMessages.filter(dm => 
                    dm.name.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((dm) => (
                    <div
                      key={dm.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedChat === dm.id 
                          ? "bg-accent" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedChat(dm.id)}
                    >
                    <div className="relative">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={dm.type === 'dm' ? dm.avatar : '/placeholder.svg'} />
                        <AvatarFallback className="text-xs">
                          {dm.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {dm.type === 'dm' && (
                        <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-background ${getStatusColor((dm as any).status)}`} />
                      )}
                    </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {dm.name}
                          </span>
                          {dm.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0">
                              {dm.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-2 flex flex-col">
        {selectedChatData ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedChatData.type === "channel" ? (
                    <div className="p-2 bg-muted rounded-lg">
                      <Hash className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedChatData.avatar} />
                        <AvatarFallback>
                          {selectedChatData.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor((selectedChatData as any).status)}`} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {selectedChatData.type === "channel" ? `#${selectedChatData.name}` : selectedChatData.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChatData.type === "channel" 
                        ? `${(selectedChatData as any).members} membros`
                        : (selectedChatData as any).status
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedChatData.type === "dm" && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <Separator />

            {/* Messages Area */}
            <CardContent className="flex-1 p-4">
              <ScrollArea className="h-[450px] pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start gap-3 max-w-[70%] ${message.type === 'sent' ? 'flex-row-reverse' : ''}`}>
                        {message.type !== 'sent' && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.avatar} />
                            <AvatarFallback className="text-xs">
                              {message.user.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          {message.type !== 'sent' && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">{message.user}</span>
                              <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                            </div>
                          )}
                          <div className={`p-3 rounded-lg ${
                            message.type === 'sent' 
                              ? 'bg-primary text-primary-foreground' 
                              : message.type === 'file'
                              ? 'bg-muted border'
                              : 'bg-muted'
                          }`}>
                            {message.type === 'file' ? (
                              <div className="flex items-center gap-2">
                                <Paperclip className="w-4 h-4" />
                                <span className="text-sm">{message.message}</span>
                              </div>
                            ) : (
                              <p className="text-sm">{message.message}</p>
                            )}
                            {message.type === 'sent' && (
                              <p className="text-xs text-primary-foreground/70 mt-1 text-right">
                                {message.timestamp}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder={`Enviar para ${selectedChatData.type === 'channel' ? `#${selectedChatData.name}` : selectedChatData.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button variant="ghost" size="sm">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <AtSign className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecione um chat</h3>
              <p className="text-muted-foreground">
                Escolha um canal ou conversa direta para começar
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Team Members */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Equipe Online</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[650px]">
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{member.name}</h4>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                    <p className="text-xs text-muted-foreground">{member.lastSeen}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}