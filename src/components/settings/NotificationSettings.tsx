
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Smartphone, MessageSquare, Zap, Clock, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const NotificationSettings = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    marketing: false,
    security: true,
    projects: true,
    tasks: true,
    mentions: true,
    reminders: true,
    reports: false
  });

  const [emailFrequency, setEmailFrequency] = useState("daily");
  const [quietHours, setQuietHours] = useState({ enabled: true, start: "22:00", end: "08:00" });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: value ? "Notificação ativada" : "Notificação desativada",
      description: `Configuração de ${key} foi ${value ? 'ativada' : 'desativada'}.`,
    });
  };

  const testNotification = () => {
    toast({
      title: "Notificação de teste enviada! 🔔",
      description: "Verifique se você recebeu a notificação conforme configurado.",
    });
  };

  const notificationCategories = [
    {
      title: "Segurança",
      description: "Alertas sobre login e atividade da conta",
      icon: <Bell className="w-5 h-5" />,
      key: "security",
      important: true
    },
    {
      title: "Projetos",
      description: "Atualizações sobre seus projetos",
      icon: <Zap className="w-5 h-5" />,
      key: "projects"
    },
    {
      title: "Tarefas",
      description: "Lembretes e atualizações de tarefas",
      icon: <Clock className="w-5 h-5" />,
      key: "tasks"
    },
    {
      title: "Menções",
      description: "Quando você for mencionado em comentários",
      icon: <MessageSquare className="w-5 h-5" />,
      key: "mentions"
    },
    {
      title: "Lembretes",
      description: "Lembretes personalizados e agendamentos",
      icon: <Clock className="w-5 h-5" />,
      key: "reminders"
    },
    {
      title: "Relatórios",
      description: "Relatórios semanais e mensais",
      icon: <Bell className="w-5 h-5" />,
      key: "reports"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Canais de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Canais de Notificação
          </CardTitle>
          <CardDescription>Escolha como deseja receber notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-sm text-gray-600">Receba por email</p>
                  </div>
                </div>
                <Switch 
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Push</h4>
                    <p className="text-sm text-gray-600">Notificações no navegador</p>
                  </div>
                </div>
                <Switch 
                  checked={notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">SMS</h4>
                    <p className="text-sm text-gray-600">Mensagens de texto</p>
                  </div>
                </div>
                <Switch 
                  checked={notifications.sms}
                  onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  <div>
                    <h4 className="font-medium">Marketing</h4>
                    <p className="text-sm text-gray-600">Novidades e promoções</p>
                  </div>
                </div>
                <Switch 
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-4">
            <Button onClick={testNotification} variant="outline">
              <Volume2 className="w-4 h-4 mr-2" />
              Testar Notificação
            </Button>
            <Badge variant="secondary">Teste em tempo real</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Categorias de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Notificação</CardTitle>
          <CardDescription>Configure que tipos de notificações você deseja receber</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationCategories.map((category) => (
              <div key={category.key}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {category.icon}
                    </div>
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {category.title}
                        {category.important && <Badge variant="destructive" className="text-xs">Importante</Badge>}
                      </h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications[category.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => handleNotificationChange(category.key, checked)}
                    disabled={category.important}
                  />
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Avançadas</CardTitle>
          <CardDescription>Personalize ainda mais suas notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Frequência de Email</Label>
              <Select value={emailFrequency} onValueChange={setEmailFrequency}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Imediato</SelectItem>
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Horário Silencioso</h4>
                  <p className="text-sm text-gray-600">Pausar notificações em horários específicos</p>
                </div>
                <Switch 
                  checked={quietHours.enabled}
                  onCheckedChange={(enabled) => setQuietHours(prev => ({ ...prev, enabled }))}
                />
              </div>
              
              {quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div>
                    <Label className="text-sm">Início</Label>
                    <input
                      type="time"
                      value={quietHours.start}
                      onChange={(e) => setQuietHours(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Fim</Label>
                    <input
                      type="time"
                      value={quietHours.end}
                      onChange={(e) => setQuietHours(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(notifications).filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">Ativas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {notifications.email ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-600">Email</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {notifications.push ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-600">Push</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {quietHours.enabled ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-600">Silencioso</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={className}>{children}</label>
);
