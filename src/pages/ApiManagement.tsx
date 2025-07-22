
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiKeysManager } from "@/components/api/ApiKeysManager";
import { ApiDocumentation } from "@/components/api/ApiDocumentation";
import { ApiLogs } from "@/components/api/ApiLogs";
import { WebhooksManager } from "@/components/api/WebhooksManager";
import { RateLimiting } from "@/components/api/RateLimiting";

const ApiManagement = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">API Management</h1>
          <p className="text-muted-foreground">Gerencie APIs, chaves, logs e webhooks</p>
        </div>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="limits">Rate Limiting</TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <ApiKeysManager />
        </TabsContent>

        <TabsContent value="docs">
          <ApiDocumentation />
        </TabsContent>

        <TabsContent value="logs">
          <ApiLogs />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhooksManager />
        </TabsContent>

        <TabsContent value="limits">
          <RateLimiting />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiManagement;
