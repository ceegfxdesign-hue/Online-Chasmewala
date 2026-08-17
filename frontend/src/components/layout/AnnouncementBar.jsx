import { FiGift, FiRefreshCw, FiShield, FiStar, FiTruck, FiZap } from 'react-icons/fi';
import { useGetAnnouncementsQuery } from '@/features/settings/settingsApi';

const FALLBACK_MESSAGES = [
  { icon: 'truck', text: 'Free shipping on orders above ₹999' },
  { icon: 'refresh', text: 'Easy 14-day returns' },
  { icon: 'shield', text: '1-year warranty on frames' },
];

const ICONS = {
  truck: FiTruck,
  refresh: FiRefreshCw,
  shield: FiShield,
  star: FiStar,
  zap: FiZap,
  gift: FiGift,
};

/** Slim, admin-managed promotional bar above the storefront navigation. */
export function AnnouncementBar() {
  const { data: announcements } = useGetAnnouncementsQuery();
  const messages = Array.isArray(announcements) && announcements.length ? announcements : FALLBACK_MESSAGES;

  return (
    <div className="bg-navy-900 text-white">
      <div className="container-page h-9 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex h-full min-w-max items-center justify-center gap-7 px-4 text-center text-xs font-medium sm:gap-8">
          {messages.map(({ icon, text }, index) => {
            const Icon = ICONS[icon] || FiShield;
            return (
              <span key={`${text}-${index}`} className="flex items-center gap-1.5 whitespace-nowrap">
                <Icon className="h-3.5 w-3.5 text-brand-400" aria-hidden="true" />
                {text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;
