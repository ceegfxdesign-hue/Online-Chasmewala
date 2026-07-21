import { LegalPage } from '@/components/common/LegalPage';

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How Online Chasmewala collects, uses and protects your personal information."
      updated="1 July 2026"
      sections={[
        {
          heading: 'Information we collect',
          body: [
            'We collect information you provide directly, such as your name, email, phone number, shipping address and prescription details, as well as data generated when you browse and shop, including device and usage information.',
          ],
        },
        {
          heading: 'How we use your information',
          body: [
            'Your information helps us process orders, personalize your experience and improve our services. Specifically we use it to:',
            ['Fulfil and deliver your orders', 'Provide customer support', 'Send order updates and, with consent, marketing', 'Prevent fraud and keep your account secure'],
          ],
        },
        {
          heading: 'Sharing & disclosure',
          body: 'We never sell your personal data. We share it only with service providers who help us operate (such as payment processors and couriers) and when required by law.',
        },
        {
          heading: 'Your rights',
          body: 'You can access, update or delete your account information at any time from your account settings, or by contacting support@onlinechasmewala.com.',
        },
        {
          heading: 'Data security',
          body: 'We use industry-standard safeguards including encryption in transit, hashed passwords and restricted access to protect your information.',
        },
      ]}
    />
  );
}
