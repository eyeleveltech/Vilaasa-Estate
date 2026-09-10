/**
 * Centralized Google Material Symbols Outlined icons for Property Amenities & Features
 * Used across Vilaasa Estate (Admin Property Form, Property Details, Franchise, etc.)
 */

export interface AmenityIconOption {
  icon: string;
  label: string;
  category: string;
}

export interface AmenityCategoryGroup {
  name: string;
  icons: AmenityIconOption[];
}

/**
 * 1. Categorized Amenity Icon Definitions
 */
export const AMENITY_CATEGORY_GROUPS: AmenityCategoryGroup[] = [
  {
    name: "Leisure & Wellness",
    icons: [
      { icon: "pool", label: "Swimming Pool", category: "Leisure & Wellness" },
      { icon: "water", label: "Water Feature / Aquatic", category: "Leisure & Wellness" },
      { icon: "waves", label: "Waves / Ocean Pool", category: "Leisure & Wellness" },
      { icon: "fitness_center", label: "Gym & Fitness Center", category: "Leisure & Wellness" },
      { icon: "sports_gymnastics", label: "Gymnastics & Calisthenics", category: "Leisure & Wellness" },
      { icon: "monitor_heart", label: "Health & Vitals Studio", category: "Leisure & Wellness" },
      { icon: "spa", label: "Spa & Thermal Wellness", category: "Leisure & Wellness" },
      { icon: "self_improvement", label: "Yoga & Meditation Pavilion", category: "Leisure & Wellness" },
      { icon: "healing", label: "Ayurveda & Healing Center", category: "Leisure & Wellness" },
      { icon: "beach_access", label: "Private Beach Access", category: "Leisure & Wellness" },
      { icon: "sailing", label: "Sailing & Yacht Marina", category: "Leisure & Wellness" },
      { icon: "directions_boat", label: "Boat Club & Pier", category: "Leisure & Wellness" },
      { icon: "umbrella", label: "Cabanas & Sun Loungers", category: "Leisure & Wellness" },
      { icon: "golf_course", label: "Championship Golf Course", category: "Leisure & Wellness" },
      { icon: "sports_golf", label: "Golf Simulator / Putting Green", category: "Leisure & Wellness" },
      { icon: "flag", label: "Golf Flag / Course Hole", category: "Leisure & Wellness" },
      { icon: "sports_tennis", label: "Tennis & Padel Court", category: "Leisure & Wellness" },
      { icon: "table_tennis", label: "Table Tennis & Games", category: "Leisure & Wellness" },
      { icon: "sports_basketball", label: "Basketball Court", category: "Leisure & Wellness" },
      { icon: "sports_cricket", label: "Cricket Pitch & Nets", category: "Leisure & Wellness" },
      { icon: "sports", label: "Multi-Sport Arena", category: "Leisure & Wellness" },
    ],
  },
  {
    name: "Luxury & Service",
    icons: [
      { icon: "security", label: "24/7 Security & Surveillance", category: "Luxury & Service" },
      { icon: "shield", label: "Guarded Gated Enclave", category: "Luxury & Service" },
      { icon: "lock", label: "Biometric & High Security", category: "Luxury & Service" },
      { icon: "room_service", label: "Concierge & Butler Service", category: "Luxury & Service" },
      { icon: "support_agent", label: "Dedicated Relationship Manager", category: "Luxury & Service" },
      { icon: "headset_mic", label: "24/7 Front Desk / Dispatch", category: "Luxury & Service" },
      { icon: "helicopter", label: "Private Helipad Access", category: "Luxury & Service" },
      { icon: "celebration", label: "Party Lawn & Banquet Hall", category: "Luxury & Service" },
      { icon: "nightlife", label: "Private Club & Lounge", category: "Luxury & Service" },
      { icon: "local_bar", label: "Wine Cellar & Cocktail Bar", category: "Luxury & Service" },
      { icon: "cottage", label: "Exclusive Clubhouse", category: "Luxury & Service" },
      { icon: "theaters", label: "Private Dolby Cinema", category: "Luxury & Service" },
      { icon: "movie", label: "Screening Room", category: "Luxury & Service" },
      { icon: "live_tv", label: "Media & Entertainment Room", category: "Luxury & Service" },
    ],
  },
  {
    name: "Facilities & Living",
    icons: [
      { icon: "local_parking", label: "Valet & Dedicated Parking", category: "Facilities & Living" },
      { icon: "directions_car", label: "Chauffeur & Car Drop", category: "Facilities & Living" },
      { icon: "electric_car", label: "EV Fleet & Charging", category: "Facilities & Living" },
      { icon: "settings_remote", label: "Crestron Smart Home Control", category: "Facilities & Living" },
      { icon: "home_max", label: "Smart Hub & Automation", category: "Facilities & Living" },
      { icon: "sensors", label: "IoT Environmental Sensors", category: "Facilities & Living" },
      { icon: "yard", label: "Private Courtyard & Lawn", category: "Facilities & Living" },
      { icon: "park", label: "Botanical Garden & Walkways", category: "Facilities & Living" },
      { icon: "farm", label: "Organic Farm & Orchard", category: "Facilities & Living" },
      { icon: "local_florist", label: "Floral Gardens & Landscaping", category: "Facilities & Living" },
      { icon: "home", label: "Private Residence", category: "Facilities & Living" },
      { icon: "house", label: "Independent Estate Villa", category: "Facilities & Living" },
      { icon: "villa", label: "Signature Luxury Villa", category: "Facilities & Living" },
      { icon: "apartment", label: "Penthouse / Sky Residence", category: "Facilities & Living" },
      { icon: "sofa", label: "Sky Lounge & Terrace Seating", category: "Facilities & Living" },
      { icon: "chair", label: "Outdoor Sun Deck & Patio", category: "Facilities & Living" },
      { icon: "table_restaurant", label: "Alfresco Dining Terrace", category: "Facilities & Living" },
      { icon: "weekend", label: "Executive Resident Lounge", category: "Facilities & Living" },
      { icon: "bed", label: "Guest Suites", category: "Facilities & Living" },
      { icon: "king_bed", label: "Presidential Master Suite", category: "Facilities & Living" },
      { icon: "hotel", label: "Hospitality & Stay Suites", category: "Facilities & Living" },
      { icon: "restaurant", label: "Fine Dining & Gourmet Kitchen", category: "Facilities & Living" },
      { icon: "flatware", label: "Chef's Table & Catering", category: "Facilities & Living" },
      { icon: "coffee", label: "Artisanal Cafe & Bakery", category: "Facilities & Living" },
      { icon: "child_care", label: "Daycare & Creche Service", category: "Facilities & Living" },
      { icon: "toys", label: "Kids Adventure Play Park", category: "Facilities & Living" },
      { icon: "family_restroom", label: "Family & Child Amenities", category: "Facilities & Living" },
      { icon: "pets", label: "Pet Friendly & Dog Park", category: "Facilities & Living" },
      { icon: "cruelty_free", label: "Pet Grooming & Spa", category: "Facilities & Living" },
    ],
  },
  {
    name: "Infrastructure & Tech",
    icons: [
      { icon: "wifi", label: "Ultra High-Speed Fiber Wi-Fi", category: "Infrastructure & Tech" },
      { icon: "router", label: "Dedicated Mesh Connectivity", category: "Infrastructure & Tech" },
      { icon: "network_wifi", label: "High-Bandwidth Network", category: "Infrastructure & Tech" },
      { icon: "business_center", label: "Business Hub & Executive Boardroom", category: "Infrastructure & Tech" },
      { icon: "corporate_fare", label: "Corporate Innovation Park", category: "Infrastructure & Tech" },
      { icon: "work", label: "Private Workspaces", category: "Infrastructure & Tech" },
      { icon: "meeting_room", label: "Conference & Meeting Rooms", category: "Infrastructure & Tech" },
      { icon: "bolt", label: "Uninterrupted Power Backup", category: "Infrastructure & Tech" },
      { icon: "electric_bolt", label: "Dedicated Power Substation", category: "Infrastructure & Tech" },
      { icon: "offline_bolt", label: "Heavy Duty Backup Generators", category: "Infrastructure & Tech" },
      { icon: "ev_station", label: "EV Supercharging Hub", category: "Infrastructure & Tech" },
      { icon: "battery_charging_full", label: "Energy Storage & Battery Hub", category: "Infrastructure & Tech" },
      { icon: "air", label: "Central HVAC & Climate Control", category: "Infrastructure & Tech" },
      { icon: "airwave", label: "HEPA Air Purification System", category: "Infrastructure & Tech" },
      { icon: "mode_fan", label: "Fresh Air Ventilation", category: "Infrastructure & Tech" },
      { icon: "wb_sunny", label: "Natural Daylighting & Sun Architecture", category: "Infrastructure & Tech" },
      { icon: "solar_power", label: "Solar Energy Microgrid", category: "Infrastructure & Tech" },
      { icon: "eco", label: "LEED Gold / Eco-Friendly Design", category: "Infrastructure & Tech" },
    ],
  },
  {
    name: "Surrounding Connectivity",
    icons: [
      { icon: "train", label: "High-Speed Metro Station", category: "Surrounding Connectivity" },
      { icon: "directions_transit", label: "Rapid Transit Hub", category: "Surrounding Connectivity" },
      { icon: "commute", label: "Expressway & Highway Arterial", category: "Surrounding Connectivity" },
      { icon: "flight", label: "International Airport Access", category: "Surrounding Connectivity" },
      { icon: "travel", label: "Helitaxi & VIP Transit", category: "Surrounding Connectivity" },
      { icon: "school", label: "International Schools & University", category: "Surrounding Connectivity" },
      { icon: "local_library", label: "Community Library & Study", category: "Surrounding Connectivity" },
      { icon: "menu_book", label: "Reading & Research Lounge", category: "Surrounding Connectivity" },
      { icon: "local_hospital", label: "Multi-Speciality Hospital", category: "Surrounding Connectivity" },
      { icon: "medical_services", label: "On-Call Emergency Healthcare", category: "Surrounding Connectivity" },
      { icon: "health_and_safety", label: "First Aid & Wellness Clinic", category: "Surrounding Connectivity" },
      { icon: "shopping_bag", label: "Luxury Retail & Boutiques", category: "Surrounding Connectivity" },
      { icon: "storefront", label: "Commercial Arcade & Deli", category: "Surrounding Connectivity" },
      { icon: "local_mall", label: "Mega Shopping Mall", category: "Surrounding Connectivity" },
      { icon: "map", label: "Prime Geographic Location", category: "Surrounding Connectivity" },
    ],
  },
  {
    name: "Luxury Badges & Highlights",
    icons: [
      { icon: "star", label: "Signature Bespoke Asset", category: "Luxury Badges & Highlights" },
      { icon: "diamond", label: "Ultra-Luxury / Tier-1 Finish", category: "Luxury Badges & Highlights" },
      { icon: "auto_awesome", label: "Architectural Marvel", category: "Luxury Badges & Highlights" },
      { icon: "workspace_premium", label: "Award-Winning Development", category: "Luxury Badges & Highlights" },
      { icon: "verified", label: "100% Legal & RERA Verified", category: "Luxury Badges & Highlights" },
      { icon: "hotel_class", label: "5-Star Hospitality Standard", category: "Luxury Badges & Highlights" },
      { icon: "emoji_events", label: "World-Class Trophy Asset", category: "Luxury Badges & Highlights" },
      { icon: "check_circle", label: "Feature Checklist Complete", category: "Luxury Badges & Highlights" },
      { icon: "account_balance", label: "Dollar-Pegged Financial Stability", category: "Luxury Badges & Highlights" },
      { icon: "percent", label: "Tax-Efficient Zero Tax Benefit", category: "Luxury Badges & Highlights" },
      { icon: "flight_takeoff", label: "Golden Visa Residency Access", category: "Luxury Badges & Highlights" },
    ],
  },
];

/**
 * 2. Flat List of All Options for Selectors & Dropdowns
 */
export const COMMON_AMENITY_ICONS: AmenityIconOption[] = AMENITY_CATEGORY_GROUPS.flatMap(
  (group) => group.icons
);

/**
 * 3. Ready-to-use Array of All Icon Names
 */
export const AMENITY_ICONS: string[] = Array.from(
  new Set(COMMON_AMENITY_ICONS.map((item) => item.icon))
);

/**
 * 4. Comprehensive Keyword-to-Icon Auto-Detector
 * Automatically selects the appropriate Google Material Symbol based on amenity name or description.
 */
export const detectAmenityIcon = (name: string): string => {
  const lower = (name || "").toLowerCase().trim();
  if (!lower) return "star";

  // Swimming Pool & Water
  if (lower.includes("waves") || lower.includes("wave pool") || lower.includes("lagoon") || lower.includes("surf")) return "waves";
  if (lower.includes("jacuzzi") || lower.includes("hot tub") || lower.includes("whirlpool") || lower.includes("hydrotherapy")) return "diamond";
  if (lower.includes("pool") || lower.includes("swim") || lower.includes("plunge") || lower.includes("infinity pool")) return "pool";
  if (lower.includes("water") || lower.includes("lake") || lower.includes("river") || lower.includes("fountain") || lower.includes("aquatic") || lower.includes("pond") || lower.includes("canal") || lower.includes("waterfront")) return "water";

  // Gym & Fitness
  if (lower.includes("gymnastic") || lower.includes("calisthenic") || lower.includes("crossfit")) return "sports_gymnastics";
  if (lower.includes("vitals") || lower.includes("heart") || lower.includes("cardio")) return "monitor_heart";
  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("workout") || lower.includes("training") || lower.includes("weights")) return "fitness_center";

  // Spa & Wellness
  if (lower.includes("ayurved") || lower.includes("healing") || lower.includes("therapy") || lower.includes("panchakarma")) return "healing";
  if (lower.includes("yoga") || lower.includes("meditat") || lower.includes("zen") || lower.includes("mindful")) return "self_improvement";
  if (lower.includes("spa") || lower.includes("wellness") || lower.includes("massage") || lower.includes("sauna") || lower.includes("steam")) return "spa";

  // Security & Safety
  if (lower.includes("shield") || lower.includes("gated") || lower.includes("perimeter")) return "shield";
  if (lower.includes("biometric") || lower.includes("lock") || lower.includes("access control") || lower.includes("safe")) return "lock";
  if (lower.includes("security") || lower.includes("cctv") || lower.includes("guard") || lower.includes("surveillance")) return "security";

  // Concierge & Service
  if (lower.includes("support") || lower.includes("agent") || lower.includes("manager") || lower.includes("helpdesk")) return "support_agent";
  if (lower.includes("dispatch") || lower.includes("headset") || lower.includes("telecom")) return "headset_mic";
  if (lower.includes("concierge") || lower.includes("butler") || lower.includes("room service") || lower.includes("valet service")) return "room_service";

  // Helipad & Aviation
  if (lower.includes("helipad") || lower.includes("heli") || lower.includes("chopper") || lower.includes("aviation")) return "helicopter";
  if (lower.includes("flight") || lower.includes("airport") || lower.includes("aerodrome")) return "flight";
  if (lower.includes("travel") || lower.includes("transit") || lower.includes("shuttle")) return "travel";

  // Marine & Waterfront
  if (lower.includes("beach") || lower.includes("coast") || lower.includes("shore") || lower.includes("ocean") || lower.includes("sea")) return "beach_access";
  if (lower.includes("yacht") || lower.includes("sailing") || lower.includes("marina") || lower.includes("boat") || lower.includes("pier") || lower.includes("kayak")) return "sailing";
  if (lower.includes("umbrella") || lower.includes("cabana") || lower.includes("sun lounger") || lower.includes("poolside lounger") || lower.includes("sun deck")) return "umbrella";

  // Sports & Games
  if (lower.includes("table tennis") || lower.includes("ping pong") || lower.includes("tt table") || lower.includes("table-tennis")) return "table_tennis";
  if (lower.includes("tennis") || lower.includes("padel") || lower.includes("paddle") || lower.includes("pickleball") || lower.includes("squash") || lower.includes("badminton")) return "sports_tennis";
  if (lower.includes("basketball") || lower.includes("hoop")) return "sports_basketball";
  if (lower.includes("cricket") || lower.includes("pitch")) return "sports_cricket";
  if (lower.includes("golf course") || lower.includes("18-hole") || lower.includes("championship golf")) return "golf_course";
  if (lower.includes("golf") || lower.includes("putting")) return "sports_golf";
  if (lower.includes("sports") || lower.includes("athletic") || lower.includes("recreation") || lower.includes("arena")) return "sports";

  // Entertainment & Nightlife
  if (lower.includes("cinema") || lower.includes("theater") || lower.includes("theatre") || lower.includes("dolby") || lower.includes("imax")) return "theaters";
  if (lower.includes("movie") || lower.includes("screening")) return "movie";
  if (lower.includes("tv") || lower.includes("media room") || lower.includes("gaming")) return "live_tv";
  if (lower.includes("party") || lower.includes("celebration") || lower.includes("banquet") || lower.includes("ballroom") || lower.includes("event lawn") || lower.includes("festival")) return "celebration";
  if (lower.includes("nightlife") || lower.includes("club") || lower.includes("disco")) return "nightlife";
  if (lower.includes("bar") || lower.includes("wine") || lower.includes("cellar") || lower.includes("cocktail") || lower.includes("pub")) return "local_bar";
  if (lower.includes("clubhouse") || lower.includes("lifestyle lounge")) return "cottage";

  // Seating & Furniture
  if (lower.includes("outdoor seating") || lower.includes("seating") || lower.includes("sofa") || lower.includes("patio seating") || lower.includes("lounge seating") || lower.includes("terrace lounge")) return "sofa";
  if (lower.includes("chair") || lower.includes("deck chair")) return "chair";
  if (lower.includes("alfresco") || lower.includes("dining terrace") || lower.includes("patio table")) return "table_restaurant";
  if (lower.includes("lounge") || lower.includes("weekend")) return "weekend";

  // Bedrooms & Hospitality
  if (lower.includes("king bed") || lower.includes("master suite")) return "king_bed";
  if (lower.includes("bed") || lower.includes("bedroom") || lower.includes("suite")) return "bed";
  if (lower.includes("hotel") || lower.includes("guest suite") || lower.includes("hospitality")) return "hotel";

  // Dining & Food
  if (lower.includes("chef") || lower.includes("catering") || lower.includes("flatware") || lower.includes("cutlery")) return "flatware";
  if (lower.includes("coffee") || lower.includes("cafe") || lower.includes("bakery") || lower.includes("espresso")) return "coffee";
  if (lower.includes("dining") || lower.includes("restaurant") || lower.includes("culinary") || lower.includes("bistro") || lower.includes("kitchen") || lower.includes("gourmet")) return "restaurant";

  // Kids & Pets
  if (lower.includes("creche") || lower.includes("daycare") || lower.includes("child care") || lower.includes("infant")) return "child_care";
  if (lower.includes("play area") || lower.includes("kids play") || lower.includes("playground") || lower.includes("children") || lower.includes("toys")) return "toys";
  if (lower.includes("family")) return "family_restroom";
  if (lower.includes("pet groom") || lower.includes("pet spa")) return "cruelty_free";
  if (lower.includes("pet") || lower.includes("dog")) return "pets";

  // Parks, Gardens & Living
  if (lower.includes("courtyard") || lower.includes("yard")) return "yard";
  if (lower.includes("florist") || lower.includes("flower") || lower.includes("botanical")) return "local_florist";
  if (lower.includes("farm") || lower.includes("organic farm") || lower.includes("orchard")) return "farm";
  if (lower.includes("park") || lower.includes("forest") || lower.includes("green space") || lower.includes("woodland") || lower.includes("garden") || lower.includes("lawn") || lower.includes("landscape")) return "park";
  if (lower.includes("villa") || lower.includes("mansion") || lower.includes("estate")) return "villa";
  if (lower.includes("apartment") || lower.includes("penthouse") || lower.includes("condo") || lower.includes("flat")) return "apartment";
  if (lower.includes("house")) return "house";
  if (lower.includes("residence") || lower.includes("home")) return "home";

  // Smart Home & IoT
  if (lower.includes("sensor") || lower.includes("iot") || lower.includes("detector")) return "sensors";
  if (lower.includes("smart hub") || lower.includes("home max") || lower.includes("automation hub")) return "home_max";
  if (lower.includes("smart home") || lower.includes("remote") || lower.includes("crestron") || lower.includes("automation")) return "settings_remote";

  // Infrastructure, Power & Energy
  if (lower.includes("solar") || lower.includes("photovoltaic")) return "solar_power";
  if (lower.includes("sun") || lower.includes("daylight")) return "wb_sunny";
  if (lower.includes("ev station") || lower.includes("supercharger") || lower.includes("charging station")) return "ev_station";
  if (lower.includes("ev charge") || lower.includes("electric car") || lower.includes("electric vehicle")) return "electric_car";
  if (lower.includes("battery") || lower.includes("energy storage")) return "battery_charging_full";
  if (lower.includes("generator") || lower.includes("backup generator") || lower.includes("diesel")) return "offline_bolt";
  if (lower.includes("substation") || lower.includes("high voltage")) return "electric_bolt";
  if (lower.includes("power") || lower.includes("electricity") || lower.includes("backup")) return "bolt";
  if (lower.includes("eco") || lower.includes("sustainab") || lower.includes("leed") || lower.includes("green")) return "eco";

  // Wi-Fi & Business
  if (lower.includes("router") || lower.includes("mesh")) return "router";
  if (lower.includes("network") || lower.includes("lan") || lower.includes("fiber network")) return "network_wifi";
  if (lower.includes("wifi") || lower.includes("wi-fi") || lower.includes("internet") || lower.includes("broadband")) return "wifi";
  if (lower.includes("cowork") || lower.includes("business center") || lower.includes("boardroom") || lower.includes("business hub")) return "business_center";
  if (lower.includes("eco business park") || lower.includes("business park") || lower.includes("corporate") || lower.includes("office hub")) return "corporate_fare";
  if (lower.includes("meeting") || lower.includes("conference")) return "meeting_room";
  if (lower.includes("work") || lower.includes("office")) return "work";

  // Air & Climate
  if (lower.includes("air purif") || lower.includes("hepa") || lower.includes("airwave")) return "airwave";
  if (lower.includes("fan") || lower.includes("ventilation")) return "mode_fan";
  if (lower.includes("ac") || lower.includes("air conditioning") || lower.includes("hvac") || lower.includes("climate control") || lower.includes("air")) return "air";

  // Parking & Vehicles
  if (lower.includes("chauffeur") || lower.includes("car") || lower.includes("limousine")) return "directions_car";
  if (lower.includes("parking") || lower.includes("garage") || lower.includes("valet")) return "local_parking";

  // Transit & Neighborhood
  if (lower.includes("metro") || lower.includes("train") || lower.includes("subway") || lower.includes("rail")) return "train";
  if (lower.includes("transit") || lower.includes("monorail")) return "directions_transit";
  if (lower.includes("highway") || lower.includes("expressway") || lower.includes("commute")) return "commute";
  if (lower.includes("school") || lower.includes("university") || lower.includes("college") || lower.includes("academy")) return "school";
  if (lower.includes("library") || lower.includes("study room")) return "local_library";
  if (lower.includes("reading") || lower.includes("book")) return "menu_book";
  if (lower.includes("hospital") || lower.includes("clinic") || lower.includes("apollo") || lower.includes("medical center")) return "local_hospital";
  if (lower.includes("medical") || lower.includes("ambulance") || lower.includes("doctor")) return "medical_services";
  if (lower.includes("first aid") || lower.includes("health and safety")) return "health_and_safety";
  if (lower.includes("mall") || lower.includes("shopping centre")) return "local_mall";
  if (lower.includes("storefront") || lower.includes("arcade") || lower.includes("boutique")) return "storefront";
  if (lower.includes("shopping") || lower.includes("market") || lower.includes("retail")) return "shopping_bag";
  if (lower.includes("location") || lower.includes("map") || lower.includes("connectivity")) return "map";

  // Badges & Prestige
  if (lower.includes("trophy") || lower.includes("award") || lower.includes("events")) return "emoji_events";
  if (lower.includes("5-star") || lower.includes("hotel class") || lower.includes("hospitality standard")) return "hotel_class";
  if (lower.includes("rera") || lower.includes("verified") || lower.includes("certified") || lower.includes("approved")) return "verified";
  if (lower.includes("premium") || lower.includes("luxury") || lower.includes("prestige")) return "workspace_premium";
  if (lower.includes("architectural") || lower.includes("marvel") || lower.includes("signature")) return "auto_awesome";

  return "star";
};
