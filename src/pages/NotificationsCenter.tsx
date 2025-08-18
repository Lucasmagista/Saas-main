
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PushNotifications } from "@/components/notifications/PushNotifications";
import { EmailTemplates } from "@/components/notifications/EmailTemplates";
import { SmsNotifications } from "@/components/notifications/SmsNotifications";
import { InAppNotifications } from "@/components/notifications/InAppNotifications";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";

const NotificationsCenter = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Centro de Notificações</h1>
          <p className="text-muted-foreground">Gerencie todos os tipos de notificações</p>
        </div>
      </div>

      <Tabs defaultValue="push" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="push">Push</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="inapp">In-App</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
        </TabsList>

        <TabsContent value="push">
          <PushNotifications />
        </TabsContent>

        <TabsContent value="email">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="sms">
          <SmsNotifications />
        </TabsContent>

        <TabsContent value="inapp">
          <InAppNotifications />
        </TabsContent>

        <TabsContent value="preferences">
          <NotificationPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsCenter;
