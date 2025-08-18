import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Types do banco de dados
type Permission = Database['public']['Tables']['permissions']['Row'];
type Role = Database['public']['Tables']['roles']['Row'];
type RolePermission = Database['public']['Tables']['role_permissions']['Row'];
type SystemModule = Database['public']['Enums']['system_module'];
type PermissionType = Database['public']['Enums']['permission_type'];

// Types personalizados
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface UserPermission {
  permission_name: string;
  module: SystemModule;
  permission_type: PermissionType;
}

// Hook para gerenciar permissões
export const usePermissions = () => {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async (): Promise<Permission[]> => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('is_active', true)
        .order('module', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Agrupar permissões por módulo
  const permissionsByModule = permissions?.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<SystemModule, Permission[]>) || {};

  return {
    permissions,
    permissionsByModule,
    isLoading,
  };
};

// Hook para gerenciar cargos
export const useRoles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<Role[]> => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Buscar cargo com suas permissões
  const { data: rolesWithPermissions, isLoading: rolePermissionsLoading } = useQuery({
    queryKey: ['roles-with-permissions'],
    queryFn: async (): Promise<RoleWithPermissions[]> => {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions!inner (
            granted,
            permissions (*)
          )
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      return data.map(role => ({
        ...role,
        permissions: (role.role_permissions as Array<{ granted: boolean; permissions: Permission }>)
          ?.filter(rp => rp.granted)
          ?.map(rp => rp.permissions)
          ?.filter(Boolean) || [],
      }));
    },
  });

  // Criar novo cargo
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: Pick<Role, 'name' | 'description' | 'color'>) => {
      const { data, error } = await supabase
        .from('roles')
        .insert({
          ...roleData,
          is_system_role: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-permissions'] });
      toast({ title: 'Cargo criado com sucesso!' });
    },
  });

  // Atualizar cargo
  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, updates }: { roleId: string; updates: Partial<Role> }) => {
      const { error } = await supabase
        .from('roles')
        .update(updates)
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-permissions'] });
      toast({ title: 'Cargo atualizado com sucesso!' });
    },
  });

  // Deletar cargo (apenas cargos não-sistema)
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('roles')
        .update({ is_active: false })
        .eq('id', roleId)
        .eq('is_system_role', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-permissions'] });
      toast({ title: 'Cargo removido com sucesso!' });
    },
  });

  return {
    roles,
    rolesWithPermissions,
    rolesLoading,
    rolePermissionsLoading,
    createRole: createRoleMutation.mutate,
    updateRole: (roleId: string, updates: Partial<Role>) => updateRoleMutation.mutate({ roleId, updates }),
    deleteRole: deleteRoleMutation.mutate,
  };
};

// Hook para gerenciar permissões de um cargo específico
export const useRolePermissions = (roleId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rolePermissions, isLoading } = useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return null;

      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          *,
          permissions (*)
        `)
        .eq('role_id', roleId);

      if (error) throw error;
      return data;
    },
    enabled: !!roleId,
  });

  // Atualizar permissão de um cargo
  const updateRolePermissionMutation = useMutation({
    mutationFn: async ({ permissionId, granted }: { permissionId: string; granted: boolean }) => {
      const { error } = await supabase
        .from('role_permissions')
        .upsert({
          role_id: roleId,
          permission_id: permissionId,
          granted,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions', roleId] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-permissions'] });
      toast({ title: 'Permissões atualizadas!' });
    },
  });

  // Atualizar múltiplas permissões de uma vez
  const updateMultiplePermissionsMutation = useMutation({
    mutationFn: async (updates: { permissionId: string; granted: boolean }[]) => {
      const rolePermissions = updates.map(update => ({
        role_id: roleId,
        permission_id: update.permissionId,
        granted: update.granted,
      }));

      const { error } = await supabase
        .from('role_permissions')
        .upsert(rolePermissions);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions', roleId] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-permissions'] });
      toast({ title: 'Permissões atualizadas em lote!' });
    },
  });

  return {
    rolePermissions,
    isLoading,
    updateRolePermissionMutation,
    updateMultiplePermissionsMutation,
  };
};

// Hook para verificar permissões do usuário atual
export const useUserPermissions = () => {
  const { data: userPermissions, isLoading } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async (): Promise<UserPermission[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .rpc('get_user_permissions', { _user_id: user.id });

      if (error) throw error;
      return data || [];
    },
  });

  // Função para verificar se o usuário tem uma permissão específica
  const hasPermission = (permissionName: string): boolean => {
    return userPermissions?.some(p => p.permission_name === permissionName) || false;
  };

  // Função para verificar se o usuário tem acesso a um módulo
  const hasModuleAccess = (module: SystemModule): boolean => {
    return userPermissions?.some(p => p.module === module) || false;
  };

  // Função para verificar se o usuário pode executar uma ação em um módulo
  const canPerformAction = (module: SystemModule, action: PermissionType): boolean => {
    return userPermissions?.some(p => 
      p.module === module && p.permission_type === action
    ) || false;
  };

  return {
    userPermissions,
    isLoading,
    hasPermission,
    hasModuleAccess,
    canPerformAction,
  };
};

// Hook para atribuir cargo a usuários
export const useUserRoleAssignment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      // Primeiro remove qualquer cargo existente
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Depois atribui o novo cargo
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          custom_role_id: roleId,
          role: 'user', // Manter compatibilidade com enum existente
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast({ title: 'Cargo atribuído com sucesso!' });
    },
  });

  return {
    assignRole: assignRoleMutation.mutate,
    isAssigning: assignRoleMutation.isPending,
  };
};
