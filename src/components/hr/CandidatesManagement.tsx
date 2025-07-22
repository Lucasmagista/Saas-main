
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Download,
  Eye
} from "lucide-react";

export const CandidatesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");

  // Dados simulados de candidatos
  const candidates = [
    {
      id: 1,
      name: "Ana Silva",
      email: "ana.silva@email.com",
      phone: "(11) 99999-9999",
      position: "Desenvolvedor Full Stack Senior",
      stage: "interview",
      score: 92,
      location: "São Paulo - SP",
      experience: "5 anos",
      education: "Ciência da Computação - USP",
      skills: ["React", "Node.js", "PostgreSQL", "AWS"],
      appliedDate: "2025-07-10",
      lastActivity: "Entrevista agendada para 22/07",
      avatar: "/avatars/ana.jpg",
      resumeUrl: "/resumes/ana-silva.pdf",
      status: "active"
    },
    {
      id: 2,
      name: "Carlos Mendes",
      email: "carlos.mendes@email.com",
      phone: "(11) 88888-8888",
      position: "Analista de Marketing Digital",
      stage: "technical",
      score: 87,
      location: "Rio de Janeiro - RJ",
      experience: "3 anos",
      education: "Marketing - PUC-RJ",
      skills: ["Google Ads", "Facebook Ads", "Analytics", "SEO"],
      appliedDate: "2025-07-08",
      lastActivity: "Teste técnico enviado",
      avatar: "/avatars/carlos.jpg",
      resumeUrl: "/resumes/carlos-mendes.pdf",
      status: "active"
    },
    {
      id: 3,
      name: "Mariana Costa",
      email: "mariana.costa@email.com",
      phone: "(11) 77777-7777",
      position: "Designer UX/UI",
      stage: "proposal",
      score: 95,
      location: "São Paulo - SP",
      experience: "4 anos",
      education: "Design Gráfico - Mackenzie",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      appliedDate: "2025-07-05",
      lastActivity: "Proposta enviada",
      avatar: "/avatars/mariana.jpg",
      resumeUrl: "/resumes/mariana-costa.pdf",
      status: "active"
    },
    {
      id: 4,
      name: "Roberto Santos",
      email: "roberto.santos@email.com",
      phone: "(11) 66666-6666",
      position: "Gerente de Vendas",
      stage: "rejected",
      score: 65,
      location: "Belo Horizonte - MG",
      experience: "6 anos",
      education: "Administração - UFMG",
      skills: ["Vendas", "Liderança", "CRM", "Negociação"],
      appliedDate: "2025-07-03",
      lastActivity: "Candidatura rejeitada",
      avatar: "/avatars/roberto.jpg",
      resumeUrl: "/resumes/roberto-santos.pdf",
      status: "rejected"
    }
  ];

  const stages = [
    { id: "all", label: "Todos", count: candidates.length },
    { id: "screening", label: "Triagem", count: 12 },
    { id: "interview", label: "Entrevista", count: 8 },
    { id: "technical", label: "Teste Técnico", count: 5 },
    { id: "proposal", label: "Proposta", count: 3 },
    { id: "hired", label: "Contratados", count: 2 },
    { id: "rejected", label: "Rejeitados", count: 7 }
  ];

  const getStageColor = (stage: string) => {
    const colors = {
      screening: "bg-yellow-100 text-yellow-800",
      interview: "bg-blue-100 text-blue-800",
      technical: "bg-purple-100 text-purple-800",
      proposal: "bg-green-100 text-green-800",
      hired: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStageName = (stage: string) => {
    const names = {
      screening: "Triagem",
      interview: "Entrevista",
      technical: "Teste Técnico",
      proposal: "Proposta",
      hired: "Contratado",
      rejected: "Rejeitado"
    };
    return names[stage as keyof typeof names] || stage;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === 'all' || candidate.stage === selectedStage;
    
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stages.map((stage) => (
          <Card 
            key={stage.id}
            className={`cursor-pointer transition-colors ${
              selectedStage === stage.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedStage(stage.id)}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stage.count}</div>
                <div className="text-sm text-muted-foreground">{stage.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar candidatos por nome, posição ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Candidatos */}
      <div className="grid gap-6">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Perfil do Candidato */}
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={candidate.avatar} alt={candidate.name} />
                    <AvatarFallback>
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{candidate.name}</h3>
                      <Badge className={getStageColor(candidate.stage)}>
                        {getStageName(candidate.stage)}
                      </Badge>
                    </div>
                    
                    <div className="text-muted-foreground mb-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Briefcase className="h-4 w-4" />
                        <span className="text-sm">{candidate.position}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{candidate.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 3} mais
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {candidate.lastActivity}
                    </div>
                  </div>
                </div>

                {/* Score e Detalhes */}
                <div className="flex flex-col items-center gap-4 lg:w-48">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{candidate.score}%</div>
                    <div className="text-sm text-muted-foreground">Match Score</div>
                    <Progress value={candidate.score} className="w-24 mt-2" />
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <User className="h-4 w-4" />
                      {candidate.experience}
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {candidate.education.split(' - ')[1] || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2 lg:w-32">
                  <Button size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Perfil
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contatar
                  </Button>
                  <Button size="sm" variant="ghost" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Currículo
                  </Button>
                </div>
              </div>

              {/* Informações de Contato */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {candidate.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {candidate.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Aplicou em {new Date(candidate.appliedDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado Vazio */}
      {filteredCandidates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum candidato encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou aguarde novos candidatos se inscreverem.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
