import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiSun, FiWind } from 'react-icons/fi';
import sunglassesImage from '@/assets/hero/trending-sunglasses.jpg';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

const BENEFITS = [
  { icon: FiShield, label: '100% UV protection' },
  { icon: FiSun, label: 'Polarized options' },
  { icon: FiShield, label: 'Premium quality' },
  { icon: FiWind, label: 'Lightweight comfort' },
];

/** Editorial campaign block linking visitors to the sunglasses collection. */
export function SunglassesPromo() {
  return (
    <section className="container-page py-14 sm:py-20">
      <div className="relative isolate overflow-hidden rounded-3xl bg-navy-900 px-6 py-10 text-white shadow-card sm:px-10 sm:py-14">
        <img
          src={sunglassesImage}
          alt="Premium sunglasses collection"
          loading="lazy"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_center] opacity-70"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900 via-navy-900/85 to-navy-900/25" />
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-brand-300">UV protection you can trust</p>
          <h2 className="mt-2 text-h2 text-white sm:text-[2.5rem]">Sunglasses for every moment</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/80 sm:text-base">Designed for bright days, made with considered details and all-day comfort.</p>
          <Button as={Link} to={`${ROUTES.products}?category=sunglasses`} variant="secondary" className="mt-7 border-white/70 bg-white text-navy-900 hover:bg-surface-muted" rightIcon={<FiArrowRight />}>
            Shop sunglasses
          </Button>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-white/15 pt-6 text-xs font-medium text-white/85 sm:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2"><Icon className="h-4 w-4 shrink-0 text-brand-300" />{label}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SunglassesPromo;
