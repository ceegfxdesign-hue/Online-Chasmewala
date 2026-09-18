import { useRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

function Harness({ onEscape }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [value, setValue] = useState('');
  useFocusTrap(ref, active, () => { onEscape(value); setActive(false); });
  return <>
    <button onClick={() => setActive(true)}>Open</button>
    {active && <div ref={ref} role="dialog" tabIndex={-1}>
      <button onClick={() => setActive(false)}>Close</button>
      <input aria-label="Name" value={value} onChange={(event) => setValue(event.target.value)} />
      <button disabled>Unavailable</button>
      <button>Last</button>
    </div>}
  </>;
}

describe('useFocusTrap', () => {
  it('preserves typing focus, wraps Tab, uses the latest Escape callback, and restores focus', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(<Harness onEscape={onEscape} />);
    const opener = screen.getByRole('button', { name: 'Open' });
    await user.click(opener);
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    await user.tab();
    const input = screen.getByLabelText('Name');
    await user.type(input, 'Complete name');
    expect(input).toHaveValue('Complete name');
    expect(input).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(onEscape).toHaveBeenCalledWith('Complete name');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    await user.click(opener);
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });
});
