import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  test: RegExp;
  message: string;
}

const requirements: PasswordRequirement[] = [
  { test: /.{8,}/, message: 'Pelo menos 8 caracteres' },
  { test: /[a-z]/, message: 'Uma letra minúscula' },
  { test: /[A-Z]/, message: 'Uma letra maiúscula' },
  { test: /\d/, message: 'Um número' },
  { test: /[@$!%*?&]/, message: 'Um caractere especial' },
];

export const PasswordStrength = ({ password, className }: PasswordStrengthProps) => {
  const checkedRequirements = requirements.map(req => ({
    ...req,
    passed: req.test.test(password)
  }));

  const passedCount = checkedRequirements.filter(req => req.passed).length;
  const strength = Math.round((passedCount / requirements.length) * 100);

  const getStrengthColor = () => {
    if (strength < 40) return 'text-red-600';
    if (strength < 60) return 'text-orange-600';
    if (strength < 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStrengthLabel = () => {
    if (strength < 40) return 'Muito fraca';
    if (strength < 60) return 'Fraca';
    if (strength < 80) return 'Boa';
    return 'Forte';
  };

  if (!password) return null;

  return (
    <div className={cn("space-y-3 animate-in slide-in-from-top-1 duration-200", className)}>
      {/* Barra de progresso */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Força da senha:</span>
          <span className={cn("text-xs font-medium", getStrengthColor())}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              strength < 40 && "bg-red-500",
              strength >= 40 && strength < 60 && "bg-orange-500",
              strength >= 60 && strength < 80 && "bg-yellow-500",
              strength >= 80 && "bg-green-500",
              // Classes dinâmicas para largura
              strength >= 80 && "w-full",
              strength >= 60 && strength < 80 && "w-4/5",
              strength >= 40 && strength < 60 && "w-3/5",
              strength >= 20 && strength < 40 && "w-2/5",
              strength < 20 && "w-1/5"
            )}
          />
        </div>
      </div>

      {/* Lista de requisitos */}
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Sua senha deve conter:</span>
        <div className="grid grid-cols-1 gap-1">
          {checkedRequirements.map((req) => (
            <div key={req.message} className="flex items-center gap-2 text-xs">
              <div
                className={cn(
                  "flex items-center justify-center w-3 h-3 rounded-full transition-colors",
                  req.passed ? "bg-green-500 text-white" : "bg-muted border border-border"
                )}
              >
                {req.passed ? (
                  <Check className="w-2 h-2" />
                ) : (
                  <X className="w-2 h-2 text-muted-foreground" />
                )}
              </div>
              <span
                className={cn(
                  "transition-colors",
                  req.passed ? "text-green-700" : "text-muted-foreground"
                )}
              >
                {req.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
