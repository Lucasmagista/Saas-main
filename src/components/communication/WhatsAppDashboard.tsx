"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// IMPORTS DE ÍCONES (lucide-react)
import { 
  Archive, Bot, CheckCircle, Edit, Filter, Loader2, MessageCircle, MoreVertical, 
  Paperclip, Phone, Plus, QrCode, RotateCcw, Search, Send, Settings, Smile, 
  Star, Trash2, Video, Wifi, WifiOff, Zap 
} from "lucide-react";

// IMPORTS DE COMPONENTES UI (Shadcn/UI)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

// IMPORTS DE HOOKS E COMPONENTES CUSTOMIZADOS (Caminhos de exemplo)
import { useAuth } from "@/hooks/useAuth";
import { useConversations, useSendMessage } from "@/hooks/useConversations";
import { useWhatsAppSessions, useCreateWhatsAppSession, useGenerateQRCode } from "@/hooks/useWhatsAppIntegration";
import { useWhatsAppMessages } from "@/hooks/useWhatsAppMessages";
import { useBots } from "@/hooks/useBots";
import { WhatsAppChatArea } from "./WhatsAppChatArea"; // Supondo que este componente exista

// DEFINIÇÕES DE TIPO
type WhatsAppFilters = {
  number?: string;
  date?: string;
  bot_id?: string;
  status?: string;
};

type WhatsAppSession = {
  id: string;
  name: string;
  phone_number: string;
  status: string;
  last_activity: string;
  bot_id?: string | null;
};

type WhatsAppSessionWithBot = WhatsAppSession;

type EditSession = {
  id: string;
  name: string;
  phone_number: string;
  bot_id?: string | null;
} | null;


export default function WhatsAppPage() {
  // HOOKS
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hooks de dados (React Query)
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: whatsappSessions, isLoading: sessionsLoading } = useWhatsAppSessions();
  const { data: bots, isLoading: botsLoading } = useBots();
  const onlineUsers = {}; // Placeholder for onlineUsers since useRealTimeConversations is removed
  const sendMessage = useSendMessage();
  const createSession = useCreateWhatsAppSession();
  const generateQRCode = useGenerateQRCode();
  
  // Hook integrado do WhatsApp para mensagens em tempo real
  const {
    messages: whatsappMessages,
    isConnected: whatsappConnected,
    applyFilters,
    clearFilters
  } = useWhatsAppMessages(); // Assumindo que o filtro é aplicado globalmente ou gerenciado dentro do hook

  // ESTADOS (useState)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<string>("");

  // Estados para modais de Sessão
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionPhone, setNewSessionPhone] = useState("");
  
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedQRSession, setSelectedQRSession] = useState<string | null>(null);

  // Estados para edição e exclusão de sessão
  const [editSession, setEditSession] = useState<EditSession>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Estados para filtros avançados
  const [filters, setFilters] = useState<WhatsAppFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // EFEITOS (useEffect)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [whatsappMessages, selectedConversation]); // Atualizado para reagir às mensagens também

  // DADOS DERIVADOS E FILTROS
  const whatsappConversations = conversations?.filter(conv => conv.channel === 'whatsapp') || [];
  const selectedConv = whatsappConversations.find(c => c.id === selectedConversation);

  const filteredConversations = whatsappConversations.filter(conv =>
    conv.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lead?.phone?.includes(searchTerm)
  );

  const filteredSessions = (whatsappSessions || []).filter(session => {
    if (filters.bot_id && session.bot_id !== filters.bot_id) return false;
    if (filters.status && session.status !== filters.status) return false;
    if (filters.number && !session.phone_number?.includes(filters.number)) return false;
    if (filters.date && !session.last_activity?.startsWith(filters.date)) return false;
    return true;
  });

  // Estatísticas do Header
  const activeSessions = whatsappSessions?.filter(s => s.status === 'connected').length || 0;
  const totalConversations = whatsappConversations.length;
  const activeBots = bots?.filter(b => b.is_active && b.channel === 'whatsapp').length || 0;

  // FUNÇÕES DE MANIPULAÇÃO DE EVENTOS (HANDLERS)
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
      toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' });
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim() || !newSessionPhone.trim()) {
      toast({ title: 'Erro', description: 'Preencha todos os campos.', variant: 'destructive' });
      return;
    }
    try {
      await createSession.mutateAsync({ name: newSessionName, phone_number: newSessionPhone });
      setNewSessionName("");
      setNewSessionPhone("");
      setShowNewSession(false);
      toast({ title: 'Sessão criada com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast({ title: 'Erro ao criar sessão', variant: 'destructive' });
    }
  };

  const handleGenerateQRCode = async (sessionId: string) => {
    try {
      await generateQRCode.mutateAsync(sessionId);
      setSelectedQRSession(sessionId);
      setShowQRCode(true);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({ title: 'Erro ao gerar QR Code', variant: 'destructive' });
    }
  };

  const handleEditSession = (session: WhatsAppSessionWithBot) => {
    setEditSession({
      id: session.id,
      name: session.name,
      phone_number: session.phone_number,
      bot_id: session.bot_id || null,
    });
    setShowEditModal(true);
  };

  const handleEditSessionSave = async () => {
    if (!editSession) return;
    setEditLoading(true);
    try {
      await axios.put(`/api/multisessions/${editSession.id}`, {
        name: editSession.name,
        phone_number: editSession.phone_number,
        bot_id: editSession.bot_id || null,
      });
      toast({ title: 'Sessão atualizada com sucesso!' });
      setShowEditModal(false);
      // Opcional: invalidar a query de sessões para buscar os dados atualizados
    } catch (error) {
      toast({ title: 'Erro ao atualizar sessão', variant: 'destructive' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!deleteSessionId) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/multisessions/${deleteSessionId}`);
      toast({ title: 'Sessão excluída com sucesso!' });
      setDeleteSessionId(null);
       // Opcional: invalidar a query de sessões para buscar os dados atualizados
    } catch (error) {
      toast({ title: 'Erro ao excluir sessão', variant: 'destructive' });
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleApplyFilters = () => {
    // A lógica de filtragem já está sendo aplicada na constante `filteredSessions`
    // Esta função apenas fecha o modal
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setShowFilters(false);
  };

  // FUNÇÕES HELPER
  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-500";
      case "connecting": return "bg-yellow-500";
      case "disconnected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // RENDERIZAÇÃO DE LOADING
  if (conversationsLoading || sessionsLoading || botsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={`skeleton-card-${idx}`}><CardContent className="p-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-6 w-16" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="col-span-1">
            <CardHeader><Skeleton className="h-5 w-32 mb-4" /></CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`skeleton-list-${i}`} className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><div className="flex-1 space-y-1"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-32" /></div></div>
              ))}
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><Skeleton className="h-5 w-40 mb-4" /></CardHeader>
            <CardContent className="flex flex-col h-96 justify-between"><div className="flex-1 space-y-2 overflow-y-auto">{Array.from({ length: 6 }).map((_, i) => (<Skeleton key={`skeleton-msg-${i}`} className="h-5 w-full" />))}</div><div className="mt-4"><Skeleton className="h-10 w-full" /></div></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // RENDERIZAÇÃO PRINCIPAL
  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <div className="flex items-center gap-1"><Wifi className="h-4 w-4 text-muted-foreground" />{whatsappConnected && <div className="w-2 h-2 bg-green-500 rounded-full" />}</div>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{activeSessions}</div><p className="text-xs text-muted-foreground">{whatsappSessions?.length || 0} total</p>{whatsappConnected && (<div className="flex items-center gap-1 mt-1"><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-xs text-green-600">Tempo real ativo</span></div>)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle><MessageCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalConversations}</div><p className="text-xs text-muted-foreground">WhatsApp</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Bots Ativos</CardTitle><Bot className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{activeBots}</div><p className="text-xs text-muted-foreground">Respondendo automaticamente</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{whatsappMessages?.length || 0}</div><p className="text-xs text-muted-foreground">Últimas 24h</p></CardContent>
        </Card>
      </div>

      {/* Sessões WhatsApp */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Sessões WhatsApp</CardTitle><CardDescription>Gerencie suas conexões do WhatsApp</CardDescription></div>
            <div className="flex items-center gap-2">
              <Dialog open={showFilters} onOpenChange={setShowFilters}>
                <DialogTrigger asChild><Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filtros</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Filtros Avançados</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label htmlFor="filter-number">Filtrar por número</Label><Input id="filter-number" placeholder="Ex: 5511999999999" value={filters.number || ''} onChange={(e) => setFilters(prev => ({ ...prev, number: e.target.value }))} /></div>
                    <div><Label htmlFor="filter-date">Filtrar por data</Label><Input id="filter-date" type="date" value={filters.date || ''} onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))} /></div>
                    <div>
                      <Label htmlFor="filter-bot">Filtrar por Bot</Label>
                      <select
                        id="filter-bot"
                        aria-label="Filtrar por Bot"
                        className="w-full border rounded px-2 py-1 h-10"
                        value={filters.bot_id || ''}
                        onChange={e => setFilters(prev => ({ ...prev, bot_id: e.target.value }))}
                      >
                        <option value="">Todos</option>
                        {bots?.map(bot => (<option key={bot.id} value={bot.id}>{bot.name}</option>))}
                      </select>
                    </div>
                    <div className="flex gap-2"><Button onClick={handleApplyFilters} className="flex-1">Aplicar Filtros</Button><Button onClick={handleClearFilters} variant="outline" className="flex-1">Limpar</Button></div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showNewSession} onOpenChange={setShowNewSession}>
                <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Nova Sessão</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Criar Nova Sessão WhatsApp</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label htmlFor="session-name">Nome da Sessão</Label><Input id="session-name" value={newSessionName} onChange={(e) => setNewSessionName(e.target.value)} placeholder="Ex: Atendimento Principal" /></div>
                    <div><Label htmlFor="session-phone">Número do WhatsApp</Label><Input id="session-phone" value={newSessionPhone} onChange={(e) => setNewSessionPhone(e.target.value)} placeholder="+55 11 99999-9999" /></div>
                    <Button onClick={handleCreateSession} disabled={createSession.isPending} className="w-full">{createSession.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Sessão'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => {
              const sessionWithBot = session as WhatsAppSessionWithBot;
              return (
                <Card key={sessionWithBot.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(sessionWithBot.status)}`} />
                        <div>
                          <h4 className="font-semibold">{sessionWithBot.name}</h4><p className="text-sm text-muted-foreground">{sessionWithBot.phone_number}</p>
                          <div className="flex items-center gap-2 mt-1"><span className="text-xs text-muted-foreground">Bot:</span><span className="text-xs font-medium">{sessionWithBot.bot_id ? (bots?.find(b => b.id === sessionWithBot.bot_id)?.name || 'Atribuído') : 'Nenhum'}</span></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditSession(sessionWithBot)} title="Editar sessão"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteSessionId(sessionWithBot.id)} title="Excluir sessão"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(sessionWithBot.last_activity), { addSuffix: true, locale: ptBR })}</span>
                      <Button variant="outline" size="sm" onClick={() => handleGenerateQRCode(sessionWithBot.id)}><QrCode className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interface de Chat Unificada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Lista de Conversas */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between"><CardTitle className="text-lg">Conversas</CardTitle><div className="flex items-center gap-2">{whatsappConnected ? (<Badge variant="default" className="text-xs"><Wifi className="w-3 h-3 mr-1" />Online</Badge>) : (<Badge variant="secondary" className="text-xs"><WifiOff className="w-3 h-3 mr-1" />Offline</Badge>)}<Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button></div></div>
            <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar conversas..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          </CardHeader>
          <CardContent className="p-0 flex-1"><ScrollArea className="h-[450px]">
            <div className="space-y-1 p-3">
              <button type="button" className={`w-full text-left p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation === null ? "bg-accent" : "hover:bg-muted/50"}`} onClick={() => { setSelectedConversation(null); setSelectedNumber(""); }}>
                <div className="flex items-start gap-3"><Avatar className="w-10 h-10"><AvatarFallback><MessageCircle className="w-5 h-5" /></AvatarFallback></Avatar><div className="flex-1 min-w-0"><h4 className="font-medium text-sm">Chat Direto</h4><p className="text-xs text-muted-foreground">Enviar mensagem para qualquer número</p><Badge variant="outline" className="text-xs mt-1"><Bot className="w-3 h-3 mr-1" />API Direta</Badge></div></div>
              </button>
              <Separator className="my-2" />
              {filteredConversations.map((conversation) => (
                <button type="button" key={conversation.id} className={`w-full text-left p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation === conversation.id ? "bg-accent" : "hover:bg-muted/50"}`} onClick={() => setSelectedConversation(conversation.id)}>
                  <div className="flex items-start gap-3">
                    <div className="relative"><Avatar className="w-10 h-10"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.lead?.name}`} /><AvatarFallback>{conversation.lead?.name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback></Avatar></div>
                    <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><h4 className="font-medium text-sm truncate">{conversation.lead?.name || 'Sem nome'}</h4><span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true, locale: ptBR })}</span></div><p className="text-xs text-muted-foreground truncate mt-1">{conversation.lead?.phone || 'Sem telefone'}</p>{conversation.tags && conversation.tags.length > 0 && (<div className="flex gap-1 mt-2">{conversation.tags.slice(0, 2).map((tag) => (<Badge key={`tag-${conversation.id}-${tag}`} variant="secondary" className="text-xs px-1 py-0">{tag}</Badge>))}</div>)}</div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea></CardContent>
        </Card>

        {/* Área de Chat Unificada */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="relative"><Avatar className="w-10 h-10"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConv?.lead?.name}`} /><AvatarFallback>{selectedConv?.lead?.name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback></Avatar></div><div><h3 className="font-semibold">{selectedConv?.lead?.name || 'Sem nome'}</h3><p className="text-sm text-muted-foreground">{selectedConv?.lead?.phone || 'Sem telefone'}</p></div></div><div className="flex items-center gap-2"><Button variant="ghost" size="sm"><Phone className="w-4 h-4" /></Button><Button variant="ghost" size="sm"><Video className="w-4 h-4" /></Button><Button variant="ghost" size="sm"><Archive className="w-4 h-4" /></Button><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></div></div></CardHeader>
              <Separator />
              <CardContent className="flex-1 p-4 flex flex-col"><ScrollArea className="flex-1 pr-4"><div className="space-y-4"><div className="text-center text-muted-foreground py-8"><MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Chat de conversa em desenvolvimento</p><p className="text-sm">Use o "Chat Direto" para funcionalidade completa</p></div></div><div ref={messagesEndRef} /></ScrollArea>
                <div className="border-t pt-4">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2"><Button type="button" variant="ghost" size="sm"><Paperclip className="w-4 h-4" /></Button><Input placeholder="Digite sua mensagem..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1" /><Button variant="ghost" size="sm" type="button"><Smile className="w-4 h-4" /></Button><Button variant="ghost" size="sm" type="button"><Bot className="w-4 h-4" /></Button><Button type="submit" size="sm" disabled={!newMessage.trim() || sendMessage.isPending}><Send className="w-4 h-4" /></Button></form>
                  <div className="flex items-center gap-2 mt-3"><Button variant="outline" size="sm"><Zap className="w-3 h-3 mr-1" />Template</Button><Button variant="outline" size="sm"><Bot className="w-3 h-3 mr-1" />Bot</Button><Button variant="outline" size="sm"><Star className="w-3 h-3 mr-1" />Favoritar</Button></div>
                </div>
              </CardContent>
            </>
          ) : (
            <WhatsAppChatArea selectedNumber={selectedNumber} onNumberChange={setSelectedNumber} />
          )}
        </Card>
      </div>

      {/* MODAIS */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Sessão WhatsApp</DialogTitle></DialogHeader>
          {editSession && (
            <div className="space-y-4">
              <div><Label htmlFor="edit-session-name">Nome da Sessão</Label><Input id="edit-session-name" value={editSession.name} onChange={e => setEditSession((s) => s ? { ...s, name: e.target.value } : s)} /></div>
              <div><Label htmlFor="edit-session-phone">Número do WhatsApp</Label><Input id="edit-session-phone" value={editSession.phone_number} onChange={e => setEditSession((s) => s ? { ...s, phone_number: e.target.value } : s)} /></div>
              <div><Label htmlFor="edit-session-bot">Atribuir Bot</Label>
                <select id="edit-session-bot" className="w-full border rounded px-2 py-1 h-10" value={editSession.bot_id || ''} aria-label="Atribuir Bot" onChange={e => setEditSession((s) => s ? { ...s, bot_id: e.target.value || null } : s)}>
                  <option value="">Nenhum</option>{bots?.map(bot => (<option key={bot.id} value={bot.id}>{bot.name}</option>))}
                </select>
              </div>
              <DialogFooter><Button onClick={handleEditSessionSave} disabled={editLoading}>{editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}</Button></DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteSessionId} onOpenChange={v => { if (!v) setDeleteSessionId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Excluir Sessão</DialogTitle></DialogHeader>
          <p>Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.</p>
          <DialogFooter><Button variant="destructive" onClick={handleDeleteSession} disabled={deleteLoading}>{deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}</Button><Button variant="outline" onClick={() => setDeleteSessionId(null)} disabled={deleteLoading}>Cancelar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader><DialogTitle>QR Code WhatsApp</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center"><QrCode className="w-32 h-32 text-gray-400" /></div>
            <div className="text-center"><p className="text-sm text-muted-foreground mb-2">Escaneie este código com seu WhatsApp</p><p className="text-xs text-muted-foreground">1. Abra o WhatsApp no seu celular<br />2. Vá em Configurações {' > '} Dispositivos conectados<br />3. Toque em "Conectar dispositivo"<br />4. Escaneie este código</p></div>
            <Button onClick={() => selectedQRSession && handleGenerateQRCode(selectedQRSession)} disabled={generateQRCode.isPending}><RotateCcw className="w-4 h-4 mr-2" />Gerar Novo QR Code</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}