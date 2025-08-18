
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, Download, Calendar as CalendarIcon, Plus, Search, Filter } from "lucide-react";

export const AdvancedReports = () => {
  const [date, setDate] = useState<Date>();

  const reports = [
    { id: 1, name: "Relatório de Vendas Mensais", type: "sales", status: "completed", createdAt: "2024-01-20", size: "2.5 MB", format: "PDF" },
    { id: 2, name: "Análise de Performance", type: "performance", status: "processing", createdAt: "2024-01-20", size: "1.8 MB", format: "Excel" },
    { id: 3, name: "Relatório Financeiro Q4", type: "financial", status: "completed", createdAt: "2024-01-19", size: "3.2 MB", format: "PDF" },
    { id: 4, name: "Métricas de Usuários", type: "users", status: "failed", createdAt: "2024-01-19", size: "0 MB", format: "CSV" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "processing": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Relatórios Avançados</h2>
          <p className="text-muted-foreground">Gere relatórios detalhados com dados personalizados</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Relatório</DialogTitle>
              <DialogDescription>Configure um novo relatório personalizado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-name">Nome do Relatório</Label>
                <Input id="report-name" placeholder="Nome do relatório" />
              </div>
              <div>
                <Label htmlFor="report-type">Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Vendas</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="users">Usuários</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Período</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? date.toLocaleDateString() : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="format">Formato</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Formato do arquivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Gerar Relatório</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar relatórios..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sales">Vendas</SelectItem>
            <SelectItem value="financial">Financeiro</SelectItem>
            <SelectItem value="users">Usuários</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {report.format} • {report.size} • {report.createdAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                  {report.status === "completed" && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
