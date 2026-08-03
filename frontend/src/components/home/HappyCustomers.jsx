import { FiCheckCircle, FiStar } from 'react-icons/fi';

const TESTIMONIALS = [
  {
    name: 'Aarav K.',
    initials: 'AK',
    color: 'bg-brand-500',
    quote: 'The fit guide made choosing my first pair online surprisingly easy. The frames feel premium and arrived quickly.',
  },
  {
    name: 'Meera S.',
    initials: 'MS',
    color: 'bg-accent-600',
    quote: 'My prescription lenses are clear, comfortable and exactly as requested. The support team was genuinely helpful.',
  },
  {
    name: 'Rohan P.',
    initials: 'RP',
    color: 'bg-navy-700',
    quote: 'Great collection and a smooth checkout. The sunglasses look even better in person and the quality is excellent.',
  },
  {
    name: 'Nisha M.',
    initials: 'NM',
    color: 'bg-brand-700',
    quote: 'I found a frame that finally suits my face shape. Delivery was quick and the packaging was very thoughtful.',
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-warning" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <FiStar key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
      ))}
    </div>
  );
}

/** Social-proof review cards shown directly above the footer on the home page. */
export function HappyCustomers() {
  return (
    <section className="border-t border-navy-100 bg-surface-muted">
      <div className="container-page py-14 sm:py-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
              Our reputation
            </span>
            <h2 className="mt-3 text-h2 text-navy-900">Happy customers</h2>
            <p className="mt-2 max-w-xl text-navy-500">Thoughtful eyewear, clear vision and service customers can rely on.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-100 bg-surface px-3 py-2 text-sm text-navy-600 shadow-soft">
            <Stars />
            <span className="font-semibold text-navy-900">4.9 / 5.0</span>
            <span className="text-navy-400">customer rating</span>
          </div>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TESTIMONIALS.map((testimonial) => (
            <article key={testimonial.name} className="flex min-h-[15rem] flex-col rounded-3xl border border-navy-100 bg-surface p-6 shadow-soft">
              <Stars />
              <p className="mt-5 text-sm leading-6 text-navy-600">“{testimonial.quote}”</p>
              <div className="mt-auto flex items-center gap-3 border-t border-navy-100 pt-4">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white ${testimonial.color}`}>
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{testimonial.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-brand-700">
                    <FiCheckCircle className="h-3.5 w-3.5" /> Verified buyer
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HappyCustomers;
