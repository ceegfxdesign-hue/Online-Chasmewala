import { FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi';

const MESSAGES = [
  { icon: FiTruck, text: 'Free shipping on orders above ₹999' },
  { icon: FiRefreshCw, text: 'Easy 14-day returns' },
  { icon: FiShield, text: '1-year warranty on frames' },
];

/** Slim promotional bar above the navbar. */
export function AnnouncementBar() {
  return (
    <div className="bg-navy-900 text-white">
      <div className="container-page flex h-9 items-center justify-center gap-8 overflow-hidden text-xs font-medium">
        {MESSAGES.map(({ icon: Icon, text }) => (
          <span key={text} className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon className="h-3.5 w-3.5 text-brand-400" aria-hidden="true" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default AnnouncementBar;
