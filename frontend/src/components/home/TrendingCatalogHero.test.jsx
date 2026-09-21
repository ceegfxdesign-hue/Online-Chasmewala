import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TrendingCatalogHero } from './TrendingCatalogHero';

const mocks = vi.hoisted(() => ({ banners: [] }));
vi.mock('@/features/banners/bannerApi', () => ({
  useGetHeroBannersQuery: () => ({ data: mocks.banners }),
}));

function renderHero(banners) {
  mocks.banners = banners;
  return render(<MemoryRouter><TrendingCatalogHero /></MemoryRouter>);
}

describe('TrendingCatalogHero', () => {
  it('shows an admin banner as an image-only full-banner link without a fade class', () => {
    renderHero([{
      _id: 'hero-one', title: 'Autumn eyewear offer', subtitle: 'This must not render',
      ctaLabel: 'This button must not render', ctaLink: '/products?category=eyeglasses', image: '/offer.jpg',
    }]);
    const link = screen.getByRole('link', { name: 'Open banner destination: Autumn eyewear offer' });
    expect(link).toHaveAttribute('href', '/products?category=eyeglasses');
    expect(link).toContainElement(screen.getByAltText('Autumn eyewear offer'));
    expect(screen.getByAltText('Autumn eyewear offer')).not.toHaveClass('animate-catalog-pan');
    expect(screen.queryByText('This must not render')).not.toBeInTheDocument();
    expect(screen.queryByText('This button must not render')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('removes the full-image click action when the admin clears its destination', () => {
    renderHero([{ _id: 'hero-two', title: 'Unlinked banner', image: '/banner.jpg', ctaLink: '' }]);
    expect(screen.getByAltText('Unlinked banner')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Open banner destination/ })).not.toBeInTheDocument();
  });
});
