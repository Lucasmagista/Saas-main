import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook para gerenciar o estado do onboarding
 */
export const useOnboarding = () => {
  const { user } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = () => {
      setIsLoading(true);
      
      try {
        // Verificar se onboarding foi concluído ou pulado
        const onboardingCompleted = localStorage.getItem('onboarding-completed') === 'true';
        const onboardingSkipped = localStorage.getItem('onboarding-skipped') === 'true';
        
        // Verificar se perfil tem dados essenciais
        const hasEssentialData = user && 
          user.full_name && 
          user.phone && 
          user.position && 
          user.company_name;
        
        // Verificar flag no perfil do usuário
        const profileCompleted = user?.profile_completed === true;
        
        // Onboarding está completo se:
        // 1. Foi marcado como concluído no localStorage OU
        // 2. Foi pulado pelo usuário OU  
        // 3. O perfil tem todos os dados essenciais OU
        // 4. Tem flag profile_completed = true
        const isComplete = onboardingCompleted || onboardingSkipped || hasEssentialData || profileCompleted;
        
        setIsOnboardingComplete(isComplete);

        // Controlar quando mostrar o prompt de onboarding
        if (user && !isComplete) {
          // Verificar se já mostrou o prompt nesta sessão
          const promptShownThisSession = sessionStorage.getItem(`onboarding-prompt-shown-${user.id}`) === 'true';
          
          if (!promptShownThisSession) {
            // Marcar que já foi mostrado nesta sessão
            sessionStorage.setItem(`onboarding-prompt-shown-${user.id}`, 'true');
            setShowOnboardingPrompt(true);
          } else {
            setShowOnboardingPrompt(false);
          }
        } else {
          setShowOnboardingPrompt(false);
        }
      } catch (error) {
        console.error('Erro ao verificar status do onboarding:', error);
        // Em caso de erro, assumir que onboarding não foi concluído
        setIsOnboardingComplete(false);
        setShowOnboardingPrompt(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      checkOnboardingStatus();
    } else {
      setIsLoading(false);
      setIsOnboardingComplete(false);
      setShowOnboardingPrompt(false);
    }
  }, [user]);

  const markOnboardingComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    localStorage.removeItem('onboarding-skipped');
    setIsOnboardingComplete(true);
  };

  const markOnboardingSkipped = () => {
    localStorage.setItem('onboarding-skipped', 'true');
    localStorage.removeItem('onboarding-completed');
    setIsOnboardingComplete(true);
    setShowOnboardingPrompt(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding-completed');
    localStorage.removeItem('onboarding-skipped');
    if (user) {
      sessionStorage.removeItem(`onboarding-prompt-shown-${user.id}`);
    }
    setIsOnboardingComplete(false);
    setShowOnboardingPrompt(true);
  };

  /**
   * Força exibição do prompt de onboarding
   */
  const showPrompt = () => {
    if (user && !isOnboardingComplete) {
      sessionStorage.removeItem(`onboarding-prompt-shown-${user.id}`);
      setShowOnboardingPrompt(true);
    }
  };

  /**
   * Verifica se o usuário precisa completar onboarding
   */
  const needsOnboarding = () => {
    return user && !isOnboardingComplete && !isLoading && showOnboardingPrompt;
  };

  /**
   * Verifica se dados essenciais estão preenchidos
   */
  const hasEssentialData = () => {
    return user && 
      user.full_name && 
      user.phone && 
      user.position && 
      user.company_name;
  };

  /**
   * Calcula progresso do onboarding (0-100)
   */
  const getOnboardingProgress = () => {
    if (!user) return 0;
    
    let progress = 0;
    const fields = [
      'full_name',
      'phone', 
      'position',
      'company_name',
      'location',
      'department'
    ];
    
    fields.forEach(field => {
      if (user[field]) progress += (100 / fields.length);
    });
    
    return Math.round(progress);
  };

  return {
    isOnboardingComplete,
    isLoading,
    needsOnboarding: needsOnboarding(),
    hasEssentialData: hasEssentialData(),
    progress: getOnboardingProgress(),
    showOnboardingPrompt,
    markOnboardingComplete,
    markOnboardingSkipped,
    resetOnboarding,
    showPrompt
  };
};
