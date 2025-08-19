
import { useState } from 'react';
import { ConversationList } from './ConversationList';
import { ConversationView } from './ConversationView';
import { WhatsAppConversationView } from '../communication/WhatsAppConversationView';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export const ConversationDashboard = () => {
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    channel: string;
    lead?: {
      name?: string;
      phone?: string;
    };
    status: string;
    tags?: string[];
  } | null>(null);

  const renderConversationView = () => {
    if (!selectedConversation) {
      return (
        <Card className="h-full flex items-center justify-center">
          <CardContent className="text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Selecione uma conversa</h3>
            <p className="text-muted-foreground">
              Escolha uma conversa da lista para começar a interagir
            </p>
          </CardContent>
        </Card>
      );
    }

    // Usar WhatsAppConversationView para conversas do WhatsApp
    if (selectedConversation.channel === 'whatsapp') {
      return <WhatsAppConversationView conversation={selectedConversation} />;
    }

    // Usar ConversationView padrão para outros canais
    return <ConversationView conversation={selectedConversation} />;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
        <div className="lg:col-span-4">
          <ConversationList
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </div>
        
        <div className="lg:col-span-8">
          {renderConversationView()}
        </div>
      </div>
    </div>
  );
};
