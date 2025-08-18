import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Shield, 
  Ban, 
  CheckCircle, 
  Search,
  UserPlus,
  Edit
} from 'lucide-react';
import { UserData } from '@/hooks/useAdminDashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface UserManagementPanelProps {
  users: UserData[] | undefined;
  loading: boolean;
  onUpdateUser: (userId: string, updates: Partial<UserData>) => void;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
}

export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({
  users,
  loading,
  onUpdateUser,
  onBlockUser,
  onUnblockUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal de edição/criação
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editUser, setEditUser] = useState<Partial<UserData> | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const openEditModal = (user: UserData) => {
    setEditUser({ ...user });
    setIsNewUser(false);
    setEditModalOpen(true);
  };
  const openCreateModal = () => {
    setEditUser({
      email: '',
      full_name: '',
      position: 'user',
      is_active: true,
      role: 'user',
      permissions: [],
    });
    setIsNewUser(true);
    setEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditUser(null);
    setIsNewUser(false);
  };

  const handleEditChange = <K extends keyof UserData>(field: K, value: UserData[K]) => {
    setEditUser((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSaveEdit = () => {
    if (!editUser) return;
    setEditLoading(true);
    try {
      if (isNewUser) {
        // Aqui você pode chamar uma função de criação real se desejar
        // Exemplo: onCreateUser(editUser)
        closeEditModal();
      } else if (editUser.id) {
        onUpdateUser(editUser.id, {
          email: editUser.email,
          full_name: editUser.full_name,
          position: editUser.position,
          is_active: editUser.is_active,
        });
        closeEditModal();
      }
    } finally {
      setEditLoading(false);
    }
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Nunca';
    return new Date(lastLogin).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciamento de Usuários
          </CardTitle>
          <Button size="sm" className="flex items-center gap-2" onClick={openCreateModal}>
            <UserPlus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por email ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{users?.length || 0}</div>
            <div className="text-sm text-blue-600">Total de Usuários</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {users?.filter(u => u.is_active).length || 0}
            </div>
            <div className="text-sm text-green-600">Usuários Ativos</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {users?.filter(u => u.role === 'admin').length || 0}
            </div>
            <div className="text-sm text-red-600">Administradores</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {users?.filter(u => u.last_login && 
                new Date(u.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length || 0}
            </div>
            <div className="text-sm text-purple-600">Ativos esta semana</div>
          </div>
        </div>

        {/* Tabela de usuários */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'Sem nome'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.position && (
                          <div className="text-xs text-gray-400">{user.position}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.is_active ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">Ativo</span>
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 text-red-500" />
                            <span className="text-red-600">Inativo</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatLastLogin(user.last_login)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
      {/* Modal de edição/criação de usuário */}
      <Dialog open={editModalOpen} onOpenChange={closeEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNewUser ? 'Criar Novo Usuário' : 'Editar Usuário'}</DialogTitle>
            <DialogDescription>
              {isNewUser ? 'Preencha os dados para criar um novo usuário.' : 'Edite as informações do usuário.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser?.email || ''}
                onChange={e => handleEditChange('email', e.target.value)}
                disabled={editLoading || !isNewUser}
                placeholder="usuario@exemplo.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-fullname">Nome Completo</Label>
              <Input
                id="edit-fullname"
                value={editUser?.full_name || ''}
                onChange={e => handleEditChange('full_name', e.target.value)}
                disabled={editLoading}
                placeholder="Nome do usuário"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Cargo</Label>
              <Select
                value={editUser?.position || 'user'}
                onValueChange={val => handleEditChange('position', val)}
                disabled={editLoading}
              >
                <SelectTrigger id="edit-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editUser?.is_active ? 'active' : 'inactive'}
                onValueChange={val => handleEditChange('is_active', val === 'active')}
                disabled={editLoading}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal} disabled={editLoading}>
              Cancelar
            </Button>
            {(() => {
              let label = 'Salvar Alterações';
              if (editLoading) label = 'Salvando...';
              else if (isNewUser) label = 'Criar Usuário';
              return (
                <Button onClick={handleSaveEdit} disabled={editLoading || !editUser?.email || !editUser?.full_name}>
                  {label}
                </Button>
              );
            })()}
          </DialogFooter>
        </DialogContent>
      </Dialog>
                        {user.is_active ? (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => onBlockUser(user.id)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => onUnblockUser(user.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Mostrando {filteredUsers.length} de {users?.length || 0} usuários
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled>
                Próximo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
