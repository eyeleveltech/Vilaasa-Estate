export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  orderIndex: number;
  isHero?: boolean;
}

export interface MetricBadge {
  id: string;
  label: string;
  value: string;
}

export interface SupportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface BenefitCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FranchisePageData {
  pageTitle: string;
  mainHeadline: string;
  subheading: string;
  heroImage?: string;

  // Dynamic Array Lists
  heroMetrics: MetricBadge[];
  blueprintMetrics: MetricBadge[];
  ecosystemCards: SupportCard[];
  benefitCards: BenefitCard[];

  // Legacy flat fields for backward compatibility
  metric1Label?: string;
  metric1Value?: string;
  metric2Label?: string;
  metric2Value?: string;
  metric3Label?: string;
  metric3Value?: string;
  metric4Label?: string;
  metric4Value?: string;

  visionHeadline: string;
  visionDescription: string;

  metric5Label?: string;
  metric5Value?: string;
  metric6Label?: string;
  metric6Value?: string;
  metric7Label?: string;
  metric7Value?: string;
  metric8Label?: string;
  metric8Value?: string;

  ecosystemSubheading: string;
  ecosystemHeading: string;
  ecosystemDescription: string;

  support1Title?: string;
  support1Description?: string;
  support1Icon?: string;
  support2Title?: string;
  support2Description?: string;
  support2Icon?: string;
  support3Title?: string;
  support3Description?: string;
  support3Icon?: string;
  support4Title?: string;
  support4Description?: string;
  support4Icon?: string;

  benefitsSubheading: string;
  benefitsDescription: string;

  benefit1Title?: string;
  benefit1Description?: string;
  benefit1Icon?: string;
  benefit2Title?: string;
  benefit2Description?: string;
  benefit2Icon?: string;
  benefit3Title?: string;
  benefit3Description?: string;
  benefit3Icon?: string;

  nextStepsSubheading?: string;
  nextStepsDescription?: string;
  ctaButton1?: string;
  ctaButton2?: string;
  planningHeadline?: string;
  planningDescription?: string;

  galleryImages: GalleryItem[];
  sectionVisibility?: Record<string, boolean>;
}

export const DEFAULT_FRANCHISE_SECTION_VISIBILITY: Record<string, boolean> = {
  "sec-hero": true,
  "sec-hero-metrics": true,
  "sec-vision": true,
  "sec-blueprint": true,
  "sec-ecosystem": true,
  "sec-benefits": true,
  "sec-gallery": true,
};

export const HERO_PLACEHOLDERS = [
  { label: 'e.g. MIN. INVESTMENT', value: 'e.g. ₹3.5 Cr' },
  { label: 'e.g. ANNUAL ROI', value: 'e.g. 24% - 30%' },
  { label: 'e.g. PAYBACK PERIOD', value: 'e.g. 3 Years' },
  { label: 'e.g. MODEL', value: 'e.g. FOCO' },
];

export const BLUEPRINT_PLACEHOLDERS = [
  { label: 'e.g. TOTAL PROJECT COST', value: 'e.g. ₹12 Cr' },
  { label: 'e.g. MIN. TICKET SIZE', value: 'e.g. ₹3.5 Cr' },
  { label: 'e.g. LOCK-IN PERIOD', value: 'e.g. 60 Months' },
  { label: 'e.g. YIELD PAYOUT', value: 'e.g. Quarterly' },
];

export const ECOSYSTEM_PLACEHOLDERS = [
  {
    title: 'e.g. Location Scouting',
    description: 'e.g. AI-driven demographic density analysis, footfall mapping, and prime high-street commercial leasing advisory.',
  },
  {
    title: 'e.g. Architecture & Interior Design',
    description: 'e.g. End-to-end biophilic sanctuary blueprints, luxury material sourcing, and turnkey contractor supervision.',
  },
  {
    title: 'e.g. Staff & Therapist Training',
    description: 'e.g. Certified Vedic master training, clinical hygiene protocol implementation, and guest experience benchmarks.',
  },
  {
    title: 'e.g. Global Marketing & PR',
    description: 'e.g. Ultra-high-net-worth targeted digital acquisition, luxury lifestyle influencer placements, and launch events.',
  },
];

export const BENEFIT_PLACEHOLDERS = [
  {
    title: 'e.g. 100% Hands-Off Operations',
    description: 'e.g. Master operating partner runs all daily staffing, guest hospitality, and licensing. You receive passive net yield disbursements.',
  },
  {
    title: 'e.g. Institutional Brand Power',
    description: 'e.g. Immediate brand prestige with an established global reputation, recurring VIP memberships, and international client retention.',
  },
  {
    title: 'e.g. Capital Protection & Escrow',
    description: 'e.g. Institutional governance with escrow-backed capex reserves, RERA registered leases, and transparent quarterly audited books.',
  },
];

export const DEFAULT_PAGE_DATA: FranchisePageData = {
  pageTitle: '',
  mainHeadline: '',
  subheading: '',
  heroImage: '',

  heroMetrics: [
    { id: 'hero-1', label: '', value: '' },
    { id: 'hero-2', label: '', value: '' },
    { id: 'hero-3', label: '', value: '' },
    { id: 'hero-4', label: '', value: '' },
  ],

  visionHeadline: '',
  visionDescription: '',

  blueprintMetrics: [
    { id: 'bp-1', label: '', value: '' },
    { id: 'bp-2', label: '', value: '' },
    { id: 'bp-3', label: '', value: '' },
    { id: 'bp-4', label: '', value: '' },
  ],

  ecosystemSubheading: '',
  ecosystemHeading: '',
  ecosystemDescription: '',
  ecosystemCards: [
    { id: 'eco-1', title: '', description: '', icon: 'storefront' },
    { id: 'eco-2', title: '', description: '', icon: 'design_services' },
    { id: 'eco-3', title: '', description: '', icon: 'school' },
    { id: 'eco-4', title: '', description: '', icon: 'campaign' },
  ],

  benefitsSubheading: '',
  benefitsDescription: '',
  benefitCards: [
    { id: 'ben-1', title: '', description: '', icon: 'volunteer_activism' },
    { id: 'ben-2', title: '', description: '', icon: 'shield' },
    { id: 'ben-3', title: '', description: '', icon: 'trending_up' },
  ],

  galleryImages: [],
  sectionVisibility: { ...DEFAULT_FRANCHISE_SECTION_VISIBILITY },
};

export const COMMON_ICONS = [
  'storefront',
  'design_services',
  'school',
  'campaign',
  'volunteer_activism',
  'shield',
  'trending_up',
  'spa',
  'restaurant',
  'verified',
  'payments',
  'groups',
  'hotel',
  'health_and_safety',
];

export const detectIconFromKeyword = (text: string, defaultIcon: string): string => {
  const lower = text.toLowerCase();
  if (/location|site|land|scout|place|geo|city|map|destination|territory/.test(lower)) return 'storefront';
  if (/architect|design|interior|biophilic|decor|layout|plan|build|styling|blueprint/.test(lower)) return 'design_services';
  if (/train|staff|team|ayurveda|therapist|school|learn|academy|doctor|specialist|faculty/.test(lower)) return 'school';
  if (/market|brand|pr|global|campaign|promote|media|advisory|outreach|social|ad/.test(lower)) return 'campaign';
  if (/hands-off|passive|manage|operat|turnkey|foco|automation|executive|oversight/.test(lower)) return 'volunteer_activism';
  if (/escrow|secur|protect|guarantee|safe|trust|legal|rera|audit|compliance|covenant/.test(lower)) return 'shield';
  if (/return|roi|yield|profit|payout|dividend|growth|capital|wealth|cash|appreciation/.test(lower)) return 'trending_up';
  if (/spa|wellness|resort|hotel|hospitality|heal|guest|retreat|sanctuary|suite/.test(lower)) return 'spa';
  if (/food|dine|culinary|chef|restaurant|cafe|bar|kitchen|gastronomy/.test(lower)) return 'restaurant';
  if (/certif|quality|award|standard|accredit|grade|iso|star/.test(lower)) return 'verified';
  return defaultIcon;
};

/**
 * Automatically converts currency shortcuts (e.g. "inr", "rs", "rupee", "usd", "eur", "gbp")
 * into their proper symbols (e.g. "₹", "$", "€", "£").
 */
export const autoFormatCurrencySymbol = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/(?:^|\b)(inr|rs\.?|rupees?)(?:\s*|(?=\d))/gi, '₹')
    .replace(/(?:^|\b)(usd|dollars?)(?:\s*|(?=\d))/gi, '$')
    .replace(/(?:^|\b)(eur|euros?)(?:\s*|(?=\d))/gi, '€')
    .replace(/(?:^|\b)(gbp|pounds?)(?:\s*|(?=\d))/gi, '£')
    .replace(/(?:^|\b)(aed|dirhams?)(?:\s*|(?=\d))/gi, 'AED ');
};

/**
 * Normalizes page data to ensure dynamic arrays are always valid arrays,
 * converting legacy flat fields if array is missing or empty.
 */
export const normalizeFranchisePageData = (
  raw: Partial<FranchisePageData> | null | undefined
): FranchisePageData => {
  if (!raw) return { ...DEFAULT_PAGE_DATA };

  // 1. Hero Metrics
  let heroMetrics: MetricBadge[] = [];
  if (Array.isArray(raw.heroMetrics) && raw.heroMetrics.length > 0) {
    heroMetrics = raw.heroMetrics;
  } else {
    // Check legacy fields
    const legacyHero: MetricBadge[] = [];
    if (raw.metric1Label || raw.metric1Value) {
      legacyHero.push({ id: 'h1', label: raw.metric1Label || 'MIN. INVESTMENT', value: raw.metric1Value || '' });
    }
    if (raw.metric2Label || raw.metric2Value) {
      legacyHero.push({ id: 'h2', label: raw.metric2Label || 'ANNUAL ROI', value: raw.metric2Value || '' });
    }
    if (raw.metric3Label || raw.metric3Value) {
      legacyHero.push({ id: 'h3', label: raw.metric3Label || 'PAYBACK PERIOD', value: raw.metric3Value || '' });
    }
    if (raw.metric4Label || raw.metric4Value) {
      legacyHero.push({ id: 'h4', label: raw.metric4Label || 'MODEL', value: raw.metric4Value || '' });
    }
    heroMetrics = legacyHero.length > 0 ? legacyHero : DEFAULT_PAGE_DATA.heroMetrics;
  }

  // 2. Blueprint Metrics
  let blueprintMetrics: MetricBadge[] = [];
  if (Array.isArray(raw.blueprintMetrics) && raw.blueprintMetrics.length > 0) {
    blueprintMetrics = raw.blueprintMetrics;
  } else {
    const legacyBp: MetricBadge[] = [];
    if (raw.metric5Label || raw.metric5Value) {
      legacyBp.push({ id: 'bp1', label: raw.metric5Label || 'TOTAL PROJECT COST', value: raw.metric5Value || '' });
    }
    if (raw.metric6Label || raw.metric6Value) {
      legacyBp.push({ id: 'bp2', label: raw.metric6Label || 'MIN. TICKET SIZE', value: raw.metric6Value || '' });
    }
    if (raw.metric7Label || raw.metric7Value) {
      legacyBp.push({ id: 'bp3', label: raw.metric7Label || 'LOCK-IN PERIOD', value: raw.metric7Value || '' });
    }
    if (raw.metric8Label || raw.metric8Value) {
      legacyBp.push({ id: 'bp4', label: raw.metric8Label || 'YIELD PAYOUT', value: raw.metric8Value || '' });
    }
    blueprintMetrics = legacyBp.length > 0 ? legacyBp : DEFAULT_PAGE_DATA.blueprintMetrics;
  }

  // 3. Ecosystem Cards
  let ecosystemCards: SupportCard[] = [];
  if (Array.isArray(raw.ecosystemCards) && raw.ecosystemCards.length > 0) {
    ecosystemCards = raw.ecosystemCards;
  } else {
    const legacyEco: SupportCard[] = [];
    if (raw.support1Title) {
      legacyEco.push({
        id: 'eco1',
        title: raw.support1Title,
        description: raw.support1Description || '',
        icon: raw.support1Icon || 'storefront',
      });
    }
    if (raw.support2Title) {
      legacyEco.push({
        id: 'eco2',
        title: raw.support2Title,
        description: raw.support2Description || '',
        icon: raw.support2Icon || 'design_services',
      });
    }
    if (raw.support3Title) {
      legacyEco.push({
        id: 'eco3',
        title: raw.support3Title,
        description: raw.support3Description || '',
        icon: raw.support3Icon || 'school',
      });
    }
    if (raw.support4Title) {
      legacyEco.push({
        id: 'eco4',
        title: raw.support4Title,
        description: raw.support4Description || '',
        icon: raw.support4Icon || 'campaign',
      });
    }
    ecosystemCards = legacyEco.length > 0 ? legacyEco : DEFAULT_PAGE_DATA.ecosystemCards;
  }

  // 4. Benefit Cards
  let benefitCards: BenefitCard[] = [];
  if (Array.isArray(raw.benefitCards) && raw.benefitCards.length > 0) {
    benefitCards = raw.benefitCards;
  } else {
    const legacyBen: BenefitCard[] = [];
    if (raw.benefit1Title) {
      legacyBen.push({
        id: 'ben1',
        title: raw.benefit1Title,
        description: raw.benefit1Description || '',
        icon: raw.benefit1Icon || 'volunteer_activism',
      });
    }
    if (raw.benefit2Title) {
      legacyBen.push({
        id: 'ben2',
        title: raw.benefit2Title,
        description: raw.benefit2Description || '',
        icon: raw.benefit2Icon || 'shield',
      });
    }
    if (raw.benefit3Title) {
      legacyBen.push({
        id: 'ben3',
        title: raw.benefit3Title,
        description: raw.benefit3Description || '',
        icon: raw.benefit3Icon || 'trending_up',
      });
    }
    benefitCards = legacyBen.length > 0 ? legacyBen : DEFAULT_PAGE_DATA.benefitCards;
  }

  // 5. Gallery Images & Hero Image Sync
  const rawGallery = Array.isArray(raw.galleryImages) ? raw.galleryImages : [];
  const heroImage = raw.heroImage || rawGallery.find((g) => g.isHero)?.url || '';
  const galleryImages: GalleryItem[] = rawGallery.map((g) => ({
    ...g,
    isHero: Boolean(g.isHero || (heroImage && g.url === heroImage)),
  }));

  // 6. Section Visibility
  const sectionVisibility = raw.sectionVisibility && typeof raw.sectionVisibility === 'object'
    ? { ...DEFAULT_FRANCHISE_SECTION_VISIBILITY, ...raw.sectionVisibility }
    : { ...DEFAULT_FRANCHISE_SECTION_VISIBILITY };

  return {
    ...DEFAULT_PAGE_DATA,
    ...raw,
    heroImage,
    heroMetrics,
    blueprintMetrics,
    ecosystemCards,
    benefitCards,
    galleryImages,
    sectionVisibility,
  };
};

/**
 * Prepares payload for saving by populating both dynamic arrays and legacy fields.
 */
export const prepareFranchisePagePayload = (data: FranchisePageData): FranchisePageData => {
  const heroItem = data.galleryImages.find((g) => g.isHero);
  const heroImage = heroItem?.url || data.heroImage || (data.galleryImages[0]?.url || '');

  const payload: FranchisePageData = {
    ...data,
    heroImage,
    sectionVisibility: data.sectionVisibility || DEFAULT_FRANCHISE_SECTION_VISIBILITY,
    metric1Label: data.heroMetrics[0]?.label || '',
    metric1Value: data.heroMetrics[0]?.value || '',
    metric2Label: data.heroMetrics[1]?.label || '',
    metric2Value: data.heroMetrics[1]?.value || '',
    metric3Label: data.heroMetrics[2]?.label || '',
    metric3Value: data.heroMetrics[2]?.value || '',
    metric4Label: data.heroMetrics[3]?.label || '',
    metric4Value: data.heroMetrics[3]?.value || '',

    metric5Label: data.blueprintMetrics[0]?.label || '',
    metric5Value: data.blueprintMetrics[0]?.value || '',
    metric6Label: data.blueprintMetrics[1]?.label || '',
    metric6Value: data.blueprintMetrics[1]?.value || '',
    metric7Label: data.blueprintMetrics[2]?.label || '',
    metric7Value: data.blueprintMetrics[2]?.value || '',
    metric8Label: data.blueprintMetrics[3]?.label || '',
    metric8Value: data.blueprintMetrics[3]?.value || '',

    support1Title: data.ecosystemCards[0]?.title || '',
    support1Description: data.ecosystemCards[0]?.description || '',
    support1Icon: data.ecosystemCards[0]?.icon || 'storefront',
    support2Title: data.ecosystemCards[1]?.title || '',
    support2Description: data.ecosystemCards[1]?.description || '',
    support2Icon: data.ecosystemCards[1]?.icon || 'design_services',
    support3Title: data.ecosystemCards[2]?.title || '',
    support3Description: data.ecosystemCards[2]?.description || '',
    support3Icon: data.ecosystemCards[2]?.icon || 'school',
    support4Title: data.ecosystemCards[3]?.title || '',
    support4Description: data.ecosystemCards[3]?.description || '',
    support4Icon: data.ecosystemCards[3]?.icon || 'campaign',

    benefit1Title: data.benefitCards[0]?.title || '',
    benefit1Description: data.benefitCards[0]?.description || '',
    benefit1Icon: data.benefitCards[0]?.icon || 'volunteer_activism',
    benefit2Title: data.benefitCards[1]?.title || '',
    benefit2Description: data.benefitCards[1]?.description || '',
    benefit2Icon: data.benefitCards[1]?.icon || 'shield',
    benefit3Title: data.benefitCards[2]?.title || '',
    benefit3Description: data.benefitCards[2]?.description || '',
    benefit3Icon: data.benefitCards[2]?.icon || 'trending_up',
  };

  return payload;
};

/* -------------------------------------------------------------------------- */
/*                           SMART PRESET ARRAYS                              */
/* -------------------------------------------------------------------------- */

export interface Preset {
  label: string;
  value?: string;
  icon?: string;
}

/** Hero metric badge presets (Section 2 — Franchise) */
export const FRANCHISE_BADGE_PRESETS: Preset[] = [
  { label: 'MIN. INVESTMENT' },
  { label: 'ANNUAL ROI' },
  { label: 'PAYBACK PERIOD' },
  { label: 'FRANCHISE MODEL' },
  { label: 'PROJECTED IRR' },
  { label: 'LOCK-IN PERIOD' },
  { label: 'YIELD PAYOUT' },
  { label: 'OCCUPANCY RATE' },
  { label: 'NO. OF UNITS' },
  { label: 'LAUNCH YEAR' },
];

/** Blueprint metric presets (Section 4 — Franchise) */
export const BLUEPRINT_PRESETS: Preset[] = [
  { label: 'TOTAL PROJECT COST' },
  { label: 'MIN. TICKET SIZE' },
  { label: 'BASE FRANCHISE FEE' },
  { label: 'LOCK-IN PERIOD' },
  { label: 'YIELD PAYOUT FREQUENCY' },
  { label: 'CONSTRUCTION TIMELINE' },
  { label: 'BREAKEVEN PERIOD' },
  { label: 'MANAGEMENT FEE' },
  { label: 'REVENUE SHARE' },
  { label: 'NET RENTAL YIELD' },
  { label: '2025 MARKET SIZE / GDV' },
];

/** Ecosystem support card presets (Section 5 — Franchise) */
export const ECOSYSTEM_CARD_PRESETS: Preset[] = [
  { label: 'Location Scouting', icon: 'storefront' },
  { label: 'Architecture & Interior Design', icon: 'design_services' },
  { label: 'Staff & Therapist Training', icon: 'school' },
  { label: 'Global Marketing & PR', icon: 'campaign' },
  { label: 'Legal & Compliance', icon: 'shield' },
  { label: 'Technology & POS', icon: 'devices' },
  { label: 'Supply Chain Management', icon: 'local_shipping' },
  { label: 'Revenue Management', icon: 'trending_up' },
  { label: 'Guest Experience Standards', icon: 'spa' },
  { label: 'Quality Assurance', icon: 'verified' },
];

/** Benefit card presets (Section 6 — Franchise) */
export const BENEFIT_CARD_PRESETS: Preset[] = [
  { label: '100% Hands-Off Operations', icon: 'volunteer_activism' },
  { label: 'Institutional Brand Power', icon: 'verified' },
  { label: 'Capital Protection & Escrow', icon: 'shield' },
  { label: 'Quarterly Yield Disbursements', icon: 'payments' },
  { label: 'Global Investor Network', icon: 'groups' },
  { label: 'RERA Registered Leases', icon: 'gavel' },
  { label: 'Transparent Quarterly Audit', icon: 'receipt_long' },
  { label: 'Exit Liquidity Options', icon: 'trending_up' },
];

/** At-a-Glance spec presets (Section 3 — Property) */
export const SPEC_PRESETS: Preset[] = [
  { label: 'BUILT-UP AREA' },
  { label: 'PLOT AREA' },
  { label: 'BEDROOMS' },
  { label: 'BATHROOMS' },
  { label: 'FURNISHING' },
  { label: 'OWNERSHIP TYPE' },
  { label: 'STARTING PRICE' },
  { label: 'PRICE PER SQ.FT.' },
  { label: 'BOOKING AMOUNT' },
  { label: 'MAINTENANCE CHARGES' },
  { label: 'FLOOR' },
  { label: 'PARKING' },
  { label: 'FACING DIRECTION' },
  { label: 'CARPET AREA' },
  { label: 'BALCONIES' },
  { label: 'POSSESSION DATE' },
];

/** Financial intelligence metric presets (Section 4 — Property) */
export const FINANCIAL_METRIC_PRESETS: Preset[] = [
  { label: 'PROJECTED IRR', icon: 'trending_up' },
  { label: '2025 MARKET SIZE / GDV', icon: 'monitoring' },
  { label: 'CAPITAL GROWTH TIMELINE', icon: 'timelapse' },
  { label: 'ANNUAL APPRECIATION', icon: 'trending_up' },
  { label: 'NET RENTAL YIELD', icon: 'payments' },
  { label: 'BREAKEVEN TIMELINE', icon: 'timelapse' },
  { label: 'CAPITAL GAINS OUTLOOK', icon: 'savings' },
  { label: 'GROSS RENTAL INCOME', icon: 'payments' },
  { label: 'STAMP DUTY SAVINGS', icon: 'receipt_long' },
];

/** Unit configuration type presets (Section 5 — Property) */
export const UNIT_TYPE_PRESETS: Preset[] = [
  { label: 'Studio' },
  { label: '1 BHK' },
  { label: '2 BHK' },
  { label: '3 BHK' },
  { label: '4 BHK' },
  { label: '5 BHK' },
  { label: 'Penthouse' },
  { label: 'Duplex' },
  { label: 'Triplex' },
  { label: 'Villa' },
  { label: 'Plot' },
  { label: 'Farmhouse' },
];

/** Amenity presets (Section 7 — Property) */
export const AMENITY_PRESETS: Preset[] = [
  { label: 'Spa & Wellness Sanctuary', icon: 'spa' },
  { label: 'Waterfront Living & Water Body', icon: 'water' },
  { label: 'Eco & Biophilic Green Sanctuary', icon: 'eco' },
  { label: 'Fine Dining & Organic Restaurant', icon: 'restaurant' },
  { label: 'Swimming Pool', icon: 'pool' },
  { label: 'Gymnasium / Fitness Center', icon: 'fitness_center' },
  { label: 'Yoga & Meditation Studio', icon: 'self_improvement' },
  { label: 'Clubhouse & Lounge', icon: 'cottage' },
  { label: 'Private Beach Access', icon: 'beach_access' },
  { label: 'Boat Club & Marina', icon: 'directions_boat' },
  { label: 'Helipad', icon: 'helicopter' },
  { label: 'Tennis Court', icon: 'sports_tennis' },
  { label: 'Golf Course', icon: 'sports_golf' },
  { label: 'Concierge & Butler Service', icon: 'room_service' },
  { label: 'Valet Parking', icon: 'local_parking' },
  { label: 'High-Speed WiFi', icon: 'wifi' },
  { label: '24/7 Security & CCTV', icon: 'security' },
  { label: 'Kids Play Area', icon: 'child_care' },
  { label: 'Private Garden & Landscape', icon: 'park' },
  { label: 'Rooftop Terrace', icon: 'deck' },
  { label: 'In-house Cinema / Screening', icon: 'theaters' },
  { label: 'Pet-Friendly Zones', icon: 'pets' },
];

/** Nearby place category presets (Section 8 — Property) */
export const NEARBY_CATEGORY_PRESETS = [
  'Airport',
  'Hospital / Medical Centre',
  'International School',
  'Shopping Mall',
  'Beach / Waterfront',
  'Golf Course',
  'Metro / Transit Hub',
  'Business District',
  'National Park / Nature Reserve',
  'Heritage Site',
  'Fine Dining / Marina',
];

export const NEARBY_PLACE_PRESETS: Preset[] = [
  { label: 'International Airport', value: 'Airport', icon: 'flight' },
  { label: 'Metro / Transit Hub', value: 'Metro', icon: 'train' },
  { label: 'Super-Speciality Hospital', value: 'Hospital', icon: 'local_hospital' },
  { label: 'International School', value: 'School', icon: 'school' },
  { label: 'Pristine Beach / Waterfront', value: 'Beach', icon: 'beach_access' },
  { label: 'Luxury Shopping Mall', value: 'Shopping', icon: 'shopping_bag' },
  { label: 'Fine Dining Promenade', value: 'Dining', icon: 'restaurant' },
  { label: 'Yacht Club & Marina', value: 'Leisure', icon: 'directions_boat' },
  { label: 'Championship Golf Course', value: 'Golf', icon: 'sports_golf' },
  { label: 'Central Business District (CBD)', value: 'Business', icon: 'business_center' },
  { label: 'National Park / Wildlife Sanctuary', value: 'Nature', icon: 'forest' },
  { label: 'Heritage Fort & Cultural Site', value: 'Heritage', icon: 'castle' },
];

export const NEARBY_CATEGORY_OPTIONS = [
  { value: 'Airport', label: 'Airport', icon: 'flight' },
  { value: 'Metro', label: 'Metro / Transit', icon: 'train' },
  { value: 'Hospital', label: 'Hospital / Medical', icon: 'local_hospital' },
  { value: 'School', label: 'School / Academy', icon: 'school' },
  { value: 'Beach', label: 'Beach / Waterfront', icon: 'beach_access' },
  { value: 'Shopping', label: 'Shopping Mall', icon: 'shopping_bag' },
  { value: 'Dining', label: 'Fine Dining', icon: 'restaurant' },
  { value: 'Leisure', label: 'Yacht Club / Marina', icon: 'directions_boat' },
  { value: 'Golf', label: 'Golf Course', icon: 'sports_golf' },
  { value: 'Business', label: 'Business District', icon: 'business_center' },
  { value: 'Nature', label: 'Nature / Park', icon: 'forest' },
  { value: 'Heritage', label: 'Heritage Site', icon: 'castle' },
  { value: 'Transit', label: 'General Landmark', icon: 'near_me' },
];

export const COMMON_NEARBY_ICONS = [
  { label: "Flight / Airport", icon: "flight" },
  { label: "Helipad", icon: "helicopter" },
  { label: "Train / Metro", icon: "train" },
  { label: "Subway / Transit", icon: "subway" },
  { label: "Car / Drive", icon: "directions_car" },
  { label: "Navigation / Near Me", icon: "near_me" },
  { label: "Beach / Coast", icon: "beach_access" },
  { label: "Water / Ocean", icon: "water" },
  { label: "Boat / Marina", icon: "directions_boat" },
  { label: "Sailing / Yacht", icon: "sailing" },
  { label: "Hospital / Healthcare", icon: "local_hospital" },
  { label: "Medical / Clinic", icon: "medical_services" },
  { label: "School / Education", icon: "school" },
  { label: "Shopping / Retail", icon: "shopping_bag" },
  { label: "Storefront / Mall", icon: "storefront" },
  { label: "Dining / Restaurant", icon: "restaurant" },
  { label: "Cafe / Coffee", icon: "local_cafe" },
  { label: "Lounge / Bar", icon: "local_bar" },
  { label: "Golf Course", icon: "sports_golf" },
  { label: "Tennis Court", icon: "sports_tennis" },
  { label: "Stadium / Arena", icon: "stadium" },
  { label: "Business / CBD", icon: "business_center" },
  { label: "Tower / High-Rise", icon: "apartment" },
  { label: "Forest / Nature", icon: "forest" },
  { label: "Park / Garden", icon: "park" },
  { label: "Castle / Heritage", icon: "castle" },
  { label: "Museum / Gallery", icon: "museum" },
  { label: "Temple / Shrine", icon: "temple_hindu" },
  { label: "Church / Cathedral", icon: "church" },
  { label: "Map Pin / Location", icon: "location_on" },
  { label: "Star / Landmark", icon: "star" },
];

export const getNearbyCategoryIcon = (category: string): string => {
  switch (category) {
    case "Airport": return "flight";
    case "Metro": return "train";
    case "Hospital": return "local_hospital";
    case "School": return "school";
    case "Beach": return "beach_access";
    case "Shopping": return "shopping_bag";
    case "Dining": return "restaurant";
    case "Leisure": return "directions_boat";
    case "Golf": return "sports_golf";
    case "Business": return "business_center";
    case "Nature": return "forest";
    case "Heritage": return "castle";
    default: return "near_me";
  }
};

/* -------------------------------------------------------------------------- */
/*                         CURRENCY INPUT FORMATTER                           */
/* -------------------------------------------------------------------------- */

/**
 * Formats a raw numeric string with commas for thousand separators.
 * e.g. "15000000" → "15,000,000"
 * Preserves decimal places, non-numeric prefixes like "₹", and units like "Cr" or "Lakh".
 */
export const formatCurrencyInput = (raw: string): string => {
  if (!raw) return '';

  // Extract leading non-numeric prefix characters (e.g. "₹", "$", "AED ", "£", "€")
  const prefixMatch = raw.match(/^[^0-9]*/);
  const prefix = prefixMatch ? prefixMatch[0] : '';
  const rest = raw.slice(prefix.length);

  // If user typed shorthand with letters like 'Cr' or 'Lakh' or 'L'
  if (/[a-zA-Z]/.test(rest)) {
    return raw;
  }

  // Remove all existing commas from the numeric portion before re-formatting
  const cleanNumber = rest.replace(/,/g, '');

  // Split on decimal if present
  const [intPart, decPart] = cleanNumber.split('.');
  const formatted = (intPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return prefix + formatted + (decPart !== undefined ? '.' + decPart : '');
};
