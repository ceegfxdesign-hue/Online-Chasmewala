# Transactional email setup

Sender and store recipient default to `support@onlinechasmewala.com`. No credentials are checked into Git.

## Enable SMTP

Set these keys in the deployed backend environment (and in `backend/.env` for local delivery):

```env
SMTP_HOST=your-provider-smtp-host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@onlinechasmewala.com
SMTP_PASS=your-provider-app-password
EMAIL_FROM="Online Chasmewala <support@onlinechasmewala.com>"
ADMIN_NOTIFICATION_EMAIL=support@onlinechasmewala.com
CLIENT_URL=https://your-store-domain
```

Use the SMTP host supplied by your mailbox provider; the mailbox address alone is not an SMTP host. Port 587 requires STARTTLS; port 465 uses `SMTP_SECURE=true`. Certificate validation is enabled. See [Nodemailer SMTP documentation](https://nodemailer.com/smtp).

Verify the sending domain and configure SPF/DKIM/DMARC as instructed by the provider. Restart the backend after changing configuration. The first CLIENT_URL is used for shopping, order, admin, and logo links; use the public HTTPS storefront URL in production.

## Behavior

- Signup: welcome email with the existing WELCOME10 offer. Confirm that coupon exists, is active, and has the intended eligibility in Admin Coupons; this feature does not silently create or change discounts.
- Order placed: customer snapshot receipt and separate admin alert. Lens charges are included once. COD is labeled amount due, not paid.
- Confirmed: processing/fitting copy; packed, shipped, out-for-delivery, and delivered: status emails. The existing order status enum is unchanged.
- Admin Orders: fill courier and tracking URL in the order details before changing to Shipped. Tracking is saved with that status update.
- Cancelled orders and approved/refunded returns: receipts reflect the stored refund amount/status and reason. Email does not execute a refund or verify bank settlement.
- Password reset: SMTP sends the generated code; expiry and five-attempt protection remain enforced. Reset and account password changes emit security alerts.
- Low stock: alerts use the existing LOW_STOCK event.
- Contact: rate-limited to five inquiries per IP per 15 minutes. Sends to the fixed admin recipient, with the visitor as Reply-To. Delivery failure returns 503 and preserves the frontend form.

No abandoned-cart, review-request, or promotional campaigns were added.

## Failure handling and limitations

Order/account notification emails run through independent, error-contained in-process event listeners. Email failure never rolls back an order or signup. This is best-effort delivery, not a durable job queue: process termination or SMTP failure can lose a notification, and there are no automatic retries. Monitor `[EMAIL]` errors and the provider delivery logs; add a persistent outbox if guaranteed retries are required.

Without SMTP, development/test logs email previews (including customer data), so restrict log access. Production never logs OTPs or full email bodies and does not claim mock delivery succeeded. OTP/contact delivery failures return a clear error. Tests force mock SMTP and exercise injected fake transports without contacting real recipients.

## Deployment smoke test

1. Request a password reset for your own test account; confirm inbox delivery, six-digit code, expiry, and rejection of an incorrect code.
2. Reset and change that account's password; confirm one security notification per successful change.
3. Place a test order with lens add-ons and manual optical values; verify receipt totals, address, powers, and the admin alert.
4. Set courier/tracking and ship the test order. Test delivery, cancellation, and return approval updates.
5. Submit a contact inquiry; reply from the received email to check Reply-To.

Live delivery cannot be verified until real SMTP credentials are supplied. Neither SMTP acceptance nor automated tests guarantee inbox placement.
