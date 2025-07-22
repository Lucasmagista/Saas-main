
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Filter, Mail, Phone, MapPin, Calendar, Star, TrendingUp, Users, ShoppingCart, Activity, MessageSquare, Edit, Trash2 } from "lucide-react";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("all");

  const customers = [
    {
      id: 1,
      name: "Maria Silva",
      email: "maria.silva@empresa.com",
      phone: "+55 11 99999-1234",
      company: "Tech Solutions Ltda",
      location: "São Paulo, SP",
      avatar: "/placeholder.svg",
      status: "Ativo",
      segment: "Enterprise",
      totalSpent: 45680,
      orders: 23,
      lastPurchase: "2 dias atrás",
      lifetimeValue: 67890,
      satisfaction: 4.8,
      tags: ["VIP", "Pagamento Pontual", "Referência"]
    },
    {
      id: 2,
      name: "João Santos",
      email: "joao@startup.io",
      phone: "+55 21 99999-5678",
      company: "StartupTech",
      location: "Rio de Janeiro, RJ",
      avatar: "/placeholder.svg",
      status: "Ativo",
      segment: "Startup",
      totalSpent: 12450,
      orders: 8,
      lastPurchase: "1 semana atrás",
      lifetimeValue: 18750,
      satisfaction: 4.5,
      tags: ["Inovador", "Crescimento"]
    },
    {
      id: 3,
      name: "Ana Costa",
      email: "ana.costa@freelancer.com",
      phone: "+55 31 99999-9012",
      company: "Freelancer",
      location: "Belo Horizonte, MG",
      avatar: "/placeholder.svg",
      status: "Inativo",
      segment: "Freelancer",
      totalSpent: 3280,
      orders: 12,
      lastPurchase: "3 meses atrás",
      lifetimeValue: 4920,
      satisfaction: 4.2,
      tags: ["Designer", "Criativo"]
    },
    {
      id: 4,
      name: "Carlos Oliveira",
      email: "carlos@mediabiz.com",
      phone: "+55 85 99999-3456",
      company: "Media Business",
      location: "Fortaleza, CE",
      avatar: "/placeholder.svg",
      status: "Ativo",
      segment: "SMB",
      totalSpent: 28750,
      orders: 15,
      lastPurchase: "5 dias atrás",
      lifetimeValue: 43125,
      satisfaction: 4.7,
      tags: ["Marketing", "Parceiro"]
    }
  ];

  const segments = [
    { id: "Enterprise", name: "Enterprise", count: 45, color: "bg-purple-100 text-purple-800" },
    { id: "SMB", name: "SMB", count: 128, color: "bg-blue-100 text-blue-800" },
    { id: "Startup", name: "Startup", count: 89, color: "bg-green-100 text-green-800" },
    { id: "Freelancer", name: "Freelancer", count: 156, color: "bg-orange-100 text-orange-800" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800";
      case "Inativo": return "bg-red-100 text-red-800";
      case "Suspenso": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Clientes</h1>
            <p className="text-gray-600 mt-1">CRM completo com histórico e segmentação inteligente</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total de Clientes</p>
                  <p className="text-2xl font-bold">418</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+12.5%</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Lifetime Value</p>
                  <p className="text-2xl font-bold">R$ 2.4M</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+8.3%</span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Pedidos Totais</p>
                  <p className="text-2xl font-bold">1,247</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+15.2%</span>
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Satisfação Média</p>
                  <p className="text-2xl font-bold">4.6/5</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    <span className="text-sm">Excelente</span>
                  </div>
                </div>
                <Star className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Segmentação de Clientes</CardTitle>
            <CardDescription>Distribuição por categoria de negócio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {segments.map((segment) => (
                <div key={segment.id} className="text-center p-4 rounded-lg border hover:shadow-md transition-all">
                  <Badge className={segment.color}>{segment.name}</Badge>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{segment.count}</p>
                  <p className="text-sm text-gray-600">clientes</p>
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
                  placeholder="Buscar clientes por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avançados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                        <p className="text-sm text-gray-600">{customer.company}</p>
                        <Badge className={getStatusColor(customer.status)} variant="secondary">
                          {customer.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{customer.location}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">R$ {customer.totalSpent.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Total Gasto</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{customer.orders}</p>
                      <p className="text-xs text-gray-600">Pedidos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-yellow-600">{customer.satisfaction}</p>
                      <p className="text-xs text-gray-600">Satisfação</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">R$ {customer.lifetimeValue.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">LTV</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {customer.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Last Activity */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Última compra: {customer.lastPurchase}</span>
                    <Badge className={`${customer.segment === 'Enterprise' ? 'bg-purple-100 text-purple-800' : 
                      customer.segment === 'SMB' ? 'bg-blue-100 text-blue-800' :
                      customer.segment === 'Startup' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'}`}>
                      {customer.segment}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Customers;
