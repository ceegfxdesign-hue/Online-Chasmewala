import { FiEye, FiHeart, FiAward, FiUsers } from 'react-icons/fi';
import { ContentPage } from '@/components/common/ContentPage';

const STATS = [
  { icon: FiUsers, value: '50,000+', label: 'Happy customers' },
  { icon: FiEye, value: '1,200+', label: 'Frame styles' },
  { icon: FiAward, value: '1-year', label: 'Warranty' },
  { icon: FiHeart, value: '4.7/5', label: 'Average rating' },
];

export default function AboutPage() {
  return (
    <ContentPage
      title="About Online Chasmewala"
      description="We’re on a mission to make premium eyewear accessible, effortless and delightful for everyone."
    >
      <div className="mx-auto max-w-3xl space-y-6 text-navy-600">
        <p>
          Online Chasmewala began with a simple belief: everyone deserves to see the world clearly —
          and look great doing it. We design original frames, source high-quality lenses, and pair
          them with an online experience that’s as comfortable as your favourite pair of glasses.
        </p>
        <p>
          From prescription eyeglasses and blue-light computer glasses to polarized sunglasses and
          contact lenses, every product is chosen for quality, comfort and style. Our team of eyewear
          specialists is here to help you find the perfect fit for your face and your life.
        </p>
        <p>
          We stand behind everything we sell with free shipping over ₹999, easy 14-day returns and a
          one-year warranty on frames. That’s the Online Chasmewala promise.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface p-6 text-center shadow-card">
            <s.icon className="mx-auto mb-2 h-6 w-6 text-brand-500" />
            <p className="text-h3 text-navy-900">{s.value}</p>
            <p className="text-sm text-navy-400">{s.label}</p>
          </div>
        ))}
      </div>
    </ContentPage>
  );
}
