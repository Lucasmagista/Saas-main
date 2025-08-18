import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Filter, 
  X, 
  Search, 
  Calendar,
  Phone,
  User,
  MessageSquare
} from 'lucide-react';

interface WhatsAppFiltersProps {
  onFiltersChange: (filters: WhatsAppMessageFilters) => void;
  onClearFilters: () => void;
  currentFilters: WhatsAppMessageFilters;
  isLoading?: boolean;
}

interface WhatsAppMessageFilters {
  number?: string;
  date?: string;
  conversation_id?: string;
  messageType?: string;
  senderType?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const WhatsAppFilters = ({ 
  onFiltersChange, 
  onClearFilters, 
  currentFilters,
  isLoading 
}: WhatsAppFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState<WhatsAppMessageFilters>(currentFilters);

  const handleFilterChange = (key: keyof WhatsAppMessageFilters, value: string | { start: string; end: string } | undefined) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setShowAdvanced(false);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onClearFilters();
    setShowAdvanced(false);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(currentFilters).filter(key => 
      currentFilters[key as keyof WhatsAppMessageFilters]
    ).length;
  };

  const removeFilter = (key: keyof WhatsAppMessageFilters) => {
    const newFilters = { ...currentFilters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros de Mensagens
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFiltersCount()} ativo{getActiveFiltersCount() > 1 ? 's' : ''}
              </Badge>
            )}
            <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  Filtros
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Filtros Avançados</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Filtro por número */}
                  <div className="space-y-2">
                    <Label htmlFor="filter-number" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Número do WhatsApp
                    </Label>
                    <Input
                      id="filter-number"
                      placeholder="Ex: 5511999990000"
                      value={localFilters.number || ''}
                      onChange={(e) => handleFilterChange('number', e.target.value)}
                    />
                  </div>

                  {/* Filtro por data */}
                  <div className="space-y-2">
                    <Label htmlFor="filter-date" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data
                    </Label>
                    <Input
                      id="filter-date"
                      type="date"
                      value={localFilters.date || ''}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                    />
                  </div>

                  {/* Filtro por tipo de remetente */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Tipo de Remetente
                    </Label>
                    <Select
                      value={localFilters.senderType || ''}
                      onValueChange={(value) => handleFilterChange('senderType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os tipos</SelectItem>
                        <SelectItem value="user">Cliente</SelectItem>
                        <SelectItem value="agent">Agente</SelectItem>
                        <SelectItem value="bot">Bot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por tipo de mensagem */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Tipo de Mensagem
                    </Label>
                    <Select
                      value={localFilters.messageType || ''}
                      onValueChange={(value) => handleFilterChange('messageType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os tipos</SelectItem>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="image">Imagem</SelectItem>
                        <SelectItem value="audio">Áudio</SelectItem>
                        <SelectItem value="document">Documento</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Período personalizado */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Período Personalizado
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="date-start" className="text-xs text-muted-foreground">
                          Data inicial
                        </Label>
                        <Input
                          id="date-start"
                          type="date"
                          value={localFilters.dateRange?.start || ''}
                          onChange={(e) => 
                            handleFilterChange('dateRange', {
                              ...localFilters.dateRange,
                              start: e.target.value
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="date-end" className="text-xs text-muted-foreground">
                          Data final
                        </Label>
                        <Input
                          id="date-end"
                          type="date"
                          value={localFilters.dateRange?.end || ''}
                          onChange={(e) => 
                            handleFilterChange('dateRange', {
                              ...localFilters.dateRange,
                              end: e.target.value
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={applyFilters} className="flex-1" disabled={isLoading}>
                      {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={clearAllFilters}
                      disabled={isLoading}
                    >
                      Limpar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      {/* Filtros ativos */}
      {getActiveFiltersCount() > 0 && (
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {currentFilters.number && (
              <Badge variant="secondary" className="text-xs">
                <Phone className="w-3 h-3 mr-1" />
                {currentFilters.number}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('number')}
                  className="ml-1 h-auto p-0 hover:text-destructive"
                  title="Remover filtro"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            
            {currentFilters.date && (
              <Badge variant="secondary" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(currentFilters.date).toLocaleDateString('pt-BR')}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('date')}
                  className="ml-1 h-auto p-0 hover:text-destructive"
                  title="Remover filtro"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {currentFilters.senderType && (
              <Badge variant="secondary" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                {(() => {
                  if (currentFilters.senderType === 'user') return 'Cliente';
                  if (currentFilters.senderType === 'agent') return 'Agente';
                  return 'Bot';
                })()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('senderType')}
                  className="ml-1 h-auto p-0 hover:text-destructive"
                  title="Remover filtro"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {currentFilters.messageType && (
              <Badge variant="secondary" className="text-xs">
                <MessageSquare className="w-3 h-3 mr-1" />
                {currentFilters.messageType}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('messageType')}
                  className="ml-1 h-auto p-0 hover:text-destructive"
                  title="Remover filtro"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {/* Botão para limpar todos */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Limpar todos
            </Button>
          </div>
        </CardContent>
      )}

      {/* Busca rápida */}
      <CardContent className="pt-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Busca rápida por número ou texto..."
            className="pl-10"
            value={currentFilters.number || ''}
            onChange={(e) => onFiltersChange({ ...currentFilters, number: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
