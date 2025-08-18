
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
  CheckCheck
} from 'lucide-react';
import { useMessages, useSendMessage } from '@/hooks/useConversations';
import { useTemplates } from '@/hooks/useTemplates';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

interface ConversationViewProps {
  conversation: any;
}

export const ConversationView = ({ conversation }: ConversationViewProps) => {
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { data: messages, isLoading: messagesLoading } = useMessages(conversation.id);
  const { data: templates } = useTemplates(conversation.channel);
  const sendMessage = useSendMessage();

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

  const getMessageIcon = (senderType: string) => {
    switch (senderType) {
      case 'bot':
        return <Bot className="w-4 h-4" />;
      case 'agent':
        return <User className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
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
                {conversation.lead?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-lg">{conversation.lead?.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getChannelIcon(conversation.channel)}
                <span>{conversation.lead?.email || conversation.lead?.phone}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(conversation.status)}`}>
              {conversation.status}
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
            <div className="text-center text-muted-foreground">
              Carregando mensagens...
            </div>
          ) : messages?.length === 0 ? (
            <div className="text-center text-muted-foreground">
              Nenhuma mensagem ainda. Inicie a conversa!
            </div>
          ) : (
            <div className="space-y-4">
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender_type === 'agent'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getMessageIcon(msg.sender_type)}
                      <span className="text-xs font-medium">
                        {msg.sender_type === 'agent' ? 'Você' : 
                         msg.sender_type === 'bot' ? 'Bot' : 'Cliente'}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.sender_type === 'agent' && (
                      <div className="flex items-center justify-end mt-1">
                        {msg.is_read ? (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Clock className="w-3 h-3 opacity-50" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t p-4">
          {templates && templates.length > 0 && (
            <div className="mb-3">
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Button type="button" variant="outline" size="sm">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button type="button" variant="outline" size="sm">
                <Smile className="w-4 h-4" />
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
