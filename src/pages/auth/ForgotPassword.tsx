
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const { t } = useTranslation();
  return (
    <AuthLayout
      title={t('forgotPassword')}
      description={t('forgotPasswordDescription')}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPassword;
