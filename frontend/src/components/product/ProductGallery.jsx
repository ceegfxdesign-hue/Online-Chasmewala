import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiRotateCw,
  FiStar,
  FiX,
  FiZoomIn,
} from 'react-icons/fi';
import { Portal } from '@/components/ui/Portal';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '@/lib/images';
import { cn } from '@/utils/cn';

/**
 * Product image gallery: thumbnail rail, main image with hover-to-zoom (desktop)
 * and a fullscreen lightbox with keyboard/next-prev navigation.
 */
export function ProductGallery({ images = [], alt, rating = 0, reviewCount = 0, onFindStore, onCompare }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState({ show: false, x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const mainRef = useRef(null);

  const safeImages = useMemo(
    () => (images.length ? images : ['https://picsum.photos/seed/oc-fallback/800/800']),
    [images]
  );
  const current = safeImages[active];

  const onMouseMove = (e) => {
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ show: true, x, y });
  };

  const step = useCallback(
    (dir) => setActive((i) => (i + dir + safeImages.length) % safeImages.length),
    [safeImages.length]
  );

  useEffect(() => {
    setActive(0);
    setIsSpinning(false);
  }, [images]);

  useEffect(() => {
    if (!isSpinning || safeImages.length < 2) return undefined;
    const interval = window.setInterval(() => step(1), 850);
    return () => window.clearInterval(interval);
  }, [isSpinning, safeImages.length, step]);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setLightbox(false);
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox, step]);

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {/* Thumbnails */}
      <div className="flex gap-2 md:flex-col">
        {safeImages.map((img, i) => (
          <button
            key={`${img}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            aria-current={i === active}
            className={cn(
              'h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-surface-subtle transition-colors',
              i === active ? 'border-brand-500' : 'border-transparent hover:border-navy-200'
            )}
          >
            <img
              src={getOptimizedImageUrl(img, 160)}
              width="160"
              height="160"
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative flex-1">
        {(rating > 0 || reviewCount > 0) && (
          <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-semibold text-navy-800 shadow-soft backdrop-blur">
            <FiStar className="h-3.5 w-3.5 fill-warning text-warning" />
            {rating.toFixed(1)}
            {reviewCount > 0 && <span className="text-navy-400">({reviewCount})</span>}
          </div>
        )}
        <div
          ref={mainRef}
          onMouseEnter={() => setZoom((z) => ({ ...z, show: true }))}
          onMouseLeave={() => setZoom((z) => ({ ...z, show: false }))}
          onMouseMove={onMouseMove}
          className="group relative aspect-square overflow-hidden rounded-2xl bg-surface-subtle"
        >
          <img
            src={getOptimizedImageUrl(current, 900)}
            srcSet={getResponsiveImageSrcSet(current, [480, 720, 900])}
            sizes="(min-width: 768px) 50vw, 100vw"
            width="900"
            height="900"
            alt={alt}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-200"
            style={zoom.show ? { transform: 'scale(1.6)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous product image"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-navy-700 shadow-soft backdrop-blur transition hover:bg-surface"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next product image"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-navy-700 shadow-soft backdrop-blur transition hover:bg-surface"
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Open fullscreen"
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-navy-700 shadow-soft backdrop-blur hover:bg-surface"
          >
            <FiZoomIn className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {onFindStore && (
            <button type="button" onClick={onFindStore} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50">
              <FiMapPin className="h-4 w-4" /> Nearby stores
            </button>
          )}
          {safeImages.length > 1 && (
            <button
              type="button"
              onClick={() => setIsSpinning((value) => !value)}
              aria-pressed={isSpinning}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition',
                isSpinning ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-navy-200 text-navy-600 hover:border-brand-300'
              )}
            >
              <FiRotateCw className={cn('h-4 w-4', isSpinning && 'animate-spin')} />
              {isSpinning ? 'Stop 360°' : '360° view'}
            </button>
          )}
          {onCompare && (
            <button type="button" onClick={onCompare} className="rounded-lg border border-navy-200 px-3 py-2 text-xs font-semibold text-navy-600 transition hover:border-brand-300 hover:text-brand-700">
              Compare frames
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <Portal>
        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex items-center justify-center bg-navy-900/90 p-4"
              onClick={() => setLightbox(false)}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setLightbox(false)}
                className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <FiX className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <FiChevronLeft className="h-6 w-6" />
              </button>
              <motion.img
                key={active}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                src={current}
                alt={alt}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain"
              />
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <FiChevronRight className="h-6 w-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}

export default ProductGallery;
