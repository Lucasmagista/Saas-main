import { useState, useEffect } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { useOpportunities } from '@/hooks/useAdvancedCRM';

interface DashboardData {
  salesData: Array<{
    name: string;
    vendas: number;
    leads: number;
    conversoes: number;
  }>;
  distributionData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  conversionData: Array<{
    stage: string;
    value: number;
    color: string;
  }>;
  performanceMetrics: {
    totalLeads: number;
    totalOpportunities: number;
    totalRevenue: number;
    conversionRate: number;
    growthRate: number;
  };
}

export const useDashboardData = () => {
  const { leads } = useLeads();
  const { data: opportunities } = useOpportunities();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    salesData: [],
    distributionData: [],
    conversionData: [],
    performanceMetrics: {
      totalLeads: 0,
      totalOpportunities: 0,
      totalRevenue: 0,
      conversionRate: 0,
      growthRate: 0,
    },
  });

  useEffect(() => {
    // Dados simulados para os gráficos baseados nos dados reais
    const realLeadsCount = leads?.length || 0;
    const realOpportunitiesCount = opportunities?.length || 0;
    const realRevenue = opportunities?.reduce((sum, opp) => sum + (opp.value || 0), 0) || 0;

    // Simular dados históricos para os gráficos
    const currentMonth = new Date().getMonth();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const salesData = Array.from({ length: 7 }, (_, i) => {
      const monthIndex = (currentMonth - 6 + i + 12) % 12;
      const baseLeads = Math.max(realLeadsCount, 50);
      const variation = 0.8 + Math.random() * 0.4; // ±20% variation
      
      return {
        name: months[monthIndex],
        vendas: Math.round((realRevenue / 7) * variation),
        leads: Math.round(baseLeads * variation),
        conversoes: Math.round((realOpportunitiesCount / 7) * variation),
      };
    });

    // Distribuição de leads por temperatura (baseado nos dados reais)
    const hotLeads = Math.round(realLeadsCount * 0.35);
    const warmLeads = Math.round(realLeadsCount * 0.45);
    const coldLeads = realLeadsCount - hotLeads - warmLeads;

    const distributionData = [
      { name: 'Leads Quentes', value: hotLeads > 0 ? Math.round((hotLeads / realLeadsCount) * 100) : 35, color: '#ef4444' },
      { name: 'Leads Mornos', value: warmLeads > 0 ? Math.round((warmLeads / realLeadsCount) * 100) : 45, color: '#f59e0b' },
      { name: 'Leads Frios', value: coldLeads > 0 ? Math.round((coldLeads / realLeadsCount) * 100) : 20, color: '#6b7280' },
    ];

    // Funil de conversão
    const conversionData = [
      { stage: 'Visitantes', value: Math.max(realLeadsCount * 4, 1000), color: '#3b82f6' },
      { stage: 'Leads', value: Math.max(realLeadsCount, 250), color: '#8b5cf6' },
      { stage: 'Oportunidades', value: Math.max(realOpportunitiesCount, 75), color: '#f59e0b' },
      { stage: 'Clientes', value: Math.max(Math.round(realOpportunitiesCount * 0.3), 25), color: '#10b981' },
    ];

    const conversionRate = realLeadsCount > 0 ? (realOpportunitiesCount / realLeadsCount) * 100 : 30;
    const growthRate = 12.5; // Simulado

    setDashboardData({
      salesData,
      distributionData,
      conversionData,
      performanceMetrics: {
        totalLeads: realLeadsCount,
        totalOpportunities: realOpportunitiesCount,
        totalRevenue: realRevenue,
        conversionRate,
        growthRate,
      },
    });
  }, [leads, opportunities]);

  return dashboardData;
};
