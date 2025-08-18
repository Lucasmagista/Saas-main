import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  UserPlus, 
  KeyRound, 
  Ban, 
  Download, 
  Database,
  Settings,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminQuickActions: React.FC = () => {
  const { toast } = useToast();

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    role: 'user',
    password: ''
  });

  const [resetPassword, setResetPassword] = useState({
    email: '',
    newPassword: ''
  });

  const handleCreateUser = async () => {
    setLoadingAction('create-user');
    try {
      // Simula chamada de API
      await new Promise(res => setTimeout(res, 1200));
      // Aqui você faria a chamada real para a API
      toast({
        title: 'Usuário criado com sucesso!',
        description: `Usuário ${newUser.email} foi criado com role ${newUser.role}`,
      });
      setNewUser({ email: '', fullName: '', role: 'user', password: '' });
      setIsCreateUserOpen(false);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: 'Erro ao criar usuário',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetPassword = async () => {
    setLoadingAction('reset-password');
    try {
      await new Promise(res => setTimeout(res, 1000));
      // Aqui você faria a chamada real para a API
      toast({
        title: 'Senha resetada com sucesso!',
        description: `Nova senha enviada para ${resetPassword.email}`,
      });
      setResetPassword({ email: '', newPassword: '' });
      setIsResetPasswordOpen(false);
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: 'Erro ao resetar senha',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGenerateBackup = async () => {
    setLoadingAction('backup');
    try {
      await new Promise(res => setTimeout(res, 1500));
      toast({
        title: 'Backup iniciado',
        description: 'O backup do sistema foi iniciado. Você será notificado quando concluído.',
      });
      setIsBackupOpen(false);
    } catch (error) {
      console.error('Erro ao gerar backup:', error);
      toast({
        title: 'Erro ao gerar backup',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSystemMaintenance = async () => {
    setLoadingAction('maintenance');
    try {
      await new Promise(res => setTimeout(res, 1200));
      toast({
        title: 'Modo de manutenção ativado',
        description: 'O sistema entrará em modo de manutenção em 5 minutos.',
        variant: 'destructive',
      });
      setIsMaintenanceOpen(false);
    } catch (error) {
      console.error('Erro ao ativar manutenção:', error);
      toast({
        title: 'Erro ao ativar manutenção',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBlockAccount = async () => {
    setLoadingAction('block-account');
    try {
      await new Promise(res => setTimeout(res, 1000));
      toast({ title: 'Conta bloqueada!', description: 'O usuário selecionado foi bloqueado.' });
    } catch (error) {
      toast({ title: 'Erro ao bloquear conta', description: 'Ocorreu um erro inesperado', variant: 'destructive' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportReport = async () => {
    setLoadingAction('export-report');
    try {
      await new Promise(res => setTimeout(res, 1200));
      toast({ title: 'Relatório exportado!', description: 'O download do relatório foi iniciado.' });
    } catch (error) {
      toast({ title: 'Erro ao exportar relatório', description: 'Ocorreu um erro inesperado', variant: 'destructive' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleClearCache = async () => {
    setLoadingAction('cache-clear');
    try {
      await new Promise(res => setTimeout(res, 800));
      toast({ title: 'Cache limpo com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro ao limpar cache', description: 'Ocorreu um erro inesperado', variant: 'destructive' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSystemSettings = async () => {
    setLoadingAction('system-settings');
    try {
      await new Promise(res => setTimeout(res, 700));
      toast({ title: 'Redirecionando para configurações...' });
    } catch (error) {
      toast({ title: 'Erro ao acessar configurações', description: 'Ocorreu um erro inesperado', variant: 'destructive' });
    } finally {
      setLoadingAction(null);
    }
  };

  const quickActions = [
    {
      id: 'create-user',
      title: 'Criar Usuário',
      description: 'Adicionar novo usuário ao sistema',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
  action: () => setIsCreateUserOpen(true),
    },
    {
      id: 'reset-password',
      title: 'Resetar Senha',
      description: 'Redefinir senha de usuário',
      icon: KeyRound,
      color: 'bg-yellow-500 hover:bg-yellow-600',
  action: () => setIsResetPasswordOpen(true),
    },
    {
      id: 'block-account',
      title: 'Bloquear Conta',
      description: 'Suspender acesso de usuário',
      icon: Ban,
      color: 'bg-red-500 hover:bg-red-600',
  action: handleBlockAccount,
    },
    {
      id: 'backup',
      title: 'Gerar Backup',
      description: 'Backup completo do sistema',
      icon: Database,
      color: 'bg-green-500 hover:bg-green-600',
  action: () => setIsBackupOpen(true),
    },
    {
      id: 'export-report',
      title: 'Exportar Relatório',
      description: 'Relatório de atividades',
      icon: Download,
      color: 'bg-purple-500 hover:bg-purple-600',
  action: handleExportReport,
    },
    {
      id: 'system-settings',
      title: 'Configurações',
      description: 'Configurações do sistema',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
  action: handleSystemSettings,
    },
    {
      id: 'cache-clear',
      title: 'Limpar Cache',
      description: 'Limpar cache do sistema',
      icon: RefreshCw,
      color: 'bg-indigo-500 hover:bg-indigo-600',
  action: handleClearCache,
    },
    {
      id: 'maintenance',
      title: 'Manutenção',
      description: 'Modo de manutenção',
      icon: AlertTriangle,
      color: 'bg-orange-500 hover:bg-orange-600',
  action: () => setIsMaintenanceOpen(true),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Administrativas Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className={`h-20 flex flex-col gap-2 ${action.color} text-white border-none hover:text-white`}
                  onClick={action.action}
                  disabled={loadingAction === action.id}
                >
                  {loadingAction === action.id ? (
                    <span className="flex flex-col items-center justify-center gap-1">
                      <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                      <span className="text-xs font-medium">Aguarde...</span>
                    </span>
                  ) : (
                    <>
                      <IconComponent className="h-6 w-6" />
                      <span className="text-xs font-medium text-center">{action.title}</span>
                    </>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Links Úteis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => window.open('https://docs.seusistema.com/security', '_blank')}>
              <FileText className="h-4 w-4" />
              Documentação de Segurança
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => window.open('https://docs.seusistema.com/audit-logs', '_blank')}>
              <MessageSquare className="h-4 w-4" />
              Logs de Auditoria
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => window.open('https://docs.seusistema.com/faq-admin', '_blank')}>
              <Settings className="h-4 w-4" />
              FAQ do Administrador
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Adicione um novo usuário ao sistema com as informações básicas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@exemplo.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                value={newUser.fullName}
                onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Nome do usuário"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha Temporária</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Senha temporária"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserOpen(false)} disabled={loadingAction === 'create-user'}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={loadingAction === 'create-user'}>
              {loadingAction === 'create-user' ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar Senha</DialogTitle>
            <DialogDescription>
              Defina uma nova senha para o usuário selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resetEmail">Email do Usuário</Label>
              <Input
                id="resetEmail"
                type="email"
                value={resetPassword.email}
                onChange={(e) => setResetPassword(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={resetPassword.newPassword}
                onChange={(e) => setResetPassword(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Nova senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)} disabled={loadingAction === 'reset-password'}>
              Cancelar
            </Button>
            <Button onClick={handleResetPassword} disabled={loadingAction === 'reset-password'}>
              {loadingAction === 'reset-password' ? 'Resetando...' : 'Resetar Senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBackupOpen} onOpenChange={setIsBackupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Backup do Sistema</DialogTitle>
            <DialogDescription>
              Isso irá criar um backup completo do banco de dados e arquivos do sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              O backup incluirá:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
              <li>Banco de dados completo</li>
              <li>Arquivos de configuração</li>
              <li>Logs do sistema</li>
              <li>Uploads de usuários</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBackupOpen(false)} disabled={loadingAction === 'backup'}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateBackup} disabled={loadingAction === 'backup'}>
              {loadingAction === 'backup' ? 'Gerando...' : 'Gerar Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modo de Manutenção</DialogTitle>
            <DialogDescription>
              Ativar o modo de manutenção impedirá que usuários acessem o sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Atenção!</span>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Todos os usuários serão desconectados e não poderão acessar o sistema até que o modo de manutenção seja desativado.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMaintenanceOpen(false)} disabled={loadingAction === 'maintenance'}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleSystemMaintenance} disabled={loadingAction === 'maintenance'}>
              {loadingAction === 'maintenance' ? 'Ativando...' : 'Ativar Manutenção'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
