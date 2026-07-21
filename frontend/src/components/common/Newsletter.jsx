import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

/**
 * Newsletter signup. Client-side only for now (no marketing backend); validates
 * the email and gives feedback. Wire to a real endpoint when available.
 */
export function Newsletter() {
  const [email, setEmail] = useState('');
  const toast = useToast();

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('You’re subscribed! Watch your inbox for offers.');
    setEmail('');
  };

  return (
    <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-white/5 p-8 lg:flex-row lg:items-center">
      <div>
        <h3 className="text-h3 text-white">Get 10% off your first order</h3>
        <p className="mt-1 text-sm text-white/60">
          Subscribe for new arrivals, exclusive offers and eyewear tips.
        </p>
      </div>
      <form onSubmit={submit} className="flex w-full max-w-md gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="h-12 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
        />
        <Button type="submit" size="lg" rightIcon={<FiSend />}>
          Subscribe
        </Button>
      </form>
    </div>
  );
}

export default Newsletter;
