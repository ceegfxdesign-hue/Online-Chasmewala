import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { FiLock, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { logout } from '@/features/auth/authSlice';
import { ROUTES } from '@/constants/routes';
import { useChangePasswordMutation, useDeleteAccountMutation } from '@/features/account/accountApi';
import { useToast } from '@/contexts/ToastContext';
import { zodResolver, passwordSchema as newPasswordSchema } from '@/lib/validators';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export default function SettingsPage() {
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

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

  const onDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      toast.error('Please enter your password to confirm account deletion');
      return;
    }
    try {
      await deleteAccount({ password: deletePassword }).unwrap();
      dispatch(logout());
      toast.success('Your account has been deleted.');
      navigate(ROUTES.home, { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Could not delete account. Verify your password.');
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

      <Card className="mt-8 border-error/30">
        <CardHeader>
          <h2 className="flex items-center gap-2 text-h4 text-error">
            <FiTrash2 className="text-error" /> Delete account
          </h2>
          <p className="mt-1 text-sm text-navy-400">
            Permanently delete your account and personal information. This action cannot be undone.
          </p>
        </CardHeader>
        <CardBody>
          {!showDeleteConfirm ? (
            <Button
              type="button"
              variant="outline"
              className="border-error text-error hover:bg-error/10 hover:text-error"
              onClick={() => setShowDeleteConfirm(true)}
              leftIcon={<FiTrash2 />}
            >
              Delete my account
            </Button>
          ) : (
            <form onSubmit={onDeleteAccount} className="max-w-md space-y-4 rounded-xl border border-error/20 bg-error/5 p-4">
              <div className="flex items-start gap-2 text-xs text-error">
                <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Enter your password to permanently delete your account, saved addresses, cards, and personal data.</span>
              </div>
              <Input
                label="Confirm your password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <div className="flex gap-3">
                <Button type="submit" variant="danger" loading={isDeleting}>
                  Confirm deletion
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </>
  );
}
