import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FiMail, FiPhone, FiMapPin, FiUser, FiMessageSquare } from 'react-icons/fi';
import { ContentPage } from '@/components/common/ContentPage';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { zodResolver } from '@/lib/validators';
import { useToast } from '@/contexts/ToastContext';
import { api, normalizeError } from '@/services/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().max(20).regex(/^[0-9+()\s-]*$/, 'Enter a valid phone number').optional(),
  subject: z.string().min(3, 'Please add a subject'),
  message: z.string().min(10, 'Message should be at least 10 characters'),
});

const DETAILS = [
  { icon: FiMail, label: 'Email', value: 'support@onlinechasmewala.com', href: 'mailto:support@onlinechasmewala.com' },
  { icon: FiPhone, label: 'Phone', value: '+91 90000 00000', href: 'tel:+919000000000' },
  { icon: FiMapPin, label: 'Address', value: 'MG Road, Bengaluru, Karnataka 560001' },
];

export default function ContactPage() {
  const toast = useToast();
  const {
    register: field,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/contact', data);
      toast.success(response.data.message);
      reset();
    } catch (err) {
      toast.error(normalizeError(err).message);
    }
  };


  return (
    <ContentPage
      title="Contact Us"
      description="Questions about an order, a product or your prescription? We’re here to help."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {DETAILS.map((d) => (
            <div key={d.label} className="flex items-start gap-3 rounded-2xl bg-surface p-5 shadow-card">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <d.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900">{d.label}</p>
                {d.href ? (
                  <a href={d.href} className="text-sm text-navy-500 hover:text-brand-600">
                    {d.value}
                  </a>
                ) : (
                  <p className="text-sm text-navy-500">{d.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl bg-surface p-6 shadow-card" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" leftIcon={<FiUser />} error={errors.name?.message} {...field('name')} />
            <Input label="Email" type="email" leftIcon={<FiMail />} error={errors.email?.message} {...field('email')} />
          </div>
          <Input
            containerClassName="mt-4"
            label="Subject"
            leftIcon={<FiMessageSquare />}
            error={errors.subject?.message}
            {...field('subject')}
          />
          <Input containerClassName="mt-4" label="Phone (optional)" type="tel" error={errors.phone?.message} {...field('phone')} />
          <Textarea
            containerClassName="mt-4"
            label="Message"
            rows={5}
            error={errors.message?.message}
            {...field('message')}
          />
          <Button type="submit" size="lg" className="mt-5" loading={isSubmitting}>
            Send message
          </Button>
        </form>
      </div>
    </ContentPage>
  );
}
