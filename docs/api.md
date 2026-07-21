# API Reference

Base URL: `http://localhost:5000/api/v1` (configurable via `API_PREFIX`).

All responses use a consistent envelope:

```jsonc
// success
{ "success": true, "message": "OK", "data": { /* ... */ }, "meta": { /* pagination, optional */ } }

// error
{ "success": false, "message": "Human readable error", "errors": [ /* field errors, optional */ ] }
```

Authentication uses a **JWT access token** in the `Authorization: Bearer <token>` header. Refresh
tokens are delivered as an httpOnly cookie and rotated via `POST /auth/refresh`.

## Endpoint index

> Fully documented per resource as each phase lands.

| Method | Path                 | Auth | Description                              |
| ------ | -------------------- | ---- | ---------------------------------------- |
| GET    | `/health`            | —    | Liveness/readiness.                      |
| POST   | `/auth/register`     | —    | Create an account; returns access token. |
| POST   | `/auth/login`        | —    | Sign in; returns access token.           |
| POST   | `/auth/refresh`      | cookie | Rotate refresh token, new access token.|
| POST   | `/auth/logout`       | —    | Revoke the current refresh token.        |
| GET    | `/auth/me`           | user | Current authenticated user.              |
| POST   | `/auth/otp/request`  | —    | Request an OTP (mock returns `devCode`). |
| POST   | `/auth/otp/verify`   | —    | Verify OTP / reset password.             |

Returns, addresses, notifications, offers, and admin resources are implemented. See the sections below.

## Cart, Wishlist, Coupons & Orders (all require auth unless noted)

| Method | Path                        | Description                                        |
| ------ | --------------------------- | -------------------------------------------------- |
| GET    | `/cart`                     | Get the hydrated cart (live prices + totals).      |
| POST   | `/cart/items`               | Add an item.                                       |
| PATCH  | `/cart/items/:itemId`       | Update quantity (0 removes).                       |
| DELETE | `/cart/items/:itemId`       | Remove an item.                                    |
| DELETE | `/cart`                     | Clear the cart.                                    |
| POST   | `/cart/merge`               | Merge a guest cart into the user's cart.           |
| GET    | `/wishlist`                 | Get wishlist products.                             |
| POST   | `/wishlist/toggle`          | Add/remove a product.                              |
| POST   | `/wishlist/merge`           | Merge a guest wishlist.                            |
| GET    | `/coupons`                  | (public) List active coupons.                      |
| POST   | `/coupons/validate`         | Validate a code against a subtotal.                |
| GET    | `/offers`                   | (public) List active seasonal offers.              |
| POST   | `/orders/quote`             | Price preview (shipping, tax, discount).           |
| POST   | `/orders`                   | Place an order (mock/COD payment).                 |
| GET    | `/orders`                   | List my orders (paginated).                        |
| GET    | `/orders/:orderNumber`      | Get one of my orders.                              |
| POST   | `/orders/:orderNumber/cancel` | Cancel (restocks; refunds if prepaid).           |

**Payment (mock):** send `paymentToken: "tok_ok"` to succeed or `"tok_fail"` to force a declined
payment (HTTP 402). `paymentMethod: "cod"` confirms without capture. Placing an order decrements
stock, records coupon usage, and clears the cart; a declined card payment preserves the cart.

## Account (all require auth)

| Method | Path                                   | Description                                     |
| ------ | -------------------------------------- | ----------------------------------------------- |
| PATCH  | `/account/profile`                     | Update name/phone/avatar/preferences.           |
| POST   | `/account/change-password`             | Change password (signs out other sessions).     |
| GET/POST | `/account/addresses`                 | List / add addresses.                           |
| PATCH/DELETE | `/account/addresses/:id`         | Update / remove an address.                     |
| GET/POST | `/account/cards`                     | List / add saved cards (last4 + token only).    |
| DELETE | `/account/cards/:id`                   | Remove a saved card.                            |
| POST   | `/account/returns`                     | Request a return/exchange for a delivered order.|
| GET    | `/account/returns`                     | List my return requests.                        |
| GET    | `/account/returns/:returnNumber`       | Get one return request.                         |
| GET    | `/account/notifications`               | List notifications (+ `unreadCount` in meta).   |
| PATCH  | `/account/notifications/:id/read`      | Mark one read.                                  |
| POST   | `/account/notifications/read-all`      | Mark all read.                                  |
| DELETE | `/account/notifications/:id`           | Delete a notification.                          |
| GET    | `/account/reviews`                     | My reviews.                                     |
| DELETE | `/account/reviews/:id`                 | Delete my review.                               |
| POST   | `/products/:slug/reviews`              | Write a review (auto-verified if purchased).    |
| POST   | `/products/reviews/:id/like`           | Toggle a helpful like on a review.              |

Notifications are created automatically by domain events (welcome on signup, order confirmed, status
changes, return received). Writing a review recomputes the product's cached rating and review count.

## Catalog

| Method | Path                              | Auth  | Description                                  |
| ------ | --------------------------------- | ----- | -------------------------------------------- |
| GET    | `/products`                       | —     | List with filters, search, sort, pagination. |
| GET    | `/products/facets`                | —     | Filter facet counts for the current filter.  |
| GET    | `/products/collections`           | —     | Best-sellers/trending/new/featured for home. |
| GET    | `/products/suggest?q=`            | —     | Instant-search suggestions.                  |
| GET    | `/products/:slug`                 | —     | Product detail.                              |
| GET    | `/products/:slug/related`         | —     | Related products.                            |
| GET    | `/products/:slug/reviews`         | —     | Approved reviews (paginated).                |
| GET    | `/products/:slug/reviews/summary` | —     | Rating distribution + average.               |
| GET    | `/products/admin`                 | admin | Admin listing (incl. inactive, low-stock).   |
| POST   | `/products`                       | admin | Create product.                              |
| PATCH  | `/products/:id`                   | admin | Update product.                              |
| DELETE | `/products/:id`                   | admin | Delete product.                              |
| GET    | `/categories`                     | —     | Categories with product counts.              |
| GET    | `/categories/:slug`               | —     | Category detail.                             |
| POST/PATCH/DELETE | `/categories[/:id]`    | admin | Category CRUD.                               |
| GET    | `/brands`                         | —     | Brands (optionally `?featured=true`).        |
| POST/PATCH/DELETE | `/brands[/:id]`        | admin | Brand CRUD.                                  |

**Product list query params:** `page, limit, search, category, brand, gender, frameShape, frameType,
frameMaterial, lensType, faceShape, color, frameSize, minPrice, maxPrice, minRating, blueLightFilter,
polarized, uvProtection, inStock, onOffer, tags, sort`. Multi-value filters accept comma-separated
slugs (e.g. `brand=lumen,vision-nova`). `sort ∈ {relevance, newest, price-asc, price-desc, rating,
popular, discount}`.

## Admin (admin role required)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/admin/analytics/{dashboard,revenue,top-products,category-split,order-status,customers}` | Dashboard analytics. |
| GET | `/admin/reports/sales` | Sales report. |
| GET | `/admin/inventory/low-stock` | Products at or below the low-stock threshold. |
| GET/PATCH | `/admin/orders[/:id/status]` | List orders / update order status. |
| GET/PATCH | `/admin/returns[/:id/status]` | List returns / update return status. |
| GET/PATCH | `/admin/reviews[/:id/moderate]` | List reviews / moderate a review. |
| GET/POST/PATCH/DELETE | `/admin/coupons[/:id]` | Coupon management. |
| GET/POST/PATCH/DELETE | `/admin/banners[/:id]` | Banner management. |
| GET | `/admin/users[/:id]` | List users or get a user. |
| PATCH | `/admin/users/:id/{active,role}` | Set user active state or role. |
| GET/PATCH | `/admin/settings` | Read or update global shipping, tax, and store settings. |

## Auth details

- **Access token:** returned as `data.accessToken`; send it as `Authorization: Bearer <token>`.
- **Refresh token:** set as an httpOnly cookie (`oc_refresh`), stored hashed server-side and rotated
  on every `/auth/refresh`. Reuse of a revoked token clears all sessions.
- **OTP:** with `OTP_PROVIDER=mock` (default), the 6-digit code is returned as `data.devCode` outside
  production so the flow is testable without email/SMS.

## Health

`GET /api/v1/health`

```json
{
  "success": true,
  "message": "Online Chasmewala API is healthy",
  "data": { "status": "ok", "uptime": 12.34, "timestamp": "2026-07-11T00:00:00.000Z", "db": "connected" }
}
```
