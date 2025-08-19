import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import styles from './ComplianceManagement.module.css';
import { 
  FileText, 
  Clock, 
  Download, 
  Eye, 
  UserCheck, 
  Trash2, 
  Plus,
  AlertTriangle,
  CheckCircle,
  Shield,
  Users,
  Activity,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Bell,
  TrendingUp,
  Lock,
  FileCheck
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/api";

interface CompliancePolicy {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}
type PolicyInsert = Omit<CompliancePolicy, 'id' | 'created_at' | 'updated_at'>;
type PolicyUpdate = Partial<PolicyInsert>;

interface PolicyFormData {
  title: string;
  description: string;
  version: string;
  status: string;
  compliance: number;
  assigned_employees: number;
  acknowledged_by: number;
}

interface AuditLog {
  id: number;
  action: string;
  user: string;
  resource: string;
  timestamp: string;
  type: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface DataRetentionPolicy {
  category: string;
  retention: string;
  autoDelete: boolean;
  pendingDeletion: number;
  nextCleanup: string;
  status: 'active' | 'warning' | 'critical';
}

interface Training {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  completion_rate: number;
  assigned_users: number;
  completed_users: number;
  created_at: string;
  updated_at: string;
}

export const ComplianceManagement: React.FC = () => {
  const [policies, setPolicies] = useState<CompliancePolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dataRetentionPolicies, setDataRetentionPolicies] = useState<DataRetentionPolicy[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loadingTrainings, setLoadingTrainings] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [loadingRetention, setLoadingRetention] = useState(false);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateTrainingModalOpen, setIsCreateTrainingModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<CompliancePolicy | null>(null);

  // Form data
  const [formData, setFormData] = useState<PolicyFormData>({
    title: "",
    description: "",
    version: "1.0",
    status: "draft",
    compliance: 0,
    assigned_employees: 0,
    acknowledged_by: 0
  });

  const [trainingFormData, setTrainingFormData] = useState({
    title: "",
    description: "",
    type: "security",
    assigned_users: 0,
    status: "draft"
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      version: "1.0",
      status: "draft",
      compliance: 0,
      assigned_employees: 0,
      acknowledged_by: 0
    });
  };

  const resetTrainingForm = () => {
    setTrainingFormData({
      title: "",
      description: "",
      type: "security",
      assigned_users: 0,
      status: "draft"
    });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchPolicies(),
        fetchAuditLogs(),
        fetchDataRetentionPolicies(),
        fetchTrainings()
      ]);
    };
    
    fetchAllData();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await makeAuthenticatedRequest('/api/compliance/policies', 'GET');
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Dados de políticas inválidos');
      }
      
      setPolicies(data || []);
    } catch (error: unknown) {
      setError("Erro ao buscar políticas: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      // Simulando uma busca de logs de auditoria - você pode adaptar para sua tabela real
      const data = await makeAuthenticatedRequest('/api/audit-logs?limit=50', 'GET');
      
      if (!data || !Array.isArray(data)) {
        console.warn("Tabela audit_logs não encontrada, usando dados vazios");
        setAuditLogs([]);
      } else {
        const formattedAuditLogs: AuditLog[] = (data || []).map((log, index) => ({
          id: index + 1,
          user: 'Sistema',
          action: log.action,
          resource: log.resource_type,
          timestamp: log.created_at,
          type: 'system',
          details: `Ação: ${log.action}`,
          severity: 'low'
        }));
        setAuditLogs(formattedAuditLogs);
      }
    } catch (error: unknown) {
      console.warn("Erro ao buscar logs de auditoria:", error);
      setAuditLogs([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  const fetchDataRetentionPolicies = async () => {
    setLoadingRetention(true);
    try {
      // Simulando uma busca de políticas de retenção - você pode adaptar para sua tabela real
      const data = await makeAuthenticatedRequest('/api/compliance/policies', 'GET');
      
      if (!data || !Array.isArray(data)) {
        console.warn("Erro ao buscar políticas de retenção: dados inválidos");
        setDataRetentionPolicies([]);
      } else {
        const formattedRetentionPolicies: DataRetentionPolicy[] = (data || []).map(policy => ({
          id: policy.id,
          title: policy.title,
          description: policy.description,
          category: policy.category,
          retention: '12 meses',
          autoDelete: true,
          pendingDeletion: 0,
          nextCleanup: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: (policy.status === 'active' || policy.status === 'warning' || policy.status === 'critical') ? policy.status : 'active'
        }));
        setDataRetentionPolicies(formattedRetentionPolicies);
      }
    } catch (error: unknown) {
      console.warn("Erro ao buscar políticas de retenção:", error);
      setDataRetentionPolicies([]);
    } finally {
      setLoadingRetention(false);
    }
  };

  const fetchTrainings = async () => {
    setLoadingTrainings(true);
    try {
      const data = await makeAuthenticatedRequest('/api/compliance/policies', 'GET');
      
      if (!data || !Array.isArray(data)) {
        console.warn("Erro ao buscar treinamentos: dados inválidos");
        setTrainings([]);
      } else {
        const formattedTrainings: Training[] = (data || []).map(policy => ({
          id: policy.id,
          title: policy.title,
          description: policy.description,
          type: 'security',
          completion_rate: Math.round(Math.random() * 100),
          assigned_users: Math.round(Math.random() * 50) + 10,
          completed_users: Math.round(Math.random() * 30) + 5,
          status: (policy.status === 'active' || policy.status === 'completed' || policy.status === 'expired' || policy.status === 'draft') ? policy.status : 'active',
          created_at: policy.created_at,
          updated_at: policy.last_update || policy.created_at
        }));
        setTrainings(formattedTrainings);
      }
    } catch (error: unknown) {
      console.warn("Erro ao buscar treinamentos:", error);
      setTrainings([]);
    } finally {
      setLoadingTrainings(false);
    }
  };

  // CRUD Functions
  const createPolicy = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/compliance/policies', 'POST', formData);

      if (!data) {
        throw new Error('Erro ao criar política');
      }

      setPolicies(prev => [data, ...prev]);
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: "Política criada com sucesso!",
        description: `${data.title} foi adicionada ao sistema.`,
      });
    } catch (error: unknown) {
      toast({
        title: "Erro ao criar política",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const updatePolicy = async () => {
    if (!selectedPolicy) return;

    try {
      const data = await makeAuthenticatedRequest(`/api/compliance/policies/${selectedPolicy.id}`, 'PUT', {
        ...formData,
        last_update: new Date().toISOString()
      });

      if (!data) {
        throw new Error('Erro ao atualizar política');
      }

      setPolicies(prev => prev.map(policy => 
        policy.id === selectedPolicy.id ? data : policy
      ));
      setIsEditModalOpen(false);
      setSelectedPolicy(null);
      resetForm();
      toast({
        title: "Política atualizada!",
        description: `${data.title} foi atualizada com sucesso.`,
      });
    } catch (error: unknown) {
      toast({
        title: "Erro ao atualizar política",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const deletePolicy = async () => {
    if (!selectedPolicy) return;

    try {
      await makeAuthenticatedRequest(`/api/compliance/policies/${selectedPolicy.id}`, 'DELETE');

      setPolicies(prev => prev.filter(policy => policy.id !== selectedPolicy.id));
      setIsDeleteDialogOpen(false);
      setSelectedPolicy(null);
      toast({
        title: "Política removida",
        description: "A política foi removida do sistema.",
      });
    } catch (error: unknown) {
      toast({
        title: "Erro ao remover política",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const createTraining = async () => {
    try {
      // Simula criação de treinamento usando a tabela compliance_policies
      const newTraining = {
        title: trainingFormData.title,
        description: trainingFormData.description,
        category: trainingFormData.type,
        status: trainingFormData.status,
        assigned_employees: trainingFormData.assigned_users,
        acknowledged_by: 0,
        compliance: 0,
        version: "1.0"
      };

      const data = await makeAuthenticatedRequest('/api/compliance/policies', 'POST', newTraining);

      if (!data) {
        throw new Error('Erro ao criar treinamento');
      }

      // Converte para formato de treinamento
      const formattedTraining: Training = {
        id: data.id,
        title: data.title,
        description: data.description,
        type: data.category || 'security',
        completion_rate: 0,
        assigned_users: data.assigned_employees || 0,
        completed_users: 0,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.created_at
      };

      setTrainings(prev => [formattedTraining, ...prev]);
      setIsCreateTrainingModalOpen(false);
      resetTrainingForm();
      toast({
        title: "Treinamento criado com sucesso!",
        description: `${data.title} foi adicionado ao sistema.`,
      });
    } catch (error: unknown) {
      toast({
        title: "Erro ao criar treinamento",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Helper functions
  const handleCreatePolicy = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEditPolicy = (policy: CompliancePolicy) => {
    setSelectedPolicy(policy);
    setFormData({
      title: policy.title || "",
      description: policy.description || "",
      version: policy.version || "1.0",
      status: policy.status || "draft",
      compliance: policy.compliance || 0,
      assigned_employees: policy.assigned_employees || 0,
      acknowledged_by: policy.acknowledged_by || 0
    });
    setIsEditModalOpen(true);
  };

  const handleViewPolicy = (policy: CompliancePolicy) => {
    setSelectedPolicy(policy);
    setIsViewModalOpen(true);
  };

  const handleDeletePolicy = (policy: CompliancePolicy) => {
    setSelectedPolicy(policy);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateTraining = () => {
    resetTrainingForm();
    setIsCreateTrainingModalOpen(true);
  };

  // Funções auxiliares para renderização condicional
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativa', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      review: { label: 'Em Revisão', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      draft: { label: 'Rascunho', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
      expired: { label: 'Expirada', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  const getActionIcon = (type: string) => {
    const icons = {
      update: FileText,
      access: Eye,
      deletion: Trash2,
      training: UserCheck,
      create: Plus,
      policy: Shield
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { label: 'Baixa', variant: 'outline' as const, color: 'bg-blue-100 text-blue-800' },
      medium: { label: 'Média', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'Alta', variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      critical: { label: 'Crítica', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };
    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.low;
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  const getComplianceStatus = (percentage: number) => {
    if (percentage >= 95) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle };
    if (percentage >= 80) return { status: 'good', color: 'text-blue-600', icon: Shield };
    if (percentage >= 60) return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'critical', color: 'text-red-600', icon: AlertTriangle };
  };

  // Filter policies
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: policies.length,
    active: policies.filter(p => p.status === 'active').length,
    draft: policies.filter(p => p.status === 'draft').length,
    expired: policies.filter(p => p.status === 'expired').length,
    averageCompliance: policies.length > 0 
      ? (policies.reduce((sum, p) => sum + (p.compliance || 0), 0) / policies.length).toFixed(1)
      : "0",
    criticalAlerts: auditLogs.filter(log => log.severity === 'critical' || log.severity === 'high').length,
    totalTrainings: trainings.length,
    completedTrainings: trainings.filter(t => t.status === 'completed').length,
    pendingRetention: dataRetentionPolicies.reduce((sum, p) => sum + p.pendingDeletion, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Políticas</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Políticas Ativas</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Rascunho</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <Edit className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Médio</p>
                <p className="text-3xl font-bold text-purple-600">{stats.averageCompliance}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas</p>
                <p className="text-3xl font-bold text-red-600">{stats.criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Compliance */}
      {stats.criticalAlerts > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">Alertas de Compliance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditLogs
                .filter(log => log.severity === 'critical' || log.severity === 'high')
                .slice(0, 3)
                .map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">{log.action}</p>
                        <p className="text-sm text-red-600">{log.details}</p>
                      </div>
                    </div>
                    {getSeverityBadge(log.severity)}
                  </div>
                ))}
              {stats.criticalAlerts === 0 && (
                <div className="text-center py-4">
                  <p className="text-red-600">Nenhum alerta crítico no momento</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Compliance & Privacidade</h2>
          <p className="text-muted-foreground">
            Gestão de conformidade, LGPD e auditoria de dados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Relatório Geral
          </Button>
          <Button onClick={handleCreatePolicy}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Política
          </Button>
        </div>
      </div>

      <Tabs defaultValue="policies" className="mt-8">
        <TabsList>
          <TabsTrigger value="policies">Políticas</TabsTrigger>
          <TabsTrigger value="retention">Retenção de Dados</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="training">Treinamentos</TabsTrigger>
        </TabsList>
        
        {/* Aba de Políticas */}
        <TabsContent value="policies" className="space-y-6">
          {/* Filtros e Busca */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar políticas por título ou descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="draft">Rascunhos</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    <SelectItem value="expired">Expiradas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading && (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 animate-spin mx-auto mb-4" />
              Carregando políticas...
            </div>
          )}
          
          {error && (
            <Card>
              <CardContent className="text-center py-12 text-red-600">{error}</CardContent>
            </Card>
          )}
          
          {!loading && !error && filteredPolicies.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {policies.length === 0 ? "Nenhuma política encontrada" : "Nenhuma política corresponde aos filtros"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {policies.length === 0 
                    ? "Comece criando sua primeira política de compliance."
                    : "Tente ajustar os filtros de busca."
                  }
                </p>
                {policies.length === 0 && (
                  <Button onClick={handleCreatePolicy}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Política
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          
          {!loading && !error && filteredPolicies.length > 0 && (
            <div className="grid gap-6">
              {filteredPolicies.map((policy) => {
                const complianceStatus = getComplianceStatus(policy.compliance || 0);
                const IconComponent = complianceStatus.icon;
                
                return (
                  <Card key={policy.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold">{policy.title}</h3>
                            {getStatusBadge(policy.status ?? "active")}
                            <Badge variant="outline">v{policy.version}</Badge>
                            <IconComponent className={`h-4 w-4 ${complianceStatus.color}`} />
                          </div>
                          <p className="text-muted-foreground mb-4">{policy.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Compliance</div>
                              <div className={`font-semibold ${complianceStatus.color}`}>{policy.compliance ?? 0}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Atribuída</div>
                              <div className="font-semibold">{policy.assigned_employees ?? 0} pessoas</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Confirmada</div>
                              <div className="font-semibold">{policy.acknowledged_by ?? 0} pessoas</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Atualizada</div>
                              <div className="font-semibold">
                                {policy.last_update ? new Date(policy.last_update).toLocaleDateString("pt-BR") : "-"}
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={policy.assigned_employees && policy.acknowledged_by ? (policy.acknowledged_by / policy.assigned_employees) * 100 : 0}
                            className="mb-4"
                          />
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handleViewPolicy(policy)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditPolicy(policy)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeletePolicy(policy)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Aba de Retenção de Dados */}
        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Políticas de Retenção de Dados
                  </CardTitle>
                  <CardDescription>
                    Gestão automática de ciclo de vida dos dados conforme LGPD
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Relatório de Retenção
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingRetention && (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Carregando políticas de retenção...</p>
                </div>
              )}

              {!loadingRetention && dataRetentionPolicies.length === 0 && (
                <div className="text-center py-12">
                  <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma política de retenção encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure políticas de retenção de dados para estar em conformidade com a LGPD.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Política de Retenção
                  </Button>
                </div>
              )}

              {!loadingRetention && dataRetentionPolicies.length > 0 && (
                <>
                  <div className="space-y-4">
                    {dataRetentionPolicies.map((policy) => {
                      const statusColors = {
                        active: 'border-green-200 bg-green-50',
                        warning: 'border-yellow-200 bg-yellow-50',
                        critical: 'border-red-200 bg-red-50'
                      };

                      const getBadgeVariant = (status: string) => {
                        if (status === 'critical') return 'destructive';
                        if (status === 'warning') return 'secondary';
                        return 'outline';
                      };

                      const getBadgeText = (status: string) => {
                        if (status === 'critical') return 'Ação Necessária';
                        if (status === 'warning') return 'Atenção';
                        return 'Normal';
                      };

                      const getTextColor = (status: string) => {
                        if (status === 'critical') return 'text-red-600';
                        if (status === 'warning') return 'text-yellow-600';
                        return 'text-green-600';
                      };
                      
                      return (
                        <div key={policy.category} className={`flex items-center justify-between p-4 border rounded-lg ${statusColors[policy.status]}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{policy.category}</h4>
                              <Badge variant={getBadgeVariant(policy.status)}>
                                {getBadgeText(policy.status)}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Retenção: {policy.retention} | {policy.autoDelete ? 'Exclusão Automática' : 'Exclusão Manual'}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className={`text-lg font-bold ${getTextColor(policy.status)}`}>
                                {policy.pendingDeletion}
                              </div>
                              <div className="text-xs text-muted-foreground">Pendentes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">{policy.nextCleanup}</div>
                              <div className="text-xs text-muted-foreground">Próxima limpeza</div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              {policy.pendingDeletion > 0 && (
                                <Button size="sm" variant={policy.status === 'critical' ? 'destructive' : 'default'}>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Limpar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Resumo de Retenção */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-blue-800">Resumo de Retenção</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium">Total Pendente:</span>
                        <span className="ml-2">{stats.pendingRetention} registros</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Críticos:</span>
                        <span className="ml-2">{dataRetentionPolicies.filter(p => p.status === 'critical').length} categorias</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Próxima Ação:</span>
                        <span className="ml-2">{dataRetentionPolicies.filter(p => p.nextCleanup !== '-').sort((a, b) => new Date(a.nextCleanup).getTime() - new Date(b.nextCleanup).getTime())[0]?.nextCleanup || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Auditoria */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Trilha de Auditoria
                  </CardTitle>
                  <CardDescription>
                    Registro completo de todas as ações relacionadas a dados pessoais
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAudit && (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Carregando logs de auditoria...</p>
                </div>
              )}

              {!loadingAudit && auditLogs.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum log de auditoria encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Os logs de auditoria aparecerão aqui conforme as ações forem realizadas no sistema.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-800">
                      💡 Configure a auditoria automática para rastrear todas as ações de compliance
                    </p>
                  </div>
                </div>
              )}

              {!loadingAudit && auditLogs.length > 0 && (
                <>
                  {/* Filtros Rápidos */}
                  <div className="flex gap-2 mb-6">
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                      Todos ({auditLogs.length})
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 border-red-200 text-red-700">
                      Críticos ({auditLogs.filter(log => log.severity === 'critical').length})
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 border-orange-200 text-orange-700">
                      Altos ({auditLogs.filter(log => log.severity === 'high').length})
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 border-yellow-200 text-yellow-700">
                      Médios ({auditLogs.filter(log => log.severity === 'medium').length})
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {auditLogs.map((log) => {
                      const IconComponent = getActionIcon(log.type);
                      const severityColors = {
                        low: 'border-l-blue-500',
                        medium: 'border-l-yellow-500',
                        high: 'border-l-orange-500',
                        critical: 'border-l-red-500'
                      };
                      
                      return (
                        <div key={log.id} className={`flex items-start gap-4 p-4 border rounded-lg border-l-4 ${severityColors[log.severity]} hover:shadow-sm transition-shadow`}>
                          <IconComponent className="h-5 w-5 mt-0.5 text-primary" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-medium">{log.action}</h4>
                              <Badge variant="outline" className="text-xs">{log.type}</Badge>
                              {getSeverityBadge(log.severity)}
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              <strong>Usuário:</strong> {log.user}
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              <strong>Recurso:</strong> {log.resource}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Estatísticas de Auditoria */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{auditLogs.length}</div>
                      <div className="text-sm text-blue-700">Total de Eventos</div>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{auditLogs.filter(log => log.severity === 'critical').length}</div>
                      <div className="text-sm text-red-700">Eventos Críticos</div>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">{auditLogs.filter(log => log.type === 'access').length}</div>
                      <div className="text-sm text-yellow-700">Acessos Registrados</div>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{auditLogs.filter(log => log.type === 'training').length}</div>
                      <div className="text-sm text-green-700">Treinamentos</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Treinamentos */}
        <TabsContent value="training" className="space-y-6">
          {/* Dashboard de Treinamentos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Treinamentos</p>
                    <p className="text-2xl font-bold">{stats.totalTrainings}</p>
                  </div>
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedTrainings}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                    <p className="text-2xl font-bold text-yellow-600">{trainings.filter(t => t.status === 'in_progress').length}</p>
                  </div>
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.totalTrainings > 0 ? Math.round((stats.completedTrainings / stats.totalTrainings) * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Treinamentos de Compliance
                  </CardTitle>
                  <CardDescription>
                    Gerencie e acompanhe treinamentos obrigatórios de conformidade
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Relatório
                  </Button>
                  <Button size="sm" onClick={handleCreateTraining}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Treinamento
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTrainings && (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Carregando treinamentos...</p>
                </div>
              )}

              {!loadingTrainings && trainings.length === 0 && (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum treinamento encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie treinamentos de compliance para manter sua equipe atualizada com as regulamentações.
                  </p>
                  <Button onClick={handleCreateTraining}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Treinamento
                  </Button>
                </div>
              )}

              {!loadingTrainings && trainings.length > 0 && (
                <div className="space-y-6">
                  {/* Filtros de Treinamento */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Buscar treinamentos..."
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="expired">Expirado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Tipos</SelectItem>
                        <SelectItem value="lgpd">LGPD</SelectItem>
                        <SelectItem value="security">Segurança</SelectItem>
                        <SelectItem value="ethics">Ética</SelectItem>
                        <SelectItem value="diversity">Diversidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lista de Treinamentos */}
                  <div className="grid gap-6">
                    {trainings.map((training) => {
                      const getStatusColor = (status: string) => {
                        const colors = {
                          draft: 'bg-gray-100 text-gray-800',
                          active: 'bg-blue-100 text-blue-800',
                          in_progress: 'bg-yellow-100 text-yellow-800',
                          completed: 'bg-green-100 text-green-800',
                          expired: 'bg-red-100 text-red-800'
                        };
                        return colors[status as keyof typeof colors] || colors.draft;
                      };

                      const getTypeIcon = (type: string) => {
                        const icons = {
                          lgpd: Shield,
                          security: Lock,
                          ethics: UserCheck,
                          diversity: Users
                        };
                        return icons[type as keyof typeof icons] || FileText;
                      };

                      const getStatusLabel = (status: string) => {
                        const labels = {
                          in_progress: 'Em Andamento',
                          completed: 'Concluído',
                          active: 'Ativo',
                          expired: 'Expirado',
                          draft: 'Rascunho'
                        };
                        return labels[status as keyof typeof labels] || 'Rascunho';
                      };

                      const IconComponent = getTypeIcon(training.type);
                      
                      return (
                        <Card key={training.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                  <h3 className="text-lg font-semibold">{training.title}</h3>
                                  <Badge className={getStatusColor(training.status)}>
                                    {getStatusLabel(training.status)}
                                  </Badge>
                                  <Badge variant="outline">{training.type.toUpperCase()}</Badge>
                                </div>
                                
                                <p className="text-muted-foreground mb-4">{training.description}</p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <div className="text-sm text-muted-foreground">Participantes</div>
                                    <div className="font-semibold">{training.assigned_users} pessoas</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">Concluídos</div>
                                    <div className="font-semibold text-green-600">{training.completed_users} pessoas</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
                                    <div className="font-semibold">{training.completion_rate}%</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">Criado em</div>
                                    <div className="font-semibold">
                                      {new Date(training.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-muted-foreground">Progresso Geral</span>
                                    <span className="text-sm font-medium">{training.completion_rate}%</span>
                                  </div>
                                  <Progress value={training.completion_rate} className="h-2" />
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 ml-4">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Users className="h-4 w-4 mr-2" />
                                  Participantes
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4 mr-2" />
                                  Relatório
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Estatísticas Detalhadas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Treinamentos por Tipo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {['lgpd', 'security', 'ethics', 'diversity'].map((type) => {
                            const count = trainings.filter(t => t.type === type).length;
                            const percentage = stats.totalTrainings > 0 ? (count / stats.totalTrainings) * 100 : 0;
                            
                            return (
                              <div key={type} className="flex items-center justify-between">
                                <span className="text-sm font-medium capitalize">{type}</span>
                                <div className="flex items-center gap-2">
                                  <div className={styles.progressContainer}>
                                    <div 
                                      className={`${styles.progressBar} ${styles.progressBarBlue}`}
                                      ref={(el) => {
                                        if (el) {
                                          el.style.setProperty('--progress-scale', String(Math.min(percentage, 100) / 100));
                                        }
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Status dos Treinamentos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {['active', 'in_progress', 'completed', 'expired'].map((status) => {
                            const count = trainings.filter(t => t.status === status).length;
                            const percentage = stats.totalTrainings > 0 ? (count / stats.totalTrainings) * 100 : 0;
                            
                            const statusLabels = {
                              active: 'Ativos',
                              in_progress: 'Em Andamento',
                              completed: 'Concluídos',
                              expired: 'Expirados'
                            };
                            
                            return (
                              <div key={status} className="flex items-center justify-between">
                                <span className="text-sm font-medium">{statusLabels[status as keyof typeof statusLabels]}</span>
                                <div className="flex items-center gap-2">
                                  <div className={styles.progressContainer}>
                                    <div 
                                      className={`${styles.progressBar} ${styles.progressBarGreen}`}
                                      ref={(el) => {
                                        if (el) {
                                          el.style.setProperty('--progress-scale', String(Math.min(percentage, 100) / 100));
                                        }
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>

      {/* Modal de Criação de Política */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Política de Compliance</DialogTitle>
            <DialogDescription>
              Criar uma nova política de conformidade e privacidade
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título da Política</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Política LGPD de Proteção de Dados"
                />
              </div>
              
              <div>
                <Label htmlFor="version">Versão</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="Ex: 1.0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o objetivo e escopo desta política..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status da política" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="expired">Expirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="assigned">Pessoas Atribuídas</Label>
                <Input
                  id="assigned"
                  type="number"
                  min="0"
                  value={formData.assigned_employees}
                  onChange={(e) => setFormData({ ...formData, assigned_employees: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="acknowledged">Confirmações</Label>
                <Input
                  id="acknowledged"
                  type="number"
                  min="0"
                  max={formData.assigned_employees}
                  value={formData.acknowledged_by}
                  onChange={(e) => setFormData({ ...formData, acknowledged_by: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createPolicy}>
              Criar Política
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Política */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Política</DialogTitle>
            <DialogDescription>
              Atualizar as informações da política de compliance
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Título da Política</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Política LGPD de Proteção de Dados"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-version">Versão</Label>
                <Input
                  id="edit-version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="Ex: 1.0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o objetivo e escopo desta política..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status da política" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="expired">Expirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-assigned">Pessoas Atribuídas</Label>
                <Input
                  id="edit-assigned"
                  type="number"
                  min="0"
                  value={formData.assigned_employees}
                  onChange={(e) => setFormData({ ...formData, assigned_employees: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-acknowledged">Confirmações</Label>
                <Input
                  id="edit-acknowledged"
                  type="number"
                  min="0"
                  max={formData.assigned_employees}
                  value={formData.acknowledged_by}
                  onChange={(e) => setFormData({ ...formData, acknowledged_by: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updatePolicy}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização de Política */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedPolicy?.title}</span>
              <div className="flex gap-2">
                {selectedPolicy && (
                  <>
                    {getStatusBadge(selectedPolicy.status ?? "active")}
                    <Badge variant="outline">v{selectedPolicy.version}</Badge>
                  </>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              Visualização completa da política de compliance
            </DialogDescription>
          </DialogHeader>
          
          {selectedPolicy && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedPolicy.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Nível de Compliance</Label>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Progresso</span>
                        <span className="text-sm font-medium">{selectedPolicy.compliance || 0}%</span>
                      </div>
                      <Progress value={selectedPolicy.compliance || 0} className="h-2" />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Atribuição</Label>
                    <div className="text-sm text-muted-foreground mt-1">
                      {selectedPolicy.acknowledged_by || 0} de {selectedPolicy.assigned_employees || 0} pessoas confirmaram
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Criada em</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedPolicy.created_at 
                        ? new Date(selectedPolicy.created_at).toLocaleDateString('pt-BR')
                        : "Não informado"
                      }
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Última Atualização</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedPolicy.last_update 
                        ? new Date(selectedPolicy.last_update).toLocaleDateString('pt-BR')
                        : "Não informado"
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Ações Disponíveis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button size="sm" variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </Button>
                  <Button size="sm" variant="outline" className="justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Atribuir Usuários
                  </Button>
                  <Button size="sm" variant="outline" className="justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Revisão
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Fechar
            </Button>
            {selectedPolicy && (
              <Button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditPolicy(selectedPolicy);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Política</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a política "{selectedPolicy?.title}"? 
              Esta ação não pode ser desfeita e todos os dados relacionados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deletePolicy}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Política
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Criação de Treinamento */}
      <Dialog open={isCreateTrainingModalOpen} onOpenChange={setIsCreateTrainingModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Treinamento de Compliance</DialogTitle>
            <DialogDescription>
              Criar um novo treinamento obrigatório para a equipe
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="training-title">Título do Treinamento</Label>
                <Input
                  id="training-title"
                  value={trainingFormData.title}
                  onChange={(e) => setTrainingFormData({ ...trainingFormData, title: e.target.value })}
                  placeholder="Ex: Treinamento LGPD Avançado"
                />
              </div>
              
              <div>
                <Label htmlFor="training-type">Tipo de Treinamento</Label>
                <Select 
                  value={trainingFormData.type} 
                  onValueChange={(value) => setTrainingFormData({ ...trainingFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lgpd">LGPD</SelectItem>
                    <SelectItem value="security">Segurança</SelectItem>
                    <SelectItem value="ethics">Ética</SelectItem>
                    <SelectItem value="diversity">Diversidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="training-description">Descrição</Label>
              <Textarea
                id="training-description"
                value={trainingFormData.description}
                onChange={(e) => setTrainingFormData({ ...trainingFormData, description: e.target.value })}
                placeholder="Descreva o conteúdo e objetivos do treinamento..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="training-status">Status</Label>
                <Select 
                  value={trainingFormData.status} 
                  onValueChange={(value) => setTrainingFormData({ ...trainingFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="training-assigned">Pessoas Atribuídas</Label>
                <Input
                  id="training-assigned"
                  type="number"
                  min="0"
                  value={trainingFormData.assigned_users}
                  onChange={(e) => setTrainingFormData({ ...trainingFormData, assigned_users: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTrainingModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createTraining}>
              Criar Treinamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};