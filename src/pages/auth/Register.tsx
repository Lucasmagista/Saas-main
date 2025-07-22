
import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <AuthLayout
      title="Criar Conta"
      description="Crie sua conta para começar a usar o sistema"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
