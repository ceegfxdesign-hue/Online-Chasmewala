import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import OTPVerificationPage from './OTPVerificationPage';
import { ROUTES } from '@/constants/routes';

const mocks = vi.hoisted(() => ({ post: vi.fn(), error: vi.fn(), success: vi.fn() }));
vi.mock('@/services/api', () => ({ api: { post: mocks.post }, normalizeError: (err) => err }));
vi.mock('@/contexts/ToastContext', () => ({ useToast: () => mocks }));

function setup() {
  render(<HelmetProvider><MemoryRouter initialEntries={[{ pathname: '/otp', state: { email: 'test@example.com' } }]}>
    <Routes>
      <Route path="/otp" element={<OTPVerificationPage />} />
      <Route path={ROUTES.resetPassword} element={<div>Reset form</div>} />
    </Routes>
  </MemoryRouter></HelmetProvider>);
  for (let i = 1; i <= 6; i++) fireEvent.change(screen.getByLabelText(`Digit ${i}`), { target: { value: String(i) } });
}

describe('OTP verification screen', () => {
  beforeEach(() => vi.resetAllMocks());

  it('stays on the OTP screen when the server rejects the code', async () => {
    mocks.post.mockRejectedValue(new Error('Incorrect OTP'));
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('Incorrect OTP'));
    expect(screen.queryByText('Reset form')).not.toBeInTheDocument();
    expect(screen.getByText('Enter verification code')).toBeInTheDocument();
  });

  it('waits for server verification before opening the reset form', async () => {
    let resolve;
    mocks.post.mockReturnValue(new Promise((done) => { resolve = done; }));
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.queryByText('Reset form')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resend' })).toBeDisabled();
    expect(mocks.post).toHaveBeenCalledWith('/auth/otp/check', { email: 'test@example.com', code: '123456' });
    resolve({ data: { data: { verified: true } } });
    expect(await screen.findByText('Reset form')).toBeInTheDocument();
  });

  it('keeps six input boxes when pasting a partial code', () => {
    setup();
    fireEvent.paste(screen.getByLabelText('Digit 1'), { clipboardData: { getData: () => '12' } });
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(mocks.post).not.toHaveBeenCalled();
  });
});
