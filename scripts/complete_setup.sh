#!/bin/bash

# Complete script to create attribute values and products

BASE_URL="http://localhost:8000/graphql/"

# Get token
TOKEN=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -d '{"query": "mutation { tokenCreate(email: \"superadmin@example.com\", password: \"admin123\") { token } }"}' | grep -o '"token": "[^"]*' | cut -d'"' -f4)
echo "Token obtained for superadmin"

# Get Default Channel ID
CHANNEL_RESPONSE=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"query": "{ channels { id slug } }"}' )
CHANNEL_ID=$(echo "$CHANNEL_RESPONSE" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "Using Channel ID: $CHANNEL_ID"

# Create/Get Category
echo "Getting/Creating 'Real Estate' Category..."
CAT_RESPONSE=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"query": "mutation { categoryCreate(input: { name: \"Real Estate\", slug: \"real-estate\" }) { category { id } errors { message } } }"}' )
CATEGORY_ID=$(echo "$CAT_RESPONSE" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$CATEGORY_ID" ]; then
    # Try fetching if create failed (exists)
    CAT_FETCH=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"query": "query { category(slug: \"real-estate\") { id } }"}' )
    CATEGORY_ID=$(echo "$CAT_FETCH" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
fi
echo "Using Category ID: $CATEGORY_ID"


# Attribute IDs
PROPERTY_TYPE_ATTR="QXR0cmlidXRlOjM="
STATUS_ATTR="QXR0cmlidXRlOjQ="
LOCATION_ATTR="QXR0cmlidXRlOjE="
COUNTRY_ATTR="QXR0cmlidXRlOjI="
AREA_ATTR="QXR0cmlidXRlOjU="
CONFIG_ATTR="QXR0cmlidXRlOjY="
POSSESSION_ATTR="QXR0cmlidXRlOjc="
YIELD_ATTR="QXR0cmlidXRlOjk="
APPRECIATION_ATTR="QXR0cmlidXRlOjEw"

LUXURY_PRODUCT_TYPE="UHJvZHVjdFR5cGU6Mg=="

# =============================================
# STEP 1: Create values for Property Type dropdown
# =============================================
echo "=== Creating Property Type dropdown values ==="

echo "Creating 'Residential' value..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation { attributeValueCreate(attribute: \"'"$PROPERTY_TYPE_ATTR"'\", input: { name: \"Residential\" }) { attributeValue { id name slug } errors { message } } }"
    }'
echo ""

echo "Creating 'Commercial' value..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation { attributeValueCreate(attribute: \"'"$PROPERTY_TYPE_ATTR"'\", input: { name: \"Commercial\" }) { attributeValue { id name slug } errors { message } } }"
    }'
echo ""

echo "Creating 'Luxury Villa' value..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation { attributeValueCreate(attribute: \"'"$PROPERTY_TYPE_ATTR"'\", input: { name: \"Luxury Villa\" }) { attributeValue { id name slug } errors { message } } }"
    }'
echo ""

# =============================================
# STEP 2: Create values for Status dropdown
# =============================================
echo ""
echo "=== Creating Status dropdown values ==="

echo "Creating 'Ready to Move' value..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation { attributeValueCreate(attribute: \"'"$STATUS_ATTR"'\", input: { name: \"Ready to Move\" }) { attributeValue { id name slug } errors { message } } }"
    }'
echo ""

echo "Creating 'Under Construction' value..."
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "mutation { attributeValueCreate(attribute: \"'"$STATUS_ATTR"'\", input: { name: \"Under Construction\" }) { attributeValue { id name slug } errors { message } } }"
    }'
echo ""

# =============================================
# STEP 3: Get the created attribute value IDs
# =============================================
echo ""
echo "=== Getting attribute value IDs ==="
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "query { attributes(first: 20) { edges { node { id name slug choices(first: 10) { edges { node { id name slug } } } } } } }"
    }' > /tmp/attr_values.json

# Extract values - Residential ID
RESIDENTIAL_VAL=$(cat /tmp/attr_values.json | grep -o '"id": "[^"]*", "name": "Residential"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)
echo "Residential value ID: $RESIDENTIAL_VAL"

# Ready to Move ID  
READY_VAL=$(cat /tmp/attr_values.json | grep -o '"id": "[^"]*", "name": "Ready to Move"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)
echo "Ready to Move value ID: $READY_VAL"

# Under Construction ID
UNDER_CONST_VAL=$(cat /tmp/attr_values.json | grep -o '"id": "[^"]*", "name": "Under Construction"' | grep -o '"id": "[^"]*' | cut -d'"' -f4)
echo "Under Construction value ID: $UNDER_CONST_VAL"

# =============================================
# STEP 4: Create products with all required attributes
# =============================================
echo ""
echo "=== Creating Products ==="

# Function to create a product
create_product() {
    local NAME="$1"
    local SLUG="$2"
    local DESC="$3"
    local LOCATION="$4"
    local COUNTRY="$5"
    local PROP_TYPE_VAL="$6"
    local STATUS_VAL="$7"
    local AREA="$8"
    local CONFIG="$9"
    local POSSESSION="${10}"
    local YIELD="${11}"
    local APPR="${12}"
    local PRICE="${13:-1000000}"

    echo "Creating $NAME..."
    RESPONSE=$(curl -s -X POST $BASE_URL \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "query": "mutation CreateProduct($input: ProductCreateInput!) { productCreate(input: $input) { product { id name } errors { field message } } }",
            "variables": {
                "input": {
                    "name": "'"$NAME"'",
                    "slug": "'"$SLUG"'",
                    "category": "'"$CATEGORY_ID"'",
                    "description": "{\"blocks\": [{\"type\": \"paragraph\", \"data\": {\"text\": \"'"$DESC"'\"}}]}",
                    "productType": "'"$LUXURY_PRODUCT_TYPE"'",
                    "attributes": [
                        {"id": "'"$LOCATION_ATTR"'", "plainText": "'"$LOCATION"'"},
                        {"id": "'"$COUNTRY_ATTR"'", "plainText": "'"$COUNTRY"'"},
                        {"id": "'"$PROPERTY_TYPE_ATTR"'", "dropdown": {"value": "'"$PROP_TYPE_VAL"'"}},
                        {"id": "'"$STATUS_ATTR"'", "dropdown": {"value": "'"$STATUS_VAL"'"}},
                        {"id": "'"$AREA_ATTR"'", "plainText": "'"$AREA"'"},
                        {"id": "'"$CONFIG_ATTR"'", "plainText": "'"$CONFIG"'"},
                        {"id": "'"$POSSESSION_ATTR"'", "plainText": "'"$POSSESSION"'"},
                        {"id": "'"$YIELD_ATTR"'", "plainText": "'"$YIELD"'"},
                        {"id": "'"$APPRECIATION_ATTR"'", "plainText": "'"$APPR"'"}
                    ]
                }
            }
        }')
    
    # Extract Product ID
    PRODUCT_ID=$(echo "$RESPONSE" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
    echo "Created Product ID: $PRODUCT_ID"

    # If creation failed (likely already exists), fetch ID by slug
    if [ -z "$PRODUCT_ID" ]; then
        echo "Product '$NAME' may already exist. Fetching ID by slug..."
        PRODUCT_QUERY_RESPONSE=$(curl -s -X POST $BASE_URL \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d '{
                "query": "query { product(slug: \"'"$SLUG"'\") { id } }"
            }')
        PRODUCT_ID=$(echo "$PRODUCT_QUERY_RESPONSE" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
        echo "Fetched Existing Product ID: $PRODUCT_ID"

        # Update category for existing product
        if [ -n "$PRODUCT_ID" ]; then
             echo "Updating Category for existing product..."
             curl -s -X POST $BASE_URL \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $TOKEN" \
                -d '{
                    "query": "mutation { productUpdate(id: \"'"$PRODUCT_ID"'\", input: { category: \"'"$CATEGORY_ID"'\" }) { product { id } errors { message } } }"
                }'
        fi
    fi

    # Create Variant logic
    if [ -n "$PRODUCT_ID" ]; then
        echo "Ensuring Variant exists..."
        # Create a variant (simplest approach: always try to create, if fails maybe it exists, or just query variants first?)
        # For simplicity, we query if variants exist.
        VARIANTS_RESPONSE=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"query": "query { product(id: \"'"$PRODUCT_ID"'\") { variants { id } } }"}')
        VARIANT_ID=$(echo "$VARIANTS_RESPONSE" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
        
        if [ -z "$VARIANT_ID" ]; then
            echo "Creating Default Variant..."
            VARIANT_CREATE_RES=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{
                "query": "mutation { productVariantCreate(input: { product: \"'"$PRODUCT_ID"'\", sku: \"'"$SLUG"'-default\", attributes: [] }) { productVariant { id } errors { message } } }"
            }')
             VARIANT_ID=$(echo "$VARIANT_CREATE_RES" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
             echo "Created Variant ID: $VARIANT_ID"
        else
            echo "Variant already exists: $VARIANT_ID"
        fi

        # Update Variant Price
        if [ -n "$VARIANT_ID" ] && [ -n "$CHANNEL_ID" ]; then
            echo "Setting Price ($PRICE)..."
            VAR_UPDATE_RES=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{
                "query": "mutation { productVariantChannelListingUpdate(id: \"'"$VARIANT_ID"'\", input: [{ channelId: \"'"$CHANNEL_ID"'\", price: '"$PRICE"', costPrice: '"$PRICE"' }]) { variant { id } errors { message } } }"
            }')
            echo "Result: $VAR_UPDATE_RES"
        fi
    fi

    if [ -n "$PRODUCT_ID" ] && [ -n "$CHANNEL_ID" ]; then
        echo "Publishing to Channel ID: $CHANNEL_ID..."
        curl -s -X POST $BASE_URL \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d '{
                "query": "mutation { productChannelListingUpdate(id: \"'"$PRODUCT_ID"'\", input: { updateChannels: [{ channelId: \"'"$CHANNEL_ID"'\", isPublished: true, publicationDate: \"2025-01-01\", isAvailableForPurchase: true, availableForPurchaseAt: \"2025-01-01T00:00:00+00:00\", visibleInListings: true }] }) { product { id } errors { message } } }"
            }'
        echo "Published."
    else
        echo "Failed to publish. Product ID: $PRODUCT_ID, Channel ID: $CHANNEL_ID"
    fi
    echo ""
}

# Property 1: The Aurum Residence
create_product "The Aurum Residence" "the-aurum" \
    "The Aurum Residence is an architectural statement featuring Georgian grandeur with state-of-the-art sustainable technology." \
    "London, UK" "UK" "$RESIDENTIAL_VAL" "$READY_VAL" \
    "2,800 - 6,500 Sq. Ft." "3, 4 & 5 BHK" "Immediate" "4.2% p.a." "18-22%" "7000000"

# Property 2: Palm Royale Villa
create_product "Palm Royale Villa" "palm-royale" \
    "Palm Royale Villa represents the pinnacle of waterfront living on the iconic Palm Jumeirah with private beach and yacht mooring." \
    "Dubai, UAE" "UAE" "$RESIDENTIAL_VAL" "$UNDER_CONST_VAL" \
    "8,500 - 15,000 Sq. Ft." "5 & 6 BHK" "Q4 2025" "5.8% p.a." "25-30%" "15000000"

# Property 3: Manhattan Heights
create_product "Manhattan Heights" "manhattan-heights" \
    "Manhattan Heights offers unparalleled living in Tribeca with iconic Hudson River and downtown Manhattan views." \
    "New York, USA" "USA" "$RESIDENTIAL_VAL" "$READY_VAL" \
    "3,200 - 5,800 Sq. Ft." "3 & 4 BHK" "Immediate" "3.8% p.a." "15-20%" "12000000"

# Property 4: Beverly Hills Estate
create_product "Beverly Hills Estate" "beverly-estate" \
    "Architectural masterpiece on 2 acres in prestigious Trousdale Estates with 75-foot infinity pool and wine cellar." \
    "Los Angeles, USA" "USA" "$RESIDENTIAL_VAL" "$READY_VAL" \
    "18,500 Sq. Ft." "7 BHK + Staff Quarters" "Immediate" "2.5% p.a." "20-25%" "25000000"

# Property 5: Marina Bay Penthouse
create_product "Marina Bay Penthouse" "marina-bay-penthouse" \
    "Super penthouse with 360-degree views of Singapore skyline, private rooftop terrace and butler service." \
    "Singapore" "Singapore" "$RESIDENTIAL_VAL" "$READY_VAL" \
    "6,200 Sq. Ft." "4 BHK + Study" "Immediate" "3.2% p.a." "12-18%" "18000000"

# Property 6: Monaco Harbour Residence
create_product "Monaco Harbour Residence" "monaco-harbour" \
    "Exceptional opportunity in the worlds most exclusive principality overlooking Port Hercules and the Mediterranean." \
    "Monte Carlo, Monaco" "Monaco" "$RESIDENTIAL_VAL" "$READY_VAL" \
    "2,800 Sq. Ft." "3 BHK" "Immediate" "2.8% p.a." "15-20%" "35000000"

# Property 7: Swiss Alps Chalet
create_product "Swiss Alps Chalet" "swiss-alps-chalet" \
    "Stunning alpine retreat in Verbier with ski-in/ski-out access, indoor pool, spa, and wine cave." \
    "Verbier, Switzerland" "Switzerland" "$RESIDENTIAL_VAL" "$READY_VAL" \
    "8,500 Sq. Ft." "6 BHK" "Immediate" "4.5% p.a." "10-15%" "10000000"

# Property 8: Sea Link Towers
create_product "Sea Link Towers" "mumbai-sea-link" \
    "Mumbais ultra-luxury address overlooking Bandra-Worli Sea Link with 14-foot ceilings and private elevators." \
    "Mumbai, India" "India" "$RESIDENTIAL_VAL" "$UNDER_CONST_VAL" \
    "4,500 - 8,000 Sq. Ft." "4 & 5 BHK" "Q2 2026" "2.8% p.a." "35-45%" "4500000"

# =============================================
# STEP 5: Verify products
# =============================================
echo ""
echo "=== Verifying Created Products ==="
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "query { products(first: 10) { edges { node { id name slug productType { name } attributes { attribute { name } values { name plainText } } } } } }"
    }' | python3 -m json.tool 2>/dev/null || cat

echo ""
echo "=== COMPLETE ==="
