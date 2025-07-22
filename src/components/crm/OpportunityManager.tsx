
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, DollarSign, Calendar, User } from "lucide-react";

export const OpportunityManager = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const opportunities = [
    {
      id: 1,
      title: "Sistema ERP - Tech Corp",
      client: "Tech Corp",
      value: 150000,
      stage: "Proposta",
      probability: 75,
      closeDate: "2024-02-15",
      owner: "João Silva",
      status: "active"
    },
    {
      id: 2,
      title: "CRM Integration - StartUp Inc",
      client: "StartUp Inc",
      value: 85000,
      stage: "Negociação",
      probability: 60,
      closeDate: "2024-02-28",
      owner: "Maria Santos",
      status: "active"
    },
    {
      id: 3,
      title: "Cloud Migration - Enterprise Ltd",
      client: "Enterprise Ltd",
      value: 220000,
      stage: "Qualificação",
      probability: 30,
      closeDate: "2024-03-15",
      owner: "Pedro Costa",
      status: "active"
    }
  ];

  const getStageColor = (stage: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (stage) {
      case "Qualificação": return "secondary";
      case "Proposta": return "default";
      case "Negociação": return "outline";
      case "Fechamento": return "destructive";
      default: return "outline";
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "text-green-600";
    if (probability >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Oportunidades</h2>
          <p className="text-muted-foreground">Acompanhe e gerencie todas as oportunidades</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Oportunidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Oportunidade</DialogTitle>
              <DialogDescription>Adicione uma nova oportunidade de venda</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" placeholder="Nome da oportunidade" />
              </div>
              <div>
                <Label htmlFor="client">Cliente</Label>
                <Input id="client" placeholder="Nome do cliente" />
              </div>
              <div>
                <Label htmlFor="value">Valor</Label>
                <Input id="value" type="number" placeholder="Valor em R$" />
              </div>
              <div>
                <Label htmlFor="stage">Etapa</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualification">Qualificação</SelectItem>
                    <SelectItem value="proposal">Proposta</SelectItem>
                    <SelectItem value="negotiation">Negociação</SelectItem>
                    <SelectItem value="closing">Fechamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" placeholder="Detalhes da oportunidade" />
              </div>
              <Button className="w-full">Criar Oportunidade</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar oportunidades..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por etapa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as etapas</SelectItem>
            <SelectItem value="qualification">Qualificação</SelectItem>
            <SelectItem value="proposal">Proposta</SelectItem>
            <SelectItem value="negotiation">Negociação</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Mais Filtros
        </Button>
      </div>

      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                    <Badge variant={getStageColor(opportunity.stage)}>
                      {opportunity.stage}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {opportunity.client}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      R$ {opportunity.value.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(opportunity.closeDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Responsável: {opportunity.owner}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getProbabilityColor(opportunity.probability)}`}>
                    {opportunity.probability}%
                  </div>
                  <div className="text-sm text-muted-foreground">Probabilidade</div>
                  <div className="mt-2">
                    <Button size="sm">Editar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
