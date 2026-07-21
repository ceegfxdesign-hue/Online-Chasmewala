import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail } from 'react-icons/fi';
import { Logo } from '@/components/common/Logo';
import { Newsletter } from '@/components/common/Newsletter';
import { FOOTER_LINKS } from '@/constants/navigation';

const SOCIALS = [
  { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: FiYoutube, href: 'https://youtube.com', label: 'YouTube' },
];

/** Global site footer with newsletter, link columns and social links. */
export function Footer() {
  return (
    <footer className="mt-16 border-t border-navy-100 bg-navy-900 text-white/80">
      <div className="container-page py-12">
        <Newsletter />

        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-white/10 pt-12 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <Logo variant="light" />
            <p className="mt-4 max-w-xs text-sm text-white/60">
              Premium eyewear crafted for everyday clarity. Frames, lenses and sunglasses with an
              effortless online experience.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-brand-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-white/60 transition-colors hover:text-brand-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Online Chasmewala. All rights reserved.</p>
          <a href="mailto:support@onlinechasmewala.com" className="flex items-center gap-1.5 hover:text-brand-400">
            <FiMail className="h-4 w-4" /> support@onlinechasmewala.com
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
