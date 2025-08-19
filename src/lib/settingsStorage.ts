import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    refreshInterval: number;
    showMetrics: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordPolicy: 'weak' | 'medium' | 'strong';
  };
  integrations: {
    webhooks: boolean;
    apiKeys: boolean;
    thirdParty: boolean;
  };
}

interface SettingsStore {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'system',
  language: 'pt-BR',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  dashboard: {
    layout: 'grid',
    refreshInterval: 30000,
    showMetrics: true,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 3600,
    passwordPolicy: 'medium',
  },
  integrations: {
    webhooks: true,
    apiKeys: true,
    thirdParty: false,
  },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      updateSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
          },
        }));
      },
      resetSettings: () => {
        set({ settings: defaultSettings });
      },
    }),
    {
      name: 'settings-storage',
      version: 1,
    }
  )
);

// Funções utilitárias para gerenciar configurações
export const getSettings = (): Settings => {
  return useSettingsStore.getState().settings;
};

export const updateSettings = (updates: Partial<Settings>): void => {
  useSettingsStore.getState().updateSettings(updates);
};

export const resetSettings = (): void => {
  useSettingsStore.getState().resetSettings();
};

// Funções específicas para configurações comuns
export const getTheme = (): string => {
  return getSettings().theme;
};

export const setTheme = (theme: 'light' | 'dark' | 'system'): void => {
  updateSettings({ theme });
};

export const getLanguage = (): string => {
  return getSettings().language;
};

export const setLanguage = (language: string): void => {
  updateSettings({ language });
};

export const getNotificationSettings = () => {
  return getSettings().notifications;
};

export const updateNotificationSettings = (notifications: Partial<Settings['notifications']>): void => {
  const currentSettings = getSettings();
  updateSettings({
    notifications: {
      ...currentSettings.notifications,
      ...notifications,
    },
  });
};

export const getDashboardSettings = () => {
  return getSettings().dashboard;
};

export const updateDashboardSettings = (dashboard: Partial<Settings['dashboard']>): void => {
  const currentSettings = getSettings();
  updateSettings({
    dashboard: {
      ...currentSettings.dashboard,
      ...dashboard,
    },
  });
};

export const getSecuritySettings = () => {
  return getSettings().security;
};

export const updateSecuritySettings = (security: Partial<Settings['security']>): void => {
  const currentSettings = getSettings();
  updateSettings({
    security: {
      ...currentSettings.security,
      ...security,
    },
  });
};

export const getIntegrationSettings = () => {
  return getSettings().integrations;
};

export const updateIntegrationSettings = (integrations: Partial<Settings['integrations']>): void => {
  const currentSettings = getSettings();
  updateSettings({
    integrations: {
      ...currentSettings.integrations,
      ...integrations,
    },
  });
};
