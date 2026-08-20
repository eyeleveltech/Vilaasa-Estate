#!/bin/bash

# Saleor Property Data Population Script - Fixed Version
# Description must be in EditorJS JSON format

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

# Get existing IDs
echo ""
echo "=== Getting existing Product Type and Category IDs ==="

# Get Product Types
PRODUCT_TYPES=$(graphql_request '{
    "query": "query { productTypes(first: 10) { edges { node { id name productAttributes { id name slug } } } } }"
}')
echo "Product Types: $PRODUCT_TYPES"

# Extract the Luxury Property product type ID
PRODUCT_TYPE_ID=$(echo $PRODUCT_TYPES | grep -o '"id": "UHJvZHVjdFR5cGU6[^"]*' | head -1 | cut -d'"' -f4)
echo "Product Type ID: $PRODUCT_TYPE_ID"

# Get Categories
CATEGORIES=$(graphql_request '{
    "query": "query { categories(first: 10) { edges { node { id name slug } } } }"
}')
echo "Categories: $CATEGORIES"

# Get Residential category ID - we need to find the one with slug "residential"
RESIDENTIAL_CAT_ID=$(echo $CATEGORIES | grep -o '"id": "Q2F0ZWdvcnk6[^"]*' | head -1 | cut -d'"' -f4)
echo "Category ID (will use first one): $RESIDENTIAL_CAT_ID"

# Get Attributes
ATTRIBUTES=$(graphql_request '{
    "query": "query { attributes(first: 20) { edges { node { id name slug } } } }"
}')
echo "Attributes: $ATTRIBUTES"

# Parse attribute IDs - we need to be more careful here
# Let's get them one by one from the response
LOCATION_ATTR_ID=$(echo $ATTRIBUTES | grep -o '"id": "[^"]*", "name": "Location"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)
COUNTRY_ATTR_ID=$(echo $ATTRIBUTES | grep -o '"id": "[^"]*", "name": "Country"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)
AREA_ATTR_ID=$(echo $ATTRIBUTES | grep -o '"id": "[^"]*", "name": "Total Area"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)
CONFIG_ATTR_ID=$(echo $ATTRIBUTES | grep -o '"id": "[^"]*", "name": "Configuration"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)
POSSESSION_ATTR_ID=$(echo $ATTRIBUTES | grep -o '"id": "[^"]*", "name": "Possession"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)
YIELD_ATTR_ID=$(echo $ATTRIBUTES | grep -o '"id": "[^"]*", "name": "Rental Yield"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)
APPRECIATION_ATTR_ID=$(echo $ATTRIBUTES | grep -o '"id": "[^"]*", "name": "5-Year Appreciation"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)

echo "Location Attr ID: $LOCATION_ATTR_ID"
echo "Country Attr ID: $COUNTRY_ATTR_ID"
echo "Area Attr ID: $AREA_ATTR_ID"
echo "Config Attr ID: $CONFIG_ATTR_ID"
echo "Possession Attr ID: $POSSESSION_ATTR_ID"
echo "Yield Attr ID: $YIELD_ATTR_ID"
echo "Appreciation Attr ID: $APPRECIATION_ATTR_ID"

# =============================================
# Create Products with proper JSON description format
# =============================================
echo ""
echo "=== Creating Properties ==="

# The description must be in EditorJS format - let's use a simple JSON structure
# Format: {\"blocks\": [{\"type\": \"paragraph\", \"data\": {\"text\": \"...\"}}]}

# Property 1: The Aurum Residence
echo "Creating The Aurum Residence..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation CreateProduct($input: ProductCreateInput!) { productCreate(input: $input) { product { id name slug } errors { field message code } } }",
        "variables": {
            "input": {
                "name": "The Aurum Residence",
                "slug": "the-aurum",
                "description": "{\"blocks\": [{\"type\": \"paragraph\", \"data\": {\"text\": \"The Aurum Residence is not merely a home; it is an architectural statement. Drawing inspiration from the Georgian grandeur of the surrounding estate, this development integrates classic proportions with state-of-the-art sustainable technology. Each residence offers panoramic views of the Royal Parks, featuring double-height ceilings, bespoke Italian joinery, and private elevator access.\"}}]}",
                "productType": "'"$PRODUCT_TYPE_ID"'",
                "category": "'"$RESIDENTIAL_CAT_ID"'"
            }
        }
    }'
echo ""

# Property 2: Palm Royale Villa
echo "Creating Palm Royale Villa..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation CreateProduct($input: ProductCreateInput!) { productCreate(input: $input) { product { id name slug } errors { field message code } } }",
        "variables": {
            "input": {
                "name": "Palm Royale Villa",
                "slug": "palm-royale",
                "description": "{\"blocks\": [{\"type\": \"paragraph\", \"data\": {\"text\": \"Palm Royale Villa represents the pinnacle of waterfront living on the iconic Palm Jumeirah. This exclusive collection of signature villas combines Arabian heritage with contemporary luxury. Each villa features a private beach, infinity pool overlooking the Arabian Gulf, and direct yacht mooring.\"}}]}",
                "productType": "'"$PRODUCT_TYPE_ID"'",
                "category": "'"$RESIDENTIAL_CAT_ID"'"
            }
        }
    }'
echo ""

# Property 3: Manhattan Heights
echo "Creating Manhattan Heights..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation CreateProduct($input: ProductCreateInput!) { productCreate(input: $input) { product { id name slug } errors { field message code } } }",
        "variables": {
            "input": {
                "name": "Manhattan Heights",
                "slug": "manhattan-heights",
                "description": "{\"blocks\": [{\"type\": \"paragraph\", \"data\": {\"text\": \"Manhattan Heights offers an unparalleled living experience in the heart of Tribeca. Floor-to-ceiling windows frame iconic views of the Hudson River and downtown Manhattan skyline. Designed by award-winning architects, each residence features imported Italian marble, smart home automation, and private terraces.\"}}]}",
                "productType": "'"$PRODUCT_TYPE_ID"'",
                "category": "'"$RESIDENTIAL_CAT_ID"'"
            }
        }
    }'
echo ""

# Property 4: Beverly Hills Estate
echo "Creating Beverly Hills Estate..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation CreateProduct($input: ProductCreateInput!) { productCreate(input: $input) { product { id name slug } errors { field message code } } }",
        "variables": {
            "input": {
                "name": "Beverly Hills Estate",
                "slug": "beverly-estate",
                "description": "{\"blocks\": [{\"type\": \"paragraph\", \"data\": {\"text\": \"This architectural masterpiece sits on 2 acres in the prestigious Trousdale Estates. Designed by a Pritzker Prize-winning architect, the estate seamlessly blends indoor and outdoor living. Features include a 75-foot infinity pool, professional-grade kitchen, home theater, wine cellar, and a separate guest house.\"}}]}",
                "productType": "'"$PRODUCT_TYPE_ID"'",
                "category": "'"$RESIDENTIAL_CAT_ID"'"
            }
        }
    }'
echo ""

# Property 5: Marina Bay Penthouse
echo "Creating Marina Bay Penthouse..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation CreateProduct($input: ProductCreateInput!) { productCreate(input: $input) { product { id name slug } errors { field message code } } }",
        "variables": {
            "input": {
                "name": "Marina Bay Penthouse",
                "slug": "marina-bay-penthouse",
                "description": "{\"blocks\": [{\"type\": \"paragraph\", \"data\": {\"text\": \"Perched atop one of Marina Bays most prestigious towers, this penthouse offers 360-degree views of the Singapore skyline, Marina Bay Sands, and the South China Sea. The residence features a private rooftop terrace, butler service, and direct access to the exclusive sky lounge and infinity pool.\"}}]}",
                "productType": "'"$PRODUCT_TYPE_ID"'",
                "category": "'"$RESIDENTIAL_CAT_ID"'"
            }
        }
    }'
echo ""

# Property 6: Monaco Harbour Residence
echo "Creating Monaco Harbour Residence..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation CreateProduct($input: ProductCreateInput!) { productCreate(input: $input) { product { id name slug } errors { field message code } } }",
        "variables": {
            "input": {
                "name": "Monaco Harbour Residence",
                "slug": "monaco-harbour",
                "description": "{\"blocks\": [{\"type\": \"paragraph\", \"data\": {\"text\": \"An exceptional opportunity to own in the worlds most exclusive principality. This residence overlooks Port Hercules with views of the superyacht marina and the Mediterranean. Monacos tax-advantaged status, combined with limited real estate inventory, creates a unique value proposition.\"}}]}",
                "productType": "'"$PRODUCT_TYPE_ID"'",
                "category": "'"$RESIDENTIAL_CAT_ID"'"
            }
        }
    }'
echo ""

# Property 7: Swiss Alps Chalet
echo "Creating Swiss Alps Chalet..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation CreateProduct($input: ProductCreateInput!) { productCreate(input: $input) { product { id name slug } errors { field message code } } }",
        "variables": {
            "input": {
                "name": "Swiss Alps Chalet",
                "slug": "swiss-alps-chalet",
                "description": "{\"blocks\": [{\"type\": \"paragraph\", \"data\": {\"text\": \"A stunning alpine retreat in Verbiers most coveted enclave. This chalet combines traditional Swiss craftsmanship with contemporary luxury across five levels. Features include ski-in/ski-out access, indoor pool, spa, and a wine cave.\"}}]}",
                "productType": "'"$PRODUCT_TYPE_ID"'",
                "category": "'"$RESIDENTIAL_CAT_ID"'"
            }
        }
    }'
echo ""

# Property 8: Sea Link Towers (Mumbai)
echo "Creating Sea Link Towers..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation CreateProduct($input: ProductCreateInput!) { productCreate(input: $input) { product { id name slug } errors { field message code } } }",
        "variables": {
            "input": {
                "name": "Sea Link Towers",
                "slug": "mumbai-sea-link",
                "description": "{\"blocks\": [{\"type\": \"paragraph\", \"data\": {\"text\": \"Mumbais newest ultra-luxury address overlooking the Bandra-Worli Sea Link. These residences offer unobstructed Arabian Sea views from every room. Developed by Indias most trusted luxury developer, the project features 14-foot ceilings and private elevators.\"}}]}",
                "productType": "'"$PRODUCT_TYPE_ID"'",
                "category": "'"$RESIDENTIAL_CAT_ID"'"
            }
        }
    }'
echo ""

echo ""
echo "=== Verifying Created Products ==="
graphql_request '{
    "query": "query { products(first: 10) { edges { node { id name slug category { name } } } } }"
}'

echo ""
echo "=== Property creation complete! ==="
