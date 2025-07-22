
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettingsContext } from '@/contexts/SettingsContext';

export interface CompanySettings {
  name: string;
  cnpj: string;
  industry: string;
  size: string;
  founded: string;
  revenue: string;
  address: string;
  description: string;
  logo?: string;
  timezone: string;
}

export interface GeneralSettings {
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  autoBackup: boolean;
  backupFrequency: string;
}

export interface SettingsHistory {
  id: string;
  section: string;
  action: string;
  changes: Record<string, any>;
  timestamp: Date;
  user: string;
}

export const useSettings = () => {
  const { toast } = useToast();
  const { companySettings, generalSettings, updateCompanySettings, updateGeneralSettings } = useSettingsContext();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SettingsHistory[]>([
    {
      id: '1',
      section: 'Empresa',
      action: 'Informações atualizadas',
      changes: { name: 'SaaS Pro Enterprise' },
      timestamp: new Date(Date.now() - 86400000),
      user: 'João Silva'
    },
    {
      id: '2',
      section: 'Geral',
      action: 'Idioma alterado',
      changes: { language: 'pt-BR' },
      timestamp: new Date(Date.now() - 3600000),
      user: 'Maria Santos'
    }
  ]);

  const saveCompanySettings = async (settings: CompanySettings) => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const changes = Object.keys(settings).reduce((acc, key) => {
        if (settings[key as keyof CompanySettings] !== companySettings[key as keyof CompanySettings]) {
          acc[key] = settings[key as keyof CompanySettings];
        }
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(changes).length > 0) {
        addToHistory('Empresa', 'Informações atualizadas', changes);
      }

      // Aplicar mudanças globalmente através do contexto
      updateCompanySettings(settings);
      
      toast({
        title: "Configurações salvas",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveGeneralSettings = async (settings: GeneralSettings) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const changes = Object.keys(settings).reduce((acc, key) => {
        if (settings[key as keyof GeneralSettings] !== generalSettings[key as keyof GeneralSettings]) {
          acc[key] = settings[key as keyof GeneralSettings];
        }
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(changes).length > 0) {
        addToHistory('Geral', 'Configurações alteradas', changes);
      }

      // Aplicar mudanças globalmente através do contexto
      updateGeneralSettings(settings);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações gerais foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File) => {
    setLoading(true);
    try {
      // Simular upload
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const logoUrl = URL.createObjectURL(file);
      const updatedSettings = { ...companySettings, logo: logoUrl };
      
      updateCompanySettings(updatedSettings);
      addToHistory('Empresa', 'Logo atualizado', { logo: file.name });
      
      toast({
        title: "Logo atualizado",
        description: "O logo da empresa foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do logo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (section: string, action: string, changes: Record<string, any>) => {
    const newEntry: SettingsHistory = {
      id: Date.now().toString(),
      section,
      action,
      changes,
      timestamp: new Date(),
      user: 'Usuário Atual'
    };
    
    setHistory(prev => [newEntry, ...prev].slice(0, 50)); // Manter últimas 50 entradas
  };

  return {
    companySettings,
    generalSettings,
    history,
    loading,
    saveCompanySettings,
    saveGeneralSettings,
    uploadLogo
  };
};
