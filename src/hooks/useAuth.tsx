
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: 'Erro ao entrar',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      console.log('Sign in successful:', data);
      
      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        
        // Buscar perfil do usuário
        const profileData = await fetchProfile(data.user.id);
        setProfile(profileData);
        
        toast({
          title: 'Sucesso!',
          description: 'Login realizado com sucesso',
        });
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Erro ao entrar',
        description: 'Erro inesperado ao tentar fazer login',
        variant: 'destructive',
      });
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: 'Erro ao criar conta',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sucesso!',
          description: 'Conta criada com sucesso. Verifique seu email para confirmar.',
        });
      }

      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: 'Erro ao sair',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
        toast({
          title: 'Sucesso!',
          description: 'Logout realizado com sucesso',
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: 'Erro ao redefinir senha',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sucesso!',
          description: 'Email de redefinição de senha enviado',
        });
      }

      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) {
        toast({
          title: 'Erro ao atualizar perfil',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        await refreshProfile();
        toast({
          title: 'Sucesso!',
          description: 'Perfil atualizado com sucesso',
        });
      }

      return { error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Configurar listener primeiro
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (!mounted) return;
            
            if (event === 'SIGNED_OUT') {
              setUser(null);
              setProfile(null);
              setSession(null);
              setLoading(false);
              return;
            }

            if (session?.user) {
              setUser(session.user);
              setSession(session);
              
              // Buscar perfil do usuário
              setTimeout(async () => {
                if (mounted) {
                  const profileData = await fetchProfile(session.user.id);
                  if (mounted) {
                    setProfile(profileData);
                  }
                }
              }, 0);
            } else {
              setUser(null);
              setProfile(null);
              setSession(null);
            }
            
            if (mounted) {
              setLoading(false);
            }
          }
        );

        // Verificar sessão existente
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Current session:', session, error);
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            setSession(session);
            
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
          }
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();

    return () => {
      mounted = false;
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
