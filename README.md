# Online Chasmewala 👓

A premium, production-grade **MERN** e-commerce platform for eyewear — eyeglasses, sunglasses,
computer glasses, contact lenses and accessories — built with an original design language under the
**Online Chasmewala** brand.

> Original implementation. No proprietary layouts, assets, icons, or branding from any other company
> are used or recreated.

---

## Tech stack

| Layer      | Technologies                                                                            |
| ---------- | --------------------------------------------------------------------------------------- |
| Frontend   | React 18, Vite, React Router, Redux Toolkit + RTK Query, Tailwind CSS, Framer Motion, React Hook Form + Zod, React Icons, Recharts, Swiper |
| Backend    | Node.js, Express, MongoDB, Mongoose, JWT (access + refresh), Bcrypt, Winston, Zod       |
| Tooling    | ESLint, Prettier, Docker + Docker Compose, GitHub Actions CI/CD                         |
| Testing    | Jest + Supertest (backend), Vitest + React Testing Library (frontend), Playwright (E2E) |

## Architecture

Layered, clean architecture:

- **Backend:** `route → validator → controller → service → repository → model`, with centralized
  error handling, structured logging, API versioning (`/api/v1`), background `jobs/` and an in-process
  `events/` bus. External providers (upload, payment, OTP) sit behind swappable interfaces with mock
  implementations for local dev.
- **Frontend:** feature-based structure (`features/`, `components/`, `layouts/`, `pages/`, `routes/`,
  `store/`) with a documented design system and reusable UI component library.

See [`docs/architecture.md`](docs/architecture.md) for the full breakdown.

## Project structure

```
online Chasmewala/
├── backend/     # Express + MongoDB API
├── frontend/    # React + Vite SPA
├── docs/        # architecture, API, components, ER diagram, deployment, env, setup
├── docker-compose.yml
└── .github/workflows/   # CI/CD
```

## Prerequisites

- **Node.js ≥ 20** (developed on Node 24)
- **MongoDB** running locally at `mongodb://127.0.0.1:27017` — or a MongoDB Atlas connection string
- (Optional) **Docker** + **Docker Compose** to run the whole stack in containers

## Quick start (local)

```bash
# 1. Backend
cd backend
cp .env.example .env          # adjust values if needed
npm install
npm run seed                  # seed demo catalog, admin + demo user (needs MongoDB running)
npm run dev                   # API → http://localhost:5000  (health: /api/v1/health)

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                   # App → http://localhost:5173
```

Default seeded accounts (see `docs/setup.md`):

| Role  | Email                       | Password    |
| ----- | --------------------------- | ----------- |
| Admin | admin@onlinechasmewala.com  | Admin@123   |
| User  | demo@onlinechasmewala.com   | Demo@123    |

## Quick start (Docker)

```bash
docker compose up --build
# Frontend → http://localhost:5173   Backend → http://localhost:5000   Mongo → 27017
```

## Scripts

**Backend**

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start API with nodemon               |
| `npm start`         | Start API (production)               |
| `npm run seed`      | Seed the database                    |
| `npm test`          | Run Jest tests                       |
| `npm run lint`      | Lint source                          |

**Frontend**

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start Vite dev server                |
| `npm run build`     | Production build                     |
| `npm run preview`   | Preview the production build         |
| `npm test`          | Run Vitest component tests           |
| `npm run test:e2e`  | Run Playwright end-to-end tests      |
| `npm run lint`      | Lint source                          |

## Documentation

- [Setup guide](docs/setup.md)
- [Architecture](docs/architecture.md)
- [API reference](docs/api.md)
- [Component library](docs/components.md)
- [Database ER diagram](docs/er-diagram.md)
- [Deployment guide](docs/deployment.md)
- [Environment variables](docs/env.md)
- [Performance and SEO audit](docs/performance.md)

## Roadmap (implementation phases)

1. ✅ Architecture & scaffolding
2. ⬜ Design system & UI components
3. ⬜ Backend models, auth & APIs
4. ⬜ Frontend auth & layout
5. ⬜ Product catalog & search
6. ⬜ Cart & checkout
7. ⬜ Orders & account
8. ⬜ Admin dashboard
9. ⬜ Testing, optimization & deployment

> **Status update (2026-07-21):** Phases 1–8 are complete, including the
> admin dashboard. Phase 9 has E2E coverage in place; performance/SEO auditing
> is documented with a local production baseline; final deployment validation
> and a deployed-HTTPS re-audit remain.

## License

Proprietary — © Online Chasmewala. All rights reserved.
