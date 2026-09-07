/** Full-height package details with comparison media and a sticky selection action. */
import { useState } from 'react';
import { Drawer, Button } from '@/components/ui';
import { LensIllustration } from './LensPackageCard';
import { formatPrice } from '@/lib/format';

export function LensPackageDetails({
  pack,
  framePrice = 0,
  frameMrp,
  powerPrice = 0,
  onClose,
  onSelect,
}) {
  const [position, setPosition] = useState(50);
  const [showVideo, setShowVideo] = useState(Boolean(pack.videoUrl));
  const hero = pack.detailImageUrl || pack.imageUrl;
  const total = Number(framePrice) + Number(powerPrice) + Number(pack.price || 0);
  const mrp =
    Number(frameMrp || framePrice) + Number(powerPrice) + Number(pack.mrp || pack.price || 0);
  const prices = (
    <span className="text-sm font-semibold text-blue-600">
      {formatPrice(total)}
      {mrp > total && <del className="ml-1 text-xs text-navy-400">{formatPrice(mrp)}</del>}
    </span>
  );
  return (
    <Drawer
      open
      onClose={onClose}
      title={pack.name}
      width="max-w-2xl"
      className="[&>div:first-child]:absolute [&>div:first-child]:right-3 [&>div:first-child]:top-2 [&>div:first-child]:z-20 [&>div:first-child]:border-0 [&>div:first-child]:p-0 [&>div:first-child>h2]:sr-only [&>div:first-child>button]:m-0 [&>div:first-child>button]:bg-white"
      footer={
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-navy-500">
            <span>Frame + Lens</span>
            {prices}
          </div>
          <Button
            fullWidth
            size="lg"
            className="bg-[#000042] text-white hover:bg-navy-800"
            onClick={onSelect}
          >
            Select This Lens
          </Button>
        </div>
      }
    >
      <div className="relative aspect-[2.35/1] overflow-hidden bg-navy-50">
        {showVideo && pack.videoUrl ? (
          <video
            controls
            playsInline
            preload="metadata"
            poster={hero || undefined}
            src={pack.videoUrl}
            className="h-full w-full object-contain"
          >
            <track kind="captions" />
          </video>
        ) : hero ? (
          <>
            <img src={hero} alt={pack.name} className="h-full w-full object-cover" />
            {pack.comparisonImageUrl && (
              <>
                <img
                  src={pack.comparisonImageUrl}
                  alt="Lens comparison"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ clipPath: 'inset(0 ' + (100 - position) + '% 0 0)' }}
                />
                <div
                  className="pointer-events-none absolute inset-y-0 w-1 bg-white"
                  style={{ left: position + '%' }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={position}
                  aria-label="Compare lens images"
                  onChange={(event) => setPosition(Number(event.target.value))}
                  className="absolute bottom-2 left-4 w-[calc(100%-2rem)] accent-white"
                />
              </>
            )}
          </>
        ) : (
          <LensIllustration className="h-full w-full p-5" />
        )}
      </div>
      {pack.videoUrl && hero && (
        <div className="flex gap-2 px-4 pt-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowVideo(false)}
            aria-pressed={!showVideo}
          >
            Image
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowVideo(true)}
            aria-pressed={showVideo}
          >
            Video
          </Button>
        </div>
      )}
      <section className="p-4 sm:p-5">
        <h2 className="text-xl font-bold text-[#000042]">{pack.name}</h2>
        <div className="my-4 flex items-end justify-between gap-3 border-t border-dashed border-navy-100 pt-3">
          <span className="text-xs text-navy-500">{pack.couponText}</span>
          <span className="text-right">
            <span className="block text-[10px] text-navy-400">Frame + Lens</span>
            {prices}
          </span>
        </div>
        <h3 className="mb-4 text-lg font-semibold text-navy-800">Top Benefits</h3>
        <ul className="space-y-3 text-sm text-navy-500">
          {pack.features?.map((feature, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden="true">{pack.featureIcons?.[i] || '⚡'}</span>
              {feature}
            </li>
          ))}
        </ul>
        {pack.description && (
          <p className="mt-4 whitespace-pre-line text-sm text-navy-500">{pack.description}</p>
        )}
      </section>
      <section className="border-t-8 border-navy-50 p-4 sm:p-5">
        <h3 className="mb-4 text-lg font-semibold text-navy-800">Features</h3>
        <div className="divide-y divide-navy-100">
          {(pack.detailFeatures?.length
            ? pack.detailFeatures
            : (pack.features || []).map((title) => ({ title }))
          ).map((feature, i) => (
            <article key={i} className="flex items-center gap-4 py-4">
              {feature.imageUrl ? (
                <img
                  src={feature.imageUrl}
                  alt=""
                  className="aspect-[4/3] w-1/3 rounded-3xl object-cover"
                />
              ) : (
                <LensIllustration className="w-1/3 shrink-0 rounded-3xl bg-navy-50" />
              )}
              <div>
                <h4 className="font-medium text-navy-900">{feature.title}</h4>
                {feature.description && (
                  <p className="mt-2 whitespace-pre-line text-sm text-navy-500">
                    {feature.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </Drawer>
  );
}
