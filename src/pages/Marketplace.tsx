
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppStore } from "@/components/marketplace/AppStore";
import { DeveloperSdk } from "@/components/marketplace/DeveloperSdk";
import { NativeIntegrations } from "@/components/marketplace/NativeIntegrations";
import { CustomWebhooks } from "@/components/marketplace/CustomWebhooks";
import { ZapierAdvanced } from "@/components/marketplace/ZapierAdvanced";

const Marketplace = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketplace & Integrações</h1>
          <p className="text-muted-foreground">Loja de apps, SDK e integrações avançadas</p>
        </div>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="store">Loja de Apps</TabsTrigger>
          <TabsTrigger value="sdk">SDK</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="zapier">Zapier</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <AppStore />
        </TabsContent>

        <TabsContent value="sdk">
          <DeveloperSdk />
        </TabsContent>

        <TabsContent value="integrations">
          <NativeIntegrations />
        </TabsContent>

        <TabsContent value="webhooks">
          <CustomWebhooks />
        </TabsContent>

        <TabsContent value="zapier">
          <ZapierAdvanced />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketplace;
