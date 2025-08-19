import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Shield, QrCode, Key, Download, Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { makeAuthenticatedRequest } from '../utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  otpauthUrl: string;
}

interface BackupCodes {
  codes: string[];
}

export const TwoFactorAuth: React.FC = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [token, setToken] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);

  // Loading states
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/auth/2fa/status`);
      setIs2FAEnabled(response.data.enabled);
    } catch (error) {
      console.error('Erro ao verificar status do 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startSetup = async () => {
    try {
      setIsSettingUp(true);
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/auth/2fa/setup`);
      setSetupData(response.data);
      setIsSetupDialogOpen(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao iniciar configuração do 2FA');
    } finally {
      setIsSettingUp(false);
    }
  };

  const enable2FA = async () => {
    if (!token || token.length !== 6) {
      toast.error('Digite um token válido de 6 dígitos');
      return;
    }

    try {
      setIsEnabling(true);
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/auth/2fa/enable`, {
        method: 'POST',
        data: { token }
      });
      
      setBackupCodes(response.data.backupCodes);
      setIs2FAEnabled(true);
      setIsSetupDialogOpen(false);
      setToken('');
      toast.success('2FA habilitado com sucesso!');
      
      // Mostrar backup codes
      setShowBackupCodes(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao habilitar 2FA');
    } finally {
      setIsEnabling(false);
    }
  };

  const disable2FA = async () => {
    if (!token || token.length !== 6) {
      toast.error('Digite um token válido de 6 dígitos');
      return;
    }

    try {
      setIsDisabling(true);
      await makeAuthenticatedRequest(`${API_BASE}/api/auth/2fa/disable`, {
        method: 'POST',
        data: { token }
      });
      
      setIs2FAEnabled(false);
      setIsDisableDialogOpen(false);
      setToken('');
      toast.success('2FA desabilitado com sucesso');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao desabilitar 2FA');
    } finally {
      setIsDisabling(false);
    }
  };

  const regenerateBackupCodes = async () => {
    try {
      setIsRegenerating(true);
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/auth/2fa/backup-codes`, {
        method: 'POST'
      });
      
      setBackupCodes(response.data.backupCodes);
      setIsRegenerateDialogOpen(false);
      setShowBackupCodes(true);
      toast.success('Códigos de backup regenerados com sucesso');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao regenerar códigos de backup');
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Códigos de backup baixados');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações de segurança...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Autenticação de Dois Fatores</h1>
          <p className="text-muted-foreground">
            Adicione uma camada extra de segurança à sua conta
          </p>
        </div>
        <Badge variant={is2FAEnabled ? "default" : "secondary"} className="text-sm">
          {is2FAEnabled ? "2FA Ativo" : "2FA Inativo"}
        </Badge>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuração de Segurança
          </CardTitle>
          <CardDescription>
            A autenticação de dois fatores (2FA) adiciona uma camada extra de segurança à sua conta.
            Mesmo que alguém descubra sua senha, eles não conseguirão acessar sua conta sem o código 2FA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Status do 2FA</h3>
              <p className="text-sm text-muted-foreground">
                {is2FAEnabled 
                  ? "Sua conta está protegida com autenticação de dois fatores"
                  : "Sua conta não está protegida com autenticação de dois fatores"
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={is2FAEnabled} disabled />
              <span className="text-sm font-medium">
                {is2FAEnabled ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            {!is2FAEnabled ? (
              <Button onClick={startSetup} disabled={isSettingUp}>
                {isSettingUp && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Shield className="h-4 w-4 mr-2" />
                Configurar 2FA
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsDisableDialogOpen(true)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Desabilitar 2FA
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsRegenerateDialogOpen(true)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar Códigos de Backup
                </Button>
              </>
            )}
          </div>

          {/* Instructions */}
          {!is2FAEnabled && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Como funciona:</strong> Após configurar o 2FA, você precisará inserir um código de 6 dígitos 
                sempre que fizer login. Este código é gerado por um aplicativo autenticador como Google Authenticator, 
                Authy ou similar.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar Autenticação de Dois Fatores</DialogTitle>
            <DialogDescription>
              Siga os passos abaixo para configurar o 2FA em sua conta
            </DialogDescription>
          </DialogHeader>
          
          {setupData && (
            <div className="space-y-6">
              {/* Step 1: QR Code */}
              <div className="space-y-4">
                <h3 className="font-medium">Passo 1: Escaneie o QR Code</h3>
                <div className="flex justify-center">
                  <div className="border rounded-lg p-4">
                    <img 
                      src={setupData.qrCode} 
                      alt="QR Code para 2FA" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Abra seu aplicativo autenticador e escaneie este QR code
                </p>
              </div>

              {/* Step 2: Secret Key */}
              <div className="space-y-4">
                <h3 className="font-medium">Passo 2: Chave Secreta (Alternativa)</h3>
                <div className="flex items-center space-x-2">
                  <Input
                    value={showSecret ? setupData.secret : '••••••••••••••••••••••••••••••••'}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(setupData.secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Se não conseguir escanear o QR code, use esta chave secreta no seu aplicativo
                </p>
              </div>

              {/* Step 3: Verify */}
              <div className="space-y-4">
                <h3 className="font-medium">Passo 3: Verificar Configuração</h3>
                <div>
                  <Label htmlFor="token">Código de Verificação</Label>
                  <Input
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-lg font-mono"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSetupDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={enable2FA} disabled={isEnabling || token.length !== 6}>
              {isEnabling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Habilitar 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={isDisableDialogOpen} onOpenChange={setIsDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desabilitar 2FA</DialogTitle>
            <DialogDescription>
              Para desabilitar o 2FA, você precisa inserir um código de verificação válido.
              Esta ação removerá a proteção extra da sua conta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="disable-token">Código de Verificação</Label>
              <Input
                id="disable-token"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisableDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={disable2FA} 
              disabled={isDisabling || token.length !== 6}
            >
              {isDisabling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Desabilitar 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Backup Codes Dialog */}
      <Dialog open={isRegenerateDialogOpen} onOpenChange={setIsRegenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerar Códigos de Backup</DialogTitle>
            <DialogDescription>
              Os códigos de backup atuais serão invalidados e novos códigos serão gerados.
              Certifique-se de salvar os novos códigos em um local seguro.
            </DialogDescription>
          </DialogHeader>
          
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> Esta ação invalidará todos os códigos de backup anteriores.
              Você precisará usar os novos códigos caso perca acesso ao seu aplicativo autenticador.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegenerateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={regenerateBackupCodes} 
              disabled={isRegenerating}
            >
              {isRegenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Regenerar Códigos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Códigos de Backup</DialogTitle>
            <DialogDescription>
              Guarde estes códigos em um local seguro. Eles podem ser usados para acessar sua conta 
              caso você perca o acesso ao seu aplicativo autenticador.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Cada código só pode ser usado uma vez. 
                Após usar um código, ele será invalidado automaticamente.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg font-mono text-center bg-muted"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadBackupCodes}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Códigos
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Todos
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowBackupCodes(false)}>
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};