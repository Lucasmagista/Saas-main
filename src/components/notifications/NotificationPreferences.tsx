
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

export const NotificationPreferences = () => {
  const preferences = [
    { id: "email", label: "Notificações por Email", description: "Receber notificações via email", enabled: true },
    { id: "push", label: "Push Notifications", description: "Notificações no navegador", enabled: true },
    { id: "sms", label: "SMS", description: "Notificações por SMS", enabled: false },
    { id: "inapp", label: "In-App", description: "Notificações dentro do aplicativo", enabled: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Preferências de Notificação</h2>
          <p className="text-muted-foreground">Configure como deseja receber notificações</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configurações Avançadas
        </Button>
      </div>

      <div className="space-y-4">
        {preferences.map((preference) => (
          <Card key={preference.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor={preference.id} className="text-base font-semibold">
                    {preference.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {preference.description}
                  </p>
                </div>
                <Switch id={preference.id} defaultChecked={preference.enabled} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
