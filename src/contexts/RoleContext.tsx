import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Role and permission management context. Each role has an id, a human‑readable
 * name, an array of permissions and an active flag. The context exposes
 * helpers to add, update and toggle roles or permissions. By default the
 * roles are persisted to localStorage under the key `app-roles` so that the
 * administrator can configure roles once and the application remembers them
 * across sessions. In a real application this information would live in the
 * database and be fetched via an API. This context provides a simple
 * in‑memory store to demonstrate the concept.
 */

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  active: boolean;
}

interface RoleContextType {
  roles: Role[];
  addRole: (role: Role) => void;
  updateRole: (roleId: string, updated: Partial<Role>) => void;
  toggleRoleActive: (roleId: string) => void;
  togglePermission: (roleId: string, permission: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: React.ReactNode;
}

export const RoleProvider = ({ children }: RoleProviderProps) => {
  const [roles, setRoles] = useState<Role[]>(() => {
    try {
      const saved = localStorage.getItem('app-roles');
      if (saved) {
        return JSON.parse(saved) as Role[];
      }
    } catch (err) {
      console.warn('Failed to parse roles from localStorage:', err);
    }
    // Default roles. The `id` should map to `profile.position` in useAuth
    return [
      { id: 'admin', name: 'Administrador', permissions: ['read','write','delete','manage'], active: true },
      { id: 'manager', name: 'Gestor', permissions: ['read','write','manage'], active: true },
      { id: 'ceo', name: 'Diretoria/CEO', permissions: ['read','write','manage'], active: true },
      { id: 'hr', name: 'Recursos Humanos', permissions: ['read','write'], active: true },
      { id: 'financeiro', name: 'Financeiro', permissions: ['read','write'], active: true },
      { id: 'assistencia', name: 'Assistência/Suporte', permissions: ['read','write'], active: true },
      { id: 'comercial', name: 'Comercial', permissions: ['read','write'], active: true },
      { id: 'crm', name: 'CRM', permissions: ['read','write'], active: true },
      { id: 'support', name: 'Suporte', permissions: ['read','write'], active: true },
      { id: 'guest', name: 'Convidado', permissions: ['read'], active: false },
    ];
  });

  // Persist roles when changed
  useEffect(() => {
    localStorage.setItem('app-roles', JSON.stringify(roles));
  }, [roles]);

  const addRole = (role: Role) => {
    setRoles(prev => [...prev, role]);
  };

  const updateRole = (roleId: string, updated: Partial<Role>) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, ...updated } : r));
  };

  const toggleRoleActive = (roleId: string) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, active: !r.active } : r));
  };

  const togglePermission = (roleId: string, permission: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      const hasPermission = r.permissions.includes(permission);
      return {
        ...r,
        permissions: hasPermission ? r.permissions.filter(p => p !== permission) : [...r.permissions, permission],
      };
    }));
  };

  const value: RoleContextType = {
    roles,
    addRole,
    updateRole,
    toggleRoleActive,
    togglePermission,
  };

  return (
    <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
  );
};