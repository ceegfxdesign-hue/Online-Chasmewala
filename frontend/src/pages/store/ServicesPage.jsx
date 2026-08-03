import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiActivity,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiCompass,
  FiEye,
  FiSettings,
  FiTool,
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { absoluteUrl } from '@/lib/seo';
import { ROUTES } from '@/constants/routes';

const SERVICES = [
  {
    title: 'Sight Testing & Power Check',
    price: 'Free with frame purchase',
    duration: 'About 15 minutes',
    icon: FiEye,
    description: 'A computerised refraction scan and visual assessment to help identify your ideal glasses power.',
    features: ['Computerised refraction scan', 'Visual acuity testing', 'Power calibration', 'Prescription accuracy check'],
  },
  {
    title: 'Contact Lens Fittings',
    price: '₹500 consultation',
    duration: 'About 25 minutes',
    icon: FiActivity,
    description: 'Expert fitting for daily, monthly, toric and coloured contact lenses with comfort and care guidance.',
    features: ['Toric-lens guidance', 'Trial lens fitting', 'Hygiene and care guidance'],
  },
  {
    title: 'Eyewear Prescriptions',
    price: 'From ₹799 / pair',
    duration: 'About 10 minutes',
    icon: FiCompass,
    description: 'Lens recommendations for single-vision, bifocal, progressive and specialised prescription needs.',
    features: ['Single-vision lenses', 'Anti-glare coatings', 'Blue-light lens options'],
  },
  {
    title: 'Professional Frame Fitting',
    price: 'Complimentary',
    duration: 'About 5 minutes',
    icon: FiSettings,
    description: 'Professional adjustments that keep your glasses balanced, comfortable and secure on your face.',
    features: ['Nose-pad adjustment', 'Temple-arm bending', 'Frame-centering check', 'Pupillary distance check'],
  },
  {
    title: 'Glasses Repair',
    price: 'Starts at ₹50',
    duration: 'Usually under 10 minutes',
    icon: FiTool,
    description: 'Quick on-site help for common repairs, including alignment, screws and small frame components.',
    features: ['Lens re-fitting', 'Temple-arm replacement', 'Lost screw replacement'],
  },
  {
    title: 'Vision Correction Consultation',
    price: 'Free discussion',
    duration: 'About 15 minutes',
    icon: FiEye,
    description: 'Practical advice on prescription lenses, reading glasses, anti-glare coatings and everyday visual comfort.',
    features: ['Myopia management', 'Hyperopia correction', 'Astigmatism solutions', 'Presbyopia lenses'],
  },
  {
    title: 'Frame Selection Guidance',
    price: 'Complimentary',
    duration: 'About 20 minutes',
    icon: FiCompass,
    description: 'Personalised style and budget advice to help you choose a frame that feels as good as it looks.',
    features: ['Face-shape analysis', 'Style consultation', 'Budget-based shortlisting', 'Brand recommendations'],
  },
];

function ServiceCard({ service }) {
  const Icon = service.icon;

  return (
    <article className="flex h-full flex-col rounded-3xl border border-navy-100 bg-surface p-6 shadow-card sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-navy-900">{service.title}</h2>
            <span className="rounded-full bg-accent-400/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-navy-700">
              {service.price}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-navy-500">{service.description}</p>
          <p className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">
            <FiClock className="h-3.5 w-3.5" /> Duration: {service.duration}
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-2 border-t border-navy-100 pt-5 text-sm text-navy-600">
        {service.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-navy-100 pt-6">
        <span className="text-xs font-bold uppercase tracking-[0.1em] text-navy-400">Online Chasmewala</span>
        <Button as={Link} to={`${ROUTES.contact}?service=${encodeURIComponent(service.title)}`} size="sm" rightIcon={<FiArrowRight />}>
          Schedule now
        </Button>
      </div>
    </article>
  );
}

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>Our Services · Online Chasmewala</title>
        <meta name="description" content="Sight testing, contact-lens fittings, frame repairs and personalised eyewear guidance from Online Chasmewala." />
        <link rel="canonical" href={absoluteUrl(ROUTES.services)} />
      </Helmet>

      <section className="border-b border-navy-100 bg-surface-subtle">
        <div className="container-page py-10 sm:py-14">
          <Breadcrumb className="mb-5" items={[{ label: 'Home', to: ROUTES.home }, { label: 'Services' }]} />
          <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.13em] text-brand-700">
            Diagnostic centre
          </span>
          <h1 className="mt-4 text-h1 text-navy-900">Our services</h1>
          <p className="mt-3 max-w-3xl text-navy-500">
            Complete eye-care support—from digital refraction checks to frame repairs and personalised lens guidance.
          </p>
        </div>
      </section>

      <main className="container-page py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          {SERVICES.map((service) => <ServiceCard key={service.title} service={service} />)}
        </div>

        <section className="mt-12 grid overflow-hidden rounded-3xl bg-navy-900 text-white lg:grid-cols-[1.1fr_1fr]">
          <div className="p-7 sm:p-10">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-200">On-screen calibration suite</span>
            <h2 className="mt-5 text-h2 text-white">Instant vision & refraction check</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
              Get guidance on the next best step for your prescription, screen comfort and lens requirements—without a camera preview.
            </p>
            <Button as={Link} to={ROUTES.contact} className="mt-7 bg-brand-500 hover:bg-brand-400" rightIcon={<FiArrowRight />}>
              Request a vision check
            </Button>
          </div>
          <div className="m-5 flex min-h-56 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center sm:m-7">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-400/20 text-brand-200"><FiEye className="h-7 w-7" /></div>
            <p className="mt-4 font-bold uppercase tracking-[0.12em] text-white">Personalised guidance</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-white/65">Our eyewear specialists will help you choose the right next step.</p>
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-5 rounded-3xl border border-brand-100 bg-brand-50 p-7 sm:p-9 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-h3 text-navy-900">Trouble adapting to your prescription glasses?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-600">Ask about an adaptation consultation so we can review fit, comfort and lens alignment.</p>
          </div>
          <Button as={Link} to={ROUTES.contact} className="shrink-0" rightIcon={<FiArrowRight />}>Claim consultation</Button>
        </section>
      </main>
    </>
  );
}
