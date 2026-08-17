import { Helmet } from 'react-helmet-async';
import { FiClock, FiMail, FiMapPin, FiNavigation, FiPhone } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { ContentPage } from '@/components/common/ContentPage';
import { absoluteUrl } from '@/lib/seo';
import { ROUTES } from '@/constants/routes';

const MAP_URL = 'https://maps.app.goo.gl/grycwFB99wGAhEzH6';

export default function FindUsPage() {
  return (
    <>
      <Helmet>
        <title>Find Us · Online Chasmewala</title>
        <meta name="description" content="Visit Online Chasmewala for eyewear assistance, services and expert guidance." />
        <link rel="canonical" href={absoluteUrl(ROUTES.findUs)} />
      </Helmet>

      <ContentPage
        title="Find us"
        description="Visit us for personalised eyewear guidance, fittings, repairs and friendly support."
      >
        <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl bg-navy-900 p-7 text-white shadow-card sm:p-10">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-200">Visit our store</span>
            <h2 className="mt-5 text-h2 text-white">Eyewear help, in person.</h2>
            <p className="mt-4 max-w-xl leading-7 text-white/70">Bring your current glasses or prescription and our team can help with frame selection, lens advice and adjustments.</p>
            <a href={MAP_URL} target="_blank" rel="noreferrer" className="mt-7 inline-flex">
              <Button rightIcon={<FiNavigation />}>Get directions</Button>
            </a>
          </section>

          <section className="rounded-3xl border border-navy-100 bg-surface p-7 shadow-card sm:p-8">
            <h2 className="text-h3 text-navy-900">Store details</h2>
            <ul className="mt-6 space-y-5 text-sm text-navy-600">
              <li className="flex gap-3"><FiMapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /><span>Opp.zam zam sweets the eye shopqe Dongri Mumbai 400008</span></li>
              <li className="flex gap-3"><FiClock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /><span>Open daily, 9:00 AM–8:00 PM</span></li>
              <li className="flex gap-3"><FiPhone className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /><a className="hover:text-brand-600" href="tel:+919000000000">+91 8169214553</a></li>
              <li className="flex gap-3"><FiMail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /><a className="hover:text-brand-600" href="mailto:support@onlinechasmewala.com">support@onlinechasmewala.com</a></li>
            </ul>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-navy-100 bg-surface-subtle p-7 sm:p-10">
          <h2 className="text-h3 text-navy-900">Before you visit</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {['Bring your latest prescription if you have one.', 'Ask us about frame fitting, repairs or lens options.', 'Call ahead for specialised service appointments.'].map((item, index) => (
              <div key={item} className="rounded-2xl bg-surface p-5 text-sm leading-6 text-navy-600 shadow-soft"><span className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{index + 1}</span>{item}</div>
            ))}
          </div>
        </section>
      </ContentPage>
    </>
  );
}
