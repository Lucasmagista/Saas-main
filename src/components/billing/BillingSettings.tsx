
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Settings, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const BillingSettings = () => {
  const { toast } = useToast();
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [invoiceEmail, setInvoiceEmail] = useState("billing@company.com");

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações de cobrança foram atualizadas.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Método de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Método de Pagamento
          </CardTitle>
          <CardDescription>
            Gerencie seus cartões de crédito e métodos de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Visa •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expira em 12/25</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Editar</Button>
              <Button variant="outline" size="sm">Remover</Button>
            </div>
          </div>
          
          <Button variant="outline">
            <CreditCard className="w-4 h-4 mr-2" />
            Adicionar Novo Cartão
          </Button>
        </CardContent>
      </Card>

      {/* Configurações de Cobrança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Cobrança
          </CardTitle>
          <CardDescription>
            Configure suas preferências de cobrança e renovação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Renovação Automática</Label>
              <p className="text-sm text-muted-foreground">
                Renovar automaticamente sua assinatura
              </p>
            </div>
            <Switch
              checked={autoRenewal}
              onCheckedChange={setAutoRenewal}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receber lembretes e notificações de cobrança
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="invoice-email">Email para Faturas</Label>
            <Input
              id="invoice-email"
              value={invoiceEmail}
              onChange={(e) => setInvoiceEmail(e.target.value)}
              placeholder="email@empresa.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="billing-cycle">Ciclo de Cobrança</Label>
            <Select defaultValue="monthly">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual (20% desconto)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Cobrança */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Cobrança</CardTitle>
          <CardDescription>
            Endereço e informações fiscais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Nome da Empresa</Label>
              <Input id="company" placeholder="Sua Empresa Ltda" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" placeholder="00.000.000/0001-00" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" placeholder="Rua da Empresa, 123" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" placeholder="São Paulo" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" placeholder="SP" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zip">CEP</Label>
              <Input id="zip" placeholder="00000-000" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};
