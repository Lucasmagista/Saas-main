
import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  return (
    <AuthLayout
      title={t('register')}
      description={t('registerDescription')}
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
