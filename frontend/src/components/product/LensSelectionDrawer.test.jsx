import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LensSelectionDrawer } from './LensSelectionDrawer';
import { DEFAULT_FRAME_LENSES, normalizeFrameLenses, powerChoices } from '@/lib/frameLenses';
vi.mock('@/contexts/ToastContext', () => ({ useToast: () => ({ error: vi.fn() }) }));
const setup = (configuration, extra = {}) => {
  const onComplete = vi.fn(),
    onClose = vi.fn();
  render(
    <LensSelectionDrawer
      open
      onClose={onClose}
      onComplete={onComplete}
      configuration={configuration}
      framePrice={2000}
      {...extra}
    />
  );
  return { onComplete, onClose };
};
const click = async (name) => fireEvent.click(await screen.findByRole('button', { name }));
describe('frame lens wizard', () => {
  it('auto advances without Step 1 footer and requires a manual prescription', async () => {
    const { onComplete, onClose } = setup();
    await click(/With Power/);
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
    await click(/High Power/);
    expect(screen.queryByRole('button', { name: /Anti-Glare Premium/ })).not.toBeInTheDocument();
    await click('Select BLU Thin');
    expect(screen.getByText(/Total:/)).toHaveTextContent('3,200');

    await screen.findByRole('button', { name: /Enter power manually/ });
    expect(screen.queryByText(/Submit power later/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
    screen
      .getAllByLabelText(/SPH/)
      .forEach((field) => fireEvent.change(field, { target: { value: '0' } }));
    fireEvent.change(screen.getByLabelText(/PD/), { target: { value: '60' } });
    await click('Add to Cart');
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        lensOption: expect.objectContaining({
          baseType: 'single-vision',
          packageId: 'blu-thin',
          price: 1200,
        }),
        prescription: expect.objectContaining({ method: 'manual' }),
      })
    );
    expect(onClose).toHaveBeenCalled();
  });
  it('uses custom fields, validates required values and preserves both eyes', async () => {
    const config = normalizeFrameLenses();
    config.powerTypes[0].label = 'Custom power';
    config.prescriptionFields = [
      {
        key: 'custom',
        label: 'Custom',
        fieldType: 'dropdown',
        min: 0,
        max: 1,
        step: 0.5,
        scope: 'per-eye',
        required: true,
        isActive: true,
        powerTypes: [],
      },
    ];
    const { onComplete } = setup(config);
    await click(/Custom power/);
    await click('Select Anti-Glare Premium');
    await click(/Enter power manually/);
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
    const fields = screen.getAllByLabelText(/Custom/);
    fields.forEach((field) => fireEvent.change(field, { target: { value: '0.5' } }));
    await click('Add to Cart');
    expect(onComplete.mock.calls[0][0].prescription.values).toEqual({
      'rightEye:custom': '0.5',
      'leftEye:custom': '0.5',
    });
  });
  it('allows frame only without a package or prescription', async () => {
    const { onComplete } = setup();
    await click(/Frame Only/);
    await screen.findByText('No prescription required for this selection.');
    await click('Add to Cart');
    expect(onComplete.mock.calls[0][0].lensOption.baseType).toBe('frame-only');
    expect(onComplete.mock.calls[0][0].prescription).toBeUndefined();
  });
  it('reads and retains an uploaded prescription', async () => {
    const { onComplete } = setup();
    await click(/With Power/);
    await click('Select Anti-Glare Premium');
    await click(/^Upload prescription/);
    fireEvent.change(screen.getByLabelText('Upload prescription file'), {
      target: { files: [new File(['sample'], 'eye.pdf', { type: 'application/pdf' })] },
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeEnabled());
    await click('Add to Cart');
    expect(onComplete.mock.calls[0][0].prescription.fileData).toMatch(
      /^data:application\/pdf;base64,/
    );
  });
  it('restricts packages per frame while empty restrictions allow all active compatible packages', async () => {
    setup(undefined, { availableLensPackages: ['blu-screen'] });
    await click(/With Power/);
    expect(
      await screen.findByRole('button', { name: 'Select BLU Screen Protection' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Select Anti-Glare Premium' })
    ).not.toBeInTheDocument();
    await click(/All/);
    expect(screen.queryByRole('button', { name: 'Select BLU Thin' })).not.toBeInTheDocument();
  });
  it('supports zero power without prescription and opens explanatory help', async () => {
    const { onComplete } = setup(undefined, { availableLensPackages: [] });
    await click(/Learn more/);
    expect(screen.getByRole('dialog', { name: 'About power types' })).toBeInTheDocument();
    await click('Close dialog');
    await click(/Zero Power/);
    await click('Select Anti-Glare Premium');
    await screen.findByText('No prescription required for this selection.');
    await click('Add to Cart');
    expect(onComplete.mock.calls[0][0].prescription).toBeUndefined();
  });
  it('does not accept a legacy submit-later selection', async () => {
    setup(undefined, { selectedPrescription: { method: 'later' } });
    await click(/With Power/);
    await click('Select Anti-Glare Premium');
    await screen.findByRole('button', { name: /Enter power manually/ });
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
  });
  it('generates inclusive quarter-power values and preserves empty configuration lists', () => {
    expect(powerChoices(DEFAULT_FRAME_LENSES.prescriptionFields[0])).toHaveLength(161);
    expect(normalizeFrameLenses({ packages: [] }).packages).toEqual([]);
  });
  it('opens package details and selects that lens into the prescription step', async () => {
    setup();
    await click(/With Power/);
    const buttons = await screen.findAllByRole('button', { name: 'View Details >' });
    fireEvent.click(buttons[0]);
    expect(await screen.findByText('Top Benefits')).toBeInTheDocument();
    await click('Select This Lens');
    expect(await screen.findByRole('button', { name: /Enter power manually/ })).toBeInTheDocument();
    expect(screen.queryByText('Top Benefits')).not.toBeInTheDocument();
  });
});
