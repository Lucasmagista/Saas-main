
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Plus, Settings, Share, Download } from "lucide-react";

export const CustomDashboards = () => {
  const salesData = [
    { month: "Jan", sales: 4000, revenue: 240000 },
    { month: "Fev", sales: 3000, revenue: 180000 },
    { month: "Mar", sales: 5000, revenue: 300000 },
    { month: "Abr", sales: 4500, revenue: 270000 },
    { month: "Mai", sales: 6000, revenue: 360000 },
    { month: "Jun", sales: 5500, revenue: 330000 }
  ];

  const pieData = [
    { name: "Desktop", value: 400, color: "#8884d8" },
    { name: "Mobile", value: 300, color: "#82ca9d" },
    { name: "Tablet", value: 200, color: "#ffc658" }
  ];

  const dashboards = [
    { id: 1, name: "Dashboard Vendas", description: "Métricas de vendas e receita", widgets: 8, lastUpdated: "5 min atrás", status: "active" },
    { id: 2, name: "Dashboard Marketing", description: "Análise de campanhas e conversões", widgets: 6, lastUpdated: "15 min atrás", status: "active" },
    { id: 3, name: "Dashboard Financeiro", description: "Relatórios financeiros e custos", widgets: 10, lastUpdated: "1h atrás", status: "draft" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboards Personalizados</h2>
          <p className="text-muted-foreground">Crie e gerencie dashboards com métricas customizadas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Dashboard
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                  <CardDescription>{dashboard.description}</CardDescription>
                </div>
                <Badge variant={dashboard.status === "active" ? "default" : "secondary"}>
                  {dashboard.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Widgets: {dashboard.widgets}</span>
                  <span className="text-muted-foreground">{dashboard.lastUpdated}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vendas vs Receita</CardTitle>
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
            <CardTitle>Distribuição por Dispositivo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
