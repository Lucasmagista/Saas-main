
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, Download, Calendar, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const monthlyData = [
    { month: "Jul", revenue: 45000, customers: 120, projects: 8, satisfaction: 4.2 },
    { month: "Ago", revenue: 52000, customers: 135, projects: 10, satisfaction: 4.3 },
    { month: "Set", revenue: 48000, customers: 142, projects: 9, satisfaction: 4.1 },
    { month: "Out", revenue: 61000, customers: 158, projects: 12, satisfaction: 4.4 },
    { month: "Nov", revenue: 73000, customers: 167, projects: 15, satisfaction: 4.5 },
    { month: "Dez", revenue: 85000, customers: 189, projects: 18, satisfaction: 4.6 },
  ];

  const departmentPerformance = [
    { name: "Vendas", value: 35, color: "#3b82f6" },
    { name: "Marketing", value: 25, color: "#10b981" },
    { name: "Desenvolvimento", value: 20, color: "#f59e0b" },
    { name: "Suporte", value: 15, color: "#ef4444" },
    { name: "Outros", value: 5, color: "#8b5cf6" },
  ];

  const projectTypes = [
    { name: "Web Development", completed: 12, inProgress: 5, planned: 3 },
    { name: "Mobile Apps", completed: 8, inProgress: 4, planned: 6 },
    { name: "UI/UX Design", completed: 15, inProgress: 3, planned: 2 },
    { name: "Consultoria", completed: 6, inProgress: 2, planned: 4 },
    { name: "Treinamento", completed: 9, inProgress: 1, planned: 1 },
  ];

  const customerSegments = [
    { segment: "Enterprise", customers: 45, revenue: 320000, growth: 12.5 },
    { segment: "SMB", customers: 128, revenue: 180000, growth: 18.2 },
    { segment: "Startup", customers: 89, revenue: 95000, growth: 24.1 },
    { segment: "Freelancer", customers: 156, revenue: 65000, growth: 8.7 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Avançado</h1>
            <p className="text-gray-600 mt-1">Insights detalhados sobre performance empresarial</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Último mês</SelectItem>
                <SelectItem value="3months">3 meses</SelectItem>
                <SelectItem value="6months">6 meses</SelectItem>
                <SelectItem value="1year">1 ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Receita Total</p>
                  <p className="text-2xl font-bold">R$ 364.000</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+23.5%</span>
                  </div>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Clientes Ativos</p>
                  <p className="text-2xl font-bold">1,311</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+15.3%</span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Projetos Concluídos</p>
                  <p className="text-2xl font-bold">72</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+8.2%</span>
                  </div>
                </div>
                <PieChartIcon className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Satisfação Média</p>
                  <p className="text-2xl font-bold">4.4/5</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+0.3</span>
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Tendência de Receita</CardTitle>
              <CardDescription>Evolução mensal da receita e crescimento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, "Receita"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Performance por Departamento</CardTitle>
              <CardDescription>Contribuição de cada departamento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {departmentPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {departmentPerformance.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Projetos por Tipo</CardTitle>
                <CardDescription>Status detalhado dos projetos por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {projectTypes.map((type, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{type.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">{type.completed} Concluídos</Badge>
                          <Badge className="bg-blue-100 text-blue-800">{type.inProgress} Em Andamento</Badge>
                          <Badge className="bg-yellow-100 text-yellow-800">{type.planned} Planejados</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-green-100 h-2 rounded" style={{ width: `${(type.completed / (type.completed + type.inProgress + type.planned)) * 100}%` }}></div>
                        <div className="bg-blue-100 h-2 rounded" style={{ width: `${(type.inProgress / (type.completed + type.inProgress + type.planned)) * 100}%` }}></div>
                        <div className="bg-yellow-100 h-2 rounded" style={{ width: `${(type.planned / (type.completed + type.inProgress + type.planned)) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Segmentação de Clientes</CardTitle>
                <CardDescription>Análise detalhada por segmento de mercado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerSegments.map((segment, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{segment.segment}</h4>
                        <Badge className={segment.growth > 15 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                          +{segment.growth}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Clientes</p>
                          <p className="font-medium text-lg">{segment.customers}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Receita</p>
                          <p className="font-medium text-lg">R$ {segment.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Ticket Médio</p>
                          <p className="font-medium text-lg">R$ {Math.round(segment.revenue / segment.customers).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
                <CardDescription>Indicadores comparativos mensais</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
