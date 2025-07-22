
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomDashboards } from "@/components/bi/CustomDashboards";
import { AdvancedReports } from "@/components/bi/AdvancedReports";
import { DataVisualization } from "@/components/bi/DataVisualization";
import { DataExport } from "@/components/bi/DataExport";
import { AutomatedAlerts } from "@/components/bi/AutomatedAlerts";

const BusinessIntelligence = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Intelligence</h1>
          <p className="text-muted-foreground">Dashboards, relatórios e análises avançadas</p>
        </div>
      </div>

      <Tabs defaultValue="dashboards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="visualization">Visualização</TabsTrigger>
          <TabsTrigger value="export">Exportação</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards">
          <CustomDashboards />
        </TabsContent>

        <TabsContent value="reports">
          <AdvancedReports />
        </TabsContent>

        <TabsContent value="visualization">
          <DataVisualization />
        </TabsContent>

        <TabsContent value="export">
          <DataExport />
        </TabsContent>

        <TabsContent value="alerts">
          <AutomatedAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessIntelligence;
