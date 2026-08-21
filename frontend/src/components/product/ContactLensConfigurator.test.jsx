import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContactLensConfigurator, getPowerColumns } from './ContactLensConfigurator';

describe('contact lens power choices', () => {
  it('builds negative and positive spherical choices from its own limits', () => {
    expect(getPowerColumns({ min: -0.5, max: 0.5, step: 0.25 })).toEqual({
      negative: ['-0.50', '-0.25'],
      positive: ['0.00', '+0.25', '+0.50'],
    });
  });

  it('supports integer-only ranges such as an axis power type', () => {
    const choices = getPowerColumns({ min: 0, max: 180, step: 1 });

    expect(choices.negative).toEqual([]);
    expect(choices.positive).toHaveLength(181);
    expect(choices.positive[0]).toBe('0');
    expect(choices.positive.at(-1)).toBe('+180');
  });

  it('opens each configured power type with its own customer choices', () => {
    render(
      <ContactLensConfigurator
        product={{
          _id: 'contact-1',
          price: 500,
          contactLens: {
            kind: 'clear',
            powerModes: ['with-power'],
            powerTypes: [
              { name: 'Spherical', min: -3, max: 3, step: 0.25 },
              { name: 'Cylindrical', min: -6, max: 0, step: 0.25 },
              { name: 'Axis', min: 0, max: 180, step: 1 },
            ],
          },
        }}
        onChange={vi.fn()}
        onGalleryImages={vi.fn()}
      />
    );

    expect(screen.getByText('Spherical')).toBeInTheDocument();
    expect(screen.getByText('Cylindrical')).toBeInTheDocument();
    expect(screen.queryByText(/Upload prescription/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Submit power later/i)).not.toBeInTheDocument();
    const axisRow = screen.getByText('Axis').parentElement;
    fireEvent.click(within(axisRow).getAllByRole('button')[0]);

    expect(screen.getByRole('dialog', { name: /Axis · Right eye/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+180' })).toBeInTheDocument();
  });

  it('emits an incomplete powered selection until every value for a selected eye is filled', () => {
    const onChange = vi.fn();
    render(
      <ContactLensConfigurator
        product={{
          _id: 'contact-completeness',
          price: 500,
          contactLens: {
            kind: 'clear',
            powerModes: ['with-power'],
            powerTypes: [
              { name: 'Spherical', min: 0, max: 0, step: 0.25 },
              { name: 'Axis', min: 0, max: 0, step: 1 },
            ],
          },
        }}
        onChange={onChange}
        onGalleryImages={vi.fn()}
      />
    );

    expect(onChange.mock.calls.at(-1)[0].isComplete).toBe(false);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Left' }));

    const sphericalRow = screen.getByText('Spherical').parentElement;
    fireEvent.click(within(sphericalRow).getAllByRole('button')[0]);
    fireEvent.click(screen.getByRole('button', { name: '0.00' }));
    expect(onChange.mock.calls.at(-1)[0].isComplete).toBe(false);

    const axisRow = screen.getByText('Axis').parentElement;
    fireEvent.click(within(axisRow).getAllByRole('button')[0]);
    fireEvent.click(screen.getByRole('button', { name: '0' }));

    const selection = onChange.mock.calls.at(-1)[0];
    expect(selection.isComplete).toBe(true);
    expect(selection.prescription.values).toEqual({
      'Spherical:Right eye': '0.00',
      'Axis:Right eye': '0',
    });
    expect(Object.keys(selection.prescription.values).some((key) => key.includes('Left eye'))).toBe(false);
  });

  it('requires at least one selected eye for powered contacts', () => {
    const onChange = vi.fn();
    render(
      <ContactLensConfigurator
        product={{
          _id: 'contact-eyes',
          price: 500,
          contactLens: {
            kind: 'clear',
            powerModes: ['with-power'],
            powerTypes: [{ name: 'Spherical', min: 0, max: 0, step: 0.25 }],
          },
        }}
        onChange={onChange}
        onGalleryImages={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Right' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Left' }));
    expect(onChange.mock.calls.at(-1)[0].isComplete).toBe(false);
  });

  it('visibly summarizes and emits the selected contact colour', () => {
    const onChange = vi.fn();
    render(
      <ContactLensConfigurator
        product={{
          _id: 'contact-colour',
          price: 500,
          contactLens: {
            kind: 'color',
            powerModes: ['zero-power'],
            availableColors: [
              { name: 'Ocean Blue', hex: '#3B82F6' },
              { name: 'Warm Brown', hex: '#92400E' },
            ],
          },
        }}
        onChange={onChange}
        onGalleryImages={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Warm Brown/i }));
    expect(screen.getByText('Warm Brown', { selector: 'span' })).toBeInTheDocument();
    expect(onChange.mock.calls.at(-1)[0]).toMatchObject({ colour: 'Warm Brown', isComplete: true });
  });

  it('treats solutions and accessories as complete non-prescription selections', () => {
    const onChange = vi.fn();
    render(
      <ContactLensConfigurator
        product={{
          _id: 'solution-1',
          price: 300,
          contactLens: {
            kind: 'solution',
            powerModes: ['with-power'],
            packOptions: [{ label: '120 ml', price: 300 }],
          },
        }}
        onChange={onChange}
        onGalleryImages={vi.fn()}
      />
    );

    expect(screen.queryByText('Enter power manually')).not.toBeInTheDocument();
    expect(onChange.mock.calls.at(-1)[0]).toMatchObject({
      type: 'contact-solution-zero-power-0-0',
      isComplete: true,
      prescription: undefined,
    });
  });
});
