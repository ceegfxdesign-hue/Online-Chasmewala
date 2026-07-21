import { Link } from 'react-router-dom';
import { SectionHeading } from '@/components/common/SectionHeading';
import { FACE_SHAPE_OPTIONS } from '@/constants/filters';
import { ROUTES } from '@/constants/routes';

const DESC = {
  round: 'Angular frames add definition',
  oval: 'Most styles suit you',
  square: 'Round frames soften features',
  heart: 'Bottom-heavy & rimless flatter',
  oblong: 'Tall frames balance length',
  diamond: 'Cat-eye & oval complement',
};

/** "Shop by Face Shape" guide linking into the filtered catalog. */
export function ShopByFaceShape() {
  return (
    <section className="container-page py-12">
      <SectionHeading
        eyebrow="Find your fit"
        title="Shop by face shape"
        subtitle="Discover frames designed to flatter your features."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {FACE_SHAPE_OPTIONS.map((face) => (
          <Link
            key={face.value}
            to={`${ROUTES.products}?faceShape=${face.value}`}
            className="group rounded-2xl bg-surface p-5 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
          >
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <FaceGlyph shape={face.value} />
            </div>
            <p className="font-semibold text-navy-900">{face.label}</p>
            <p className="mt-1 text-xs text-navy-400">{DESC[face.value]}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Simple original SVG glyphs representing face shapes. */
function FaceGlyph({ shape }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
  const map = {
    round: <circle cx="16" cy="16" r="11" {...common} />,
    oval: <ellipse cx="16" cy="16" rx="9" ry="12" {...common} />,
    square: <rect x="5" y="5" width="22" height="22" rx="4" {...common} />,
    heart: <path d="M16 27C6 20 6 9 12 8c2.5-.4 4 1.5 4 3 0-1.5 1.5-3.4 4-3 6 1 6 12-4 19Z" {...common} />,
    oblong: <rect x="7" y="3" width="18" height="26" rx="8" {...common} />,
    diamond: <path d="M16 3l11 13-11 13L5 16Z" {...common} />,
  };
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      {map[shape]}
    </svg>
  );
}

export default ShopByFaceShape;
