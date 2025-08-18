import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthField } from './AuthField';
import { AuthButton } from './AuthButton';
import { formMessages, validationMessages } from './authConfig';

// Esquema de validação usando Zod
const loginSchema = z.object({
  email: z.string().email({ message: validationMessages.email.invalid }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginFormOptimized = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
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
        setLoginError(result.error || formMessages.login.defaultError);
        return;
      }
      
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(formMessages.login.internalError);
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
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formMessages.login.success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="seu@email.com"
          icon={Mail}
          error={errors.email?.message}
          disabled={isSubmitting || isSuccess}
          {...register('email')}
        />

        <AuthField
          id="password"
          label="Senha"
          type="password"
          placeholder="Sua senha"
          icon={Lock}
          error={errors.password?.message}
          disabled={isSubmitting || isSuccess}
          {...register('password')}
        />

        <div className="flex items-center justify-between pt-2">
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1 py-0.5"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <AuthButton
          type="submit"
          isLoading={isSubmitting}
          isSuccess={isSuccess}
          loadingText="Entrando..."
          successText="Sucesso!"
        >
          Entrar
        </AuthButton>

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
