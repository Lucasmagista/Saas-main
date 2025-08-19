import { useState, useEffect } from 'react';
import { useAuth, useAuthRequest } from '../hooks/useAuth';

export default function Dashboard() {
  const { user, logout, logoutAllDevices } = useAuth();
  const { makeRequest } = useAuthRequest();
  const [tokenStats, setTokenStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Busca estatísticas de tokens (só se for admin)
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
    }
  };

  const handleLogoutAllDevices = async () => {
    if (confirm('Tem certeza que deseja sair de todos os dispositivos?')) {
      setLoading(true);
      try {
        await logoutAllDevices();
      } catch (error) {
        console.error('Erro no logout geral:', error);
      }
    }
  };

  const testApiCall = async () => {
    try {
      const response = await makeRequest('/auth/me');
      alert('API funcionando! Dados: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      alert('Erro na API: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bem-vindo ao SaasPro! 🚀
              </h1>
              <p className="text-gray-600">
                Dashboard principal da aplicação
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                Sair
              </button>
              
              <button
                onClick={handleLogoutAllDevices}
                disabled={loading}
                className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                Sair de Todos
              </button>
            </div>
          </div>
        </div>

        {/* Informações do Usuário */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações do Usuário
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{user?.id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user?.role || 'user'}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Criado em</label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Sistema de Tokens */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sistema de Autenticação
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Access Token</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Duração: 1 dia</li>
                <li>• Renovação automática</li>
                <li>• Usado em todas as requisições</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Refresh Token</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Duração: 30 dias</li>
                <li>• Renova access tokens</li>
                <li>• Logout quando expira</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={testApiCall}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Testar API Autenticada
            </button>
          </div>
        </div>

        {/* Estatísticas (só para admin) */}
        {user?.role === 'admin' && tokenStats && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Estatísticas do Sistema (Admin)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-900">Refresh Tokens Ativos</h3>
                <p className="text-2xl font-bold text-yellow-800">
                  {tokenStats.activeRefreshTokens}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">Usuários Conectados</h3>
                <p className="text-2xl font-bold text-purple-800">
                  {Object.keys(tokenStats.tokensPerUser).length}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Tokens por Usuário</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <pre className="text-xs text-gray-700">
                  {JSON.stringify(tokenStats.tokensPerUser, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Recursos Disponíveis */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recursos do Sistema
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">🔐</div>
              <h3 className="font-medium">Autenticação JWT</h3>
              <p className="text-sm text-gray-600">Sistema seguro com refresh tokens</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-medium">Renovação Automática</h3>
              <p className="text-sm text-gray-600">Tokens renovados automaticamente</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-medium">Multi-Device</h3>
              <p className="text-sm text-gray-600">Suporte a múltiplos dispositivos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}