import { layout, paragraph, button } from './layout.js';
export function welcome({ user, baseUrl }) {
  return layout('Welcome to Online Chasmewala!', paragraph(`Hi ${user.name}, your account is ready. Find frames and lenses made for you.`) + paragraph('Enjoy 10% off your first order with WELCOME10. Coupon eligibility and limits apply at checkout.') + button(`${baseUrl}/products`, 'Start shopping'), baseUrl);
}
