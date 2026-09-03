# Vilaasa Estates — Master Engineering Handover & Operational Guide

---

## 📌 1. Executive Summary & Architecture Overview

**Vilaasa Estates** is an enterprise-grade luxury real estate and fractional franchise platform designed for high-net-worth individuals, family offices, channel partners, and internal asset managers. The platform provides a seamless digital bridge between Dubai and Indian luxury properties across four distinct, role-isolated portals.

### 🏛️ Portal Architecture & Access Control

| Portal | URL / Route | Target Audience | Primary Functionality |
| :--- | :--- | :--- | :--- |
| **Public Luxury Showcase** | `http://localhost:8080/` | Public HNW Clients | Property dossiers, Wealth Projector, site visit calendar booking, franchise investments, contact inquiries. |
| **Super Admin Command Center** | `http://localhost:8080/admin/login` | Managing Directors & Admins | Full property CRUD, Cloudinary media/brochure upload, lead pipeline stages, site visit itineraries, partner approval. |
| **Channel Partner Portal** | `http://localhost:8080/partner/login` | Accredited Real Estate Brokers | Portfolio inventory browser, VIP tracked referral links, client lead registration, site visit booking dispatch. |
| **The Vault Investor Portal** | `http://localhost:8080/vault/login` | Registered Vault Property Owners | 6 live marked-to-market KPI cards, portfolio asset holdings, rental yield distributions, multi-currency converter. |

---

## 🛠️ 2. Technology Stack & Infrastructure

- **Backend:** Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, JWT, Bcrypt, Multer, Nodemailer.
- **Frontend:** React 18, Vite, TypeScript, TailwindCSS, Framer Motion, TanStack Query, Lucide Icons, Shadcn UI.
- **Cloud Media & Storage:** Cloudinary CDN (High-res property media & PDF brochures).
- **Email Infrastructure:** Gmail SMTP (`smtp.gmail.com:587`) for live transactional dispatch of inquiries, itineraries, and credentials.

---

## 🚀 3. What Was Accomplished (Engineering Milestones)

### A. Complete Eradication of Saleor GraphQL & REST Migration
- Replaced all legacy Saleor GraphQL queries (`api.theeyelevelstudio.com/graphql`) with native Express REST API endpoints (`/api/v1/properties`).
- Rewrote `useNewFranchise.ts` to query Express backend with FOCO business model transforms and curated fallback data structures.
- Purged 20 legacy migration scripts and removed dead GraphQL client files (`graphql.ts`, `useProperties.ts`).

### B. Dedicated Channel Partner Portal
- Created dedicated partner routes and views: `PartnerLogin`, `PartnerRegister`, `PartnerLayout`, `PartnerDashboard`, `PartnerInventory`, `PartnerSiteVisits`, and `PartnerLeads`.
- Implemented full broker lifecycle: Public registration $\rightarrow$ Super Admin approval $\rightarrow$ Automated approval email with login link.
- Implemented VIP tracked link generator with broker attribution.

### C. The Vault — Private Investor Portal
- Introduced `VAULT_CLIENT` role in Prisma schema with strict JWT validation rejecting non-investor roles.
- Built 6 live marked-to-market KPI cards: *Properties Owned*, *Total Invested*, *Current Valuation*, *Total Capital Gain*, *Monthly Rental Yield*, *Annualized Yield*.
- Added a dedicated **Vault** tab in `AdminPropertyDetail.tsx` for assigning property units to investor folios with inline valuation updates.

### D. Transactional Email & Security Infrastructure
- Configured Gmail SMTP with automated delivery for site visit itineraries, contact inquiries, and partner onboarding.
- Replaced hardcoded fake email fallbacks (`@investor.com`, `@vip-client.com`) with strictly validated client inputs.
- Fixed Axios interceptors to dynamically resolve portal tokens and avoid cross-portal 401 redirect loops.

---

## 💻 4. Developer Quickstart & Operations Manual

### Step 1: Environment Variables (`.env`)

In `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:<db-password>@localhost:5432/vilaasa
# REQUIRED, minimum 32 characters. Generate with: openssl rand -base64 48
JWT_SECRET=<generate-a-unique-secret>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<smtp-mailbox-address>
SMTP_PASS=<smtp-app-password>
SMTP_FROM="Vilaasa Estates <noreply@vilaasaestates.com>"
FRONTEND_URL=http://localhost:8080
```

> **Never commit real values.** This repository is hosted on GitHub, so any
> secret written into a tracked file must be treated as compromised and
> rotated at the provider. Real values belong only in an untracked `.env`
> (already gitignored) or in your deployment platform's secret store.
>
> The backend refuses to start if `JWT_SECRET` is missing or shorter than
> 32 characters, and refuses to start in production without the three
> Cloudinary variables.

### Step 2: Database Synchronization & Seeding

Run in `backend/`:
```bash
# Generate Prisma Client
npx prisma generate

# Seed initial database (Super Admin, Channel Partner, Vault Investor, Estates)
npm run db:seed
```

### Step 3: Starting Development Servers

```bash
# Start Backend (Terminal 1)
cd backend
npm run dev

# Start Frontend (Terminal 2)
cd frontend
npm run dev
```

### Step 4: Default Portal Credentials

| Role | Portal Login URL | Email | Password |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `http://localhost:8080/admin/login` | `superadmin@vilaasa.com` | `SuperAdmin@Vilaasa2026` |
| **Channel Partner** | `http://localhost:8080/partner/login` | `partner@luxuryestates.com` | `Partner@Vilaasa2026` |
| **Vault Investor** | `http://localhost:8080/vault/login` | `investor@vilaasa.com` | `investor123` |

> These are **seed defaults for local development only**. They are created by
> `prisma/seed.ts`, which must never be run against production. If any of these
> accounts exist on a live deployment, change their passwords immediately.

---

## 📡 5. Core API Endpoints Reference

### Authentication
- `POST /api/v1/auth/login` — Super Admin / Partner Login
- `POST /api/v1/auth/register` — Account creation (**Super Admin only**)
- `POST /api/v1/channel-partners/register` — Public partner application (creates a PENDING record, not a login)
- `POST /api/v1/vault/login` — Dedicated Vault Investor Login (`VAULT_CLIENT` role gated)

### Properties & Inventory
- `GET /api/v1/properties` — List all properties (supports `type`, `limit`, `category` filters)
- `GET /api/v1/properties/:slug` — Single property dossier details
- `POST /api/v1/properties` — Create property (Super Admin only)
- `PUT /api/v1/properties/:id` — Update property metadata/brochure

### The Vault & Portfolios
- `GET /api/v1/vault/portfolio` — Authenticated investor portfolio metrics & assets array
- `GET /api/v1/vault/assets` — All vault holdings (supports `propertyId` filter & pagination)
- `GET /api/v1/vault/assets/:id` — Single asset detail (Owner or Super Admin)
- `POST /api/v1/vault/assets` — Assign property unit to investor (Super Admin only)
- `PUT /api/v1/vault/assets/:id` — Update asset valuation / occupancy / yield
- `DELETE /api/v1/vault/assets/:id` — Delete asset holding

### Leads & Inquiries
- `POST /api/v1/inquiries` — Create inquiry lead
- `GET /api/v1/inquiries` — List inquiries with timeline audit history
- `POST /api/v1/site-visits` — Schedule private site inspection
- `GET /api/v1/site-visits` — List scheduled visits

---

## 🔮 6. Future Roadmap & Expansion Opportunities

1. **Payment & Escrow Integration:**
   - Integrate Stripe / Razorpay SDKs for token booking deposits (e.g. ₹5,00,000 / AED 25,000 reservation deposits).
   - Milestone-based escrow drawdowns linked to construction progress.

2. **Real-Time Concierge & Chat (WebSockets):**
   - Direct encrypted WebSocket messaging between Vault Investors and designated Senior Wealth Directors.
   - Push notifications for valuation updates and quarterly dividend releases.

3. **3D Virtual Immersion:**
   - Matterport / Three.js 3D architectural models and 360° virtual walkthrough integration.

4. **Brokerage Commission Ledger:**
   - Automated commission tracking (2%-3% fee) with payout status on closed client transactions.

---

## 📦 7. Staging & Deployment Checklist

Before committing and deploying:
```bash
# 1. Stage all changes
git add .

# 2. Commit with descriptive message
git commit -m "feat: complete vault portal + channel partner + rest migration"

# 3. Push to remote repository
git push origin main
```
