import { useState } from 'react';
import { FiMapPin, FiCheck } from 'react-icons/fi';
import { cn } from '@/utils/cn';

/**
 * Pincode serviceability + delivery-estimate checker. Uses a deterministic local
 * estimate (no external logistics API yet); swap in a courier serviceability API
 * later without changing the UI.
 */
export function PincodeChecker({ returnDays = 14 }) {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState(null);

  const check = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setResult({ ok: false, message: 'Enter a valid 6-digit pincode' });
      return;
    }
    // Deterministic mock: metro pincodes (starting 1–5) get faster delivery.
    const fast = Number(pincode[0]) <= 5;
    const days = fast ? 3 : 6;
    const date = new Date();
    date.setDate(date.getDate() + days);
    setResult({
      ok: true,
      message: `Delivery by ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
      sub: `Free ${fast ? 'express' : 'standard'} shipping · ${returnDays}-day returns`,
    });
  };

  return (
    <div className="rounded-2xl border border-navy-100 p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-900">
        <FiMapPin className="h-4 w-4 text-brand-500" /> Check delivery & availability
      </p>
      <form onSubmit={check} className="flex gap-2">
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          placeholder="Enter pincode"
          aria-label="Pincode"
          className="h-10 flex-1 rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
        <button
          type="submit"
          className="rounded-xl bg-navy-900 px-4 text-sm font-semibold text-white hover:bg-navy-800"
        >
          Check
        </button>
      </form>
      {result && (
        <div
          className={cn(
            'mt-3 flex items-start gap-2 text-sm',
            result.ok ? 'text-success-dark' : 'text-error'
          )}
        >
          {result.ok && <FiCheck className="mt-0.5 h-4 w-4 shrink-0" />}
          <div>
            <p className="font-medium">{result.message}</p>
            {result.sub && <p className="text-navy-400">{result.sub}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default PincodeChecker;
