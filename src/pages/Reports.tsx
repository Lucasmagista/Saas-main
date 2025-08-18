
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Download, FileText, Mail, Calendar, TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Activity, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30days");
  const [reportType, setReportType] = useState("all");

  const revenueData = [
    { month: "Jan", revenue: 45000, orders: 120, customers: 89 },
    { month: "Fev", revenue: 52000, orders: 135, customers: 98 },
    { month: "Mar", revenue: 48000, orders: 142, customers: 105 },
    { month: "Abr", revenue: 61000, orders: 158, customers: 112 },
    { month: "Mai", revenue: 73000, orders: 167, customers: 128 },
    { month: "Jun", revenue: 85000, orders: 189, customers: 145 },
  ];

  const salesByChannel = [
    { name: "Website", value: 45, color: "#3b82f6" },
    { name: "Mobile App", value: 30, color: "#10b981" },
    { name: "Social Media", value: 15, color: "#f59e0b" },
    { name: "Email", value: 10, color: "#ef4444" },
  ];

  // Helper to map color hex to Tailwind class
  const getChannelColorClass = (color: string) => {
    switch (color) {
      case "#3b82f6":
        return "bg-blue-500";
      case "#10b981":
        return "bg-green-500";
      case "#f59e0b":
        return "bg-yellow-500";
      case "#ef4444":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const topProducts = [
    { name: "CRM Pro", sales: 2456, revenue: 147360, growth: 23.5 },
    { name: "Analytics Suite", sales: 1892, revenue: 113520, growth: 18.2 },
    { name: "Automation Tools", sales: 1456, revenue: 87360, growth: 12.8 },
    { name: "Mobile SDK", sales: 989, revenue: 59340, growth: -5.2 },
    { name: "API Access", sales: 745, revenue: 44700, growth: 31.6 }
  ];

  const reports = [
    {
      id: 1,
      name: "Relatório de Vendas Mensal",
      type: "sales",
      status: "completed",
      generated: "2 horas atrás",
      size: "2.4 MB",
      downloads: 47
    },
    {
      id: 2,
      name: "Análise de Clientes Q4",
      type: "customers",
      status: "processing",
      generated: "Processando...",
      size: "Calculando...",
      downloads: 0
    },
    {
      id: 3,
      name: "Performance de Marketing",
      type: "marketing",
      status: "completed",
      generated: "1 dia atrás",
      size: "1.8 MB",
      downloads: 23
    },
    {
      id: 4,
      name: "Relatório Financeiro",
      type: "financial",
      status: "scheduled",
      generated: "Agendado para amanhã",
      size: "-",
      downloads: 0
    }
  ];

  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Queda nas Vendas",
      description: "Vendas caíram 15% nos últimos 7 dias",
      time: "2 horas atrás"
    },
    {
      id: 2,
      type: "success",
      title: "Meta Atingida",
      description: "Receita mensal superou a meta em 12%",
      time: "1 dia atrás"
    },
    {
      id: 3,
      type: "info",
      title: "Novo Relatório",
      description: "Relatório de performance está disponível",
      time: "2 dias atrás"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "info":
        return <Activity className="w-5 h-5 text-blue-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleDownload = (reportName: string) => {
    toast({
      title: "Download iniciado",
      description: `O relatório "${reportName}" está sendo baixado.`,
    });
  };

  const handleScheduleReport = () => {
    toast({
      title: "Relatório agendado",
      description: "O relatório será gerado automaticamente.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios & Analytics</h1>
            <p className="text-gray-600 mt-1">Insights detalhados e relatórios personalizados</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="90days">Últimos 90 dias</SelectItem>
                <SelectItem value="1year">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Receita Total</p>
                  <p className="text-2xl font-bold">R$ 364K</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+15.3%</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Novos Clientes</p>
                  <p className="text-2xl font-bold">247</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+8.2%</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Pedidos</p>
                  <p className="text-2xl font-bold">1,847</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+12.7%</span>
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Conversão</p>
                  <p className="text-2xl font-bold">3.2%</p>
                  <div className="flex items-center mt-1">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    <span className="text-sm">-2.1%</span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Receita</CardTitle>
              <CardDescription>Receita mensal dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === "revenue" ? `R$ ${value.toLocaleString()}` : value,
                    name === "revenue" ? "Receita" : name === "orders" ? "Pedidos" : "Clientes"
                  ]} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendas por Canal</CardTitle>
              <CardDescription>Distribuição de vendas por canal</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesByChannel}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {salesByChannel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {salesByChannel.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produtos</CardTitle>
            <CardDescription>Produtos mais vendidos no período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.sales} vendas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">R$ {product.revenue.toLocaleString()}</p>
                      <div className="flex items-center">
                        {product.growth > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                        )}
                        <span className={`text-sm ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.growth > 0 ? '+' : ''}{product.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reports Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Gerados</CardTitle>
              <CardDescription>Histórico de relatórios disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-gray-600">{report.generated}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status === "completed" ? "Concluído" :
                         report.status === "processing" ? "Processando" :
                         report.status === "scheduled" ? "Agendado" : "Falhou"}
                      </Badge>
                      {report.status === "completed" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(report.name)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas Automáticos</CardTitle>
              <CardDescription>Notificações baseadas em métricas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={handleScheduleReport}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Configurar Alertas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
