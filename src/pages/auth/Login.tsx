
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <AuthLayout
      title="Entrar"
      description="Entre na sua conta para acessar o sistema"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
