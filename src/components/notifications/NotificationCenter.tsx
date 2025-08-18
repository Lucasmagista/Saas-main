
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Mail, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Plus,
  Send,
  Clock,
  Eye,
  Filter
} from 'lucide-react';
import { 
  useNotifications, 
  useNotificationPreferences, 
  useUpdateNotificationPreferences,
  useMarkNotificationAsRead,
  useCreateNotification
} from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NotificationCenter = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    category: '',
    action_url: '',
    user_id: '',
  });

  const { data: notifications, isLoading } = useNotifications();
  const { data: preferences } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const markAsRead = useMarkNotificationAsRead();
  const createNotification = useCreateNotification();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

  const filteredNotifications = notifications?.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.is_read;
    if (activeTab === 'read') return notification.is_read;
    return notification.type === activeTab;
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createNotification.mutateAsync({
        ...newNotification,
        organization_id: 'temp-org-id',
        metadata: {},
      });
      
      setIsCreateDialogOpen(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        category: '',
        action_url: '',
        user_id: '',
      });
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
    }
  };

  const handleUpdatePreferences = async (key: string, value: boolean) => {
    try {
      await updatePreferences.mutateAsync({
        ...preferences,
        [key]: value,
        organization_id: 'temp-org-id',
      });
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
    }
  };

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Notificação
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Notificação</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateNotification}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Título</Label>
                          <Input
                            id="title"
                            value={newNotification.title}
                            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="message">Mensagem</Label>
                          <Textarea
                            id="message"
                            value={newNotification.message}
                            onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="type">Tipo</Label>
                            <Select value={newNotification.type} onValueChange={(value) => setNewNotification({ ...newNotification, type: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="info">Informação</SelectItem>
                                <SelectItem value="success">Sucesso</SelectItem>
                                <SelectItem value="warning">Aviso</SelectItem>
                                <SelectItem value="error">Erro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="category">Categoria</Label>
                            <Input
                              id="category"
                              value={newNotification.category}
                              onChange={(e) => setNewNotification({ ...newNotification, category: e.target.value })}
                              placeholder="Ex: vendas, suporte"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="action_url">URL de Ação (opcional)</Label>
                          <Input
                            id="action_url"
                            value={newNotification.action_url}
                            onChange={(e) => setNewNotification({ ...newNotification, action_url: e.target.value })}
                            placeholder="https://exemplo.com/acao"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createNotification.isPending}>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6 w-full">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="unread">Não lidas</TabsTrigger>
                  <TabsTrigger value="read">Lidas</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="success">Sucesso</TabsTrigger>
                  <TabsTrigger value="warning">Avisos</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-4">
                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="text-center py-8">Carregando notificações...</div>
                    ) : filteredNotifications?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma notificação encontrada
                      </div>
                    ) : (
                      filteredNotifications?.map((notification) => (
                        <Card 
                          key={notification.id} 
                          className={`border-l-4 ${getNotificationColor(notification.type)} ${
                            !notification.is_read ? 'bg-accent/20' : ''
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                {getNotificationIcon(notification.type)}
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm">
                                      {notification.title}
                                    </h4>
                                    {!notification.is_read && (
                                      <Badge variant="secondary" className="text-xs">
                                        Nova
                                      </Badge>
                                    )}
                                    {notification.category && (
                                      <Badge variant="outline" className="text-xs">
                                        {notification.category}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {notification.message}
                                  </p>
                                  
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        {formatDistanceToNow(new Date(notification.sent_at), {
                                          addSuffix: true,
                                          locale: ptBR,
                                        })}
                                      </span>
                                    </div>
                                    
                                    {notification.action_url && (
                                      <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="h-auto p-0 text-xs"
                                        onClick={() => window.open(notification.action_url, '_blank')}
                                      >
                                        Ver mais
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Preferências
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <Label htmlFor="push">Notificações Push</Label>
                </div>
                <Switch
                  id="push"
                  checked={preferences?.push_notifications || false}
                  onCheckedChange={(checked) => handleUpdatePreferences('push_notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <Label htmlFor="email">Notificações por Email</Label>
                </div>
                <Switch
                  id="email"
                  checked={preferences?.email_notifications || false}
                  onCheckedChange={(checked) => handleUpdatePreferences('email_notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <Label htmlFor="sms">Notificações por SMS</Label>
                </div>
                <Switch
                  id="sms"
                  checked={preferences?.sms_notifications || false}
                  onCheckedChange={(checked) => handleUpdatePreferences('sms_notifications', checked)}
                />
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm mb-3">Tipos de Notificação</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sales" className="text-sm">Vendas</Label>
                    <Switch id="sales" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="support" className="text-sm">Suporte</Label>
                    <Switch id="support" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketing" className="text-sm">Marketing</Label>
                    <Switch id="marketing" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system" className="text-sm">Sistema</Label>
                    <Switch id="system" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
