
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, Calendar, CreditCard } from "lucide-react";

export const PaymentHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const payments = [
    {
      id: 'PAY-001',
      date: '2024-01-15',
      amount: 99.00,
      plan: 'Professional',
      method: 'Cartão •••• 4242',
      status: 'paid',
      invoice: 'INV-2024-001'
    },
    {
      id: 'PAY-002',
      date: '2023-12-15',
      amount: 99.00,
      plan: 'Professional',
      method: 'Cartão •••• 4242',
      status: 'paid',
      invoice: 'INV-2023-012'
    },
    {
      id: 'PAY-003',
      date: '2023-11-15',
      amount: 99.00,
      plan: 'Professional',
      method: 'Cartão •••• 4242',
      status: 'failed',
      invoice: 'INV-2023-011'
    },
    {
      id: 'PAY-004',
      date: '2023-10-15',
      amount: 29.00,
      plan: 'Basic',
      method: 'Cartão •••• 1234',
      status: 'paid',
      invoice: 'INV-2023-010'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Histórico de Pagamentos
        </CardTitle>
        <CardDescription>
          Visualize todos os pagamentos e faturas da sua conta
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID ou plano..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pagamento</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fatura</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.id}</TableCell>
                <TableCell>{new Date(payment.date).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{payment.plan}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    {payment.invoice}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredPayments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pagamento encontrado com os filtros aplicados.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
