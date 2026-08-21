import { describe, expect, it } from 'vitest';
import { lensConfigurationKey, prescriptionEntries } from './lensSelection';

describe('lens selection helpers', () => {
  it('normalizes configured and legacy prescription values', () => {
    expect(prescriptionEntries({ values: { 'Right eye · SPH': '-1.00', PD: '62' } })).toEqual([
      { label: 'PD', value: '62' },
      { label: 'Right eye · SPH', value: '-1.00' },
    ]);
    expect(prescriptionEntries({ rightEye: { sph: '-1.00' }, leftEye: { cyl: '-0.50' }, pd: '62' })).toHaveLength(3);
  });

  it('separates otherwise identical cart lines with different prescriptions', () => {
    const base = { lensOption: { baseType: 'single-vision', packageId: 'anti-glare' } };
    const first = lensConfigurationKey({ ...base, prescription: { values: { 'Right eye · SPH': '-1.00' } } });
    const second = lensConfigurationKey({ ...base, prescription: { values: { 'Right eye · SPH': '-2.00' } } });

    expect(first).not.toBe(second);
  });

  it('separates uploaded prescription attachments', () => {
    const base = { lensOption: { baseType: 'single-vision', packageId: 'anti-glare' } };
    const first = lensConfigurationKey({ ...base, prescription: { method: 'upload', fileName: 'rx.pdf', mimeType: 'application/pdf', fileData: 'data:application/pdf;base64,YQ==' } });
    const second = lensConfigurationKey({ ...base, prescription: { method: 'upload', fileName: 'rx.pdf', mimeType: 'application/pdf', fileData: 'data:application/pdf;base64,Yg==' } });

    expect(first).not.toBe(second);
  });

  it('separates contact selections by full type and colour', () => {
    const blue = lensConfigurationKey({
      lensOption: { type: 'contact-color-zero-power-0-0', baseType: 'zero-power', packageId: 'contact-0', colour: 'Ocean Blue' },
    });
    const brown = lensConfigurationKey({
      lensOption: { type: 'contact-color-zero-power-0-1', baseType: 'zero-power', packageId: 'contact-0', colour: 'Warm Brown' },
    });

    expect(blue).not.toBe(brown);
  });
});
