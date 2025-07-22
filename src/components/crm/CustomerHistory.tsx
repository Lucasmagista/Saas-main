
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Phone, Mail, Calendar, DollarSign, FileText, Activity } from "lucide-react";

export const CustomerHistory = () => {
  const interactions = [
    {
      id: 1,
      type: "email",
      date: "2024-01-20",
      time: "14:30",
      title: "Proposta enviada",
      description: "Enviada proposta comercial para o projeto ERP",
      contact: "João Silva",
      status: "sent"
    },
    {
      id: 2,
      type: "call",
      date: "2024-01-18",
      time: "10:15",
      title: "Reunião de alinhamento",
      description: "Discussão sobre requisitos técnicos e cronograma",
      contact: "Maria Santos",
      status: "completed"
    },
    {
      id: 3,
      type: "meeting",
      date: "2024-01-15",
      time: "16:00",
      title: "Apresentação da solução",
      description: "Demo do sistema proposto para equipe técnica",
      contact: "Pedro Costa",
      status: "completed"
    }
  ];

  const transactions = [
    {
      id: 1,
      date: "2024-01-15",
      type: "payment",
      amount: 25000,
      description: "Pagamento primeira parcela - Projeto ERP",
      status: "completed"
    },
    {
      id: 2,
      date: "2024-01-10",
      type: "invoice",
      amount: 50000,
      description: "Fatura #001 - Desenvolvimento sistema",
      status: "pending"
    },
    {
      id: 3,
      date: "2024-01-05",
      type: "quote",
      amount: 150000,
      description: "Orçamento para implementação completa",
      status: "approved"
    }
  ];

  const documents = [
    {
      id: 1,
      name: "Contrato de Prestação de Serviços",
      type: "contract",
      date: "2024-01-20",
      size: "2.5 MB"
    },
    {
      id: 2,
      name: "Proposta Comercial v2.1",
      type: "proposal",
      date: "2024-01-18",
      size: "1.8 MB"
    },
    {
      id: 3,
      name: "Especificação Técnica",
      type: "specification",
      date: "2024-01-15",
      size: "3.2 MB"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />;
      case "call": return <Phone className="h-4 w-4" />;
      case "meeting": return <Calendar className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "pending": return "secondary";
      case "sent": return "outline";
      case "approved": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Histórico do Cliente</h2>
          <p className="text-muted-foreground">Timeline completo de interações e transações</p>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clientes</SelectItem>
            <SelectItem value="tech-corp">Tech Corp</SelectItem>
            <SelectItem value="startup-inc">StartUp Inc</SelectItem>
            <SelectItem value="enterprise">Enterprise Ltd</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="interactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="interactions">Interações</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="interactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Histórico de Interações
              </CardTitle>
              <CardDescription>Todas as comunicações com o cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getTypeIcon(interaction.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{interaction.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(interaction.status)}>
                            {interaction.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {interaction.date} às {interaction.time}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{interaction.description}</p>
                      <p className="text-xs text-muted-foreground">Contato: {interaction.contact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Histórico Financeiro
              </CardTitle>
              <CardDescription>Transações e movimentações financeiras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{transaction.description}</h4>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        R$ {transaction.amount.toLocaleString()}
                      </div>
                      <Badge variant={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos
              </CardTitle>
              <CardDescription>Contratos, propostas e documentos relacionados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">{document.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {document.date} • {document.size}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
