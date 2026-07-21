import { LegalPage } from '@/components/common/LegalPage';

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Return Policy"
      description="Our easy returns, exchanges and refunds — designed to make shopping risk-free."
      updated="1 July 2026"
      sections={[
        {
          heading: '14-day returns',
          body: 'You may return most items within 14 days of delivery for a refund or exchange, provided they are unused, undamaged and in their original packaging with all accessories.',
        },
        {
          heading: 'How to start a return',
          body: [
            'Initiating a return is simple:',
            ['Go to My Orders and select the order', 'Choose Return or Exchange and the reason', 'Schedule a pickup or drop-off', 'Track your refund status under Returns'],
          ],
        },
        {
          heading: 'Refund timelines',
          body: 'Once your return is received and inspected, refunds are processed to your original payment method within 5–7 business days. Cash-on-delivery orders are refunded to your bank account or wallet.',
        },
        {
          heading: 'Non-returnable items',
          body: [
            'For hygiene and safety reasons, the following are not eligible for return unless defective:',
            ['Opened contact lenses', 'Customized prescription lenses', 'Gift cards'],
          ],
        },
        {
          heading: 'Damaged or wrong items',
          body: 'If you receive a damaged or incorrect item, contact support within 48 hours of delivery and we’ll arrange a free replacement or full refund.',
        },
      ]}
    />
  );
}
