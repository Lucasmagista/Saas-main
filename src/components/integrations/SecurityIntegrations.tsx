
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, Eye, FileText, Database, Key, Settings, AlertTriangle } from "lucide-react";

export function SecurityIntegrations() {
  const [securityFeatures, setSecurityFeatures] = useState([
    { id: "encryption", name: "Criptografia End-to-End", description: "Proteção completa das mensagens", enabled: true, status: "active" },
    { id: "audit", name: "Auditoria de Mensagens", description: "Log completo de todas as interações", enabled: true, status: "active" },
    { id: "compliance", name: "LGPD/GDPR Compliance", description: "Conformidade com regulamentações", enabled: true, status: "active" },
    { id: "2fa", name: "Autenticação 2FA", description: "Segurança adicional para acesso", enabled: false, status: "inactive" },
    { id: "backup", name: "Backup Automático", description: "Backup seguro de conversas", enabled: true, status: "active" },
    { id: "sync", name: "Sincronização Multi-dispositivo", description: "Sync seguro entre dispositivos", enabled: true, status: "active" }
  ]);

  const [notifications, setNotifications] = useState([
    { id: "push", name: "Web Push Notifications", description: "Notificações do navegador", enabled: true },
    { id: "firebase", name: "Firebase Mobile", description: "Notificações para apps mobile", enabled: false },
    { id: "custom", name: "Notificações Personalizadas", description: "Por evento específico", enabled: true }
  ]);

  const toggleFeature = (id: string) => {
    setSecurityFeatures(securityFeatures.map(feature => 
      feature.id === id 
        ? { ...feature, enabled: !feature.enabled, status: feature.enabled ? "inactive" : "active" }
        : feature
    ));
  };

  const toggleNotification = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, enabled: !notification.enabled }
        : notification
    ));
  };

  const featureIcons = {
    encryption: <Lock className="w-6 h-6" />,
    audit: <Eye className="w-6 h-6" />,
    compliance: <FileText className="w-6 h-6" />,
    "2fa": <Key className="w-6 h-6" />,
    backup: <Database className="w-6 h-6" />,
    sync: <Shield className="w-6 h-6" />
  };

  const notificationIcons = {
    push: <AlertTriangle className="w-6 h-6" />,
    firebase: <Shield className="w-6 h-6" />,
    custom: <Settings className="w-6 h-6" />
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Segurança e Compliance</CardTitle>
          <CardDescription>Configurações de segurança, backup e conformidade</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="security">
            <TabsList>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="backup">Backup & Sync</TabsTrigger>
              <TabsTrigger value="notifications">Notificações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="security" className="space-y-4">
              <div className="grid gap-4">
                {securityFeatures.filter(f => ['encryption', 'audit', 'compliance', '2fa'].includes(f.id)).map((feature) => (
                  <Card key={feature.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${feature.enabled ? 'bg-green-500' : 'bg-gray-200'} text-white`}>
                            {featureIcons[feature.id as keyof typeof featureIcons]}
                          </div>
                          <div>
                            <h4 className="font-semibold">{feature.name}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                            {feature.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Switch 
                            checked={feature.enabled}
                            onCheckedChange={() => toggleFeature(feature.id)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="backup" className="space-y-4">
              <div className="grid gap-4">
                {securityFeatures.filter(f => ['backup', 'sync'].includes(f.id)).map((feature) => (
                  <Card key={feature.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${feature.enabled ? 'bg-blue-500' : 'bg-gray-200'} text-white`}>
                            {featureIcons[feature.id as keyof typeof featureIcons]}
                          </div>
                          <div>
                            <h4 className="font-semibold">{feature.name}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {feature.id === 'backup' ? 'Último backup: 2h atrás' : 'Sincronizado'}
                            </div>
                            <Progress value={feature.id === 'backup' ? 95 : 100} className="w-20" />
                          </div>
                          <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                            {feature.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Switch 
                            checked={feature.enabled}
                            onCheckedChange={() => toggleFeature(feature.id)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="grid gap-4">
                {notifications.map((notification) => (
                  <Card key={notification.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${notification.enabled ? 'bg-purple-500' : 'bg-gray-200'} text-white`}>
                            {notificationIcons[notification.id as keyof typeof notificationIcons]}
                          </div>
                          <div>
                            <h4 className="font-semibold">{notification.name}</h4>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={notification.enabled ? 'default' : 'secondary'}>
                            {notification.enabled ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Switch 
                            checked={notification.enabled}
                            onCheckedChange={() => toggleNotification(notification.id)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
