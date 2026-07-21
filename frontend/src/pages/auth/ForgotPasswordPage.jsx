import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { forgotSchema, zodResolver } from '@/lib/validators';
import { api, normalizeError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/otp/request', { email, purpose: 'reset' });
      toast.success('We sent a 6-digit code to your email.');
      // In dev the mock provider returns the code so the flow is testable.
      if (data.data?.devCode) toast.info(`Dev code: ${data.data.devCode}`, { duration: 8000 });
      navigate(ROUTES.otp, { state: { email, purpose: 'reset' } });
    } catch (err) {
      toast.error(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot password · Online Chasmewala</title>
      </Helmet>
      <div>
        <Link to={ROUTES.login} className="mb-6 inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-brand-600">
          <FiArrowLeft /> Back to sign in
        </Link>
        <h1 className="text-h2 text-navy-900">Forgot password?</h1>
        <p className="mt-2 text-navy-500">
          Enter your email and we’ll send you a code to reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<FiMail />}
            error={errors.email?.message}
            {...field('email')}
          />
          <Button type="submit" size="lg" fullWidth loading={loading}>
            Send reset code
          </Button>
        </form>
      </div>
    </>
  );
}
