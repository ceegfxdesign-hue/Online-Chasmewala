# Setup Guide

## Prerequisites

- Node.js **≥ 20** (project developed on Node 24, npm 11)
- MongoDB running locally, or a MongoDB Atlas cluster
- Git

## 1. Clone & install

```bash
git clone <repo-url>
cd "online Chasmewala"
```

Install each app independently:

```bash
cd backend  && npm install
cd ../frontend && npm install
```

## 2. Environment variables

Copy the example env files and adjust as needed:

```bash
cp backend/.env.example  backend/.env
cp frontend/.env.example frontend/.env
```

See [`env.md`](env.md) for a description of every variable. Env vars are **validated on boot** — the
backend will refuse to start with an invalid configuration.

## 3. Start MongoDB

Local install:

```bash
mongod --dbpath /path/to/data
```

Or use Docker just for the database:

```bash
docker run -d --name och-mongo -p 27017:27017 mongo:7
```

## 4. Seed the database

```bash
cd backend
npm run seed
```

This loads categories, brands, ~30 demo products, banners, offers/coupons, sample reviews, and two
accounts:

| Role  | Email                       | Password    |
| ----- | --------------------------- | ----------- |
| Admin | admin@onlinechasmewala.com  | Admin@123   |
| User  | demo@onlinechasmewala.com   | Demo@123    |

## 5. Run

```bash
# terminal 1
cd backend && npm run dev      # http://localhost:5000

# terminal 2
cd frontend && npm run dev     # http://localhost:5173
```

Health check: <http://localhost:5000/api/v1/health>

## Docker (full stack)

```bash
docker compose up --build
```

## Troubleshooting

| Symptom                              | Fix                                                                 |
| ------------------------------------ | ------------------------------------------------------------------- |
| `MongooseServerSelectionError`       | MongoDB isn't running / wrong `MONGODB_URI`.                        |
| Backend exits immediately on boot    | Invalid env — read the validation error, fix `.env`.               |
| CORS error in browser                | Ensure `CLIENT_URL` in backend `.env` matches the frontend origin. |
| Frontend can't reach API             | Check `VITE_API_URL` in `frontend/.env`.                           |
