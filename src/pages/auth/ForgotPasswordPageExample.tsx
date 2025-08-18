import { AuthLayout } from '@/components/auth/AuthLayout';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recuperar senha"
      description="Não se preocupe, isso acontece com todos nós"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
