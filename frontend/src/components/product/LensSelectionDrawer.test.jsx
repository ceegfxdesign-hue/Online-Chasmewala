import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LensSelectionDrawer } from './LensSelectionDrawer';
import { DEFAULT_FRAME_LENSES, normalizeFrameLenses, powerChoices } from '@/lib/frameLenses';
vi.mock('@/contexts/ToastContext', () => ({ useToast: () => ({ error: vi.fn() }) }));
const setup = (configuration) => {
 const onComplete = vi.fn(), onClose = vi.fn();
 render(<LensSelectionDrawer open onClose={onClose} onComplete={onComplete} configuration={configuration} framePrice={2000}/>);
 return {onComplete,onClose};
};
const click = async name => fireEvent.click(await screen.findByRole('button',{name}));
describe('frame lens wizard',()=>{
 it('auto advances, filters packages, totals prices and completes with later prescription',async()=>{
  const {onComplete,onClose}=setup();
  await click(/With Power/);
  await click('Thin');
  expect(screen.queryByRole('button',{name:/Anti-Glare Premium/})).not.toBeInTheDocument();
  await click(/BLU Thin/);
  expect(screen.getByText(/Total:/)).toHaveTextContent('3,200');
  await click('Continue');
  await screen.findByRole('button',{name:/Submit power later/});
  await click('Add to Cart');
  expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({lensOption:expect.objectContaining({baseType:'single-vision',packageId:'blu-thin',price:1200}),prescription:{method:'later'}}));
  expect(onClose).toHaveBeenCalled();
 });
 it('uses custom fields, validates required values and preserves both eyes',async()=>{
  const config=normalizeFrameLenses();
  config.powerTypes[0].label='Custom power';
  config.prescriptionFields=[{key:'custom',label:'Custom',fieldType:'dropdown',min:0,max:1,step:.5,scope:'per-eye',required:true,isActive:true,powerTypes:[]}];
  const {onComplete}=setup(config);
  await click(/Custom power/); await click(/Anti-Glare Premium/);await click('Continue');await click(/Enter power manually/);
  expect(screen.getByRole('button',{name:'Add to Cart'})).toBeDisabled();
  const fields=screen.getAllByLabelText(/Custom/);
  fields.forEach(field=>fireEvent.change(field,{target:{value:'0.5'}}));
  await click('Add to Cart');
  expect(onComplete.mock.calls[0][0].prescription.values).toEqual({'rightEye:custom':'0.5','leftEye:custom':'0.5'});
 });
 it('allows frame only without a package or prescription',async()=>{
  const {onComplete}=setup();
  await click(/Frame Only/);
  await screen.findByText('No prescription needed for this selection');
  await click('Add to Cart');
  expect(onComplete.mock.calls[0][0].lensOption.baseType).toBe('frame-only');
  expect(onComplete.mock.calls[0][0].prescription).toBeUndefined();
 });
 it('reads and retains an uploaded prescription',async()=>{
  const {onComplete}=setup();
  await click(/With Power/);await click(/Anti-Glare Premium/);await click('Continue');await click(/^Upload prescription/);
  fireEvent.change(screen.getByLabelText('Upload prescription file'),{target:{files:[new File(['sample'],'eye.pdf',{type:'application/pdf'})]}});
  await waitFor(()=>expect(screen.getByRole('button',{name:'Add to Cart'})).toBeEnabled());
  await click('Add to Cart');
  expect(onComplete.mock.calls[0][0].prescription.fileData).toMatch(/^data:application\/pdf;base64,/);
 });
 it('generates inclusive quarter-power values and preserves empty configuration lists',()=>{
  expect(powerChoices(DEFAULT_FRAME_LENSES.prescriptionFields[0])).toHaveLength(161);
  expect(normalizeFrameLenses({packages:[]}).packages).toEqual([]);
 });
});
