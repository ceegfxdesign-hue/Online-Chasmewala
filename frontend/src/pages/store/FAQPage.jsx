import { ContentPage } from '@/components/common/ContentPage';
import { Accordion } from '@/components/ui/Accordion';

const FAQS = [
  {
    key: 'orders',
    title: 'How long does delivery take?',
    content:
      'Standard delivery takes 4–7 business days; express delivery arrives in 2–3 business days. You’ll receive tracking updates by email and in your account under My Orders.',
  },
  {
    key: 'returns',
    title: 'What is your return & exchange policy?',
    content:
      'You can return or exchange most items within 14 days of delivery, provided they’re unused and in original packaging. Start a request from My Orders → Returns.',
  },
  {
    key: 'prescription',
    title: 'Can I add my prescription to eyeglasses?',
    content:
      'Yes. On any powered frame you can choose single-vision, bifocal, progressive or zero-power lenses and enter your prescription during checkout.',
  },
  {
    key: 'bluelight',
    title: 'Do computer glasses really help?',
    content:
      'Our computer glasses include a blue-light filter that reduces glare from screens and can help with digital eye strain during long screen sessions.',
  },
  {
    key: 'warranty',
    title: 'Is there a warranty on frames?',
    content:
      'All eyewear frames carry a 1-year warranty against manufacturing defects. Accessories are excluded. Contact support with your order number to claim.',
  },
  {
    key: 'payment',
    title: 'What payment methods are accepted?',
    content:
      'We accept cards, UPI, net banking and cash on delivery. All online payments are processed securely.',
  },
];

export default function FAQPage() {
  return (
    <ContentPage
      title="Frequently Asked Questions"
      description="Answers to common questions about orders, delivery, returns, prescriptions and more."
    >
      <div className="mx-auto max-w-3xl">
        <Accordion items={FAQS} defaultOpen={['orders']} />
      </div>
    </ContentPage>
  );
}
