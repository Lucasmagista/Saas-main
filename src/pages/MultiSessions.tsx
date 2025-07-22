
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { 
  MessageSquare, Smartphone, Bot, Activity, Users, Zap, 
  Search, Filter, Grid, List, Play, Pause, RotateCcw, 
  Trash2, Plus, QrCode, AlertTriangle, CheckCircle,
  Globe, Clock, TrendingUp, Server, Database, Wifi
} from "lucide-react";
import { SessionGrid } from "@/components/multi-sessions/SessionGrid";
import { SessionTable } from "@/components/multi-sessions/SessionTable";
import { CreateSessionModal } from "@/components/multi-sessions/CreateSessionModal";
import { SystemHealthCard } from "@/components/multi-sessions/SystemHealthCard";
import { ActiveUsersCard } from "@/components/multi-sessions/ActiveUsersCard";

const MultiSessions = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data - em produção viria de APIs
  const sessionsData = [
    {
      id: '1',
      name: 'WhatsApp Principal',
      platform: 'whatsapp',
      status: 'connected',
      phoneNumber: '+55 11 99999-0001',
      activeChats: 45,
      totalMessages: 1250,
      uptime: '2d 14h',
      lastActivity: '2 min atrás',
      qrCode: 'available'
    },
    {
      id: '2',
      name: 'Telegram Support',
      platform: 'telegram',
      status: 'connected',
      phoneNumber: '@supportbot',
      activeChats: 23,
      totalMessages: 890,
      uptime: '1d 8h',
      lastActivity: '5 min atrás',
      qrCode: null
    },
    {
      id: '3',
      name: 'WhatsApp Vendas',
      platform: 'whatsapp',
      status: 'disconnected',
      phoneNumber: '+55 11 99999-0002',
      activeChats: 0,
      totalMessages: 560,
      uptime: '0h',
      lastActivity: '2h atrás',
      qrCode: 'expired'
    },
    {
      id: '4',
      name: 'Discord Community',
      platform: 'discord',
      status: 'connected',
      phoneNumber: 'CRM Pro Server',
      activeChats: 12,
      totalMessages: 340,
      uptime: '5d 2h',
      lastActivity: '1 min atrás',
      qrCode: null
    }
  ];

  const platformData = [
    { name: 'WhatsApp', value: 68, color: '#25D366' },
    { name: 'Telegram', value: 22, color: '#0088cc' },
    { name: 'Discord', value: 8, color: '#5865F2' },
    { name: 'Instagram', value: 2, color: '#E4405F' }
  ];

  const responseTimeData = [
    { time: '00:00', whatsapp: 2.3, telegram: 1.8, discord: 3.2 },
    { time: '04:00', whatsapp: 1.9, telegram: 1.5, discord: 2.8 },
    { time: '08:00', whatsapp: 3.1, telegram: 2.4, discord: 4.1 },
    { time: '12:00', whatsapp: 4.2, telegram: 3.1, discord: 5.3 },
    { time: '16:00', whatsapp: 3.8, telegram: 2.9, discord: 4.8 },
    { time: '20:00', whatsapp: 2.5, telegram: 2.1, discord: 3.5 }
  ];

  const messagesOverTime = [
    { time: '00:00', messages: 45 },
    { time: '02:00', messages: 23 },
    { time: '04:00', messages: 12 },
    { time: '06:00', messages: 34 },
    { time: '08:00', messages: 89 },
    { time: '10:00', messages: 156 },
    { time: '12:00', messages: 234 },
    { time: '14:00', messages: 189 },
    { time: '16:00', messages: 167 },
    { time: '18:00', messages: 145 },
    { time: '20:00', messages: 98 },
    { time: '22:00', messages: 67 }
  ];

  const connectedSessions = sessionsData.filter(s => s.status === 'connected').length;
  const totalActiveChats = sessionsData.reduce((sum, s) => sum + s.activeChats, 0);
  const totalMessages = sessionsData.reduce((sum, s) => sum + s.totalMessages, 0);

  const handleBulkAction = (action: string) => {
    console.log(`Executando ação em lote: ${action} para sessões:`, selectedSessions);
    // Implementar ações em lote
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Multi-Sessões</h1>
            <p className="text-gray-600 mt-1">Gerenciamento centralizado de bots e conversas</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Sessão
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sessões Ativas</CardTitle>
              <Bot className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{connectedSessions}/{sessionsData.length}</div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                {Math.round((connectedSessions / sessionsData.length) * 100)}% Online
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversas Ativas</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalActiveChats}</div>
              <div className="flex items-center text-sm text-blue-600 mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% vs ontem
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Mensagens Hoje</CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalMessages.toLocaleString()}</div>
              <div className="flex items-center text-sm text-purple-600 mt-1">
                <Activity className="w-4 h-4 mr-1" />
                +8.5% vs média
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tempo Resposta</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">2.8s</div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                -15% mais rápido
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sessions">Sessões</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Usuários Ativos</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-6">
            {/* Controles e Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Buscar sessões..." 
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {selectedSessions.length > 0 && (
                  <div className="flex items-center gap-2 mr-4">
                    <span className="text-sm text-gray-600">{selectedSessions.length} selecionadas</span>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('pause')}>
                      <Pause className="w-4 h-4 mr-1" />
                      Pausar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('restart')}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reiniciar
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sessões */}
            {viewMode === 'grid' ? (
              <SessionGrid 
                sessions={sessionsData}
                selectedSessions={selectedSessions}
                onSelectionChange={setSelectedSessions}
              />
            ) : (
              <SessionTable 
                sessions={sessionsData}
                selectedSessions={selectedSessions}
                onSelectionChange={setSelectedSessions}
              />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribuição por Plataforma */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Plataforma</CardTitle>
                  <CardDescription>Mensagens por canal nas últimas 24h</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {platformData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-600">{item.name} ({item.value}%)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tempo de Resposta */}
              <Card>
                <CardHeader>
                  <CardTitle>Tempo de Resposta</CardTitle>
                  <CardDescription>Tempo médio por plataforma (segundos)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="whatsapp" stroke="#25D366" strokeWidth={2} />
                      <Line type="monotone" dataKey="telegram" stroke="#0088cc" strokeWidth={2} />
                      <Line type="monotone" dataKey="discord" stroke="#5865F2" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Volume de Mensagens */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Volume de Mensagens</CardTitle>
                  <CardDescription>Mensagens por hora nas últimas 24h</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={messagesOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="messages" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <ActiveUsersCard />
          </TabsContent>

          <TabsContent value="system">
            <SystemHealthCard />
          </TabsContent>
        </Tabs>

        <CreateSessionModal 
          open={showCreateModal} 
          onOpenChange={setShowCreateModal}
        />
      </div>
    </div>
  );
};

export default MultiSessions;
