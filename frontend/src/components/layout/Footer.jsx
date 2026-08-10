import { Link } from 'react-router-dom';
import { FiClock, FiMail, FiMapPin, FiMessageCircle, FiPhone } from 'react-icons/fi';
import { Logo } from '@/components/common/Logo';
import { FOOTER_LINKS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useGetFooterSettingsQuery } from '@/features/settings/settingsApi';

const STYLES = [
  { label: 'Wayfarer frames', to: `${ROUTES.products}?frameShape=wayfarer` },
  { label: 'Rectangle frames', to: `${ROUTES.products}?frameShape=rectangle` },
  { label: 'Round frames', to: `${ROUTES.products}?frameShape=round` },
  { label: 'Cat-eye frames', to: `${ROUTES.products}?frameShape=cat-eye` },
];

const NAVIGATION = FOOTER_LINKS.find((column) => column.title === 'Shop')?.links || [];

/** Global contact-led footer with navigation and quick style links. */
export function Footer() {
  const { data: settings } = useGetFooterSettingsQuery();
  const footer = {
    storeName: settings?.storeName || 'Online Chasmewala',
    address: settings?.storeAddress || 'MG Road, Bengaluru, Karnataka 560001',
    phone: settings?.supportPhone || '+91 90000 00000',
    email: settings?.supportEmail || 'support@onlinechasmewala.com',
    hoursTitle: settings?.businessHoursTitle || 'Open every day',
    hoursText: settings?.businessHoursText || 'Customer support is available from 9:00 AM to 8:00 PM.',
    whatsapp: settings?.whatsappNumber || settings?.supportPhone || '+91 90000 00000',
  };
  const phoneLink = `tel:${footer.phone.replace(/[^+\d]/g, '')}`;
  const whatsappLink = `https://wa.me/${footer.whatsapp.replace(/\D/g, '')}`;

  return (
    <footer className="bg-navy-900 text-navy-200">
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1.05fr_1.25fr]">
          <div>
            <Logo className="!h-16 !w-16 sm:!h-20 sm:!w-20" />
            <p className="mt-5 max-w-xs text-sm leading-6 text-navy-200">
              Eyewear selected for everyday clarity, confident style and a more comfortable online shopping experience.
            </p>
            <div className="mt-6 flex max-w-xs items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
              <FiClock className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
              <div>
                <p className="text-sm font-semibold text-white">{footer.hoursTitle}</p>
                <p className="mt-1 text-xs leading-5 text-navy-200">{footer.hoursText}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Store navigation</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {NAVIGATION.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="transition-colors hover:text-brand-400">{link.label}</Link>
                </li>
              ))}
              <li><Link to={ROUTES.services} className="transition-colors hover:text-brand-400">Services</Link></li>
              <li><Link to={ROUTES.about} className="transition-colors hover:text-brand-400">Our story</Link></li>
              <li><Link to={ROUTES.findUs} className="transition-colors hover:text-brand-400">Find us</Link></li>
              <li><Link to={ROUTES.contact} className="transition-colors hover:text-brand-400">Contact us</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Shop by style</h2>
            <p className="mt-5 text-sm leading-6 text-navy-200">Discover a frame shape that suits your everyday look.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {STYLES.map((style) => (
                <Link
                  key={style.label}
                  to={style.to}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-navy-100 transition hover:border-brand-400 hover:bg-brand-500 hover:text-white"
                >
                  {style.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Direct contact</h2>
            <ul className="mt-5 space-y-4 text-sm text-navy-200">
              <li className="flex gap-3"><FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /><span>{footer.address}</span></li>
              <li><a href={phoneLink} className="flex items-center gap-3 transition hover:text-brand-400"><FiPhone className="h-4 w-4 text-brand-400" />{footer.phone}</a></li>
              <li><a href={`mailto:${footer.email}`} className="flex items-center gap-3 transition hover:text-brand-400"><FiMail className="h-4 w-4 text-brand-400" />{footer.email}</a></li>
            </ul>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-600"
            >
              <FiMessageCircle className="h-4 w-4" /> WhatsApp chat
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.12em] text-navy-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Online Chasmewala. All rights reserved.</p>
          <p>Made with care for clearer vision</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
