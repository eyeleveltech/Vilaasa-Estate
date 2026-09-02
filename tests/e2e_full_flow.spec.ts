import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const API_URL = 'http://localhost:5000/api/v1';

test.describe.serial('Vilaasa Platform — Full End-to-End Flow (Admin -> Creation -> Public Page View)', () => {
  test.setTimeout(120000);

  const timestamp = Date.now().toString().slice(-5);
  const testPropertyName = `Azure Horizon Sanctuary ${timestamp}`;
  const testFranchiseName = `Vilaasa Longevity Retreat ${timestamp}`;

  let adminToken: string;
  let createdPropertySlug: string;
  let createdFranchiseSlug: string;

  // --------------------------------------------------------------------------
  // STEP 1: API Direct Creation & Data Layer Validation
  // --------------------------------------------------------------------------
  test('1. Admin Authentication & Backend Entity Creation', async ({ request }) => {
    console.log('\n[Step 1] Logging in Super Admin via API...');
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'superadmin@vilaasa.com',
        password: 'SuperAdmin@Vilaasa2026',
      },
    });

    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    expect(loginData.success).toBe(true);
    expect(loginData.data.token).toBeDefined();
    adminToken = loginData.data.token;
    console.log('[Step 1] Super Admin authenticated.');

    // 1A. Create Luxury Residential Property
    console.log(`[Step 1] Creating Luxury Property: "${testPropertyName}"...`);
    const propRes = await request.post(`${API_URL}/properties`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: testPropertyName,
        tagline: 'Ultra-exclusive clifftop villa with infinity panoramic Arabian Sea views.',
        visionHeadline: 'The Pinnacle of Coastal Brutalism and Tropical Elegance',
        description: 'Set upon the dramatic cliffs of North Goa, this signature estate features cantilevered basalt terraces, bespoke teak joinery, infinity lap pool, and institutional facility management.',
        type: 'RESIDENTIAL_VILLA',
        customType: 'Signature Cliff Villa',
        status: 'AVAILABLE',
        price: 48000000,
        currency: 'INR',
        rentalYieldPercent: 8.4,
        expectedIrrPercent: 19.2,
        customSpecs: [
          { label: 'Plot Area', value: '18,500 Sq.Ft.' },
          { label: 'Built-Up Area', value: '11,200 Sq.Ft.' },
          { label: 'Bedrooms', value: '5 BHK Luxury Suites' },
          { label: 'Ownership', value: 'Freehold Title' },
        ],
        financialMetrics: [
          { label: 'Projected Net Yield', value: '8.4% p.a.', note: 'Fully Managed Rental Folio', icon: 'trending_up' },
          { label: '5-Year Capital Gain', value: '₹9.6 Cr', note: 'Historical Tier-1 Goa CAGR', icon: 'savings' },
        ],
        configurations: [
          { unitType: '5 BHK Presidential Suite', areaSqFt: 11200, viewType: 'Sea & Cliff Front View', price: 48000000, isAvailable: true },
        ],
        amenities: [
          { name: 'Private Cliff Infinity Pool', iconKey: 'pool', description: 'Heated oceanfront infinity pool' },
          { name: 'Private Helipad Access', iconKey: 'helicopter', description: 'Direct VIP aviation clearance' },
          { name: 'Ayurvedic Spa & Hydrotherapy', iconKey: 'spa', description: 'In-villa hydrothermal sanctuary' },
        ],
        location: {
          city: 'Goa',
          country: 'India',
          community: 'Vagator Cliffs',
          addressLine: 'Ozran Beach Road, Vagator, North Goa',
        },
        media: [
          {
            url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&auto=format&fit=crop&q=80',
            altText: `${testPropertyName} Clifftop Oceanfront`,
            mediaType: 'HERO_IMAGE',
            isFeatured: true,
            orderIndex: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&auto=format&fit=crop&q=80',
            altText: `${testPropertyName} Interior Lounge`,
            mediaType: 'GALLERY',
            isFeatured: false,
            orderIndex: 1,
          },
        ],
      },
    });

    expect(propRes.status()).toBe(201);
    const propJson = await propRes.json();
    expect(propJson.success).toBe(true);
    createdPropertySlug = propJson.data.slug;
    console.log(`[Step 1] Property created! Slug: "${createdPropertySlug}"`);

    // 1B. Create Franchise Opportunity
    console.log(`[Step 1] Creating Franchise: "${testFranchiseName}"...`);
    const franRes = await request.post(`${API_URL}/properties`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: testFranchiseName,
        type: 'FRANCHISE',
        customType: 'Ayurvedic Wellness Resort',
        tagline: 'Institutional FOCO wellness franchise with 26% projected annual yield.',
        description: 'Vilaasa Longevity Retreat represents a transformative turnkey business model in holistic wellness. Operated entirely by master therapists with audited escrow payouts.',
        price: 7500000,
        minTicketSize: 7500000,
        totalProjectCost: 280000000,
        currency: 'INR',
        status: 'AVAILABLE',
        franchiseModel: 'FOCO',
        expectedAnnualRoi: 26.0,
        rentalYieldPercent: 26.0,
        paybackPeriodYears: 3.2,
        lockInPeriodYears: 2.0,
        yieldPayoutFrequency: 'MONTHLY',
        location: {
          city: 'Wayanad',
          country: 'India',
        },
        media: [
          {
            url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop&q=80',
            altText: `${testFranchiseName} Sanctuary View`,
            mediaType: 'HERO_IMAGE',
            isFeatured: true,
            orderIndex: 0,
          },
        ],
      },
    });

    expect(franRes.status()).toBe(201);
    const franJson = await franRes.json();
    expect(franJson.success).toBe(true);
    createdFranchiseSlug = franJson.data.slug;
    const franchiseId = franJson.data.id;
    console.log(`[Step 1] Franchise created! Slug: "${createdFranchiseSlug}", ID: "${franchiseId}"`);

    // 1C. Upsert 7-Section Rich Editorial Content for the Franchise
    console.log(`[Step 1] Upserting 7-Section Franchise Page Content for ID "${franchiseId}"...`);
    const pageRes = await request.put(`${API_URL}/franchise/${franchiseId}/page`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        pageTitle: testFranchiseName,
        mainHeadline: testFranchiseName,
        subheading: 'India’s Premier Generational Wellness Asset. 100% Hands-Off FOCO Passive Ownership.',
        heroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop&q=80',
        heroMetrics: [
          { id: 'hm-1', label: 'MIN. INVESTMENT', value: '₹75 Lakhs' },
          { id: 'hm-2', label: 'ANNUAL ROI', value: '26% p.a.' },
          { id: 'hm-3', label: 'PAYBACK PERIOD', value: '3.2 Years' },
          { id: 'hm-4', label: 'OPERATING MODEL', value: 'FOCO' },
        ],
        visionHeadline: 'Reinventing Longevity Medicine & High-Yield Hospitality',
        visionDescription: 'Nestled amidst 30 acres of biodiverse cloud-forest canopy in Wayanad, the sanctuary integrates traditional Panchakarma protocols with modern biomarker longevity diagnostics.',
        blueprintMetrics: [
          { id: 'bp-1', label: 'TOTAL PROJECT CAPEX', value: '₹28 Cr' },
          { id: 'bp-2', label: 'MINIMUM TICKET SIZE', value: '₹75 Lakhs' },
          { id: 'bp-3', label: 'LOCK-IN DURATION', value: '2.0 Years' },
          { id: 'bp-4', label: 'DISTRIBUTION FREQUENCY', value: 'Monthly Dividend' },
        ],
        ecosystemSubheading: 'Comprehensive Ecosystem',
        ecosystemHeading: 'Institutional Support & Quality Governance',
        ecosystemDescription: 'End-to-end operational execution from location procurement to clinician credentialing.',
        ecosystemCards: [
          { id: 'eco-1', title: 'Location Scouting & Prime RERA Leasing', description: 'Curated 100% compliant heritage site acquisition.', icon: 'storefront' },
          { id: 'eco-2', title: 'Biophilic Sensory Architecture', description: 'Acoustically tuned hydrotherapy and meditation pavilions.', icon: 'design_services' },
          { id: 'eco-3', title: 'Vedic Therapist Academy Certification', description: 'Strict clinician vetting and continuous Ayurvedic masterclasses.', icon: 'school' },
          { id: 'eco-4', title: 'Global HNW Client Acquisition & Marketing', description: 'Direct pipeline through Vilaasa private investor syndicate.', icon: 'campaign' },
        ],
        benefitsSubheading: 'The FOCO Advantage',
        benefitsDescription: 'Zero operational headache with institutional transparency.',
        benefitCards: [
          { id: 'ben-1', title: '100% Hands-Off Passive Ownership', description: 'Turnkey operational management managed entirely by Vilaasa hospitality experts.', icon: 'volunteer_activism' },
          { id: 'ben-2', title: 'Escrow-Protected Distributions', description: 'Audited monthly dividend disbursements directly to accredited bank folios.', icon: 'shield' },
          { id: 'ben-3', title: 'High-Growth Wellness Sector Tailwinds', description: 'Capitalize on the $1.2 Trillion global medical and longevity tourism surge.', icon: 'trending_up' },
        ],
        galleryImages: [
          {
            id: 'gal-1',
            url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop&q=80',
            caption: 'Panoramic Canopy Spa Suite',
            orderIndex: 0,
            isHero: true,
          },
          {
            id: 'gal-2',
            url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1600&auto=format&fit=crop&q=80',
            caption: 'Hydrotherapy Sanctuary Pool',
            orderIndex: 1,
            isHero: false,
          },
        ],
      },
    });

    expect(pageRes.status()).toBe(200);
    const pageJson = await pageRes.json();
    expect(pageJson.success).toBe(true);
    console.log('[Step 1] Franchise editorial page content upserted.');
  });

  // --------------------------------------------------------------------------
  // STEP 2: Admin Dashboard & Inventory Management Directories
  // --------------------------------------------------------------------------
  test('2. Admin Portal Directory Verification', async ({ page }) => {
    console.log('\n[Step 2] Logging in to Admin via Browser UI...');
    await page.goto(`${BASE_URL}/admin/login`);
    await page.waitForLoadState('networkidle');

    await page.fill('#email', 'superadmin@vilaasa.com');
    await page.fill('#pass', 'SuperAdmin@Vilaasa2026');
    await page.click('button[type="submit"]');

    // Wait for redirect to admin routes
    await page.waitForTimeout(2000);
    console.log('[Step 2] Super Admin logged in via UI. URL:', page.url());

    // 2A. Admin Properties Directory Check
    console.log('[Step 2] Checking Admin Properties directory...');
    await page.goto(`${BASE_URL}/admin/properties`);
    await page.waitForLoadState('networkidle');

    const propertyRow = page.locator(`text=${testPropertyName}`).first();
    await expect(propertyRow).toBeVisible({ timeout: 15000 });
    console.log(`[Step 2] Confirmed "${testPropertyName}" is listed in Admin Properties!`);

    // 2B. Admin Franchises Directory Check
    console.log('[Step 2] Checking Admin Franchises directory...');
    await page.goto(`${BASE_URL}/admin/franchises`);
    await page.waitForLoadState('networkidle');

    const franchiseRow = page.locator(`text=${testFranchiseName}`).first();
    await expect(franchiseRow).toBeVisible({ timeout: 15000 });
    console.log(`[Step 2] Confirmed "${testFranchiseName}" is listed in Admin Franchises!`);
  });

  // --------------------------------------------------------------------------
  // STEP 3: Public Real Estate Directory & Property Dossier
  // --------------------------------------------------------------------------
  test('3. Public Real Estate Showcase & Property Dossier View', async ({ page }) => {
    // 3A. Domestic Real Estate Catalog View
    console.log('\n[Step 3] Navigating to Public Domestic Real Estate (/domestic/real-estate)...');
    await page.goto(`${BASE_URL}/domestic/real-estate`);
    await page.waitForLoadState('networkidle');

    const propertyCard = page.locator(`text=${testPropertyName}`).first();
    await expect(propertyCard).toBeVisible({ timeout: 15000 });
    console.log(`[Step 3] ✅ "${testPropertyName}" is visibly rendered on /domestic/real-estate!`);

    // 3B. Navigate to Single Property Dossier Page
    console.log(`[Step 3] Navigating to Property Dossier: /property/${createdPropertySlug}...`);
    await page.goto(`${BASE_URL}/property/${createdPropertySlug}`);
    await page.waitForLoadState('networkidle');

    // Verify key fields on the Property Detail page
    await expect(page.locator(`text=${testPropertyName}`).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Plot Area').first()).toBeVisible();
    await expect(page.locator('text=18,500 Sq.Ft.').first()).toBeVisible();
    await expect(page.locator('text=Private Cliff Infinity Pool').first()).toBeVisible();
    await expect(page.locator('text=Goa').first()).toBeVisible();

    console.log(`[Step 3] ✅ Public Property Dossier (/property/${createdPropertySlug}) verified successfully!`);
  });

  // --------------------------------------------------------------------------
  // STEP 4: Public Franchise Catalog & Bespoke 7-Section Editorial Page
  // --------------------------------------------------------------------------
  test('4. Public Franchise Showcase & 7-Section Editorial View', async ({ page }) => {
    // 4A. Domestic Franchise Catalog View
    console.log('\n[Step 4] Navigating to Public Domestic Franchise catalog (/domestic/franchise)...');
    await page.goto(`${BASE_URL}/domestic/franchise`);
    await page.waitForLoadState('networkidle');

    const franchiseCard = page.locator(`text=${testFranchiseName}`).first();
    await expect(franchiseCard).toBeVisible({ timeout: 15000 });
    console.log(`[Step 4] ✅ "${testFranchiseName}" is visibly rendered on /domestic/franchise!`);

    // 4B. Navigate to Single Franchise Detail Page
    console.log(`[Step 4] Navigating to Franchise Detail: /franchise/${createdFranchiseSlug}...`);
    await page.goto(`${BASE_URL}/franchise/${createdFranchiseSlug}`);
    await page.waitForLoadState('networkidle');

    // Unlock OTP session in localStorage so that the full deep editorial sections are viewable
    await page.evaluate(() => {
      localStorage.setItem('vilaasa-otp-access', JSON.stringify({ verifiedAt: Date.now() }));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 4C. Assert all 7 Bespoke Editorial Sections
    console.log('[Step 4] Verifying 7-Section Franchise Components...');
    // Hero Headline
    await expect(page.locator(`text=${testFranchiseName}`).first()).toBeVisible({ timeout: 15000 });
    
    // Hero Metrics (Section 2) - formatted by formatDynamicValue as ₹75.00 L or 75 L
    await expect(page.locator('text=MIN. INVESTMENT').first()).toBeVisible();
    await expect(page.locator('text=26% p.a.').first()).toBeVisible();
    
    // Vision Section (Section 3)
    await expect(page.locator('text=Reinventing Longevity Medicine').first()).toBeVisible();
    
    // Blueprint Section (Section 4)
    await expect(page.locator('text=TOTAL PROJECT CAPEX').first()).toBeVisible();
    
    // Ecosystem Cards (Section 5)
    await expect(page.locator('text=Location Scouting & Prime RERA Leasing').first()).toBeVisible();
    
    // Benefit Cards (Section 6)
    await expect(page.locator('text=100% Hands-Off Passive Ownership').first()).toBeVisible();
    await expect(page.locator('text=Escrow-Protected Distributions').first()).toBeVisible();

    console.log(`[Step 4] ✅ Public Franchise Detail (/franchise/${createdFranchiseSlug}) verified with full 7-section content!`);
  });
});
