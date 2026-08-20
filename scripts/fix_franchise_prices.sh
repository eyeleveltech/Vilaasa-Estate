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

# Get Channel ID
CHANNEL_RESPONSE=$(curl -s -X POST "$SALEOR_API_URL" -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" -d '{"query": "{ channels { id } }"}' )
CHANNEL_ID=$(echo "$CHANNEL_RESPONSE" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "Channel ID: $CHANNEL_ID"

update_price() {
    local SLUG="$1"
    local PRICE="$2"
    
    echo "Updating $SLUG..."
    
    # Get Variant ID
    VAR_QUERY=$(curl -s -X POST "$SALEOR_API_URL" -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" -d '{"query": "query { product(slug: \"'"$SLUG"'\") { variants { id } } }"}')
    VAR_ID=$(echo "$VAR_QUERY" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$VAR_ID" ]; then
        echo "Variant not found for $SLUG"
        return
    fi
    echo "Variant ID: $VAR_ID"
    
    # Update Price
    RESPONSE=$(curl -s -X POST "$SALEOR_API_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "query": "mutation { productVariantChannelListingUpdate(id: \"'"$VAR_ID"'\", input: [{ channelId: \"'"$CHANNEL_ID"'\", price: '"$PRICE"', costPrice: '"$PRICE"' }]) { variant { id } errors { field message } } }"
        }')
        
    echo "Response: $RESPONSE"
    echo ""
}

# 1. Wellness Resorts (Kerala)
update_price "wellness-resorts-kerala" "7000000"

# 2. Carlton Wellness Spa
update_price "carlton-wellness-spa" "7000000"

# 3. Colton Beach Resort
update_price "colton-resort-chennai" "7000000"

# 4. Luxe Premium Saloon
update_price "luxe-saloon-mumbai" "7000000"

# 5. Zen Wellness Spa
update_price "zen-wellness-goa" "70300000"

# 6. Ayur Wellness Center
update_price "ayur-wellness-bangalore" "9000000"

# 7. Ayur Wellness Center Hotel
update_price "wellness-bangalore" "7000000"
