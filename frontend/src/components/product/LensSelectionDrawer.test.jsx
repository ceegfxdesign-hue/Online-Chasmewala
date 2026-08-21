import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buildPowerChoices, LensSelectionDrawer } from './LensSelectionDrawer';

const OPTIONS = [
  {
    type: 'with-power',
    label: 'With Power',
    subtitle: 'Positive, negative or cylindrical',
    badge: 'Most common',
    requiresPrescription: true,
    price: 100,
    isActive: true,
  },
  {
    type: 'zero-power',
    label: 'Zero Power',
    subtitle: 'No prescription needed',
    requiresPrescription: false,
    price: 0,
    isActive: true,
  },
  {
    type: 'frame-only',
    label: 'Frame Only',
    subtitle: 'With no lenses',
    requiresPrescription: false,
    price: 0,
    isActive: true,
  },
  {
    type: 'hidden',
    label: 'Hidden mode',
    requiresPrescription: false,
    isActive: false,
  },
];

const PACKAGES = [
  {
    id: 'universal',
    name: 'Universal Clear',
    description: 'For every power type',
    badge: 'Included',
    features: ['Anti-glare'],
    warrantyMonths: 6,
    price: 0,
    mrp: 0,
    tags: ['Bestsellers'],
    powerTypes: ['all'],
    isActive: true,
  },
  {
    id: 'powered',
    name: 'Powered Premium',
    description: 'Only for powered lenses',
    features: ['High-index material'],
    warrantyMonths: 12,
    price: 400,
    mrp: 650,
    tags: ['High power'],
    powerTypes: ['with-power'],
    isActive: true,
  },
  {
    id: 'multi-mode',
    name: 'Screen Comfort',
    description: 'Available for more than one mode',
    features: ['Blue-light filtering'],
    warrantyMonths: 12,
    price: 250,
    mrp: 500,
    tags: ['Work friendly'],
    powerTypes: ['zero-power', 'progressive'],
    isActive: true,
  },
  {
    id: 'inactive',
    name: 'Inactive package',
    price: 0,
    powerTypes: ['all'],
    isActive: false,
  },
];

const FIELDS = [
  {
    key: 'sph',
    label: 'SPH',
    min: -1,
    max: 1,
    step: 0.5,
    scope: 'per-eye',
    required: true,
    powerTypes: ['with-power'],
    isActive: true,
  },
  {
    key: 'pd',
    label: 'PD',
    min: 60,
    max: 62,
    step: 1,
    scope: 'shared',
    required: true,
    powerTypes: ['all'],
    isActive: true,
  },
];

function renderDrawer(overrides = {}) {
  const props = {
    open: true,
    onClose: vi.fn(),
    options: OPTIONS,
    packages: PACKAGES,
    prescriptionFields: FIELDS,
    onComplete: vi.fn(),
    ...overrides,
  };
  render(<LensSelectionDrawer {...props} />);
  return props;
}

function continueToPackages() {
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
}

function continueToPower() {
  continueToPackages();
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
}

describe('LensSelectionDrawer', () => {
  it('builds inclusive decimal power choices without floating-point drift', () => {
    expect(buildPowerChoices({ min: -0.5, max: 0.5, step: 0.25 })).toEqual([
      '-0.50',
      '-0.25',
      '0.00',
      '+0.25',
      '+0.50',
    ]);
  });

  it('shows All packages and packages assigned to multiple selected power types', () => {
    renderDrawer();
    fireEvent.click(screen.getByRole('button', { name: /Zero Power/i }));
    continueToPackages();

    expect(screen.getByRole('button', { name: /Universal Clear/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Screen Comfort/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Powered Premium/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Inactive package')).not.toBeInTheDocument();
  });

  it('filters package cards with tag pills and restores all cards', () => {
    renderDrawer();
    continueToPackages();

    expect(screen.getByRole('button', { name: /Universal Clear/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Powered Premium/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'High power' }));
    expect(screen.queryByRole('button', { name: /Universal Clear/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Powered Premium/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByRole('button', { name: /Universal Clear/i })).toBeInTheDocument();
  });

  it('shows the combined power-mode and package surcharge on package cards', () => {
    renderDrawer();
    continueToPackages();

    const poweredPackage = screen.getByRole('button', { name: /Powered Premium/i });
    expect(within(poweredPackage).getByText('Add ₹500')).toBeInTheDocument();
    expect(within(poweredPackage).getByText('₹750')).toBeInTheDocument();
  });

  it('offers admin-generated manual fields and upload, without submit later', () => {
    renderDrawer();
    continueToPower();

    expect(screen.queryByText(/Submit power later/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter your eye power/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Upload prescription/i })).toBeInTheDocument();

    const rightSph = screen.getByLabelText(/Right eye · SPH/);
    const leftSph = screen.getByLabelText(/Left eye · SPH/);
    expect(rightSph).toBeInTheDocument();
    expect(leftSph).toBeInTheDocument();
    expect(within(rightSph).getAllByRole('option').map((option) => option.value)).toEqual([
      '-1.0',
      '-0.5',
      '0.0',
      '+0.5',
      '+1.0',
    ]);
  });

  it('uploads a prescription and completes with its attachment snapshot', async () => {
    const { onComplete } = renderDrawer();
    continueToPower();
    fireEvent.click(screen.getByRole('button', { name: /Upload prescription/i }));

    const file = new File(['prescription'], 'eye-power.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Upload prescription file'), { target: { files: [file] } });
    expect(await screen.findByText('eye-power.pdf')).toBeInTheDocument();

    const finish = screen.getByRole('button', { name: 'Use these lenses' });
    expect(finish).toBeEnabled();
    fireEvent.click(finish);
    expect(onComplete.mock.calls[0][0].prescription).toMatchObject({
      method: 'upload',
      fileName: 'eye-power.pdf',
      mimeType: 'application/pdf',
    });
    expect(onComplete.mock.calls[0][0].prescription.fileData).toMatch(/^data:application\/pdf;base64,/);
  });

  it('requires configured fields and completes with clean lens and prescription snapshots', () => {
    const { onComplete, onClose } = renderDrawer();
    continueToPackages();
    fireEvent.click(screen.getByRole('button', { name: /Powered Premium/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    const finish = screen.getByRole('button', { name: 'Use these lenses' });
    expect(finish).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Complete all required power values');

    fireEvent.change(screen.getByLabelText(/Right eye · SPH/), { target: { value: '-1.0' } });
    fireEvent.change(screen.getByLabelText(/Left eye · SPH/), { target: { value: '-0.5' } });
    fireEvent.change(screen.getByLabelText(/PD/), { target: { value: '62' } });
    expect(finish).toBeEnabled();
    fireEvent.click(finish);

    expect(onComplete).toHaveBeenCalledWith({
      lensOption: {
        type: 'with-power:powered',
        baseType: 'with-power',
        powerTypeLabel: 'With Power',
        packageId: 'powered',
        packageName: 'Powered Premium',
        label: 'With Power · Powered Premium',
        subtitle: 'Only for powered lenses',
        price: 500,
        mrp: 750,
        badge: 'Most common',
        image: '',
        features: ['High-index material'],
        warrantyMonths: 12,
        tags: ['High power'],
      },
      prescription: {
        method: 'manual',
        values: {
          'Right eye · SPH': '-1.0',
          'Left eye · SPH': '-0.5',
          PD: '62',
        },
      },
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('restores an edited package and both flat and legacy prescription values', () => {
    renderDrawer({
      selectedOption: { baseType: 'with-power', packageId: 'powered' },
      selectedPrescription: {
        method: 'manual',
        values: {
          'Right eye · SPH': '+0.5',
          leftEye: { sph: '-0.5' },
          pd: 61,
        },
      },
    });
    continueToPackages();
    expect(screen.getByRole('button', { name: /Powered Premium/i })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByLabelText(/Right eye · SPH/)).toHaveValue('+0.5');
    expect(screen.getByLabelText(/Left eye · SPH/)).toHaveValue('-0.5');
    expect(screen.getByLabelText(/PD/)).toHaveValue('61');
  });

  it('finishes a no-prescription mode without power inputs', () => {
    const { onComplete } = renderDrawer();
    fireEvent.click(screen.getByRole('button', { name: /Zero Power/i }));
    continueToPackages();
    fireEvent.click(screen.getByRole('button', { name: /Screen Comfort/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText(/No prescription is needed for Zero Power/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Use these lenses' }));
    expect(onComplete.mock.calls[0][0].prescription).toBeUndefined();
  });

  it('completes frame-only without requiring or snapshotting a lens package', () => {
    // The universal package includes `all`; Frame Only must still bypass it.
    const { onComplete } = renderDrawer();
    fireEvent.click(screen.getByRole('button', { name: /Frame Only/i }));
    continueToPackages();

    expect(screen.getByText('No lens package needed')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText(/No prescription is needed for Frame Only/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Use these lenses' }));

    const completed = onComplete.mock.calls[0][0];
    expect(completed.lensOption).toMatchObject({
      type: 'frame-only',
      baseType: 'frame-only',
      powerTypeLabel: 'Frame Only',
      label: 'Frame Only',
      price: 0,
    });
    expect(completed.lensOption).not.toHaveProperty('packageId');
    expect(completed.prescription).toBeUndefined();
  });

  it('includes required per-eye ADD fields in the progressive fallback', () => {
    renderDrawer({
      options: [{ type: 'progressive', label: 'Progressive', requiresPrescription: true, price: 1200 }],
      packages: undefined,
      prescriptionFields: undefined,
    });
    continueToPower();

    expect(screen.getByLabelText(/Right eye · ADD/)).toBeRequired();
    expect(screen.getByLabelText(/Left eye · ADD/)).toBeRequired();
  });

  it('does not complete a powered mode when no active field applies to it', () => {
    renderDrawer({
      prescriptionFields: [{ ...FIELDS[1], powerTypes: ['zero-power'] }],
    });
    continueToPower();

    expect(screen.getByText('No prescription fields are configured for this power type.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use these lenses' })).toBeDisabled();
  });

  it('requires at least one entered value when every applicable field is optional', () => {
    renderDrawer({
      prescriptionFields: [{ ...FIELDS[0], required: false }],
    });
    continueToPower();

    const finish = screen.getByRole('button', { name: 'Use these lenses' });
    expect(finish).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Right eye · SPH'), { target: { value: '0.0' } });
    expect(finish).toBeEnabled();
  });
});
