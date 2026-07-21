import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiLock } from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { login, clearError } from '@/features/auth/authSlice';
import { loginSchema, zodResolver } from '@/lib/validators';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isLoading } = useAuth();
  const redirectTo = location.state?.from || ROUTES.home;

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { remember: true } });

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const onSubmit = async (values) => {
    const result = await dispatch(login({ email: values.email, password: values.password }));
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.name.split(' ')[0]}!`);
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.payload?.message || 'Unable to sign in');
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign in · Online Chasmewala</title>
      </Helmet>
      <div>
        <h1 className="text-h2 text-navy-900">Welcome back</h1>
        <p className="mt-2 text-navy-500">Sign in to continue to Online Chasmewala.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            leftIcon={<FiMail />}
            error={errors.email?.message}
            {...field('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            leftIcon={<FiLock />}
            error={errors.password?.message}
            {...field('password')}
          />

          <div className="flex items-center justify-between">
            <Checkbox label="Remember me" {...field('remember')} />
            <Link to={ROUTES.forgotPassword} className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" fullWidth loading={isLoading}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-500">
          New to Online Chasmewala?{' '}
          <Link to={ROUTES.signup} className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
      </div>
    </>
  );
}
