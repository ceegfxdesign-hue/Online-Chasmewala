import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { FiPlus, FiTrash2, FiCreditCard } from 'react-icons/fi';
import { useGetCardsQuery, useAddCardMutation, useRemoveCardMutation } from '@/features/account/accountApi';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { zodResolver } from '@/lib/validators';

const cardSchema = z.object({
  number: z.string().regex(/^[\d\s]{12,19}$/, 'Enter a valid card number'),
  holderName: z.string().min(2, 'Enter the name on the card'),
  expiryMonth: z.coerce.number().int().min(1, 'MM').max(12, 'MM'),
  expiryYear: z.coerce.number().int().min(2024, 'YYYY').max(2050, 'YYYY'),
});

export default function CardsPage() {
  const toast = useToast();
  const { data: cards = [], isLoading } = useGetCardsQuery();
  const [addCard, { isLoading: adding }] = useAddCardMutation();
  const [removeCard] = useRemoveCardMutation();
  const [open, setOpen] = useState(false);

  const {
    register: field,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(cardSchema) });

  const onSubmit = async (values) => {
    try {
      await addCard(values).unwrap();
      toast.success('Card saved securely');
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Could not save card');
    }
  };

  return (
    <>
      <Helmet>
        <title>Saved Cards · Online Chasmewala</title>
      </Helmet>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-h4 text-navy-900">Saved Cards</h2>
        <Button size="sm" leftIcon={<FiPlus />} onClick={() => setOpen(true)}>
          Add card
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36" />
        </div>
      ) : cards.length === 0 ? (
        <EmptyState
          icon={<FiCreditCard />}
          title="No saved cards"
          description="Save a card for faster checkout. We store only the last 4 digits — never your full number."
          action={<Button onClick={() => setOpen(true)}>Add a card</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card._id}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 p-5 text-white shadow-card"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-500/20 blur-xl" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {card.brand || 'Card'}
                </span>
                {card.isDefault && <Badge variant="accent">Default</Badge>}
              </div>
              <p className="mt-5 font-mono text-lg tracking-widest">•••• •••• •••• {card.last4}</p>
              <div className="mt-4 flex items-end justify-between text-sm">
                <div>
                  <p className="text-[10px] uppercase text-white/50">Card holder</p>
                  <p className="font-medium">{card.holderName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-white/50">Expires</p>
                  <p className="font-medium">
                    {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Remove card"
                  onClick={() => removeCard(card._id)}
                  className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-error"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a card" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Card number" inputMode="numeric" placeholder="4111 1111 1111 1111" error={errors.number?.message} {...field('number')} />
          <Input label="Name on card" error={errors.holderName?.message} {...field('holderName')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Expiry month" placeholder="MM" inputMode="numeric" error={errors.expiryMonth?.message} {...field('expiryMonth')} />
            <Input label="Expiry year" placeholder="YYYY" inputMode="numeric" error={errors.expiryYear?.message} {...field('expiryYear')} />
          </div>
          <p className="text-xs text-navy-400">
            We store only the last 4 digits and a secure token — never your full card number or CVV.
          </p>
          <Button type="submit" fullWidth loading={adding}>
            Save card
          </Button>
        </form>
      </Modal>
    </>
  );
}
