
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Progress } from "@/components/ui/progress";
import { Plus, Search, Filter, Mail, Phone, MapPin, Users, Star, Award } from "lucide-react";

const Team = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; email: string; role: string; department: string }>({ name: "", email: "", role: "", department: "" });
  const { updateProfile, profile } = useAuth();
  // Exemplo: só admin pode editar/adicionar
  const isAdmin = profile?.position === "admin" || profile?.position === "super_admin";

  const canPromoteSelf = profile && !isAdmin && profile.email === "lucas.magista1@gmail.com";

  // Em produção, os membros viriam do backend
  const teamMembers = [
    {
      id: 1,
      name: "Ana Silva",
      role: "Product Manager",
      department: "Produto",
      email: "ana.silva@empresa.com",
      phone: "+55 11 99999-1234",
      location: "São Paulo, SP",
      avatar: "/placeholder.svg",
      status: "Ativo",
      joinDate: "2022-03-15",
      projects: 8,
      completedTasks: 142,
      totalTasks: 165,
      rating: 4.8,
      skills: ["Gestão", "Estratégia", "Scrum", "Analytics"]
    },
    {
      id: 2,
      name: "Carlos Santos",
      role: "Senior Developer",
      department: "Desenvolvimento",
      email: "carlos.santos@empresa.com",
      phone: "+55 11 99999-5678",
      location: "Rio de Janeiro, RJ",
      avatar: "/placeholder.svg",
      status: "Ativo",
      joinDate: "2021-07-22",
      projects: 12,
      completedTasks: 238,
      totalTasks: 255,
      rating: 4.9,
      skills: ["React", "Node.js", "TypeScript", "AWS"]
    },
    {
      id: 3,
      name: "Maria Costa",
      role: "UX Designer",
      department: "Design",
      email: "maria.costa@empresa.com",
      phone: "+55 21 99999-9012",
      location: "Belo Horizonte, MG",
      avatar: "/placeholder.svg",
      status: "Ativo",
      joinDate: "2023-01-10",
      projects: 6,
      completedTasks: 89,
      totalTasks: 98,
      rating: 4.7,
      skills: ["Figma", "Design Systems", "Prototipagem", "User Research"]
    },
    {
      id: 4,
      name: "João Oliveira",
      role: "Marketing Specialist",
      department: "Marketing",
      email: "joao.oliveira@empresa.com",
      phone: "+55 31 99999-3456",
      location: "Porto Alegre, RS",
      avatar: "/placeholder.svg",
      status: "Férias",
      joinDate: "2022-11-05",
      projects: 4,
      completedTasks: 76,
      totalTasks: 82,
      rating: 4.6,
      skills: ["Digital Marketing", "SEO", "Google Ads", "Analytics"]
    },
    {
      id: 5,
      name: "Lucia Ferreira",
      role: "Sales Manager",
      department: "Vendas",
      email: "lucia.ferreira@empresa.com",
      phone: "+55 51 99999-7890",
      location: "Curitiba, PR",
      avatar: "/placeholder.svg",
      status: "Ativo",
      joinDate: "2020-05-18",
      projects: 15,
      completedTasks: 324,
      totalTasks: 340,
      rating: 4.9,
      skills: ["Vendas B2B", "CRM", "Negociação", "Gestão de Equipe"]
    },
    {
      id: 6,
      name: "Rafael Lima",
      role: "DevOps Engineer",
      department: "Desenvolvimento",
      email: "rafael.lima@empresa.com",
      phone: "+55 41 99999-2468",
      location: "Florianópolis, SC",
      avatar: "/placeholder.svg",
      status: "Ativo",
      joinDate: "2021-09-30",
      projects: 10,
      completedTasks: 198,
      totalTasks: 215,
      rating: 4.8,
      skills: ["Docker", "Kubernetes", "AWS", "CI/CD"]
    }
  ];

  const departments = [
    { name: "Produto", count: 3, color: "bg-blue-100 text-blue-800" },
    { name: "Desenvolvimento", count: 8, color: "bg-green-100 text-green-800" },
    { name: "Design", count: 4, color: "bg-purple-100 text-purple-800" },
    { name: "Marketing", count: 5, color: "bg-orange-100 text-orange-800" },
    { name: "Vendas", count: 6, color: "bg-red-100 text-red-800" },
    { name: "Suporte", count: 4, color: "bg-yellow-100 text-yellow-800" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800";
      case "Férias": return "bg-yellow-100 text-yellow-800";
      case "Licença": return "bg-blue-100 text-blue-800";
      case "Inativo": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Equipe</h1>
            <p className="text-gray-600 mt-1">Gerencie colaboradores e performance da equipe</p>
            {canPromoteSelf && (
              <Button className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={async () => {
                await updateProfile({ id: profile.id, position: "admin" });
                window.location.reload();
              }}>
                Tornar-se Admin
              </Button>
            )}
          </div>
        {isAdmin && (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Membro
          </Button>
        )}
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Membros</p>
                  <p className="text-2xl font-bold text-gray-900">30</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Membros Ativos</p>
                  <p className="text-2xl font-bold text-green-600">28</p>
                </div>
                <Badge className="bg-green-100 text-green-800">93%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avaliação Média</p>
                  <p className="text-2xl font-bold text-yellow-600">4.7</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Produtividade</p>
                  <p className="text-2xl font-bold text-purple-600">87%</p>
                </div>
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Departments Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Departamentos</CardTitle>
            <CardDescription>Distribuição da equipe por área</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {departments.map((dept) => (
                <div key={dept.name} className="text-center p-4 rounded-lg border hover:shadow-md transition-all">
                  <Badge className={dept.color}>{dept.name}</Badge>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{dept.count}</p>
                  <p className="text-sm text-gray-600">membros</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar membros da equipe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Members List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-600">{member.role}</p>
                          {isAdmin && (
                            <Button variant="ghost" size="sm" onClick={() => {setEditMemberId(member.id.toString()); setNewRole(member.role);}} title="Editar cargo">
                              Editar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{member.location}</span>
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Conclusão de Tarefas</span>
                      <span className="text-sm font-medium">
                        {Math.round((member.completedTasks / member.totalTasks) * 100)}%
                      </span>
                    </div>
                    <Progress value={(member.completedTasks / member.totalTasks) * 100} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{member.projects}</p>
                      <p className="text-xs text-gray-600">Projetos</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{member.completedTasks}</p>
                      <p className="text-xs text-gray-600">Tarefas</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-yellow-600">{member.rating}</p>
                      <p className="text-xs text-gray-600">Avaliação</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Habilidades</p>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {member.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Perfil
                    </Button>
                    <Button size="sm" className="flex-1">
                      Mensagem
                    </Button>
                  </div>
                  {/* Modal de edição de cargo */}
                  {isAdmin && editMemberId === member.id.toString() && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
                        <h2 className="text-lg font-bold mb-2">Editar cargo de {member.name}</h2>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full mb-3"
                          value={newRole}
                          onChange={e => setNewRole(e.target.value)}
                          placeholder="Novo cargo"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setEditMemberId(null)}>Cancelar</Button>
                          <Button size="sm" onClick={async () => {
                            // Em produção, integraria com backend para atualizar cargo
                            await updateProfile({ id: member.id.toString(), position: newRole });
                            setEditMemberId(null);
                          }}>Salvar</Button>
                        </div>
                      </div>
                    </div>
                  )}
      {/* Modal de adicionar usuário */}
      {isAdmin && showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h2 className="text-lg font-bold mb-2">Adicionar Membro</h2>
            <input
              type="text"
              className="border rounded px-2 py-1 w-full mb-2"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Nome"
            />
            <input
              type="email"
              className="border rounded px-2 py-1 w-full mb-2"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Email"
            />
            <input
              type="text"
              className="border rounded px-2 py-1 w-full mb-2"
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              placeholder="Cargo"
            />
            <input
              type="text"
              className="border rounded px-2 py-1 w-full mb-3"
              value={newUser.department}
              onChange={e => setNewUser({ ...newUser, department: e.target.value })}
              placeholder="Departamento"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>Cancelar</Button>
              <Button size="sm" onClick={async () => {
                // Em produção, integraria com Supabase para criar o usuário
                // Exemplo: await createUser(newUser)
                setShowAddModal(false);
                setNewUser({ name: "", email: "", role: "", department: "" });
              }}>Adicionar</Button>
            </div>
          </div>
        </div>
      )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;
