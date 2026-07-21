import { describe, expect, it } from 'vitest';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from './images';

describe('image helpers', () => {
  const seededImage = 'https://picsum.photos/seed/frame-01/900/900';

  it('requests a smaller version of seeded development images', () => {
    expect(getOptimizedImageUrl(seededImage, 360)).toBe('https://picsum.photos/seed/frame-01/360/360');
  });

  it('keeps provider URLs unchanged', () => {
    const providerImage = 'https://cdn.example.com/frames/frame-01.webp';
    expect(getOptimizedImageUrl(providerImage, 360)).toBe(providerImage);
    expect(getResponsiveImageSrcSet(providerImage, [240, 360])).toBeUndefined();
  });

  it('builds width descriptors for responsive seeded images', () => {
    expect(getResponsiveImageSrcSet(seededImage, [240, 480])).toBe(
      'https://picsum.photos/seed/frame-01/240/240 240w, https://picsum.photos/seed/frame-01/480/480 480w'
    );
  });
});
