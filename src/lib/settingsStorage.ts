// Definição do tipo Json compatível com Supabase
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Tipos para as configurações
type SettingsData = CompanySettings | GeneralSettings | Record<string, unknown>;

// Utilitários para salvar e ler configurações em arquivos JSON
import { CompanySettings, GeneralSettings } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';

// ID fixo para organização padrão (UUID nulo)
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Persiste configurações preferencialmente no localStorage.
 *
 * Esta função utiliza localStorage como armazenamento principal para evitar
 * problemas de autenticação e RLS do Supabase durante configurações básicas.
 */
export const saveSettingsToFile = async (
  type: 'company' | 'general' | 'customization',
  data: SettingsData,
  key: string = 'default',
): Promise<boolean> => {
  console.log('[saveSettingsToFile] Salvando configurações:', { type, key, data });
  
  try {
    // Verificar se há sessão autenticada do Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      console.log('[saveSettingsToFile] Usuário autenticado, tentando salvar no Supabase...');
      
      // Tentar salvar no Supabase apenas se autenticado
      const { error } = await supabase
        .from('system_settings')
        .upsert(
          {
            organization_id: DEFAULT_ORG_ID,
            category: type,
            key,
            value: data as Json,
          },
          { onConflict: 'organization_id,category,key' }
        );
      
      if (error) {
        console.warn('[saveSettingsToFile] Erro no Supabase:', error.message);
        // Se erro no Supabase, vai para localStorage
      } else {
        console.log('[saveSettingsToFile] Configuração salva com sucesso no Supabase!');
        return true;
      }
    } else {
      console.log('[saveSettingsToFile] Usuário não autenticado, usando localStorage...');
    }
  } catch (authError) {
    console.log('[saveSettingsToFile] Erro de autenticação, usando localStorage:', authError);
  }
  
  // Sempre salvar no localStorage (como principal ou fallback)
  try {
    const storageKey = `settings_${type}_${key}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
    console.log('[saveSettingsToFile] Configuração salva no localStorage');
    return true;
  } catch (localError) {
    console.error('[saveSettingsToFile] Erro no localStorage:', localError);
    return false;
  }
};

/**
 * Reads settings from the Supabase `system_settings` table.  If no record exists
 * for the given type the function returns `null`.  It is safe to call this
 * function during application start up; it will simply return `null` until
 * settings have been persisted at least once.
 */
/**
 * Lê configurações da tabela `system_settings` do Supabase.
 * 
 * Utiliza fallback hierárquico:
 * 1. Tenta ler do Supabase com organização padrão
 * 2. Se não encontrar, tenta localStorage
 * 3. Retorna null se não encontrar nada
 */
export const readSettingsFromFile = async (
  type: 'company' | 'general' | 'customization',
  key: string = 'default',
): Promise<SettingsData | null> => {
  try {
    console.log('[readSettingsFromFile] Lendo configurações:', { type, key });
    
    // Tentar ler do Supabase com organização padrão
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('category', type)
      .eq('key', key)
      .maybeSingle<{ value: SettingsData }>();
    
    if (error) {
      console.warn('[readSettingsFromFile] Erro no Supabase:', error.message);
      return getFromLocalStorage(type, key);
    }
    
    if (data?.value) {
      console.log('[readSettingsFromFile] Configuração lida do Supabase:', data.value);
      return data.value;
    }
    
    // Se não encontrou no Supabase, tentar localStorage
    return getFromLocalStorage(type, key);
    
  } catch (error) {
    console.error('[readSettingsFromFile] Erro ao ler configurações:', error);
    return getFromLocalStorage(type, key);
  }
};

/**
 * Função auxiliar para ler do localStorage
 */
function getFromLocalStorage(type: string, key: string): SettingsData | null {
  try {
    const storageKey = `settings_${type}_${key}`;
    const localData = localStorage.getItem(storageKey);
    
    if (localData) {
      const parsedData = JSON.parse(localData);
      console.log('[readSettingsFromFile] Configuração lida do localStorage:', parsedData);
      return parsedData;
    }
    
    console.log('[readSettingsFromFile] Nenhuma configuração encontrada');
    return null;
    
  } catch (parseError) {
    console.error('[readSettingsFromFile] Erro ao ler localStorage:', parseError);
    return null;
  }
}

export const saveLogoFile = async (file: File) => {
  // Faz upload real para o backend Express e retorna a URL
  const formData = new FormData();
  formData.append('logo', file);
  try {
    console.log('[saveLogoFile] Iniciando upload da logo...');
    const response = await fetch('/api/logo', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const text = await response.text();
      console.error('[saveLogoFile] Falha HTTP:', response.status, text);
      
      // Se o servidor não está rodando, salva localmente
      if (response.status === 404 || !navigator.onLine) {
        console.log('[saveLogoFile] Servidor não disponível, salvando localmente...');
        return await saveLogoLocally(file);
      }
      
      throw new Error(`Falha ao fazer upload da logo: ${response.status}`);
    }
    const data = await response.json();
    console.log('[saveLogoFile] Upload concluído, resposta:', data);
    // Retorna a URL relativa da logo salva
    return data.logoUrl;
  } catch (error) {
    console.error('[saveLogoFile] Erro ao salvar logo:', error);
    
    // Fallback: salvar localmente
    console.log('[saveLogoFile] Tentando salvar localmente como fallback...');
    return await saveLogoLocally(file);
  }
};

const saveLogoLocally = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      // Salva no localStorage para persistência local
      localStorage.setItem('company-logo', base64);
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Erro ao processar arquivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Faz upload da logo e atualiza as configurações da empresa com a nova URL da logo.
 * @param file Arquivo da logo
 * @returns true se tudo ocorreu bem, false caso contrário
 */
export const updateCompanyLogo = async (file: File): Promise<boolean> => {
  console.log('[updateCompanyLogo] Iniciando atualização da logo da empresa...');
  const logoUrl = await saveLogoFile(file);
  if (!logoUrl) {
    console.error('[updateCompanyLogo] Logo URL não retornada. Upload falhou.');
    return false;
  }
  // Lê as configurações atuais da empresa
  const currentSettings = await readSettingsFromFile('company');
  console.log('[updateCompanyLogo] Configuração atual da empresa:', currentSettings);
  // Atualiza o campo 'logo' corretamente
  const updatedSettings = {
    ...(currentSettings || {}),
    logo: logoUrl,
  };
  console.log('[updateCompanyLogo] Salvando configuração atualizada:', updatedSettings);
  const result = await saveSettingsToFile('company', updatedSettings);
  if (!result) {
    console.error('[updateCompanyLogo] Falha ao salvar configuração da empresa com nova logo.');
    return false;
  }
  console.log('[updateCompanyLogo] Logo da empresa atualizada com sucesso!');
  return true;
};
