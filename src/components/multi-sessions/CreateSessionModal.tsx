
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CreateSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSessionModal({ open, onOpenChange }: CreateSessionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    platform: '',
    phoneNumber: '',
    maxConcurrentChats: 50,
    autoRestart: true,
    enableNotifications: true,
    sessionTimeout: 30,
    webhookUrl: '',
    aiModel: 'gpt-3.5-turbo',
    language: 'pt-BR'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Criando nova sessão:', formData);
    // Implementar criação da sessão
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Sessão</DialogTitle>
          <DialogDescription>
            Configure uma nova sessão de bot para suas conversas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Sessão</Label>
                  <Input
                    id="name"
                    placeholder="Ex: WhatsApp Vendas"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="platform">Plataforma</Label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">📱 WhatsApp</SelectItem>
                      <SelectItem value="telegram">✈️ Telegram</SelectItem>
                      <SelectItem value="discord">🎮 Discord</SelectItem>
                      <SelectItem value="instagram">📸 Instagram</SelectItem>
                      <SelectItem value="facebook">📘 Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber">Número/Token/ID</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Ex: +55 11 99999-0000 ou @botusername"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Desempenho */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações de Desempenho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxChats">Máx. Chats Simultâneos</Label>
                  <Input
                    id="maxChats"
                    type="number"
                    min="1"
                    max="200"
                    value={formData.maxConcurrentChats}
                    onChange={(e) => setFormData({...formData, maxConcurrentChats: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (minutos)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="5"
                    max="120"
                    value={formData.sessionTimeout}
                    onChange={(e) => setFormData({...formData, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reinício Automático</Label>
                    <p className="text-sm text-gray-500">Reiniciar automaticamente em caso de erro</p>
                  </div>
                  <Switch
                    checked={formData.autoRestart}
                    onCheckedChange={(checked) => setFormData({...formData, autoRestart: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações</Label>
                    <p className="text-sm text-gray-500">Receber notificações de status</p>
                  </div>
                  <Switch
                    checked={formData.enableNotifications}
                    onCheckedChange={(checked) => setFormData({...formData, enableNotifications: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IA e Integrações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">IA e Integrações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aiModel">Modelo de IA</Label>
                  <Select value={formData.aiModel} onValueChange={(value) => setFormData({...formData, aiModel: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={formData.language} onValueChange={(value) => setFormData({...formData, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">🇧🇷 Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
                      <SelectItem value="es-ES">🇪🇸 Español</SelectItem>
                      <SelectItem value="fr-FR">🇫🇷 Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="webhook">URL do Webhook (Opcional)</Label>
                <Input
                  id="webhook"
                  placeholder="https://sua-api.com/webhook"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Sessão
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
