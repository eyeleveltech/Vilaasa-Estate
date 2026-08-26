# Vilaasa Estates Luxury Platform — Deployment Guide

## 1. Database Setup — Neon.tech (Serverless PostgreSQL)
1. Go to [https://neon.tech](https://neon.tech) and create a free account.
2. Create a new project named `vilaasa_db` (or `vilaasa-production`).
3. Copy the pooled connection string.
4. Format: `postgresql://user:password@ep-xxx.neon.tech/vilaasa_db?sslmode=require`
5. Set this connection string as the `DATABASE_URL` environment variable in Render.

---

## 2. Backend Deployment — Render.com
1. Push `vilaasa-backend` to your GitHub repository.
2. Log in to [https://render.com](https://render.com) and click **New ➔ Web Service**.
3. Connect your repository. Render will automatically detect [`render.yaml`](file:///d:/EyeLevel/eyelevel%20intern/villasa/vilaasa-backend/render.yaml).
4. Configure the environment variables in the Render Dashboard:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `postgresql://...`
   - `JWT_SECRET`: Minimum 32-character secure secret string
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
   - `SMTP_HOST`: `smtp.zoho.com` (confirm your Zoho data-center hostname)
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: Your full Zoho Mailbox address
   - `SMTP_PASS`: Your Zoho app password (required when MFA is enabled)
   - `SMTP_FROM`: A sender address configured for the Zoho mailbox
   - `ALLOWED_ORIGINS`: `https://vilaasaestates.com,https://your-app.vercel.app`
5. Click **Deploy**. Render will automatically run `npm install && npx prisma generate && npm run build` and execute database migrations.

---

## 3. Frontend Deployment — Vercel
1. Push `vilaasa-frontend` to your GitHub repository.
2. Log in to [https://vercel.com](https://vercel.com) and click **New Project**.
3. Import the `vilaasa-frontend` repository.
4. Configure Build & Environment Settings:
   - **Framework Preset**: Vite
   - **Environment Variables**:
     - `VITE_API_URL`: `https://your-render-service.onrender.com/api/v1`
5. Click **Deploy**. Vercel will build the frontend using [`vercel.json`](file:///d:/EyeLevel/eyelevel%20intern/villasa/vilaasa-frontend/vercel.json) rewrite rules.

---

## 4. Post-Deployment Verification Checklist
- [ ] **Health Check**: `GET https://your-render-service.onrender.com/api/v1/health` returns `{"status":"healthy"}`.
- [ ] **Super Admin Login**: Log in to `https://your-app.vercel.app/admin/login` using `superadmin@vilaasa.com`.
- [ ] **Create Estate**: Add a new property and upload hero and gallery images to Cloudinary.
- [ ] **Brochure PDF Upload**: Upload a PDF brochure and verify public preview link opens without ACL errors.
- [ ] **Lead Inquiry & OTP**: Submit a lead on the public site and verify 6-digit OTP email delivery.
- [ ] **Site Visit Booking**: Book an inspection slot on the calendar and verify status appears in `/admin/site-visits`.
- [ ] **Channel Partner Approval**: Register a broker application on public form and approve it from `/admin/channel-partners`.
- [ ] **CORS Verification**: Verify no CORS preflight blocking between Vercel and Render domains.
