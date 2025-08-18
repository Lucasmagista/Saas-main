import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Plus, Edit, Trash2, Save, Clock, MessageSquare, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutoResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AutoResponseModal({ open, onOpenChange }: AutoResponseModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("rules");
  const [newRule, setNewRule] = useState({
    trigger: "",
    response: "",
    enabled: true,
    schedule: "always"
  });

  const [autoResponses] = useState([
    {
      id: "1",
      name: "Saudação Inicial",
      trigger: "oi|olá|boa tarde|bom dia",
      response: "Olá! 👋 Obrigado por entrar em contato. Como posso ajudá-lo hoje?",
      enabled: true,
      schedule: "business-hours",
      created: "2024-01-15",
      used: 156
    },
    {
      id: "2", 
      name: "Horário de Funcionamento",
      trigger: "horário|funcionamento|aberto",
      response: "Nosso horário de funcionamento é:\n🕘 Segunda a Sexta: 8h às 18h\n🕘 Sábado: 8h às 12h\n❌ Domingo: Fechado",
      enabled: true,
      schedule: "always",
      created: "2024-01-10",
      used: 89
    },
    {
      id: "3",
      name: "Preços e Orçamentos", 
      trigger: "preço|valor|orçamento|quanto custa",
      response: "Para um orçamento personalizado, preciso de algumas informações. Você pode me contar mais sobre o que está procurando? 💰",
      enabled: true,
      schedule: "business-hours",
      created: "2024-01-08",
      used: 234
    },
    {
      id: "4",
      name: "Fora do Horário",
      trigger: "*",
      response: "Obrigado pela mensagem! 🌙\n\nNo momento estamos fora do horário de atendimento. Retornaremos sua mensagem no próximo dia útil.\n\nPara urgências: (11) 99999-0000",
      enabled: true,
      schedule: "after-hours",
      created: "2024-01-05",
      used: 67
    }
  ]);

  const handleSaveRule = () => {
    if (!newRule.trigger.trim() || !newRule.response.trim()) {
      toast({
        title: "Erro",
        description: "Preencha o gatilho e a resposta",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Regra Salva",
      description: "Nova regra de auto-resposta criada com sucesso"
    });

    setNewRule({
      trigger: "",
      response: "",
      enabled: true,
      schedule: "always"
    });
  };

  const toggleRule = (ruleId: string) => {
    toast({
      title: "Regra Atualizada",
      description: "Status da regra alterado com sucesso"
    });
  };

  const deleteRule = (ruleId: string) => {
    toast({
      title: "Regra Removida",
      description: "Auto-resposta removida com sucesso"
    });
  };

  const getScheduleLabel = (schedule: string) => {
    switch (schedule) {
      case "always": return "Sempre";
      case "business-hours": return "Horário Comercial";
      case "after-hours": return "Fora do Horário";
      default: return schedule;
    }
  };

  const getScheduleColor = (schedule: string) => {
    switch (schedule) {
      case "always": return "bg-green-100 text-green-800";
      case "business-hours": return "bg-blue-100 text-blue-800";
      case "after-hours": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Auto-Respostas WhatsApp
          </DialogTitle>
          <DialogDescription>
            Configure respostas automáticas para mensagens recebidas
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Regras Ativas</TabsTrigger>
            <TabsTrigger value="create">Criar Nova</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{autoResponses.length} regras</Badge>
                <Badge variant="outline">{autoResponses.filter(r => r.enabled).length} ativas</Badge>
              </div>
              <Button size="sm" onClick={() => setActiveTab("create")}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Regra
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {autoResponses.map((rule) => (
                  <Card key={rule.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => toggleRule(rule.id)}
                          />
                          <div>
                            <CardTitle className="text-base">{rule.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getScheduleColor(rule.schedule)}>
                                <Clock className="w-3 h-3 mr-1" />
                                {getScheduleLabel(rule.schedule)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Usada {rule.used} vezes
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteRule(rule.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">GATILHO</Label>
                          <p className="text-sm font-mono bg-muted p-2 rounded">{rule.trigger}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">RESPOSTA</Label>
                          <p className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded border-l-2 border-green-500">
                            {rule.response}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="create" className="space-y-4 flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Nova Auto-Resposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trigger">Gatilho (palavras-chave)</Label>
                    <Input
                      id="trigger"
                      placeholder="ex: oi|olá|bom dia"
                      value={newRule.trigger}
                      onChange={(e) => setNewRule({...newRule, trigger: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use | para separar múltiplas palavras. Use * para todas as mensagens.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Horário de Ativação</Label>
                    <Select 
                      value={newRule.schedule} 
                      onValueChange={(value) => setNewRule({...newRule, schedule: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Sempre</SelectItem>
                        <SelectItem value="business-hours">Horário Comercial</SelectItem>
                        <SelectItem value="after-hours">Fora do Horário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response">Mensagem de Resposta</Label>
                  <Textarea
                    id="response"
                    placeholder="Digite a resposta automática..."
                    value={newRule.response}
                    onChange={(e) => setNewRule({...newRule, response: e.target.value})}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{newRule.response.length}/500 caracteres</span>
                    <span>Emojis são permitidos 😊</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={newRule.enabled}
                    onCheckedChange={(checked) => setNewRule({...newRule, enabled: checked})}
                  />
                  <Label>Ativar imediatamente</Label>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Preview da Resposta</h4>
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-500">
                      <p className="whitespace-pre-wrap text-sm">
                        {newRule.response || "Sua resposta aparecerá aqui..."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSaveRule} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Auto-Resposta
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 flex-1">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">546</p>
                      <p className="text-sm text-muted-foreground">Respostas Enviadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">89%</p>
                      <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">2.3s</p>
                      <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Regras Mais Utilizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {autoResponses
                    .sort((a, b) => b.used - a.used)
                    .slice(0, 5)
                    .map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">{rule.trigger}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{rule.used}</p>
                          <p className="text-xs text-muted-foreground">usos</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}