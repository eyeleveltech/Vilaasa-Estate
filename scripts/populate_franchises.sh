#!/bin/bash

# Saleor GraphQL Endpoint
SALEOR_API_URL="http://localhost:8000/graphql/"

# Authenticate
AUTH_TOKEN=$(curl -s -X POST "$SALEOR_API_URL" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { tokenCreate(email: \"superadmin@example.com\", password: \"admin123\") { token } }"}' | grep -o '"token": "[^"]*"' | cut -d'"' -f4)

if [ -z "$AUTH_TOKEN" ]; then
  echo "Authentication failed!"
  exit 1
fi
echo "Authenticated."

# Attribute IDs (Constants from complete_setup.sh)
PROPERTY_TYPE_ATTR="QXR0cmlidXRlOjM="
STATUS_ATTR="QXR0cmlidXRlOjQ="
LOCATION_ATTR="QXR0cmlidXRlOjE="
COUNTRY_ATTR="QXR0cmlidXRlOjI="
YIELD_ATTR="QXR0cmlidXRlOjk="
LUXURY_PRODUCT_TYPE="UHJvZHVjdFR5cGU6Mg=="

# Get Category ID (Real Estate)
CAT_RESPONSE=$(curl -s -X POST "$SALEOR_API_URL" -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" -d '{"query": "query { category(slug: \"real-estate\") { id } }"}' )
CATEGORY_ID=$(echo "$CAT_RESPONSE" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "Category ID: $CATEGORY_ID"

# Get Channel ID
CHANNEL_RESPONSE=$(curl -s -X POST "$SALEOR_API_URL" -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" -d '{"query": "{ channels { id } }"}' )
CHANNEL_ID=$(echo "$CHANNEL_RESPONSE" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "Channel ID: $CHANNEL_ID"

# 1. Create "Franchise" Property Type Attribute Value
echo "Creating 'Franchise' attribute value..."
FRANCHISE_ATTR_VAL_RES=$(curl -s -X POST "$SALEOR_API_URL" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "query": "mutation { attributeValueCreate(attribute: \"'"$PROPERTY_TYPE_ATTR"'\", input: { name: \"Franchise\" }) { attributeValue { id } errors { message } } }"
    }')
FRANCHISE_VAL_ID=$(echo "$FRANCHISE_ATTR_VAL_RES" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$FRANCHISE_VAL_ID" ]; then
    # Maybe it exists, fetch it
    echo "Creating failed, fetching existing 'Franchise' value..."
    ATTR_FETCH=$(curl -s -X POST "$SALEOR_API_URL" -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" -d '{"query": "query { attribute(id: \"'"$PROPERTY_TYPE_ATTR"'\") { choices(first: 50) { edges { node { id name } } } } }"}')
    FRANCHISE_VAL_ID=$(echo "$ATTR_FETCH" | grep -o '"id": "[^"]*", "name": "Franchise"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)
fi
echo "Franchise Value ID: $FRANCHISE_VAL_ID"

# Pre-fetch Status IDs
ATTR_FETCH=$(curl -s -X POST "$SALEOR_API_URL" -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" -d '{"query": "query { attribute(id: \"'"$STATUS_ATTR"'\") { choices(first: 50) { edges { node { id name } } } } }"}')
READY_VAL_ID=$(echo "$ATTR_FETCH" | grep -o '"id": "[^"]*", "name": "Ready to Move"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)
UNDER_CONST_VAL_ID=$(echo "$ATTR_FETCH" | grep -o '"id": "[^"]*", "name": "Under Construction"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)

# Function to create franchise
create_franchise() {
    local NAME="$1"
    local SLUG="$2"
    local LOCATION="$3"
    local SUBTYPE="$4"
    local PRICE="$5"
    local ROI="$6"
    local STATUS_TXT="$7"
    local FEATURES="$8"

    # Map Status
    if [[ "$STATUS_TXT" == "Opening 2025" ]]; then
        STATUS_VAL="$UNDER_CONST_VAL_ID"
    else
        STATUS_VAL="$READY_VAL_ID"
    fi

    echo "Creating Franchise: $NAME ($SLUG)..."
    
    DESC="Type: $SUBTYPE. Features: $FEATURES."
    
    RESPONSE=$(curl -s -X POST "$SALEOR_API_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "query": "mutation CreateProduct($input: ProductCreateInput!) { productCreate(input: $input) { product { id } errors { field message } } }",
            "variables": {
                "input": {
                    "name": "'"$NAME"'",
                    "slug": "'"$SLUG"'",
                    "category": "'"$CATEGORY_ID"'",
                    "productType": "'"$LUXURY_PRODUCT_TYPE"'",
                    "description": "{\"blocks\": [{\"type\": \"paragraph\", \"data\": {\"text\": \"'"$DESC"'\"}}]}",
                    "attributes": [
                        {"id": "'"$LOCATION_ATTR"'", "plainText": "'"$LOCATION"'"},
                        {"id": "'"$COUNTRY_ATTR"'", "plainText": "India"},
                        {"id": "'"$PROPERTY_TYPE_ATTR"'", "dropdown": {"value": "'"$FRANCHISE_VAL_ID"'"}},
                        {"id": "'"$STATUS_ATTR"'", "dropdown": {"value": "'"$STATUS_VAL"'"}},
                        {"id": "'"$YIELD_ATTR"'", "plainText": "'"$ROI"'"}
                    ]
                }
            }
        }')
    
    PRODUCT_ID=$(echo "$RESPONSE" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$PRODUCT_ID" ]; then
        echo "Product create failed or exists. checking errors..."
        echo "$RESPONSE"
        # Fetch if exists
         PRODUCT_ID_QUERY=$(curl -s -X POST "$SALEOR_API_URL" -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" -d '{"query": "query { product(slug: \"'"$SLUG"'\") { id } }"}')
         PRODUCT_ID=$(echo "$PRODUCT_ID_QUERY" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
    fi
    echo "Product ID: $PRODUCT_ID"

    if [ -n "$PRODUCT_ID" ]; then
        # Create Variant
        echo "Creating Variant with price $PRICE..."
        VAR_RES=$(curl -s -X POST "$SALEOR_API_URL" -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" -d '{
             "query": "mutation { productVariantCreate(input: { product: \"'"$PRODUCT_ID"'\", sku: \"'"$SLUG"'-default\", attributes: [] }) { productVariant { id } errors { message } } }"
        }')
        VAR_ID=$(echo "$VAR_RES" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
        
        if [ -z "$VAR_ID" ]; then
             # Check if variant exists
             VAR_QUERY=$(curl -s -X POST "$SALEOR_API_URL" -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" -d '{"query": "query { product(id: \"'"$PRODUCT_ID"'\") { variants { id } } }"}')
             VAR_ID=$(echo "$VAR_QUERY" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
        fi
        
        if [ -n "$VAR_ID" ]; then
             # Price
             curl -s -X POST "$SALEOR_API_URL" -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" -d '{
                "query": "mutation { productVariantChannelListingUpdate(id: \"'"$VAR_ID"'\", input: [{ channelId: \"'"$CHANNEL_ID"'\", price: '"$PRICE"', costPrice: '"$PRICE"' }]) { variant { id } } }"
             }'
        fi
        
        # Publish
        curl -s -X POST "$SALEOR_API_URL" -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" -d '{
            "query": "mutation { productChannelListingUpdate(id: \"'"$PRODUCT_ID"'\", input: { updateChannels: [{ channelId: \"'"$CHANNEL_ID"'\", isPublished: true, isAvailableForPurchase: true, availableForPurchaseAt: \"2025-01-01T00:00:00+00:00\", visibleInListings: true }] }) { product { id } } }"
        }'
    fi
    echo "Done $NAME"
    echo ""
}

# 1. Wellness Resorts (Kerala)
create_franchise "Wellness Resorts" "wellness-resorts-kerala" "Kerala & Pondicherry" "wellness" "7000000" "24% annually" "Opening 2025" "Authentic Ayurvedic treatments, Yoga & meditation programs"

# 2. Carlton Wellness Spa
create_franchise "Carlton Wellness Spa" "carlton-wellness-spa" "Integrated Across All Properties" "spa" "7000000" "26% annually" "Available Now" "Bespoke wellness treatments, Ayrurvedic & contemporary therapies"

# 3. Colton Beach Resort
create_franchise "Colton Beach Resort" "colton-resort-chennai" "Chennai ECR" "resort" "7000000" "22% annually" "Available Now" "Beachfront location, Premium amenities"

# 4. Luxe Premium Saloon
create_franchise "Luxe Premium Saloon" "luxe-saloon-mumbai" "Mumbai, Delhi, Bangalore" "saloon" "7000000" "28% annually" "Available Now" "European techniques, Premium clientele"

# 5. Zen Wellness Spa
create_franchise "Zen Wellness Spa" "zen-wellness-goa" "Goa, Kerala, Rishikesh" "wellness" "70300000" "25% annually" "Available Now" "Holistic wellness, Ayurveda + modern spa"

# 6. Ayur Wellness Center
create_franchise "Ayur Wellness Center" "ayur-wellness-bangalore" "Bangalore, Chennai, Pune" "wellness" "9000000" "30% annually" "Available Now" "Medical wellness, Subscription model"

# 7. Ayur Wellness Center (Duplicate Name, ID wellness-bangalore)
create_franchise "Ayur Wellness Center Hotel" "wellness-bangalore" "Bangalore, Chennai, Pune" "Hotel" "7000000" "30% annually" "Available Now" "Medical wellness, Hotel"
