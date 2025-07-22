
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

function useTranslation(): { t: (key: string) => string } {
  const translations: Record<string, string> = {
    login: 'Login',
    loginDescription: 'Please enter your credentials to log in.',
    // Add more keys as needed
  };

  return {
    t: (key: string) => translations[key] || key,
  };
}

export default Login;

