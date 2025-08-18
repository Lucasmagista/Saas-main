import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Bot,
  Phone,
  Video,
  Archive,
  MoreVertical,
  Check,
  CheckCheck,
  AlertCircle,
  Wifi,
  WifiOff,
  Image,
  FileText,
  Mic,
  Play,
  Download,
  Star,
  Flag,
  MessageSquare,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppMessage {
  id: string;
  number: string;
  message: string;
  fromMe: boolean;
  timestamp: string;
  sender_type?: 'user' | 'agent' | 'bot';
  message_type?: 'text' | 'image' | 'document' | 'audio' | 'video';
  is_read?: boolean;
}

interface WhatsAppChatAreaProps {
  selectedNumber?: string;
  conversationId?: string;
  onNumberChange?: (number: string) => void;
}

export const WhatsAppChatArea = ({ 
  selectedNumber, 
  conversationId, 
  onNumberChange 
}: WhatsAppChatAreaProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(selectedNumber || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    loadMoreMessages,
    hasMore
  } = useWhatsAppMessages(conversationId);

  useEffect(() => {
    if (selectedNumber) {
      setPhoneNumber(selectedNumber);
    }
  }, [selectedNumber]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !phoneNumber.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe o número e a mensagem antes de enviar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendMessage.mutateAsync({
        number: phoneNumber.trim(),
        message: newMessage.trim()
      });
      setNewMessage('');
      onNumberChange?.(phoneNumber.trim());
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const getMessageStatus = (message: WhatsAppMessage) => {
    if (!message.fromMe) return null;
    
    if (message.is_read) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  const getSenderName = (message: WhatsAppMessage) => {
    if (message.fromMe) return 'Você';
    if (message.sender_type === 'bot') return 'Bot';
    return `Cliente (${message.number})`;
  };

  const getSenderIcon = (message: WhatsAppMessage) => {
    if (message.fromMe) return <User className="w-4 h-4 text-green-600" />;
    if (message.sender_type === 'bot') return <Bot className="w-4 h-4 text-blue-600" />;
    return <MessageSquare className="w-4 h-4 text-gray-600" />;
  };

  const renderMessageContent = (message: WhatsAppMessage) => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Image className="w-4 h-4" />
            <span className="text-sm">Imagem</span>
            <Button variant="ghost" size="sm">
              <Download className="w-3 h-3" />
            </Button>
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Mic className="w-4 h-4" />
            <span className="text-sm">Áudio</span>
            <Button variant="ghost" size="sm">
              <Play className="w-3 h-3" />
            </Button>
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Documento</span>
            <Button variant="ghost" size="sm">
              <Download className="w-3 h-3" />
            </Button>
          </div>
        );
      case 'video':
        return (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Video className="w-4 h-4" />
            <span className="text-sm">Vídeo</span>
            <Button variant="ghost" size="sm">
              <Play className="w-3 h-3" />
            </Button>
          </div>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header do Chat */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${phoneNumber}`} />
                <AvatarFallback>
                  {phoneNumber ? phoneNumber.slice(-2) : '??'}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold">
                {phoneNumber || 'Selecione um contato'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              WhatsApp
            </Badge>
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
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {(() => {
            if (isLoading && messages.length === 0) {
              return (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              );
            }

            if (messages.length === 0) {
              return (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma mensagem ainda.</p>
                  <p className="text-sm">Digite um número e envie uma mensagem para começar.</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {/* Botão carregar mais */}
                {hasMore && (
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={loadMoreMessages}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Carregando...' : 'Carregar mensagens anteriores'}
                    </Button>
                  </div>
                )}

                {/* Lista de mensagens */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!message.fromMe && (
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.number}`} />
                        <AvatarFallback>
                          {message.number.slice(-2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[80%] ${message.fromMe ? 'order-last' : ''}`}>
                      {/* Info da mensagem */}
                      <div className={`flex items-center gap-2 mb-1 text-xs text-muted-foreground ${
                        message.fromMe ? 'justify-end' : 'justify-start'
                      }`}>
                        {getSenderIcon(message)}
                        <span>{getSenderName(message)}</span>
                        <span>
                          {formatDistanceToNow(new Date(message.timestamp), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      
                      {/* Conteúdo da mensagem */}
                      <div className={`p-3 rounded-lg ${
                        message.fromMe
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}>
                        {renderMessageContent(message)}
                        
                        {/* Status da mensagem */}
                        {message.fromMe && (
                          <div className="flex items-center justify-end gap-1 mt-2">
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {getMessageStatus(message)}
                          </div>
                        )}
                      </div>
                    </div>

                    {message.fromMe && (
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                        <AvatarFallback>EU</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            );
          })()}
        </ScrollArea>

        {/* Área de input */}
        <div className="border-t p-4 space-y-4">
          {/* Input do número (se não houver conversa selecionada) */}
          {!conversationId && (
            <div>
              <Input
                placeholder="Número do WhatsApp (ex: 5511999990000)"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  onNumberChange?.(e.target.value);
                }}
                className="mb-2"
              />
            </div>
          )}

          {/* Formulário de envio */}
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <Button type="button" variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="sm">
                <Smile className="w-4 h-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm">
                <Bot className="w-4 h-4" />
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={!newMessage.trim() || !phoneNumber.trim() || sendMessage.isPending}
              >
                {sendMessage.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>

          {/* Ações rápidas */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Star className="w-3 h-3 mr-1" />
              Modelo
            </Button>
            <Button variant="outline" size="sm">
              <Bot className="w-3 h-3 mr-1" />
              Bot
            </Button>
            <Button variant="outline" size="sm">
              <Flag className="w-3 h-3 mr-1" />
              Marcar
            </Button>
          </div>

          {/* Status da conexão */}
          {!isConnected && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span>Conexão offline. As mensagens serão enviadas quando a conexão for restabelecida.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
