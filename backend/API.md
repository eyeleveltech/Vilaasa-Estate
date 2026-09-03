# Vilaasa Estates API Documentation

**Base URL:** `http://localhost:5000/api/v1` (or production domain)  
**Standard Response Format:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 1. System Health

### GET `/api/v1/health`
- **Auth:** Public
- **Description:** Returns server uptime, health status, and environment.
- **Example Response:**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Vilaasa Estates API is operating smoothly",
    "data": {
      "status": "healthy",
      "uptime": 120.45,
      "timestamp": "2026-08-20T10:30:00.000Z",
      "environment": "development"
    }
  }
  ```

---

## 2. Authentication (`/api/v1/auth`)

### POST `/api/v1/auth/register`
- **Auth:** Protected — **Super Admin only**
- **Description:** Creates a user account with an explicit `role`. Because the
  role is caller-supplied, this endpoint is restricted to authenticated
  `SUPER_ADMIN` callers; a public version would let anyone create an admin.
- **Self-service signup is not this endpoint.** Prospective partners submit
  `POST /api/v1/channel-partners/register`, which files a `PENDING`
  application and creates no login until an admin approves it.
- **Request Body:**
  ```json
  {
    "email": "partner@capital.com",
    "password": "SecurePassword123!",
    "name": "Alexander Wright",
    "phone": "+971501234567",
    "phoneCode": "+971",
    "role": "CHANNEL_PARTNER",
    "licenseNumber": "DLD-BRN-88392"
  }
  ```
- **Response:** `201 Created` with JWT token and user profile (excluding `passwordHash`).

### POST `/api/v1/auth/login`
- **Auth:** Public
- **Description:** Authenticates user and returns JWT bearer token.
- **Request Body:**
  ```json
  {
    "email": "superadmin@vilaasa.com",
    "password": "SuperAdmin@Vilaasa2026"
  }
  ```
- **Response:** `200 OK` with user details and Bearer token.

### GET `/api/v1/auth/me`
- **Auth:** Protected (`Bearer <token>`)
- **Description:** Returns profile of the authenticated user.
- **Response:** `200 OK` with user details and assigned properties.

### POST `/api/v1/auth/otp/send`
- **Auth:** Public
- **Description:** Dispatches a 6-digit verification security code via Twilio SMS or Email.
- **Request Body (SMS Mode):**
  ```json
  {
    "channel": "SMS",
    "phone": "9876543210",
    "phoneCode": "+91"
  }
  ```
- **Request Body (Email Mode):**
  ```json
  {
    "channel": "EMAIL",
    "email": "investor@capital.com"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "One-time password sent successfully via SMS to +919876543210",
    "data": {
      "channel": "SMS",
      "destination": "+919876543210",
      "expiresAt": "2026-08-28T07:11:41.919Z"
    }
  }
  ```

### POST `/api/v1/auth/otp/verify`
- **Auth:** Public
- **Description:** Verifies 6-digit OTP code and returns authenticated session token.
- **Request Body:**
  ```json
  {
    "channel": "SMS",
    "phone": "9876543210",
    "phoneCode": "+91",
    "otp": "511414"
  }
  ```
- **Response:** `200 OK` with JWT token and verified user profile.

---


## 3. Properties (`/api/v1/properties`)

### GET `/api/v1/properties/stats`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Description:** Returns high-level metrics, count by status, count by type, count by country, and recent inquiries.
- **Response:**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "totalProperties": 14,
      "byStatus": { "AVAILABLE": 8, "UNDER_CONSTRUCTION": 4, "READY_TO_MOVE": 2 },
      "byType": { "RESIDENTIAL_VILLA": 6, "PENTHOUSE": 8 },
      "byCountry": { "UAE": 8, "India": 6 },
      "totalInquiries": 42,
      "recentInquiries": [ ... ]
    }
  }
  ```

### GET `/api/v1/properties`
- **Auth:** Public
- **Query Params:**
  - `status` (`AVAILABLE | UNDER_CONSTRUCTION | OFF_PLAN | READY_TO_MOVE | SOLD | RESERVED`)
  - `type` (`RESIDENTIAL_VILLA | RESIDENTIAL_APARTMENT | PENTHOUSE | HERITAGE_ESTATE | COMMERCIAL | FRANCHISE | FARMLAND`)
  - `franchiseModel` (`FOCO | FOFO | FICO`)
  - `country` (e.g. `UAE`, `India`)
  - `city` (e.g. `Dubai`, `Mumbai`)
  - `minPrice` (number)
  - `maxPrice` (number)
  - `bedrooms` (number)
  - `furnishingStatus` (`UNFURNISHED | SEMI_FURNISHED | FULLY_FURNISHED | DESIGNER_FURNISHED`)
  - `search` (text search in name, description, tagline, city, country)
  - `page` (default: 1)
  - `limit` (default: 12, max: 50)
  - `sortBy` (`price_asc | price_desc | newest | oldest | area_asc | area_desc`)
- **Example:** `GET /api/v1/properties?type=FRANCHISE&franchiseModel=FOCO&limit=12`
- **Response:** Array of properties with location, featured media, amenities, relationship manager info, and pagination metadata.

### GET `/api/v1/properties/:slug`
- **Auth:** Public
- **Description:** Returns complete deep property details, and increments the view counter.
- **Includes:** Location, all media (ordered), amenities, configurations, nearby connectivity, financial metrics, franchise FOCO fields (when type=FRANCHISE), construction tracking (milestones + gallery), inquiry counts, and assigned manager.
- **Example:** `GET /api/v1/properties/wellness-resorts-kerala`

### POST `/api/v1/properties`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Request Body (Real Estate or Franchise Asset):**
  ```json
  {
    "name": "Wellness Resorts Kerala",
    "tagline": "Ayurvedic Luxury Sanctuary",
    "description": "Exquisite wellness hospitality franchise with full FOCO operational support.",
    "type": "FRANCHISE",
    "status": "AVAILABLE",
    "price": 7000000,
    "currency": "INR",
    "franchiseModel": "FOCO",
    "minTicketSize": 7000000,
    "totalProjectCost": 250000000,
    "paybackPeriodYears": 3.5,
    "lockInPeriodYears": 3.0,
    "expectedAnnualRoi": 24.0,
    "yieldPayoutFrequency": "QUARTERLY",
    "supportModules": ["Location Scouting", "Biophilic Styling", "Operator Certification", "Marketing Enablement"],
    "advantages": ["Proven Brand", "Low Capex", "High Footfall", "Dedicated Support Team"],
    "location": {
      "city": "Kochi",
      "country": "India",
      "community": "Fort Kochi Waterfront"
    }
  }
  ```
    "totalAreaSqFt": 18000,
    "bedrooms": 7,
    "bathrooms": 9,
    "furnishingStatus": "DESIGNER_FURNISHED",
    "reraNumber": "DLD-TRAKHEESI-99281",
    "ownershipType": "Freehold",
    "location": {
      "city": "Dubai",
      "country": "UAE",
      "community": "Emirates Hills",
      "latitude": 25.0782,
      "longitude": 55.1764,
      "googleMapUrl": "https://maps.google.com/?q=25.0782,55.1764"
    }
  }
  ```
- **Response:** `201 Created` with generated collision-safe slug.

### PUT `/api/v1/properties/:id`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Description:** Partial update of property fields and location.
- **Response:** `200 OK` with updated property.

### DELETE `/api/v1/properties/:id`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Description:** Soft deletes property (sets `isDeleted = true`, `status = SOLD`).
- **Response:** `200 OK`.

---

## 4. Unit Configurations (`/api/v1/properties/:propertyId/configurations`)

### POST `/api/v1/properties/:propertyId/configurations`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Body:**
  ```json
  {
    "unitType": "4 BHK Presidential Penthouse",
    "areaSqFt": 6200,
    "viewType": "Arabian Sea & Skyline View",
    "price": 45000000,
    "isAvailable": true,
    "floorPlanUrl": "https://res.cloudinary.com/vilaasa/floorplan-4bhk.pdf"
  }
  ```

### PUT `/api/v1/properties/:propertyId/configurations/:configId`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Description:** Updates configuration specifications or pricing.

### DELETE `/api/v1/properties/:propertyId/configurations/:configId`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Description:** Removes configuration unit.

---

## 5. Property Amenities (`/api/v1/properties/:propertyId/amenities`)

### POST `/api/v1/properties/:propertyId/amenities`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Description:** Assign an amenity to a property with an optional custom description.
- **Body:** `{ "amenityId": "amenity_cuid", "description": "Olympic-grade championship surface" }`

### DELETE `/api/v1/properties/:propertyId/amenities/:amenityId`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Description:** Unlink an amenity from a property.

---

## 6. Nearby Places & Connectivity (`/api/v1/properties/:propertyId/nearby`)

### GET `/api/v1/properties/:propertyId/nearby`
- **Auth:** Public
- **Description:** Returns all nearby connectivity points grouped by category (Airport, Metro, Schools, Leisure).

### POST `/api/v1/properties/:propertyId/nearby`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Body:** `{ "name": "Dubai International Airport", "distance": "20 Mins Drive", "category": "Airport" }`

### PUT `/api/v1/properties/:propertyId/nearby/:placeId`
- **Auth:** Protected (`SUPER_ADMIN`)

### DELETE `/api/v1/properties/:propertyId/nearby/:placeId`
- **Auth:** Protected (`SUPER_ADMIN`)

---

## 7. Financial Metrics (`/api/v1/properties/:propertyId/financials`)

### POST `/api/v1/properties/:propertyId/financials`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Body:** `{ "label": "Projected Net Yield", "value": "7.2% p.a.", "note": "Tax-free in AED", "icon": "savings" }`

### PUT `/api/v1/properties/:propertyId/financials/:metricId`
- **Auth:** Protected (`SUPER_ADMIN`)

### DELETE `/api/v1/properties/:propertyId/financials/:metricId`
- **Auth:** Protected (`SUPER_ADMIN`)

---

## 8. Amenities Catalog (`/api/v1/amenities`)

### GET `/api/v1/amenities`
- **Auth:** Public
- **Description:** Returns full amenity master catalog grouped by category (`wellness`, `aviation`, `waterfront`, `security`, `technology`, `lifestyle`).

### POST `/api/v1/amenities`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Body:** `{ "name": "Private Padel Court", "iconKey": "sports_tennis", "category": "Sports" }`

---

## 9. Construction Tracking (`/api/v1/construction`)

### GET `/api/v1/construction/:propertyId`
- **Auth:** Public
- **Description:** Returns live progress percentages (`structureProgress`, `interiorProgress`, `overallProgress`), milestones timeline, and construction gallery.

### PUT `/api/v1/construction/:propertyId`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Body:**
  ```json
  {
    "structureProgress": 90,
    "interiorProgress": 45,
    "overallProgress": 72,
    "lastUpdate": "2026-08-20T10:00:00.000Z"
  }
  ```

### POST `/api/v1/construction/:propertyId/milestones`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Body:** `{ "name": "Façade Cladding Complete", "status": "IN_PROGRESS", "targetDate": "2026-09-30T00:00:00.000Z" }`

### PUT `/api/v1/construction/:propertyId/milestones/:milestoneId`
- **Auth:** Protected (`SUPER_ADMIN`)

### DELETE `/api/v1/construction/:propertyId/milestones/:milestoneId`
- **Auth:** Protected (`SUPER_ADMIN`)

### POST `/api/v1/construction/:propertyId/gallery`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Body:** `{ "imageUrl": "https://images.unsplash.com/photo-site.jpg", "caption": "Level 42 Slab Pouring" }`

### DELETE `/api/v1/construction/:propertyId/gallery/:itemId`
- **Auth:** Protected (`SUPER_ADMIN`)

---

## 10. Media & Assets (`/api/v1/media`)

### GET `/api/v1/media/:propertyId`
- **Auth:** Public
- **Description:** Returns all media for a property grouped into `{ heroImage, gallery, brochure, video, tour360, floorPlans, all }`.

### POST `/api/v1/media/upload/:propertyId`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `file`: (binary, up to 100MB)
  - `mediaType`: (`HERO_IMAGE | GALLERY | BROCHURE_PDF | VIDEO_MP4 | TOUR_360 | FLOOR_PLAN`)
  - `altText`: (string)
  - `orderIndex`: (number)
  - `isFeatured`: (boolean) — *if true, automatically unsets any prior featured media*
- **Response:** `201 Created` with Cloudinary CDN URL and auto-generated thumbnail transformation.

### PATCH `/api/v1/media/reorder/:propertyId`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Body:**
  ```json
  {
    "items": [
      { "id": "media_id_1", "orderIndex": 0 },
      { "id": "media_id_2", "orderIndex": 1 },
      { "id": "media_id_3", "orderIndex": 2 }
    ]
  }
  ```

### DELETE `/api/v1/media/:mediaId`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Description:** Deletes media from Cloudinary storage and database record. If deleted media was featured, promotes next item to featured.

---

## 11. Leads & Inquiries (`/api/v1/inquiries`)

### POST `/api/v1/inquiries`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "name": "Sheikh Mohammed Al-Thani",
    "email": "m.althani@capital.qa",
    "phone": "+97455123456",
    "investmentType": "real-estate",
    "investmentRange": "$10M - $25M",
    "currency": "USD",
    "propertyId": "property_cuid",
    "source": "PROPERTY_DETAIL",
    "utmSource": "instagram_luxury",
    "utmCampaign": "summer_dubai_waterfront"
  }
  ```
- **Response:** `201 Created`.

### GET `/api/v1/inquiries`
- **Auth:** Protected (`SUPER_ADMIN`, `CHANNEL_PARTNER`)
- **Query Params:** `status`, `propertyId`, `source`, `search`, `page`, `limit`
- **Response:** Paginated inquiries with linked property information and assigned agents.

### PATCH `/api/v1/inquiries/:id/status`
- **Auth:** Protected (`SUPER_ADMIN`)
- **Body:**
  ```json
  {
    "status": "QUALIFIED",
    "assignedAgentId": "user_cuid",
    "notes": "Client requested private helicopter transfer to Palm site visit."
  }
  ```
