/**
 * Imports the Vilaasa_All_Form_Data content set: 3 estates and 2 franchises.
 *
 * This is NOT the seed. prisma/seed.ts deletes every row in all 24 tables and
 * must never run against production. This script only ever touches the five
 * records below, addressed by slug, and is safe to re-run: properties are
 * upserted, and each one's own child rows (configurations, amenity links,
 * nearby places, financial metrics) are replaced so a re-run converges instead
 * of duplicating. Nothing outside these five records is read or written -
 * users, inquiries, site visits and vault data are untouched.
 *
 *   npx tsx scripts/import-content.ts
 */
import "dotenv/config";
import { PrismaClient, PropertyType } from "@prisma/client";

const prisma = new PrismaClient();

interface AmenitySpec {
  name: string;
  iconKey: string;
  description?: string;
}

interface ConfigSpec {
  unitType: string;
  areaSqFt: number;
  viewType?: string;
  price: number;
}

interface NearbySpec {
  name: string;
  distance: string;
  category?: string;
}

interface MetricSpec {
  label: string;
  value: string;
  note?: string;
}

interface ContentSpec {
  slug: string;
  name: string;
  tagline?: string;
  description: string;
  visionHeadline?: string;
  type: PropertyType;
  customType?: string;
  price: number;
  expectedIrrPercent?: number;
  verdictQuote?: string;
  verdictAuthor?: string;
  verdictTitle?: string;
  customSpecs?: Array<{ label: string; value: string }>;
  location: { city: string; country: string; community?: string };
  configurations?: ConfigSpec[];
  amenities?: AmenitySpec[];
  nearbyPlaces?: NearbySpec[];
  financialMetrics?: MetricSpec[];

  // Franchise-only
  franchiseModel?: string;
  minTicketSize?: number;
  totalProjectCost?: number;
  paybackPeriodYears?: number;
  lockInPeriodYears?: number;
  expectedAnnualRoi?: number;
  yieldPayoutFrequency?: string;
  franchisePage?: Record<string, unknown>;
}

const CONTENT: ContentSpec[] = [
  // -------------------------------------------------------------- ESTATE 1
  {
    slug: "krillam-marine-wellness-resorts",
    name: "Krillam Marine Wellness Resorts",
    tagline: "Invest in Kerala's premier marine wellness resort destinations.",
    description:
      "Invest in Kerala's premier marine wellness resort destinations. Experience luxury eco-resorts with high-yield returns in the booming $1.3 trillion wellness tourism industry.",
    visionHeadline: "Timeless elegance reimagined for the discerning few.",
    type: PropertyType.COMMERCIAL,
    customType: "Resort",
    price: 4000000,
    expectedIrrPercent: 16.5,
    verdictTitle: "The Vilaasa Verdict",
    verdictQuote:
      "Kerala wellness tourism is experiencing unprecedented growth. Krillam's unique marine wellness positioning offers exceptional IRR potential.",
    verdictAuthor: "Sanjay Pillai",
    customSpecs: [
      { label: "Property Type", value: "Marine Wellness Resort" },
      { label: "Locations", value: "3 Prime Kerala Sites" },
      { label: "Min. Investment", value: "Rs 15 Lakhs" },
      { label: "Projected IRR", value: "15-18%" },
      { label: "Industry Growth", value: "20% Annually" },
    ],
    location: { city: "Kerala", country: "India" },
    configurations: [
      { unitType: "Kothamangalam Resort", areaSqFt: 0, viewType: "Backwater Access", price: 4000000 },
      { unitType: "Kuttikanam Resort", areaSqFt: 0, viewType: "Hill Station", price: 4000000 },
      { unitType: "Vagamon Resort", areaSqFt: 0, viewType: "Meadow Setting", price: 4000000 },
    ],
    amenities: [
      { name: "Marine Wellness", iconKey: "spa", description: "Seawater therapies and Ayurvedic treatments." },
      { name: "Backwater Access", iconKey: "water", description: "Private access to Kerala backwaters." },
      { name: "Eco-Luxury", iconKey: "eco", description: "Sustainable design with premium comfort." },
      { name: "Farm-to-Table", iconKey: "restaurant", description: "Organic cuisine from local farms." },
    ],
    nearbyPlaces: [
      { name: "Kochi Airport", distance: "2 hrs drive", category: "Airport" },
      { name: "Munnar", distance: "1.5 hrs drive", category: "Landmark" },
      { name: "Alleppey Backwaters", distance: "45 mins drive", category: "Landmark" },
    ],
    financialMetrics: [
      { label: "Projected IRR Returns", value: "15-18%", note: "Wellness tourism growth driver." },
      { label: "Market Size by 2025", value: "$1.3 Trillion", note: "Global wellness tourism market." },
      { label: "Annual Industry Growth", value: "20%", note: "Fastest growing tourism segment." },
    ],
  },

  // -------------------------------------------------------------- ESTATE 2
  {
    slug: "carlton-wellness-villas",
    name: "CARLTON",
    tagline: "A Haven of Elegance and Tranquility",
    description:
      "Carlton Krillam Wellness Residences is India's first branded wellness real estate destination, thoughtfully developed to blend luxury living, authentic Ayurveda, and long-term wealth creation. Located in Ongole, Andhra Pradesh, the project offers freehold, RERA-approved villas within an integrated wellness township, supported by globally benchmarked wellness standards and professional management.\n\nEach villa is designed not only as a personal sanctuary but also as an income-generating asset. With long-term lease-back assurance, assured monthly income, lifestyle privileges, and capital appreciation potential, Carlton Krillam delivers a rare opportunity to invest in a future-ready wellness ecosystem backed by Sri Sri Panchakarma, Sri Sri Tattva, and a professionally operated hospitality framework.",
    visionHeadline: "Timeless Spaces, Lifelong Wellness",
    type: PropertyType.RESIDENTIAL_VILLA,
    customType: "Villa",
    price: 29900000,
    expectedIrrPercent: 8.5,
    verdictTitle: "The Vilaasa Verdict",
    verdictQuote:
      "Ongole's wellness positioning unlocks strong potential for superior IRR and long-term value creation.",
    verdictAuthor: "Sanjay Pillai",
    customSpecs: [
      { label: "Property Type", value: "Freehold Luxury Villas" },
      { label: "Locations", value: "Andhra Pradesh" },
      { label: "Min. Investment", value: "Rs 2.99 Crore + GST" },
      { label: "Projected IRR", value: "8-9% annually" },
      { label: "Industry Growth", value: "6.5% - 8% p.a." },
    ],
    location: { city: "Ongole", country: "India", community: "Andhra Pradesh" },
    configurations: [
      { unitType: "3 BHK Wellness Villa", areaSqFt: 0, price: 29900000 },
      { unitType: "4 BHK Wellness Villa", areaSqFt: 0, price: 36600000 },
    ],
    amenities: [
      {
        name: "Sri Sri Panchakarma Wellness Centre",
        iconKey: "spa",
        description: "A curated wellness retail experience driving year-round engagement and repeat visits.",
      },
      {
        name: "Wellness Boat Club",
        iconKey: "sailing",
        description: "A tranquil water-based leisure experience designed for relaxation and mindful living.",
      },
      {
        name: "Lifestyle Clubhouse",
        iconKey: "deck",
        description: "A premium social and recreational hub for residents and guests.",
      },
      {
        name: "Private Helipad",
        iconKey: "flight",
        description: "Seamless luxury connectivity for high-net-worth residents and guests.",
      },
    ],
    nearbyPlaces: [
      { name: "Upcoming Ongole Airport", distance: "10 minutes", category: "Airport" },
      { name: "NH-16 Economic Corridor", distance: "Immediate access", category: "Connectivity" },
      { name: "Kanaparthi Beach", distance: "10-15 minutes", category: "Landmark" },
    ],
  },

  // -------------------------------------------------------------- ESTATE 3
  {
    slug: "oxygen-forest",
    name: "OXYGEN FOREST",
    tagline: "Live in Nature's Embrace - A Managed Forest Community Just Outside Hyderabad",
    description:
      "Oxygen Forest redefines luxury living by combining exclusive farmland ownership with immersive nature experiences. Spread across a sprawling 160-acre gated forest estate, this project offers limited, organically enriched land plots surrounded on three sides by over 25,000 acres of pristine reserve forest. Designed for those who value serenity, sustainability, and deep connection with nature, each plot integrates abundant fruit-bearing and forest trees, eco-friendly infrastructure, and premium lifestyle features.\n\nIdeal both as a private retreat and a legacy investment, Oxygen Forest allows owners to build their custom villa on a portion of the land while preserving the rest as green open space. With thoughtfully curated amenities such as a clubhouse, swimming pool, lotus ponds, walking trails, and spiritual spaces, this community blends forest living with the comforts of modern design.",
    visionHeadline: "Oxygen Forest - Eco-Luxury Farm & Forest Estates",
    type: PropertyType.FARMLAND,
    customType: "Farmland Plot",
    price: 4900000,
    expectedIrrPercent: 15,
    verdictTitle: "The Vilaasa Verdict",
    verdictQuote:
      "With growing preference for eco-luxury living, Oxygen Forest combines experiential ownership with compelling long-term return potential.",
    customSpecs: [
      { label: "Property Type", value: "Farmland Plot" },
      { label: "Locations", value: "Hyderabad" },
      { label: "Min. Investment", value: "Rs 49 Lakhs" },
      { label: "Projected IRR", value: "12% - 18% IRR" },
    ],
    location: { city: "Hyderabad", country: "India", community: "Kamareddy" },
    configurations: [
      { unitType: "Farmland Plot", areaSqFt: 0, price: 4900000 },
      { unitType: "Farmland Plot", areaSqFt: 0, price: 7900000 },
    ],
    amenities: [
      { name: "Lush Forest Landscapes", iconKey: "forest", description: "25,000+ acres of reserve forest as your backdrop." },
      { name: "Exclusive Clubhouse", iconKey: "deck", description: "A community gathering and relaxation space." },
      { name: "Swimming Pool", iconKey: "pool", description: "Recreation and refreshment amidst green serenity." },
      { name: "Organic Farm Nursery", iconKey: "agriculture", description: "Grow and learn with fruit and forest trees planted per plot." },
    ],
    nearbyPlaces: [
      { name: "Kamareddy Town Center", distance: "15 km", category: "Landmark" },
      { name: "Medchal, Hyderabad", distance: "92 km", category: "Connectivity" },
      { name: "Nearest Railway Station", distance: "7 km", category: "Transit" },
    ],
  },

  // ------------------------------------------------------------ FRANCHISE 1
  {
    slug: "krillam-wellness-resorts",
    name: "Krillam Wellness Resorts",
    tagline:
      "Experience authentic Ayurvedic treatments, yoga, and meditation. Transformative journeys rooted in 5,000 years of Indian healing wisdom.",
    description:
      "Our Wellness Resorts in Kerala and Pondicherry offer immersive healing experiences combining ancient Ayurvedic practices with world-class hospitality. Each resort is designed as a sanctuary for transformation.\n\nGuests embark on personalized wellness journeys ranging from 7 to 21 days, including authentic Panchakarma treatments, daily yoga and meditation, organic Sattvic cuisine, and consultations with experienced Ayurvedic physicians.\n\nWith wellness tourism in India growing at 20% annually and international travelers increasingly seeking authentic experiences, our resorts are positioned to capture premium rates and high occupancy.",
    visionHeadline: "Where culinary artistry meets intelligent capital.",
    type: PropertyType.FRANCHISE,
    customType: "Wellness Resort",
    price: 35000000,
    location: { city: "Kerala", country: "India" },
    franchiseModel: "FOCO",
    minTicketSize: 35000000,
    totalProjectCost: 120000000,
    paybackPeriodYears: 3,
    lockInPeriodYears: 5,
    expectedAnnualRoi: 24,
    yieldPayoutFrequency: "QUARTERLY",
    franchisePage: {
      pageTitle: "Wellness Resorts Kerala - Ultra-luxury healing experiences",
      mainHeadline: "Wellness Resorts",
      subheading:
        "Experience authentic Ayurvedic treatments, yoga, and meditation. Transformative journeys rooted in 5,000 years of Indian healing wisdom.",

      metric1Label: "MIN. INVESTMENT",
      metric1Value: "Rs 3.5 Cr",
      metric2Label: "ANNUAL ROI",
      metric2Value: "24% - 30%",
      metric3Label: "PAYBACK PERIOD",
      metric3Value: "3 Years",
      metric4Label: "MODEL",
      metric4Value: "FOCO",

      visionHeadline: "Where culinary artistry meets intelligent capital.",
      visionDescription:
        "Our Wellness Resorts in Kerala and Pondicherry offer immersive healing experiences combining ancient Ayurvedic practices with world-class hospitality. Each resort is designed as a sanctuary for transformation.\n\nGuests embark on personalized wellness journeys ranging from 7 to 21 days, including authentic Panchakarma treatments, daily yoga and meditation, organic Sattvic cuisine, and consultations with experienced Ayurvedic physicians.\n\nWith wellness tourism in India growing at 20% annually and international travelers increasingly seeking authentic experiences, our resorts are positioned to capture premium rates and high occupancy.",

      stat1Label: "LIVE LOCATIONS",
      stat1Value: "4.0",
      stat2Label: "MONTHLY FOOTFALL",
      stat2Value: "12k+",
      stat3Label: "AVG RATING",
      stat3Value: "4.8",

      // Financial Blueprint
      metric5Label: "TOTAL PROJECT COST",
      metric5Value: "Rs 12 Cr",
      metric6Label: "MIN. TICKET SIZE",
      metric6Value: "Rs 3.5 Cr",
      metric7Label: "LOCK-IN PERIOD",
      metric7Value: "60 Months",
      metric8Label: "YIELD PAYOUT",
      metric8Value: "Quarterly",

      ecosystemSubheading: "COMPREHENSIVE ECOSYSTEM",
      ecosystemHeading: "Support & Training",
      ecosystemDescription:
        "We provide end-to-end support to ensure your franchise asset performs at the highest level from day one.",
      support1Title: "Location Scouting",
      support1Description:
        "Premium locations selected for natural beauty, accessibility, and wellness tourism potential.",
      support1Icon: "storefront",
      support2Title: "Biophilic Design",
      support2Description:
        "Architecture that integrates nature, traditional Kerala elements, and sustainable materials.",
      support2Icon: "design_services",
      support3Title: "Ayurveda Training",
      support3Description:
        "Comprehensive training for therapists at our Kerala academy with ongoing certification.",
      support3Icon: "school",
      support4Title: "Global Marketing",
      support4Description:
        "International wellness tourism marketing targeting Europe, Middle East, and Americas.",
      support4Icon: "campaign",

      benefitsSubheading: "The FOCO Advantage",
      benefitsDescription:
        "Franchise Owned, Company Operated. A completely hands-off investment model designed for busy professionals.",
      benefit1Title: "Authentic Ayurveda",
      benefit1Description:
        "Treatments designed by Kerala Ayurveda University-trained physicians with 5,000 years of healing wisdom.",
      benefit1Icon: "volunteer_activism",
      benefit2Title: "Yoga & Meditation",
      benefit2Description: "Daily programs led by certified instructors in serene natural settings.",
      benefit2Icon: "shield",
      benefit3Title: "Transformative Journeys",
      benefit3Description:
        "Curated wellness programs from 7 to 21 days for complete mind-body-spirit renewal.",
      benefit3Icon: "trending_up",

      nextStepsSubheading: "Secure Your Legacy",
      nextStepsDescription:
        "We provide end-to-end support to ensure your franchise asset performs at the highest level from day one.",
      ctaButton1: "BOOK A CALL TODAY",
      ctaButton2: "BOOK A CALL TODAY",

      planningHeadline: "The Layout",
      planningDescription: "MASTER PLANS",
      galleryImages: [
        { title: "Treatment Suite", description: "A cozy coffee bar with a view of the coffee beans." },
        { title: "Yoga Pavilion", description: "A cozy coffee bar with a view of the coffee beans." },
        { title: "Resort View", description: "A cozy coffee bar with a view of the coffee beans." },
      ],
    },
  },

  // ------------------------------------------------------------ FRANCHISE 2
  {
    slug: "carlton-wellness",
    name: "Carlton Wellness",
    tagline:
      "A Franchise Owned - Company Operated (FOCO) wellness model delivering assured returns, global standards, and zero operational stress.",
    description:
      "Carlton Wellness resort was built to transform India's fragmented spa industry into a credible, licensed, and professionally managed wellness ecosystem. By blending Ayurveda, global therapies, and technology-led operations, Carlton creates safe, trusted wellness spaces for modern urban lifestyles.",
    visionHeadline:
      "To make regulated, world-class wellness accessible across India while creating legacy wealth for our partners.",
    type: PropertyType.FRANCHISE,
    customType: "Wellness Resort",
    price: 10000000,
    location: { city: "Ongole", country: "India", community: "Andhra Pradesh" },
    franchiseModel: "FOCO",
    minTicketSize: 10000000,
    totalProjectCost: 15000000,
    paybackPeriodYears: 1,
    lockInPeriodYears: 5,
    expectedAnnualRoi: 2,
    yieldPayoutFrequency: "MONTHLY",
    franchisePage: {
      pageTitle: "Carlton Wellness Franchise | Invest in India's Most Trusted Wellness Brand",
      mainHeadline: "Own a Premium Wellness Franchise",
      subheading:
        "A Franchise Owned - Company Operated (FOCO) wellness model delivering assured returns, global standards, and zero operational stress.",

      metric1Label: "MIN. INVESTMENT",
      metric1Value: "Rs 1 Cr",
      metric2Label: "ANNUAL ROI",
      metric2Value: "2% Minimum Guaranteed Return OR 20% of Gross Revenue",
      metric3Label: "PAYBACK PERIOD",
      metric3Value: "8-12 months break-even",
      metric4Label: "MODEL",
      metric4Value: "FOCO",

      visionHeadline:
        "To make regulated, world-class wellness accessible across India while creating legacy wealth for our partners.",
      visionDescription:
        "Carlton Wellness resort was built to transform India's fragmented spa industry into a credible, licensed, and professionally managed wellness ecosystem. By blending Ayurveda, global therapies, and technology-led operations, Carlton creates safe, trusted wellness spaces for modern urban lifestyles.",

      // Financial Blueprint
      metric5Label: "TOTAL PROJECT COST",
      metric5Value: "Rs 1 Cr - 1.5 Cr",
      metric6Label: "MIN. TICKET SIZE",
      metric6Value: "Rs 1 Cr",
      metric7Label: "LOCK-IN PERIOD",
      metric7Value: "5 Years",
      metric8Label: "YIELD PAYOUT",
      metric8Value: "Monthly",

      ecosystemSubheading: "COMPREHENSIVE ECOSYSTEM",
      ecosystemHeading: "Support & Training",
      ecosystemDescription:
        "End-to-end operational support including staff hiring, SOP training, CRM onboarding, audits, and ongoing performance monitoring - fully handled by Carlton's central team.",
      support1Title: "Location Scouting",
      support1Description:
        "Strategic location identification in hotels, malls, airports, and premium residential hubs, backed by feasibility studies and footfall analysis to maximise revenue potential.",
      support1Icon: "storefront",
      support2Title: "Biophilic Design",
      support2Description:
        "Every Carlton spa is designed using biophilic and wellness-first architecture, integrating natural materials, calming layouts, and energy-balanced interiors for superior guest experience.",
      support2Icon: "design_services",
      support3Title: "Ayurveda Training",
      support3Description:
        "Therapists are trained under authentic Ayurvedic protocols, including Sri Sri Panchakarma frameworks, ensuring globally benchmarked yet traditionally rooted wellness delivery.",
      support3Icon: "school",
      support4Title: "Global Marketing",
      support4Description:
        "Centralised brand marketing, digital campaigns, CRM-driven loyalty programs, and international brand positioning, ensuring high repeat clientele and strong lifetime customer value.",
      support4Icon: "campaign",

      benefitsSubheading: "The FOCO Advantage",
      benefitsDescription:
        "Franchise Owned, Company Operated. A completely hands-off investment model designed for busy professionals.",
      benefit1Title: "Authentic Ayurveda",
      benefit1Description:
        "Treatments designed by Kerala Ayurveda University-trained physicians with 5,000 years of healing wisdom.",
      benefit1Icon: "volunteer_activism",
      benefit2Title: "Yoga & Meditation",
      benefit2Description: "Daily programs led by certified instructors in serene natural settings.",
      benefit2Icon: "shield",
      benefit3Title: "Transformative Journeys",
      benefit3Description:
        "Curated wellness programs from 7 to 21 days for complete mind-body-spirit renewal.",
      benefit3Icon: "trending_up",
    },
  },
];

/** Location has no natural unique key, so match on the trio we set. */
async function resolveLocation(spec: ContentSpec["location"]): Promise<string> {
  const existing = await prisma.location.findFirst({
    where: {
      city: spec.city,
      country: spec.country,
      community: spec.community ?? null,
    },
  });
  if (existing) return existing.id;

  const created = await prisma.location.create({
    data: {
      city: spec.city,
      country: spec.country,
      community: spec.community ?? null,
    },
  });
  return created.id;
}

async function importOne(item: ContentSpec) {
  const locationId = await resolveLocation(item.location);

  const fields = {
    name: item.name,
    tagline: item.tagline ?? null,
    description: item.description,
    visionHeadline: item.visionHeadline ?? null,
    type: item.type,
    customType: item.customType ?? null,
    price: item.price,
    expectedIrrPercent: item.expectedIrrPercent ?? null,
    verdictQuote: item.verdictQuote ?? null,
    verdictAuthor: item.verdictAuthor ?? null,
    verdictTitle: item.verdictTitle ?? null,
    customSpecs: item.customSpecs ?? undefined,
    franchiseModel: item.franchiseModel ?? null,
    minTicketSize: item.minTicketSize ?? null,
    totalProjectCost: item.totalProjectCost ?? null,
    paybackPeriodYears: item.paybackPeriodYears ?? null,
    lockInPeriodYears: item.lockInPeriodYears ?? null,
    expectedAnnualRoi: item.expectedAnnualRoi ?? null,
    yieldPayoutFrequency: item.yieldPayoutFrequency ?? null,
    locationId,
  };

  const property = await prisma.property.upsert({
    where: { slug: item.slug },
    update: fields,
    create: { slug: item.slug, ...fields },
  });

  // Child collections are derived content: replace them so a re-run converges
  // instead of appending duplicates. Scoped strictly to this property.
  await prisma.propertyConfiguration.deleteMany({ where: { propertyId: property.id } });
  if (item.configurations?.length) {
    await prisma.propertyConfiguration.createMany({
      data: item.configurations.map((c) => ({
        propertyId: property.id,
        unitType: c.unitType,
        areaSqFt: c.areaSqFt,
        viewType: c.viewType ?? null,
        price: c.price,
      })),
    });
  }

  await prisma.nearbyPlace.deleteMany({ where: { propertyId: property.id } });
  if (item.nearbyPlaces?.length) {
    await prisma.nearbyPlace.createMany({
      data: item.nearbyPlaces.map((n) => ({
        propertyId: property.id,
        name: n.name,
        distance: n.distance,
        category: n.category ?? null,
      })),
    });
  }

  await prisma.propertyFinancialMetric.deleteMany({ where: { propertyId: property.id } });
  if (item.financialMetrics?.length) {
    await prisma.propertyFinancialMetric.createMany({
      data: item.financialMetrics.map((m) => ({
        propertyId: property.id,
        label: m.label,
        value: m.value,
        note: m.note ?? null,
      })),
    });
  }

  // Amenities are shared across properties, so the Amenity row is upserted by
  // name and only the join row is replaced.
  await prisma.propertyOnAmenity.deleteMany({ where: { propertyId: property.id } });
  for (const a of item.amenities ?? []) {
    const amenity = await prisma.amenity.upsert({
      where: { name: a.name },
      update: { iconKey: a.iconKey },
      create: { name: a.name, iconKey: a.iconKey },
    });
    await prisma.propertyOnAmenity.create({
      data: {
        propertyId: property.id,
        amenityId: amenity.id,
        description: a.description ?? null,
      },
    });
  }

  if (item.franchisePage) {
    const page = item.franchisePage as Record<string, never>;
    await prisma.franchisePage.upsert({
      where: { propertyId: property.id },
      update: page,
      create: { propertyId: property.id, ...page },
    });
  }

  const counts = [
    `${item.configurations?.length ?? 0} configs`,
    `${item.amenities?.length ?? 0} amenities`,
    `${item.nearbyPlaces?.length ?? 0} nearby`,
    `${item.financialMetrics?.length ?? 0} metrics`,
    item.franchisePage ? "franchise page" : null,
  ]
    .filter(Boolean)
    .join(", ");

  console.log(`  ${item.type === PropertyType.FRANCHISE ? "franchise" : "estate"}: ${item.name} (${item.slug}) - ${counts}`);
}

async function main() {
  console.log(`Importing ${CONTENT.length} records (upsert by slug, safe to re-run)...`);
  for (const item of CONTENT) {
    await importOne(item);
  }

  const [estates, franchises] = await Promise.all([
    prisma.property.count({ where: { type: { not: PropertyType.FRANCHISE }, isDeleted: false } }),
    prisma.property.count({ where: { type: PropertyType.FRANCHISE, isDeleted: false } }),
  ]);
  console.log(`Done. Database now holds ${estates} estates and ${franchises} franchises.`);
}

main()
  .catch((error) => {
    console.error("Import failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
