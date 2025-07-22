
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Calendar,
  Briefcase,
  MoreHorizontal
} from "lucide-react";

export const JobsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Dados simulados de vagas
  const jobs = [
    {
      id: 1,
      title: "Desenvolvedor Full Stack Senior",
      department: "Tecnologia",
      location: "São Paulo - SP",
      type: "CLT",
      salary: "R$ 8.000 - R$ 12.000",
      status: "active",
      applicants: 23,
      created: "2025-07-15",
      deadline: "2025-08-15",
      description: "Desenvolvedor experiente para liderar projetos web",
      requirements: ["React", "Node.js", "PostgreSQL", "5+ anos experiência"]
    },
    {
      id: 2,
      title: "Analista de Marketing Digital",
      department: "Marketing",
      location: "Remote",
      type: "CLT",
      salary: "R$ 4.500 - R$ 6.500",
      status: "active",
      applicants: 41,
      created: "2025-07-12",
      deadline: "2025-08-10",
      description: "Especialista em campanhas digitais e growth",
      requirements: ["Google Ads", "Facebook Ads", "Analytics", "3+ anos experiência"]
    },
    {
      id: 3,
      title: "Designer UX/UI",
      department: "Design",
      location: "Rio de Janeiro - RJ",
      type: "PJ",
      salary: "R$ 6.000 - R$ 9.000",
      status: "paused",
      applicants: 17,
      created: "2025-07-08",
      deadline: "2025-08-05",
      description: "Designer para criar experiências digitais incríveis",
      requirements: ["Figma", "Adobe Creative", "Design System", "4+ anos experiência"]
    },
    {
      id: 4,
      title: "Gerente de Vendas",
      department: "Vendas",
      location: "Belo Horizonte - MG",
      type: "CLT",
      salary: "R$ 7.000 - R$ 10.000",
      status: "draft",
      applicants: 0,
      created: "2025-07-18",
      deadline: "2025-08-20",
      description: "Liderar equipe de vendas e estratégias comerciais",
      requirements: ["Liderança", "CRM", "Metas", "5+ anos experiência"]
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativa', variant: 'default' as const },
      paused: { label: 'Pausada', variant: 'secondary' as const },
      draft: { label: 'Rascunho', variant: 'outline' as const },
      closed: { label: 'Fechada', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Vagas</h2>
          <p className="text-muted-foreground">
            Crie, gerencie e acompanhe todas as oportunidades de emprego
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Vaga
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Vaga</DialogTitle>
              <DialogDescription>
                Configure os dados da nova oportunidade de emprego
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Vaga</Label>
                  <Input id="title" placeholder="Ex: Desenvolvedor Senior" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="rh">RH</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input id="location" placeholder="Ex: São Paulo - SP" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Faixa Salarial</Label>
                  <Input id="salary" placeholder="Ex: R$ 5.000 - R$ 8.000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva a vaga, responsabilidades e objetivos..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos</Label>
                <Textarea 
                  id="requirements" 
                  placeholder="Liste os requisitos técnicos e comportamentais..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsCreateModalOpen(false)}>
                Criar Vaga
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por título ou departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Vendas">Vendas</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="paused">Pausada</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="closed">Fechada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vagas */}
      <Card>
        <CardHeader>
          <CardTitle>Vagas Disponíveis ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaga</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Candidatos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {job.salary}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.department}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {job.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      {job.applicants}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(job.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(job.created).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
