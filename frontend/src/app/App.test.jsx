import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi } from 'vitest';

// Stub the API layer so App bootstrap doesn't hit the network during the test.
vi.mock('@/services/api', () => ({
  api: { post: vi.fn(() => Promise.reject(new Error('no network'))), get: vi.fn() },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
  setAuthClearedHandler: vi.fn(),
  normalizeError: (e) => ({ message: e.message }),
}));

import App from './App';

describe('App', () => {
  it('renders the routed home page with brand and catalog hero', async () => {
    render(
      <HelmetProvider>
        <App />
      </HelmetProvider>
    );
    // Home is lazy-loaded; allow extra time for the chunk to resolve in CI.
    expect(await screen.findByText(/Trending style catalog/i, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getAllByText(/Online Chasmewala/i).length).toBeGreaterThan(0);
  });
});
