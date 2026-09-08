import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ContactPage from './ContactPage';

const mocks = vi.hoisted(() => ({ post: vi.fn(), error: vi.fn(), success: vi.fn() }));
vi.mock('@/services/api', () => ({ api: { post: mocks.post }, normalizeError: (error) => error }));
vi.mock('@/contexts/ToastContext', () => ({ useToast: () => mocks }));
vi.mock('@/components/common/ContentPage', () => ({ ContentPage: ({ children }) => <div>{children}</div> }));

function fillForm() {
  render(<ContactPage />);
  for (const [label, value] of [['Name', 'Visitor'], ['Email', 'visitor@example.com'], ['Subject', 'Order help'], ['Message', 'Please help with my order.'], ['Phone (optional)', '1234567890']]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
}
describe('Contact form delivery', () => {
  beforeEach(() => vi.resetAllMocks());
  it('sends the inquiry and clears the form only after success', async () => {
    mocks.post.mockResolvedValue({ data: { message: 'Your inquiry has been sent.' } });
    fillForm();
    await waitFor(() => expect(mocks.success).toHaveBeenCalledWith('Your inquiry has been sent.'));
    expect(mocks.post).toHaveBeenCalledWith('/contact', expect.objectContaining({ email: 'visitor@example.com', phone: '1234567890' }));
    expect(screen.getByLabelText('Message')).toHaveValue('');
  });
  it('preserves the message when delivery fails', async () => {
    mocks.post.mockRejectedValue(new Error('Unable to send your inquiry'));
    fillForm();
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('Unable to send your inquiry'));
    expect(screen.getByLabelText('Message')).toHaveValue('Please help with my order.');
    expect(mocks.success).not.toHaveBeenCalled();
  });
});
