import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  BellRing,
  Mail, 
  MessageCircle, 
  Phone,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Search,
  Filter,
  Archive,
  Trash2,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export function NotificationCenter() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Lista de notificações carregadas via API. Começa vazia.
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    read: boolean;
    created_at: string;
  }>>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  // Carrega notificações da API ao montar o componente
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      setNotificationsError(null);
      try {
        const data = await api.get('/api/notifications');
        // Assegura que sempre teremos um array
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar notificações', err);
        setNotificationsError('Erro ao carregar notificações');
      } finally {
        setLoadingNotifications(false);
      }
    };
    fetchNotifications();
  }, []);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    whatsapp: true,
    calls: true,
    calendar: true,
    leads: true,
    system: false,
    desktop: true,
    mobile: true,
    sound: true
  });

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      whatsapp: <MessageCircle className="w-5 h-5 text-green-600" />,
      email: <Mail className="w-5 h-5 text-blue-600" />,
      call: <Phone className="w-5 h-5 text-orange-600" />,
      calendar: <Calendar className="w-5 h-5 text-purple-600" />,
      lead: <Users className="w-5 h-5 text-indigo-600" />,
      system: <Info className="w-5 h-5 text-gray-600" />
    };
    return iconMap[type] || <Bell className="w-5 h-5 text-gray-600" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500";
      case "normal": return "border-l-blue-500";
      case "low": return "border-l-gray-500";
      default: return "border-l-gray-500";
    }
  };

  const markAsRead = (id: string) => {
    toast({
      title: "Notificação marcada como lida",
      description: "A notificação foi atualizada.",
    });
  };

  const markAllAsRead = () => {
    toast({
      title: "Todas as notificações marcadas como lidas",
      description: "Todas as notificações foram atualizadas.",
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "unread") return matchesSearch && !notification.read;
    if (activeTab === "read") return matchesSearch && notification.read;
    return matchesSearch && notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Central de Notificações</h3>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} notificações não lidas` : "Todas as notificações foram lidas"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar todas como lidas
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Todas
        </TabsTrigger>
        <TabsTrigger value="unread" className="flex items-center gap-2">
          <BellRing className="w-4 h-4" />
          Não lidas
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0">
              {unreadCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="whatsapp" className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </TabsTrigger>
        <TabsTrigger value="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email
        </TabsTrigger>
        <TabsTrigger value="call" className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Chamadas
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Config
        </TabsTrigger>
      </TabsList>

      {/* Notifications List */}
      <TabsContent value="all" className="space-y-4">
        <NotificationsList 
          notifications={filteredNotifications}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          markAsRead={markAsRead}
          getNotificationIcon={getNotificationIcon}
          getPriorityColor={getPriorityColor}
        />
      </TabsContent>

      <TabsContent value="unread" className="space-y-4">
        <NotificationsList 
          notifications={filteredNotifications}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          markAsRead={markAsRead}
          getNotificationIcon={getNotificationIcon}
          getPriorityColor={getPriorityColor}
        />
      </TabsContent>

      <TabsContent value="whatsapp" className="space-y-4">
        <NotificationsList 
          notifications={filteredNotifications}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          markAsRead={markAsRead}
          getNotificationIcon={getNotificationIcon}
          getPriorityColor={getPriorityColor}
        />
      </TabsContent>

      <TabsContent value="email" className="space-y-4">
        <NotificationsList 
          notifications={filteredNotifications}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          markAsRead={markAsRead}
          getNotificationIcon={getNotificationIcon}
          getPriorityColor={getPriorityColor}
        />
      </TabsContent>

      <TabsContent value="call" className="space-y-4">
        <NotificationsList 
          notifications={filteredNotifications}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          markAsRead={markAsRead}
          getNotificationIcon={getNotificationIcon}
          getPriorityColor={getPriorityColor}
        />
      </TabsContent>

      {/* Settings */}
      <TabsContent value="settings" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Notificação</CardTitle>
            <CardDescription>
              Configure como e quando você deseja receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Tipos de Notificação</h4>
              <div className="space-y-3">
                {Object.entries({
                  email: "Emails",
                  whatsapp: "WhatsApp",
                  calls: "Chamadas",
                  calendar: "Calendário",
                  leads: "Novos Leads",
                  system: "Sistema"
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getNotificationIcon(key)}
                      <span>{label}</span>
                    </div>
                    <Switch
                      checked={notificationSettings[key]}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Canais de Entrega</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-blue-600" />
                    <span>Notificações Desktop</span>
                  </div>
                  <Switch
                    checked={notificationSettings.desktop}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, desktop: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    <span>Notificações Mobile</span>
                  </div>
                  <Switch
                    checked={notificationSettings.mobile}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, mobile: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {notificationSettings.sound ? (
                      <Volume2 className="w-5 h-5 text-purple-600" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-gray-600" />
                    )}
                    <span>Sons de Notificação</span>
                  </div>
                  <Switch
                    checked={notificationSettings.sound}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, sound: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button>Salvar Configurações</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// Component for notifications list
function NotificationsList({ 
  notifications, 
  searchTerm, 
  setSearchTerm, 
  markAsRead, 
  getNotificationIcon, 
  getPriorityColor 
}) {
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notificações..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="space-y-1 p-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Nenhuma notificação encontrada</h3>
                  <p className="text-sm text-muted-foreground">
                    Não há notificações que correspondam aos filtros aplicados.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-l-4 rounded-lg transition-colors ${
                      !notification.read ? "bg-accent/50" : "hover:bg-muted/50"
                    } ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      {notification.avatar && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback className="text-xs">
                            {notification.sender.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {notification.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          {notification.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">
                              Alta prioridade
                            </Badge>
                          )}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Archive className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}