
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiTenancy } from "@/components/infrastructure/MultiTenancy";
import { LoadBalancer } from "@/components/infrastructure/LoadBalancer";
import { CdnManager } from "@/components/infrastructure/CdnManager";
import { DatabaseOptimization } from "@/components/infrastructure/DatabaseOptimization";
import { CachingLayers } from "@/components/infrastructure/CachingLayers";

const Infrastructure = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Infraestrutura & DevOps</h1>
          <p className="text-muted-foreground">Multi-tenancy, load balancing e otimizações</p>
        </div>
      </div>

      <Tabs defaultValue="tenancy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tenancy">Multi-Tenancy</TabsTrigger>
          <TabsTrigger value="loadbalancer">Load Balancer</TabsTrigger>
          <TabsTrigger value="cdn">CDN</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="tenancy">
          <MultiTenancy />
        </TabsContent>

        <TabsContent value="loadbalancer">
          <LoadBalancer />
        </TabsContent>

        <TabsContent value="cdn">
          <CdnManager />
        </TabsContent>

        <TabsContent value="database">
          <DatabaseOptimization />
        </TabsContent>

        <TabsContent value="cache">
          <CachingLayers />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Infrastructure;
