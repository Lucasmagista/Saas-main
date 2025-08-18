
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { PasswordStrength } from './PasswordStrength';

// Esquema de validação para cadastro. Confirmação de senha deve coincidir com a senha.
const registerSchema = z
  .object({
    fullName: z.string()
      .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
      .max(50, { message: 'Nome muito longo' })
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, { message: 'Nome deve conter apenas letras e espaços' }),
    email: z.string().email({ message: 'Email inválido' }),
    password: z.string()
      .min(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
      .regex(/(?=.*[a-z])/, { message: 'Deve conter pelo menos uma letra minúscula' })
      .regex(/(?=.*[A-Z])/, { message: 'Deve conter pelo menos uma letra maiúscula' })
      .regex(/(?=.*\d)/, { message: 'Deve conter pelo menos um número' })
      .regex(/(?=.*[@$!%*?&])/, { message: 'Deve conter pelo menos um caractere especial' }),
    confirmPassword: z.string().min(8, { message: 'A confirmação deve ter no mínimo 8 caracteres' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register: formRegister,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const watchedPassword = watch('password', '');

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setRegisterError('');
      setIsSuccess(false);
      
      const result = await signUp(values.email, values.password, values.fullName);
      
      if (result?.error) {
        setRegisterError(result.error.message || 'Erro ao criar conta. Tente novamente.');
        return;
      }
      
      setIsSuccess(true);
    } catch (err) {
      console.error('Register error:', err);
      setRegisterError('Erro interno. Tente novamente em alguns instantes.');
    }
  };

  return (
    <div className="space-y-6">
      {registerError && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{registerError}</AlertDescription>
        </Alert>
      )}
      
      {isSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Conta criada com sucesso! Verifique seu email para ativar a conta.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Nome Completo
          </Label>
          <div className="relative group">
            <User className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors",
              errors.fullName ? "text-destructive" : "text-muted-foreground group-focus-within:text-primary"
            )} />
            <Input
              id="fullName"
              type="text"
              placeholder="Seu nome completo"
              {...formRegister('fullName')}
              disabled={isSubmitting || isSuccess}
              className={cn(
                "pl-10 transition-all duration-200",
                "focus:ring-2 focus:ring-primary/20",
                errors.fullName && "border-destructive focus:border-destructive",
                (isSubmitting || isSuccess) && "opacity-60"
              )}
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative group">
            <Mail className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors",
              errors.email ? "text-destructive" : "text-muted-foreground group-focus-within:text-primary"
            )} />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...formRegister('email')}
              disabled={isSubmitting || isSuccess}
              className={cn(
                "pl-10 transition-all duration-200",
                "focus:ring-2 focus:ring-primary/20",
                errors.email && "border-destructive focus:border-destructive",
                (isSubmitting || isSuccess) && "opacity-60"
              )}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Senha
          </Label>
          <div className="relative group">
            <Lock className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors",
              errors.password ? "text-destructive" : "text-muted-foreground group-focus-within:text-primary"
            )} />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha"
              {...formRegister('password')}
              disabled={isSubmitting || isSuccess}
              className={cn(
                "pl-10 pr-10 transition-all duration-200",
                "focus:ring-2 focus:ring-primary/20",
                errors.password && "border-destructive focus:border-destructive",
                (isSubmitting || isSuccess) && "opacity-60"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2",
                "text-muted-foreground hover:text-foreground transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm p-0.5",
                (isSubmitting || isSuccess) && "opacity-60 cursor-not-allowed"
              )}
              disabled={isSubmitting || isSuccess}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {/* Indicador de força da senha */}
          <PasswordStrength password={watchedPassword} />
          
          {errors.password && (
            <p className="text-sm text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmar Senha
          </Label>
          <div className="relative group">
            <Lock className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors",
              errors.confirmPassword ? "text-destructive" : "text-muted-foreground group-focus-within:text-primary"
            )} />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirme sua senha"
              {...formRegister('confirmPassword')}
              disabled={isSubmitting || isSuccess}
              className={cn(
                "pl-10 pr-10 transition-all duration-200",
                "focus:ring-2 focus:ring-primary/20",
                errors.confirmPassword && "border-destructive focus:border-destructive",
                (isSubmitting || isSuccess) && "opacity-60"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2",
                "text-muted-foreground hover:text-foreground transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm p-0.5",
                (isSubmitting || isSuccess) && "opacity-60 cursor-not-allowed"
              )}
              disabled={isSubmitting || isSuccess}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className={cn(
            "w-full transition-all duration-200",
            "hover:shadow-lg hover:shadow-primary/25",
            isSuccess && "bg-green-600 hover:bg-green-600"
          )}
          disabled={isSubmitting || isSuccess}
        >
          {(() => {
            if (isSubmitting) {
              return (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              );
            }
            if (isSuccess) {
              return (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Conta criada!
                </>
              );
            }
            return 'Criar conta';
          })()}
        </Button>

        <Separator className="my-6" />

        <div className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link 
            to="/login" 
            className="text-primary hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1 py-0.5"
          >
            Entrar
          </Link>
        </div>
      </form>
    </div>
  );
};
