
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ApiKeysManager = () => {
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState("read");

  const apiKeys = [
    {
      id: 'key_1',
      name: 'Production API Key',
      key: 'sk_live_abcd1234567890',
      permissions: 'full',
      created: '2024-01-15',
      lastUsed: '2024-01-20 14:30',
      status: 'active',
      usage: 1250
    },
    {
      id: 'key_2',
      name: 'Development Key',
      key: 'sk_test_efgh9876543210',
      permissions: 'read',
      created: '2024-01-10',
      lastUsed: '2024-01-19 09:15',
      status: 'active',
      usage: 45
    },
    {
      id: 'key_3',
      name: 'Analytics Bot',
      key: 'sk_live_ijkl5432109876',
      permissions: 'read',
      created: '2024-01-05',
      lastUsed: 'Nunca',
      status: 'inactive',
      usage: 0
    }
  ];

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case 'full':
        return <Badge variant="destructive">Full Access</Badge>;
      case 'write':
        return <Badge className="bg-orange-100 text-orange-800">Write</Badge>;
      case 'read':
        return <Badge variant="secondary">Read Only</Badge>;
      default:
        return <Badge variant="outline">{permission}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-100 text-green-800">Ativa</Badge>
      : <Badge variant="secondary">Inativa</Badge>;
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Chave copiada!",
      description: "A chave da API foi copiada para a área de transferência.",
    });
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome para a chave.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Chave criada com sucesso!",
      description: `Nova chave "${newKeyName}" foi criada.`,
    });

    setNewKeyName("");
    setNewKeyPermissions("read");
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const maskKey = (key: string) => {
    const prefix = key.substring(0, 8);
    const suffix = key.substring(key.length - 4);
    return `${prefix}${'•'.repeat(12)}${suffix}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Gerenciamento de API Keys
            </CardTitle>
            <CardDescription>
              Crie e gerencie suas chaves de API com diferentes níveis de permissão
            </CardDescription>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Chave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova API Key</DialogTitle>
                <DialogDescription>
                  Configure o nome e permissões para a nova chave da API
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Nome da Chave</Label>
                  <Input
                    id="key-name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Ex: Mobile App Key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="permissions">Permissões</Label>
                  <Select value={newKeyPermissions} onValueChange={setNewKeyPermissions}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Somente Leitura</SelectItem>
                      <SelectItem value="write">Leitura e Escrita</SelectItem>
                      <SelectItem value="full">Acesso Completo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleCreateKey} className="w-full">
                  Criar Chave
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Chave</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uso (30d)</TableHead>
                <TableHead>Último Uso</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm">
                        {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {showKeys[apiKey.id] ? 
                          <EyeOff className="w-3 h-3" /> : 
                          <Eye className="w-3 h-3" />
                        }
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{getPermissionBadge(apiKey.permissions)}</TableCell>
                  <TableCell>{getStatusBadge(apiKey.status)}</TableCell>
                  <TableCell>{apiKey.usage.toLocaleString()} requests</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {apiKey.lastUsed}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyKey(apiKey.key)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Estatísticas de Uso */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chaves Ativas</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <Key className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requests (30d)</p>
                <p className="text-2xl font-bold">1,295</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Key className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rate Limit</p>
                <p className="text-2xl font-bold">1000/h</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Key className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erros (24h)</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Key className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
