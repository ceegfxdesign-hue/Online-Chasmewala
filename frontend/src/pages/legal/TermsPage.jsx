import { LegalPage } from '@/components/common/LegalPage';

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      description="The terms that govern your use of Online Chasmewala and purchases you make."
      updated="1 July 2026"
      sections={[
        {
          heading: 'Acceptance of terms',
          body: 'By accessing or using Online Chasmewala, you agree to these Terms & Conditions. If you do not agree, please do not use the service.',
        },
        {
          heading: 'Accounts',
          body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Provide accurate information and keep it up to date.',
        },
        {
          heading: 'Orders & pricing',
          body: [
            'All orders are subject to acceptance and availability. We strive for accuracy, but errors in pricing or product information may occur; we reserve the right to correct them and cancel affected orders.',
          ],
        },
        {
          heading: 'Prescriptions',
          body: 'For powered eyewear you are responsible for providing an accurate, valid prescription. Online Chasmewala is not liable for issues arising from incorrect prescription details supplied by you.',
        },
        {
          heading: 'Intellectual property',
          body: 'All content on this site — including designs, text, graphics and logos — is the property of Online Chasmewala and may not be used without permission.',
        },
        {
          heading: 'Limitation of liability',
          body: 'To the fullest extent permitted by law, Online Chasmewala is not liable for indirect or consequential damages arising from your use of the service.',
        },
      ]}
    />
  );
}
