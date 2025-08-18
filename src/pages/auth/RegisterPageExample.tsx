import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Criar nova conta"
      description="Preencha os dados abaixo para começar"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
