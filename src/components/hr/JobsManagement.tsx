
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { 
  Search, 
  Eye, 
  Edit, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Plus,
  Trash2,
  Briefcase,
  FileText,
  Copy,
  ExternalLink
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/api";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  status: string;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

type JobInsert = Omit<Job, 'id' | 'created_at' | 'updated_at'>;
type JobUpdate = Partial<JobInsert>;

// Formulário para nova vaga
interface JobFormData {
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  status: string;
  deadline: string;
}

export const JobsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para formulários e modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    department: "",
    location: "",
    type: "full-time",
    salary: "",
    description: "",
    requirements: [""],
    status: "draft",
    deadline: "",
  });

  // Buscar vagas
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await makeAuthenticatedRequest('/api/jobs', 'GET');
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Dados de vagas inválidos');
      }
      
      setJobs(data || []);
    } catch (err) {
      console.error("Erro ao carregar vagas:", err);
      setError("Erro ao carregar vagas");
      toast({
        title: "Erro",
        description: "Erro ao carregar vagas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar vaga
  const createJob = async () => {
    try {
      const jobData: JobInsert = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        description: formData.description,
        requirements: formData.requirements.filter(req => req.trim() !== ""),
        status: formData.status,
        deadline: formData.deadline || null,
      };

      const data = await makeAuthenticatedRequest('/api/jobs', 'POST', jobData);

      if (!data) {
        toast({
          title: "Erro ao criar vaga",
          description: "Erro ao criar vaga",
          variant: "destructive",
        });
        return;
      }

      setJobs([data, ...jobs]);
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: "Vaga criada com sucesso!",
        description: `A vaga "${formData.title}" foi criada.`,
      });
    } catch (err) {
      console.error("Erro ao criar vaga:", err);
      toast({
        title: "Erro",
        description: "Erro ao criar vaga",
        variant: "destructive",
      });
    }
  };

  // Editar vaga
  const updateJob = async () => {
    if (!selectedJob) return;

    try {
      const jobData: JobUpdate = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        description: formData.description,
        requirements: formData.requirements.filter(req => req.trim() !== ""),
        status: formData.status,
        deadline: formData.deadline || null,
      };

      const data = await makeAuthenticatedRequest(`/api/jobs/${selectedJob.id}`, 'PUT', jobData);

      if (!data) {
        toast({
          title: "Erro ao atualizar vaga",
          description: "Erro ao atualizar vaga",
          variant: "destructive",
        });
        return;
      }

      setJobs(jobs.map(job => job.id === selectedJob.id ? data : job));
      setIsEditModalOpen(false);
      setSelectedJob(null);
      resetForm();
      toast({
        title: "Vaga atualizada com sucesso!",
        description: `A vaga "${formData.title}" foi atualizada.`,
      });
    } catch (err) {
      console.error("Erro ao atualizar vaga:", err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar vaga",
        variant: "destructive",
      });
    }
  };

  // Excluir vaga
  const deleteJob = async () => {
    if (!selectedJob) return;

    try {
      await makeAuthenticatedRequest(`/api/jobs/${selectedJob.id}`, 'DELETE');

      setJobs(jobs.filter(job => job.id !== selectedJob.id));

      setJobs(jobs.filter(job => job.id !== selectedJob.id));
      setIsDeleteDialogOpen(false);
      setSelectedJob(null);
      toast({
        title: "Vaga excluída com sucesso!",
        description: `A vaga "${selectedJob.title}" foi excluída.`,
      });
    } catch (err) {
      console.error("Erro ao excluir vaga:", err);
      toast({
        title: "Erro",
        description: "Erro ao excluir vaga",
        variant: "destructive",
      });
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      title: "",
      department: "",
      location: "",
      type: "full-time",
      salary: "",
      description: "",
      requirements: [""],
      status: "draft",
      deadline: "",
    });
  };

  // Preencher formulário para edição
  const fillFormForEdit = (job: Job) => {
    setFormData({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      type: job.type || "full-time",
      salary: job.salary || "",
      description: job.description || "",
      requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [""],
      status: job.status || "draft",
      deadline: job.deadline ? job.deadline.split('T')[0] : "",
    });
  };

  // Adicionar requirement
  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, ""]
    });
  };

  // Remover requirement
  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  // Atualizar requirement
  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({
      ...formData,
      requirements: newRequirements
    });
  };

  // Copiar link da vaga
  const copyJobLink = (job: Job) => {
    const link = `${window.location.origin}/careers/${job.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link da vaga foi copiado para a área de transferência.",
    });
  };

  // Estatísticas das vagas
  const jobStats = {
    total: jobs.length,
    active: jobs.filter(job => job.status === 'active').length,
    draft: jobs.filter(job => job.status === 'draft').length,
    closed: jobs.filter(job => job.status === 'closed').length,
    paused: jobs.filter(job => job.status === 'paused').length,
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Ativa</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pausada</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Rascunho</Badge>;
      case "closed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Fechada</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const getTypeBadge = (type: string | null) => {
    switch (type) {
      case "full-time":
        return <Badge variant="default">Tempo Integral</Badge>;
      case "part-time":
        return <Badge variant="secondary">Meio Período</Badge>;
      case "contract":
        return <Badge variant="outline">Contrato</Badge>;
      case "internship":
        return <Badge className="bg-blue-100 text-blue-800">Estágio</Badge>;
      case "freelance":
        return <Badge className="bg-purple-100 text-purple-800">Freelance</Badge>;
      default:
        return <Badge variant="outline">{type || "Não definido"}</Badge>;
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;
    const matchesType = selectedType === 'all' || job.type === selectedType;
    return matchesSearch && matchesDepartment && matchesStatus && matchesType;
  });

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsViewModalOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    fillFormForEdit(job);
    setIsEditModalOpen(true);
  };

  const handleDeleteJob = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateJob = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const renderJobsList = () => {
    if (loading) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando vagas...</p>
          </CardContent>
        </Card>
      );
    }
    
    if (error) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-red-600 mb-4">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">Erro ao carregar vagas</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchJobs} variant="outline">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (filteredJobs.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {jobs.length === 0 
                ? "Comece criando sua primeira vaga de emprego."
                : "Tente ajustar os filtros de busca."
              }
            </p>
            {jobs.length === 0 && (
              <Button onClick={handleCreateJob} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar primeira vaga
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Vagas Disponíveis ({filteredJobs.length})</span>
            <Button onClick={handleCreateJob} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Vaga
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaga</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {job.salary || "Salário não informado"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.department || "Não definido"}</Badge>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(job.type)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {job.location || "Remoto"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(job.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {job.deadline 
                        ? new Date(job.deadline).toLocaleDateString('pt-BR')
                        : 'Sem prazo'
                      }
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewJob(job)}
                        title="Visualizar vaga"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditJob(job)}
                        title="Editar vaga"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyJobLink(job)}
                        title="Copiar link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteJob(job)}
                        title="Excluir vaga"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de ação */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Vagas</h2>
          <p className="text-muted-foreground">
            Crie, gerencie e acompanhe todas as oportunidades de emprego. Vagas ativas são automaticamente disponibilizadas para o bot de recrutamento.
          </p>
        </div>
        <Button onClick={handleCreateJob} className="gap-2" size="lg">
          <Plus className="h-5 w-5" />
          Nova Vaga
        </Button>
      </div>

      {/* Estatísticas das vagas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{jobStats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{jobStats.active}</div>
              <div className="text-sm text-muted-foreground">Ativas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{jobStats.draft}</div>
              <div className="text-sm text-muted-foreground">Rascunhos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{jobStats.paused}</div>
              <div className="text-sm text-muted-foreground">Pausadas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{jobStats.closed}</div>
              <div className="text-sm text-muted-foreground">Fechadas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros avançados */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar vagas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Departamentos</SelectItem>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Vendas">Vendas</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="RH">Recursos Humanos</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
                <SelectItem value="Operações">Operações</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="full-time">Tempo Integral</SelectItem>
                <SelectItem value="part-time">Meio Período</SelectItem>
                <SelectItem value="contract">Contrato</SelectItem>
                <SelectItem value="internship">Estágio</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="paused">Pausada</SelectItem>
                <SelectItem value="closed">Fechada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de vagas */}
      {renderJobsList()}

      {/* Modal de Criação de Vaga */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Nova Vaga</DialogTitle>
            <DialogDescription>
              Preencha as informações da nova vaga de emprego. Vagas ativas ficam disponíveis para o bot automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Vaga *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Desenvolvedor Full Stack"
                />
              </div>

              <div>
                <Label htmlFor="department">Departamento *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="RH">Recursos Humanos</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Operações">Operações</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: São Paulo, SP - Remoto"
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo de Contrato</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Tempo Integral</SelectItem>
                    <SelectItem value="part-time">Meio Período</SelectItem>
                    <SelectItem value="contract">Contrato</SelectItem>
                    <SelectItem value="internship">Estágio</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="salary">Salário</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="Ex: R$ 5.000 - R$ 8.000"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="paused">Pausada</SelectItem>
                    <SelectItem value="closed">Fechada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deadline">Prazo para Aplicação</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição da Vaga</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva as responsabilidades e o que a empresa oferece..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Requisitos</Label>
                <div className="space-y-2">
                  {formData.requirements.map((req, index) => (
                    <div key={`req-item-${index}-${req?.substring(0,3) || index}`} className="flex gap-2">
                      <Input
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder={`Requisito ${index + 1}`}
                      />
                      {formData.requirements.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRequirement(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRequirement}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Requisito
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createJob} disabled={!formData.title.trim()}>
              Criar Vaga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Vaga */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Vaga</DialogTitle>
            <DialogDescription>
              Edite as informações da vaga. Mudanças em vagas ativas são refletidas imediatamente no bot.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título da Vaga *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Desenvolvedor Full Stack"
                />
              </div>

              <div>
                <Label htmlFor="edit-department">Departamento *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="RH">Recursos Humanos</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Operações">Operações</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-location">Localização</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: São Paulo, SP - Remoto"
                />
              </div>

              <div>
                <Label htmlFor="edit-type">Tipo de Contrato</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Tempo Integral</SelectItem>
                    <SelectItem value="part-time">Meio Período</SelectItem>
                    <SelectItem value="contract">Contrato</SelectItem>
                    <SelectItem value="internship">Estágio</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-salary">Salário</Label>
                <Input
                  id="edit-salary"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="Ex: R$ 5.000 - R$ 8.000"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="paused">Pausada</SelectItem>
                    <SelectItem value="closed">Fechada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-deadline">Prazo para Aplicação</Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Descrição da Vaga</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva as responsabilidades e o que a empresa oferece..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Requisitos</Label>
                <div className="space-y-2">
                  {formData.requirements.map((req, index) => (
                    <div key={`req-item-${index}-${req?.substring(0,3) || index}`} className="flex gap-2">
                      <Input
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder={`Requisito ${index + 1}`}
                      />
                      {formData.requirements.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRequirement(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRequirement}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Requisito
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updateJob} disabled={!formData.title.trim()}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização de Vaga */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedJob?.title}</span>
              <div className="flex gap-2">
                {selectedJob && getStatusBadge(selectedJob.status)}
                {selectedJob && getTypeBadge(selectedJob.type)}
              </div>
            </DialogTitle>
            <DialogDescription>
              Visualização completa da vaga de emprego
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Departamento</Label>
                    <p className="text-sm text-muted-foreground">{selectedJob.department || "Não informado"}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Localização</Label>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedJob.location || "Não informado"}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Salário</Label>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {selectedJob.salary || "Não informado"}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Prazo para Aplicação</Label>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {selectedJob.deadline 
                        ? new Date(selectedJob.deadline).toLocaleDateString('pt-BR')
                        : "Sem prazo definido"
                      }
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Data de Criação</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedJob.created_at 
                        ? new Date(selectedJob.created_at).toLocaleDateString('pt-BR')
                        : "Não informado"
                      }
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Link da Vaga</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={`${window.location.origin}/careers/${selectedJob.id}`}
                        readOnly
                        className="text-xs"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyJobLink(selectedJob)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`${window.location.origin}/careers/${selectedJob.id}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedJob.description && (
                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                    {selectedJob.description}
                  </p>
                </div>
              )}
              
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Requisitos</Label>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={`view-req-${index}-${req.slice(0, 5)}`} className="text-sm text-muted-foreground">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Fechar
            </Button>
            {selectedJob && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditJob(selectedJob);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button onClick={() => copyJobLink(selectedJob)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Vaga</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a vaga "{selectedJob?.title}"? 
              Esta ação não pode ser desfeita e a vaga será removida permanentemente 
              do sistema e não ficará mais disponível para o bot.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteJob}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Vaga
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobsManagement;

