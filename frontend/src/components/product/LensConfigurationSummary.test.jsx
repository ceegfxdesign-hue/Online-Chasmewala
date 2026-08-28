import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LensConfigurationSummary } from './LensConfigurationSummary';

describe('LensConfigurationSummary', () => {
  it('shows the selected mode, package, and every filled prescription value', () => {
    render(
      <LensConfigurationSummary
        lensOption={{ powerTypeLabel: 'With Power', packageName: 'Anti-Glare Premium', colour: 'Ocean Blue', price: 500 }}
        prescription={{ values: { 'Right eye · SPH': '-1.00', 'Left eye · SPH': '-1.25', PD: '62' } }}
        showPrice
      />
    );

    expect(screen.getByText('With Power · Anti-Glare Premium')).toBeInTheDocument();
    expect(screen.getByText('Right eye · SPH')).toBeInTheDocument();
    expect(screen.getByText('-1.00')).toBeInTheDocument();
    expect(screen.getByText('Left eye · SPH')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText('Ocean Blue')).toBeInTheDocument();
    expect(screen.getByText('+₹500')).toBeInTheDocument();
  });

  it('does not duplicate a legacy combined lens label', () => {
    render(
      <LensConfigurationSummary
        lensOption={{ baseType: 'single-vision', label: 'With Power · Anti-Glare Premium' }}
      />
    );

    expect(screen.getByText('With Power · Anti-Glare Premium')).toBeInTheDocument();
    expect(screen.queryByText(/single-vision · With Power/)).not.toBeInTheDocument();
  });
});
