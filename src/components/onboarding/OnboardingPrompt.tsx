import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UserCheck, Clock, ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

export const OnboardingPrompt = () => {
  const { 
    needsOnboarding, 
    progress, 
    isOnboardingComplete,
    showOnboardingPrompt,
    markOnboardingSkipped 
  } = useOnboarding();

  // Não mostrar se onboarding já foi concluído ou se não deve ser exibido
  if (isOnboardingComplete || !needsOnboarding || !showOnboardingPrompt) {
    return null;
  }

  // Se progresso é menor que 100%, mostrar prompt para completar
  if (progress < 100) {
    return (
      <Card className="mx-3 mb-4 border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-medium text-orange-900">Complete seu perfil</h4>
              <p className="text-sm text-orange-700">
                Termine de configurar sua conta para aproveitar todos os recursos.
              </p>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-orange-600">Progresso</span>
                  <span className="text-xs font-medium text-orange-600">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Link to="/onboarding">
                    Continuar
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markOnboardingSkipped}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                >
                  Mais tarde
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

/**
 * Badge/indicador compacto para mostrar status do onboarding
 */
export const OnboardingBadge = () => {
  const { needsOnboarding, progress, showPrompt } = useOnboarding();

  if (!needsOnboarding) {
    return (
      <div className="flex items-center gap-1 text-green-600 text-xs">
        <UserCheck className="w-3 h-3" />
        <span>Perfil completo</span>
      </div>
    );
  }

  return (
    <button
      onClick={showPrompt}
      className="flex items-center gap-1 text-orange-600 text-xs hover:text-orange-700 transition-colors"
      title="Clique para mostrar prompt de onboarding"
    >
      <Clock className="w-3 h-3" />
      <span>{progress}% completo</span>
    </button>
  );
};
