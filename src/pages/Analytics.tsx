
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Download, BarChart3, Activity, Calendar } from "lucide-react";
import { usePerformanceMetrics } from "@/hooks/usePerformanceMetrics";
import { useLeads } from "@/hooks/useLeads";
import { useOpportunities } from "@/hooks/useAdvancedCRM";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("6months");

  // Buscar métricas de performance, leads e oportunidades em tempo real via API backend
  const { data: metrics } = usePerformanceMetrics();
  const { leads } = useLeads();
  const { data: opportunities } = useOpportunities();

  /**
   * Gera dados mensais agregados para as métricas selecionadas (receita, clientes, projetos, satisfação).
   * Agrupa as métricas de performance por mês e somatório/ média conforme o tipo.
   */
  const monthlyData = useMemo(() => {
    if (!metrics || metrics.length === 0) return [];
    // Gerar array com os últimos 6 meses incluindo o mês atual
    const months: { month: string; revenue: number; customers: number; projects: number; satisfaction: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthShort = date.toLocaleString('pt-BR', { month: 'short' });
      const monthMetrics = metrics.filter((m) => {
        const recordedDate = new Date(m.recorded_at);
        return recordedDate.getMonth() === date.getMonth() && recordedDate.getFullYear() === date.getFullYear();
      });
      const revenue = monthMetrics
        .filter((m) => m.metric_name === 'revenue')
        .reduce((sum, m) => sum + m.metric_value, 0);
      const customers = monthMetrics
        .filter((m) => m.metric_name === 'customers')
        .reduce((sum, m) => sum + m.metric_value, 0);
      const projects = monthMetrics
        .filter((m) => m.metric_name === 'projects')
        .reduce((sum, m) => sum + m.metric_value, 0);
      const satisfactionMetrics = monthMetrics.filter((m) => m.metric_name === 'satisfaction');
      const satisfaction = satisfactionMetrics.length > 0
        ? satisfactionMetrics.reduce((sum, m) => sum + m.metric_value, 0) / satisfactionMetrics.length
        : 0;
      months.push({
        month: monthShort.charAt(0).toUpperCase() + monthShort.slice(1),
        revenue,
        customers,
        projects,
        satisfaction,
      });
    }
    return months;
  }, [metrics]);

  // Total de receita acumulada
  const totalRevenue = useMemo(() => {
    return metrics?.filter((m) => m.metric_name === 'revenue').reduce((sum, m) => sum + m.metric_value, 0) || 0;
  }, [metrics]);

  // Total de clientes ativos baseado em leads cadastrados
  const totalCustomers = useMemo(() => {
    return leads?.length || 0;
  }, [leads]);

  // Total de projetos concluídos com base em oportunidades com estágio "Fechado"
  const completedProjects = useMemo(() => {
    return opportunities?.filter((opp) => opp.stage === 'Fechado').length || 0;
  }, [opportunities]);

  // Média de satisfação geral (métrica "satisfaction")
  const averageSatisfaction = useMemo(() => {
    const satisfactionMetrics = metrics?.filter((m) => m.metric_name === 'satisfaction') || [];
    if (satisfactionMetrics.length === 0) return 0;
    const total = satisfactionMetrics.reduce((sum, m) => sum + m.metric_value, 0);
    return total / satisfactionMetrics.length;
  }, [metrics]);

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

        {/* Métricas principais (dinâmicas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Receita Total */}
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Receita Total</p>
                  <p className="text-2xl font-bold">
                    {`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          {/* Clientes */}
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Clientes</p>
                  <p className="text-2xl font-bold">{totalCustomers}</p>
                </div>
                <Activity className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          {/* Projetos Concluídos */}
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Projetos Concluídos</p>
                  <p className="text-2xl font-bold">{completedProjects}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          {/* Satisfação Média */}
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Satisfação Média</p>
                  <p className="text-2xl font-bold">{averageSatisfaction.toFixed(1)}/5</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de receita mensal */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Tendência de Receita</CardTitle>
              <CardDescription>Evolução mensal da receita</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyData.length === 0 ? (
                <p className="text-center py-10 text-gray-500">Sem dados de receita disponíveis.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number | string) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
