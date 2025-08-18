
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  MoreHorizontal,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useSalesStages, useOpportunities, useCreateOpportunity, useUpdateOpportunity } from '@/hooks/useAdvancedCRM';
import { useLeads } from '@/hooks/useLeads';
import { formatCurrency } from '@/lib/utils';

export const SalesPipelineAdvanced = () => {
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    value: '',
    stage: '',
    probability: 0,
    expected_close_date: '',
    lead_id: '',
    pipeline_id: 'default',
    assigned_to: '',
  });

  const { data: stages } = useSalesStages();
  const { data: opportunities } = useOpportunities();
  const { leads } = useLeads();
  const createOpportunity = useCreateOpportunity();
  const updateOpportunity = useUpdateOpportunity();

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createOpportunity.mutateAsync({
        ...newOpportunity,
        value: parseFloat(newOpportunity.value) || 0,
        organization_id: 'temp-org-id',
        created_by: 'temp-user-id',
        assigned_to: newOpportunity.assigned_to || 'temp-user-id',
      });
      
      setIsCreateDialogOpen(false);
      setNewOpportunity({
        title: '',
        description: '',
        value: '',
        stage: '',
        probability: 0,
        expected_close_date: '',
        lead_id: '',
        pipeline_id: 'default',
        assigned_to: '',
      });
    } catch (error) {
      console.error('Erro ao criar oportunidade:', error);
    }
  };

  const handleMoveOpportunity = async (opportunityId: string, newStage: string) => {
    const stage = stages?.find(s => s.name === newStage);
    
    try {
      await updateOpportunity.mutateAsync({
        id: opportunityId,
        stage: newStage,
        probability: stage?.probability || 0,
      });
    } catch (error) {
      console.error('Erro ao mover oportunidade:', error);
    }
  };

  const getOpportunitiesByStage = (stageName: string) => {
    return opportunities?.filter(opp => opp.stage === stageName) || [];
  };

  const getTotalValueByStage = (stageName: string) => {
    return getOpportunitiesByStage(stageName).reduce((sum, opp) => sum + (opp.value || 0), 0);
  };

  const getStageStats = () => {
    const totalValue = opportunities?.reduce((sum, opp) => sum + (opp.value || 0), 0) || 0;
    const totalOpportunities = opportunities?.length || 0;
    const closedOpportunities = opportunities?.filter(opp => opp.stage === 'Fechado').length || 0;
    const closeRate = totalOpportunities > 0 ? (closedOpportunities / totalOpportunities) * 100 : 0;

    return { totalValue, totalOpportunities, closedOpportunities, closeRate };
  };

  const stats = getStageStats();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Pipeline de Vendas</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Oportunidade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Oportunidade</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOpportunity}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={newOpportunity.title}
                        onChange={(e) => setNewOpportunity({ ...newOpportunity, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="value">Valor</Label>
                      <Input
                        id="value"
                        type="number"
                        value={newOpportunity.value}
                        onChange={(e) => setNewOpportunity({ ...newOpportunity, value: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newOpportunity.description}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lead">Lead</Label>
                      <Select value={newOpportunity.lead_id} onValueChange={(value) => setNewOpportunity({ ...newOpportunity, lead_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar lead" />
                        </SelectTrigger>
                        <SelectContent>
                          {leads?.map((lead) => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.name} - {lead.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stage">Estágio</Label>
                      <Select value={newOpportunity.stage} onValueChange={(value) => setNewOpportunity({ ...newOpportunity, stage: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar estágio" />
                        </SelectTrigger>
                        <SelectContent>
                          {stages?.map((stage) => (
                            <SelectItem key={stage.id} value={stage.name}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="probability">Probabilidade (%)</Label>
                      <Input
                        id="probability"
                        type="number"
                        min="0"
                        max="100"
                        value={newOpportunity.probability}
                        onChange={(e) => setNewOpportunity({ ...newOpportunity, probability: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expected_close_date">Data Prevista de Fechamento</Label>
                      <Input
                        id="expected_close_date"
                        type="date"
                        value={newOpportunity.expected_close_date}
                        onChange={(e) => setNewOpportunity({ ...newOpportunity, expected_close_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createOpportunity.isPending}>
                    Criar Oportunidade
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total em Vendas</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Oportunidades</p>
                  <p className="text-2xl font-bold">{stats.totalOpportunities}</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fechadas</p>
                  <p className="text-2xl font-bold">{stats.closedOpportunities}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                  <p className="text-2xl font-bold">{stats.closeRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages?.map((stage) => {
          const stageOpportunities = getOpportunitiesByStage(stage.name);
          const stageValue = getTotalValueByStage(stage.name);
          
          return (
            <Card key={stage.id} className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                  <Badge variant="outline">{stageOpportunities.length}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatCurrency(stageValue)}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {stageOpportunities.map((opportunity) => (
                    <Card key={opportunity.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {opportunity.title}
                          </h4>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${opportunity.lead?.name}`} />
                            <AvatarFallback className="text-xs">
                              {opportunity.lead?.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground truncate">
                            {opportunity.lead?.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-green-600">
                            {formatCurrency(opportunity.value || 0)}
                          </span>
                          <span className="text-muted-foreground">
                            {opportunity.probability}%
                          </span>
                        </div>
                        
                        <Progress value={opportunity.probability} className="h-1" />
                        
                        {opportunity.expected_close_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(opportunity.expected_close_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {stageOpportunities.length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Nenhuma oportunidade neste estágio
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
