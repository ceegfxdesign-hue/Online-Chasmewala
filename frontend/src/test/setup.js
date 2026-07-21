import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount React trees after every test to keep them isolated.
afterEach(() => {
  cleanup();
});

// jsdom lacks these browser APIs that our components rely on.

// IntersectionObserver — used by Framer Motion's whileInView.
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// matchMedia — used by useMediaQuery.
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
);

// scrollTo — used by ScrollToTop.
vi.stubGlobal('scrollTo', vi.fn());
