import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Shield, 
  Users, 
  Eye,
  Trash2
} from 'lucide-react';
import { useRoles, usePermissions, useRolePermissions } from '@/hooks/usePermissions';
import { useQueryClient } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
  // Exportação real de cargos e permissões para CSV
  const handleExportCSV = () => {
    if (!rolesWithPermissions) return;
    const rows: string[] = [];
    rows.push('Cargo,Descrição,Cor,Permissões');
    rolesWithPermissions.forEach(role => {
      const perms = (role.permissions || []).map(p => p.name).join('; ');
      rows.push(`"${role.name}","${role.description || ''}","${role.color}","${perms}"`);
    });
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'cargos_permissoes.csv');
  };
import { makeAuthenticatedRequest } from '@/lib/api';

interface RolePermissionsManagementProps {
  onClose?: () => void;
}

export const RolePermissionsManagement: React.FC<RolePermissionsManagementProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingChanges, setPendingChanges] = useState(0);
  const [optimisticPermissions, setOptimisticPermissions] = useState<Record<string, boolean>>({});
  const [switchLoading, setSwitchLoading] = useState<Record<string, boolean>>({});
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    is_active: true,
  });

    const { 
      roles, 
      rolesWithPermissions, 
      rolesLoading, 
      createRole, 
      deleteRole,
      updateRole
    } = useRoles();
  
  const { permissionsByModule, isLoading: permissionsLoading } = usePermissions();
  const rolePermissionsHook = useRolePermissions(selectedRoleId);
  const rolePermissions = rolePermissionsHook.rolePermissions;
  const rolePermissionsLoading = rolePermissionsHook.isLoading;
  const updatePermissionMutation = rolePermissionsHook.updateRolePermissionMutation;
  const updateMultiplePermissionsMutation = rolePermissionsHook.updateMultiplePermissionsMutation;

  // Cores predefinidas para os cargos
  const roleColors = [
    '#dc2626', '#ea580c', '#ca8a04', '#16a34a', 
    '#2563eb', '#7c3aed', '#c2410c', '#059669'
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newRoleForm.name.trim()) {
      errors.name = 'Nome do cargo é obrigatório';
    } else if (newRoleForm.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    } else if (roles?.some(role => role.name.toLowerCase() === newRoleForm.name.trim().toLowerCase())) {
      errors.name = 'Já existe um cargo com este nome';
    }
    if (newRoleForm.description && newRoleForm.description.length > 255) {
      errors.description = 'Descrição deve ter no máximo 255 caracteres';
    }
    if (!newRoleForm.color || !/^#[0-9A-Fa-f]{6}$/.test(newRoleForm.color)) {
      errors.color = 'Selecione uma cor válida para o cargo';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateRole = () => {
    if (!validateForm()) return;
    createRole(newRoleForm, {
      onError: (error: unknown) => {
        const err = error as { message?: string };
        if (err?.message?.includes('duplicate')) {
          setFormErrors({ name: 'Já existe um cargo com este nome (banco).' });
        } else {
          setFormErrors({ name: err?.message || 'Erro ao criar cargo.' });
        }
      },
      onSuccess: () => {
        setNewRoleForm({ name: '', description: '', color: '#6366f1', is_active: true });
        setFormErrors({});
        setIsCreatingRole(false);
      }
    });
  };

  const handlePermissionToggle = useCallback((permissionId: string, granted: boolean) => {
    setSwitchLoading(prev => ({ ...prev, [permissionId]: true }));
    setOptimisticPermissions(prev => ({ ...prev, [permissionId]: granted }));
    updatePermissionMutation.mutate(
      { permissionId, granted },
      {
        onSettled: () => {
          setSwitchLoading(prev => ({ ...prev, [permissionId]: false }));
          setOptimisticPermissions(prev => {
            const copy = { ...prev };
            delete copy[permissionId];
            return copy;
          });
        },
      }
    );
    setPendingChanges(prev => prev + 1);
  }, [updatePermissionMutation]);

  const handleBulkPermissionUpdate = useCallback((module: string, granted: boolean) => {
    const modulePermissions = permissionsByModule[module] || [];
    const updates = modulePermissions.map(permission => ({
      permissionId: permission.id,
      granted,
    }));
    setSwitchLoading(prev => {
      const copy = { ...prev };
      modulePermissions.forEach(p => { copy[p.id] = true; });
      return copy;
    });
    setOptimisticPermissions(prev => {
      const copy = { ...prev };
      modulePermissions.forEach(p => { copy[p.id] = granted; });
      return copy;
    });
    updateMultiplePermissionsMutation.mutate(
      updates,
      {
        onSettled: () => {
          setSwitchLoading(prev => {
            const copy = { ...prev };
            modulePermissions.forEach(p => { delete copy[p.id]; });
            return copy;
          });
          setOptimisticPermissions(prev => {
            const copy = { ...prev };
            modulePermissions.forEach(p => { delete copy[p.id]; });
            return copy;
          });
        },
      }
    );
    setPendingChanges(prev => prev + updates.length);
  }, [permissionsByModule, updateMultiplePermissionsMutation]);

  const isPermissionGranted = (permissionId: string): boolean => {
    if (permissionId in optimisticPermissions) {
      return optimisticPermissions[permissionId];
    }
    return rolePermissions?.some(rp => rp.permission_id === permissionId && rp.granted) || false;
  };

  const getModulePermissionCount = (module: string): { granted: number; total: number } => {
    const modulePermissions = permissionsByModule[module] || [];
    const granted = modulePermissions.filter(p => isPermissionGranted(p.id)).length;
    return { granted, total: modulePermissions.length };
  };

  const getBadgeVariant = (granted: number, total: number) => {
    if (granted === total) return 'default';
    if (granted > 0) return 'secondary';
    return 'outline';
  };

  const [editRole, setEditRole] = useState<{name: string; description: string; color: string} | null>(null);
  const [editRoleLoading, setEditRoleLoading] = useState(false);
  const selectedRole = useMemo(() => 
    roles?.find(r => r.id === selectedRoleId), 
    [roles, selectedRoleId]
  );

  // Preencher edição ao selecionar cargo
  React.useEffect(() => {
    if (selectedRole) {
      setEditRole({
        name: selectedRole.name,
        description: selectedRole.description || '',
        color: selectedRole.color || '#6366f1',
      });
    } else {
      setEditRole(null);
    }
  }, [selectedRole]);

  // Duplicar cargo
  // Duplicar cargo com permissões reais
  const handleDuplicateRole = async () => {
    if (!selectedRole) return;
    try {
      // 1. Cria o novo cargo no banco
      const newRole = await makeAuthenticatedRequest('/api/roles', 'POST', {
        name: selectedRole.name + ' (Cópia)',
        description: selectedRole.description || '',
        color: selectedRole.color || '#6366f1',
        is_active: true,
        is_system_role: false,
      });
      
      if (!newRole) {
        alert('Erro ao duplicar cargo: dados inválidos');
        return;
      }
      
      // 2. Busca permissões do cargo original
      const origPerms = await makeAuthenticatedRequest(`/api/roles/${selectedRole.id}/permissions`, 'GET');
      
      if (!origPerms || !Array.isArray(origPerms)) {
        alert('Erro ao buscar permissões do cargo original: dados inválidos');
        return;
      }
      
      // 3. Copia permissões para o novo cargo
      if (origPerms && origPerms.length > 0) {
        const newPerms = origPerms.map((p: { permission_id: string; granted: boolean }) => ({
          role_id: newRole.id,
          permission_id: p.permission_id,
          granted: p.granted,
        }));
        
        await makeAuthenticatedRequest(`/api/roles/${newRole.id}/permissions`, 'POST', newPerms);
      }
      // 4. Atualiza UI
      setSelectedRoleId(newRole.id);
      setIsCreatingRole(false);
      // Invalida queries para atualizar tela
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-permissions'] });
    } catch (err) {
      alert('Erro inesperado ao duplicar cargo.');
    }
  };

  const moduleEntries = useMemo(() => 
    Object.entries(permissionsByModule), 
    [permissionsByModule]
  );

  if (rolesLoading || permissionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciamento de Cargos e Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Gerenciamento de Cargos e Permissões</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV} title="Exportar cargos e permissões para CSV">
                Exportar CSV
              </Button>
              <Dialog open={isCreatingRole} onOpenChange={setIsCreatingRole}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Cargo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Cargo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Cargo *</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Vendedor, Analista..."
                        value={newRoleForm.name}
                        onChange={(e) => {
                          setNewRoleForm({ ...newRoleForm, name: e.target.value });
                          if (formErrors.name) {
                            setFormErrors({ ...formErrors, name: '' });
                          }
                        }}
                        className={formErrors.name ? 'border-red-500' : ''}
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        placeholder="Descreva as responsabilidades deste cargo..."
                        value={newRoleForm.description}
                        onChange={(e) => {
                          setNewRoleForm({ ...newRoleForm, description: e.target.value });
                          if (formErrors.description) {
                            setFormErrors({ ...formErrors, description: '' });
                          }
                        }}
                        className={formErrors.description ? 'border-red-500' : ''}
                        maxLength={255}
                      />
                      {formErrors.description && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        {newRoleForm.description.length}/255 caracteres
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="color">Cor do Cargo</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {roleColors.map(color => (
                          <Button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 p-0 ${
                              newRoleForm.color === color ? 'border-gray-800' : 'border-gray-300'
                            }`}
                            data-color={color}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewRoleForm({ ...newRoleForm, color })}
                            title={`Selecionar cor ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsCreatingRole(false);
                          setFormErrors({});
                          setNewRoleForm({ name: '', description: '', color: '#6366f1', is_active: true });
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreateRole}
                        disabled={!newRoleForm.name.trim()}
                      >
                        Criar Cargo
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Lista de Cargos */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-3">Cargos do Sistema</h3>
              <div className="space-y-2">
                {roles?.map(role => (
                  <button
                    key={role.id}
                    type="button"
                    className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRoleId === role.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setPendingChanges(0);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-3 h-3 rounded-full border border-gray-300`}
                        data-color={role.color}
                        style={{ backgroundColor: role.color }}
                        title={`Cor do cargo: ${role.color}`}
                        aria-label={`Cor do cargo: ${role.color}`}
                      />
                      <span className="font-medium text-sm">{role.name}</span>
                      {role.is_system_role && (
                        <Badge variant="secondary" className="text-xs">Sistema</Badge>
                      )}
                    </div>
                    {role.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {role.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Configuração de Permissões */}
            <div className="lg:col-span-3">
              {selectedRoleId ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border border-gray-300`}
                          data-color={editRole?.color || selectedRole?.color}
                          style={{ backgroundColor: editRole?.color || selectedRole?.color }}
                          title={`Cor do cargo: ${editRole?.color || selectedRole?.color}`}
                          aria-label={`Cor do cargo: ${editRole?.color || selectedRole?.color}`}
                        />
                        <input
                          className="font-semibold text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none px-1 w-40"
                          value={editRole?.name || ''}
                          onChange={e => setEditRole(r => r ? { ...r, name: e.target.value } : r)}
                          disabled={editRoleLoading || selectedRole?.is_system_role}
                          aria-label="Nome do cargo"
                          placeholder="Nome do cargo"
                          title="Nome do cargo"
                        />
                        {pendingChanges > 0 && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            {pendingChanges} alteração{pendingChanges > 1 ? 'ões' : ''} pendente{pendingChanges > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <textarea
                        className="text-xs text-gray-600 bg-transparent border-b border-dashed border-gray-200 focus:border-blue-400 outline-none px-1 w-full mt-1"
                        value={editRole?.description || ''}
                        onChange={e => setEditRole(r => r ? { ...r, description: e.target.value } : r)}
                        disabled={editRoleLoading || selectedRole?.is_system_role}
                        rows={2}
                        maxLength={255}
                        placeholder="Descrição do cargo"
                        aria-label="Descrição do cargo"
                        title="Descrição do cargo"
                      />
                      <div className="flex gap-2 mt-1">
                        {roleColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            className={`w-5 h-5 rounded-full border-2 p-0 ${editRole?.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                            data-color={color}
                            style={{ backgroundColor: color }}
                            onClick={() => setEditRole(r => r ? { ...r, color } : r)}
                            disabled={editRoleLoading || selectedRole?.is_system_role}
                            title={`Selecionar cor ${color}`}
                            aria-label={`Selecionar cor ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                    {!selectedRole?.is_system_role && (
                      <div className="flex flex-col gap-2 items-end">
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            disabled={editRoleLoading}
                            onClick={() => {
                              if (!editRole) return;
                              setEditRoleLoading(true);
                              updateRole(selectedRoleId, {
                                name: editRole.name,
                                description: editRole.description,
                                color: editRole.color,
                              });
                              setTimeout(() => setEditRoleLoading(false), 1200); // tempo para feedback visual
                            }}
                          >
                            {editRoleLoading ? 'Salvando...' : 'Salvar Cargo'}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleDuplicateRole}
                            title="Duplicar cargo"
                          >
                            Duplicar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja remover o cargo "${selectedRole?.name}"? Esta ação não pode ser desfeita.`)) {
                                deleteRole(selectedRoleId);
                                setSelectedRoleId('');
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <ScrollArea className="h-96">
                    <Accordion type="multiple" className="space-y-2">
                      {moduleEntries.map(([module, permissions]) => {
                        const { granted, total } = getModulePermissionCount(module);
                        const moduleDisplayName = module.charAt(0).toUpperCase() + module.slice(1).replace('_', ' ');
                        
                        return (
                          <AccordionItem key={module} value={module} className="border rounded-lg">
                            <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{moduleDisplayName}</span>
                                  <Badge variant={getBadgeVariant(granted, total)}>
                                    {granted}/{total}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleBulkPermissionUpdate(module, true);
                                    }}
                                    className="text-xs px-2 py-1"
                                  >
                                    Todas
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleBulkPermissionUpdate(module, false);
                                    }}
                                    className="text-xs px-2 py-1"
                                  >
                                    Nenhuma
                                  </Button>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Array.isArray(permissions) && permissions.map(permission => (
                                  <div
                                    key={permission.id}
                                    className="flex items-center justify-between p-2 border rounded"
                                  >
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">
                                        {permission.name.split('.')[1]?.charAt(0).toUpperCase() + 
                                         permission.name.split('.')[1]?.slice(1)}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {permission.description}
                                      </div>
                                    </div>
                                    <Switch
                                      checked={isPermissionGranted(permission.id)}
                                      onCheckedChange={(checked) => 
                                        handlePermissionToggle(permission.id, checked)
                                      }
                                      disabled={rolePermissionsLoading || !!switchLoading[permission.id]}
                                    />
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </ScrollArea>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Selecione um cargo para configurar suas permissões</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Cargos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Resumo dos Cargos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolesWithPermissions?.map(role => (
              <Card key={role.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: role.color }}
                      aria-label={`Cor do cargo: ${role.color}`}
                    />
                    <span className="font-medium">{role.name}</span>
                    {role.is_system_role && (
                      <Badge variant="secondary" className="text-xs">Sistema</Badge>
                    )}
                  </div>
                  {role.description && (
                    <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                  )}
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">
                      {role.permissions?.length || 0} permissões ativas
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(permissionsByModule).slice(0, 5).map(([module]) => {
                        const hasModulePermissions = role.permissions?.some(p => p.module === module);
                        return (
                          <Badge
                            key={module}
                            variant={hasModulePermissions ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {module}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
