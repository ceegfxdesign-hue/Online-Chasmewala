# Deployment Guide

Online Chasmewala is designed to deploy as three independent pieces: **database** (MongoDB Atlas),
**backend API**, and **frontend SPA**.

## 0. MongoDB Atlas

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. Add a database user and allow-list your backend host IP (or `0.0.0.0/0` for testing).
3. Copy the connection string and set it as `MONGODB_URI` on the backend host.
4. Run the seed once against the cluster if you want demo data:
   `MONGODB_URI="<atlas-uri>" npm run seed`.

## 1. Backend → Render / Railway / AWS

**Render / Railway**

- Create a new **Web Service** from the `backend/` directory.
- Build command: `npm install`
- Start command: `npm start`
- Add all backend environment variables (see [`env.md`](env.md)). Set `NODE_ENV=production` and a
  real `CLIENT_URL` (your deployed frontend origin).

**AWS (EC2 / ECS)**

- Use the provided `backend/Dockerfile`.
- Build & push the image, run behind an ALB, inject env vars via task definition / SSM.

Either way the API exposes `GET /api/v1/health` for load-balancer health checks.

## 2. Frontend → Vercel

- Import the repo, set the **root directory** to `frontend/`.
- Framework preset: **Vite**. Build command: `npm run build`. Output dir: `dist`.
- Environment variable: `VITE_API_URL = https://<your-backend-host>/api/v1`.
- Vercel serves the SPA and handles the client-side routing fallback automatically.

Alternatively, the `frontend/Dockerfile` produces a static build served by nginx (SPA fallback
configured in `frontend/nginx.conf`).

## 3. Docker Compose (single host)

```bash
docker compose up --build -d
```

Brings up `mongo`, `backend`, and `frontend`. Override secrets via an `.env` file next to
`docker-compose.yml` or your orchestrator's secret store.

## CI/CD

`.github/workflows/ci.yml` runs install → lint → test → build on every push and PR.
`.github/workflows/deploy.yml` provides deploy hooks (fill in provider tokens as repository secrets):

| Secret                 | Used for                         |
| ---------------------- | -------------------------------- |
| `VERCEL_TOKEN`         | Frontend deploy authentication   |
| `VERCEL_ORG_ID`        | Vercel team/account target       |
| `VERCEL_PROJECT_ID`    | Vercel frontend project target   |
| `RENDER_DEPLOY_HOOK`   | Backend deploy (Render)          |

The GitHub workflow runs only after the project is pushed to a GitHub
repository's `main` branch and its CI workflow succeeds. The Vercel identifiers
are available after creating/linking the project locally with `vercel link`, or
from the Vercel project settings. Keep all four values in GitHub repository
secrets; never commit them to the project.

## Production checklist

- [ ] Strong `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- [ ] `NODE_ENV=production`
- [ ] `CLIENT_URL` restricted to your real frontend origin(s)
- [ ] Atlas IP allow-list configured
- [ ] Real provider credentials set if enabling Cloudinary / payments / OTP
- [ ] HTTPS terminated at the load balancer / platform
