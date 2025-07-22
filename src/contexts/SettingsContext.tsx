import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CompanySettings, GeneralSettings } from '@/hooks/useSettings';

interface CustomizationSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  animation: 'none' | 'subtle' | 'smooth' | 'bouncy';
  sidebar: {
    position: 'left' | 'right';
    style: 'modern' | 'classic' | 'minimal';
    collapsed: boolean;
  };
  header: {
    style: 'minimal' | 'modern' | 'classic';
    showBreadcrumb: boolean;
    showSearch: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list' | 'cards';
    cardStyle: 'elevated' | 'flat' | 'bordered';
    showWelcome: boolean;
  };
  branding: {
    showLogo: boolean;
    showCompanyName: boolean;
    footerText: string;
    customCSS: string;
  };
}

interface SettingsContextType {
  companySettings: CompanySettings;
  generalSettings: GeneralSettings;
  customizationSettings: CustomizationSettings;
  updateCompanySettings: (settings: CompanySettings) => void;
  updateGeneralSettings: (settings: GeneralSettings) => void;
  updateCustomizationSettings: (settings: CustomizationSettings) => void;
  applyCustomization: (settings: CustomizationSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

// Função para converter hex para HSL
const hexToHsl = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Função para detectar tema do sistema
const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'SaaS Pro Enterprise',
    cnpj: '12.345.678/0001-90',
    industry: 'Tecnologia',
    size: '51-200',
    founded: '2020',
    revenue: 'R$ 5-10M',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100',
    description: 'Empresa líder em soluções SaaS para gestão empresarial, oferecendo ferramentas integradas para aumentar a produtividade e eficiência dos negócios.',
    timezone: 'America/Sao_Paulo'
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    language: 'pt-BR',
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const [customizationSettings, setCustomizationSettings] = useState<CustomizationSettings>({
    theme: 'light',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    fontSize: 'medium',
    borderRadius: 'medium',
    animation: 'smooth',
    sidebar: {
      position: 'left',
      style: 'modern',
      collapsed: false
    },
    header: {
      style: 'minimal',
      showBreadcrumb: true,
      showSearch: true
    },
    dashboard: {
      layout: 'grid',
      cardStyle: 'elevated',
      showWelcome: true
    },
    branding: {
      showLogo: true,
      showCompanyName: true,
      footerText: 'Powered by SaaS Pro',
      customCSS: ''
    }
  });

  // Função para aplicar personalização
  const applyCustomization = (settings: CustomizationSettings) => {
    const root = document.documentElement;
    
    // Aplicar tema
    const actualTheme = settings.theme === 'system' ? getSystemTheme() : settings.theme;
    if (actualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Aplicar cores personalizadas em formato HSL
    const primaryHsl = hexToHsl(settings.primaryColor);
    const secondaryHsl = hexToHsl(settings.secondaryColor);
    const accentHsl = hexToHsl(settings.accentColor);
    
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--accent', accentHsl);
    
    // Aplicar fonte
    root.style.setProperty('--font-family', settings.fontFamily);
    root.className = root.className.replace(/font-\w+/g, '');
    root.classList.add(`font-${settings.fontFamily.toLowerCase().replace(/\s+/g, '-')}`);
    
    // Aplicar tamanho da fonte
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);
    root.style.fontSize = fontSizeMap[settings.fontSize];
    
    // Aplicar raio das bordas
    const radiusMap = {
      none: '0px',
      small: '4px',
      medium: '8px',
      large: '12px'
    };
    root.style.setProperty('--radius', radiusMap[settings.borderRadius]);
    
    // Aplicar animações
    const animationMap = {
      none: 'none',
      subtle: '0.1s ease-out',
      smooth: '0.3s ease-out',
      bouncy: '0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    };
    root.style.setProperty('--animation-duration', animationMap[settings.animation]);
    
    // Aplicar CSS personalizado
    let styleElement = document.getElementById('custom-css');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'custom-css';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = settings.branding.customCSS;
    
    // Aplicar configurações específicas do layout
    root.setAttribute('data-sidebar-position', settings.sidebar.position);
    root.setAttribute('data-sidebar-style', settings.sidebar.style);
    root.setAttribute('data-header-style', settings.header.style);
    root.setAttribute('data-dashboard-layout', settings.dashboard.layout);
    root.setAttribute('data-card-style', settings.dashboard.cardStyle);
    
    // Salvar no localStorage
    localStorage.setItem('customization-settings', JSON.stringify(settings));
  };

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    const savedSettings = localStorage.getItem('customization-settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setCustomizationSettings(parsedSettings);
      applyCustomization(parsedSettings);
    } else {
      applyCustomization(customizationSettings);
    }

    // Listener para mudanças no tema do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (customizationSettings.theme === 'system') {
        applyCustomization(customizationSettings);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const updateCompanySettings = (settings: CompanySettings) => {
    setCompanySettings(settings);
    if (settings.name) {
      document.title = `${settings.name} - Dashboard`;
    }
  };

  const updateGeneralSettings = (settings: GeneralSettings) => {
    setGeneralSettings(settings);
    if (settings.language) {
      document.documentElement.lang = settings.language;
    }
  };

  const updateCustomizationSettings = (settings: CustomizationSettings) => {
    setCustomizationSettings(settings);
    applyCustomization(settings);
  };

  return (
    <SettingsContext.Provider value={{
      companySettings,
      generalSettings,
      customizationSettings,
      updateCompanySettings,
      updateGeneralSettings,
      updateCustomizationSettings,
      applyCustomization
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
