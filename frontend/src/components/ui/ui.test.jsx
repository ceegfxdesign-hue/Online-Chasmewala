import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';
import { RatingStars } from './RatingStars';
import { Pagination } from './Pagination';
import { Checkbox } from './Checkbox';
import { Breadcrumb } from './Breadcrumb';
import { Tabs } from './Tabs';

describe('Button', () => {
  it('renders and handles clicks', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add to Cart</Button>);
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled and busy while loading', () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });
});

describe('Input', () => {
  it('associates label and shows error with aria-invalid', () => {
    render(<Input label="Email" error="Required" />);
    const field = screen.getByLabelText('Email');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge variant="success">In stock</Badge>);
    expect(screen.getByText('In stock')).toBeInTheDocument();
  });
});

describe('RatingStars', () => {
  it('exposes an accessible rating label', () => {
    render(<RatingStars value={4} count={12} />);
    expect(screen.getByLabelText(/rated 4 out of 5/i)).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });
});

describe('Pagination', () => {
  it('calls onChange with the selected page', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('Checkbox', () => {
  it('toggles checked state', () => {
    render(<Checkbox label="Remember me" />);
    const cb = screen.getByLabelText('Remember me');
    expect(cb).not.toBeChecked();
    fireEvent.click(cb);
    expect(cb).toBeChecked();
  });
});

describe('Breadcrumb', () => {
  it('marks the last item as current page', () => {
    render(
      <MemoryRouter>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Eyeglasses' }]} />
      </MemoryRouter>
    );
    expect(screen.getByText('Eyeglasses')).toHaveAttribute('aria-current', 'page');
  });
});

describe('Tabs', () => {
  it('switches panels on tab click', () => {
    render(
      <Tabs
        items={[
          { key: 'a', label: 'Specs', content: <p>Spec content</p> },
          { key: 'b', label: 'Reviews', content: <p>Review content</p> },
        ]}
      />
    );
    expect(screen.getByText('Spec content')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Reviews' }));
    expect(screen.getByText('Review content')).toBeInTheDocument();
  });
});
