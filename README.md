# Vilaasa Estates Luxury Real Estate Monorepo

Vilaasa Estates is a platform for luxury real estate in Dubai and India markets, incorporating prime residential villas, penthouses, commercial assets, and private wealth investment portfolios.

---

## 📁 Repository Structure

```
villasa/
├── frontend/     # Vite + React (TypeScript) + Tailwind CSS + Framer Motion
│   ├── src/              # Components, Pages, Hooks, Contexts, Types
│   ├── public/           # Static media assets
│   ├── index.html        # Single Page App entry point
│   ├── .env.example      # Frontend environment config
│   └── package.json
│
├── backend/      # Node.js + Express + Prisma + PostgreSQL + Cloudinary
│   ├── src/              # Express app, modules, controllers, middlewares, utils
│   ├── prisma/           # PostgreSQL schema, migrations, seed script
│   ├── API.md            # Complete REST API documentation
│   ├── .env.example      # Backend environment config
│   └── package.json
│
├── scripts/              # Legacy & utility scripts
├── package.json          # Monorepo Workspace Orchestrator
└── README.md
```

---

## 🚀 Quick Start (Root Commands)

### 1. Install All Dependencies
From the repository root:
```bash
npm install
```

### 2. Configure Environment Variables
- **Backend:** Copy `backend/.env.example` to `backend/.env` and configure your `DATABASE_URL`, `JWT_SECRET`, and `CLOUDINARY_*` keys.
- **Frontend:** Copy `frontend/.env.example` to `frontend/.env`.

### 3. Run Database Migrations & Seed
```bash
# Apply migrations
npm run db:migrate

# Seed sample properties, locations, and amenities
npm run db:seed
```

### 4. Start Development Servers (Concurrent)
```bash
# Starts both frontend (http://localhost:5173) and backend (http://localhost:5000)
npm run dev
```

Or run individually:
```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

---

## 🛠️ Build & Verification

```bash
# Build both frontend and backend
npm run build

# Build backend only (TypeScript compilation into dist/)
npm run build:backend

# Build frontend only (Vite production bundle into dist/)
npm run build:frontend
```

---

## 📖 API Documentation
Full REST API documentation is available in [`backend/API.md`](./backend/API.md).
