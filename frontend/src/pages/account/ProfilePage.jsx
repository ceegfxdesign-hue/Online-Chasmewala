import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useUpdateProfileMutation } from '@/features/account/accountApi';
import { setUser } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { zodResolver } from '@/lib/validators';

const profileSchema = z.object({
  name: z.string().min(2, 'Enter your name').max(60),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{7,15}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  newsletter: z.boolean().optional(),
  orderUpdates: z.boolean().optional(),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const toast = useToast();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      newsletter: user?.preferences?.newsletter ?? true,
      orderUpdates: user?.preferences?.orderUpdates ?? true,
    },
  });

  const onSubmit = async (values) => {
    try {
      const updated = await updateProfile({
        name: values.name,
        phone: values.phone || undefined,
        preferences: { newsletter: values.newsletter, orderUpdates: values.orderUpdates },
      }).unwrap();
      dispatch(setUser(updated));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.message || 'Could not update profile');
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile · Online Chasmewala</title>
      </Helmet>

      <Card>
        <CardHeader>
          <h2 className="text-h4 text-navy-900">Profile details</h2>
          <p className="mt-1 text-sm text-navy-400">Update your personal information and preferences.</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4" noValidate>
            <Input label="Full name" leftIcon={<FiUser />} error={errors.name?.message} {...field('name')} />
            <Input
              label="Email"
              leftIcon={<FiMail />}
              value={user?.email || ''}
              disabled
              helper="Email cannot be changed."
            />
            <Input label="Phone" type="tel" leftIcon={<FiPhone />} error={errors.phone?.message} {...field('phone')} />

            <fieldset className="space-y-2.5 pt-2">
              <legend className="mb-1 text-sm font-semibold text-navy-900">Email preferences</legend>
              <Checkbox label="Newsletter and offers" {...field('newsletter')} />
              <Checkbox label="Order updates" {...field('orderUpdates')} />
            </fieldset>

            <Button type="submit" loading={isLoading}>
              Save changes
            </Button>
          </form>
        </CardBody>
      </Card>
    </>
  );
}
