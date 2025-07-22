
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  FileText, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Lock,
  Database,
  UserCheck,
  Calendar,
  Trash2
} from "lucide-react";

export const ComplianceManagement = () => {
  const [selectedPolicy, setSelectedPolicy] = useState<number | null>(null);

  // Dados simulados de compliance
  const complianceMetrics = {
    overallScore: 98,
    lgpdCompliance: 95,
    dataRetention: 100,
    accessControl: 92,
    auditTrail: 96,
    employeeTraining: 88
  };

  const policies = [
    {
      id: 1,
      title: "Política de Privacidade LGPD",
      description: "Diretrizes para tratamento de dados pessoais",
      version: "v3.2",
      lastUpdate: "2025-07-01",
      status: "active",
      compliance: 95,
      assignedEmployees: 324,
      acknowledgedBy: 312,
      category: "privacy"
    },
    {
      id: 2,
      title: "Código de Conduta Ética",
      description: "Princípios éticos e comportamentais",
      version: "v2.1",
      lastUpdate: "2025-06-15",
      status: "active",
      compliance: 98,
      assignedEmployees: 324,
      acknowledgedBy: 318,
      category: "ethics"
    },
    {
      id: 3,
      title: "Política de Segurança da Informação",
      description: "Diretrizes de segurança e proteção de dados",
      version: "v4.0",
      lastUpdate: "2025-05-20",
      status: "active",
      compliance: 92,
      assignedEmployees: 324,
      acknowledgedBy: 298,
      category: "security"
    },
    {
      id: 4,
      title: "Política de Diversidade e Inclusão",
      description: "Diretrizes para ambiente inclusivo",
      version: "v1.3",
      lastUpdate: "2025-04-10",
      status: "review",
      compliance: 85,
      assignedEmployees: 324,
      acknowledgedBy: 275,
      category: "diversity"
    }
  ];

  const auditLogs = [
    {
      id: 1,
      action: "Política Atualizada",
      user: "Ana Silva (RH)",
      resource: "Política de Privacidade LGPD",
      timestamp: "2025-07-20 14:30:00",
      type: "update",
      details: "Versão 3.2 publicada com novas diretrizes"
    },
    {
      id: 2,
      action: "Acesso Concedido",
      user: "Sistema Automático",
      resource: "Dados Pessoais - João Santos",
      timestamp: "2025-07-20 13:15:00",
      type: "access",
      details: "Acesso autorizado para processamento de folha"
    },
    {
      id: 3,
      action: "Dados Removidos",
      user: "Carlos Lima (TI)",
      resource: "Backup - Ex-funcionário Maria",
      timestamp: "2025-07-20 10:45:00",
      type: "deletion",
      details: "Dados removidos conforme política de retenção"
    },
    {
      id: 4,
      action: "Treinamento Concluído",
      user: "Pedro Oliveira",
      resource: "Curso LGPD Básico",
      timestamp: "2025-07-19 16:20:00",
      type: "training",
      details: "Certificação obtida com 92% de aproveitamento"
    }
  ];

  const dataRetentionPolicies = [
    {
      category: "Candidatos Rejeitados",
      retention: "2 anos",
      autoDelete: true,
      pendingDeletion: 45,
      nextCleanup: "2025-08-01"
    },
    {
      category: "Ex-funcionários",
      retention: "5 anos",
      autoDelete: true,
      pendingDeletion: 12,
      nextCleanup: "2025-08-15"
    },
    {
      category: "Avaliações de Performance",
      retention: "7 anos",
      autoDelete: false,
      pendingDeletion: 0,
      nextCleanup: "-"
    },
    {
      category: "Documentos Trabalhistas",
      retention: "30 anos",
      autoDelete: false,
      pendingDeletion: 0,
      nextCleanup: "-"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativa', variant: 'default' as const },
      review: { label: 'Em Revisão', variant: 'secondary' as const },
      draft: { label: 'Rascunho', variant: 'outline' as const },
      expired: { label: 'Expirada', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getActionIcon = (type: string) => {
    const icons = {
      update: FileText,
      access: Eye,
      deletion: Trash2,
      training: UserCheck
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            Relatório
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Nova Política
          </Button>
        </div>
      </div>

      {/* Score de Compliance */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Score de Compliance Geral</h3>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{complianceMetrics.overallScore}%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{complianceMetrics.lgpdCompliance}%</div>
              <div className="text-sm text-muted-foreground">LGPD</div>
              <Progress value={complianceMetrics.lgpdCompliance} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{complianceMetrics.dataRetention}%</div>
              <div className="text-sm text-muted-foreground">Retenção</div>
              <Progress value={complianceMetrics.dataRetention} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{complianceMetrics.accessControl}%</div>
              <div className="text-sm text-muted-foreground">Acesso</div>
              <Progress value={complianceMetrics.accessControl} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{complianceMetrics.auditTrail}%</div>
              <div className="text-sm text-muted-foreground">Auditoria</div>
              <Progress value={complianceMetrics.auditTrail} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{complianceMetrics.employeeTraining}%</div>
              <div className="text-sm text-muted-foreground">Treinamento</div>
              <Progress value={complianceMetrics.employeeTraining} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">0</div>
              <div className="text-sm text-muted-foreground">Violações</div>
              <Progress value={100} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="policies">Políticas</TabsTrigger>
          <TabsTrigger value="retention">Retenção de Dados</TabsTrigger>
          <TabsTrigger value="audit">Logs de Auditoria</TabsTrigger>
          <TabsTrigger value="training">Treinamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          {/* Alertas de Compliance */}
          <div className="grid gap-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> 12 colaboradores ainda não confirmaram leitura da nova Política de Diversidade.
                <Button variant="link" className="p-0 h-auto ml-2">
                  Ver detalhes
                </Button>
              </AlertDescription>
            </Alert>
          </div>

          {/* Lista de Políticas */}
          <div className="grid gap-4">
            {policies.map((policy) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{policy.title}</h3>
                        {getStatusBadge(policy.status)}
                        <Badge variant="outline">{policy.version}</Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{policy.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Compliance</div>
                          <div className="font-semibold text-primary">{policy.compliance}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Atribuída</div>
                          <div className="font-semibold">{policy.assignedEmployees} pessoas</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Confirmada</div>
                          <div className="font-semibold">{policy.acknowledgedBy} pessoas</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Atualizada</div>
                          <div className="font-semibold">
                            {new Date(policy.lastUpdate).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>

                      <Progress 
                        value={(policy.acknowledgedBy / policy.assignedEmployees) * 100} 
                        className="mb-4" 
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Retenção de Dados</CardTitle>
              <CardDescription>
                Gestão automática de ciclo de vida dos dados conforme LGPD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataRetentionPolicies.map((policy, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{policy.category}</h4>
                      <div className="text-sm text-muted-foreground">
                        Retenção: {policy.retention}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">{policy.pendingDeletion}</div>
                        <div className="text-xs text-muted-foreground">Pendentes</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm font-medium">{policy.nextCleanup}</div>
                        <div className="text-xs text-muted-foreground">Próxima limpeza</div>
                      </div>
                      
                      <Badge variant={policy.autoDelete ? "default" : "outline"}>
                        {policy.autoDelete ? "Automática" : "Manual"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Auditoria</CardTitle>
              <CardDescription>
                Registro completo de todas as ações relacionadas a dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => {
                  const IconComponent = getActionIcon(log.type);
                  return (
                    <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <IconComponent className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{log.action}</h4>
                          <Badge variant="outline" className="text-xs">
                            {log.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          <strong>Usuário:</strong> {log.user}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          <strong>Recurso:</strong> {log.resource}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {log.details}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Treinamentos de Compliance</CardTitle>
              <CardDescription>
                Acompanhe a evolução dos treinamentos obrigatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Módulo em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  O sistema de treinamentos de compliance estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
