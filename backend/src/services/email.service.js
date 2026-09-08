/** SMTP delivery boundary. Never logs SMTP credentials or production message bodies. */
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { orderConfirmation } from '../templates/emails/orderConfirmation.js';
import { orderStatusUpdate } from '../templates/emails/orderStatusUpdate.js';
import { orderCancelled } from '../templates/emails/orderCancelled.js';
import { welcome } from '../templates/emails/welcome.js';
import { passwordResetOtp } from '../templates/emails/passwordResetOtp.js';
import { passwordChangedAlert } from '../templates/emails/passwordChangedAlert.js';
import { adminNewOrder } from '../templates/emails/adminNewOrder.js';
import { adminLowStock } from '../templates/emails/adminLowStock.js';
import { contactInquiry } from '../templates/emails/contactInquiry.js';

export function createEmailService(config = env, createTransport = nodemailer.createTransport) {
  let transporter;
  const configured = Boolean(config.SMTP_HOST && config.SMTP_USER);
  const baseUrl = config.CLIENT_URL.split(',')[0].trim().replace(/\/$/, '');
  async function send(to, template, data, replyTo) {
    try {
      const message = { from: config.EMAIL_FROM, to: { address: to }, ...template({ ...data, baseUrl }),
        ...(replyTo ? { replyTo: { address: replyTo } } : {}), disableFileAccess: true, disableUrlAccess: true };
      if (!configured) {
        if (config.isProd) {
          logger.error('[EMAIL] SMTP not configured; message not delivered');
          return { delivered: false };
        }
        logger.info(`[EMAIL:mock] ${message.subject}\n${message.text}`);
        return { delivered: false, mocked: true };
      }
      transporter ||= createTransport({
        host: config.SMTP_HOST, port: config.SMTP_PORT, secure: config.SMTP_SECURE,
        auth: { user: config.SMTP_USER, pass: config.SMTP_PASS }, requireTLS: !config.SMTP_SECURE,
        connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
        disableFileAccess: true, disableUrlAccess: true,
      });
      const result = await transporter.sendMail(message);
      const delivered = Boolean(result.accepted?.length) && !result.rejected?.length;
      if (!delivered) logger.error('[EMAIL] SMTP recipient rejected');
      return { delivered };
    } catch {
      // SMTP errors can contain addresses and credentials; keep operational logs redacted.
      logger.error('[EMAIL] Delivery failed; check SMTP configuration and provider logs');
      return { delivered: false };
    }
  }
  return {
    configured,
    sendWelcome: (user) => send(user.email, welcome, { user }),
    sendOrderConfirmation: (order, user) => send(user.email, orderConfirmation, { order, user }),
    sendAdminNewOrder: (order, user) => send(config.ADMIN_NOTIFICATION_EMAIL, adminNewOrder, { order, user }),
    sendOrderStatus: (order, user, status) => send(user.email, orderStatusUpdate, { order, status }),
    sendCancellation: (order, user, refund, reason) => send(user.email, orderCancelled, { order, refund, reason }),
    sendPasswordOtp: ({ destination, code, purpose }) => send(destination, passwordResetOtp, { code, purpose }),
    sendPasswordChanged: (user) => send(user.email, passwordChangedAlert, { user }),
    sendLowStock: (product, stock) => send(config.ADMIN_NOTIFICATION_EMAIL, adminLowStock, { product, stock }),
    sendContactInquiry: (inquiry) => send(config.ADMIN_NOTIFICATION_EMAIL, contactInquiry, { inquiry }, inquiry.email),
  };
}
export const emailService = createEmailService();
