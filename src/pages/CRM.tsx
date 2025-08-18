
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesPipeline } from "@/components/crm/SalesPipeline";
import { LeadScoring } from "@/components/crm/LeadScoring";
import { ConversionFunnel } from "@/components/crm/ConversionFunnel";
import { OpportunityManager } from "@/components/crm/OpportunityManager";
import { CustomerHistory } from "@/components/crm/CustomerHistory";

const CRM = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CRM Avançado</h1>
          <p className="text-muted-foreground">Gestão completa de relacionamento com clientes</p>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="leads">Lead Scoring</TabsTrigger>
          <TabsTrigger value="funnel">Funil</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <SalesPipeline />
        </TabsContent>

        <TabsContent value="leads">
          <LeadScoring />
        </TabsContent>

        <TabsContent value="funnel">
          <ConversionFunnel />
        </TabsContent>

        <TabsContent value="opportunities">
          <OpportunityManager />
        </TabsContent>

        <TabsContent value="history">
          <CustomerHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRM;
