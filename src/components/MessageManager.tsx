import React, { useState } from 'react';
import { useMessageManagement, useMessageFilters } from '../hooks/useMessages';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Plus, Send, Trash2, Filter, BarChart3, MessageSquare, FileText, Image, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SendMessageForm {
  to: string;
  content: string;
  type: 'text' | 'media' | 'template';
  metadata?: any;
}

const MESSAGE_TYPES = [
  { value: 'text', label: 'Texto', icon: FileText },
  { value: 'media', label: 'Mídia', icon: Image },
  { value: 'template', label: 'Template', icon: MessageSquare }
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
  delivered: 'bg-green-100 text-green-800'
};

export const MessageManager: React.FC = () => {
  const {
    messages,
    stats,
    isLoading,
    isStatsLoading,
    sendMessage,
    sendBatchMessages,
    deleteMessage,
    isSending,
    isSendingBatch,
    isDeleting
  } = useMessageManagement();

  const {
    filters,
    pagination,
    updateFilters,
    updatePagination,
    clearFilters
  } = useMessageFilters();

  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SendMessageForm>({
    to: '',
    content: '',
    type: 'text'
  });
  const [batchMessages, setBatchMessages] = useState<SendMessageForm[]>([]);

  const handleSendMessage = () => {
    if (!formData.to || !formData.content) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    sendMessage(formData);
    setIsSendDialogOpen(false);
    setFormData({ to: '', content: '', type: 'text' });
  };

  const handleSendBatch = () => {
    if (batchMessages.length === 0) {
      toast.error('Adicione pelo menos uma mensagem');
      return;
    }

    sendBatchMessages({ messages: batchMessages });
    setIsBatchDialogOpen(false);
    setBatchMessages([]);
  };

  const addBatchMessage = () => {
    setBatchMessages([...batchMessages, { to: '', content: '', type: 'text' }]);
  };

  const removeBatchMessage = (index: number) => {
    setBatchMessages(batchMessages.filter((_, i) => i !== index));
  };

  const updateBatchMessage = (index: number, field: keyof SendMessageForm, value: any) => {
    const updated = [...batchMessages];
    updated[index] = { ...updated[index], [field]: value };
    setBatchMessages(updated);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'failed': return <Alert className="h-4 w-4" />;
      case 'delivered': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = MESSAGE_TYPES.find(t => t.value === type);
    const Icon = typeConfig?.icon || FileText;
    return <Icon className="h-4 w-4" />;
  };

  // Dados para gráficos
  const chartData = stats ? [
    { name: 'Enviadas', value: stats.sent, color: '#3b82f6' },
    { name: 'Falharam', value: stats.failed, color: '#ef4444' },
    { name: 'Pendentes', value: stats.pending, color: '#f59e0b' },
    { name: 'Entregues', value: stats.delivered, color: '#10b981' }
  ] : [];

  const timeData = [
    { time: '00:00', sent: 12, failed: 2 },
    { time: '04:00', sent: 8, failed: 1 },
    { time: '08:00', sent: 25, failed: 3 },
    { time: '12:00', sent: 45, failed: 5 },
    { time: '16:00', sent: 38, failed: 4 },
    { time: '20:00', sent: 22, failed: 2 }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando mensagens...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mensagens</h1>
          <p className="text-muted-foreground">
            Gerencie e envie mensagens através dos bots
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Enviar Mensagem</DialogTitle>
                <DialogDescription>
                  Envie uma mensagem para um número específico
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="to">Para</Label>
                  <Input
                    id="to"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    placeholder="+5511999999999"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MESSAGE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <type.icon className="h-4 w-4 mr-2" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Mensagem</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Digite sua mensagem..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSendMessage} disabled={isSending}>
                  {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enviar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Envio em Lote
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Envio em Lote</DialogTitle>
                <DialogDescription>
                  Envie múltiplas mensagens de uma vez
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {batchMessages.map((message, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Mensagem {index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeBatchMessage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Para</Label>
                        <Input
                          value={message.to}
                          onChange={(e) => updateBatchMessage(index, 'to', e.target.value)}
                          placeholder="+5511999999999"
                        />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <Select
                          value={message.type}
                          onValueChange={(value: any) => updateBatchMessage(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MESSAGE_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Mensagem</Label>
                      <Textarea
                        value={message.content}
                        onChange={(e) => updateBatchMessage(index, 'content', e.target.value)}
                        placeholder="Digite sua mensagem..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addBatchMessage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Mensagem
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBatchDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSendBatch} disabled={isSendingBatch}>
                  {isSendingBatch && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enviar Lote
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falharam</CardTitle>
              <Alert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregues</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Status das Mensagens</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Mensagens por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros Avançados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={filters.type || ''}
                    onValueChange={(value) => updateFilters({ type: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {MESSAGE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) => updateFilters({ status: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="sent">Enviada</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => updateFilters({ startDate: e.target.value || undefined })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagens Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Para</TableHead>
                <TableHead>Conteúdo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(message.type)}
                      <span className="capitalize">{message.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{message.to_number || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {message.content}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[message.status as keyof typeof STATUS_COLORS]}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(message.status)}
                        <span className="capitalize">{message.status}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(message.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMessage(message.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};