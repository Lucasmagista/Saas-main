
import { useState, useEffect } from "react";
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
import { api } from "@/lib/api";
import Skeleton from 'react-loading-skeleton';

interface ActiveUser {
  id: string;
  name: string;
  phone: string;
  platform: string;
  sessionId: string;
  sessionName: string;
  avatar?: string;
  status: 'active' | 'waiting' | 'idle';
  lastMessage: string;
  messageTime: string;
  messageCount: number;
  chatDuration: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  satisfaction?: number;
}

interface ActiveUsersStats {
  totalActiveUsers: number;
  activeChats: number;
  averageChatDuration: number;
  averageSatisfaction: number;
}

// Skeleton loading component
function ActiveUsersCardSkeleton() {
  const skeletonCards = Array.from({ length: 4 }, (_, i) => ({ id: `skeleton-${Date.now()}-${i}` }));
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {skeletonCards.map((card) => (
          <Card key={card.id}>
            <CardContent className="p-4">
              <Skeleton height={60} />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton height={40} width={200} />
        </CardHeader>
        <CardContent>
          <Skeleton height={300} />
        </CardContent>
      </Card>
    </div>
  );
}

export function ActiveUsersCard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [stats, setStats] = useState<ActiveUsersStats>({
    totalActiveUsers: 0,
    activeChats: 0,
    averageChatDuration: 0,
    averageSatisfaction: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar usuários ativos da API
  useEffect(() => {
    const fetchActiveUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/api/analytics/active-users');
        
        if (response.success) {
          setActiveUsers(response.data.users || []);
          setStats(response.data.stats || {
            totalActiveUsers: 0,
            activeChats: 0,
            averageChatDuration: 0,
            averageSatisfaction: 0
          });
        }
      } catch (err) {
        console.error('Erro ao buscar usuários ativos:', err);
        setError('Erro ao carregar usuários ativos');
        // Define dados vazios em caso de erro
        setActiveUsers([]);
        setStats({
          totalActiveUsers: 0,
          activeChats: 0,
          averageChatDuration: 0,
          averageSatisfaction: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActiveUsers();
  }, []);

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

  const handleTransferUser = async (userId: string) => {
    try {
      console.log('Transferir usuário:', userId);
      // Implementar transferência via API quando necessário
    } catch (err) {
      console.error('Erro ao transferir usuário:', err);
    }
  };

  const handleEndChat = async (userId: string) => {
    try {
      console.log('Finalizar chat:', userId);
      // Implementar finalização via API quando necessário
    } catch (err) {
      console.error('Erro ao finalizar chat:', err);
    }
  };

  const handleAddTag = async (userId: string) => {
    try {
      console.log('Adicionar tag ao usuário:', userId);
      // Implementar adição de tag via API quando necessário
    } catch (err) {
      console.error('Erro ao adicionar tag:', err);
    }
  };

  if (loading) {
    return <ActiveUsersCardSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalActiveUsers}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.activeChats}</p>
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
                <p className="text-2xl font-bold text-orange-600">
                  {stats.averageChatDuration ? `${stats.averageChatDuration} min` : '—'}
                </p>
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
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.averageSatisfaction ? `${stats.averageSatisfaction.toFixed(1)}⭐` : '—'}
                </p>
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
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum usuário ativo
              </h3>
              <p className="text-gray-500">
                {activeUsers.length === 0 
                  ? 'Não há conversas ativas no momento.'
                  : 'Nenhum usuário corresponde aos filtros aplicados.'}
              </p>
            </div>
          ) : (
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
                          {user.tags.map((tag) => (
                            <Badge key={`${user.id}-${tag}`} variant="outline" className="text-xs">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
