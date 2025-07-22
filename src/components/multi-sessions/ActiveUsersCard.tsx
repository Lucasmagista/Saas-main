
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  MessageSquare, Search, UserCheck, Clock, 
  ArrowRightLeft, Tag, Star, MoreHorizontal 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ActiveUsersCard() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data de usuários ativos
  const activeUsers = [
    {
      id: '1',
      name: 'Maria Silva',
      phone: '+55 11 99999-0001',
      platform: 'whatsapp',
      sessionId: 'whatsapp-principal',
      sessionName: 'WhatsApp Principal',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      status: 'active',
      lastMessage: 'Preciso de ajuda com o pedido',
      messageTime: '2 min atrás',
      messageCount: 15,
      chatDuration: '23 min',
      priority: 'high',
      tags: ['novo-cliente', 'urgente'],
      satisfaction: 4.5
    },
    {
      id: '2',
      name: 'João Santos',
      phone: '+55 11 99999-0002',
      platform: 'telegram',
      sessionId: 'telegram-support',
      sessionName: 'Telegram Support',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
      status: 'waiting',
      lastMessage: 'Obrigado pela ajuda!',
      messageTime: '5 min atrás',
      messageCount: 8,
      chatDuration: '12 min',
      priority: 'medium',
      tags: ['suporte'],
      satisfaction: 5.0
    },
    {
      id: '3',
      name: 'Ana Costa',
      phone: '+55 11 99999-0003',
      platform: 'whatsapp',
      sessionId: 'whatsapp-vendas',
      sessionName: 'WhatsApp Vendas',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
      status: 'active',
      lastMessage: 'Qual o preço do produto X?',
      messageTime: '1 min atrás',
      messageCount: 3,
      chatDuration: '5 min',
      priority: 'low',
      tags: ['vendas', 'produto-x'],
      satisfaction: null
    },
    {
      id: '4',
      name: 'Carlos Oliveira',
      phone: 'carlos_dev',
      platform: 'discord',
      sessionId: 'discord-community',
      sessionName: 'Discord Community',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
      status: 'active',
      lastMessage: 'Como integro com a API?',
      messageTime: '30 seg atrás',
      messageCount: 7,
      chatDuration: '18 min',
      priority: 'medium',
      tags: ['desenvolvedor', 'api'],
      satisfaction: null
    }
  ];

  const filteredUsers = activeUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlatformIcon = (platform: string) => {
    const icons = {
      whatsapp: "📱",
      telegram: "✈️",
      discord: "🎮",
      instagram: "📸"
    };
    return icons[platform as keyof typeof icons] || "💬";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'idle': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTransferUser = (userId: string) => {
    console.log('Transferir usuário:', userId);
    // Implementar transferência
  };

  const handleEndChat = (userId: string) => {
    console.log('Finalizar chat:', userId);
    // Implementar finalização do chat
  };

  const handleAddTag = (userId: string) => {
    console.log('Adicionar tag ao usuário:', userId);
    // Implementar adição de tag
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-blue-600">{activeUsers.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chats Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeUsers.filter(u => u.status === 'active').length}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-orange-600">15 min</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfação</p>
                <p className="text-2xl font-bold text-yellow-600">4.8⭐</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários Ativos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuários Ativos</CardTitle>
              <CardDescription>Conversas em andamento em tempo real</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Buscar usuários..." 
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Sessão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Mensagem</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPlatformIcon(user.platform)}</span>
                        <span className="capitalize">{user.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.sessionName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48">
                        <p className="text-sm truncate">{user.lastMessage}</p>
                        <p className="text-xs text-gray-500">{user.messageTime}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{user.chatDuration}</p>
                        <p className="text-xs text-gray-500">{user.messageCount} msgs</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(user.priority)}>
                        {user.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTransferUser(user.id)}>
                            <ArrowRightLeft className="w-4 h-4 mr-2" />
                            Transferir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddTag(user.id)}>
                            <Tag className="w-4 h-4 mr-2" />
                            Adicionar Tag
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEndChat(user.id)}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Finalizar Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
