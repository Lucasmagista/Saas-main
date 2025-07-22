
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Download, FileText, Database, Calendar, Settings } from "lucide-react";

export const DataExport = () => {
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const exportHistory = [
    { id: 1, name: "Dados de Vendas Q4 2024", format: "Excel", size: "2.3 MB", status: "completed", date: "2024-01-20", downloadCount: 3 },
    { id: 2, name: "Relatório de Usuários", format: "CSV", size: "856 KB", status: "completed", date: "2024-01-19", downloadCount: 1 },
    { id: 3, name: "Dados Financeiros", format: "PDF", size: "1.2 MB", status: "processing", date: "2024-01-19", downloadCount: 0 },
    { id: 4, name: "Analytics Completo", format: "JSON", size: "4.7 MB", status: "failed", date: "2024-01-18", downloadCount: 0 }
  ];

  const dataTypes = [
    { id: "users", label: "Dados de Usuários", count: "1,234" },
    { id: "sales", label: "Dados de Vendas", count: "5,678" },
    { id: "products", label: "Dados de Produtos", count: "890" },
    { id: "analytics", label: "Dados de Analytics", count: "12,345" },
    { id: "logs", label: "Logs do Sistema", count: "45,678" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "processing": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Exportação de Dados</h2>
          <p className="text-muted-foreground">Exporte dados em diversos formatos para análise externa</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Nova Exportação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Exportar Dados</DialogTitle>
              <DialogDescription>Configure sua exportação de dados personalizada</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Selecione os dados para exportar:</Label>
                <div className="space-y-3 mt-3">
                  {dataTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox id={type.id} />
                      <label htmlFor={type.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <span>{type.label}</span>
                          <span className="text-muted-foreground">{type.count} registros</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format">Formato</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel (XLSX)</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="period">Período</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                      <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                      <SelectItem value="last3months">Últimos 3 meses</SelectItem>
                      <SelectItem value="lastyear">Último ano</SelectItem>
                      <SelectItem value="all">Todos os dados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Exportando dados...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} />
                </div>
              )}

              <Button onClick={handleExport} disabled={isExporting} className="w-full">
                {isExporting ? "Exportando..." : "Iniciar Exportação"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Histórico de Exportações
          </CardTitle>
          <CardDescription>Acompanhe suas exportações anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportHistory.map((export_item) => (
              <div key={export_item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{export_item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {export_item.format} • {export_item.size} • {export_item.date}
                    </p>
                    {export_item.downloadCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Downloaded {export_item.downloadCount} time(s)
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(export_item.status)}>
                    {export_item.status}
                  </Badge>
                  {export_item.status === "completed" && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
