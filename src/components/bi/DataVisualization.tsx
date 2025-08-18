
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from "recharts";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Settings } from "lucide-react";

export const DataVisualization = () => {
  const salesData = [
    { month: "Jan", sales: 4000, revenue: 240000, customers: 240 },
    { month: "Fev", sales: 3000, revenue: 180000, customers: 180 },
    { month: "Mar", sales: 5000, revenue: 300000, customers: 300 },
    { month: "Abr", sales: 4500, revenue: 270000, customers: 270 },
    { month: "Mai", sales: 6000, revenue: 360000, customers: 360 },
    { month: "Jun", sales: 5500, revenue: 330000, customers: 330 }
  ];

  const categoryData = [
    { name: "Eletrônicos", value: 400, color: "#8884d8" },
    { name: "Roupas", value: 300, color: "#82ca9d" },
    { name: "Casa & Jardim", value: 200, color: "#ffc658" },
    { name: "Esportes", value: 150, color: "#ff7c7c" }
  ];

  const scatterData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Visualização de Dados</h2>
          <p className="text-muted-foreground">Crie gráficos interativos e visualizações avançadas</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os dados</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Personalizar
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Vendas Mensais
              </CardTitle>
              <CardDescription>Comparação de vendas e receita por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8884d8" />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Vendas por Categoria
              </CardTitle>
              <CardDescription>Distribuição das vendas por categoria de produto</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                Tendência de Crescimento
              </CardTitle>
              <CardDescription>Evolução de clientes ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="customers" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análise de Correlação
              </CardTitle>
              <CardDescription>Relação entre diferentes métricas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={scatterData}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="x" />
                  <YAxis type="number" dataKey="y" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter dataKey="z" fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
