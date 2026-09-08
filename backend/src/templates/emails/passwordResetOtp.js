import { layout, paragraph, escapeHtml } from './layout.js';
export function passwordResetOtp({ code, purpose, baseUrl }) {
  return layout(purpose === 'reset' ? 'Reset your password' : 'Verify your email', paragraph('Your verification code is:') + `<p style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#00A6A6">${escapeHtml(code)}</p>` + paragraph('This code expires in 10 minutes. Never share it with anyone.') + paragraph('If you did not request this, please ignore this email.'), baseUrl);
}
