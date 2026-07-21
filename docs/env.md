# Environment Variables

All backend variables are **validated at boot** (`backend/src/config/env.js`). The server refuses to
start if a required variable is missing or malformed.

## Backend (`backend/.env`)

| Variable                | Required | Default                                             | Description                                        |
| ----------------------- | -------- | --------------------------------------------------- | -------------------------------------------------- |
| `NODE_ENV`              | no       | `development`                                       | `development` \| `test` \| `production`.           |
| `PORT`                  | no       | `5000`                                              | Port the API listens on.                           |
| `API_PREFIX`            | no       | `/api/v1`                                           | Base path for all routes.                          |
| `MONGODB_URI`           | **yes**  | `mongodb://127.0.0.1:27017/online-chasmewala`       | MongoDB connection string.                         |
| `CLIENT_URL`            | **yes**  | `http://localhost:5173`                             | Allowed CORS origin(s), comma-separated.           |
| `JWT_ACCESS_SECRET`     | **yes**  | —                                                   | Secret for short-lived access tokens.              |
| `JWT_REFRESH_SECRET`    | **yes**  | —                                                   | Secret for refresh tokens.                         |
| `JWT_ACCESS_EXPIRES`    | no       | `15m`                                               | Access token TTL.                                  |
| `JWT_REFRESH_EXPIRES`   | no       | `7d`                                                | Refresh token TTL.                                 |
| `BCRYPT_SALT_ROUNDS`    | no       | `10`                                                | Bcrypt cost factor.                                |
| `RATE_LIMIT_WINDOW_MS`  | no       | `900000`                                            | Rate-limit window (15 min).                        |
| `RATE_LIMIT_MAX`        | no       | `300`                                               | Max requests per window per IP.                    |
| `LOG_LEVEL`             | no       | `info`                                              | Winston log level.                                 |
| `UPLOAD_PROVIDER`       | no       | `mock`                                              | `mock` \| `cloudinary`.                            |
| `PAYMENT_PROVIDER`      | no       | `mock`                                              | `mock` \| `razorpay` \| `stripe`.                  |
| `OTP_PROVIDER`          | no       | `mock`                                              | `mock` \| `email` \| `sms`.                        |
| `CLOUDINARY_CLOUD_NAME` | no       | —                                                   | Required only when `UPLOAD_PROVIDER=cloudinary`.   |
| `CLOUDINARY_API_KEY`    | no       | —                                                   | ″                                                  |
| `CLOUDINARY_API_SECRET` | no       | —                                                   | ″                                                  |

| `SEED_ADMIN_EMAIL`      | no       | `admin@onlinechasmewala.com`                        | Admin account created by the seed command.          |
| `SEED_ADMIN_PASSWORD`   | no       | `Admin@123`                                         | Seed admin password; change outside local demos.    |

## Frontend (`frontend/.env`)

All frontend variables must be prefixed with `VITE_` to be exposed to the client bundle.

| Variable          | Required | Default                        | Description                          |
| ----------------- | -------- | ------------------------------ | ------------------------------------ |
| `VITE_API_URL`    | **yes**  | `http://localhost:5000/api/v1` | Base URL of the backend API.         |
| `VITE_APP_NAME`   | no       | `Online Chasmewala`            | Display name used in the UI.         |
| `VITE_SITE_URL`   | no       | Current browser origin          | Deployed storefront origin for canonical URLs. |

## Notes

- Never commit real secrets. `.env` is git-ignored; only `.env.example` is tracked.
- In production, set strong random values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
  (e.g. `openssl rand -hex 32`).
