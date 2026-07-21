import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiLock } from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { resetSchema, zodResolver } from '@/lib/validators';
import { api, normalizeError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const { email, code } = location.state || {};

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetSchema) });

  if (!email || !code) return <Navigate to={ROUTES.forgotPassword} replace />;

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      await api.post('/auth/otp/verify', { email, code, newPassword: password });
      toast.success('Password reset. Please sign in with your new password.');
      navigate(ROUTES.login, { replace: true });
    } catch (err) {
      toast.error(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset password · Online Chasmewala</title>
      </Helmet>
      <div>
        <h1 className="text-h2 text-navy-900">Set a new password</h1>
        <p className="mt-2 text-navy-500">Choose a strong password you haven’t used before.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            leftIcon={<FiLock />}
            error={errors.password?.message}
            {...field('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter new password"
            leftIcon={<FiLock />}
            error={errors.confirmPassword?.message}
            {...field('confirmPassword')}
          />
          <Button type="submit" size="lg" fullWidth loading={loading}>
            Reset password
          </Button>
        </form>
      </div>
    </>
  );
}
