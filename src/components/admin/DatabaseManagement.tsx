import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Database as DatabaseIcon, RefreshCw, Download, Upload, Activity, Zap, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Database } from "@/integrations/supabase/types";

// Tipo para tabelas disponíveis
type TableName = keyof Database['public']['Tables'];

interface DatabaseStats {
  totalUsers: number;
  totalLeads: number;
  activeBots: number;
  databaseSize: string;
  lastBackup: string;
}

interface QueryResult {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  rowCount: number;
}

const DatabaseManagement = () => {
  const { toast } = useToast();
  const [sqlQuery, setSqlQuery] = useState(`-- Digite sua consulta SQL aqui
SELECT 
  id,
  email,
  full_name,
  created_at,
  is_active
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;`);
  
  const [selectedTable, setSelectedTable] = useState<TableName | null>(null);
  const [limit, setLimit] = useState("25");
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [dbStats, setDbStats] = useState<DatabaseStats>({
    totalUsers: 0,
    totalLeads: 0,
    activeBots: 0,
    databaseSize: "0 MB",
    lastBackup: "Nunca"
  });

  const tables = [
    { name: "profiles", description: "Perfis de usuários" },
    { name: "organizations", description: "Organizações" },
    { name: "user_roles", description: "Roles dos usuários" },
    { name: "permissions", description: "Permissões do sistema" },
    { name: "roles", description: "Cargos customizáveis" },
    { name: "role_permissions", description: "Permissões por cargo" },
    { name: "leads", description: "Leads do CRM" },
    { name: "opportunities", description: "Oportunidades de venda" },
    { name: "bots", description: "Bots do WhatsApp" },
    { name: "multisessions", description: "Sessões múltiplas" },
    { name: "audit_logs", description: "Logs de auditoria" },
    { name: "conversations", description: "Conversas" },
    { name: "messages", description: "Mensagens" }
  ];

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      // Buscar estatísticas do banco
      const [usersResult, leadsResult, botsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('bots').select('id').eq('is_active', true)
      ]);

      setDbStats({
        totalUsers: usersResult.count || 0,
        totalLeads: leadsResult.count || 0,
        activeBots: botsResult.data?.length || 0,
        databaseSize: "2.4 GB", // Placeholder - seria necessário uma função específica
        lastBackup: "Há 2 horas" // Placeholder
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma consulta SQL válida",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    
    try {
      // Para consultas SELECT, usar o RPC que permita execução segura
      // Este é um placeholder - seria necessário implementar uma função RPC no Supabase
      toast({
        title: "Aviso",
        description: "Funcionalidade de execução de SQL personalizada em desenvolvimento. Por segurança, use as consultas pré-definidas por enquanto.",
        variant: "default"
      });
      
      // Simular resultado para demonstração
      setQueryResult({
        columns: ["id", "email", "full_name", "created_at"],
        rows: [
          ["1", "user@example.com", "João Silva", "2024-01-15"],
          ["2", "admin@example.com", "Admin User", "2024-01-10"]
        ],
        rowCount: 2
      });
      
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const loadTableData = async () => {
    if (!selectedTable) {
      toast({
        title: "Erro",
        description: "Selecione uma tabela primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    
    try {
      const { data, error } = await supabase
        .from(selectedTable)
        .select('*')
        .limit(parseInt(limit));

      if (error) throw error;

      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        const rows = data.map(row => columns.map(col => row[col]));
        
        setQueryResult({
          columns,
          rows,
          rowCount: data.length
        });
      } else {
        setQueryResult({
          columns: [],
          rows: [],
          rowCount: 0
        });
      }

      toast({
        title: "Sucesso",
        description: `Carregados ${data?.length || 0} registros da tabela ${selectedTable}`,
      });

    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const clearQuery = () => {
    setSqlQuery("");
    setQueryResult(null);
  };

  const handleTableChange = (value: string) => {
    setSelectedTable(value as TableName);
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DatabaseIcon className="h-5 w-5" />
          Análise e Gerenciamento do Banco de Dados
        </h2>
        <p className="text-sm text-gray-600">
          Ferramentas avançadas para consulta, análise e administração direta do banco de dados
        </p>
      </div>

      <Tabs defaultValue="query" className="space-y-6">
        <TabsList>
          <TabsTrigger value="query">Console SQL</TabsTrigger>
          <TabsTrigger value="tables">Navegador</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
        </TabsList>

        {/* Console de Consultas SQL */}
        <TabsContent value="query" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5" />
                Console de Consultas SQL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sql-query">Consulta SQL</Label>
                  <Textarea
                    id="sql-query"
                    className="h-40 font-mono text-sm"
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="Digite sua consulta SQL aqui..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={executeQuery}
                    disabled={isExecuting}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isExecuting ? 'animate-spin' : ''}`} />
                    {isExecuting ? 'Executando...' : 'Executar Consulta'}
                  </Button>
                  <Button variant="outline" onClick={clearQuery}>
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultado da Consulta */}
          {queryResult && (
            <Card>
              <CardHeader>
                <CardTitle>Resultado da Consulta</CardTitle>
                <p className="text-sm text-gray-600">
                  {queryResult.rowCount} registro(s) encontrado(s)
                </p>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {queryResult.columns.map((col) => (
                          <TableHead key={`query-col-${col}`}>{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queryResult.rows.map((row, rowIndex) => (
                        <TableRow key={`query-row-${rowIndex}-${row[0]}`}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={`query-cell-${rowIndex}-${cellIndex}`} className="font-mono text-xs">
                              {cell !== null ? String(cell) : <span className="text-gray-400">NULL</span>}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Navegador de Tabelas */}
        <TabsContent value="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Navegador de Tabelas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="table-select">Selecionar Tabela</Label>
                    <Select value={selectedTable || ""} onValueChange={handleTableChange}>
                      <SelectTrigger id="table-select">
                        <SelectValue placeholder="Escolha uma tabela..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.map((table) => (
                          <SelectItem key={table.name} value={table.name}>
                            <div>
                              <div className="font-medium">{table.name}</div>
                              <div className="text-sm text-gray-500">{table.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="limit-select">Limite</Label>
                    <Select value={limit} onValueChange={setLimit}>
                      <SelectTrigger id="limit-select" className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={loadTableData}
                    disabled={isExecuting || !selectedTable}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Carregar Dados
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultado da Tabela */}
          {queryResult && (
            <Card>
              <CardHeader>
                <CardTitle>Dados da Tabela: {selectedTable}</CardTitle>
                <p className="text-sm text-gray-600">
                  {queryResult.rowCount} registro(s) carregado(s)
                </p>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {queryResult.columns.map((col) => (
                          <TableHead key={`table-col-${col}`}>{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queryResult.rows.map((row, rowIndex) => (
                        <TableRow key={`table-row-${rowIndex}-${row[0]}`}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={`table-cell-${rowIndex}-${cellIndex}`} className="font-mono text-xs">
                              {cell !== null ? String(cell) : <span className="text-gray-400">NULL</span>}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Estatísticas do Banco */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                    <p className="text-2xl font-bold">{dbStats.totalUsers.toLocaleString()}</p>
                  </div>
                  <Badge variant="secondary">{dbStats.totalUsers}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                    <p className="text-2xl font-bold">{dbStats.totalLeads.toLocaleString()}</p>
                  </div>
                  <Badge variant="secondary">{dbStats.totalLeads}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bots Ativos</p>
                    <p className="text-2xl font-bold">{dbStats.activeBots}</p>
                  </div>
                  <Badge variant="secondary">{dbStats.activeBots}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tamanho do DB</p>
                    <p className="text-2xl font-bold">{dbStats.databaseSize}</p>
                  </div>
                  <Badge variant="secondary">{dbStats.databaseSize}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Estrutura do Banco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <div key={table.name} className="border rounded-lg p-3">
                    <h4 className="font-medium text-gray-900">{table.name}</h4>
                    <p className="text-sm text-gray-600">{table.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manutenção */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Backup & Restore
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Criar Backup
                </Button>
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Restaurar Backup
                </Button>
                <Button className="w-full" variant="outline">
                  Histórico de Backups
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Otimização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  Analisar Tabelas
                </Button>
                <Button className="w-full" variant="outline">
                  Otimizar Índices
                </Button>
                <Button className="w-full" variant="outline">
                  Limpar Cache
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Monitoramento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  Conexões Ativas
                </Button>
                <Button className="w-full" variant="outline">
                  Queries Lentas
                </Button>
                <Button className="w-full" variant="outline">
                  Performance Metrics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Aviso de Segurança */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>⚠️ Acesso Administrativo ao Banco de Dados:</strong> Esta seção fornece acesso direto ao banco de dados. 
          Use com extrema cautela. Operações mal executadas podem causar perda de dados ou instabilidade do sistema. 
          Sempre faça backup antes de executar comandos de modificação.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DatabaseManagement;
