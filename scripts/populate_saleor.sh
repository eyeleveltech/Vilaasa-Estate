#!/bin/bash

# Saleor Property Data Population Script
# This script creates categories, product types, attributes, and properties in Saleor

BASE_URL="http://localhost:8000/graphql/"

# First, get a fresh token
echo "=== Getting authentication token ==="
TOKEN_RESPONSE=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { tokenCreate(email: \"admin@global.com\", password: \"admin123\") { token errors { message } } }"}')

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token": "[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Failed to get token. Response: $TOKEN_RESPONSE"
    exit 1
fi

echo "Token obtained successfully"

# Helper function to make GraphQL requests
graphql_request() {
    local query="$1"
    curl -s -X POST $BASE_URL \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$query"
}

# =============================================
# STEP 1: Create Category - Real Estate
# =============================================
echo ""
echo "=== Creating Real Estate Category ==="
CATEGORY_RESPONSE=$(graphql_request '{
    "query": "mutation CreateCategory { categoryCreate(input: { name: \"Real Estate\", slug: \"real-estate\", description: \"Luxury real estate properties worldwide\" }) { category { id name slug } errors { field message } } }"
}')
echo "Category Response: $CATEGORY_RESPONSE"

CATEGORY_ID=$(echo $CATEGORY_RESPONSE | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)
echo "Category ID: $CATEGORY_ID"

# =============================================
# STEP 2: Create Subcategories
# =============================================
echo ""
echo "=== Creating Subcategories ==="

# Residential
graphql_request '{
    "query": "mutation { categoryCreate(input: { name: \"Residential\", slug: \"residential\", description: \"Residential properties including condos, villas, and penthouses\", parent: \"'$CATEGORY_ID'\" }) { category { id name } errors { message } } }"
}'

# Commercial
graphql_request '{
    "query": "mutation { categoryCreate(input: { name: \"Commercial\", slug: \"commercial\", description: \"Commercial real estate properties\", parent: \"'$CATEGORY_ID'\" }) { category { id name } errors { message } } }"
}'

# =============================================
# STEP 3: Create Product Type with Attributes
# =============================================
echo ""
echo "=== Creating Property Product Type ==="
PRODUCT_TYPE_RESPONSE=$(graphql_request '{
    "query": "mutation CreateProductType { productTypeCreate(input: { name: \"Luxury Property\", slug: \"luxury-property\", isShippingRequired: false, isDigital: false, hasVariants: true, productAttributes: [], variantAttributes: [] }) { productType { id name } errors { field message } } }"
}')
echo "Product Type Response: $PRODUCT_TYPE_RESPONSE"

PRODUCT_TYPE_ID=$(echo $PRODUCT_TYPE_RESPONSE | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)
echo "Product Type ID: $PRODUCT_TYPE_ID"

# =============================================
# STEP 4: Create Attributes
# =============================================
echo ""
echo "=== Creating Attributes ==="

# Location Attribute
echo "Creating Location attribute..."
LOCATION_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"Location\", slug: \"location\", type: PRODUCT_TYPE, inputType: PLAIN_TEXT, valueRequired: true }) { attribute { id name } errors { message } } }"
}')
echo $LOCATION_ATTR
LOCATION_ATTR_ID=$(echo $LOCATION_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# Country Attribute
echo "Creating Country attribute..."
COUNTRY_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"Country\", slug: \"country\", type: PRODUCT_TYPE, inputType: PLAIN_TEXT, valueRequired: true }) { attribute { id name } errors { message } } }"
}')
COUNTRY_ATTR_ID=$(echo $COUNTRY_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# Property Type Attribute
echo "Creating Property Type attribute..."
PROP_TYPE_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"Property Type\", slug: \"property-type\", type: PRODUCT_TYPE, inputType: DROPDOWN, valueRequired: true }) { attribute { id name } errors { message } } }"
}')
PROP_TYPE_ATTR_ID=$(echo $PROP_TYPE_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# Status Attribute
echo "Creating Status attribute..."
STATUS_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"Status\", slug: \"status\", type: PRODUCT_TYPE, inputType: DROPDOWN, valueRequired: true }) { attribute { id name } errors { message } } }"
}')
STATUS_ATTR_ID=$(echo $STATUS_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# Total Area Attribute
echo "Creating Total Area attribute..."
AREA_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"Total Area\", slug: \"total-area\", type: PRODUCT_TYPE, inputType: PLAIN_TEXT }) { attribute { id name } errors { message } } }"
}')
AREA_ATTR_ID=$(echo $AREA_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# Configuration Attribute (BHK)
echo "Creating Configuration attribute..."
CONFIG_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"Configuration\", slug: \"configuration\", type: PRODUCT_TYPE, inputType: PLAIN_TEXT }) { attribute { id name } errors { message } } }"
}')
CONFIG_ATTR_ID=$(echo $CONFIG_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# Possession Attribute
echo "Creating Possession attribute..."
POSSESSION_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"Possession\", slug: \"possession\", type: PRODUCT_TYPE, inputType: PLAIN_TEXT }) { attribute { id name } errors { message } } }"
}')
POSSESSION_ATTR_ID=$(echo $POSSESSION_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# Furnishing Attribute
echo "Creating Furnishing attribute..."
FURNISHING_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"Furnishing\", slug: \"furnishing\", type: PRODUCT_TYPE, inputType: DROPDOWN }) { attribute { id name } errors { message } } }"
}')
FURNISHING_ATTR_ID=$(echo $FURNISHING_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# Rental Yield Attribute
echo "Creating Rental Yield attribute..."
YIELD_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"Rental Yield\", slug: \"rental-yield\", type: PRODUCT_TYPE, inputType: PLAIN_TEXT }) { attribute { id name } errors { message } } }"
}')
YIELD_ATTR_ID=$(echo $YIELD_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# Appreciation Attribute
echo "Creating Appreciation attribute..."
APPRECIATION_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"5-Year Appreciation\", slug: \"appreciation\", type: PRODUCT_TYPE, inputType: PLAIN_TEXT }) { attribute { id name } errors { message } } }"
}')
APPRECIATION_ATTR_ID=$(echo $APPRECIATION_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# Amenities Attribute (Rich Text)
echo "Creating Amenities attribute..."
AMENITIES_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"Amenities\", slug: \"amenities\", type: PRODUCT_TYPE, inputType: RICH_TEXT }) { attribute { id name } errors { message } } }"
}')
AMENITIES_ATTR_ID=$(echo $AMENITIES_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# Nearby Locations Attribute
echo "Creating Nearby Locations attribute..."
NEARBY_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"Nearby Locations\", slug: \"nearby-locations\", type: PRODUCT_TYPE, inputType: RICH_TEXT }) { attribute { id name } errors { message } } }"
}')
NEARBY_ATTR_ID=$(echo $NEARBY_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# Verdict Quote
echo "Creating Verdict attribute..."
VERDICT_ATTR=$(graphql_request '{
    "query": "mutation { attributeCreate(input: { name: \"Investment Verdict\", slug: \"investment-verdict\", type: PRODUCT_TYPE, inputType: RICH_TEXT }) { attribute { id name } errors { message } } }"
}')
VERDICT_ATTR_ID=$(echo $VERDICT_ATTR | grep -o '"id": "[^"]*' | head -1 | cut -d'"' -f4)

# =============================================
# STEP 5: Assign Attributes to Product Type
# =============================================
echo ""
echo "=== Assigning Attributes to Product Type ==="
ASSIGN_RESPONSE=$(graphql_request '{
    "query": "mutation { productAttributeAssign(productTypeId: \"'$PRODUCT_TYPE_ID'\", operations: [{id: \"'$LOCATION_ATTR_ID'\", type: PRODUCT}, {id: \"'$COUNTRY_ATTR_ID'\", type: PRODUCT}, {id: \"'$PROP_TYPE_ATTR_ID'\", type: PRODUCT}, {id: \"'$STATUS_ATTR_ID'\", type: PRODUCT}, {id: \"'$AREA_ATTR_ID'\", type: PRODUCT}, {id: \"'$CONFIG_ATTR_ID'\", type: PRODUCT}, {id: \"'$POSSESSION_ATTR_ID'\", type: PRODUCT}, {id: \"'$FURNISHING_ATTR_ID'\", type: PRODUCT}, {id: \"'$YIELD_ATTR_ID'\", type: PRODUCT}, {id: \"'$APPRECIATION_ATTR_ID'\", type: PRODUCT}, {id: \"'$AMENITIES_ATTR_ID'\", type: PRODUCT}, {id: \"'$NEARBY_ATTR_ID'\", type: PRODUCT}, {id: \"'$VERDICT_ATTR_ID'\", type: PRODUCT}]) { productType { id productAttributes { id name } } errors { message field } } }"
}')
echo "Assign Response: $ASSIGN_RESPONSE"

# Get the residential category ID
echo ""
echo "=== Getting Residential Category ID ==="
CATEGORIES_RESPONSE=$(graphql_request '{
    "query": "query { categories(first: 10) { edges { node { id name slug } } } }"
}')
echo "Categories: $CATEGORIES_RESPONSE"

RESIDENTIAL_CAT_ID=$(echo $CATEGORIES_RESPONSE | grep -o '"id": "Q2F0ZWdvcnk6[^"]*' | head -2 | tail -1 | cut -d'"' -f4)
echo "Residential Category ID: $RESIDENTIAL_CAT_ID"

# =============================================
# STEP 6: Create Products (Properties)
# =============================================
echo ""
echo "=== Creating Properties ==="

# Property 1: The Aurum Residence
echo "Creating The Aurum Residence..."
graphql_request '{
    "query": "mutation { productCreate(input: { name: \"The Aurum Residence\", slug: \"the-aurum\", description: \"The Aurum Residence is not merely a home; it is an architectural statement. Drawing inspiration from the Georgian grandeur of the surrounding estate, this development integrates classic proportions with state-of-the-art sustainable technology. Each residence offers panoramic views of the Royal Parks, featuring double-height ceilings, bespoke Italian joinery, and private elevator access.\", productType: \"'$PRODUCT_TYPE_ID'\", category: \"'$RESIDENTIAL_CAT_ID'\", attributes: [{id: \"'$LOCATION_ATTR_ID'\", plainText: \"London, UK\"}, {id: \"'$COUNTRY_ATTR_ID'\", plainText: \"UK\"}, {id: \"'$AREA_ATTR_ID'\", plainText: \"2,800 - 6,500 Sq. Ft.\"}, {id: \"'$CONFIG_ATTR_ID'\", plainText: \"3, 4 & 5 BHK\"}, {id: \"'$POSSESSION_ATTR_ID'\", plainText: \"Immediate\"}, {id: \"'$YIELD_ATTR_ID'\", plainText: \"4.2% p.a.\"}, {id: \"'$APPRECIATION_ATTR_ID'\", plainText: \"18-22%\"}] }) { product { id name } errors { field message } } }"
}'

# Property 2: Palm Royale Villa
echo "Creating Palm Royale Villa..."
graphql_request '{
    "query": "mutation { productCreate(input: { name: \"Palm Royale Villa\", slug: \"palm-royale\", description: \"Palm Royale Villa represents the pinnacle of waterfront living on the iconic Palm Jumeirah. This exclusive collection of signature villas combines Arabian heritage with contemporary luxury. Each villa features a private beach, infinity pool overlooking the Arabian Gulf, and direct yacht mooring.\", productType: \"'$PRODUCT_TYPE_ID'\", category: \"'$RESIDENTIAL_CAT_ID'\", attributes: [{id: \"'$LOCATION_ATTR_ID'\", plainText: \"Dubai, UAE\"}, {id: \"'$COUNTRY_ATTR_ID'\", plainText: \"UAE\"}, {id: \"'$AREA_ATTR_ID'\", plainText: \"8,500 - 15,000 Sq. Ft.\"}, {id: \"'$CONFIG_ATTR_ID'\", plainText: \"5 & 6 BHK\"}, {id: \"'$POSSESSION_ATTR_ID'\", plainText: \"Q4 2025\"}, {id: \"'$YIELD_ATTR_ID'\", plainText: \"5.8% p.a.\"}, {id: \"'$APPRECIATION_ATTR_ID'\", plainText: \"25-30%\"}] }) { product { id name } errors { field message } } }"
}'

# Property 3: Manhattan Heights
echo "Creating Manhattan Heights..."
graphql_request '{
    "query": "mutation { productCreate(input: { name: \"Manhattan Heights\", slug: \"manhattan-heights\", description: \"Manhattan Heights offers an unparalleled living experience in the heart of Tribeca. Floor-to-ceiling windows frame iconic views of the Hudson River and downtown Manhattan skyline. Designed by award-winning architects, each residence features imported Italian marble, smart home automation, and private terraces.\", productType: \"'$PRODUCT_TYPE_ID'\", category: \"'$RESIDENTIAL_CAT_ID'\", attributes: [{id: \"'$LOCATION_ATTR_ID'\", plainText: \"New York, USA\"}, {id: \"'$COUNTRY_ATTR_ID'\", plainText: \"USA\"}, {id: \"'$AREA_ATTR_ID'\", plainText: \"3,200 - 5,800 Sq. Ft.\"}, {id: \"'$CONFIG_ATTR_ID'\", plainText: \"3 & 4 BHK\"}, {id: \"'$POSSESSION_ATTR_ID'\", plainText: \"Immediate\"}, {id: \"'$YIELD_ATTR_ID'\", plainText: \"3.8% p.a.\"}, {id: \"'$APPRECIATION_ATTR_ID'\", plainText: \"15-20%\"}] }) { product { id name } errors { field message } } }"
}'

# Property 4: Beverly Hills Estate
echo "Creating Beverly Hills Estate..."
graphql_request '{
    "query": "mutation { productCreate(input: { name: \"Beverly Hills Estate\", slug: \"beverly-estate\", description: \"This architectural masterpiece sits on 2 acres in the prestigious Trousdale Estates. Designed by a Pritzker Prize-winning architect, the estate seamlessly blends indoor and outdoor living. Features include a 75-foot infinity pool, professional-grade kitchen, home theater, wine cellar, and a separate guest house.\", productType: \"'$PRODUCT_TYPE_ID'\", category: \"'$RESIDENTIAL_CAT_ID'\", attributes: [{id: \"'$LOCATION_ATTR_ID'\", plainText: \"Los Angeles, USA\"}, {id: \"'$COUNTRY_ATTR_ID'\", plainText: \"USA\"}, {id: \"'$AREA_ATTR_ID'\", plainText: \"18,500 Sq. Ft.\"}, {id: \"'$CONFIG_ATTR_ID'\", plainText: \"7 BHK + Staff Quarters\"}, {id: \"'$POSSESSION_ATTR_ID'\", plainText: \"Immediate\"}, {id: \"'$YIELD_ATTR_ID'\", plainText: \"2.5% p.a.\"}, {id: \"'$APPRECIATION_ATTR_ID'\", plainText: \"20-25%\"}] }) { product { id name } errors { field message } } }"
}'

# Property 5: Marina Bay Penthouse
echo "Creating Marina Bay Penthouse..."
graphql_request '{
    "query": "mutation { productCreate(input: { name: \"Marina Bay Penthouse\", slug: \"marina-bay-penthouse\", description: \"Perched atop one of Marina Bays most prestigious towers, this penthouse offers 360-degree views of the Singapore skyline, Marina Bay Sands, and the South China Sea. The residence features a private rooftop terrace, butler service, and direct access to the exclusive sky lounge and infinity pool.\", productType: \"'$PRODUCT_TYPE_ID'\", category: \"'$RESIDENTIAL_CAT_ID'\", attributes: [{id: \"'$LOCATION_ATTR_ID'\", plainText: \"Singapore\"}, {id: \"'$COUNTRY_ATTR_ID'\", plainText: \"Singapore\"}, {id: \"'$AREA_ATTR_ID'\", plainText: \"6,200 Sq. Ft.\"}, {id: \"'$CONFIG_ATTR_ID'\", plainText: \"4 BHK + Study\"}, {id: \"'$POSSESSION_ATTR_ID'\", plainText: \"Immediate\"}, {id: \"'$YIELD_ATTR_ID'\", plainText: \"3.2% p.a.\"}, {id: \"'$APPRECIATION_ATTR_ID'\", plainText: \"12-18%\"}] }) { product { id name } errors { field message } } }"
}'

# Property 6: Monaco Harbour Residence
echo "Creating Monaco Harbour Residence..."
graphql_request '{
    "query": "mutation { productCreate(input: { name: \"Monaco Harbour Residence\", slug: \"monaco-harbour\", description: \"An exceptional opportunity to own in the worlds most exclusive principality. This residence overlooks Port Hercules with views of the superyacht marina and the Mediterranean. Monacos tax-advantaged status, combined with limited real estate inventory, creates a unique value proposition.\", productType: \"'$PRODUCT_TYPE_ID'\", category: \"'$RESIDENTIAL_CAT_ID'\", attributes: [{id: \"'$LOCATION_ATTR_ID'\", plainText: \"Monte Carlo, Monaco\"}, {id: \"'$COUNTRY_ATTR_ID'\", plainText: \"Monaco\"}, {id: \"'$AREA_ATTR_ID'\", plainText: \"2,800 Sq. Ft.\"}, {id: \"'$CONFIG_ATTR_ID'\", plainText: \"3 BHK\"}, {id: \"'$POSSESSION_ATTR_ID'\", plainText: \"Immediate\"}, {id: \"'$YIELD_ATTR_ID'\", plainText: \"2.8% p.a.\"}, {id: \"'$APPRECIATION_ATTR_ID'\", plainText: \"15-20%\"}] }) { product { id name } errors { field message } } }"
}'

# Property 7: Swiss Alps Chalet
echo "Creating Swiss Alps Chalet..."
graphql_request '{
    "query": "mutation { productCreate(input: { name: \"Swiss Alps Chalet\", slug: \"swiss-alps-chalet\", description: \"A stunning alpine retreat in Verbiers most coveted enclave. This chalet combines traditional Swiss craftsmanship with contemporary luxury across five levels. Features include ski-in/ski-out access, indoor pool, spa, and a wine cave.\", productType: \"'$PRODUCT_TYPE_ID'\", category: \"'$RESIDENTIAL_CAT_ID'\", attributes: [{id: \"'$LOCATION_ATTR_ID'\", plainText: \"Verbier, Switzerland\"}, {id: \"'$COUNTRY_ATTR_ID'\", plainText: \"Switzerland\"}, {id: \"'$AREA_ATTR_ID'\", plainText: \"8,500 Sq. Ft.\"}, {id: \"'$CONFIG_ATTR_ID'\", plainText: \"6 BHK\"}, {id: \"'$POSSESSION_ATTR_ID'\", plainText: \"Immediate\"}, {id: \"'$YIELD_ATTR_ID'\", plainText: \"4.5% p.a.\"}, {id: \"'$APPRECIATION_ATTR_ID'\", plainText: \"10-15%\"}] }) { product { id name } errors { field message } } }"
}'

# Property 8: Sea Link Towers (Mumbai)
echo "Creating Sea Link Towers..."
graphql_request '{
    "query": "mutation { productCreate(input: { name: \"Sea Link Towers\", slug: \"mumbai-sea-link\", description: \"Mumbais newest ultra-luxury address overlooking the Bandra-Worli Sea Link. These residences offer unobstructed Arabian Sea views from every room. Developed by Indias most trusted luxury developer, the project features 14-foot ceilings and private elevators.\", productType: \"'$PRODUCT_TYPE_ID'\", category: \"'$RESIDENTIAL_CAT_ID'\", attributes: [{id: \"'$LOCATION_ATTR_ID'\", plainText: \"Mumbai, India\"}, {id: \"'$COUNTRY_ATTR_ID'\", plainText: \"India\"}, {id: \"'$AREA_ATTR_ID'\", plainText: \"4,500 - 8,000 Sq. Ft.\"}, {id: \"'$CONFIG_ATTR_ID'\", plainText: \"4 & 5 BHK\"}, {id: \"'$POSSESSION_ATTR_ID'\", plainText: \"Q2 2026\"}, {id: \"'$YIELD_ATTR_ID'\", plainText: \"2.8% p.a.\"}, {id: \"'$APPRECIATION_ATTR_ID'\", plainText: \"35-45%\"}] }) { product { id name } errors { field message } } }"
}'

echo ""
echo "=== Property data population complete! ==="
echo "Created:"
echo "- 1 Main Category (Real Estate)"
echo "- 2 Subcategories (Residential, Commercial)"
echo "- 1 Product Type (Luxury Property)"
echo "- 13 Attributes"
echo "- 8 Properties"
