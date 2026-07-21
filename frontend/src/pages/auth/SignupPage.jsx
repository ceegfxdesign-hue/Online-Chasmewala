import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { register as registerThunk, clearError } from '@/features/auth/authSlice';
import { signupSchema, zodResolver } from '@/lib/validators';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { isLoading } = useAuth();

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      password: values.password,
      ...(values.phone ? { phone: values.phone } : {}),
    };
    const result = await dispatch(registerThunk(payload));
    if (registerThunk.fulfilled.match(result)) {
      toast.success('Account created — welcome to Online Chasmewala!');
      navigate(ROUTES.home, { replace: true });
    } else {
      toast.error(result.payload?.message || 'Unable to create account');
    }
  };

  return (
    <>
      <Helmet>
        <title>Create account · Online Chasmewala</title>
      </Helmet>
      <div>
        <h1 className="text-h2 text-navy-900">Create your account</h1>
        <p className="mt-2 text-navy-500">Join for faster checkout, order tracking and wishlists.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <Input
            label="Full name"
            placeholder="Your name"
            autoComplete="name"
            leftIcon={<FiUser />}
            error={errors.name?.message}
            {...field('name')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<FiMail />}
            error={errors.email?.message}
            {...field('email')}
          />
          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="9000000000"
            autoComplete="tel"
            leftIcon={<FiPhone />}
            error={errors.phone?.message}
            {...field('phone')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            leftIcon={<FiLock />}
            error={errors.password?.message}
            {...field('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            leftIcon={<FiLock />}
            error={errors.confirmPassword?.message}
            {...field('confirmPassword')}
          />

          <Checkbox
            label={
              <>
                I agree to the{' '}
                <Link to={ROUTES.terms} className="text-brand-600 hover:underline">
                  Terms
                </Link>{' '}
                &{' '}
                <Link to={ROUTES.privacy} className="text-brand-600 hover:underline">
                  Privacy Policy
                </Link>
              </>
            }
            error={errors.terms?.message}
            {...field('terms')}
          />
          {errors.terms?.message && <p className="-mt-2 text-sm text-error">{errors.terms.message}</p>}

          <Button type="submit" size="lg" fullWidth loading={isLoading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-500">
          Already have an account?{' '}
          <Link to={ROUTES.login} className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
