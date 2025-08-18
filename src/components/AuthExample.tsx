import { useState } from 'react';
import { useAuth, useAuthRequest } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function AuthExample() {
  const { user, login, logout, isAuthenticated, loading } = useAuth();
  const { makeRequest } = useAuthRequest();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('teste@exemplo.com');
  const [password, setPassword] = useState('senha123');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: 'Sucesso!',
        description: 'Login realizado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro no login',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const testApiCall = async () => {
    try {
      const response = await makeRequest('/auth/me');
      toast({
        title: 'API Call Sucesso!',
        description: `Dados: ${JSON.stringify(response.data)}`,
      });
    } catch (error) {
      toast({
        title: 'Erro na API',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Login - Sistema Refresh Tokens</CardTitle>
          <CardDescription>
            Demonstração do sistema de autenticação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loginLoading}
            >
              {loginLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>💡 Dica:</strong> Use qualquer email/senha para testar.
              O sistema irá gerar tokens de demonstração.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>✅ Usuário Autenticado</CardTitle>
          <CardDescription>
            Você está logado no sistema de refresh tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>ID:</strong> {user?.id}</p>
            <p><strong>Role:</strong> {user?.role || 'user'}</p>
            
            <div className="flex space-x-2">
              <Button onClick={testApiCall} variant="outline">
                🧪 Testar API
              </Button>
              
              <Button onClick={logout} variant="destructive">
                🚪 Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔧 Como Implementar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="bg-gray-100 p-3 rounded font-mono">
              {`// 1. Importar hooks
import { useAuth, useAuthRequest } from '@/hooks/useAuth';

// 2. Usar no componente
const { user, login, logout, isAuthenticated } = useAuth();
const { makeRequest } = useAuthRequest();

// 3. Fazer requisições autenticadas
const data = await makeRequest('/api/endpoint');`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
