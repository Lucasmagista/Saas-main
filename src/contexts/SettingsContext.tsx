import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import i18n from '@/lib/i18n';
import { CompanySettings, GeneralSettings } from '@/hooks/useSettings';
import { readSettingsFromFile } from '@/lib/settingsStorage';

interface CustomizationSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  fontFamily: string;
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  fontWeight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  lineHeight: number;
  letterSpacing: number;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  borderWidth: number;
  animation: 'none' | 'subtle' | 'smooth' | 'bouncy' | 'spring';
  animationSpeed: number;
  spacing: 'compact' | 'default' | 'comfortable' | 'spacious';
  shadowIntensity: number;
  blurEffects: boolean;
  gradients: boolean;
  sidebar: {
    position: 'left' | 'right';
    style: 'modern' | 'classic' | 'minimal' | 'floating';
    collapsed: boolean;
    width: number;
    transparency: number;
  };
  header: {
    style: 'minimal' | 'modern' | 'classic' | 'transparent';
    showBreadcrumb: boolean;
    showSearch: boolean;
    height: number;
    blur: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list' | 'cards' | 'masonry';
    cardStyle: 'elevated' | 'flat' | 'bordered' | 'glass';
    showWelcome: boolean;
    cardSpacing: number;
    columnCount: number;
  };
  branding: {
    showLogo: boolean;
    showCompanyName: boolean;
    footerText: string;
    customCSS: string;
    logoSize: number;
    favicon: string;
  };
  interactions: {
    hoverEffects: boolean;
    clickFeedback: boolean;
    loadingAnimations: boolean;
    transitions: boolean;
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
  // Validar se hex é uma string válida
  if (!hex || typeof hex !== 'string') {
    console.warn('Cor hex inválida:', hex);
    return '0 0% 50%'; // Retorna cinza como fallback
  }

  // Garantir que a cor tenha o formato correto
  let cleanHex = hex.trim();
  if (!cleanHex.startsWith('#')) {
    cleanHex = '#' + cleanHex;
  }

  // Verificar se tem o comprimento correto
  if (cleanHex.length !== 7) {
    console.warn('Formato de cor hex inválido:', hex);
    return '0 0% 50%'; // Retorna cinza como fallback
  }

  try {
    const r = parseInt(cleanHex.slice(1, 3), 16) / 255;
    const g = parseInt(cleanHex.slice(3, 5), 16) / 255;
    const b = parseInt(cleanHex.slice(5, 7), 16) / 255;

    // Verificar se os valores são válidos
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      console.warn('Valores RGB inválidos para cor:', hex);
      return '0 0% 50%';
    }

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
  } catch (error) {
    console.error('Erro ao converter hex para HSL:', error, 'Cor:', hex);
    return '0 0% 50%'; // Retorna cinza como fallback
  }
};

// Função para detectar tema do sistema
const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('company-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Verifica se há logo salva localmente
      const localLogo = localStorage.getItem('company-logo');
      if (localLogo && !parsed.logo) {
        parsed.logo = localLogo;
      }
      return parsed;
    }
    return {
      name: '',
      cnpj: '',
      industry: '',
      size: '',
      founded: '',
      revenue: '',
      address: '',
      description: '',
      logo: '',
      timezone: 'America/Sao_Paulo'
    };
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(() => {
    const saved = localStorage.getItem('general-settings');
    if (saved) return JSON.parse(saved);
    return {
      language: 'pt-BR',
      currency: 'BRL',
      dateFormat: 'dd/MM/yyyy',
      timeFormat: '24h',
      autoBackup: true,
      backupFrequency: 'daily'
    };
  });

  const [customizationSettings, setCustomizationSettings] = useState<CustomizationSettings>(() => {
    try {
      const saved = localStorage.getItem('customization-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Garantir que todas as propriedades obrigatórias existem
        return {
          theme: parsed.theme || 'light',
          primaryColor: parsed.primaryColor || '#3B82F6',
          secondaryColor: parsed.secondaryColor || '#10B981',
          accentColor: parsed.accentColor || '#F59E0B',
          backgroundColor: parsed.backgroundColor || '#ffffff',
          surfaceColor: parsed.surfaceColor || '#f8fafc',
          textColor: parsed.textColor || '#0f172a',
          mutedColor: parsed.mutedColor || '#64748b',
          fontFamily: parsed.fontFamily || 'Inter',
          fontSize: parsed.fontSize || 'base',
          fontWeight: parsed.fontWeight || 'normal',
          lineHeight: parsed.lineHeight || 1.5,
          letterSpacing: parsed.letterSpacing || 0,
          borderRadius: parsed.borderRadius || 'md',
          borderWidth: parsed.borderWidth || 1,
          animation: parsed.animation || 'smooth',
          animationSpeed: parsed.animationSpeed || 1,
          spacing: parsed.spacing || 'default',
          shadowIntensity: parsed.shadowIntensity || 0.1,
          blurEffects: parsed.blurEffects ?? true,
          gradients: parsed.gradients ?? true,
          sidebar: {
            position: parsed.sidebar?.position || 'left',
            style: parsed.sidebar?.style || 'modern',
            collapsed: parsed.sidebar?.collapsed ?? false,
            width: parsed.sidebar?.width || 280,
            transparency: parsed.sidebar?.transparency || 1,
          },
          header: {
            style: parsed.header?.style || 'minimal',
            showBreadcrumb: parsed.header?.showBreadcrumb ?? true,
            showSearch: parsed.header?.showSearch ?? true,
            height: parsed.header?.height || 64,
            blur: parsed.header?.blur ?? false,
          },
          dashboard: {
            layout: parsed.dashboard?.layout || 'grid',
            cardStyle: parsed.dashboard?.cardStyle || 'elevated',
            showWelcome: parsed.dashboard?.showWelcome ?? true,
            cardSpacing: parsed.dashboard?.cardSpacing || 16,
            columnCount: parsed.dashboard?.columnCount || 3,
          },
          branding: {
            showLogo: parsed.branding?.showLogo ?? true,
            showCompanyName: parsed.branding?.showCompanyName ?? true,
            footerText: parsed.branding?.footerText || 'Powered by SaaS Pro',
            customCSS: parsed.branding?.customCSS || '',
            logoSize: parsed.branding?.logoSize || 32,
            favicon: parsed.branding?.favicon || '',
          },
          interactions: {
            hoverEffects: parsed.interactions?.hoverEffects ?? true,
            clickFeedback: parsed.interactions?.clickFeedback ?? true,
            loadingAnimations: parsed.interactions?.loadingAnimations ?? true,
            transitions: parsed.interactions?.transitions ?? true,
          },
        };
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de personalização do localStorage:', error);
    }
    
    // Valores padrão caso não haja nada salvo ou ocorra erro
    return {
      theme: 'light',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      backgroundColor: '#ffffff',
      surfaceColor: '#f8fafc',
      textColor: '#0f172a',
      mutedColor: '#64748b',
      fontFamily: 'Inter',
      fontSize: 'base',
      fontWeight: 'normal',
      lineHeight: 1.5,
      letterSpacing: 0,
      borderRadius: 'md',
      borderWidth: 1,
      animation: 'smooth',
      animationSpeed: 1,
      spacing: 'default',
      shadowIntensity: 0.1,
      blurEffects: true,
      gradients: true,
      sidebar: {
        position: 'left',
        style: 'modern',
        collapsed: false,
        width: 280,
        transparency: 1,
      },
      header: {
        style: 'minimal',
        showBreadcrumb: true,
        showSearch: true,
        height: 64,
        blur: false,
      },
      dashboard: {
        layout: 'grid',
        cardStyle: 'elevated',
        showWelcome: true,
        cardSpacing: 16,
        columnCount: 3,
      },
      branding: {
        showLogo: true,
        showCompanyName: true,
        footerText: 'Powered by SaaS Pro',
        customCSS: '',
        logoSize: 32,
        favicon: '',
      },
      interactions: {
        hoverEffects: true,
        clickFeedback: true,
        loadingAnimations: true,
        transitions: true,
      },
    };
  });

  const updateCompanySettings = useCallback((settings: CompanySettings) => {
    setCompanySettings(settings);
    localStorage.setItem('company-settings', JSON.stringify(settings));
    if (settings.name) {
      document.title = `${settings.name} - Dashboard`;
    }
  }, []);

  const updateGeneralSettings = useCallback((settings: GeneralSettings) => {
    setGeneralSettings(settings);
    localStorage.setItem('general-settings', JSON.stringify(settings));
    if (settings.language) {
      document.documentElement.lang = settings.language;
      // Atualiza o idioma global do i18next
      let lang = settings.language;
      if (lang.startsWith('pt')) lang = 'pt';
      else if (lang.startsWith('en')) lang = 'en';
      else if (lang.startsWith('es')) lang = 'es';
      i18n.changeLanguage(lang);
    }
  }, []);

  // Função para aplicar personalização
  const applyCustomization = useCallback((settings: CustomizationSettings) => {
    const root = document.documentElement;
    
    // Verificar se settings é válido
    if (!settings) {
      console.warn('Settings inválidas passadas para applyCustomization');
      return;
    }
    
    // Aplicar tema
    const actualTheme = settings.theme === 'system' ? getSystemTheme() : settings.theme;
    if (actualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Aplicar cores personalizadas em formato HSL com fallbacks
    const primaryHsl = hexToHsl(settings.primaryColor || '#3B82F6');
    const secondaryHsl = hexToHsl(settings.secondaryColor || '#10B981');
    const accentHsl = hexToHsl(settings.accentColor || '#F59E0B');
    const backgroundHsl = hexToHsl(settings.backgroundColor || '#ffffff');
    const surfaceHsl = hexToHsl(settings.surfaceColor || '#f8fafc');
    const textHsl = hexToHsl(settings.textColor || '#0f172a');
    const mutedHsl = hexToHsl(settings.mutedColor || '#64748b');
    
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--background', backgroundHsl);
    root.style.setProperty('--surface', surfaceHsl);
    root.style.setProperty('--foreground', textHsl);
    root.style.setProperty('--muted-foreground', mutedHsl);
    
    // Aplicar fonte com fallbacks
    root.style.setProperty('--font-family', settings.fontFamily || 'Inter');
    
    // Aplicar tamanho da fonte
    const fontSizeMap = {
      xs: '12px',
      sm: '14px', 
      base: '16px',
      lg: '18px',
      xl: '20px'
    };
    root.style.setProperty('--font-size-base', fontSizeMap[settings.fontSize] || fontSizeMap.base);
    
    // Aplicar raio das bordas
    const radiusMap = {
      none: '0px',
      sm: '4px',
      md: '8px', 
      lg: '12px',
      xl: '16px',
      full: '9999px'
    };
    root.style.setProperty('--border-radius', radiusMap[settings.borderRadius] || radiusMap.md);
    
    // Aplicar espaçamento
    const spacingMap = {
      compact: '8px',
      default: '16px',
      comfortable: '24px', 
      spacious: '32px'
    };
    root.style.setProperty('--spacing-base', spacingMap[settings.spacing] || spacingMap.default);
    
    // Aplicar configurações específicas do sidebar
    if (settings.sidebar) {
      root.setAttribute('data-sidebar-position', settings.sidebar.position || 'left');
      root.setAttribute('data-sidebar-style', settings.sidebar.style || 'modern');
      root.setAttribute('data-sidebar-width', (settings.sidebar.width || 280).toString());
      root.setAttribute('data-sidebar-transparency', (settings.sidebar.transparency || 1).toString());
    }
    
    // Aplicar configurações do header
    if (settings.header) {
      root.setAttribute('data-header-style', settings.header.style || 'minimal');
      root.setAttribute('data-header-height', (settings.header.height || 64).toString());
    }
    
    // Aplicar configurações do dashboard
    if (settings.dashboard) {
      root.setAttribute('data-dashboard-layout', settings.dashboard.layout || 'grid');
      root.setAttribute('data-card-style', settings.dashboard.cardStyle || 'elevated');
      root.setAttribute('data-card-spacing', (settings.dashboard.cardSpacing || 16).toString());
    }
    
    // Aplicar interações se existirem
    if (settings.interactions) {
      root.setAttribute('data-hover-effects', (settings.interactions.hoverEffects ?? true).toString());
      root.setAttribute('data-click-feedback', (settings.interactions.clickFeedback ?? true).toString());
      root.setAttribute('data-loading-animations', (settings.interactions.loadingAnimations ?? true).toString());
      root.setAttribute('data-transitions', (settings.interactions.transitions ?? true).toString());
    }

    // Aplicar favicon se configurado
    if (settings.branding?.favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      (link as HTMLLinkElement).type = 'image/x-icon';
      (link as HTMLLinkElement).rel = 'icon';
      (link as HTMLLinkElement).href = settings.branding.favicon;
    }
  }, []);

  const updateCustomizationSettings = useCallback((settings: CustomizationSettings) => {
    setCustomizationSettings(settings);
    localStorage.setItem('customization-settings', JSON.stringify(settings));
    applyCustomization(settings);
  }, [applyCustomization]);

  // ...existing code...

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    applyCustomization(customizationSettings);
    document.documentElement.lang = generalSettings.language;
  }, [customizationSettings, generalSettings.language, applyCustomization]);

  // Carregar configurações persistidas no Supabase na inicialização.
  // Isso garante que as preferências salvas anteriormente pelo usuário sejam
  // aplicadas quando a aplicação for carregada em outro dispositivo ou após um
  // refresh.  A leitura é assíncrona e não bloqueia a renderização inicial.
  useEffect(() => {
    const loadRemoteSettings = async () => {
      try {
        const remoteCompany = await readSettingsFromFile('company');
        if (remoteCompany) {
          updateCompanySettings({ ...companySettings, ...remoteCompany });
        }
        const remoteGeneral = await readSettingsFromFile('general');
        if (remoteGeneral) {
          updateGeneralSettings({ ...generalSettings, ...remoteGeneral });
        }
        const remoteCustomization = await readSettingsFromFile('customization');
        if (remoteCustomization) {
          updateCustomizationSettings({ ...customizationSettings, ...remoteCustomization });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações remotas:', error);
      }
    };
    loadRemoteSettings();
    // Dependências vazias para executar apenas uma vez na inicialização.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo(() => ({
    companySettings,
    generalSettings,
    customizationSettings,
    updateCompanySettings,
    updateGeneralSettings,
    updateCustomizationSettings,
    applyCustomization
  }), [companySettings, generalSettings, customizationSettings, updateCompanySettings, updateGeneralSettings, updateCustomizationSettings, applyCustomization]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};
