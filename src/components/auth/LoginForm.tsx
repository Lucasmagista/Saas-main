
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';

// Esquema de validação usando Zod. O email deve ser válido e a senha precisa ter ao menos 6 caracteres.
const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setLoginError('');
      setIsSuccess(false);
      
      const result = await login(values.email, values.password);
      
      if (!result.success) {
        setLoginError(result.error || 'Erro ao fazer login. Verifique suas credenciais.');
        return;
      }
      
      setIsSuccess(true);
      // Redireciona após um pequeno delay para mostrar o sucesso
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Erro interno. Tente novamente em alguns instantes.');
    }
  };

  return (
    <div className="space-y-6">
      {loginError && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}
      
      {isSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Login realizado com sucesso! Redirecionando...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {...register('email')}
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
              {...register('password')}
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
          {errors.password && (
            <p className="text-sm text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1 py-0.5"
          >
            Esqueceu a senha?
          </Link>
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
                  Entrando...
                </>
              );
            }
            if (isSuccess) {
              return (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Sucesso!
                </>
              );
            }
            return 'Entrar';
          })()}
        </Button>

        <Separator className="my-6" />

        <div className="text-center text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <Link 
            to="/register" 
            className="text-primary hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1 py-0.5"
          >
            Criar conta
          </Link>
        </div>
      </form>
    </div>
  );
};
