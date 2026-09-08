import { layout, rows, paragraph } from './layout.js';
export function contactInquiry({ inquiry, baseUrl }) {
  return layout('New contact inquiry', rows([['Name', inquiry.name], ['Email', inquiry.email], ['Phone', inquiry.phone || 'Not provided'], ['Subject', inquiry.subject]]) + paragraph(inquiry.message), baseUrl);
}
