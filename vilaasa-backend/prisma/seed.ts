import dotenv from "dotenv";
dotenv.config();

import {
  PrismaClient,
  Role,
  PropertyType,
  PropertyStatus,
  FurnishingStatus,
  Currency,
  LeadSource,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seeding for Vilaasa Estates...");

  // 1. Clean existing data
  await prisma.vaultAsset.deleteMany();
  await prisma.channelPartner.deleteMany();
  await prisma.siteVisit.deleteMany();
  await prisma.inquiryTimeline.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.constructionGalleryItem.deleteMany();
  await prisma.constructionMilestone.deleteMany();
  await prisma.constructionAsset.deleteMany();
  await prisma.propertyFinancialMetric.deleteMany();
  await prisma.nearbyPlace.deleteMany();
  await prisma.propertyOnAmenity.deleteMany();
  await prisma.propertyMedia.deleteMany();
  await prisma.propertyConfiguration.deleteMany();
  await prisma.property.deleteMany();
  await prisma.location.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.otpRecord.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const superAdminHash = await bcrypt.hash("SuperAdmin@Vilaasa2026", 12);
  const partnerHash = await bcrypt.hash("Partner@Vilaasa2026", 12);

  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@vilaasa.com",
      passwordHash: superAdminHash,
      name: "Vilaasa Super Admin",
      phone: "+971501112233",
      phoneCode: "+971",
      role: Role.SUPER_ADMIN,
      licenseNumber: "DLD-MGR-001",
    },
  });

  const channelPartnerUser = await prisma.user.create({
    data: {
      email: "partner@luxuryestates.com",
      passwordHash: partnerHash,
      name: "Apex Global Capital Partners",
      phone: "+919876543210",
      phoneCode: "+91",
      role: Role.CHANNEL_PARTNER,
      licenseNumber: "MahaRERA-A51800029381",
    },
  });

  console.log(` Created Super Admin (${superAdmin.email}) & Channel Partner (${channelPartnerUser.email})`);

  // Create Channel Partner Directory Records
  await prisma.channelPartner.createMany({
    data: [
      {
        name: "Apex Global Capital Partners",
        email: "partner@luxuryestates.com",
        phone: "+919876543210",
        company: "Apex Global Realty",
        experience: "10+ years",
        city: "Mumbai",
        status: "APPROVED",
        userId: channelPartnerUser.id,
        approvedById: superAdmin.id,
      },
      {
        name: "Elysian International Realty",
        email: "contact@elysianrealty.ae",
        phone: "+971509988776",
        company: "Elysian Real Estate LLC",
        experience: "8 years",
        city: "Dubai",
        status: "PENDING",
      },
      {
        name: "Sovereign Prime Advisory",
        email: "vikram.mehta@sovereigncapital.in",
        phone: "+919811223344",
        company: "Sovereign Asset Partners",
        experience: "5-7 years",
        city: "New Delhi",
        status: "PENDING",
      },
      {
        name: "Gulf Coast Luxury Estates",
        email: "tariq@gulfcoastprime.com",
        phone: "+971554433221",
        company: "Gulf Coast Brokerage",
        experience: "6 years",
        city: "Abu Dhabi",
        status: "APPROVED",
        approvedById: superAdmin.id,
      },
      {
        name: "Nordic Heritage Investments",
        email: "invest@nordicestates.se",
        phone: "+4681234567",
        company: "Nordic Private Clients",
        experience: "1-2 years",
        city: "Stockholm",
        status: "REJECTED",
      },
    ],
  });
  console.log(" Seeded 5 Channel Partner Directory Applications (2 Approved, 2 Pending, 1 Rejected).");

  // 3. Create Master Amenities
  const amenitiesList = [
    { name: "Private Infinity Pool", iconKey: "pool", category: "Wellness" },
    { name: "24/7 Dedicated Butler Service", iconKey: "room_service", category: "Lifestyle" },
    { name: "Private Helipad Access", iconKey: "helicopter", category: "Aviation" },
    { name: "Direct Yacht Mooring", iconKey: "sailing", category: "Waterfront" },
    { name: "Cryo & Thermal Wellness Spa", iconKey: "spa", category: "Wellness" },
    { name: "Biometric & 24/7 Armed Security", iconKey: "security", category: "Security" },
    { name: "Crestron Smart Home Automation", iconKey: "settings_remote", category: "Technology" },
    { name: "Temperature Controlled Wine Cellar", iconKey: "wine_bar", category: "Lifestyle" },
    { name: "Private Championship Tennis Court", iconKey: "sports_tennis", category: "Sports" },
    { name: "Private Dolby Atmos Cinema", iconKey: "movie", category: "Lifestyle" },
    { name: "EV Fast-Charging Supercharger Enclave", iconKey: "electric_car", category: "Technology" },
    { name: "Championship 18-Hole Golf Access", iconKey: "golf_course", category: "Sports" },
  ];

  const createdAmenities: Record<string, string> = {};
  for (const item of amenitiesList) {
    const amenity = await prisma.amenity.create({ data: item });
    createdAmenities[item.name] = amenity.id;
  }
  console.log(` Created ${amenitiesList.length} luxury amenities.`);

  // 4. Create Locations
  const locPalm = await prisma.location.create({
    data: {
      city: "Dubai",
      country: "UAE",
      community: "Palm Jumeirah",
      addressLine: "Frond G, Billionaires Row",
      postalCode: "00000",
      latitude: 25.1124,
      longitude: 55.139,
      googleMapUrl: "https://maps.google.com/?q=25.1124,55.1390",
    },
  });

  const locDowntown = await prisma.location.create({
    data: {
      city: "Dubai",
      country: "UAE",
      community: "Downtown Dubai",
      addressLine: "Sheikh Mohammed bin Rashid Blvd",
      postalCode: "00000",
      latitude: 25.1972,
      longitude: 55.2744,
      googleMapUrl: "https://maps.google.com/?q=25.1972,55.2744",
    },
  });

  const locEmiratesHills = await prisma.location.create({
    data: {
      city: "Dubai",
      country: "UAE",
      community: "Emirates Hills",
      addressLine: "Sector E, Montgomerie Enclave",
      postalCode: "00000",
      latitude: 25.0782,
      longitude: 55.1764,
      googleMapUrl: "https://maps.google.com/?q=25.0782,55.1764",
    },
  });

  const locMumbai = await prisma.location.create({
    data: {
      city: "Mumbai",
      country: "India",
      community: "Worli Sea Face",
      addressLine: "Khan Abdul Ghaffar Khan Road",
      postalCode: "400018",
      latitude: 19.0068,
      longitude: 72.8166,
      googleMapUrl: "https://maps.google.com/?q=19.0068,72.8166",
    },
  });

  const locGoa = await prisma.location.create({
    data: {
      city: "Goa",
      country: "India",
      community: "Assagao Hillside",
      addressLine: "Badem High Road",
      postalCode: "403507",
      latitude: 15.5908,
      longitude: 73.7744,
      googleMapUrl: "https://maps.google.com/?q=15.5908,73.7744",
    },
  });

  const locHyderabad = await prisma.location.create({
    data: {
      city: "Hyderabad",
      country: "India",
      community: "Jubilee Hills",
      addressLine: "Road No. 36, Private Ridge",
      postalCode: "500033",
      latitude: 17.4319,
      longitude: 78.4073,
      googleMapUrl: "https://maps.google.com/?q=17.4319,78.4073",
    },
  });

  // 5. Seed Properties

  // Property 1: Palm Royale Signature Villa (Dubai)
  await prisma.property.create({
    data: {
      slug: "palm-royale",
      name: "Palm Royale Signature Villa",
      tagline: "Ultra-Prime Waterfront Living on Palm Jumeirah",
      description:
        "Palm Royale represents the zenith of architectural majesty on Palm Jumeirah's coveted Billionaires Row. Crafted by world-renowned architects, this bespoke sanctuary features private Arabian Gulf access, double-height Italian marble galleries, and unmatched skyline vistas.",
      visionHeadline: "Where Mediterranean artistry meets Dubai's limitless ambition.",
      type: PropertyType.RESIDENTIAL_VILLA,
      status: PropertyStatus.READY_TO_MOVE,
      price: 185000000.0,
      currency: Currency.AED,
      rentalYieldPercent: 6.8,
      expectedIrrPercent: 21.5,
      appreciationPercent: 28.0,
      totalAreaSqFt: 14500,
      bedrooms: 6,
      bathrooms: 8,
      furnishingStatus: FurnishingStatus.DESIGNER_FURNISHED,
      possessionDate: new Date("2026-03-31"),
      reraNumber: "DLD-TRAKHEESI-662819",
      ownershipType: "Freehold",
      virtualTour360Url: "https://my.matterport.com/show/?m=sample360tour",
      locationId: locPalm.id,
      adminId: superAdmin.id,
      configurations: {
        create: [
          {
            unitType: "Grand Presidential Villa",
            areaSqFt: 14500,
            viewType: "Private Beach & Dubai Marina Skyline",
            price: 185000000.0,
            isAvailable: true,
          },
        ],
      },
      media: {
        create: [
          {
            mediaType: "HERO_IMAGE",
            url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80",
            altText: "Palm Royale Sunset View",
            orderIndex: 0,
            isFeatured: true,
          },
          {
            mediaType: "GALLERY",
            url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
            altText: "Grand Living Foyer",
            orderIndex: 1,
          },
        ],
      },
      amenities: {
        create: [
          { amenityId: createdAmenities["Private Infinity Pool"] },
          { amenityId: createdAmenities["24/7 Dedicated Butler Service"] },
          { amenityId: createdAmenities["Direct Yacht Mooring"] },
          { amenityId: createdAmenities["Crestron Smart Home Automation"] },
        ],
      },
      nearbyPlaces: {
        create: [
          { name: "Atlantis The Royal", distance: "4 Mins Drive", category: "Dining" },
          { name: "Dubai International Airport", distance: "25 Mins Drive", category: "Airport" },
        ],
      },
      financialMetrics: {
        create: [
          { label: "Net Rental Yield", value: "6.8% p.a.", note: "Tax-Free Yield in AED", icon: "savings" },
          { label: "5-Year Capital Growth", value: "28.0%", note: "Prime waterfront scarcity", icon: "trending_up" },
        ],
      },
    },
  });

  // Property 2: The Aurum Sky Residence (Mumbai)
  await prisma.property.create({
    data: {
      slug: "the-aurum",
      name: "The Aurum Sky Residence",
      tagline: "Iconic Arabian Sea Facing Duplex Penthouse",
      description:
        "Perched atop Worli's landmark tower, The Aurum Sky Residence delivers 12,000 sq.ft. of uninterrupted panoramic Arabian Sea and Bandra-Worli Sea Link views. Designed for ultra-high-net-worth families desiring peerless discretion and timeless prestige.",
      visionHeadline: "A private kingdom in the clouds above Mumbai's most prestigious coastline.",
      type: PropertyType.PENTHOUSE,
      status: PropertyStatus.UNDER_CONSTRUCTION,
      price: 1200000000.0,
      currency: Currency.INR,
      rentalYieldPercent: 3.5,
      expectedIrrPercent: 18.0,
      appreciationPercent: 35.0,
      totalAreaSqFt: 12000,
      bedrooms: 5,
      bathrooms: 7,
      furnishingStatus: FurnishingStatus.FULLY_FURNISHED,
      possessionDate: new Date("2026-12-31"),
      reraNumber: "MahaRERA-P51900004521",
      ownershipType: "Freehold",
      virtualTour360Url: "https://my.matterport.com/show/?m=sample360mumbai",
      locationId: locMumbai.id,
      adminId: superAdmin.id,
      configurations: {
        create: [
          {
            unitType: "Triplex Sky Villa",
            areaSqFt: 12000,
            viewType: "360 Sea Link & Ocean View",
            price: 1200000000.0,
            isAvailable: true,
          },
        ],
      },
      media: {
        create: [
          {
            mediaType: "HERO_IMAGE",
            url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80",
            altText: "Sea Link Sky Penthouse View",
            orderIndex: 0,
            isFeatured: true,
          },
        ],
      },
      amenities: {
        create: [
          { amenityId: createdAmenities["Private Helipad Access"] },
          { amenityId: createdAmenities["Cryo & Thermal Wellness Spa"] },
          { amenityId: createdAmenities["Biometric & 24/7 Armed Security"] },
        ],
      },
      constructionAsset: {
        create: {
          structureProgress: 85,
          interiorProgress: 40,
          overallProgress: 68,
          lastUpdate: new Date(),
          milestones: {
            create: [
              { name: "Superstructure Complete", status: "COMPLETED", targetDate: new Date("2025-11-15") },
              { name: "Façade & Curtain Wall Installation", status: "IN_PROGRESS", targetDate: new Date("2026-06-30") },
            ],
          },
        },
      },
    },
  });

  // Property 3: Downtown Sky Penthouse (Dubai)
  await prisma.property.create({
    data: {
      slug: "downtown-sky-penthouse",
      name: "Burj Crown Sky Penthouse",
      tagline: "Panoramic Views of Burj Khalifa & Dubai Fountains",
      description:
        "An awe-inspiring duplex penthouse hovering high above Downtown Dubai. Featuring 24-foot floor-to-ceiling glass windows framing direct Burj Khalifa fireworks, private rooftop infinity pool, and bespoke Armani Casa interior furnishings.",
      visionHeadline: "The pinnacle of urban cosmopolitan grandeur in Dubai's premier district.",
      type: PropertyType.PENTHOUSE,
      status: PropertyStatus.AVAILABLE,
      price: 65000000.0,
      currency: Currency.AED,
      rentalYieldPercent: 7.4,
      expectedIrrPercent: 22.0,
      totalAreaSqFt: 8500,
      bedrooms: 4,
      bathrooms: 6,
      furnishingStatus: FurnishingStatus.DESIGNER_FURNISHED,
      reraNumber: "DLD-TRAKHEESI-889102",
      ownershipType: "Freehold",
      locationId: locDowntown.id,
      adminId: superAdmin.id,
      media: {
        create: [
          {
            mediaType: "HERO_IMAGE",
            url: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1920&q=80",
            altText: "Burj Khalifa Skyline Penthouse",
            orderIndex: 0,
            isFeatured: true,
          },
        ],
      },
      amenities: {
        create: [
          { amenityId: createdAmenities["Private Infinity Pool"] },
          { amenityId: createdAmenities["24/7 Dedicated Butler Service"] },
          { amenityId: createdAmenities["Temperature Controlled Wine Cellar"] },
        ],
      },
    },
  });

  // Property 4: The Viceroy Heritage Estate (Goa)
  await prisma.property.create({
    data: {
      slug: "the-viceroy-goa",
      name: "The Viceroy Heritage Estate",
      tagline: "Restored Portuguese Heritage Sanctuary in Assagao",
      description:
        "Surrounded by lush emerald forest canopies in fashionable Assagao, The Viceroy is a magnificent 300-year-old Portuguese colonial estate painstakingly restored with modern sustainable luxury, private lap pool, and teakwood verandahs.",
      visionHeadline: "Timeless heritage sanctuary immersed in tropical nature.",
      type: PropertyType.HERITAGE_ESTATE,
      status: PropertyStatus.AVAILABLE,
      price: 420000000.0,
      currency: Currency.INR,
      rentalYieldPercent: 8.5,
      expectedIrrPercent: 25.0,
      totalAreaSqFt: 9800,
      bedrooms: 5,
      bathrooms: 6,
      furnishingStatus: FurnishingStatus.FULLY_FURNISHED,
      reraNumber: "GoaRERA-PRJ0821001",
      ownershipType: "Freehold",
      locationId: locGoa.id,
      adminId: superAdmin.id,
      media: {
        create: [
          {
            mediaType: "HERO_IMAGE",
            url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=80",
            altText: "Viceroy Estate Goa",
            orderIndex: 0,
            isFeatured: true,
          },
        ],
      },
      amenities: {
        create: [
          { amenityId: createdAmenities["Private Infinity Pool"] },
          { amenityId: createdAmenities["Cryo & Thermal Wellness Spa"] },
          { amenityId: createdAmenities["EV Fast-Charging Supercharger Enclave"] },
        ],
      },
    },
  });

  // Property 5: Jubilee Hills Private Manor (Hyderabad)
  await prisma.property.create({
    data: {
      slug: "jubilee-hills-manor",
      name: "Jubilee Hills Private Manor",
      tagline: "Ultra-Exclusive Hilltop Mansion in Hyderabad",
      description:
        "A private royal sanctuary on Hyderabad's most prestigious ridge in Jubilee Hills. Features private screening cinema, 10-car basement gallery, and landscaped Japanese zen gardens.",
      visionHeadline: "Discretion, prestige, and majestic architecture in Hyderabad's premier enclave.",
      type: PropertyType.RESIDENTIAL_VILLA,
      status: PropertyStatus.AVAILABLE,
      price: 850000000.0,
      currency: Currency.INR,
      rentalYieldPercent: 4.8,
      expectedIrrPercent: 19.5,
      totalAreaSqFt: 16000,
      bedrooms: 6,
      bathrooms: 8,
      furnishingStatus: FurnishingStatus.DESIGNER_FURNISHED,
      reraNumber: "TSRERA-P02400007812",
      ownershipType: "Freehold",
      locationId: locHyderabad.id,
      adminId: superAdmin.id,
      media: {
        create: [
          {
            mediaType: "HERO_IMAGE",
            url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80",
            altText: "Jubilee Hills Private Manor",
            orderIndex: 0,
            isFeatured: true,
          },
        ],
      },
      amenities: {
        create: [
          { amenityId: createdAmenities["Private Dolby Atmos Cinema"] },
          { amenityId: createdAmenities["Biometric & 24/7 Armed Security"] },
          { amenityId: createdAmenities["Crestron Smart Home Automation"] },
        ],
      },
    },
  });

  // Property 6: Emirates Hills Golf Palace (Dubai)
  await prisma.property.create({
    data: {
      slug: "emirates-hills-palace",
      name: "Montgomerie Golf Palace",
      tagline: "Championship Fairway Views in Emirates Hills",
      description:
        "The Beverly Hills of Dubai. This sprawling 20,000 sq.ft. estate commands prime direct views across the Montgomerie Golf Course and Dubai Marina skyline with temperature-controlled private car showroom.",
      visionHeadline: "Palatial grandeur overlooking Dubai's finest championship greens.",
      type: PropertyType.RESIDENTIAL_VILLA,
      status: PropertyStatus.AVAILABLE,
      price: 145000000.0,
      currency: Currency.AED,
      rentalYieldPercent: 6.2,
      expectedIrrPercent: 20.0,
      totalAreaSqFt: 20000,
      bedrooms: 7,
      bathrooms: 9,
      furnishingStatus: FurnishingStatus.DESIGNER_FURNISHED,
      reraNumber: "DLD-TRAKHEESI-771920",
      ownershipType: "Freehold",
      locationId: locEmiratesHills.id,
      adminId: superAdmin.id,
      media: {
        create: [
          {
            mediaType: "HERO_IMAGE",
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
            altText: "Emirates Hills Golf Palace",
            orderIndex: 0,
            isFeatured: true,
          },
        ],
      },
      amenities: {
        create: [
          { amenityId: createdAmenities["Championship 18-Hole Golf Access"] },
          { amenityId: createdAmenities["Private Championship Tennis Court"] },
          { amenityId: createdAmenities["Private Infinity Pool"] },
        ],
      },
    },
  });

  // 6. Seed Site Visits
  const allProps = await prisma.property.findMany({ select: { id: true, name: true } });
  if (allProps.length > 0) {
    await prisma.siteVisit.createMany({
      data: [
        {
          propertyId: allProps[0].id,
          name: "Lord Alistair Sterling",
          email: "sterling@mayfair-investments.co.uk",
          phone: "+447911123456",
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          scheduledTime: "11:00 AM",
          visitType: "real-estate-international",
          status: "CONFIRMED",
          notes: "Requires private chauffeur transfer from Burj Al Arab.",
        },
        {
          propertyId: allProps[1] ? allProps[1].id : allProps[0].id,
          name: "Dr. Ananya Singhania",
          email: "ananya@singhania-familyoffice.com",
          phone: "+919820011223",
          scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          scheduledTime: "03:00 PM",
          visitType: "real-estate-india",
          status: "CONFIRMED",
          notes: "Family office principal reviewing trophy estate.",
        },
        {
          propertyId: allProps[2] ? allProps[2].id : allProps[0].id,
          name: "Sheikh Mansoor Al Qasimi",
          email: "mansoor@qasimi-holdings.ae",
          phone: "+971501239876",
          scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          scheduledTime: "05:00 PM",
          visitType: "real-estate-international",
          status: "COMPLETED",
          notes: "Completed private yacht viewing.",
        },
      ],
    });
    console.log(" Seeded 3 Private Site Inspection Bookings.");

    // 7. Seed Inquiries with Timelines
    const inq1 = await prisma.inquiry.create({
      data: {
        name: "Vikramaditya Birla",
        email: "v.birla@birlacapital.com",
        phone: "+919988776655",
        investmentType: "real-estate",
        investmentRange: "$10M - $25M",
        currency: Currency.AED,
        status: "QUALIFIED",
        source: LeadSource.PROPERTY_DETAIL,
        notes: "Interested in Palm Jumeirah and Emirates Hills.",
        propertyId: allProps[0].id,
        timeline: {
          create: [
            {
              fromStatus: null,
              toStatus: "NEW",
              note: "Inquiry submitted via property dossier.",
              changedById: superAdmin.id,
            },
            {
              fromStatus: "NEW",
              toStatus: "CONTACTED",
              note: "Senior Managing Director held introductory advisory call.",
              changedById: superAdmin.id,
            },
            {
              fromStatus: "CONTACTED",
              toStatus: "QUALIFIED",
              note: "Verified HNW liquidity proof. Scheduled private viewing itinerary.",
              changedById: superAdmin.id,
            },
          ],
        },
      },
    });

    const inq2 = await prisma.inquiry.create({
      data: {
        name: "Helena Rothschild-Vance",
        email: "h.vance@genevacapital.ch",
        phone: "+41228190000",
        investmentType: "real-estate",
        investmentRange: "$25M+",
        currency: Currency.AED,
        status: "NEW",
        source: LeadSource.CHANNEL_PARTNER_FORM,
        notes: "Swiss family trust seeking trophy oceanfront compound.",
        propertyId: allProps[1] ? allProps[1].id : allProps[0].id,
        timeline: {
          create: [
            {
              fromStatus: null,
              toStatus: "NEW",
              note: "Private referral via Apex Global Capital Partners.",
              changedById: superAdmin.id,
            },
          ],
        },
      },
    });

    console.log(" Seeded Client Inquiries with complete audit timelines.");
  }

  console.log(" Seeded 6 Ultra-Luxury Estates across Dubai and India.");
  console.log(" Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
