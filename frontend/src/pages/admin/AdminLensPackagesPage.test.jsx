import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminLensPackagesPage from './AdminLensPackagesPage';
import { DEFAULT_FRAME_LENSES } from '@/lib/frameLenses';
const mocks = vi.hoisted(() => ({ save: vi.fn(), data: null }));
vi.mock('@/features/admin/adminApi', () => ({
 useGetSettingsQuery: () => ({ data: mocks.data }),
 useUpdateSettingsMutation: () => [mocks.save, { isLoading: false }],
}));
vi.mock('@/contexts/ToastContext', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));
describe('dedicated lens package editor', () => {
 it('creates a full package, edits details and deletes without changing other settings', async () => {
  mocks.data = { frameLensConfiguration: structuredClone(DEFAULT_FRAME_LENSES) };
  mocks.save.mockImplementation(payload => ({ unwrap: async () => { mocks.data = payload; } }));
  render(<AdminLensPackagesPage />);
  fireEvent.click(screen.getByRole('button',{name:'Add Lens Package'}));
  let modal = within(screen.getByRole('dialog'));
  fireEvent.change(modal.getByLabelText(/Package ID/),{target:{value:'custom-package'}});
  fireEvent.change(modal.getByLabelText(/Package name/),{target:{value:'Custom Package'}});
  fireEvent.change(modal.getByLabelText('Ribbon text'),{target:{value:'Free Lenses'}});
  fireEvent.change(modal.getByLabelText('Ribbon color'),{target:{value:'blue'}});
  fireEvent.change(modal.getByLabelText('Warranty'),{target:{value:'1 Year Warranty'}});
  fireEvent.change(modal.getByLabelText('Original MRP (lens extra)'),{target:{value:'500'}});
  fireEvent.change(modal.getByLabelText('Coupon tag text'),{target:{value:'Coupon : SINGLE'}});
  fireEvent.click(modal.getByRole('button',{name:'Add feature'}));
  fireEvent.change(modal.getByLabelText(/Feature 1/),{target:{value:'Scratch Resistant'}});
  fireEvent.change(modal.getByLabelText('Icon 1'),{target:{value:'🛡️'}});
  fireEvent.click(modal.getByRole('button',{name:'Save package'}));
  await waitFor(()=>expect(mocks.save).toHaveBeenCalledOnce());
  expect(mocks.data.frameLensConfiguration.packages.at(-1)).toMatchObject({id:'custom-package',ribbonColor:'blue',warranty:'1 Year Warranty',mrp:500,featureIcons:['🛡️']});
  expect(mocks.data.frameLensConfiguration.powerTypes).toEqual(DEFAULT_FRAME_LENSES.powerTypes);
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole('button',{name:'Edit Custom Package'}));
  modal = within(screen.getByRole('dialog'));
  expect(modal.getByLabelText(/Package ID/)).toBeDisabled();
  fireEvent.change(modal.getByLabelText(/Package name/),{target:{value:'Updated Package'}});
  fireEvent.click(modal.getByRole('button',{name:'Save package'}));
  await waitFor(()=>expect(mocks.save).toHaveBeenCalledTimes(2));
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  const confirm = vi.spyOn(window,'confirm').mockReturnValue(true);
  fireEvent.click(screen.getByRole('button',{name:'Delete Updated Package'}));
  await waitFor(()=>expect(mocks.save).toHaveBeenCalledTimes(3));
  expect(mocks.data.frameLensConfiguration.packages.some(p=>p.id==='custom-package')).toBe(false);
  confirm.mockRestore();
 });
});
