
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, Mail, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const InvoiceManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const invoices = [
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      dueDate: '2024-01-30',
      amount: 99.00,
      plan: 'Professional',
      status: 'paid',
      paidDate: '2024-01-16'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-15',
      dueDate: '2023-12-30',
      amount: 99.00,
      plan: 'Professional',
      status: 'paid',
      paidDate: '2023-12-16'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-15',
      dueDate: '2023-11-30',
      amount: 99.00,
      plan: 'Professional',
      status: 'overdue',
      paidDate: null
    },
    {
      id: 'INV-2024-002',
      date: '2024-01-20',
      dueDate: '2024-02-05',
      amount: 299.00,
      plan: 'Enterprise',
      status: 'pending',
      paidDate: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paga</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Vencida</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download iniciado",
      description: `Fatura ${invoiceId} está sendo baixada.`,
    });
  };

  const handleSendInvoice = (invoiceId: string) => {
    toast({
      title: "Fatura enviada",
      description: `Fatura ${invoiceId} foi enviada por email.`,
    });
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Gerenciamento de Faturas
        </CardTitle>
        <CardDescription>
          Visualize, baixe e gerencie suas faturas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <Input
            placeholder="Buscar faturas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Próximas Faturas
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Todas
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fatura</TableHead>
              <TableHead>Data Emissão</TableHead>
              <TableHead>Data Vencimento</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{new Date(invoice.date).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{invoice.plan}</TableCell>
                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendInvoice(invoice.id)}
                    >
                      <Mail className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pago este Ano</p>
                  <p className="text-2xl font-bold">$1,287.00</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Faturas Pendentes</p>
                  <p className="text-2xl font-bold">$299.00</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Calendar className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Próximo Pagamento</p>
                  <p className="text-lg font-semibold">15 Fev 2024</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
