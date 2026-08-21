import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '@/contexts/ToastContext';
import { ProductEditorModal } from './ProductEditorModal';

const EYEGLASSES_CATEGORY = { _id: '507f1f77bcf86cd799439012', name: 'Eyeglasses', slug: 'eyeglasses' };
const BRAND = { _id: '507f1f77bcf86cd799439013', name: 'Test Brand' };

const makeEyeglassProduct = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439014',
  name: 'Classic Frame',
  sku: 'CLASSIC-1',
  category: EYEGLASSES_CATEGORY,
  brand: BRAND,
  price: 1200,
  mrp: 1800,
  stock: 10,
  description: 'A complete eyeglass frame for editor testing.',
  images: ['https://example.com/frame.jpg'],
  genders: ['unisex'],
  lensOptions: [
    { type: 'single-vision', label: 'With Power', requiresPrescription: true, isActive: true, price: 0 },
    { type: 'zero-power', label: 'Zero Power', requiresPrescription: false, isActive: true, price: 0 },
  ],
  lensPackages: [],
  lensPrescriptionFields: [],
  ...overrides,
});

const makeConfiguredEyeglassProduct = (overrides = {}) => makeEyeglassProduct({
  lensPackages: [{
    id: 'standard',
    name: 'Standard',
    price: 0,
    mrp: 0,
    powerTypes: ['all'],
    isActive: true,
  }],
  lensPrescriptionFields: [{
    key: 'sph',
    label: 'SPH',
    min: -10,
    max: 10,
    step: 0.25,
    scope: 'per-eye',
    powerTypes: ['single-vision'],
    isActive: true,
  }],
  ...overrides,
});

function editorElement(product, onSave, onClose = vi.fn()) {
  return (
    <ToastProvider>
      <ProductEditorModal
        product={product}
        categories={[EYEGLASSES_CATEGORY]}
        brands={[BRAND]}
        onClose={onClose}
        onSave={onSave}
      />
    </ToastProvider>
  );
}

function renderEditor(product, onSave = vi.fn().mockResolvedValue(undefined)) {
  render(editorElement(product, onSave));
  return onSave;
}

describe('ProductEditorModal contact lens power types', () => {
  it('lets an admin add and configure more than one power type', () => {
    render(
      <ToastProvider>
        <ProductEditorModal
          product={{}}
          categories={[]}
          brands={[]}
          onClose={vi.fn()}
          onSave={vi.fn()}
          contactLensMode
          fixedCategoryId="507f1f77bcf86cd799439011"
        />
      </ToastProvider>
    );

    expect(screen.getByLabelText('Power type 1')).toHaveValue('Spherical');
    fireEvent.click(screen.getByRole('button', { name: 'Add power type' }));
    fireEvent.change(screen.getByLabelText('Power type 2'), { target: { value: 'Cylindrical' } });

    expect(screen.getByLabelText('Power type 2')).toHaveValue('Cylindrical');
    expect(screen.getAllByLabelText('Minimum')).toHaveLength(2);
    expect(screen.getAllByLabelText('Maximum')).toHaveLength(2);
    expect(screen.getAllByLabelText('Increment')).toHaveLength(2);
  });
});

describe('ProductEditorModal eyeglass lens configuration', () => {
  it('adds the recommended power-mode defaults when an eyeglasses category is selected', async () => {
    renderEditor({});

    fireEvent.change(screen.getByRole('combobox', { name: /Category/ }), { target: { value: EYEGLASSES_CATEGORY._id } });

    expect(await screen.findByLabelText('Power mode 1 name')).toHaveValue('With Power');
    expect(screen.getByRole('button', { name: 'Go to lens setup' })).toBeInTheDocument();
    expect(screen.getByLabelText('Power mode 2 name')).toHaveValue('Zero Power');
    expect(screen.getByLabelText('Power mode 3 name')).toHaveValue('Progressive/Bifocal');
    expect(screen.getAllByLabelText(/Additional price/)[2]).toHaveValue(1200);
    expect(screen.getByLabelText('Power mode 4 name')).toHaveValue('Frame Only');
    expect(screen.getByLabelText('Prescription field 5 label')).toHaveValue('ADD');
    const defaultPackageApplicability = screen.getByRole('group', { name: /lens package 1/ });
    expect(within(defaultPackageApplicability).getByRole('checkbox', { name: 'With Power' })).toBeChecked();
    expect(within(defaultPackageApplicability).getByRole('checkbox', { name: 'Zero Power' })).toBeChecked();
    expect(within(defaultPackageApplicability).getByRole('checkbox', { name: 'Progressive/Bifocal' })).toBeChecked();
    expect(within(defaultPackageApplicability).getByRole('checkbox', { name: 'Frame Only' })).not.toBeChecked();
    expect(screen.queryByLabelText('Product-type options (JSON)')).not.toBeInTheDocument();
  });

  it('normalizes existing configuration and keeps applicability linked when a mode ID is edited', async () => {
    const onSave = renderEditor(makeEyeglassProduct({
      lensPackages: [{
        id: 'anti-glare',
        name: 'Anti-Glare',
        features: ['Scratch resistant'],
        tags: ['Work Friendly'],
        price: 500,
        mrp: 700,
        powerTypes: ['single-vision', 'zero-power'],
      }],
      lensPrescriptionFields: [{
        key: 'sph',
        label: 'SPH',
        min: -10,
        max: 10,
        step: 0.25,
        scope: 'per-eye',
        powerTypes: ['single-vision'],
      }],
    }));

    fireEvent.change(await screen.findByLabelText('Power mode 1 ID'), { target: { value: 'distance-power' } });
    fireEvent.change(screen.getByLabelText('Lens package 1 name'), { target: { value: 'Premium Anti-Glare' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Save product' }).closest('form'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0];
    expect(payload.lensOptions[0]).toMatchObject({ type: 'distance-power', label: 'With Power' });
    expect(payload.lensPackages[0]).toMatchObject({
      id: 'anti-glare',
      name: 'Premium Anti-Glare',
      powerTypes: ['distance-power', 'zero-power'],
    });
    expect(payload.lensPrescriptionFields[0].powerTypes).toEqual(['distance-power']);
  });

  it('adds a lens package and allows multiple power-mode choices', async () => {
    renderEditor(makeEyeglassProduct({
      lensPackages: [{
        id: 'standard',
        name: 'Standard',
        price: 0,
        mrp: 0,
        powerTypes: ['single-vision', 'zero-power'],
      }],
      lensPrescriptionFields: [{
        key: 'sph',
        label: 'SPH',
        min: -10,
        max: 10,
        step: 0.25,
        scope: 'per-eye',
        powerTypes: ['single-vision'],
      }],
    }));

    fireEvent.click(await screen.findByRole('button', { name: 'Add lens package' }));
    fireEvent.change(screen.getByLabelText('Lens package 2 name'), { target: { value: 'Blue Screen Plus' } });

    const packageApplicability = screen.getByRole('group', { name: 'Show for — lens package 1' });
    const allModes = within(packageApplicability).getByRole('checkbox', { name: 'All power modes' });
    const withPower = within(packageApplicability).getByRole('checkbox', { name: 'With Power' });
    const zeroPower = within(packageApplicability).getByRole('checkbox', { name: 'Zero Power' });
    fireEvent.click(allModes);
    fireEvent.click(withPower);
    fireEvent.click(zeroPower);

    expect(allModes).not.toBeChecked();
    expect(withPower).toBeChecked();
    expect(zeroPower).toBeChecked();
    expect(screen.getByLabelText('Lens package 2 name')).toHaveValue('Blue Screen Plus');
  });

  it('rejects blank lens numbers instead of silently saving zero', async () => {
    const onSave = renderEditor(makeConfiguredEyeglassProduct());

    const modePrices = await screen.findAllByLabelText(/Additional price/);
    fireEvent.change(modePrices[0], { target: { value: '' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Save product' }).closest('form'));

    expect((await screen.findAllByText(/prices cannot be blank/i)).length).toBeGreaterThan(0);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('blocks an active mode that has no compatible active package', async () => {
    const onSave = renderEditor(makeConfiguredEyeglassProduct({
      lensPackages: [{
        id: 'zero-only',
        name: 'Zero Power Package',
        price: 0,
        mrp: 0,
        powerTypes: ['zero-power'],
        isActive: true,
      }],
    }));

    await screen.findByLabelText('Power mode 1 name');
    fireEvent.submit(screen.getByRole('button', { name: 'Save product' }).closest('form'));

    expect((await screen.findAllByText(/active lens package shown for With Power/i)).length).toBeGreaterThan(0);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('blocks a prescription mode that has no compatible active required field', async () => {
    const onSave = renderEditor(makeConfiguredEyeglassProduct({
      lensPrescriptionFields: [{
        key: 'sph',
        label: 'SPH',
        min: -10,
        max: 10,
        step: 0.25,
        scope: 'per-eye',
        powerTypes: ['single-vision'],
        required: false,
        isActive: true,
      }],
    }));

    await screen.findByLabelText('Power mode 1 name');
    fireEvent.submit(screen.getByRole('button', { name: 'Save product' }).closest('form'));

    expect((await screen.findAllByText(/active required prescription field used for With Power/i)).length).toBeGreaterThan(0);
    expect(onSave).not.toHaveBeenCalled();
  });
});
