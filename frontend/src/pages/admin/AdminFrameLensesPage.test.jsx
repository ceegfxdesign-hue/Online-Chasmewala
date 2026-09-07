import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminFrameLensesPage from './AdminFrameLensesPage';
import { LensSelectionDrawer } from '@/components/product/LensSelectionDrawer';
import { DEFAULT_FRAME_LENSES } from '@/lib/frameLenses';
const mocks = vi.hoisted(() => ({ save: vi.fn(), data: null }));
vi.mock('@/features/admin/adminApi', () => ({
 useGetSettingsQuery: () => ({ data: mocks.data }),
 useUpdateSettingsMutation: () => [mocks.save, { isLoading: false }],
}));
vi.mock('@/contexts/ToastContext', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));
describe('frame lens admin', () => {
 it('saves five sections and the edited label renders in the customer drawer', async () => {
  mocks.data = { frameLensConfiguration: structuredClone(DEFAULT_FRAME_LENSES) };
  mocks.save.mockImplementation(() => ({ unwrap: () => Promise.resolve({}) }));
  const view = render(<AdminFrameLensesPage />);
  fireEvent.change(screen.getAllByLabelText(/Customer label/)[0], { target: { value: 'Personalized power' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save lens configuration' }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
  const saved = mocks.save.mock.calls[0][0].frameLensConfiguration;
  expect(saved.packageCategories).toHaveLength(5);
  expect(saved.powerTypes[0].draftKey).toBeUndefined();
  expect(saved.prescriptionFields[0].fieldType).toBe('dropdown');
  view.unmount();
  render(<LensSelectionDrawer open configuration={saved} onClose={vi.fn()} onComplete={vi.fn()} />);
  expect(screen.getByRole('button', { name: /Personalized power/ })).toBeInTheDocument();
 });
});
