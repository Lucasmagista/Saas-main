
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Smartphone, Monitor, Globe, Key, AlertTriangle, Check, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SecuritySettings = () => {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(85);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const activeSessions = [
    { id: 1, device: "Sessão Atual", location: "Local", ip: "xxx.xxx.xxx.xxx", lastActive: "Agora", current: true },
  ];

  const securityEvents = [
    { id: 1, event: "Login realizado", device: "Navegador", time: "Agora", type: "success" },
  ];

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Senha alterada",
      description: "Sua senha foi atualizada com sucesso.",
    });
    setNewPassword("");
    setConfirmPassword("");
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handlePasswordInput = (value: string) => {
    setNewPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const terminateSession = (sessionId: number) => {
    toast({
      title: "Sessão encerrada",
      description: "A sessão foi terminada com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Configurações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Configurações de Segurança
          </CardTitle>
          <CardDescription>Proteja sua conta com configurações avançadas de segurança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Autenticação de Dois Fatores (2FA)</h4>
                <p className="text-sm text-gray-600">Adicione uma camada extra de segurança à sua conta</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                  {twoFactorEnabled ? "Ativo" : "Inativo"}
                </Badge>
                <Switch 
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Alertas por Email</h4>
                <p className="text-sm text-gray-600">Receba notificações sobre atividades suspeitas</p>
              </div>
              <Switch 
                checked={emailAlerts}
                onCheckedChange={setEmailAlerts}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Verificação de Dispositivo</h4>
                <p className="text-sm text-gray-600">Solicitar aprovação para novos dispositivos</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <div className="relative">
              <Input 
                id="current-password" 
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha atual"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input 
              id="new-password" 
              type="password"
              value={newPassword}
              onChange={(e) => handlePasswordInput(e.target.value)}
              placeholder="Digite sua nova senha"
            />
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Força da senha:</span>
                  <span className={passwordStrength >= 75 ? "text-green-600" : passwordStrength >= 50 ? "text-yellow-600" : "text-red-600"}>
                    {passwordStrength >= 75 ? "Forte" : passwordStrength >= 50 ? "Média" : "Fraca"}
                  </span>
                </div>
                <Progress value={passwordStrength} className="h-2" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input 
              id="confirm-password" 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
            />
          </div>
          <Button onClick={handlePasswordChange} className="w-full">
            Alterar Senha
          </Button>
        </CardContent>
      </Card>

      {/* Sessões Ativas */}
      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
          <CardDescription>Gerencie os dispositivos conectados à sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {session.device.includes("iPhone") ? (
                      <Smartphone className="w-5 h-5" />
                    ) : session.device.includes("MacBook") ? (
                      <Monitor className="w-5 h-5" />
                    ) : (
                      <Globe className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {session.device}
                      {session.current && <Badge variant="outline" className="text-xs">Atual</Badge>}
                    </h4>
                    <p className="text-sm text-gray-600">{session.location} • {session.ip}</p>
                    <p className="text-xs text-gray-500">Último acesso: {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Encerrar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Encerrar sessão?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação encerrará a sessão no dispositivo "{session.device}". O usuário precisará fazer login novamente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => terminateSession(session.id)}>
                          Encerrar Sessão
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade de Segurança</CardTitle>
          <CardDescription>Histórico recente de eventos relacionados à segurança</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${
                  event.type === 'success' ? 'bg-green-100 text-green-600' :
                  event.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  event.type === 'danger' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {event.type === 'success' ? <Check className="w-4 h-4" /> :
                   event.type === 'warning' || event.type === 'danger' ? <AlertTriangle className="w-4 h-4" /> :
                   <Shield className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{event.event}</h4>
                  <p className="text-sm text-gray-600">{event.device} • {event.time}</p>
                </div>
                <Badge variant={
                  event.type === 'success' ? 'default' :
                  event.type === 'warning' ? 'secondary' :
                  event.type === 'danger' ? 'destructive' :
                  'outline'
                }>
                  {event.type === 'success' ? 'Sucesso' :
                   event.type === 'warning' ? 'Atenção' :
                   event.type === 'danger' ? 'Bloqueado' :
                   'Info'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
