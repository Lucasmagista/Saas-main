
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionPlans } from "@/components/billing/SubscriptionPlans";
import { PaymentHistory } from "@/components/billing/PaymentHistory";
import { InvoiceManagement } from "@/components/billing/InvoiceManagement";
import { BillingSettings } from "@/components/billing/BillingSettings";

const Billing = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Pagamentos</h1>
          <p className="text-muted-foreground">Gerencie planos, pagamentos e faturas</p>
        </div>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <SubscriptionPlans />
        </TabsContent>

        <TabsContent value="history">
          <PaymentHistory />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceManagement />
        </TabsContent>

        <TabsContent value="settings">
          <BillingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Billing;
