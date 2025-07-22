
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
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
  Settings,
  Zap,
  Smartphone,
  Tablet,
  Laptop,
  RefreshCw,
  Download,
  Upload,
  Save,
  Undo,
  Redo
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettingsContext } from "@/contexts/SettingsContext";

export const CustomizationSettings = () => {
  const { toast } = useToast();
  const { customizationSettings, updateCustomizationSettings } = useSettingsContext();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [customization, setCustomization] = useState(customizationSettings);
  type CustomizationType = typeof customizationSettings;

  const [undoStack, setUndoStack] = useState<CustomizationType[]>([]);
  const [redoStack, setRedoStack] = useState<CustomizationType[]>([]);

  // Sincronizar com o contexto
  useEffect(() => {
    setCustomization(customizationSettings);
  }, [customizationSettings]);

  // Aplicar mudanças em tempo real no preview
  useEffect(() => {
    if (previewMode) {
      updateCustomizationSettings(customization);
    }
  }, [customization, previewMode]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateCustomizationSettings(customization);
      
      toast({
        title: "Personalização salva",
        description: "Todas as configurações foram aplicadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!previewMode) {
      // Salvar estado atual antes de entrar no preview
      setUndoStack([...undoStack, customizationSettings]);
      updateCustomizationSettings(customization);
    } else {
      // Restaurar estado anterior ao sair do preview
      if (undoStack.length > 0) {
        const lastState = undoStack[undoStack.length - 1];
        updateCustomizationSettings(lastState);
        setUndoStack(undoStack.slice(0, -1));
      }
    }
    setPreviewMode(!previewMode);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack([...redoStack, customization]);
      setCustomization(lastState);
      setUndoStack(undoStack.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack([...undoStack, customization]);
      setCustomization(nextState);
      setRedoStack(redoStack.slice(0, -1));
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      theme: 'light' as const,
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      fontFamily: 'Inter',
      fontSize: 'medium' as const,
      borderRadius: 'medium' as const,
      animation: 'smooth' as const,
      sidebar: {
        position: 'left' as const,
        style: 'modern' as const,
        collapsed: false
      },
      header: {
        style: 'minimal' as const,
        showBreadcrumb: true,
        showSearch: true
      },
      dashboard: {
        layout: 'grid' as const,
        cardStyle: 'elevated' as const,
        showWelcome: true
      },
      branding: {
        showLogo: true,
        showCompanyName: true,
        footerText: 'Powered by SaaS Pro',
        customCSS: ''
      }
    };
    
    setUndoStack([...undoStack, customization]);
    setCustomization(defaultSettings);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(customization, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'customization-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setUndoStack([...undoStack, customization]);
          setCustomization(importedSettings);
          toast({
            title: "Configurações importadas",
            description: "As configurações foram carregadas com sucesso.",
          });
        } catch (error) {
          toast({
            title: "Erro na importação",
            description: "Arquivo inválido ou corrompido.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const colorPresets = [
    { name: 'Azul Oceano', primary: '#3B82F6', secondary: '#06B6D4', accent: '#0EA5E9' },
    { name: 'Verde Natureza', primary: '#10B981', secondary: '#059669', accent: '#34D399' },
    { name: 'Roxo Místico', primary: '#8B5CF6', secondary: '#A855F7', accent: '#C084FC' },
    { name: 'Vermelho Paixão', primary: '#EF4444', secondary: '#F87171', accent: '#FCA5A5' },
    { name: 'Laranja Vibrante', primary: '#F97316', secondary: '#FB923C', accent: '#FDBA74' },
    { name: 'Rosa Elegante', primary: '#EC4899', secondary: '#F472B6', accent: '#F9A8D4' },
    { name: 'Dourado Luxo', primary: '#F59E0B', secondary: '#FBBF24', accent: '#FCD34D' },
    { name: 'Cinza Profissional', primary: '#6B7280', secondary: '#9CA3AF', accent: '#D1D5DB' }
  ];

  return (
    <div className="space-y-6">
      {/* Header aprimorado */}
      <Card className={previewMode ? 'ring-2 ring-primary' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Personalização Avançada
              </CardTitle>
              <CardDescription>
                Customize completamente a aparência e comportamento do seu SaaS
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
              >
                <Redo className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportSettings}
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
                  placeholder="Selecione um arquivo JSON"
                />
                <Button variant="outline" size="sm" asChild>
                  <span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tema e Cores Aprimorado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brush className="w-5 h-5" />
              Tema e Cores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tema Principal</Label>
              <Select 
                value={customization.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  setCustomization(prev => ({ ...prev, theme: value }))
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

            <div className="space-y-3">
              <Label>Paletas Predefinidas</Label>
              <div className="grid grid-cols-2 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setCustomization(prev => ({
                      ...prev,
                      primaryColor: preset.primary,
                      secondaryColor: preset.secondary,
                      accentColor: preset.accent
                    }))}
                    className="p-3 border rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                      </div>
                    </div>
                    <span className="text-xs font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Cores Personalizadas</Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border-2" style={{ backgroundColor: customization.primaryColor }} />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Cor Primária</Label>
                    <Input 
                      type="color" 
                      value={customization.primaryColor}
                      onChange={(e) => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="h-8 w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border-2" style={{ backgroundColor: customization.secondaryColor }} />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Cor Secundária</Label>
                    <Input 
                      type="color" 
                      value={customization.secondaryColor}
                      onChange={(e) => setCustomization(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="h-8 w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border-2" style={{ backgroundColor: customization.accentColor }} />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Cor de Destaque</Label>
                    <Input 
                      type="color" 
                      value={customization.accentColor}
                      onChange={(e) => setCustomization(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="h-8 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipografia e Layout Aprimorado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Tipografia e Layout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tamanho da Fonte</Label>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <Button
                    key={size}
                    variant={customization.fontSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCustomization(prev => ({ ...prev, fontSize: size }))}
                  >
                    {size === 'small' ? 'P' : size === 'medium' ? 'M' : 'G'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Raio das Bordas</Label>
              <div className="flex gap-2">
                {(['none', 'small', 'medium', 'large'] as const).map(radius => (
                  <Button
                    key={radius}
                    variant={customization.borderRadius === radius ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCustomization(prev => ({ ...prev, borderRadius: radius }))}
                    className={`${radius === 'none' ? 'rounded-none' : radius === 'small' ? 'rounded-sm' : radius === 'medium' ? 'rounded-md' : 'rounded-lg'}`}
                  >
                    {radius === 'none' ? '□' : radius === 'small' ? '⬜' : radius === 'medium' ? '▢' : '◻'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Animações</Label>
              <div className="flex gap-2">
                {(['none', 'subtle', 'smooth', 'bouncy'] as const).map(animation => (
                  <Button
                    key={animation}
                    variant={customization.animation === animation ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCustomization(prev => ({ ...prev, animation: animation }))}
                  >
                    {animation === 'none' ? '⏸' : animation === 'subtle' ? '⏵' : animation === 'smooth' ? '▶' : '🎯'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Aprimorada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Configurações da Sidebar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Posição</Label>
                <Select 
                  value={customization.sidebar.position}
                  onValueChange={(value: 'left' | 'right') => setCustomization(prev => ({ 
                    ...prev, 
                    sidebar: { ...prev.sidebar, position: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Esquerda</SelectItem>
                    <SelectItem value="right">Direita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estilo</Label>
                <Select 
                  value={customization.sidebar.style}
                  onValueChange={(value: 'modern' | 'classic' | 'minimal') => setCustomization(prev => ({ 
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
                  </SelectContent>
                </Select>
              </div>
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

        {/* Branding Aprimorado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Branding e Identidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Mostrar Logo</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibir logo da empresa
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
                <Label>CSS Personalizado</Label>
                <Textarea
                  value={customization.branding.customCSS}
                  onChange={(e) => setCustomization(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, customCSS: e.target.value }
                  }))}
                  placeholder="/* Adicione seu CSS personalizado aqui */&#10;.custom-class {&#10;  /* suas regras CSS */&#10;}"
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Card Aprimorado */}
      {previewMode && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Modo Preview Ativo
            </CardTitle>
            <CardDescription>
              Todas as mudanças estão sendo aplicadas em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border-2" style={{ backgroundColor: customization.primaryColor }} />
                <div>
                  <p className="text-sm font-medium">Primária</p>
                  <p className="text-xs text-muted-foreground">{customization.primaryColor}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border-2" style={{ backgroundColor: customization.secondaryColor }} />
                <div>
                  <p className="text-sm font-medium">Secundária</p>
                  <p className="text-xs text-muted-foreground">{customization.secondaryColor}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border-2" style={{ backgroundColor: customization.accentColor }} />
                <div>
                  <p className="text-sm font-medium">Destaque</p>
                  <p className="text-xs text-muted-foreground">{customization.accentColor}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
