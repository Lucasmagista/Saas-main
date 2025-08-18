
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';

// Esquema de validação para recuperação de senha
const forgotSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export const ForgotPasswordForm = () => {
  const { resetPassword } = useAuth();
  const [resetError, setResetError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({ 
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    try {
      setResetError('');
      setIsSuccess(false);
      
      const result = await resetPassword(values.email);
      
      if (result?.error) {
        setResetError(result.error.message || 'Erro ao enviar email de recuperação.');
        return;
      }
      
      setIsSuccess(true);
    } catch (err) {
      console.error('Reset password error:', err);
      setResetError('Erro interno. Tente novamente em alguns instantes.');
    }
  };

  return (
    <div className="space-y-6">
      {resetError && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{resetError}</AlertDescription>
        </Alert>
      )}
      
      {isSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Email de recuperação enviado! Verifique sua caixa de entrada e spam.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-2 mb-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Esqueceu sua senha?</h3>
          <p className="text-sm text-muted-foreground">
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>
        </div>
      </div>

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
                  Enviando...
                </>
              );
            }
            if (isSuccess) {
              return (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Enviado!
                </>
              );
            }
            return (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar email de recuperação
              </>
            );
          })()}
        </Button>

        <Separator className="my-6" />

        <div className="text-center">
          <Link
            to="/login"
            className={cn(
              "inline-flex items-center text-sm text-primary hover:underline transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-2 py-1"
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para login
          </Link>
        </div>
      </form>
    </div>
  );
};
