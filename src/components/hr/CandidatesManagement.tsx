
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { 
  Search, 
  User, 
  Eye, 
  Edit, 
  Mail, 
  Phone, 
  Trash2,
  Star,
  MessageSquare,
  UserCheck,
  Users,
  Clock,
  TrendingUp,
  Award,
  FileText,
  Download
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/api";

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  status: string;
  source: string;
  experience_years: number;
  education: string;
  skills: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

interface Resume {
  id: string;
  candidate_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  department: string;
  status: string;
}
type CandidateInsert = Omit<Candidate, 'id' | 'created_at' | 'updated_at'>;
type CandidateUpdate = Partial<CandidateInsert>;

interface CandidateFormData {
  name: string;
  email: string;
  phone: string;
  applied_job_id: string | null;
  stage: string;
  score: number | null;
  status: string;
}

export const CandidatesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Form data
  const [formData, setFormData] = useState<CandidateFormData>({
    name: "",
    email: "",
    phone: "",
    applied_job_id: null,
    stage: "screening",
    score: null,
    status: "active"
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      applied_job_id: null,
      stage: "screening",
      score: null,
      status: "active"
    });
  };

  // Helper functions
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      "screening": "bg-blue-100 text-blue-800",
      "interview": "bg-yellow-100 text-yellow-800",
      "technical": "bg-purple-100 text-purple-800",
      "proposal": "bg-orange-100 text-orange-800",
      "hired": "bg-green-100 text-green-800",
      "rejected": "bg-red-100 text-red-800"
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "active": "bg-green-100 text-green-800",
      "inactive": "bg-gray-100 text-gray-800",
      "blocked": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Fetch functions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch candidates
        const candidatesData = await makeAuthenticatedRequest('/api/candidates', 'GET');
        
        if (!candidatesData || !Array.isArray(candidatesData)) {
          throw new Error('Dados de candidatos inválidos');
        }
        
        // Fetch jobs
        const jobsData = await makeAuthenticatedRequest('/api/jobs?status=active', 'GET');
        
        if (!jobsData || !Array.isArray(jobsData)) {
          throw new Error('Dados de vagas inválidos');
        }
        
        // Fetch resumes
        const resumesData = await makeAuthenticatedRequest('/api/resumes', 'GET');
        
        if (!resumesData || !Array.isArray(resumesData)) {
          throw new Error('Dados de currículos inválidos');
        }
        
        setCandidates(candidatesData as Candidate[]);
        setJobs(jobsData as Job[]);
        setResumes(resumesData as Resume[]);
      } catch (error: unknown) {
        setError("Erro ao carregar dados: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // CRUD functions
  const updateCandidate = async () => {
    if (!selectedCandidate) return;

    try {
      const data = await makeAuthenticatedRequest(`/api/candidates/${selectedCandidate.id}`, 'PUT', {
        ...formData,
        updated_at: new Date().toISOString()
      });

      if (!data) {
        throw new Error('Erro ao atualizar candidato');
      }

      setCandidates(prev => prev.map(candidate => 
        candidate.id === selectedCandidate.id ? data : candidate
      ));
      setIsEditModalOpen(false);
      setSelectedCandidate(null);
      resetForm();
      toast({
        title: "Candidato atualizado!",
        description: `As informações de ${data.name} foram atualizadas.`,
      });
    } catch (error: unknown) {
      toast({
        title: "Erro ao atualizar candidato",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const deleteCandidate = async () => {
    if (!selectedCandidate) return;

    try {
      await makeAuthenticatedRequest(`/api/candidates/${selectedCandidate.id}`, 'DELETE');

      setCandidates(prev => prev.filter(candidate => candidate.id !== selectedCandidate.id));

      setCandidates(prev => prev.filter(candidate => candidate.id !== selectedCandidate.id));
      setIsDeleteDialogOpen(false);
      setSelectedCandidate(null);
      toast({
        title: "Candidato removido",
        description: "O candidato foi removido do sistema.",
      });
    } catch (error: unknown) {
      toast({
        title: "Erro ao remover candidato",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Helper functions
  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setFormData({
      name: candidate.name || "",
      email: candidate.email || "",
      phone: candidate.phone || "",
      applied_job_id: candidate.applied_job_id || null,
      stage: candidate.stage || "screening",
      score: candidate.score || null,
      status: candidate.status || "active"
    });
    setIsEditModalOpen(true);
  };

  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsViewModalOpen(true);
  };

    // Estágios possíveis (pode ser dinâmico no futuro)
  const stages = [
    { id: "all", label: "Todos", icon: Users },
    { id: "screening", label: "Triagem", icon: Search },
    { id: "interview", label: "Entrevista", icon: MessageSquare },
    { id: "technical", label: "Teste Técnico", icon: User },
    { id: "proposal", label: "Proposta", icon: Star },
    { id: "hired", label: "Contratados", icon: UserCheck },
    { id: "rejected", label: "Rejeitados", icon: User }
  ] as const;

  // Statistics
  const stats = {
    total: candidates.length,
    active: candidates.filter(c => c.status === 'active').length,
    hired: candidates.filter(c => c.stage === 'hired').length,
    averageScore: candidates.length > 0 
      ? (candidates.reduce((sum, c) => sum + (c.score || 0), 0) / candidates.length).toFixed(1)
      : "0"
  };

  const handleDeleteCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDeleteDialogOpen(true);
  };

  // Function to handle resume viewing
  const handleViewResume = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsResumeModalOpen(true);
  };

  // Function to copy candidate link
  const copyCandidateLink = (candidate: Candidate) => {
    const link = `${window.location.origin}/candidates/${candidate.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link do candidato foi copiado para a área de transferência.",
    });
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === 'all' || candidate.stage === selectedStage;
    const matchesStatus = selectedStatus === 'all' || candidate.status === selectedStatus;
    return matchesSearch && matchesStage && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Candidatos</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Candidatos Ativos</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contratados</p>
                <p className="text-3xl font-bold text-blue-600">{stats.hired}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Médio</p>
                <p className="text-3xl font-bold text-purple-600">{stats.averageScore}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros por Estágios */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stages.map((stage) => {
          const IconComponent = stage.icon as React.ComponentType<{ className?: string }>;
          const count = stage.id === 'all' 
            ? candidates.length 
            : candidates.filter(c => c.stage === stage.id).length;
            
          return (
            <Card
              key={stage.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedStage === stage.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedStage(stage.id)}
            >
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <IconComponent className="h-6 w-6 mx-auto text-muted-foreground" />
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground">{stage.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações e Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Candidatos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Candidatos são automaticamente adicionados pelo sistema de bot de recrutamento
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Candidatos */}
      {loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Carregando candidatos...</p>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card>
          <CardContent className="text-center py-12 text-red-600">
            <div className="space-y-2">
              <p className="font-semibold">Erro ao carregar dados</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!loading && !error && filteredCandidates.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Vaga Aplicada</TableHead>
                  <TableHead>Estágio</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Currículos</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => {
                  const appliedJob = jobs.find(job => job.id === candidate.applied_job_id);
                  
                  return (
                    <TableRow key={candidate.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {candidate.email}
                          </div>
                          {candidate.phone && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {candidate.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {appliedJob ? appliedJob.title : "Não especificada"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStageColor(candidate.stage || "screening")}>
                          {stages.find(s => s.id === candidate.stage)?.label || candidate.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-medium">{candidate.score || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(candidate.status || "active")}>
                          {candidate.status || "active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {resumes.filter(resume => resume.candidate_id === candidate.id).length}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResume(candidate)}
                            disabled={resumes.filter(resume => resume.candidate_id === candidate.id).length === 0}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {candidate.created_at 
                            ? new Date(candidate.created_at).toLocaleDateString('pt-BR')
                            : "N/A"
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCandidate(candidate)}
                            title="Ver detalhes completos"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCandidate(candidate)}
                            title="Editar informações"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCandidate(candidate)}
                            className="text-red-600 hover:text-red-700"
                            title="Remover candidato"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Estado Vazio */}
      {!loading && !error && filteredCandidates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum candidato encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {candidates.length === 0 
                ? "Aguardando candidatos serem enviados pelo sistema de bot de recrutamento."
                : "Tente ajustar os filtros de busca para encontrar candidatos."
              }
            </p>
            {candidates.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  💡 Os candidatos são automaticamente adicionados quando enviados pelo bot de recrutamento
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Edição de Candidato */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Candidato</DialogTitle>
            <DialogDescription>
              Atualize as informações do candidato
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ex: joao@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ex: (11) 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-applied_job">Vaga Aplicada</Label>
                <Select value={formData.applied_job_id || ""} onValueChange={(value) => setFormData({ ...formData, applied_job_id: value || null })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma vaga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma vaga específica</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} - {job.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-stage">Estágio</Label>
                <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estágio atual" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.filter(s => s.id !== 'all').map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-score">Score (0-100)</Label>
                <Input
                  id="edit-score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score || ""}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value ? Number(e.target.value) : null })}
                  placeholder="85"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updateCandidate}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização de Candidato */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedCandidate?.name}</span>
              <div className="flex gap-2">
                {selectedCandidate && (
                  <>
                    <Badge className={getStageColor(selectedCandidate.stage || "screening")}>
                      {stages.find(s => s.id === selectedCandidate.stage)?.label || selectedCandidate.stage}
                    </Badge>
                    <Badge className={getStatusColor(selectedCandidate.status || "active")}>
                      {selectedCandidate.status || "active"}
                    </Badge>
                  </>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              Visualização completa do perfil do candidato
            </DialogDescription>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {selectedCandidate.email}
                    </p>
                  </div>
                  
                  {selectedCandidate.phone && (
                    <div>
                      <Label className="text-sm font-medium">Telefone</Label>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {selectedCandidate.phone}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium">Score</Label>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      {selectedCandidate.score || 0}/100
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Vaga Aplicada</Label>
                    <p className="text-sm text-muted-foreground">
                      {jobs.find(job => job.id === selectedCandidate.applied_job_id)?.title || "Não especificada"}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Data de Aplicação</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedCandidate.created_at 
                        ? new Date(selectedCandidate.created_at).toLocaleDateString('pt-BR')
                        : "Não informado"
                      }
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Última Atualização</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedCandidate.updated_at 
                        ? new Date(selectedCandidate.updated_at).toLocaleDateString('pt-BR')
                        : "Não informado"
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Currículos</Label>
                <div className="mt-2 space-y-2">
                  {resumes.filter(resume => resume.candidate_id === selectedCandidate.id).length > 0 ? (
                    resumes
                      .filter(resume => resume.candidate_id === selectedCandidate.id)
                      .map((resume) => (
                        <div key={resume.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Currículo {resume.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              Enviado em {new Date(resume.created_at || '').toLocaleDateString('pt-BR')}
                            </p>
                            {resume.education && (
                              <p className="text-xs text-muted-foreground">Educação: {resume.education}</p>
                            )}
                            {Boolean(resume.experience_years) && (
                              <p className="text-xs text-muted-foreground">Experiência: {resume.experience_years} anos</p>
                            )}
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Currículo
                          </Button>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum currículo encontrado</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Fechar
            </Button>
            {selectedCandidate && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditCandidate(selectedCandidate);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button onClick={() => copyCandidateLink(selectedCandidate)}>
                  Copiar Link
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização de Currículo */}
      <Dialog open={isResumeModalOpen} onOpenChange={setIsResumeModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Currículo - {selectedCandidate?.name}</DialogTitle>
            <DialogDescription>
              Visualização e gerenciamento de currículos do candidato
            </DialogDescription>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {resumes.filter(resume => resume.candidate_id === selectedCandidate.id).length > 0 ? (
                  resumes
                    .filter(resume => resume.candidate_id === selectedCandidate.id)
                    .map((resume) => (
                      <Card key={resume.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h3 className="font-semibold">Currículo {resume.id.slice(0, 8)}</h3>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>Enviado em: {new Date(resume.created_at || '').toLocaleDateString('pt-BR')}</p>
                                {Boolean(resume.experience_years) && (
                                  <p>Experiência: {resume.experience_years} anos</p>
                                )}
                                {resume.education && (
                                  <p>Educação: {resume.education}</p>
                                )}
                                {resume.skills && resume.skills.length > 0 && (
                                  <p>Habilidades: {resume.skills.join(', ')}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </Button>
                              {resume.file_url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={resume.file_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum currículo encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Este candidato ainda não possui currículos enviados pelo sistema.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          💡 Os currículos são automaticamente enviados pelo bot de recrutamento
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResumeModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Candidato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o candidato "{selectedCandidate?.name}"? 
              Esta ação não pode ser desfeita e todos os dados do candidato, 
              incluindo currículos, serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCandidate}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Candidato
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};