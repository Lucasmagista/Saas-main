
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Mail, 
  User,
  Bot,
  MessageSquare,
  Clock,
  CheckCheck,
  Check,
  Mic,
  Image,
  FileText,
  Play,
  Pause
} from 'lucide-react';
import { useMessages, useSendMessage } from '@/hooks/useConversations';
import { useTemplates } from '@/hooks/useTemplates';
import { useBots } from '@/hooks/useBots';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

interface WhatsAppConversationViewProps {
  conversation: any;
}

export const WhatsAppConversationView = ({ conversation }: WhatsAppConversationViewProps) => {
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedBot, setSelectedBot] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { data: messages, isLoading: messagesLoading } = useMessages(conversation.id);
  const { data: templates } = useTemplates('whatsapp');
  const { data: bots } = useBots();
  const sendMessage = useSendMessage();

  const whatsappBots = bots?.filter(bot => bot.channel === 'whatsapp' && bot.is_active) || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    await sendMessage.mutateAsync({
      conversation_id: conversation.id,
      content: message,
      sender_type: 'agent',
      sender_id: user.id,
      message_type: 'text',
    });

    setMessage('');
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setMessage(template.content);
      setSelectedTemplate('');
    }
  };

  const handleBotTrigger = async (botId: string) => {
    const bot = whatsappBots.find(b => b.id === botId);
    if (!bot || !user) return;

    // Simular resposta do bot
    const botResponse = `Olá! Sou o ${bot.name}. Como posso ajudá-lo hoje?`;
    
    await sendMessage.mutateAsync({
      conversation_id: conversation.id,
      content: botResponse,
      sender_type: 'bot',
      sender_id: botId,
      message_type: 'text',
    });

    setSelectedBot('');
  };

  const getMessageIcon = (senderType: string) => {
    switch (senderType) {
      case 'bot':
        return <Bot className="w-4 h-4 text-blue-500" />;
      case 'agent':
        return <User className="w-4 h-4 text-green-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMessageBubbleStyle = (senderType: string) => {
    switch (senderType) {
      case 'agent':
        return 'bg-primary text-primary-foreground ml-auto';
      case 'bot':
        return 'bg-blue-100 text-blue-900 border border-blue-200';
      default:
        return 'bg-muted';
    }
  };

  const getSenderName = (senderType: string, botId?: string) => {
    switch (senderType) {
      case 'agent':
        return 'Você';
      case 'bot':
        const bot = whatsappBots.find(b => b.id === botId);
        return bot?.name || 'Bot';
      default:
        return 'Cliente';
    }
  };

  const getMessageStatus = (isRead: boolean) => {
    return isRead ? (
      <CheckCheck className="w-3 h-3 text-blue-500" />
    ) : (
      <Check className="w-3 h-3 text-gray-400" />
    );
  };

  const renderMessageContent = (msg: any) => {
    switch (msg.message_type) {
      case 'image':
        return (
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <span className="text-sm">Imagem</span>
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            <span className="text-sm">Áudio</span>
            <Button variant="ghost" size="sm">
              <Play className="w-3 h-3" />
            </Button>
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Documento</span>
          </div>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap">{msg.content}</p>;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.lead?.name}`} />
              <AvatarFallback>
                {conversation.lead?.name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-lg">{conversation.lead?.name || 'Sem nome'}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{conversation.lead?.phone || 'Sem telefone'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">
              WhatsApp
            </Badge>
            <Badge className={`${conversation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {conversation.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {conversation.tags && conversation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {conversation.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {messagesLoading ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Carregando mensagens...</p>
            </div>
          ) : messages?.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-lg ${getMessageBubbleStyle(msg.sender_type)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {getMessageIcon(msg.sender_type)}
                      <span className="text-xs font-medium">
                        {getSenderName(msg.sender_type, msg.sender_id)}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    
                    {renderMessageContent(msg)}
                    
                    {msg.sender_type === 'agent' && (
                      <div className="flex items-center justify-end mt-1">
                        {getMessageStatus(msg.is_read)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t p-4 space-y-4">
          {/* Templates e Bots */}
          <div className="flex gap-2">
            {templates && templates.length > 0 && (
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Template rápido..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {whatsappBots.length > 0 && (
              <Select value={selectedBot} onValueChange={handleBotTrigger}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Acionar bot..." />
                </SelectTrigger>
                <SelectContent>
                  {whatsappBots.map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        {bot.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {/* Input de mensagem */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="min-h-[60px] resize-none pr-20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsRecording(!isRecording)}
                  className={isRecording ? 'text-red-500' : ''}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm">
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button type="button" variant="outline" size="sm">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={!message.trim() || sendMessage.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
