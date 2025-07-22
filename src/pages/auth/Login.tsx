
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

const Login = () => {
  const { t } = useTranslation();
  return (
    <AuthLayout
      title={t('login')}
      description={t('loginDescription')}
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
