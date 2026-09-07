import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductEditorModal } from './ProductEditorModal';
vi.mock('@/contexts/ToastContext', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));
describe('per-frame lens packages', () => {
 it('restores package checkboxes and submits the selected IDs and empty fallback', async () => {
  const save = vi.fn().mockResolvedValue(undefined);
  render(<ProductEditorModal product={{_id:'frame', name:'Frame', images:['https://example.com/frame.jpg'], gender:'unisex', genders:['unisex'], category:'eyeglasses', availableLensPackages:['anti-glare']}} categories={[{_id:'eyeglasses',name:'Eyeglasses',slug:'eyeglasses'}]} brands={[]} onClose={vi.fn()} onSave={save} lensPackages={[{id:'anti-glare',name:'Anti-Glare Premium'},{id:'blu-screen',name:'BLU Screen'}]}/>);
  expect(screen.getByLabelText('Anti-Glare Premium')).toBeChecked();
  fireEvent.click(screen.getByLabelText('BLU Screen'));
  fireEvent.submit(screen.getByRole('button',{name:'Save product'}).closest('form'));
  await waitFor(()=>expect(save).toHaveBeenCalledOnce());
  expect(save.mock.calls[0][0].availableLensPackages).toEqual(['anti-glare','blu-screen']);
  fireEvent.click(screen.getByLabelText('Anti-Glare Premium'));
  fireEvent.click(screen.getByLabelText('BLU Screen'));
  fireEvent.submit(screen.getByRole('button',{name:'Save product'}).closest('form'));
  await waitFor(()=>expect(save).toHaveBeenCalledTimes(2));
  expect(save.mock.calls[1][0].availableLensPackages).toEqual([]);
 });
});
