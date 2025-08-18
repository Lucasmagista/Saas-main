
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HealthChecks } from "@/components/monitoring/HealthChecks";
import { PerformanceMonitoring } from "@/components/monitoring/PerformanceMonitoring";
import { ErrorTracking } from "@/components/monitoring/ErrorTracking";
import { UptimeMonitoring } from "@/components/monitoring/UptimeMonitoring";
import { ResourceUsage } from "@/components/monitoring/ResourceUsage";

const Monitoring = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Monitoramento</h1>
          <p className="text-muted-foreground">Health checks, performance e monitoramento completo</p>
        </div>
      </div>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="uptime">Uptime</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <HealthChecks />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMonitoring />
        </TabsContent>

        <TabsContent value="errors">
          <ErrorTracking />
        </TabsContent>

        <TabsContent value="uptime">
          <UptimeMonitoring />
        </TabsContent>

        <TabsContent value="resources">
          <ResourceUsage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Monitoring;
