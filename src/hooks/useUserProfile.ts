import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

/**
 * Interface do perfil do usuário
 */
export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  department?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  bio?: string;
  // Campos adicionais para onboarding
  full_name?: string;
  position?: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
  timezone?: string;
  language?: string;
  notifications_email?: boolean;
  notifications_push?: boolean;
  notifications_sms?: boolean;
  profile_completed?: boolean;
  onboarding_completed_at?: string;
}

/**
 * Hook para obter e atualizar o perfil do usuário
 */
export function useUserProfile() {
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Carregar perfil do localStorage inicialmente ou do usuário autenticado
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      if (user) {
        // Se há usuário autenticado, usar seus dados
        const userProfile: UserProfile = {
          id: user.id || Date.now().toString(),
          name: user.full_name || user.name || "Usuário",
          full_name: user.full_name || user.name || "Usuário",
          email: user.email || "usuario@empresa.com",
          role: user.position || user.role || "Usuário",
          position: user.position || "Usuário",
          department: user.department || "Geral",
          phone: user.phone || "",
          location: user.location || "",
          website: user.website || "",
          linkedin: user.linkedin || "",
          bio: user.bio || "",
          avatarUrl: user.avatar_url || user.avatarUrl || "",
          company_name: user.company_name || "",
          company_size: user.company_size || "",
          industry: user.industry || "",
          timezone: user.timezone || "America/Sao_Paulo",
          language: user.language || "pt-BR",
          notifications_email: user.notifications_email ?? true,
          notifications_push: user.notifications_push ?? true,
          notifications_sms: user.notifications_sms ?? false,
          profile_completed: user.profile_completed ?? false,
          onboarding_completed_at: user.onboarding_completed_at
        };
        setProfile(userProfile);
        
        // Salvar também no localStorage
        localStorage.setItem('user-profile', JSON.stringify(userProfile));
      } else {
        // Tentar carregar do localStorage
        const savedProfile = localStorage.getItem('user-profile');
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile(parsedProfile);
        } else {
          // Se não tem perfil salvo, cria um perfil básico
          const defaultProfile: UserProfile = {
            id: Date.now().toString(),
            name: "Usuário",
            full_name: "Usuário",
            email: "usuario@empresa.com",
            role: "Usuário",
            position: "Usuário",
            department: "Geral",
            phone: "",
            location: "",
            website: "",
            linkedin: "",
            bio: "",
            avatarUrl: "",
            company_name: "",
            company_size: "",
            industry: "",
            timezone: "America/Sao_Paulo",
            language: "pt-BR",
            notifications_email: true,
            notifications_push: true,
            notifications_sms: false,
            profile_completed: false
          };
          setProfile(defaultProfile);
          localStorage.setItem('user-profile', JSON.stringify(defaultProfile));
        }
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Erro ao carregar perfil do usuário');
    } finally {
      setLoading(false);
    }
  }, [user]);  // Função para atualizar o perfil
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      // Merge com o perfil existente
      const updatedProfile = { ...profile, ...updates };
      
      // Salva no localStorage
      localStorage.setItem('user-profile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      
      // Atualizar também o contexto de autenticação se possível
      if (updateUser && typeof updateUser === 'function') {
        try {
          await updateUser(updatedProfile);
        } catch (authError) {
          console.warn('Erro ao atualizar contexto de auth:', authError);
          // Não falha se não conseguir atualizar o auth, continua com localStorage
        }
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive"
      });
      setError('Erro ao atualizar perfil');
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile, toast, updateUser]);

  // Função para upload de avatar
  const uploadAvatar = useCallback(async (file: File) => {
    if (!file) return false;
    
    try {
      setIsUploading(true);
      
      // Validar arquivo
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Arquivo muito grande",
          description: "O avatar deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return false;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato inválido",
          description: "O arquivo deve ser uma imagem.",
          variant: "destructive"
        });
        return false;
      }

      // Converter para base64 para salvar no localStorage (simplificado)
      const reader = new FileReader();
      
      return new Promise<boolean>((resolve) => {
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          
          if (profile) {
            const updatedProfile = { ...profile, avatarUrl: base64 };
            localStorage.setItem('user-profile', JSON.stringify(updatedProfile));
            setProfile(updatedProfile);
            
            toast({
              title: "Avatar atualizado",
              description: "Sua foto de perfil foi atualizada com sucesso.",
            });
          }
          
          resolve(true);
        };
        
        reader.onerror = () => {
          toast({
            title: "Erro no upload",
            description: "Não foi possível processar a imagem.",
            variant: "destructive"
          });
          resolve(false);
        };
        
        reader.readAsDataURL(file);
      });
      
    } catch (err) {
      console.error('Erro ao fazer upload do avatar:', err);
      toast({
        title: "Erro no upload",
        description: "Não foi possível atualizar o avatar. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [profile, toast]);

  return {
    profile,
    loading,
    error,
    isUploading,
    updateProfile,
    uploadAvatar,
    // Funções de conveniência para onboarding
    isProfileComplete: () => {
      if (!profile) return false;
      return !!(
        profile.full_name &&
        profile.phone &&
        profile.position &&
        profile.company_name &&
        profile.profile_completed
      );
    },
    getProfileProgress: () => {
      if (!profile) return 0;
      const fields = ['full_name', 'phone', 'position', 'company_name', 'location', 'department'];
      let completed = 0;
      fields.forEach(field => {
        if (profile[field as keyof UserProfile]) completed++;
      });
      return Math.round((completed / fields.length) * 100);
    }
  };
}
