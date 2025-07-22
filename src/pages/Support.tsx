
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpDesk } from "@/components/support/HelpDesk";
import { LiveChat } from "@/components/support/LiveChat";
import { KnowledgeBase } from "@/components/support/KnowledgeBase";
import { SlaManager } from "@/components/support/SlaManager";
import { EscalationManager } from "@/components/support/EscalationManager";

const Support = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Suporte</h1>
          <p className="text-muted-foreground">Helpdesk, chat e base de conhecimento</p>
        </div>
      </div>

      <Tabs defaultValue="helpdesk" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="helpdesk">HelpDesk</TabsTrigger>
          <TabsTrigger value="chat">Chat ao Vivo</TabsTrigger>
          <TabsTrigger value="knowledge">Base de Conhecimento</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="escalation">Escalação</TabsTrigger>
        </TabsList>

        <TabsContent value="helpdesk">
          <HelpDesk />
        </TabsContent>

        <TabsContent value="chat">
          <LiveChat />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeBase />
        </TabsContent>

        <TabsContent value="sla">
          <SlaManager />
        </TabsContent>

        <TabsContent value="escalation">
          <EscalationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
