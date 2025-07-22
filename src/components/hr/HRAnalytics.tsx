
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export const HRAnalytics = () => {
  // Dados simulados para analytics
  const hiringTrendData = [
    { month: 'Jan', contratacoes: 8, demissoes: 3, liquido: 5 },
    { month: 'Fev', contratacoes: 12, demissoes: 2, liquido: 10 },
    { month: 'Mar', contratacoes: 15, demissoes: 4, liquido: 11 },
    { month: 'Abr', contratacoes: 18, demissoes: 5, liquido: 13 },
    { month: 'Mai', contratacoes: 14, demissoes: 3, liquido: 11 },
    { month: 'Jun', contratacoes: 22, demissoes: 6, liquido: 16 }
  ];

  const diversityData = [
    { name: 'Homens', value: 60, color: '#3b82f6' },
    { name: 'Mulheres', value: 40, color: '#ec4899' }
  ];

  const ageDistribution = [
    { range: '18-25', count: 45 },
    { range: '26-35', count: 128 },
    { range: '36-45', count: 89 },
    { range: '46-55', count: 42 },
    { range: '56+', count: 18 }
  ];

  const satisfactionTrend = [
    { month: 'Jan', satisfacao: 78, engajamento: 75 },
    { month: 'Fev', satisfacao: 80, engajamento: 77 },
    { month: 'Mar', satisfacao: 82, engajamento: 80 },
    { month: 'Abr', satisfacao: 85, engajamento: 83 },
    { month: 'Mai', satisfacao: 87, engajamento: 85 },
    { month: 'Jun', satisfacao: 89, engajamento: 88 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics de RH</h2>
        <p className="text-muted-foreground">
          Insights detalhados sobre pessoas, performance e tendências organizacionais
        </p>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">14 dias</div>
              <div className="text-sm text-muted-foreground">Tempo Médio Contratação</div>
              <div className="text-xs text-green-600 mt-1">-3 dias vs meta</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">8.2%</div>
              <div className="text-sm text-muted-foreground">Taxa de Turnover</div>
              <div className="text-xs text-green-600 mt-1">-1.3% vs ano anterior</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">89%</div>
              <div className="text-sm text-muted-foreground">Satisfação Interna</div>
              <div className="text-xs text-green-600 mt-1">+7% vs trimestre</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">67%</div>
              <div className="text-sm text-muted-foreground">Diversidade</div>
              <div className="text-xs text-green-600 mt-1">+5% vs meta</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência de Contratações */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Contratações</CardTitle>
            <CardDescription>
              Movimentação mensal de colaboradores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hiringTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="contratacoes" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981" 
                  name="Contratações"
                />
                <Area 
                  type="monotone" 
                  dataKey="demissoes" 
                  stackId="2"
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  name="Demissões"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Gênero */}
        <Card>
          <CardHeader>
            <CardTitle>Diversidade de Gênero</CardTitle>
            <CardDescription>
              Distribuição atual do quadro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={diversityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {diversityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Porcentagem']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {diversityData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição Etária */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição Etária</CardTitle>
            <CardDescription>
              Faixas etárias dos colaboradores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Satisfação e Engajamento */}
        <Card>
          <CardHeader>
            <CardTitle>Satisfação e Engajamento</CardTitle>
            <CardDescription>
              Tendência dos índices de clima organizacional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={satisfactionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[70, 95]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="satisfacao" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Satisfação"
                />
                <Line 
                  type="monotone" 
                  dataKey="engajamento" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Engajamento"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Avançadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Custo por Contratação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">R$ 2.847</div>
            <div className="text-sm text-muted-foreground">
              Média dos últimos 6 meses
            </div>
            <div className="text-xs text-green-600 mt-1">
              -12% vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retenção de Talentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">91.8%</div>
            <div className="text-sm text-muted-foreground">
              Taxa de retenção anual
            </div>
            <div className="text-xs text-green-600 mt-1">
              +2.3% vs ano anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promoções Internas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">76%</div>
            <div className="text-sm text-muted-foreground">
              Vagas preenchidas internamente
            </div>
            <div className="text-xs text-green-600 mt-1">
              +8% vs meta (70%)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
