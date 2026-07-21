import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { FiLock } from 'react-icons/fi';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useChangePasswordMutation } from '@/features/account/accountApi';
import { useToast } from '@/contexts/ToastContext';
import { zodResolver } from '@/lib/validators';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(6, 'At least 6 characters').max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export default function SettingsPage() {
  const toast = useToast();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const {
    register: field,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (values) => {
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }).unwrap();
      toast.success('Password changed. Other sessions were signed out.');
      reset();
    } catch (err) {
      toast.error(err?.message || 'Could not change password');
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings · Online Chasmewala</title>
      </Helmet>

      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 text-h4 text-navy-900">
            <FiLock className="text-brand-500" /> Change password
          </h2>
          <p className="mt-1 text-sm text-navy-400">Changing your password signs out all other devices.</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4" noValidate>
            <Input
              label="Current password"
              type="password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...field('currentPassword')}
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...field('newPassword')}
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...field('confirmPassword')}
            />
            <Button type="submit" loading={isLoading}>
              Update password
            </Button>
          </form>
        </CardBody>
      </Card>
    </>
  );
}
