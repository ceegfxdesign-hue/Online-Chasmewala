import { layout, paragraph, button } from './layout.js';
export function passwordChangedAlert({ user, baseUrl }) {
  return layout('Security alert: your password was changed', paragraph(`Hi ${user.name}, your Online Chasmewala password was successfully changed.`) + paragraph('If this was not you, reset your password immediately and contact support@onlinechasmewala.com.') + button(`${baseUrl}/forgot-password`, 'Secure your account'), baseUrl);
}
