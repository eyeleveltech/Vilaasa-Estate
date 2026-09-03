const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generateHandoverPDF() {
  const outputPath = path.join(__dirname, 'Vilaasa_Estates_Master_Handover_Guide.pdf');
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 45, bottom: 45, left: 45, right: 45 },
    bufferPages: true,
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Palette Constants
  const PRIMARY_COLOR = '#047857'; // Emerald 700
  const GOLD_COLOR = '#B45309';    // Amber/Gold
  const DARK_BG = '#0F172A';       // Slate 900
  const TEXT_MAIN = '#1E293B';     // Slate 800
  const TEXT_MUTED = '#64748B';    // Slate 500
  const CARD_BG = '#F8FAFC';       // Slate 50
  const BORDER_COLOR = '#E2E8F0';  // Slate 200

  // Helper functions
  function addHeader(title, subtitle) {
    doc.rect(45, 45, 505, 75).fill(DARK_BG);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(18).text(title, 60, 60);
    doc.fillColor('#D4AF37').font('Helvetica-Bold').fontSize(9).text(subtitle.toUpperCase(), 60, 85, { characterSpacing: 1.5 });
    doc.y = 135;
  }

  function addSectionTitle(title, tag) {
    doc.moveDown(0.8);
    if (tag) {
      doc.fillColor(GOLD_COLOR).font('Helvetica-Bold').fontSize(8).text(tag.toUpperCase(), { characterSpacing: 1.2 });
      doc.moveDown(0.2);
    }
    doc.fillColor(PRIMARY_COLOR).font('Helvetica-Bold').fontSize(14).text(title);
    doc.strokeColor(BORDER_COLOR).lineWidth(1).moveTo(45, doc.y + 4).lineTo(550, doc.y + 4).stroke();
    doc.moveDown(0.6);
  }

  function addSubSection(title) {
    doc.moveDown(0.5);
    doc.fillColor(DARK_BG).font('Helvetica-Bold').fontSize(11).text(title);
    doc.moveDown(0.3);
  }

  function addParagraph(text) {
    doc.fillColor(TEXT_MAIN).font('Helvetica').fontSize(9.5).lineGap(2.5).text(text);
    doc.moveDown(0.4);
  }

  function addBullet(title, text) {
    doc.fillColor(PRIMARY_COLOR).font('Helvetica-Bold').fontSize(9.5).text(`•  ${title}: `, { continued: true });
    doc.fillColor(TEXT_MAIN).font('Helvetica').fontSize(9.5).text(text);
    doc.moveDown(0.2);
  }

  function addCodeBox(text) {
    const boxY = doc.y;
    doc.rect(45, boxY, 505, 36).fill(CARD_BG).stroke(BORDER_COLOR);
    doc.fillColor('#0F172A').font('Courier-Bold').fontSize(9).text(text, 55, boxY + 12);
    doc.y = boxY + 44;
  }

  // --- PAGE 1: COVER & EXECUTIVE SUMMARY ---
  addHeader('VILAASA ESTATES PLATFORM', 'Master Engineering Handover & Developer Roadmap');

  addSectionTitle('1. Executive Overview & Architecture', 'System Overview');
  addParagraph(
    'Vilaasa Estates is an enterprise-grade luxury real estate and fractional franchise platform designed for high-net-worth individuals, institutional capital desks, channel partners, and internal asset directors. The platform provides a seamless bridge between Dubai and Indian trophy properties with four specialized isolated application portals.'
  );

  addSubSection('Core Portals & Access Control');
  addBullet('Public Luxury Showcase (Port 8080)', 'Client-facing responsive portal featuring immersive property dossiers, wealth return projection calculator, site inspection calendar, franchise investments, and live concierge.');
  addBullet('Super Admin Command Center (/admin)', 'Executive management portal with full CRUD for property portfolios, Cloudinary asset uploads, brochure management, inquiry pipeline stages, site visit itineraries, and partner directory.');
  addBullet('Channel Partner Brokerage Portal (/partner)', 'Specialized workspace for accredited brokers to browse portfolio inventory, generate VIP referral links, register investor leads, and dispatch client site inspections.');
  addBullet('The Vault Investor Portal (/vault)', 'Private custodial portal for registered property owners with 6 live marked-to-market KPI metrics, portfolio holdings, rental yield tracking, and multi-currency formatter.');

  addSubSection('Technology Stack & Infrastructure');
  addBullet('Backend', 'Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, JWT, Bcrypt, Multer, Nodemailer.');
  addBullet('Frontend', 'React 18, Vite, TypeScript, TailwindCSS, Framer Motion, TanStack Query, Lucide Icons, Shadcn UI.');
  addBullet('Cloud & Storage', 'Cloudinary CDN (High-res media & PDF brochures), Gmail SMTP (Transactional emails).');

  // --- PAGE 2: WHAT WAS BUILT & ACCOMPLISHED ---
  doc.addPage();
  addHeader('WHAT WAS ACCOMPLISHED', 'Engineering Milestones & Refactoring');

  addSectionTitle('2. Comprehensive Work Completed', 'Implementation Details');
  
  addSubSection('A. Saleor GraphQL Eradication & REST API Migration');
  addBullet('Native Express REST API', 'Replaced all legacy Saleor GraphQL queries (api.theeyelevelstudio.com) with high-performance Express REST endpoints (/api/v1/properties).');
  addBullet('Franchise REST Hooks', 'Rewrote useNewFranchise.ts to query Express backend with FOCO model transforms and curated fallback data structures.');
  addBullet('Dead Code Purge', 'Deleted legacy Saleor files (graphql.ts, useProperties.ts) and archived 20 legacy migration scripts with 0 residual dependencies.');

  addSubSection('B. Channel Partner Portal Implementation');
  addBullet('Dedicated Workspace', 'Built PartnerLogin, PartnerRegister, PartnerLayout, PartnerDashboard, PartnerInventory, PartnerSiteVisits, and PartnerLeads.');
  addBullet('Lifecycle Approval Flow', 'New brokers register via public portal, Super Admin reviews and updates status to APPROVED, automatically triggering an approval email with login credentials.');
  addBullet('VIP Link Engine', 'Brokers generate custom tracked client referral links with pre-populated broker attribution.');

  addSubSection('C. The Vault Private Investor Portal');
  addBullet('Security & Role Gating', 'Introduced VAULT_CLIENT role in Prisma schema with strict JWT validation rejecting non-investor roles.');
  addBullet('Wealth Command Dashboard', 'Built 6 KPI metric cards (Properties Owned, Total Invested, Current Valuation, Capital Gains, Monthly Rental Yield, Annualized Yield).');
  addBullet('Admin Vault Manager', 'Added a dedicated Vault tab in AdminPropertyDetail.tsx for assigning property units to investor folios with inline valuation updates.');

  addSubSection('D. Transactional Email & Security Infrastructure');
  addBullet('Live SMTP Integration', 'Configured Gmail SMTP with automated delivery for site visit itineraries, contact inquiries, and partner onboarding.');
  addBullet('Fixed Form Validations', 'Replaced hardcoded fake email fallbacks (@investor.com, @vip-client.com) with strictly validated client inputs.');
  addBullet('Portal Token Isolation', 'Fixed Axios interceptors to dynamically resolve portal tokens and avoid cross-portal 401 redirect loops.');

  // --- PAGE 3: DEVELOPER QUICKSTART & OPERATIONS ---
  doc.addPage();
  addHeader('DEVELOPER & OPERATOR GUIDE', 'Setup, Testing & Commands');

  addSectionTitle('3. How to Run & Work on the Platform', 'Developer Quickstart');
  
  addSubSection('1. Environment Configuration');
  addParagraph('Ensure vilaasa-backend/.env and vilaasa-frontend/.env are configured:');
  addCodeBox('DATABASE_URL=postgresql://postgres:<db-password>@localhost:5432/vilaasa\nJWT_SECRET=<generate-a-unique-secret-min-32-chars>');

  addSubSection('2. Database Synchronization & Seeding');
  addParagraph('Run the following commands in vilaasa-backend/ to apply migrations and seed initial data:');
  addCodeBox('npx prisma generate\nnpm run db:seed');

  addSubSection('3. Starting Development Servers');
  addBullet('Backend Server', 'In vilaasa-backend: npm run dev (Runs on http://localhost:5000)');
  addBullet('Frontend Server', 'In vilaasa-frontend: npm run dev (Runs on http://localhost:8080)');

  addSubSection('4. Default Portal Credentials');
  addBullet('Super Admin (/admin/login)', 'superadmin@vilaasa.com  |  SuperAdmin@Vilaasa2026');
  addBullet('Channel Partner (/partner/login)', 'partner@luxuryestates.com  |  Partner@Vilaasa2026');
  addBullet('Vault Investor (/vault/login)', 'investor@vilaasa.com  |  investor123');

  addSubSection('5. Core API Endpoints Reference');
  addBullet('Auth Endpoints', 'POST /api/v1/auth/login, POST /api/v1/auth/register, POST /api/v1/vault/login');
  addBullet('Properties', 'GET /api/v1/properties, GET /api/v1/properties/:slug, POST /api/v1/properties');
  addBullet('Vault Portfolio', 'GET /api/v1/vault/portfolio, GET /api/v1/vault/assets, POST /api/v1/vault/assets');
  addBullet('Site Visits & Inquiries', 'POST /api/v1/site-visits, POST /api/v1/inquiries, GET /api/v1/channel-partners');

  // --- PAGE 4: FUTURE ROADMAP & BEST PRACTICES ---
  doc.addPage();
  addHeader('STRATEGIC ROADMAP', 'Future Capabilities & Architecture Guidelines');

  addSectionTitle('4. Strategic Next Steps & Roadmap', 'Future Enhancements');

  addSubSection('Phase 1: Payment & Escrow Integration');
  addBullet('Booking Deposits', 'Integrate Stripe and Razorpay SDKs for token booking deposits (e.g., ₹5,00,000 / AED 25,000 lock-in deposits).');
  addBullet('Escrow Milestone Tracking', 'Connect investor payments to construction progress stages with automated tranche drawdowns.');

  addSubSection('Phase 2: Real-Time Concierge & Chat (WebSockets)');
  addBullet('Live Portfolio Messaging', 'Embed real-time Socket.io chat between Vault Investors and designated Senior Relationship Directors.');
  addBullet('Push Notifications', 'Real-time alert dispatch for marked-to-market valuation hikes and quarterly dividend disbursements.');

  addSubSection('Phase 3: Interactive 3D Virtual Tours');
  addBullet('Matterport / Three.js', 'Embed interactive 360-degree walkthroughs and architectural floorplan 3D viewer in property dossiers.');

  addSubSection('Phase 4: Advanced Lead Intelligence & Funnels');
  addBullet('Broker Commission Tracking', 'Automated commission ledger calculating 2%-3% brokerage fee upon closed transactions.');
  addBullet('Audit Log Exports', 'CSV / PDF export functionality for site visit schedules, lead pipeline analytics, and investor statements.');

  addSectionTitle('5. Staging & Deployment Protocol', 'Deployment Checklist');
  addParagraph('Before deploying to staging or production environments, execute:');
  addCodeBox('git add .\ngit commit -m "feat: complete vault portal + channel partner + rest migration"\ngit push origin main');

  doc.end();

  writeStream.on('finish', () => {
    console.log('✅ Handover PDF generated successfully at:', outputPath);
  });
}

generateHandoverPDF();
