# Architecture

Online Chasmewala is a two-tier MERN application: a stateless REST API (backend) and a single-page
React application (frontend), backed by MongoDB.

```
┌──────────────┐        HTTPS / JSON        ┌──────────────┐        ┌──────────┐
│   Frontend   │  ───────────────────────▶  │   Backend    │  ────▶ │ MongoDB  │
│ React + Vite │  ◀───────────────────────  │  Express API │  ◀──── │          │
└──────────────┘        /api/v1/*           └──────────────┘        └──────────┘
                                                   │
                                     ┌─────────────┼─────────────┐
                                     ▼             ▼             ▼
                                  Upload        Payment         OTP        (swappable providers,
                                 provider       provider      provider      mocked in dev)
```

## Backend — layered clean architecture

Each request flows through clearly separated layers, so business logic never lives in HTTP handlers
and data access never leaks into services:

```
routes/v1  →  middlewares (auth, validate)  →  controllers  →  services  →  repositories  →  models
                                                     │
                                            events/ (side effects: notifications, inventory)
```

| Layer          | Responsibility                                                        |
| -------------- | --------------------------------------------------------------------- |
| `routes/v1`    | Declares endpoints, wires middleware, versioned under `/api/v1`.      |
| `middlewares`  | Auth (JWT + roles), request validation, rate limiting, error, logging.|
| `validators`   | Zod schemas describing valid request shapes.                          |
| `controllers`  | Thin HTTP adapters — parse request, call a service, send `ApiResponse`.|
| `services`     | Business logic, orchestration, transactions. No `req`/`res`.          |
| `repositories` | The only layer that talks to Mongoose models. Extends `BaseRepository`.|
| `models`       | Mongoose schemas.                                                     |
| `events`       | In-process event bus decoupling side effects (e.g. order placed).     |
| `jobs`         | Deferred: scheduled tasks are not implemented in the current release. |

**Cross-cutting:** centralized `ApiError`/`ApiResponse`, `asyncHandler` wrapper, Winston logging,
security middleware (Helmet, CORS allowlist, rate limiting, Mongo sanitize, XSS clean), boot-time env
validation, and feature-flag definitions reserved for future capabilities.

## Frontend — feature-based architecture

```
main.jsx → app/App → providers (Redux store, Router, Toast, Theme)
                         │
      ┌──────────────────┼───────────────────────┐
   layouts/           routes/ (lazy pages)     features/ (RTK slices + RTK Query APIs)
      │                    │                        │
 components/ (ui, product, admin, common)     services/axios ──▶ backend
```

| Folder        | Responsibility                                                   |
| ------------- | ---------------------------------------------------------------- |
| `app`         | App root + provider composition.                                 |
| `routes`      | Route table, `ProtectedRoute`, `AdminRoute`, lazy-loaded pages.  |
| `layouts`     | Store / Auth / Account / Admin shells.                           |
| `pages`       | Route-level screens grouped by area.                             |
| `features`    | Redux Toolkit slices + RTK Query endpoints per domain.           |
| `components`  | Reusable UI kit + composite components.                          |
| `services`    | Axios instance, interceptors.                                    |
| `store`       | RTK store config + persistence.                                  |
| `hooks`/`lib`/`utils`/`constants` | Shared logic, formatters, helpers, config.    |
| `styles`      | Global CSS + design-system documentation & tokens.               |

## API versioning

All endpoints are namespaced under `/api/v1`. Introducing breaking changes later means adding
`/api/v2` without disturbing existing clients.

## Provider interfaces (future integrations)

`upload`, `payment`, and `otp` services depend on interfaces, not concrete SDKs. The default
implementations are mocks suitable for local development; real Cloudinary / Razorpay-Stripe /
email-SMS providers can be dropped in by implementing the same interface and flipping an env value —
no changes to controllers or services.

## Feature flags

Premium capabilities (Virtual Try-On, AI recommendations, loyalty, wallet, gift cards,
multi-language, multi-currency, PWA) have flag definitions in `backend/src/config/features.js` and
`frontend/src/constants/features.js`. They are currently disabled and not wired to runtime UI/API behavior.
