# Deployment Guide & Staging Instructions

## Before Deploying
Run the following to stage all changes:
```bash
git add .
git commit -m "feat: complete vault portal + fixes"
git push origin main
```

---

## Service Verification

### Backend (Express + Prisma + PostgreSQL)
- Ensure PostgreSQL is running.
- Run database migrations / client generation:
  ```bash
  npx prisma generate
  ```
- Build production backend:
  ```bash
  npm run build
  ```

### Frontend (React + Vite)
- Build production frontend bundle:
  ```bash
  npm run build
  ```
