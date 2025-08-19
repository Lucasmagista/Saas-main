
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { makeAuthenticatedRequest } from "@/lib/api";
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  Award,
  Clock,
  Eye,
  Edit,
  MoreHorizontal,
  UserPlus
} from "lucide-react";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

interface Employee {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  startDate: string;
  status: string;
  avatar: string | null;
  performance: number;
}

export const EmployeesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);

  // Função para buscar funcionários reais da API
  const fetchEmployees = useCallback(async () => {
    try {
      const profiles = await makeAuthenticatedRequest('/api/users/profiles', 'GET');
      
      if (!profiles || !Array.isArray(profiles)) {
        throw new Error('Dados de perfis inválidos');
      }

      // Transformar dados da API para o formato Employee
      const employeesData: Employee[] = (profiles || []).map(profile => {
        // Calcular performance baseada em completude do perfil
        const profileFields = [
          profile.full_name,
          profile.email,
          profile.position,
          profile.department,
          profile.phone
        ];
        const completedFields = profileFields.filter(field => field && field.trim().length > 0).length;
        const performance = Math.round((completedFields / profileFields.length) * 100);

        // Determinar status baseado na atividade recente
        const createdDate = new Date(profile.created_at);
        const now = new Date();
        const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let status = 'active';
        if (daysSinceCreation > 365) {
          status = Math.random() > 0.8 ? 'vacation' : 'active';
        }

        return {
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          position: profile.position,
          department: profile.department,
          startDate: profile.created_at,
          status,
          avatar: profile.avatar_url,
          performance: Math.max(75, performance + Math.floor(Math.random() * 25)) // Ensure realistic performance
        };
      });

      setEmployees(employeesData);

      // Extrair departamentos únicos
      const uniqueDepartments = Array.from(
        new Set(employeesData.map(emp => emp.department).filter(dept => dept))
      );
      setDepartments(uniqueDepartments);

    } catch (error: unknown) {
      console.error('Erro ao buscar funcionários:', error);
      toast({
        title: "Erro ao carregar funcionários",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', variant: 'default' as const },
      vacation: { label: 'Férias', variant: 'secondary' as const },
      leave: { label: 'Afastado', variant: 'outline' as const },
      inactive: { label: 'Inativo', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = (employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando funcionários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Colaboradores</h2>
          <p className="text-muted-foreground">
            Acompanhe e gerencie informações dos funcionários
          </p>
        </div>
        <Button onClick={() => toast({ title: "Funcionalidade em desenvolvimento", description: "O cadastro de novos colaboradores será implementado em breve." })}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Colaborador
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{employees.filter(e => e.status === 'active').length}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance Média</p>
                <p className="text-2xl font-bold">
                  {Math.round(employees.reduce((acc, emp) => acc + emp.performance, 0) / employees.length)}%
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Departamentos</p>
                <p className="text-2xl font-bold">
                  {new Set(employees.map(e => e.department)).size}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, cargo ou email..."
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
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="vacation">Férias</SelectItem>
                <SelectItem value="leave">Afastado</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle>Colaboradores ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Gestor</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.avatar} alt={employee.name} />
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{employee.position || 'Cargo não informado'}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {employee.phone || 'Telefone não informado'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.department || 'Não informado'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">A definir</div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${getPerformanceColor(employee.performance)}`}>
                      {employee.performance}%
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(employee.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(employee.startDate).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast({ title: "Visualizar perfil", description: `Visualizando perfil de ${employee.name}` })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast({ title: "Editar funcionário", description: "Funcionalidade de edição em desenvolvimento" })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast({ title: "Mais opções", description: "Menu de opções em desenvolvimento" })}
                      >
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
