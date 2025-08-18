
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Eye,
  Loader2,
  Monitor,
  Sun,
  Moon,
  Layout,
  Type,
  Image,
  Brush,
  RefreshCw,
  Download,
  Upload,
  Save,
  Undo,
  Redo,
  Settings,
  Grid,
  List,
  Square,
  Circle,
  Minimize2,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Droplets,
  Sparkles,
  MousePointer,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveSettingsToFile } from "@/lib/settingsStorage";
import { useSettingsContext } from "@/contexts/SettingsContext";
import styles from "./CustomizationSettings.module.css";

// Tipos expandidos para melhor type safety
type ThemeType = 'light' | 'dark' | 'system';
type FontSizeType = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
type FontWeightType = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
type BorderRadiusType = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
type AnimationType = 'none' | 'subtle' | 'smooth' | 'bouncy' | 'spring';
type SidebarStyleType = 'modern' | 'classic' | 'minimal' | 'floating';
type SidebarPositionType = 'left' | 'right';
type HeaderStyleType = 'minimal' | 'modern' | 'classic' | 'transparent';
type DashboardLayoutType = 'grid' | 'list' | 'cards' | 'masonry';
type CardStyleType = 'elevated' | 'flat' | 'bordered' | 'glass';
type SpacingType = 'compact' | 'default' | 'comfortable' | 'spacious';

// Interface expandida com mais opções
interface CustomizationSettings {
  theme: ThemeType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  fontFamily: string;
  fontSize: FontSizeType;
  fontWeight: FontWeightType;
  lineHeight: number;
  letterSpacing: number;
  borderRadius: BorderRadiusType;
  borderWidth: number;
  animation: AnimationType;
  animationSpeed: number;
  spacing: SpacingType;
  shadowIntensity: number;
  blurEffects: boolean;
  gradients: boolean;
  sidebar: {
    position: SidebarPositionType;
    style: SidebarStyleType;
    collapsed: boolean;
    width: number;
    transparency: number;
  };
  header: {
    style: HeaderStyleType;
    showBreadcrumb: boolean;
    showSearch: boolean;
    height: number;
    blur: boolean;
  };
  dashboard: {
    layout: DashboardLayoutType;
    cardStyle: CardStyleType;
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

// Componentes aprimorados para exibir cores
const ColorPreview = ({ 
  color, 
  size = "md", 
  showCode = false,
  className = "" 
}: { 
  color: string; 
  size?: "sm" | "md" | "lg";
  showCode?: boolean;
  className?: string;
}) => {
  const colorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (colorRef.current) {
      colorRef.current.style.backgroundColor = color;
    }
  }, [color]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };
  
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div 
        ref={colorRef}
        className={`${sizeClasses[size]} rounded-lg border-2 border-border shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer ${styles.colorPreview}`}
        title={color}
      />
      {showCode && (
        <span className="text-xs font-mono text-muted-foreground">{color}</span>
      )}
    </div>
  );
};const GradientPreview = ({ 
  colors, 
  direction = "to right",
  className = "" 
}: { 
  colors: string[]; 
  direction?: string;
  className?: string;
}) => {
  const gradientRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (gradientRef.current) {
      gradientRef.current.style.background = `linear-gradient(${direction}, ${colors.join(', ')})`;
    }
  }, [colors, direction]);

  return (
    <div 
      ref={gradientRef}
      className={`w-full h-16 rounded-lg border-2 border-border shadow-sm ${styles.gradientPreview} ${className}`}
    />
  );
};

// Utilitários de cor aprimorados
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

const hexToHsl = (hex: string) => {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, l: 50 };
};

const generateColorVariants = (baseColor: string) => {
  const hsl = hexToHsl(baseColor);
  return {
    50: `hsl(${hsl.h}, ${Math.min(hsl.s + 20, 100)}%, ${Math.min(hsl.l + 40, 95)}%)`,
    100: `hsl(${hsl.h}, ${Math.min(hsl.s + 15, 100)}%, ${Math.min(hsl.l + 30, 90)}%)`,
    200: `hsl(${hsl.h}, ${Math.min(hsl.s + 10, 100)}%, ${Math.min(hsl.l + 20, 80)}%)`,
    300: `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 10, 70)}%)`,
    400: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    500: `hsl(${hsl.h}, ${Math.max(hsl.s - 5, 0)}%, ${Math.max(hsl.l - 10, 20)}%)`,
    600: `hsl(${hsl.h}, ${Math.max(hsl.s - 10, 0)}%, ${Math.max(hsl.l - 20, 15)}%)`,
    700: `hsl(${hsl.h}, ${Math.max(hsl.s - 15, 0)}%, ${Math.max(hsl.l - 30, 10)}%)`,
    800: `hsl(${hsl.h}, ${Math.max(hsl.s - 20, 0)}%, ${Math.max(hsl.l - 40, 5)}%)`,
    900: `hsl(${hsl.h}, ${Math.max(hsl.s - 25, 0)}%, ${Math.max(hsl.l - 50, 3)}%)`,
  };
};

// Funções utilitárias aprimoradas
const getFontSizeValue = (size: FontSizeType): string => {
  const sizeMap = {
    xs: '12px',
    sm: '14px', 
    base: '16px',
    lg: '18px',
    xl: '20px'
  };
  return sizeMap[size];
};

const getFontWeightValue = (weight: FontWeightType): string => {
  const weightMap = {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  };
  return weightMap[weight];
};

const getBorderRadiusValue = (radius: BorderRadiusType): string => {
  const radiusMap = {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  };
  return radiusMap[radius];
};

const getAnimationDuration = (animation: AnimationType, speed: number): string => {
  const baseMap = {
    none: 0,
    subtle: 150,
    smooth: 300,
    bouncy: 500,
    spring: 800
  };
  
  const baseDuration = baseMap[animation];
  const adjustedDuration = baseDuration * (2 - speed); // speed vai de 0.5 a 1.5
  return `${adjustedDuration}ms`;
};

const getAnimationTiming = (animation: AnimationType): string => {
  const timingMap = {
    none: 'linear',
    subtle: 'ease-out',
    smooth: 'ease-in-out',
    bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  };
  return timingMap[animation];
};

const getSpacingValue = (spacing: SpacingType): Record<string, string> => {
  const spacingMap = {
    compact: {
      xs: '2px', sm: '4px', md: '8px', lg: '12px', xl: '16px'
    },
    default: {
      xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px'
    },
    comfortable: {
      xs: '6px', sm: '12px', md: '24px', lg: '36px', xl: '48px'
    },
    spacious: {
      xs: '8px', sm: '16px', md: '32px', lg: '48px', xl: '64px'
    }
  };
  return spacingMap[spacing];
};

export const CustomizationSettings = () => {
  const { toast } = useToast();
  const { customizationSettings, updateCustomizationSettings, applyCustomization } = useSettingsContext();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Função para mesclar configurações com valores padrão
  const getFullSettings = useCallback((settings: Partial<CustomizationSettings>): CustomizationSettings => ({
    theme: settings.theme || 'light',
    primaryColor: settings.primaryColor || '#3B82F6',
    secondaryColor: settings.secondaryColor || '#10B981',
    accentColor: settings.accentColor || '#F59E0B',
    backgroundColor: settings.backgroundColor || '#ffffff',
    surfaceColor: settings.surfaceColor || '#f8fafc',
    textColor: settings.textColor || '#0f172a',
    mutedColor: settings.mutedColor || '#64748b',
    fontFamily: settings.fontFamily || 'Inter',
    fontSize: settings.fontSize || 'base',
    fontWeight: settings.fontWeight || 'normal',
    lineHeight: settings.lineHeight || 1.5,
    letterSpacing: settings.letterSpacing || 0,
    borderRadius: settings.borderRadius || 'md',
    borderWidth: settings.borderWidth || 1,
    animation: settings.animation || 'smooth',
    animationSpeed: settings.animationSpeed || 1,
    spacing: settings.spacing || 'default',
    shadowIntensity: settings.shadowIntensity || 0.1,
    blurEffects: settings.blurEffects ?? true,
    gradients: settings.gradients ?? true,
    sidebar: {
      position: settings.sidebar?.position || 'left',
      style: settings.sidebar?.style || 'modern',
      collapsed: settings.sidebar?.collapsed || false,
      width: settings.sidebar?.width || 280,
      transparency: settings.sidebar?.transparency || 1,
    },
    header: {
      style: settings.header?.style || 'minimal',
      showBreadcrumb: settings.header?.showBreadcrumb ?? true,
      showSearch: settings.header?.showSearch ?? true,
      height: settings.header?.height || 64,
      blur: settings.header?.blur ?? false,
    },
    dashboard: {
      layout: settings.dashboard?.layout || 'grid',
      cardStyle: settings.dashboard?.cardStyle || 'elevated',
      showWelcome: settings.dashboard?.showWelcome ?? true,
      cardSpacing: settings.dashboard?.cardSpacing || 16,
      columnCount: settings.dashboard?.columnCount || 3,
    },
    branding: {
      showLogo: settings.branding?.showLogo ?? true,
      showCompanyName: settings.branding?.showCompanyName ?? true,
      footerText: settings.branding?.footerText || 'Powered by SaaS Pro',
      customCSS: settings.branding?.customCSS || '',
      logoSize: settings.branding?.logoSize || 32,
      favicon: settings.branding?.favicon || '',
    },
    interactions: {
      hoverEffects: settings.interactions?.hoverEffects ?? true,
      clickFeedback: settings.interactions?.clickFeedback ?? true,
      loadingAnimations: settings.interactions?.loadingAnimations ?? true,
      transitions: settings.interactions?.transitions ?? true,
    },
  }), []);

  const [customization, setCustomization] = useState<CustomizationSettings>(() => 
    getFullSettings(customizationSettings)
  );
  
  const [undoStack, setUndoStack] = useState<CustomizationSettings[]>([]);
  const [redoStack, setRedoStack] = useState<CustomizationSettings[]>([]);
  const [selectedTab, setSelectedTab] = useState("colors");

  // Memoizar a função de atualização para evitar re-renders desnecessários
  const memoizedUpdateCustomizationSettings = useCallback(updateCustomizationSettings, [updateCustomizationSettings]);
  const memoizedApplyCustomization = useCallback(applyCustomization, [applyCustomization]);

  // Aplicar estilos dinamicamente para preview
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar propriedades CSS customizadas para preview
    root.style.setProperty('--preview-font-family', customization.fontFamily);
    root.style.setProperty('--preview-font-size', getFontSizeValue(customization.fontSize));
    root.style.setProperty('--preview-font-weight', getFontWeightValue(customization.fontWeight));
    root.style.setProperty('--preview-line-height', customization.lineHeight.toString());
    root.style.setProperty('--preview-letter-spacing', `${customization.letterSpacing}px`);
    root.style.setProperty('--preview-text-color', customization.textColor);
    root.style.setProperty('--preview-muted-color', customization.mutedColor);
    root.style.setProperty('--preview-border-radius', getBorderRadiusValue(customization.borderRadius));
    root.style.setProperty('--preview-animation-duration', getAnimationDuration(customization.animation, customization.animationSpeed));
    root.style.setProperty('--preview-animation-timing', getAnimationTiming(customization.animation));
  }, [customization]);

  // Sincronizar com o contexto quando as configurações mudarem
  useEffect(() => {
    const newSettings = getFullSettings(customizationSettings);
    setCustomization(newSettings);
    setHasUnsavedChanges(false);
  }, [customizationSettings, getFullSettings]);

  // Aplicar mudanças em tempo real no preview
  useEffect(() => {
    if (previewMode) {
      memoizedApplyCustomization(customization);
    }
  }, [customization, previewMode, memoizedApplyCustomization]);

  // Detectar mudanças não salvas
  useEffect(() => {
    const currentSettings = getFullSettings(customizationSettings);
    const hasChanges = JSON.stringify(customization) !== JSON.stringify(currentSettings);
    setHasUnsavedChanges(hasChanges);
  }, [customization, customizationSettings, getFullSettings]);

  // Função para atualizar configurações locais com aplicação imediata no preview
  const updateLocalSettings = useCallback((updater: (prev: CustomizationSettings) => CustomizationSettings) => {
    setCustomization(prev => {
      const newSettings = updater(prev);
      
      // Se preview estiver ativo, aplicar mudanças imediatamente
      if (previewMode) {
        memoizedApplyCustomization(newSettings);
      }
      
      return newSettings;
    });
  }, [previewMode, memoizedApplyCustomization]);

  const addToUndoStack = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-9), customization]); // Manter apenas últimas 10 ações
    setRedoStack([]);
  }, [customization]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const settingsToSave: Record<string, unknown> = { ...customization };
      const success = await saveSettingsToFile('customization', settingsToSave);
      
      if (success) {
        // Aplicar as configurações no contexto global
        memoizedUpdateCustomizationSettings(customization);
        memoizedApplyCustomization(customization);
        
        setHasUnsavedChanges(false);
        setPreviewMode(false);
        
        toast({
          title: "✨ Personalização salva",
          description: "Todas as configurações foram aplicadas com sucesso.",
        });
      } else {
        throw new Error("Falha ao salvar configurações no banco de dados");
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = useCallback(() => {
    if (!previewMode) {
      addToUndoStack();
      memoizedApplyCustomization(customization);
      setPreviewMode(true);
      toast({
        title: "🔍 Preview ativado",
        description: "Alterações sendo aplicadas em tempo real. Use 'Salvar' para manter as mudanças.",
      });
    } else {
      // Reverter para configurações salvas
      const savedSettings = getFullSettings(customizationSettings);
      memoizedApplyCustomization(savedSettings);
      setCustomization(savedSettings);
      setPreviewMode(false);
      setHasUnsavedChanges(false);
      toast({
        title: "🔄 Preview desativado",
        description: "Voltando às configurações salvas.",
      });
    }
  }, [previewMode, addToUndoStack, memoizedApplyCustomization, customization, getFullSettings, customizationSettings, toast]);

  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, customization]);
      setCustomization(lastState);
      setUndoStack(prev => prev.slice(0, -1));
      
      if (previewMode) {
        memoizedApplyCustomization(lastState);
      }
    }
  }, [undoStack, customization, previewMode, memoizedApplyCustomization]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, customization]);
      setCustomization(nextState);
      setRedoStack(prev => prev.slice(0, -1));
      
      if (previewMode) {
        memoizedApplyCustomization(nextState);
      }
    }
  }, [redoStack, customization, previewMode, memoizedApplyCustomization]);

  const handleReset = useCallback(() => {
    const defaultSettings: CustomizationSettings = {
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
    
    addToUndoStack();
    setCustomization(defaultSettings);
    
    if (previewMode) {
      memoizedApplyCustomization(defaultSettings);
    }
    
    toast({
      title: "🔄 Configurações restauradas",
      description: "Todas as configurações foram redefinidas para os valores padrão.",
    });
  }, [addToUndoStack, previewMode, memoizedApplyCustomization, toast]);

  const exportSettings = useCallback(() => {
    try {
      const dataStr = JSON.stringify(customization, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `customization-settings-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "📁 Configurações exportadas",
        description: "Arquivo de configurações salvo com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao exportar configurações:", error);
      toast({
        title: "❌ Erro na exportação",
        description: "Não foi possível exportar as configurações.",
        variant: "destructive"
      });
    }
  }, [customization, toast]);

  const importSettings = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== 'string') {
            throw new Error("Resultado de leitura inválido");
          }
          
          const importedSettings = JSON.parse(result) as Partial<CustomizationSettings>;
          
          // Validar se possui as propriedades essenciais
          if (!importedSettings.theme || !importedSettings.primaryColor) {
            throw new Error("Arquivo de configuração inválido");
          }
          
          const fullSettings = getFullSettings(importedSettings);
          
          addToUndoStack();
          setCustomization(fullSettings);
          
          if (previewMode) {
            memoizedApplyCustomization(fullSettings);
          }
          
          toast({
            title: "📥 Configurações importadas",
            description: "As configurações foram carregadas com sucesso.",
          });
        } catch (error) {
          console.error("Erro na importação:", error);
          toast({
            title: "❌ Erro na importação",
            description: "Arquivo inválido ou corrompido. Verifique o formato JSON.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
    
    // Limpar o input para permitir reimportação do mesmo arquivo
    event.target.value = '';
  }, [getFullSettings, addToUndoStack, previewMode, memoizedApplyCustomization, toast]);

  // Paletas de cores expandidas
  const colorPresets = [
    { 
      name: 'Azul Oceano', 
      primary: '#3B82F6', 
      secondary: '#06B6D4', 
      accent: '#0EA5E9',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      muted: '#475569'
    },
    { 
      name: 'Verde Natureza', 
      primary: '#10B981', 
      secondary: '#059669', 
      accent: '#34D399',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: '#14532d',
      muted: '#475569'
    },
    { 
      name: 'Roxo Místico', 
      primary: '#8B5CF6', 
      secondary: '#A855F7', 
      accent: '#C084FC',
      background: '#faf5ff',
      surface: '#f3e8ff',
      text: '#581c87',
      muted: '#6b7280'
    },
    { 
      name: 'Vermelho Paixão', 
      primary: '#EF4444', 
      secondary: '#F87171', 
      accent: '#FCA5A5',
      background: '#fef2f2',
      surface: '#fee2e2',
      text: '#7f1d1d',
      muted: '#6b7280'
    },
    { 
      name: 'Laranja Vibrante', 
      primary: '#F97316', 
      secondary: '#FB923C', 
      accent: '#FDBA74',
      background: '#fff7ed',
      surface: '#fed7aa',
      text: '#9a3412',
      muted: '#78716c'
    },
    { 
      name: 'Rosa Elegante', 
      primary: '#EC4899', 
      secondary: '#F472B6', 
      accent: '#F9A8D4',
      background: '#fdf2f8',
      surface: '#fce7f3',
      text: '#831843',
      muted: '#6b7280'
    },
    { 
      name: 'Dourado Luxo', 
      primary: '#F59E0B', 
      secondary: '#FBBF24', 
      accent: '#FCD34D',
      background: '#fffbeb',
      surface: '#fef3c7',
      text: '#92400e',
      muted: '#78716c'
    },
    { 
      name: 'Cinza Profissional', 
      primary: '#6B7280', 
      secondary: '#9CA3AF', 
      accent: '#D1D5DB',
      background: '#f9fafb',
      surface: '#f3f4f6',
      text: '#111827',
      muted: '#6b7280'
    }
  ];

  const applyColorPreset = useCallback((preset: typeof colorPresets[0]) => {
    addToUndoStack();
    const newCustomization = {
      ...customization,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      backgroundColor: preset.background,
      surfaceColor: preset.surface,
      textColor: preset.text,
      mutedColor: preset.muted
    };
    setCustomization(newCustomization);
    
    if (previewMode) {
      memoizedApplyCustomization(newCustomization);
    }
    
    toast({
      title: "🎨 Paleta aplicada",
      description: `Paleta "${preset.name}" foi aplicada com sucesso.`,
    });
  }, [addToUndoStack, customization, previewMode, memoizedApplyCustomization, toast]);

  return (
    <div className="space-y-6">
      {/* Header aprimorado */}
      <Card className={previewMode ? 'ring-2 ring-primary ring-offset-2' : ''}>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Personalização Avançada
                {previewMode && (
                  <Badge variant="secondary" className="ml-2">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview Ativo
                  </Badge>
                )}
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="ml-2 border-orange-500 text-orange-600">
                    Mudanças não salvas
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Customize completamente a aparência e comportamento do seu SaaS
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                title="Desfazer"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                title="Refazer"
              >
                <Redo className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                title="Restaurar padrões"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportSettings}
                title="Exportar configurações"
              >
                <Download className="w-4 h-4" />
              </Button>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                  title="Importar configurações"
                />
                <Button variant="outline" size="sm" asChild>
                  <span title="Importar configurações">
                    <Upload className="w-4 h-4" />
                  </span>
                </Button>
              </label>
              <Button 
                variant={previewMode ? "default" : "outline"}
                size="sm"
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? 'Aplicado' : 'Preview'}
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs de navegação */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto p-1">
          <TabsTrigger value="colors" className="flex items-center gap-2 py-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Cores</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2 py-2">
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">Tipografia</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2 py-2">
            <Layout className="w-4 h-4" />
            <span className="hidden sm:inline">Layout</span>
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex items-center gap-2 py-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Efeitos</span>
          </TabsTrigger>
          <TabsTrigger value="interactions" className="flex items-center gap-2 py-2">
            <MousePointer className="w-4 h-4" />
            <span className="hidden sm:inline">Interações</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2 py-2">
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content - Cores */}
        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brush className="w-5 h-5" />
                  Sistema de Cores
                </CardTitle>
                <CardDescription>
                  Configure o esquema de cores principal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Tema Principal</Label>
                  <Select 
                    value={customization.theme}
                    onValueChange={(value: ThemeType) => 
                      updateLocalSettings(prev => ({ ...prev, theme: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Claro
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Escuro
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          Sistema
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Cores Principais</Label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3">
                      <ColorPreview color={customization.primaryColor} size="md" showCode />
                      <div className="flex-1">
                        <Label className="text-sm font-medium">Cor Primária</Label>
                        <Input 
                          type="color" 
                          value={customization.primaryColor}
                          onChange={(e) => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="h-10 w-full"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ColorPreview color={customization.secondaryColor} size="md" showCode />
                      <div className="flex-1">
                        <Label className="text-sm font-medium">Cor Secundária</Label>
                        <Input 
                          type="color" 
                          value={customization.secondaryColor}
                          onChange={(e) => setCustomization(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="h-10 w-full"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ColorPreview color={customization.accentColor} size="md" showCode />
                      <div className="flex-1">
                        <Label className="text-sm font-medium">Cor de Destaque</Label>
                        <Input 
                          type="color" 
                          value={customization.accentColor}
                          onChange={(e) => setCustomization(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="h-10 w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Cores de Superfície</Label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3">
                      <ColorPreview color={customization.backgroundColor} size="md" showCode />
                      <div className="flex-1">
                        <Label className="text-sm font-medium">Fundo Principal</Label>
                        <Input 
                          type="color" 
                          value={customization.backgroundColor}
                          onChange={(e) => setCustomization(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="h-10 w-full"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ColorPreview color={customization.surfaceColor} size="md" showCode />
                      <div className="flex-1">
                        <Label className="text-sm font-medium">Superfície</Label>
                        <Input 
                          type="color" 
                          value={customization.surfaceColor}
                          onChange={(e) => setCustomization(prev => ({ ...prev, surfaceColor: e.target.value }))}
                          className="h-10 w-full"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ColorPreview color={customization.textColor} size="md" showCode />
                      <div className="flex-1">
                        <Label className="text-sm font-medium">Texto Principal</Label>
                        <Input 
                          type="color" 
                          value={customization.textColor}
                          onChange={(e) => setCustomization(prev => ({ ...prev, textColor: e.target.value }))}
                          className="h-10 w-full"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ColorPreview color={customization.mutedColor} size="md" showCode />
                      <div className="flex-1">
                        <Label className="text-sm font-medium">Texto Secundário</Label>
                        <Input 
                          type="color" 
                          value={customization.mutedColor}
                          onChange={(e) => setCustomization(prev => ({ ...prev, mutedColor: e.target.value }))}
                          className="h-10 w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  Paletas Predefinidas
                </CardTitle>
                <CardDescription>
                  Escolha uma paleta pronta para aplicar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyColorPreset(preset)}
                      className="p-4 border rounded-lg hover:bg-muted transition-all duration-200 text-left group hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">{preset.name}</span>
                        <div className="flex gap-1">
                          <ColorPreview color={preset.primary} size="sm" />
                          <ColorPreview color={preset.secondary} size="sm" />
                          <ColorPreview color={preset.accent} size="sm" />
                        </div>
                      </div>
                      <GradientPreview 
                        colors={[preset.background, preset.surface, preset.primary]} 
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Content - Tipografia */}
        <TabsContent value="typography" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Configurações de Fonte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Família da Fonte</Label>
                  <Select 
                    value={customization.fontFamily}
                    onValueChange={(value) => setCustomization(prev => ({ ...prev, fontFamily: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter (Padrão)</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                      <SelectItem value="Nunito">Nunito</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Tamanho da Fonte</Label>
                  <div className="flex gap-2 flex-wrap">
                    {(['xs', 'sm', 'base', 'lg', 'xl'] as const).map(size => (
                      <Button
                        key={size}
                        variant={customization.fontSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomization(prev => ({ ...prev, fontSize: size }))}
                        className="min-w-[60px]"
                      >
                        {size.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tamanho atual: {getFontSizeValue(customization.fontSize)}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Peso da Fonte</Label>
                  <div className="flex gap-2 flex-wrap">
                    {(['light', 'normal', 'medium', 'semibold', 'bold'] as const).map(weight => (
                      <Button
                        key={weight}
                        variant={customization.fontWeight === weight ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomization(prev => ({ ...prev, fontWeight: weight }))}
                        className="capitalize"
                      >
                        {weight}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Altura da Linha ({customization.lineHeight})</Label>
                  <Slider
                    value={[customization.lineHeight]}
                    onValueChange={([value]) => setCustomization(prev => ({ ...prev, lineHeight: value }))}
                    min={1}
                    max={2.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Espaçamento entre Letras ({customization.letterSpacing}px)</Label>
                  <Slider
                    value={[customization.letterSpacing]}
                    onValueChange={([value]) => setCustomization(prev => ({ ...prev, letterSpacing: value }))}
                    min={-2}
                    max={4}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview da Tipografia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`space-y-4 p-4 border rounded-lg ${styles.typographyCard}`}>
                  <h1 className="text-2xl font-bold">Título Principal</h1>
                  <h2 className="text-xl font-semibold">Subtítulo</h2>
                  <p>
                    Este é um parágrafo de exemplo para demonstrar como a tipografia 
                    aparecerá com as configurações atuais. Você pode ajustar a família da fonte, 
                    tamanho, peso e espaçamento para criar a aparência desejada.
                  </p>
                  <p className={`text-sm ${styles.mutedText}`}>
                    Texto secundário com cor reduzida para informações complementares.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Content - Layout */}
        <TabsContent value="layout" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Configurações da Sidebar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Posição</Label>
                    <Select 
                      value={customization.sidebar.position}
                      onValueChange={(value: SidebarPositionType) => setCustomization(prev => ({ 
                        ...prev, 
                        sidebar: { ...prev.sidebar, position: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">
                          <div className="flex items-center gap-2">
                            <AlignLeft className="w-4 h-4" />
                            Esquerda
                          </div>
                        </SelectItem>
                        <SelectItem value="right">
                          <div className="flex items-center gap-2">
                            <AlignRight className="w-4 h-4" />
                            Direita
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Estilo</Label>
                    <Select 
                      value={customization.sidebar.style}
                      onValueChange={(value: SidebarStyleType) => setCustomization(prev => ({ 
                        ...prev, 
                        sidebar: { ...prev.sidebar, style: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Moderno</SelectItem>
                        <SelectItem value="classic">Clássico</SelectItem>
                        <SelectItem value="minimal">Minimalista</SelectItem>
                        <SelectItem value="floating">Flutuante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Largura da Sidebar ({customization.sidebar.width}px)</Label>
                  <Slider
                    value={[customization.sidebar.width]}
                    onValueChange={([value]) => setCustomization(prev => ({ 
                      ...prev, 
                      sidebar: { ...prev.sidebar, width: value }
                    }))}
                    min={200}
                    max={400}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Transparência ({Math.round(customization.sidebar.transparency * 100)}%)</Label>
                  <Slider
                    value={[customization.sidebar.transparency]}
                    onValueChange={([value]) => setCustomization(prev => ({ 
                      ...prev, 
                      sidebar: { ...prev.sidebar, transparency: value }
                    }))}
                    min={0.5}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Sidebar Recolhida</Label>
                    <p className="text-sm text-muted-foreground">
                      Iniciar com a sidebar minimizada
                    </p>
                  </div>
                  <Switch
                    checked={customization.sidebar.collapsed}
                    onCheckedChange={(checked) => setCustomization(prev => ({ 
                      ...prev, 
                      sidebar: { ...prev.sidebar, collapsed: checked }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Header e Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Estilo do Header</Label>
                  <Select 
                    value={customization.header.style}
                    onValueChange={(value: HeaderStyleType) => setCustomization(prev => ({ 
                      ...prev, 
                      header: { ...prev.header, style: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimalista</SelectItem>
                      <SelectItem value="modern">Moderno</SelectItem>
                      <SelectItem value="classic">Clássico</SelectItem>
                      <SelectItem value="transparent">Transparente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Altura do Header ({customization.header.height}px)</Label>
                  <Slider
                    value={[customization.header.height]}
                    onValueChange={([value]) => setCustomization(prev => ({ 
                      ...prev, 
                      header: { ...prev.header, height: value }
                    }))}
                    min={48}
                    max={100}
                    step={4}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Layout do Dashboard</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['grid', 'list', 'cards', 'masonry'] as const).map(layout => (
                      <Button
                        key={layout}
                        variant={customization.dashboard.layout === layout ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomization(prev => ({ 
                          ...prev, 
                          dashboard: { ...prev.dashboard, layout }
                        }))}
                        className="capitalize flex items-center gap-2"
                      >
                        {layout === 'grid' && <Grid className="w-4 h-4" />}
                        {layout === 'list' && <List className="w-4 h-4" />}
                        {layout === 'cards' && <Square className="w-4 h-4" />}
                        {layout === 'masonry' && <Circle className="w-4 h-4" />}
                        {layout}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Espaçamento entre Cards ({customization.dashboard.cardSpacing}px)</Label>
                  <Slider
                    value={[customization.dashboard.cardSpacing]}
                    onValueChange={([value]) => setCustomization(prev => ({ 
                      ...prev, 
                      dashboard: { ...prev.dashboard, cardSpacing: value }
                    }))}
                    min={8}
                    max={48}
                    step={4}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Breadcrumb</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar navegação estrutural
                    </p>
                  </div>
                  <Switch
                    checked={customization.header.showBreadcrumb}
                    onCheckedChange={(checked) => setCustomization(prev => ({ 
                      ...prev, 
                      header: { ...prev.header, showBreadcrumb: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Busca Global</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir campo de pesquisa no header
                    </p>
                  </div>
                  <Switch
                    checked={customization.header.showSearch}
                    onCheckedChange={(checked) => setCustomization(prev => ({ 
                      ...prev, 
                      header: { ...prev.header, showSearch: checked }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Content - Efeitos */}
        <TabsContent value="effects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Efeitos Visuais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Raio das Bordas</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['none', 'sm', 'md', 'lg', 'xl', 'full'] as const).map(radius => (
                      <Button
                        key={radius}
                        variant={customization.borderRadius === radius ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomization(prev => ({ ...prev, borderRadius: radius }))}
                        className="capitalize"
                        style={{ borderRadius: getBorderRadiusValue(radius) } as React.CSSProperties}
                      >
                        {radius}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valor atual: {getBorderRadiusValue(customization.borderRadius)}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Largura das Bordas ({customization.borderWidth}px)</Label>
                  <Slider
                    value={[customization.borderWidth]}
                    onValueChange={([value]) => setCustomization(prev => ({ ...prev, borderWidth: value }))}
                    min={0}
                    max={4}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Intensidade das Sombras ({Math.round(customization.shadowIntensity * 100)}%)</Label>
                  <Slider
                    value={[customization.shadowIntensity]}
                    onValueChange={([value]) => setCustomization(prev => ({ ...prev, shadowIntensity: value }))}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Espaçamento Global</Label>
                  <Select 
                    value={customization.spacing}
                    onValueChange={(value: SpacingType) => setCustomization(prev => ({ ...prev, spacing: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">
                        <div className="flex items-center gap-2">
                          <Minimize2 className="w-4 h-4" />
                          Compacto
                        </div>
                      </SelectItem>
                      <SelectItem value="default">
                        <div className="flex items-center gap-2">
                          <AlignCenter className="w-4 h-4" />
                          Padrão
                        </div>
                      </SelectItem>
                      <SelectItem value="comfortable">
                        <div className="flex items-center gap-2">
                          <Square className="w-4 h-4" />
                          Confortável
                        </div>
                      </SelectItem>
                      <SelectItem value="spacious">
                        <div className="flex items-center gap-2">
                          <Maximize2 className="w-4 h-4" />
                          Espaçoso
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Efeitos de Blur</Label>
                    <p className="text-sm text-muted-foreground">
                      Aplicar desfoque em overlays e modais
                    </p>
                  </div>
                  <Switch
                    checked={customization.blurEffects}
                    onCheckedChange={(checked) => setCustomization(prev => ({ ...prev, blurEffects: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Gradientes</Label>
                    <p className="text-sm text-muted-foreground">
                      Usar gradientes em backgrounds e botões
                    </p>
                  </div>
                  <Switch
                    checked={customization.gradients}
                    onCheckedChange={(checked) => setCustomization(prev => ({ ...prev, gradients: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Animações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Tipo de Animação</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['none', 'subtle', 'smooth', 'bouncy', 'spring'] as const).map(animation => (
                      <Button
                        key={animation}
                        variant={customization.animation === animation ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomization(prev => ({ ...prev, animation }))}
                        className="capitalize"
                      >
                        {animation}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Timing: {getAnimationTiming(customization.animation)}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Velocidade das Animações ({customization.animationSpeed.toFixed(1)}x)</Label>
                  <Slider
                    value={[customization.animationSpeed]}
                    onValueChange={([value]) => setCustomization(prev => ({ ...prev, animationSpeed: value }))}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Duração atual: {getAnimationDuration(customization.animation, customization.animationSpeed)}
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Preview das Animações</Label>
                  <div className="space-y-3">
                    <Button className={`w-full transition-all ${styles.animationPreview}`}>
                      Teste de Botão
                    </Button>
                    <div className={`p-4 border rounded-lg transition-all ${styles.animationPreview} ${styles.borderRadiusPreview}`}>
                      Card de exemplo com animações
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Content - Interações */}
        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="w-5 h-5" />
                Comportamentos de Interação
              </CardTitle>
              <CardDescription>
                Configure como os usuários interagem com a interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Efeitos de Hover</Label>
                      <p className="text-sm text-muted-foreground">
                        Animações quando o mouse passa sobre elementos
                      </p>
                    </div>
                    <Switch
                      checked={customization.interactions.hoverEffects}
                      onCheckedChange={(checked) => setCustomization(prev => ({ 
                        ...prev, 
                        interactions: { ...prev.interactions, hoverEffects: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Feedback de Clique</Label>
                      <p className="text-sm text-muted-foreground">
                        Animações visuais ao clicar em botões
                      </p>
                    </div>
                    <Switch
                      checked={customization.interactions.clickFeedback}
                      onCheckedChange={(checked) => setCustomization(prev => ({ 
                        ...prev, 
                        interactions: { ...prev.interactions, clickFeedback: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Animações de Loading</Label>
                      <p className="text-sm text-muted-foreground">
                        Indicadores visuais durante carregamento
                      </p>
                    </div>
                    <Switch
                      checked={customization.interactions.loadingAnimations}
                      onCheckedChange={(checked) => setCustomization(prev => ({ 
                        ...prev, 
                        interactions: { ...prev.interactions, loadingAnimations: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Transições Suaves</Label>
                      <p className="text-sm text-muted-foreground">
                        Animações entre mudanças de estado
                      </p>
                    </div>
                    <Switch
                      checked={customization.interactions.transitions}
                      onCheckedChange={(checked) => setCustomization(prev => ({ 
                        ...prev, 
                        interactions: { ...prev.interactions, transitions: checked }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Preview das Interações</Label>
                  <div className="space-y-3 p-4 border rounded-lg">
                    <Button 
                      className={`w-full transition-all ${styles.interactiveButton} ${
                        customization.interactions.hoverEffects ? styles.hoverEnabled : ''
                      } ${
                        customization.interactions.clickFeedback ? styles.clickEnabled : ''
                      }`}
                    >
                      Botão Interativo
                    </Button>
                    
                    <div 
                      className={`p-3 border rounded cursor-pointer transition-all ${styles.interactiveCard} ${
                        customization.interactions.hoverEffects ? styles.hoverEnabled : ''
                      }`}
                    >
                      Card com hover
                    </div>

                    {customization.interactions.loadingAnimations && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading animado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content - Branding */}
        <TabsContent value="branding" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Identidade Visual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Mostrar Logo</Label>
                      <p className="text-sm text-muted-foreground">
                        Exibir logo da empresa no header
                      </p>
                    </div>
                    <Switch
                      checked={customization.branding.showLogo}
                      onCheckedChange={(checked) => setCustomization(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, showLogo: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Nome da Empresa</Label>
                      <p className="text-sm text-muted-foreground">
                        Mostrar nome junto ao logo
                      </p>
                    </div>
                    <Switch
                      checked={customization.branding.showCompanyName}
                      onCheckedChange={(checked) => setCustomization(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, showCompanyName: checked }
                      }))}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Tamanho do Logo ({customization.branding.logoSize}px)</Label>
                    <Slider
                      value={[customization.branding.logoSize]}
                      onValueChange={([value]) => setCustomization(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, logoSize: value }
                      }))}
                      min={16}
                      max={64}
                      step={4}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Texto do Rodapé</Label>
                    <Input 
                      value={customization.branding.footerText}
                      onChange={(e) => setCustomization(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, footerText: e.target.value }
                      }))}
                      placeholder="Powered by SaaS Pro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Favicon URL</Label>
                    <Input 
                      value={customization.branding.favicon}
                      onChange={(e) => setCustomization(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, favicon: e.target.value }
                      }))}
                      placeholder="https://exemplo.com/favicon.ico"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  CSS Personalizado
                </CardTitle>
                <CardDescription>
                  Adicione estilos CSS personalizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>CSS Personalizado</Label>
                  <Textarea
                    value={customization.branding.customCSS}
                    onChange={(e) => setCustomization(prev => ({ 
                      ...prev, 
                      branding: { ...prev.branding, customCSS: e.target.value }
                    }))}
                    placeholder={`/* Adicione seu CSS personalizado aqui */
.custom-button {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
}

.custom-card {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}`}
                    className="min-h-[200px] font-mono text-sm resize-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Use CSS personalizado com cuidado. Mudanças podem afetar a funcionalidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Card quando ativo */}
      {previewMode && (
        <Card className="border-primary bg-primary/5 ring-2 ring-primary ring-offset-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Modo Preview Ativo
              <Badge variant="secondary">Aplicando em tempo real</Badge>
            </CardTitle>
            <CardDescription>
              Todas as mudanças estão sendo aplicadas em tempo real. Use os controles de undo/redo para reverter alterações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <ColorPreview color={customization.primaryColor} size="lg" showCode />
                <p className="text-sm font-medium mt-2">Primária</p>
              </div>
              <div className="text-center">
                <ColorPreview color={customization.secondaryColor} size="lg" showCode />
                <p className="text-sm font-medium mt-2">Secundária</p>
              </div>
              <div className="text-center">
                <ColorPreview color={customization.accentColor} size="lg" showCode />
                <p className="text-sm font-medium mt-2">Destaque</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-lg border-2 border-border shadow-sm flex items-center justify-center text-xs font-mono ${styles.typographyCard}`}>
                  Aa
                </div>
                <p className="text-sm font-medium mt-2">Tipografia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
