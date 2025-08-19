import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeAuthenticatedRequest } from '../utils/api';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: any;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  conditions?: any;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

// Hooks para Permissões
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/permissions`);
      return response.data;
    }
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (permissionData: Partial<Permission>) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/permissions`, {
        method: 'POST',
        data: permissionData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permissão criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar permissão');
    }
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...permissionData }: Partial<Permission> & { id: string }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/permissions/${id}`, {
        method: 'PUT',
        data: permissionData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permissão atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar permissão');
    }
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await makeAuthenticatedRequest(`${API_BASE}/api/permissions/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permissão removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao remover permissão');
    }
  });
};

// Hooks para Roles
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/roles`);
      return response.data;
    }
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleData: Partial<Role>) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/roles`, {
        method: 'POST',
        data: roleData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar role');
    }
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...roleData }: Partial<Role> & { id: string }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/roles/${id}`, {
        method: 'PUT',
        data: roleData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar role');
    }
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await makeAuthenticatedRequest(`${API_BASE}/api/roles/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao remover role');
    }
  });
};

// Hooks para Permissões de Usuário
export const useUserPermissions = (userId?: string) => {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      const params = userId ? `?user_id=${userId}` : '';
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/user-permissions${params}`);
      return response.data;
    },
    enabled: !!userId
  });
};

export const useAssignPermissionToUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, permissionId, conditions }: { userId: string; permissionId: string; conditions?: any }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/user-permissions`, {
        method: 'POST',
        data: { user_id: userId, permission_id: permissionId, conditions }
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', variables.userId] });
      toast.success('Permissão atribuída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atribuir permissão');
    }
  });
};

export const useRemovePermissionFromUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, permissionId }: { userId: string; permissionId: string }) => {
      await makeAuthenticatedRequest(`${API_BASE}/api/user-permissions/${userId}/${permissionId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', variables.userId] });
      toast.success('Permissão removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao remover permissão');
    }
  });
};

// Hooks para Verificação de Permissões
export const useCheckPermission = (permission: string, resource?: string) => {
  return useQuery({
    queryKey: ['check-permission', permission, resource],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('permission', permission);
      if (resource) params.append('resource', resource);
      
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/permissions/check?${params}`);
      return response.data;
    }
  });
};

export const useCheckMultiplePermissions = (permissions: string[]) => {
  return useQuery({
    queryKey: ['check-permissions', permissions],
    queryFn: async () => {
      const params = new URLSearchParams();
      permissions.forEach(permission => params.append('permissions', permission));
      
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/permissions/check-multiple?${params}`);
      return response.data;
    }
  });
};

// Hooks para Auditoria de Permissões
export const usePermissionAudit = (userId?: string, timeRange = '30d') => {
  return useQuery({
    queryKey: ['permission-audit', userId, timeRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      params.append('timeRange', timeRange);
      
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/permissions/audit?${params}`);
      return response.data;
    }
  });
};

// Hooks para Matriz de Permissões
export const usePermissionMatrix = () => {
  return useQuery({
    queryKey: ['permission-matrix'],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/permissions/matrix`);
      return response.data;
    }
  });
};
