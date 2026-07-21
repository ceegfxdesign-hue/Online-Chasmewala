# HANDOFF.md — Online Chasmewala

> **Authoritative handoff document for the next AI coding agent (OpenAI Codex).**
> Generated 2026-07-21 by direct inspection of the codebase. Everything below reflects
> what **actually exists on disk today** — not the original specification. Where something
> could not be verified, it is explicitly marked as such.

---

> **Session update — 2026-07-21:** The original Phase 8 status below is
> superseded. The admin frontend and settings API are implemented, all backend
> tests pass (51/51), public `GET /offers` is available, and the four
> Playwright journeys pass. The detailed tables below are a historical snapshot;
> read `SESSION_HISTORY.md` for the current continuation record.

## 1. Project Overview

- **Name:** Online Chasmewala
- **Purpose:** Production-grade e-commerce platform for eyewear (eyeglasses, sunglasses, computer glasses, kids glasses, contact lenses, accessories) with a full customer storefront, account area, and admin API.
- **Tech stack:**
  - **Frontend:** React 18 + Vite 5, React Router 6, Redux Toolkit 2 + RTK Query, Axios, Tailwind CSS 3, Framer Motion 11, React Hook Form 7 + Zod, React Icons, react-helmet-async. Testing: Vitest + React Testing Library.
  - **Backend:** Node ≥ 20 (ESM), Express 4, Mongoose 8, JWT (access + refresh), bcryptjs, Zod validation, Winston logging. Testing: Jest + Supertest + mongodb-memory-server.
  - **Infra:** Docker (both apps) + docker-compose (mongo + backend + frontend), GitHub Actions workflows (ci.yml, deploy.yml).
- **Architecture:** Backend is strictly layered `route → validator (Zod) → controller → service → repository → model`, versioned at `/api/v1`, with an in-process event bus for side effects (notifications). Frontend is feature-foldered with RTK Query for all server state, Redux slices for client state (cart/wishlist/compare/recently-viewed persisted to localStorage), and lazy-loaded routes.
- **Design philosophy:** Original premium brand design language ("Online Chasmewala" — teal `#00A6A6` / navy `#0F172A` / cyan `#00D4D4`, Inter + Manrope). No third-party proprietary design recreated. External integrations (payment, OTP, upload) are **mock providers behind swappable interfaces**. No placeholder pages — everything registered in the router is fully implemented.
- **Current implementation status:** Phases 1–7 of a 9-phase roadmap are complete (scaffolding, design system, backend core, auth, catalog/search, cart/checkout, orders/account). **Phase 8 (admin) is half done: the entire admin backend API exists and is tested; the admin frontend UI does not exist at all.** Phase 9 (E2E tests, performance/SEO audit, final docs) has not started, though Docker/CI/docs skeletons already exist from Phase 1.

---

## 2. Current Progress

| Module | Status | Notes |
|---|---|---|
| Authentication (JWT access+refresh, OTP mock, RBAC) | ✅ Completed | Refresh rotation + reuse detection; httpOnly cookie `oc_refresh` |
| User Management (admin: list/detail/activate/role) | 🚧 Partially Implemented | Backend API + tests done; **no admin UI** |
| Product Catalog (models, CRUD, PDP, collections) | ✅ Completed | Admin CRUD is API-only (no UI) |
| Categories | ✅ Completed | Public + admin API; `/category/:slug` frontend route NOT registered (helper exists) |
| Brands | ✅ Completed | Public + admin API |
| Search (instant suggest, text search, SKU) | ✅ Completed | Debounced SearchBar + `/products/suggest` |
| Filters (facets, price slider, all frame/lens attributes) | ✅ Completed | Server facet aggregation + FilterSidebar |
| Wishlist | ✅ Completed | Local slice + server sync + merge |
| Compare | ✅ Completed | Client-side, max 4, persisted |
| Cart | ✅ Completed | Guest cart (localStorage) + server cart + merge; lens options, prescriptions |
| Checkout (address, delivery, mock payment, quote) | ✅ Completed | `tok_ok` / `tok_fail` mock tokens; COD |
| Orders (place, list, details, timeline, cancel) | ✅ Completed | Stock decrement/restock, coupon redeem |
| Reviews (write, verified purchase, likes, moderation) | ✅ Completed | 1 backend test failing — see §13 |
| Coupons (validate, redeem, admin CRUD) | ✅ Completed | Admin CRUD is API-only |
| Notifications (event-driven, read/delete) | ✅ Completed | Created by event handlers (signup, order, return) |
| Inventory (low-stock report, admin product list) | 🚧 Partially Implemented | Low-stock endpoint works off `Product.stock`; the `Inventory` ledger model exists but **nothing ever writes to it** |
| Admin Dashboard UI | ❌ Not Started | No `pages/admin/`, no AdminLayout, no adminApi.js; Navbar's "Admin Dashboard" link lands on 404 |
| Admin API (analytics, orders, returns, moderation, coupons, banners, users, reports) | ✅ Completed | Full route set, 11 Jest tests |
| Analytics (KPIs, revenue series, top products, category split, customers) | ✅ Completed (API only) | `reviewStats` service method exists but no route calls it |
| Returns & Exchanges | ✅ Completed | Customer create/list + admin lifecycle; no customer notification on admin status change |
| Banners | ✅ Completed | Public `GET /banners` + admin CRUD (API only) |
| Offers | 🚧 Partially Implemented | `Offer` model + 3 seeded offers + repository exist; **no route/controller/service — unreachable via API** |
| Settings (store config) | 🚧 Partially Implemented | `Settings` model + singleton used internally for shipping/tax; **no admin GET/PATCH endpoint** |
| Uploads | 🚧 Partially Implemented | Mock uploadProvider exists but is never mounted; `multer` installed, never imported; Cloudinary commented out |
| Feature Flags | 🚧 Partially Implemented | `config/features.js` (BE) + `constants/features.js` (FE) exist with 8 flags — **neither is imported anywhere** |
| Scheduled Jobs (cron) | ❌ Not Started | `node-cron` installed; no `jobs/` directory, never imported |
| Documentation (docs/, design-system docs) | ✅ Completed | All 7 docs + 12 design-system docs exist; README roadmap checkboxes stale (shows only Phase 1 done) |
| Testing — backend unit/integration | ✅ Completed | 50 tests / 7 suites (49 passing — see §13) |
| Testing — frontend component | ✅ Completed | 17 tests / 3 files, all passing |
| Testing — E2E (Playwright) | ❌ Not Started | Not installed in either package.json |
| Deployment (Docker, compose, CI/CD) | 🚧 Partially Implemented | Dockerfiles + compose + workflows exist; deploy.yml has an invalid `secrets` usage (see §13); **not a git repo**, CI never run |
| Performance/SEO audit (Lighthouse targets) | ❌ Not Started | Code splitting/lazy loading/meta tags in place, but no audit performed |

---

## 3. Current Folder Structure

Only folders/files that exist today (node_modules, dist, package-lock omitted):

```
online Chasmewala/
├── HANDOFF.md                  ← this file
├── README.md                   (stale roadmap checkboxes — see §13)
├── docker-compose.yml          (mongo + backend + frontend)
├── .editorconfig  .gitignore
├── .github/workflows/          ci.yml, deploy.yml
├── .claude/settings.local.json
├── docs/                       api.md, architecture.md, components.md,
│                               deployment.md, env.md, er-diagram.md, setup.md
├── backend/
│   ├── Dockerfile  .dockerignore  .env  .env.example
│   ├── .eslintrc.json  .prettierrc.json  jest.config.json  nodemon.json  package.json
│   ├── src/
│   │   ├── app.js  server.js  seed.js
│   │   ├── config/         db.js, env.js, features.js, logger.js
│   │   ├── constants/      index.js
│   │   ├── controllers/    account, admin, auth, brand, cart, category,
│   │   │                   coupon, order, product, review, wishlist  (11)
│   │   ├── events/         eventBus.js, handlers.js
│   │   ├── middlewares/    auth, error, rateLimit, sanitize, validate  (5)
│   │   ├── models/         User, Product, Category, Brand, Order, Cart, Review,
│   │   │                   Coupon, Offer, Banner, Notification, Return,
│   │   │                   RecentlyViewed, Inventory, Settings + index.js  (15+1)
│   │   ├── repositories/   BaseRepository.js, index.js  (15 singletons)
│   │   ├── routes/v1/      account, admin, auth, banner, brand, cart, category,
│   │   │                   coupon, health, order, product, wishlist + index.js  (13)
│   │   ├── services/       admin-user, analytics, auth, banner, brand, cart,
│   │   │                   category, coupon, notification, order, product,
│   │   │                   return, review, user, wishlist  (15)
│   │   │   └── providers/  otpProvider.js, paymentProvider.js, uploadProvider.js
│   │   ├── utils/          ApiError, ApiResponse, asyncHandler, pagination,
│   │   │                   seedData, token  (6)
│   │   └── validators/     account, admin, auth, catalog, product, shop  (6)
│   └── tests/              setup.js + account, admin, auth, catalog, checkout,
│                           health, seed  (7 test files, 50 cases)
└── frontend/
    ├── Dockerfile  nginx.conf  .dockerignore  .env  .env.example
    ├── .eslintrc.cjs  .prettierrc.json  index.html  package.json
    ├── postcss.config.js  tailwind.config.js  vite.config.js
    ├── public/favicon.svg
    └── src/
        ├── main.jsx
        ├── app/            App.jsx, App.test.jsx
        ├── components/
        │   ├── account/    StatusBadge.jsx
        │   ├── cart/       CouponField.jsx, OrderSummary.jsx
        │   ├── common/     ContentPage, LegalPage, Logo, Newsletter,
        │   │               ScrollToTop, SectionHeading
        │   ├── home/       FeaturedBrands.jsx, ShopByFaceShape.jsx
        │   ├── layout/     AnnouncementBar, CartDrawer, Footer, MegaMenu,
        │   │               MobileMenu, Navbar, SearchBar
        │   ├── product/    FilterSidebar, PincodeChecker, ProductCard,
        │   │               ProductCarousel, ProductGallery, ReviewsSection
        │   └── ui/         23 components + index.js barrel + ui.test.jsx
        ├── constants/      config.js, features.js, filters.js, navigation.js, routes.js
        ├── contexts/       ToastContext.jsx
        ├── features/       account/accountApi, auth/authSlice, cart/{cartApi,cartSlice},
        │                   compare/compareSlice, products/productApi,
        │                   recentlyViewed/recentlyViewedSlice, ui/uiSlice,
        │                   wishlist/wishlistSlice
        ├── hooks/          useAuth, useDebounce, useFocusTrap, useLockBodyScroll,
        │                   useMediaQuery, useOnClickOutside
        ├── layouts/        AccountLayout, AuthLayout, StoreLayout   (NO AdminLayout)
        ├── lib/            format.js, motion.js, storage.js, validators.js
        ├── pages/
        │   ├── account/    10 pages (Profile, MyOrders, OrderDetails, Addresses,
        │   │               Cards, Coupons, Notifications, Returns, MyReviews, Settings)
        │   ├── auth/       5 pages (Login, Signup, ForgotPassword, OTP, ResetPassword)
        │   ├── legal/      3 pages (Privacy, Terms, RefundPolicy)
        │   └── store/      14 pages (Home, Products, ProductDetails, SearchResults,
        │                   Compare, Cart, Wishlist, Checkout, OrderSuccess,
        │                   OrderFailed, About, Contact, FAQ, NotFound)
        │                   (NO pages/admin/)
        ├── routes/         AppRoutes.jsx, ProtectedRoute.jsx, AdminRoute.jsx (unused)
        ├── services/       api.js (axios), baseApi.js (RTK Query)
        ├── store/          store.js
        ├── styles/         globals.css + design-system/ (12 .md docs)
        ├── test/           setup.js
        └── utils/          cn.js
```

Notable absences: `frontend/src/assets/` does not exist (logo is inline SVG in `Logo.jsx`), `backend/src/jobs/` does not exist, no `.git` directory (not a git repository).

---

## 4. Components

### UI kit (`frontend/src/components/ui/` — all exported via `index.js` barrel)

| Component | Purpose / API |
|---|---|
| Button | Variants `primary\|secondary\|outline\|ghost\|subtle\|danger\|link`; sizes `sm\|md\|lg\|icon`; `loading`, `fullWidth`, `leftIcon/rightIcon`, polymorphic `as` (e.g. `as={Link}`) |
| Card (+CardHeader/CardBody/CardFooter) | Elevations `flat\|soft\|card\|elevated`, `hoverable` |
| Modal | Sizes `sm\|md\|lg\|xl`; focus trap, scroll lock, Esc/backdrop close |
| Drawer | Left/right slide panel; used by cart drawer, mobile menu, mobile filters |
| Input / Textarea / Select / Checkbox / Radio | Label + error + helper + aria wiring; forwarded refs (React Hook Form compatible) |
| Badge | Variants `brand\|navy\|success\|error\|warning\|neutral\|accent` |
| Skeleton (+ProductCardSkeleton) | Loading placeholders |
| Accordion, Tabs, Tooltip, Breadcrumb, Pagination, PriceSlider, Chip, EmptyState, RatingStars, Loader, Spinner, Portal | Standard a11y-conscious primitives; Pagination windows with ellipsis; RatingStars supports interactive mode |

Dependencies: all use `cn()` (clsx + tailwind-merge); overlays use `useFocusTrap` + `useLockBodyScroll` + `Portal`; motion presets from `lib/motion.js`.

### Feature components

- **layout/**: `Navbar` (sticky; mega menu; account dropdown; shows "Admin Dashboard" link → `/admin` for admins — **currently a 404**), `MegaMenu`, `MobileMenu`, `SearchBar` (debounced suggestions), `CartDrawer` (global mini-cart), `Footer`, `AnnouncementBar`.
- **product/**: `ProductCard`, `ProductCarousel` (custom scroll-snap; **not** Swiper), `ProductGallery` (thumbs, hover zoom, lightbox), `FilterSidebar` (all facet groups), `ReviewsSection`, `PincodeChecker` (deterministic local estimate, no courier API).
- **cart/**: `OrderSummary` (presentational price breakdown), `CouponField` (validate + list offers).
- **account/**: `StatusBadge` (`OrderStatusBadge`, `ReturnStatusBadge`).
- **home/**: `FeaturedBrands`, `ShopByFaceShape`.
- **common/**: `Logo` (inline SVG wordmark, light/dark variant), `ContentPage`, `LegalPage`, `Newsletter` (client-side only), `ScrollToTop`, `SectionHeading`.

**Status: all implemented and consumed. There is no `components/admin/` folder.**

---

## 5. Backend

- **Controllers (11):** `auth`, `product`, `category`, `brand`, `cart`, `wishlist`, `coupon`, `order`, `review`, `account` (18 methods: profile/password/addresses/cards/returns/notifications/my-reviews), `admin` (27 methods: analytics ×7, inventory ×2, orders ×2, returns ×2, reviews ×2, coupons ×4, banners ×4, users ×4). Banner + health routes use inline handlers (no controller file).
- **Services (15 + 3 providers):** `auth` (refresh rotation, reuse-detection wipes sessions, max 5 tokens, OTP hash w/ 10-min TTL), `product` (filter builder, facet aggregations, collections, suggest, admin CRUD), `cart` (server-authoritative `hydrate()` re-pricing, lens options), `order` (quote/create/cancel/adminList/updateStatus; mock payment; stock decrement + restock), `coupon`, `review` (verified-purchase detection, rating recompute, moderation), `return`, `user` (profile/addresses/cards), `wishlist`, `notification`, `banner`, `brand`, `category`, `analytics` (dashboard KPIs, revenue series, top products, category split, customer stats, low stock, sales report), `admin-user` (self-lockout guards). Providers: `paymentProvider` (mock; `tok_fail` declines), `otpProvider` (mock; returns devCode outside prod), `uploadProvider` (mock; **never mounted anywhere**).
- **Repositories:** `BaseRepository` (create/find/paginate/aggregate/update/delete) + specialized subclasses (UserRepository.findByEmail, ProductRepository.findBySlug, OrderRepository.findByNumber, CouponRepository.findByCode). 15 singletons; `offerRepository`, `recentlyViewedRepository`, `inventoryRepository` are exported but never used.
- **Models (15):** See §7.
- **Middlewares (5):** `auth` (`protect`, `authorize(roles)`, `optionalAuth` — the latter unused), `error` (`notFound` + `errorHandler` normalizing Mongoose/JWT errors), `rateLimit` (`authLimiter` 20/15min on auth routes), `sanitize` (recursive XSS clean of body+query), `validate` (Zod safeParse → 422 with field errors).
- **Validators (6 files):** Zod schemas per resource — `auth`, `product`, `catalog` (category/brand), `shop` (cart/wishlist/coupon/order), `account`, `admin`.
- **Utilities:** `ApiError` (status factories), `ApiResponse` (`sendSuccess`/`sendCreated`/`sendNoContent` → `{success, message, data, meta?}` envelope), `asyncHandler`, `pagination` (`getPagination`/`buildMeta`), `token` (JWT sign/verify, sha256 hash, OTP gen, refresh cookie opts), `seedData` (full seed).
- **Events:** `eventBus` + handlers for USER_REGISTERED, ORDER_PLACED, ORDER_STATUS_CHANGED, RETURN_REQUESTED (→ notifications), LOW_STOCK (log only, never emitted). REVIEW_CREATED is emitted but unhandled; ORDER_CANCELLED defined but never emitted.
- **App wiring (`app.js`):** helmet, CORS allowlist (`env.corsOrigins`), compression, cookie-parser, express-mongo-sanitize, hpp, xssSanitizer, morgan→Winston, `registerEventHandlers()`, `/api/v1` router, notFound + errorHandler. `server.js` connects DB, listens, graceful shutdown.

---

## 6. API Reference

Base URL `http://localhost:5000/api/v1`. Envelope: success `{success:true, message, data, meta?}`; error `{success:false, message, errors?}`. Auth = `Authorization: Bearer <accessToken>`; refresh token in httpOnly cookie `oc_refresh`. All endpoints below exist and are wired; ✅ = covered by a passing Jest test.

### Health & Auth
| Method | URL | Auth | Notes | Status |
|---|---|---|---|---|
| GET | `/health` | Public | uptime + dbStatus | ✅ |
| POST | `/auth/register` | Public (rate-limited) | `{name,email,password}` → user + accessToken + cookie | ✅ |
| POST | `/auth/login` | Public (rate-limited) | `{email,password}` | ✅ |
| POST | `/auth/refresh` | Cookie | rotates refresh token | ✅ |
| POST | `/auth/logout` | Cookie | revokes token, clears cookie | ✅ |
| GET | `/auth/me` | Bearer | current profile | ✅ |
| POST | `/auth/otp/request` | Public (rate-limited) | mock delivery; returns `devCode` outside prod | ✅ |
| POST | `/auth/otp/verify` | Public | verifies; optional `newPassword` resets password | ✅ |

### Catalog (public)
| Method | URL | Notes | Status |
|---|---|---|---|
| GET | `/products` | Full filter set (search, category, brand, gender, frameShape/Type/Material, lensType, faceShape, color, frameSize, rimType, minPrice/maxPrice, minRating, blueLightFilter, polarized, uvProtection, inStock, onOffer, tags) + 7 sorts + pagination | ✅ |
| GET | `/products/facets` | Aggregated filter counts + price range | ✅ |
| GET | `/products/collections` | bestSellers / trending / newArrivals / featured (12 each) | ✅ |
| GET | `/products/suggest?q=` | Instant search: products/brands/categories | ✅ |
| GET | `/products/:slug` | PDP payload (populated category/brand) | ✅ |
| GET | `/products/:slug/related` | Same-category rail | ✅ |
| GET | `/products/:slug/reviews` (+`/summary`) | Approved reviews, star distribution | ✅ |
| GET | `/categories`, `/categories/:slug` | With product counts | ✅ |
| GET | `/brands`, `/brands/:slug` | | ✅ |
| GET | `/banners?placement=` | Active banners in date window | ✅ |
| GET | `/coupons` | Active public coupons | ✅ |

### Shop (Bearer required)
| Method | URL | Notes | Status |
|---|---|---|---|
| GET/DELETE | `/cart` | Hydrated server cart / clear | ✅ |
| POST | `/cart/items` · PATCH/DELETE `/cart/items/:itemId` | qty 0 deletes; clamps to stock | ✅ |
| POST | `/cart/merge` | Merge guest cart on login | ✅ |
| GET | `/wishlist` · POST `/wishlist/toggle` · DELETE `/wishlist/:productId` · POST `/wishlist/merge` | | ✅ |
| POST | `/coupons/validate` | `{code, subtotal?}` → discount | ✅ |
| POST | `/orders/quote` | Checkout pricing preview | ✅ |
| POST | `/orders` | Place order; mock payment `tok_ok`/`tok_fail` (402 on fail), `cod` skips capture | ✅ |
| GET | `/orders` · GET `/orders/:orderNumber` · POST `/orders/:orderNumber/cancel` | Cancel restocks + marks refund | ✅ |
| POST | `/products/:slug/reviews` | One per user/product; auto verified-purchase | ⚠ 1 failing test (§13) |
| POST | `/products/reviews/:id/like` | Toggle helpful | ✅ |

### Account (Bearer required) — all ✅
`PATCH /account/profile` · `POST /account/change-password` · `GET/POST /account/addresses` · `PATCH/DELETE /account/addresses/:id` · `GET/POST /account/cards` · `DELETE /account/cards/:id` · `POST/GET /account/returns` · `GET /account/returns/:returnNumber` · `GET /account/notifications` · `PATCH /account/notifications/:id/read` · `POST /account/notifications/read-all` · `DELETE /account/notifications/:id` · `GET /account/reviews` · `DELETE /account/reviews/:id`

### Admin (Bearer + admin role) — all ✅ (11 admin tests)
- **Analytics:** `GET /admin/analytics/dashboard` (8 KPIs), `/analytics/revenue?range=7d|30d|90d|12m`, `/analytics/top-products`, `/analytics/category-split`, `/analytics/order-status`, `/analytics/customers`, `GET /admin/reports/sales?from=&to=`
- **Inventory:** `GET /admin/inventory/low-stock`, `GET /admin/products` (search, lowStock filter, includes inactive)
- **Orders:** `GET /admin/orders`, `PATCH /admin/orders/:id/status` `{status, note?}`
- **Returns:** `GET /admin/returns`, `PATCH /admin/returns/:id/status`
- **Reviews:** `GET /admin/reviews`, `PATCH /admin/reviews/:id/moderate` `{status}`
- **Coupons:** `GET/POST /admin/coupons`, `PATCH/DELETE /admin/coupons/:id`
- **Banners:** `GET/POST /admin/banners`, `PATCH/DELETE /admin/banners/:id`
- **Users:** `GET /admin/users`, `GET /admin/users/:id` (order count + total spent), `PATCH /admin/users/:id/active`, `PATCH /admin/users/:id/role` (self-lockout guards)
- **Catalog CRUD (mounted under resources):** `POST/PATCH/DELETE /products[...]`, `/categories[...]`, `/brands[...]`

**Endpoints that DO NOT exist:** any Offers API, admin Settings GET/PATCH, any upload endpoint, `reviewStats` analytics route.

---

## 7. Database

MongoDB via Mongoose 8. Default local URI `mongodb://127.0.0.1:27017/online-chasmewala` (docker-compose uses `mongodb://mongo:27017/online-chasmewala`). **Note: a persistent memory record states MongoDB is not installed locally on this machine; tests use mongodb-memory-server, and docker-compose provides mongo — could not verify a local mongod.**

**Models & relationships** (full field lists live in the schemas — `backend/src/models/`):

| Model | Key relationships | Key indexes |
|---|---|---|
| User | wishlist → Product[]; embedded addresses[], savedCards[] (last4 + token only, no PAN) | email (unique) |
| Product | category → Category, brand → Brand; embedded variants[] | text(name, description, tags, sku), slug/sku unique, ~15 filter-field indexes |
| Order | user → User; items[].product → Product (with name/slug/image/price snapshots) | orderNumber unique, user, status |
| Cart | user → User (unique); items[].product → Product | user |
| Review | product → Product, user → User, likes → User[] | **unique compound (product, user)**, status |
| Coupon | usedBy[].user → User | code unique |
| Return | order → Order, user → User | returnNumber unique |
| Category | parent → Category (self-ref) | slug unique |
| Brand | — | slug unique |
| Notification | user → User | user, isRead |
| Offer | categories/brands/products refs | isActive |
| Banner | — | placement, isActive |
| RecentlyViewed | user (unique), products[].product | user — **model exists, no write path** |
| Inventory | product, createdBy → User | product — **ledger model exists, never written to** |
| Settings | singleton (`key: 'global'`), static `getSingleton()` | key unique |

**Schema conventions:** pre-validate slugify hooks (Product/Category/Brand), pre-save bcrypt (User), pre-validate number generators (Order `OC-XXXXX-NNNNNN`, Return `RET-...`), toJSON transform strips secrets on User.

**Seed (`npm run seed`, `npm run seed:destroy`):** 6 categories, 6 brands, **26 products** (picsum.photos images, up to 3 color variants each), 2 users (**admin@onlinechasmewala.com / Admin@123**, **demo@onlinechasmewala.com / Demo@123**), 3 banners, 3 offers, 3 coupons (WELCOME10, FLAT200, STUDENT15), 6 reviews (by demo user on first 6 products), Settings singleton.

---

## 8. Frontend Architecture

- **Routing (`src/routes/AppRoutes.jsx`):** all pages lazy via `React.lazy` + Suspense (fullscreen Loader). Three shells: `StoreLayout` (storefront + legal + nested protected `AccountLayout` under `/account/*`), `AuthLayout` (5 auth pages). `ProtectedRoute` waits for auth bootstrap then redirects to `/login` with `state.from`. `AdminRoute.jsx` exists but is **not imported anywhere**; no `/admin/*` routes are registered (they 404). `ROUTES` map in `constants/routes.js` already defines 13 admin paths + a `category(slug)` helper whose route is also unregistered.
- **State management:** Redux Toolkit store with slices: `auth` (thunks bootstrapAuth/login/register/logout; token kept **in memory only**), `cart`, `wishlist`, `compare` (max 4), `recentlyViewed` (max 12), `ui` (drawer/menu flags). Cart/wishlist/compare/recentlyViewed persist to localStorage under `oc:` keys via small persist middlewares.
- **RTK Query (`services/baseApi.js`, axios-based baseQuery, 15 tagTypes):** endpoints injected per feature — `productApi` (catalog + 4 admin product endpoints, hooks exported but unconsumed), `cartApi` (cart/wishlist/coupons/orders), `accountApi` (profile/addresses/cards/returns/notifications/reviews). **There is no adminApi.js.**
- **Axios (`services/api.js`):** `withCredentials: true`; request interceptor attaches in-memory Bearer token; response interceptor performs single-flight `POST /auth/refresh` on 401, replays the original request, and calls `onAuthCleared` → `dispatch(clearAuth())` on failure. `normalizeError` → `{status, message, errors}`.
- **Hooks:** `useAuth`, `useDebounce`, `useFocusTrap`, `useLockBodyScroll`, `useMediaQuery`, `useOnClickOutside`.
- **Contexts:** `ToastContext` only — `useToast().success/error/warning/info`, portal-rendered, aria-live, auto-dismiss.
- **Layouts:** `StoreLayout` (skip link, AnnouncementBar, Navbar, Outlet, Footer, CartDrawer), `AuthLayout` (split-screen brand panel), `AccountLayout` (avatar header + 10-item sidebar, mobile scroll tabs). **No AdminLayout.**

---

## 9. Design System

Documented in `frontend/src/styles/design-system/` (12 files: README, colors, typography, spacing, grid, buttons, forms, cards, icons, motion, accessibility, tokens). Token source of truth = `tailwind.config.js` + CSS vars in `globals.css`.

- **Colors:** `brand` teal scale 50–900 (500 = `#00a6a6`), `accent` cyan (500 = `#00d4d4`), `navy` 50–900 (900 = `#0f172a`), semantic `success #16a34a` / `error #dc2626` / `warning #f59e0b` (each with light/dark), `surface` white / muted `#f8fafc` / subtle `#f1f5f9`. CSS vars: `--color-brand`, `--color-accent`, `--color-navy`, `--radius-card`, `--space-section`.
- **Typography:** `font-sans` Inter, `font-display` Manrope (Google Fonts in index.html). Scale: `display` 3.5rem/800 → `h1` 2.5/700 → `h2` 2/700 → `h3` 1.5/600 → `h4` 1.25/600 → `caption` 0.8125rem.
- **Spacing/Grid:** Tailwind defaults + `.container-page` utility; container centered, 2xl = 1280px; section rhythm via `--space-section` (4rem).
- **Radii/Shadows:** rounded-2xl cards / rounded-xl controls; shadows `soft`, `card`, `elevated`, `glass`, `focus` (brand ring).
- **Motion:** Framer presets in `lib/motion.js` (fadeIn, slideUp, scaleIn, stagger, pageTransition, overlay, drawerLeft/Right, modalPop, hoverLift) with easing `cubic-bezier(0.22,1,0.36,1)`; global `prefers-reduced-motion` kill-switch in globals.css; Tailwind keyframes fade-in/slide-up/shimmer/scale-in.
- **Icons:** react-icons (Feather `Fi*` set predominantly); logo is a custom inline SVG.
- **Accessibility:** skip link, `:focus-visible` brand ring, focus traps in overlays, aria-live toasts, `aria-current` breadcrumbs, form error wiring; eslint-plugin-jsx-a11y active.
- **Responsive strategy:** mobile-first Tailwind breakpoints; Drawer-based filters/menu on mobile; `darkMode: 'class'` configured but no dark theme UI is implemented.

---

## 10. Environment Variables

### Backend (`backend/.env.example`; validated by Zod in `src/config/env.js` — boot fails fast on invalid)
`NODE_ENV`, `PORT` (5000), `API_PREFIX` (/api/v1), `MONGODB_URI`, `CLIENT_URL` (CORS allowlist, comma-separable), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`, `BCRYPT_SALT_ROUNDS`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `LOG_LEVEL`, `UPLOAD_PROVIDER` (mock|cloudinary — only mock implemented), `PAYMENT_PROVIDER` (mock|razorpay|stripe — only mock), `OTP_PROVIDER` (mock|email|sms — only mock), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

⚠ `env.js` also validates `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults `admin@onlinechasmewala.com` / `Admin@123`) — these are **missing from .env.example**.

### Frontend (`frontend/.env.example`)
Active: `VITE_API_URL` (default `http://localhost:5000/api/v1`), `VITE_APP_NAME`.
Present as commented-out placeholders: `VITE_FEATURE_VIRTUAL_TRY_ON`, `VITE_FEATURE_AI_RECOMMENDATIONS`, `VITE_FEATURE_LOYALTY`, `VITE_FEATURE_WALLET`, `VITE_FEATURE_GIFT_CARDS`, `VITE_FEATURE_MULTI_LANGUAGE`, `VITE_FEATURE_MULTI_CURRENCY`, `VITE_FEATURE_PWA`.

Real `.env` files exist in both apps (not committed; .gitignore keeps only examples).

---

## 11. Installed Packages

### Backend dependencies
`bcryptjs`, `compression`, `cookie-parser`, `cors`, `dotenv`, `express ^4.19`, `express-mongo-sanitize`, `express-rate-limit`, `helmet`, `hpp`, `jsonwebtoken`, `mongoose ^8.5`, `morgan`, `multer` (**unused**), `node-cron` (**unused**), `slugify`, `winston`, `xss`, `zod`.
Dev: `cross-env`, `eslint` (+prettier config, import plugin), `jest`, `mongodb-memory-server`, `nodemon`, `prettier`, `supertest`.

### Frontend dependencies
`@reduxjs/toolkit ^2.2`, `axios ^1.7`, `clsx`, `framer-motion ^11`, `react ^18.3`, `react-dom`, `react-helmet-async`, `react-hook-form ^7.52`, `react-icons ^5`, `react-redux ^9`, `react-router-dom ^6.26`, `recharts ^2.12` (**unused — reserved for admin charts**), `swiper ^11` (**unused — carousels are custom**), `tailwind-merge`, `zod ^3.23`.
Dev: `@testing-library/*`, `@vitejs/plugin-react`, `@vitest/coverage-v8`, `autoprefixer`, `eslint` (+react, react-hooks, jsx-a11y, prettier), `jsdom`, `postcss`, `prettier`, `tailwindcss ^3.4`, `vite ^5.4`, `vitest ^2`.

---

## 12. Remaining Work (prioritized)

### Priority 1 — Admin frontend (finishes Phase 8; backend is ready and tested)
1. `features/admin/adminApi.js` — RTK Query endpoints for every `/admin/*` route in §6.
2. `layouts/AdminLayout.jsx` — sidebar nav (dashboard, orders, products, categories, brands, inventory, coupons, banners, reviews, returns, users, reports, settings) + topbar.
3. Register `/admin/*` routes in `AppRoutes.jsx` wrapped in the **existing unused `AdminRoute`** (paths already defined in `constants/routes.js`).
4. Admin pages: Dashboard (KPI cards + Recharts revenue/category/status charts — **recharts is already installed and pre-chunked in vite.config**), Orders (list + status stepper), Products CRUD (productApi admin hooks already exist), Categories/Brands CRUD, Coupons CRUD, Banners CRUD, Reviews moderation, Returns management, Users management, Inventory/low-stock, Reports, Settings.

### Priority 2 — Close backend gaps surfaced in §13/§14
1. Admin Settings endpoints (`GET/PATCH /admin/settings`) — model + singleton ready.
2. Fix the failing review test (409 vs 201) — see §13.
3. Offers API (model + seed exist; expose at least public `GET /offers`; CouponField references offers).
4. Emit ORDER_CANCELLED; handle REVIEW_CREATED; emit LOW_STOCK after stock decrement (handler already exists); notify customer on return status change.
5. Add `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` to `.env.example`; update stale README roadmap checkboxes.

### Priority 3 — Phase 9: quality & deployment readiness
1. Playwright E2E (browse → PDP → cart → auth → checkout → order tracking; admin CRUD) — not installed yet.
2. Fix `deploy.yml` invalid `secrets` in step-`if` (move to job-level `env` + `if: env.X != ''`); add Mongo service or rely on memory-server in `ci.yml`; initialize git repo.
3. Lighthouse audit against targets (≥90 perf / ≥95 a11y / ≥95 SEO / ≥95 best practices); add JSON-LD product schema, OG tags audit.
4. Register `/category/:slug` route or drop the `ROUTES.category` helper; decide fate of unused deps (`swiper`, `multer`, `node-cron`) — either use or remove.
5. Wire feature flags (`constants/features.js` / `config/features.js`) into at least the Virtual Try-On banner, or remove.

### Priority 4 — Deferred integrations (mock → real, interfaces ready)
Cloudinary upload provider + admin image upload UI (multer), Razorpay/Stripe payment provider, email/SMS OTP provider, cron jobs (abandoned cart, offer expiry, low-stock scan), RecentlyViewed server persistence, Inventory ledger writes.

---

## 13. Known Issues

1. **Failing backend test (1/50):** `tests/account.test.js` → "writes a review (verified when purchased), lists and deletes it" expects `201`, receives **`409 Conflict`** from `POST /products/:slug/reviews`. The service enforces one review per user/product (unique compound index). Root cause not yet diagnosed — plausibly the test's order/product collides with another review created in the same suite run. **Do not "fix" by removing the uniqueness guard;** diagnose the test data.
2. **`/admin` links to a 404:** Navbar shows "Admin Dashboard" for admin users but no admin routes exist in the router.
3. **`deploy.yml` is invalid as written:** uses `secrets.X` inside step-level `if:` conditions, which GitHub Actions does not allow. Will fail workflow validation when pushed.
4. **`ci.yml` backend job** sets `MONGODB_URI` to a localhost Mongo but defines **no Mongo service container** (tests actually use mongodb-memory-server, so this env var is misleading but harmless); the job also runs no backend build step despite its name.
5. **Not a git repository** — no `.git`, so CI/CD has never run; README's `git clone` instructions assume a remote that doesn't exist yet.
6. **Stale README:** roadmap checkboxes show only Phase 1 complete; actual state is Phases 1–7 + admin backend.
7. **`docs/api.md` self-contradiction:** one line still says returns/addresses/notifications/admin are "planned" while the same file documents them below.
8. **Dead/unused code (technical debt):** `optionalAuth` middleware, `analyticsService.reviewStats`, `paymentProvider.createIntent/refund`, offer/recentlyViewed/inventory repositories, `Inventory` + `RecentlyViewed` models (no write paths), feature-flag modules on both sides, `swiper`, `recharts` (reserved for admin), `multer`, `node-cron`, `sendNoContent`, several constants (`TOKEN_TYPES`, `RIM_TYPES`, `PRODUCT_CATEGORIES`), `AdminRoute.jsx`.
9. **Client-only stubs by design:** Newsletter form, Contact form (toast only, no backend endpoint), PincodeChecker (deterministic local estimate).
10. **Review-writing UX nuance:** Order item snapshots carry `slug`, and OrderDetailsPage gates "Write review" on `item.slug` being present — orders created before the slug snapshot field was added would not show the button (only relevant to pre-existing dev data).
11. **MongoDB availability:** local mongod could not be verified on this machine; use `docker compose up mongo` or Atlas for live runs (tests don't need it — memory server).

---

## 14. Important Architectural Decisions (do not change)

1. **Layered backend (`route → validator → controller → service → repository → model`):** controllers stay thin/HTTP-only; ALL business logic in services; ALL Mongo access through repositories. Keeps logic testable and providers swappable.
2. **Response envelope** `{success, message, data, meta?}` via `ApiResponse` + centralized `ApiError` factories and `errorHandler`. Every new endpoint must use these — the frontend's `normalizeError` and RTK Query layer depend on the shape.
3. **JWT strategy:** short-lived access token **in memory only on the client** (never localStorage — XSS hardening), refresh token in httpOnly cookie `oc_refresh` with rotation + reuse detection (reuse wipes all sessions). The axios interceptor does single-flight refresh. Changing this weakens security deliberately built in.
4. **Server-authoritative cart pricing:** `cartService.hydrate()` re-derives all prices from live products on every read; client subtotals are display-only. Order items store immutable snapshots (name/slug/image/price).
5. **Provider interfaces** (`services/providers/`): payment/OTP/upload are selected by env var; real implementations (Razorpay/Stripe, email/SMS, Cloudinary) drop in without touching call sites. Mock is dev/test default.
6. **Zod everywhere:** backend request validation via `validate({body,query,params})` middleware; frontend forms via React Hook Form + the **hand-rolled `zodResolver` in `lib/validators.js`** (deliberate choice to avoid `@hookform/resolvers` — keep using it).
7. **RTK Query for all server state**, injected per-feature into a single `baseApi` with tag-based invalidation; Redux slices only for client-local state, persisted with the tiny `oc:`-prefixed storage helpers (no redux-persist).
8. **Design tokens single source:** `tailwind.config.js` + CSS vars in `globals.css`; components consume semantic classes (`brand-500`, `text-h4`, `shadow-card`). Don't hardcode hex values in components.
9. **Event bus for side effects:** notifications are created by event handlers, not inline in services — keep new side effects (emails, low-stock alerts) on the bus.
10. **API versioning** under `/api/v1` (prefix configurable via `API_PREFIX`); ESM (`"type": "module"`) in the backend with Jest running under `--experimental-vm-modules` (this is why plain `npx jest` fails — always use `npm test`).

---

## 15. Files That Should Not Be Modified (without strong reason)

| File | Why |
|---|---|
| `backend/src/utils/ApiError.js`, `ApiResponse.js`, `asyncHandler.js` | Response contract used by every endpoint and the frontend error normalizer |
| `backend/src/middlewares/error.middleware.js`, `auth.middleware.js` | Security + error normalization backbone; auth tests depend on exact behavior |
| `backend/src/services/auth.service.js`, `utils/token.js` | Refresh rotation/reuse-detection security model; subtle and fully tested |
| `backend/src/config/env.js` | Fail-fast env validation; other modules import the parsed `env` object |
| `backend/src/repositories/BaseRepository.js` | Contract for every repository (`paginate` returns `{data,total}`) |
| `frontend/src/services/api.js`, `baseApi.js` | In-memory token + single-flight refresh + RTK Query bridge; everything depends on them |
| `frontend/src/store/store.js` | Persist middleware wiring for 4 slices |
| `frontend/tailwind.config.js`, `src/styles/globals.css` | Design-token source of truth for the entire UI |
| `frontend/src/components/ui/*` + `index.js` barrel | Shared design-system kit consumed by all 32 pages; changes ripple everywhere |
| `backend/src/utils/seedData.js` | Tests (`seed.test.js`) and demo credentials in README/docs depend on its output |
| `backend/tests/setup.js`, `frontend/src/test/setup.js` | Test harness (memory server / DOM stubs) |
| `docker-compose.yml`, both `Dockerfile`s | Working deployment path documented in docs/deployment.md |

---

## 16. Coding Standards

- **Naming:** backend files `<resource>.<layer>.js` (`order.service.js`, `admin.validator.js`); models PascalCase; frontend components/pages PascalCase `.jsx` (`ProductDetailsPage.jsx`), hooks `useX.js`, slices `xSlice.js`, RTK APIs `xApi.js`.
- **Folder organization:** feature-first on the frontend (`features/<domain>/`), layer-first on the backend. UI primitives only in `components/ui`, feature components grouped by domain folder.
- **Import order (frontend):** React/libs → RTK Query hooks/features → components (`@/components/...`) → hooks/contexts → lib/constants/utils. `@` aliases `src/` (vite.config). Backend uses relative ESM imports **with explicit `.js` extensions** (required by Node ESM).
- **Component structure:** function components only; `export default` for pages, named exports for shared components; props destructured with defaults; `cn()` for conditional classes; forms = React Hook Form + zod schema at top of file + `zodResolver` from `lib/validators`; server calls via RTK Query hooks with `.unwrap()` in try/catch → `toast` feedback.
- **Service structure (backend):** plain object export (`export const xService = { async method() {} }`), JSDoc header comment per file, throw `ApiError.xxx()` — never raw errors; repositories injected via module imports.
- **API conventions:** REST resources, kebab/plural paths, PATCH for partial updates, `:slug` for public reads / `:id` (Mongo ObjectId, validated) for admin writes; pagination via `?page&limit` → `meta` from `buildMeta`.
- **Error handling style:** backend throws typed `ApiError` inside `asyncHandler`-wrapped controllers; frontend catches `err?.message` from normalized errors and shows toasts; loading states use Skeletons, empty states use `EmptyState`.
- **Formatting/linting:** Prettier (2-space, single quotes, semicolons, 100–110 print width) + ESLint (backend: import plugin; frontend: react/react-hooks/jsx-a11y). `npm run lint` is clean in both apps — keep it that way. No TODO/FIXME comments exist in src; the project convention is to fully implement or not include.

---

## 17. Verification Status (verified 2026-07-21 on this machine)

| Check | Result |
|---|---|
| Backend `npm run lint` | ✅ Clean |
| Backend `npm test` | ⚠ **49/50 pass** — 7 suites, 1 failure: account.test.js review-write returns 409 (see §13.1) |
| Frontend `npm run lint` | ✅ Clean |
| Frontend `npm test` | ✅ 17/17 pass (3 files) |
| Frontend `npm run build` | ✅ Succeeds (~200 kB main chunk gzipped ~64 kB; react/redux/motion/charts split) |
| Working features (verified by tests/build) | Auth flows, catalog/filters/facets/search, cart/wishlist/coupons, checkout + mock payment + cancel/restock, full account area, all admin APIs |
| Known failing/unproven areas | 1 review test; `/admin` UI (absent); deploy.yml (invalid, never run); CI (never run — no git repo); Lighthouse targets (never measured); E2E (absent); live local-Mongo run (mongod availability unverified — use docker compose) |

Run commands: backend `npm run dev` (nodemon, port 5000), `npm run seed`; frontend `npm run dev` (port 5173); full stack `docker compose up --build`. **Always run backend tests via `npm test`** (sets `--experimental-vm-modules`); plain `npx jest` fails on ESM.

---

## 18. Next Recommended Task

**Build the admin dashboard frontend (completes Phase 8).** The entire admin backend is implemented and covered by 11 passing tests — the UI is the only missing half.

- **Goal:** Working `/admin` area for the seeded admin user: dashboard with KPI cards + charts, then management pages for orders, products, categories, brands, coupons, banners, reviews, returns, users, inventory, reports.
- **Files involved:**
  - New: `frontend/src/features/admin/adminApi.js`; `frontend/src/layouts/AdminLayout.jsx`; `frontend/src/pages/admin/*` (Dashboard, Orders, Products, Categories, Brands, Coupons, Banners, Reviews, Returns, Users, Inventory, Reports, Settings*); optionally `frontend/src/components/admin/*` (DataTable, StatCard, ChartCard).
  - Modified: `frontend/src/routes/AppRoutes.jsx` (register `/admin/*` inside the existing `AdminRoute`).
  - Already in place: `AdminRoute.jsx` (unused), 13 admin paths in `constants/routes.js`, `recharts` installed + pre-chunked, admin product hooks in `productApi`, `Admin` tagType in `baseApi`, Navbar admin link.
  - *Settings page requires the small missing backend piece: `GET/PATCH /admin/settings` (model + `getSingleton()` ready; add controller methods + routes + a validator schema in `admin.validator.js`).
- **Expected outcome:** Admin logs in (admin@onlinechasmewala.com / Admin@123 after seeding), Navbar's "Admin Dashboard" link works, all analytics render from real endpoints, all CRUD/moderation flows function; lint/build/tests stay green; a few component tests added for admin pages.
- **Potential risks:** Recharts bundle size (keep admin routes lazy so storefront chunks are unaffected); date handling in revenue series (dates are `YYYY-MM-DD` strings); admin list endpoints use different pagination params — reuse `buildMeta` shapes from existing pages; don't regress the 49 passing backend tests when adding settings endpoints; ensure `AdminRoute` bootstraps auth before role-checking (it already handles this, but verify with a hard refresh on `/admin`).

---

## 19. Context for Codex (5-minute briefing)

**What this is:** Online Chasmewala — a production-quality MERN e-commerce platform for eyewear, built solo-agent phase-by-phase with a "no placeholders" rule: everything reachable in the UI or API is fully implemented; only external integrations (payment, OTP, image upload) are mocks behind swappable provider interfaces.

**Where it stands:** Phases 1–7 of 9 are done and verified: design system + 23-component UI kit, complete backend (15 models, layered controller→service→repository, JWT auth with refresh rotation, full catalog/search/facets, cart/checkout with mock payment, orders with tracking timeline, returns, notifications via an event bus, reviews with verified-purchase detection), and a complete customer frontend (32 lazy-loaded pages: storefront, auth, legal, and a 10-page account area). **Phase 8 is half-finished: every admin API (analytics, order/return/review management, coupon/banner CRUD, user management, low-stock, reports) exists and is tested — but there is zero admin UI.** `/admin` currently 404s even though the Navbar links to it for admins. Phase 9 (Playwright E2E, Lighthouse audit, CI polish) hasn't started, though Docker/compose/workflow files and all documentation exist.

**Health:** backend lint clean, 49/50 Jest tests pass (one review-creation test gets 409 vs 201 — diagnose test data, don't remove the one-review-per-user guard); frontend lint clean, 17/17 Vitest pass, production build succeeds. Not a git repository yet. Local MongoDB unverified — tests use mongodb-memory-server; live runs should use `docker compose up` or Atlas. Seeded logins: admin@onlinechasmewala.com / Admin@123, demo@onlinechasmewala.com / Demo@123.

**Your immediate priority:** build the admin frontend (§18) — adminApi.js, AdminLayout, register `/admin/*` routes in the already-existing-but-unused `AdminRoute`, dashboard with Recharts (already installed), then the management pages; add the one missing backend piece (`GET/PATCH /admin/settings`). After that: §12 Priority 2 backend gap-closing, then Phase 9 quality work.

**Constraints that matter:** keep the `{success, message, data, meta?}` envelope and `ApiError` pattern on every endpoint; access token stays in memory (never localStorage), refresh stays in the httpOnly cookie flow; all Mongo access through repositories; all styling through the Tailwind token system; Zod validation on both sides (frontend uses the hand-rolled `zodResolver` in `lib/validators.js`); run backend tests only via `npm test` (ESM flags); keep lint clean and don't introduce TODO comments — implement fully or not at all.
