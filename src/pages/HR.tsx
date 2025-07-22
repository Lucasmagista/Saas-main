
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Award,
  Clock,
  Target,
  Shield,
  MessageSquare,
  BarChart3,
  Settings
} from "lucide-react";
import { HRDashboard } from "@/components/hr/HRDashboard";
import { JobsManagement } from "@/components/hr/JobsManagement";
import { CandidatesManagement } from "@/components/hr/CandidatesManagement";
import { EmployeesManagement } from "@/components/hr/EmployeesManagement";
import { PerformanceReview } from "@/components/hr/PerformanceReview";
import { HRAnalytics } from "@/components/hr/HRAnalytics";
import { OnboardingManagement } from "@/components/hr/OnboardingManagement";
import { ComplianceManagement } from "@/components/hr/ComplianceManagement";

const HR = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dados simulados para KPIs
  const hrMetrics = {
    totalEmployees: 324,
    activeJobs: 12,
    pendingCandidates: 89,
    avgHiringTime: 14,
    turnoverRate: 8.2,
    engagementScore: 82,
    diversityIndex: 67,
    complianceScore: 98
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">RH & Gestão de Pessoas</h1>
            <p className="text-muted-foreground">
              Gerencie talentos, recrutamento e desenvolvimento com IA e automação
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Nova Vaga
            </Button>
          </div>
        </div>

        {/* KPIs Rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Colaboradores</p>
                  <p className="text-2xl font-bold">{hrMetrics.totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vagas Ativas</p>
                  <p className="text-2xl font-bold">{hrMetrics.activeJobs}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Candidatos</p>
                  <p className="text-2xl font-bold">{hrMetrics.pendingCandidates}</p>
                </div>
                <UserPlus className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contratação</p>
                  <p className="text-2xl font-bold">{hrMetrics.avgHiringTime}d</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Turnover</p>
                  <p className="text-2xl font-bold">{hrMetrics.turnoverRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Engajamento</p>
                  <p className="text-2xl font-bold">{hrMetrics.engagementScore}%</p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Diversidade</p>
                  <p className="text-2xl font-bold">{hrMetrics.diversityIndex}%</p>
                </div>
                <Users className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compliance</p>
                  <p className="text-2xl font-bold">{hrMetrics.complianceScore}%</p>
                </div>
                <Shield className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navegação por Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Vagas</span>
            </TabsTrigger>
            <TabsTrigger value="candidates" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Candidatos</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Colaboradores</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Onboarding</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Compliance</span>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das Abas */}
          <TabsContent value="dashboard" className="space-y-6">
            <HRDashboard metrics={hrMetrics} />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <JobsManagement />
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <CandidatesManagement />
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <EmployeesManagement />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceReview />
          </TabsContent>

          <TabsContent value="onboarding" className="space-y-6">
            <OnboardingManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <HRAnalytics />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HR;
