/** Shared email layout. Escape values at the HTML boundary; never trust URLs. */
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

export function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? escapeHtml(url.href) : '';
  } catch { return ''; }
}
export const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value) || 0);
export const paragraph = (text) => `<p>${escapeHtml(text)}</p>`;
export const button = (url, label) => safeUrl(url) ? `<p><a href="${safeUrl(url)}" style="display:inline-block;background:#00A6A6;color:white;padding:14px 22px;border-radius:8px;text-decoration:none">${escapeHtml(label)}</a></p>` : '';
export const rows = (entries) => `<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse">${entries.map(([key, value]) => `<tr><th align="left" style="border-bottom:1px solid #e2e8f0">${escapeHtml(key)}</th><td style="border-bottom:1px solid #e2e8f0">${escapeHtml(value)}</td></tr>`).join('')}</table>`;

export function layout(title, body, baseUrl) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#f1f5f9;color:#0F172A;font:16px Arial,sans-serif;line-height:1.6"><table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="100%" style="max-width:640px;background:white"><tr><td style="padding:24px;background:#0F172A;color:white"><img src="${safeUrl(`${baseUrl}/brand-logo.jpeg`)}" alt="Online Chasmewala" width="72" height="72"><h2>Online Chasmewala</h2></td></tr><tr><td style="padding:24px;overflow-wrap:anywhere"><h1 style="font-size:24px">${escapeHtml(title)}</h1>${body}</td></tr><tr><td style="padding:24px;color:#64748b;font-size:12px">Online Chasmewala · Transactional notification<br>Questions? support@onlinechasmewala.com</td></tr></table></td></tr></table></body></html>`;
  const text = html.replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, '$2 ($1)')
    .replace(/<[^>]*>/g, '\n')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n').trim();
  return { subject: title.replace(/[\r\n]/g, ' '), html, text };
}
