import { useRef, useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { api, normalizeError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

const LENGTH = 6;

/**
 * OTP entry with 6 single-digit inputs. Collects the code and forwards it (with
 * the email) to the reset step; the code is verified there in one call so it is
 * never consumed twice.
 */
export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const email = location.state?.email;
  const [digits, setDigits] = useState(Array(LENGTH).fill(''));
  const [resending, setResending] = useState(false);
  const inputsRef = useRef([]);

  if (!email) return <Navigate to={ROUTES.forgotPassword} replace />;

  const setDigit = (i, val) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (clean && i < LENGTH - 1) inputsRef.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (text) {
      e.preventDefault();
      setDigits(text.padEnd(LENGTH, '').split('').slice(0, LENGTH));
      inputsRef.current[Math.min(text.length, LENGTH - 1)]?.focus();
    }
  };

  const code = digits.join('');

  const onContinue = () => {
    if (code.length !== LENGTH) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    navigate(ROUTES.resetPassword, { state: { email, code } });
  };

  const resend = async () => {
    setResending(true);
    try {
      const { data } = await api.post('/auth/otp/request', { email, purpose: 'reset' });
      toast.success('A new code has been sent.');
      if (data.data?.devCode) toast.info(`Dev code: ${data.data.devCode}`, { duration: 8000 });
    } catch (err) {
      toast.error(normalizeError(err).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Verify code · Online Chasmewala</title>
      </Helmet>
      <div>
        <Link to={ROUTES.forgotPassword} className="mb-6 inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-brand-600">
          <FiArrowLeft /> Back
        </Link>
        <h1 className="text-h2 text-navy-900">Enter verification code</h1>
        <p className="mt-2 text-navy-500">
          We sent a 6-digit code to <span className="font-medium text-navy-700">{email}</span>.
        </p>

        <div className="mt-8 flex justify-between gap-2" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              className={cn(
                'h-14 w-full rounded-xl border text-center text-xl font-semibold text-navy-900',
                'border-navy-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40'
              )}
            />
          ))}
        </div>

        <Button onClick={onContinue} size="lg" fullWidth className="mt-6">
          Continue
        </Button>

        <p className="mt-6 text-center text-sm text-navy-500">
          Didn’t get a code?{' '}
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-60"
          >
            Resend
          </button>
        </p>
      </div>
    </>
  );
}
