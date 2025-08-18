
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { saveSettingsToFile, saveLogoFile } from '@/lib/settingsStorage';

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
  changes: Partial<CompanySettings> | Partial<GeneralSettings>;
  timestamp: Date;
  user: string;
}

export const useSettings = () => {
  const { toast } = useToast();
  const { companySettings, generalSettings, updateCompanySettings, updateGeneralSettings } = useSettingsContext();
  const [loading, setLoading] = useState(false);
  // Inicialmente não há histórico local – todas as entradas de histórico são
  // geradas dinamicamente quando o usuário altera as configurações.  As
  // entradas mockadas foram removidas para evitar confusão com dados reais.
  const [history, setHistory] = useState<SettingsHistory[]>([]);

  // ...
  const saveCompanySettings = async (settings: CompanySettings) => {
    setLoading(true);
    try {
      await saveSettingsToFile('company', settings);
      const changes = Object.keys(settings).reduce((acc, key) => {
        if (settings[key as keyof CompanySettings] !== companySettings[key as keyof CompanySettings]) {
          acc[key] = settings[key as keyof CompanySettings];
        }
        return acc;
      }, {} as Partial<CompanySettings>);
      if (Object.keys(changes).length > 0) {
        addToHistory('Empresa', 'Informações atualizadas', changes);
      }
      updateCompanySettings(settings);
      toast({
        title: "Configurações salvas",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações gerais:', error);
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
      await saveSettingsToFile('general', settings);
      const changes = Object.keys(settings).reduce((acc, key) => {
        if (settings[key as keyof GeneralSettings] !== generalSettings[key as keyof GeneralSettings]) {
          acc[key] = settings[key as keyof GeneralSettings];
        }
        return acc;
      }, {} as Partial<GeneralSettings>);
      if (Object.keys(changes).length > 0) {
        addToHistory('Geral', 'Configurações alteradas', changes);
      }
      updateGeneralSettings(settings);
      toast({
        title: "Configurações salvas",
        description: "As configurações gerais foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações gerais:', error);
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
      const logoPath = await saveLogoFile(file);
      if (logoPath) {
        const updatedSettings = { ...companySettings, logo: logoPath };
        await saveSettingsToFile('company', updatedSettings);
        updateCompanySettings(updatedSettings);
        // Atualiza também o localStorage para garantir reatividade
        localStorage.setItem('company-settings', JSON.stringify(updatedSettings));
        addToHistory('Empresa', 'Logo atualizado', { logo: file.name });
        toast({
          title: "Logo atualizado",
          description: "O logo da empresa foi atualizado com sucesso.",
        });
      } else {
        throw new Error("Logo path não retornado");
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do logo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (section: string, action: string, changes: Partial<CompanySettings> | Partial<GeneralSettings>) => {
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
