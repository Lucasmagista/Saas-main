import { useState, useEffect } from 'react';
import { useAuth, useAuthRequest } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function RefreshTokenDemo() {
  const { user, logout, logoutAllDevices, isAuthenticated } = useAuth();
  const { makeRequest } = useAuthRequest();
  const { toast } = useToast();
  const [tokenStats, setTokenStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Busca estatísticas de tokens (se for admin)
  useEffect(() => {
    const fetchTokenStats = async () => {
      if (user?.role === 'admin') {
        try {
          const stats = await makeRequest('/auth/token-stats');
          setTokenStats(stats.data);
        } catch (error) {
          console.warn('Erro ao buscar estatísticas:', error.message);
        }
      }
    };

    fetchTokenStats();
  }, [user, makeRequest]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setLoading(true);
    try {
      await logoutAllDevices();
    } catch (error) {
      console.error('Erro no logout geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const testApiCall = async () => {
    try {
      const response = await makeRequest('/auth/me');
      toast({
        title: 'API Funcionando!',
        description: `Dados: ${JSON.stringify(response.data, null, 2)}`,
      });
    } catch (error) {
      toast({
        title: 'Erro na API',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const testProtectedRoute = async () => {
    try {
      // Simula uma requisição para endpoint protegido
      const response = await makeRequest('/dashboard/stats');
      toast({
        title: 'Rota Protegida OK!',
        description: 'Acesso autorizado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro na Rota Protegida',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecionando para login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔐 Sistema de Refresh Tokens
          </h1>
          <p className="text-lg text-gray-600">
            Demonstração do sistema de autenticação avançado
          </p>
        </div>

        {/* Informações do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>👤 Informações do Usuário</CardTitle>
            <CardDescription>
              Dados do usuário autenticado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                  {user?.id || 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded">
                  {user?.email || 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                  {user?.role || 'user'}
                </Badge>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  ✅ Autenticado
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Tokens */}
        <Card>
          <CardHeader>
            <CardTitle>🔑 Sistema de Autenticação</CardTitle>
            <CardDescription>
              Como funciona o sistema de refresh tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">🎫 Access Token</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Duração:</strong> 1 dia</li>
                  <li>• <strong>Uso:</strong> Todas as requisições autenticadas</li>
                  <li>• <strong>Renovação:</strong> Automática quando expira</li>
                  <li>• <strong>Segurança:</strong> Curta duração para menor risco</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">🔄 Refresh Token</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• <strong>Duração:</strong> 30 dias</li>
                  <li>• <strong>Uso:</strong> Renovar access tokens</li>
                  <li>• <strong>Expiração:</strong> Logout automático</li>
                  <li>• <strong>Revogação:</strong> Logout individual/geral</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testes do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Testes do Sistema</CardTitle>
            <CardDescription>
              Teste as funcionalidades do sistema de autenticação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={testApiCall} variant="outline">
                🔍 Testar API Autenticada
              </Button>
              
              <Button onClick={testProtectedRoute} variant="outline">
                🛡️ Testar Rota Protegida
              </Button>
              
              <Button 
                onClick={handleLogout} 
                variant="destructive"
                disabled={loading}
              >
                🚪 Logout (Este Dispositivo)
              </Button>
              
              <Button 
                onClick={handleLogoutAllDevices} 
                variant="destructive"
                disabled={loading}
              >
                🚪🚪 Logout (Todos os Dispositivos)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas para Admin */}
        {user?.role === 'admin' && tokenStats && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Estatísticas do Sistema (Admin)</CardTitle>
              <CardDescription>
                Monitoramento do sistema de tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900">Refresh Tokens Ativos</h3>
                  <p className="text-2xl font-bold text-yellow-800">
                    {tokenStats.activeRefreshTokens}
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900">Usuários Conectados</h3>
                  <p className="text-2xl font-bold text-purple-800">
                    {Object.keys(tokenStats.tokensPerUser).length}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Tokens por Usuário</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(tokenStats.tokensPerUser, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Como Usar */}
        <Card>
          <CardHeader>
            <CardTitle>📖 Como Usar o Sistema</CardTitle>
            <CardDescription>
              Exemplos de código para desenvolvedores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Usar Hook de Autenticação</h4>
                <div className="bg-gray-900 p-4 rounded-lg text-green-400 text-sm font-mono">
                  <pre>{`import { useAuth } from '@/hooks/useAuth';

const { user, login, logout, isAuthenticated } = useAuth();`}</pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2. Fazer Requisições Autenticadas</h4>
                <div className="bg-gray-900 p-4 rounded-lg text-green-400 text-sm font-mono">
                  <pre>{`import { useAuthRequest } from '@/hooks/useAuth';

const { makeRequest } = useAuthRequest();
const data = await makeRequest('/api/endpoint');`}</pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">3. Proteger Rotas</h4>
                <div className="bg-gray-900 p-4 rounded-lg text-green-400 text-sm font-mono">
                  <pre>{`import { ProtectedRoute } from '@/hooks/useAuth';

<ProtectedRoute>
  <MinhaPaginaProtegida />
</ProtectedRoute>`}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recursos */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Recursos Implementados</CardTitle>
            <CardDescription>
              Tudo que o sistema oferece
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🔐</div>
                <h3 className="font-semibold">Autenticação JWT</h3>
                <p className="text-sm text-gray-600">Sistema seguro com refresh tokens</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold">Renovação Automática</h3>
                <p className="text-sm text-gray-600">Tokens renovados automaticamente</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">📱</div>
                <h3 className="font-semibold">Multi-Device</h3>
                <p className="text-sm text-gray-600">Suporte a múltiplos dispositivos</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🛡️</div>
                <h3 className="font-semibold">Rotas Protegidas</h3>
                <p className="text-sm text-gray-600">Proteção automática de rotas</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🔄</div>
                <h3 className="font-semibold">Interceptors HTTP</h3>
                <p className="text-sm text-gray-600">Renovação transparente</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold">Monitoramento</h3>
                <p className="text-sm text-gray-600">Estatísticas e logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
