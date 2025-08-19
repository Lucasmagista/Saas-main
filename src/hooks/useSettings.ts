
import { useCallback } from 'react';
import { useSettingsStore, Settings } from '@/lib/settingsStorage';

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  website?: string;
  description?: string;
  industry?: string;
  size?: string;
  founded?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  contactPerson?: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  billing?: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'suspended';
    nextBilling?: string;
    amount?: number;
  };
}

export interface GeneralSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
    sound: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    marketing: boolean;
    thirdParty: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
}

export interface CustomizationSettings {
  dashboard: {
    layout: 'grid' | 'list' | 'compact';
    refreshInterval: number;
    showMetrics: boolean;
    showCharts: boolean;
    defaultView: 'overview' | 'analytics' | 'reports';
  };
  sidebar: {
    collapsed: boolean;
    position: 'left' | 'right';
    showIcons: boolean;
    showLabels: boolean;
  };
  header: {
    showSearch: boolean;
    showNotifications: boolean;
    showUserMenu: boolean;
    showBreadcrumbs: boolean;
  };
  footer: {
    showLinks: boolean;
    showVersion: boolean;
    showCopyright: boolean;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  fonts: {
    family: string;
    size: 'small' | 'medium' | 'large';
    weight: 'normal' | 'medium' | 'bold';
  };
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordPolicy: 'weak' | 'medium' | 'strong';
  loginAttempts: number;
  lockoutDuration: number;
  requirePasswordChange: boolean;
  passwordExpiryDays: number;
  ipWhitelist: string[];
  deviceManagement: {
    maxDevices: number;
    autoLogout: boolean;
    rememberDevices: boolean;
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
    logLevel: 'basic' | 'detailed' | 'verbose';
  };
}

export interface IntegrationSettings {
  webhooks: {
    enabled: boolean;
    maxRetries: number;
    timeout: number;
    signatureValidation: boolean;
  };
  apiKeys: {
    enabled: boolean;
    maxKeys: number;
    keyRotation: boolean;
    keyExpiryDays: number;
  };
  thirdParty: {
    google: boolean;
    microsoft: boolean;
    slack: boolean;
    discord: boolean;
    telegram: boolean;
  };
  email: {
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
    fromAddress: string;
    replyTo: string;
    templates: boolean;
  };
  storage: {
    provider: 'local' | 's3' | 'gcs' | 'azure';
    bucket: string;
    region: string;
    encryption: boolean;
  };
}

export interface AllSettings {
  company: CompanySettings;
  general: GeneralSettings;
  customization: CustomizationSettings;
  security: SecuritySettings;
  integrations: IntegrationSettings;
}

// Configurações padrão
const defaultCompanySettings: CompanySettings = {
  name: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  description: '',
  industry: '',
  size: '',
  founded: '',
  socialMedia: {},
  contactPerson: {
    name: '',
    email: '',
    phone: '',
    position: '',
  },
  billing: {
    plan: 'free',
    status: 'active',
  },
};

const defaultGeneralSettings: GeneralSettings = {
  theme: 'system',
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  currency: 'BRL',
  notifications: {
    email: true,
    push: true,
    sms: false,
    desktop: true,
    sound: true,
  },
  privacy: {
    dataCollection: true,
    analytics: true,
    marketing: false,
    thirdParty: false,
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
  },
};

const defaultCustomizationSettings: CustomizationSettings = {
  dashboard: {
    layout: 'grid',
    refreshInterval: 30000,
    showMetrics: true,
    showCharts: true,
    defaultView: 'overview',
  },
  sidebar: {
    collapsed: false,
    position: 'left',
    showIcons: true,
    showLabels: true,
  },
  header: {
    showSearch: true,
    showNotifications: true,
    showUserMenu: true,
    showBreadcrumbs: true,
  },
  footer: {
    showLinks: true,
    showVersion: true,
    showCopyright: true,
  },
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
  },
  fonts: {
    family: 'Inter',
    size: 'medium',
    weight: 'normal',
  },
};

const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: 3600,
  passwordPolicy: 'medium',
  loginAttempts: 5,
  lockoutDuration: 900,
  requirePasswordChange: false,
  passwordExpiryDays: 90,
  ipWhitelist: [],
  deviceManagement: {
    maxDevices: 5,
    autoLogout: true,
    rememberDevices: true,
  },
  audit: {
    enabled: true,
    retentionDays: 365,
    logLevel: 'basic',
  },
};

const defaultIntegrationSettings: IntegrationSettings = {
  webhooks: {
    enabled: true,
    maxRetries: 3,
    timeout: 30000,
    signatureValidation: true,
  },
  apiKeys: {
    enabled: true,
    maxKeys: 10,
    keyRotation: false,
    keyExpiryDays: 365,
  },
  thirdParty: {
    google: false,
    microsoft: false,
    slack: false,
    discord: false,
    telegram: false,
  },
  email: {
    provider: 'smtp',
    fromAddress: 'noreply@example.com',
    replyTo: 'support@example.com',
    templates: true,
  },
  storage: {
    provider: 'local',
    bucket: '',
    region: '',
    encryption: true,
  },
};

export const useSettings = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();

  // Funções para gerenciar configurações específicas
  const updateCompanySettings = useCallback((updates: Partial<CompanySettings>) => {
    // Para configurações da empresa, usar localStorage diretamente
    const currentSettings = getCompanySettings();
    const updatedSettings = { ...currentSettings, ...updates };
    localStorage.setItem('company-settings', JSON.stringify(updatedSettings));
  }, []);

  const updateGeneralSettings = useCallback((updates: Partial<GeneralSettings>) => {
    // Para configurações gerais, usar localStorage diretamente
    const currentSettings = getGeneralSettings();
    const updatedSettings = { ...currentSettings, ...updates };
    localStorage.setItem('general-settings', JSON.stringify(updatedSettings));
  }, []);

  const updateCustomizationSettings = useCallback((updates: Partial<CustomizationSettings>) => {
    // Para configurações de customização, usar localStorage diretamente
    const currentSettings = getCustomizationSettings();
    const updatedSettings = { ...currentSettings, ...updates };
    localStorage.setItem('customization-settings', JSON.stringify(updatedSettings));
  }, []);

  const updateSecuritySettings = useCallback((updates: Partial<SecuritySettings>) => {
    // Para configurações de segurança, usar localStorage diretamente
    const currentSettings = getSecuritySettings();
    const updatedSettings = { ...currentSettings, ...updates };
    localStorage.setItem('security-settings', JSON.stringify(updatedSettings));
  }, []);

  const updateIntegrationSettings = useCallback((updates: Partial<IntegrationSettings>) => {
    // Para configurações de integração, usar localStorage diretamente
    const currentSettings = getIntegrationSettings();
    const updatedSettings = { ...currentSettings, ...updates };
    localStorage.setItem('integration-settings', JSON.stringify(updatedSettings));
  }, []);

  return {
    // Configurações do Zustand (tema, notificações básicas, etc.)
    settings,
    updateSettings,
    resetSettings,
    
    // Configurações específicas (localStorage)
    updateCompanySettings,
    updateGeneralSettings,
    updateCustomizationSettings,
    updateSecuritySettings,
    updateIntegrationSettings,
  };
};

// Funções utilitárias para ler configurações do localStorage
export const getCompanySettings = (): CompanySettings => {
  try {
    const stored = localStorage.getItem('company-settings');
    return stored ? { ...defaultCompanySettings, ...JSON.parse(stored) } : defaultCompanySettings;
  } catch {
    return defaultCompanySettings;
  }
};

export const getGeneralSettings = (): GeneralSettings => {
  try {
    const stored = localStorage.getItem('general-settings');
    return stored ? { ...defaultGeneralSettings, ...JSON.parse(stored) } : defaultGeneralSettings;
  } catch {
    return defaultGeneralSettings;
  }
};

export const getCustomizationSettings = (): CustomizationSettings => {
  try {
    const stored = localStorage.getItem('customization-settings');
    return stored ? { ...defaultCustomizationSettings, ...JSON.parse(stored) } : defaultCustomizationSettings;
  } catch {
    return defaultCustomizationSettings;
  }
};

export const getSecuritySettings = (): SecuritySettings => {
  try {
    const stored = localStorage.getItem('security-settings');
    return stored ? { ...defaultSecuritySettings, ...JSON.parse(stored) } : defaultSecuritySettings;
  } catch {
    return defaultSecuritySettings;
  }
};

export const getIntegrationSettings = (): IntegrationSettings => {
  try {
    const stored = localStorage.getItem('integration-settings');
    return stored ? { ...defaultIntegrationSettings, ...JSON.parse(stored) } : defaultIntegrationSettings;
  } catch {
    return defaultIntegrationSettings;
  }
};

// Função para obter todas as configurações
export const getAllSettings = (): AllSettings => {
  return {
    company: getCompanySettings(),
    general: getGeneralSettings(),
    customization: getCustomizationSettings(),
    security: getSecuritySettings(),
    integrations: getIntegrationSettings(),
  };
};

// Função para resetar todas as configurações
export const resetAllSettings = (): void => {
  localStorage.removeItem('company-settings');
  localStorage.removeItem('general-settings');
  localStorage.removeItem('customization-settings');
  localStorage.removeItem('security-settings');
  localStorage.removeItem('integration-settings');
  resetSettings();
};
