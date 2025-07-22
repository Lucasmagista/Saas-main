
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export const EmployeesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Dados simulados de colaboradores
  const employees = [
    {
      id: 1,
      name: "João Silva",
      email: "joao.silva@company.com",
      phone: "(11) 99999-9999",
      position: "Desenvolvedor Senior",
      department: "Tecnologia",
      manager: "Maria Santos",
      startDate: "2023-03-15",
      status: "active",
      location: "São Paulo - SP",
      salary: "R$ 10.000",
      performance: 92,
      avatar: "/avatars/joao.jpg"
    },
    {
      id: 2,
      name: "Ana Costa",
      email: "ana.costa@company.com",
      phone: "(11) 88888-8888",
      position: "Gerente de Marketing",
      department: "Marketing",
      manager: "Carlos Lima",
      startDate: "2022-08-10",
      status: "active",
      location: "Rio de Janeiro - RJ",
      salary: "R$ 12.000",
      performance: 88,
      avatar: "/avatars/ana.jpg"
    },
    {
      id: 3,
      name: "Pedro Oliveira",
      email: "pedro.oliveira@company.com",
      phone: "(11) 77777-7777",
      position: "Designer UX",
      department: "Design",
      manager: "Ana Costa",
      startDate: "2023-01-20",
      status: "vacation",
      location: "São Paulo - SP",
      salary: "R$ 8.000",
      performance: 85,
      avatar: "/avatars/pedro.jpg"
    },
    {
      id: 4,
      name: "Carla Mendes",
      email: "carla.mendes@company.com",
      phone: "(11) 66666-6666",
      position: "Analista Financeiro",
      department: "Financeiro",
      manager: "Roberto Silva",
      startDate: "2023-06-01",
      status: "active",
      location: "Belo Horizonte - MG",
      salary: "R$ 6.500",
      performance: 90,
      avatar: "/avatars/carla.jpg"
    }
  ];

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
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

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
        <Button>
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
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
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
                      <div className="font-medium">{employee.position}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {employee.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.department}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{employee.manager}</div>
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
