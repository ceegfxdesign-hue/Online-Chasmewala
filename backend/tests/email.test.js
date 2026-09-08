import { afterEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { createEmailService, emailService } from '../src/services/email.service.js';
import { env, envSchema } from '../src/config/env.js';
import { logger } from '../src/config/logger.js';
import { orderConfirmation } from '../src/templates/emails/orderConfirmation.js';
import { orderStatusUpdate } from '../src/templates/emails/orderStatusUpdate.js';
import { orderCancelled } from '../src/templates/emails/orderCancelled.js';
import { createApp } from '../src/app.js';
import { eventBus, EVENTS } from '../src/events/eventBus.js';
import { orderRepository, userRepository, productRepository, returnRepository } from '../src/repositories/index.js';
import { otpProvider } from '../src/services/providers/otpProvider.js';

afterEach(() => jest.restoreAllMocks());
const user = { name: 'Test <script>alert(1)</script>', email: 'customer@example.com', phone: '1234567890' };
const order = { orderNumber: 'OC-TEST', user, items: [{ name: 'Frame <img onerror=bad>', image: 'javascript:alert(1)', color: 'Blue', quantity: 2, price: 1000, lensOption: { price: 500, label: 'BLU Screen' }, prescription: { method: 'manual', values: new Map([['rightEye:sph', '-2.00'], ['leftEye:sph', '-1.50'], ['pd', '62']]) } }], pricing: { subtotal: 3000, discount: 100, shippingFee: 49, tax: 0, total: 2949 }, shippingAddress: { fullName: 'Test User', city: 'Pune' }, payment: { method: 'cod', status: 'pending' }, tracking: { courier: 'Courier Co', url: 'https://example.com/track?id=1&x=2' } };
const baseUrl = 'https://store.example.com';
const config = { ...env, CLIENT_URL: baseUrl, SMTP_HOST: 'smtp.example.com', SMTP_USER: 'support@example.com', SMTP_PASS: 'secret', SMTP_SECURE: false, SMTP_PORT: 587, isProd: true };

describe('Transactional email delivery', () => {
  it('uses authenticated TLS SMTP and reuses the transporter', async () => {
    const sendMail = jest.fn().mockResolvedValue({ accepted: ['customer@example.com'], rejected: [] });
    const transport = jest.fn(() => ({ sendMail }));
    const service = createEmailService(config, transport);
    expect(await service.sendWelcome(user)).toEqual({ delivered: true });
    await service.sendPasswordOtp({ destination: user.email, code: '123456', purpose: 'reset' });
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport).toHaveBeenCalledWith(expect.objectContaining({ requireTLS: true, secure: false, disableFileAccess: true, disableUrlAccess: true }));
    expect(sendMail.mock.calls[1][0].html).toContain('123456');
    expect(sendMail.mock.calls[1][0].text).toContain('10 minutes');
    expect(sendMail.mock.calls[0][0].html).not.toContain('<script>');
  });
  it('contains SMTP errors without logging passwords or message bodies', async () => {
    const log = jest.spyOn(logger, 'error').mockImplementation(() => logger);
    const service = createEmailService(config, () => ({ sendMail: jest.fn().mockRejectedValue(new Error('secret SMTP password')) }));
    expect(await service.sendWelcome(user)).toEqual({ delivered: false });
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret SMTP password');
  });
  it('treats rejected recipients as delivery failure', async () => {
    const service = createEmailService(config, () => ({ sendMail: async () => ({ accepted: [], rejected: [user.email] }) }));
    expect(await service.sendWelcome(user)).toEqual({ delivered: false });
  });
  it('logs mock content locally but never logs OTPs or claims delivery in production', async () => {
    const log = jest.spyOn(logger, 'info').mockImplementation(() => logger);
    const transport = jest.fn();
    const local = createEmailService({ ...config, SMTP_HOST: '', isProd: false }, transport);
    expect(await local.sendWelcome(user)).toEqual({ delivered: false, mocked: true });
    expect(log).toHaveBeenCalledWith(expect.stringContaining('[EMAIL:mock]'));
    log.mockClear();
    const prod = createEmailService({ ...config, SMTP_HOST: '' }, transport);
    expect(await prod.sendPasswordOtp({ destination: user.email, code: '123456' })).toEqual({ delivered: false });
    expect(log).not.toHaveBeenCalled();
    expect(transport).not.toHaveBeenCalled();
  });
  it('routes inquiries only to the admin and sets visitor reply-to', async () => {
    const sendMail = jest.fn().mockResolvedValue({ accepted: ['support@example.com'] });
    await createEmailService(config, () => ({ sendMail })).sendContactInquiry({ ...user, subject: 'Help', message: '<script>bad</script>' });
    expect(sendMail.mock.calls[0][0]).toMatchObject({ to: { address: config.ADMIN_NOTIFICATION_EMAIL }, replyTo: { address: user.email } });
    expect(sendMail.mock.calls[0][0].html).not.toContain('<script>');
  });
  it('parses SMTP false correctly and rejects invalid ports and header injection', () => {
    const settings = { ...process.env, SMTP_SECURE: 'false' };
    expect(envSchema.parse(settings).SMTP_SECURE).toBe(false);
    expect(envSchema.parse({ ...settings, SMTP_SECURE: 'true' }).SMTP_SECURE).toBe(true);
    expect(envSchema.safeParse({ ...settings, SMTP_PORT: '0' }).success).toBe(false);
    expect(envSchema.safeParse({ ...settings, EMAIL_FROM: 'test@example.com\r\nBcc:bad@example.com' }).success).toBe(false);
  });
});

describe('Receipts', () => {
  it('escapes customer input, includes optical powers, and does not double count lenses', () => {
    const { html, text } = orderConfirmation({ order, user, baseUrl });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('src="javascript:');
    for (const value of ['BLU Screen', 'Right Eye (OD)', 'Left Eye (OS)', '-2.00', '-1.50', '62', 'Frames subtotal', '2,000.00', '1,000.00', '2,949.00', 'Amount due']) expect(text).toContain(value);
    expect(text).not.toContain('Total paid');
  });
  it('includes courier links while rejecting unsafe tracking URLs', () => {
    expect(orderStatusUpdate({ order, status: 'shipped', baseUrl }).html).toContain('https://example.com/track?id=1&amp;x=2');
    expect(orderStatusUpdate({ order: { ...order, tracking: { url: 'javascript:bad()' } }, status: 'shipped', baseUrl }).html).not.toContain('javascript:');
  });
  it('does not attach prescription files or mislabel pending refunds as completed', () => {
    const upload = { ...order, items: [{ ...order.items[0], prescription: { method: 'upload', fileData: 'PRIVATE_DOCUMENT' } }] };
    expect(orderConfirmation({ order: upload, user, baseUrl }).html).not.toContain('PRIVATE_DOCUMENT');
    const receipt = orderCancelled({ order, refund: { amount: 1000, status: 'pending' }, reason: 'Wrong size', baseUrl });
    expect(receipt.text).toContain('pending');
    expect(receipt.text).toContain('Wrong size');
  });
});

describe('Email entry points', () => {
  it('wires all transactional event listeners', async () => {
    createApp();
    const query = (result) => ({ populate() { return this; }, select() { return this; }, then(resolve) { return Promise.resolve(result).then(resolve); } });
    jest.spyOn(userRepository, 'findById').mockReturnValue(query(user));
    jest.spyOn(orderRepository, 'findById').mockReturnValue(query(order));
    jest.spyOn(productRepository, 'findById').mockReturnValue(query({ name: 'Frame', sku: 'SKU', lowStockThreshold: 5 }));
    jest.spyOn(returnRepository, 'findOne').mockReturnValue(query({ order, user, refund: { amount: 1000, status: 'pending' }, items: [{ reason: 'Size' }] }));
    for (const name of ['sendWelcome', 'sendPasswordChanged', 'sendOrderConfirmation', 'sendAdminNewOrder', 'sendOrderStatus', 'sendCancellation', 'sendLowStock']) jest.spyOn(emailService, name).mockResolvedValue({ delivered: true });
    for (const [event, payload] of [[EVENTS.USER_REGISTERED, {}], [EVENTS.PASSWORD_CHANGED, {}], [EVENTS.ORDER_PLACED, {}], [EVENTS.ORDER_STATUS_CHANGED, { status: 'shipped' }], [EVENTS.ORDER_CANCELLED, {}], [EVENTS.RETURN_STATUS_CHANGED, { status: 'approved' }], [EVENTS.LOW_STOCK, { stock: 2 }]]) {
      await Promise.all(eventBus.listeners(event).map((listener) => listener(payload)));
    }
    expect(emailService.sendWelcome).toHaveBeenCalled();
    expect(emailService.sendPasswordChanged).toHaveBeenCalled();
    expect(emailService.sendOrderConfirmation).toHaveBeenCalled();
    expect(emailService.sendAdminNewOrder).toHaveBeenCalled();
    expect(emailService.sendOrderStatus).toHaveBeenCalled();
    expect(emailService.sendCancellation).toHaveBeenCalledTimes(2);
    expect(emailService.sendLowStock).toHaveBeenCalled();
  });
  it('uses real SMTP OTP delivery when configured and returns 503 on failure', async () => {
    const configured = emailService.configured;
    emailService.configured = true;
    const send = jest.spyOn(emailService, 'sendPasswordOtp').mockResolvedValue({ delivered: true });
    try {
      await expect(otpProvider.send({ destination: user.email, code: '123456', purpose: 'reset' })).resolves.toEqual({ delivered: true });
      send.mockResolvedValue({ delivered: false });
      await expect(otpProvider.send({ destination: user.email, code: '123456', purpose: 'reset' })).rejects.toMatchObject({ statusCode: 503 });
    } finally { emailService.configured = configured; }
  });
  it('validates, forwards, reports failures, and rate limits contact submissions', async () => {
    const app = createApp();
    const send = jest.spyOn(emailService, 'sendContactInquiry').mockResolvedValue({ delivered: true });
    const inquiry = { name: 'Visitor', email: 'visitor@example.com', phone: '1234567890', subject: 'Order help', message: 'Please help with my order.' };
    expect((await request(app).post('/api/v1/contact').send({})).status).toBe(422);
    expect((await request(app).post('/api/v1/contact').send(inquiry)).status).toBe(200);
    expect(send).toHaveBeenCalledWith(inquiry);
    send.mockResolvedValue({ delivered: false });
    expect((await request(app).post('/api/v1/contact').send(inquiry)).status).toBe(503);
    for (let i = 0; i < 2; i++) await request(app).post('/api/v1/contact').send(inquiry);
    expect((await request(app).post('/api/v1/contact').send(inquiry)).status).toBe(429);
  });
});
