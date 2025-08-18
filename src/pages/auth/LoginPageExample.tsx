import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Bem-vindo de volta"
      description="Entre em sua conta para continuar"
    >
      <LoginForm />
    </AuthLayout>
  );
}
