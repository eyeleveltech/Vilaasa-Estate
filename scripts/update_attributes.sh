#!/bin/bash

# Script to update product attributes with property-specific values

BASE_URL="http://localhost:8000/graphql/"

# Get token
TOKEN_RESPONSE=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { tokenCreate(email: \"admin@global.com\", password: \"admin123\") { token errors { message } } }"}')

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token": "[^"]*' | cut -d'"' -f4)
echo "Token obtained: ${TOKEN:0:20}..."

# Attribute IDs (from previous run)
LOCATION_ATTR="QXR0cmlidXRlOjE="
COUNTRY_ATTR="QXR0cmlidXRlOjI="
AREA_ATTR="QXR0cmlidXRlOjU="
CONFIG_ATTR="QXR0cmlidXRlOjY="
POSSESSION_ATTR="QXR0cmlidXRlOjc="
YIELD_ATTR="QXR0cmlidXRlOjk="
APPRECIATION_ATTR="QXR0cmlidXRlOjEw"

# Product IDs
AURUM_ID="UHJvZHVjdDox"
PALM_ID="UHJvZHVjdDoy"
MANHATTAN_ID="UHJvZHVjdDoz"
BEVERLY_ID="UHJvZHVjdDo0"
MARINA_ID="UHJvZHVjdDo1"
MONACO_ID="UHJvZHVjdDo2"
SWISS_ID="UHJvZHVjdDo3"
SEALINK_ID="UHJvZHVjdDo4"

# Update function
update_product() {
    local PRODUCT_ID=$1
    local LOCATION=$2
    local COUNTRY=$3
    local AREA=$4
    local CONFIG=$5
    local POSSESSION=$6
    local YIELD=$7
    local APPRECIATION=$8
    local NAME=$9

    echo "Updating $NAME..."
    curl -s -X POST $BASE_URL \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "query": "mutation UpdateProduct($id: ID!, $input: ProductInput!) { productUpdate(id: $id, input: $input) { product { id name } errors { field message } } }",
            "variables": {
                "id": "'"$PRODUCT_ID"'",
                "input": {
                    "attributes": [
                        {"id": "'"$LOCATION_ATTR"'", "plainText": "'"$LOCATION"'"},
                        {"id": "'"$COUNTRY_ATTR"'", "plainText": "'"$COUNTRY"'"},
                        {"id": "'"$AREA_ATTR"'", "plainText": "'"$AREA"'"},
                        {"id": "'"$CONFIG_ATTR"'", "plainText": "'"$CONFIG"'"},
                        {"id": "'"$POSSESSION_ATTR"'", "plainText": "'"$POSSESSION"'"},
                        {"id": "'"$YIELD_ATTR"'", "plainText": "'"$YIELD"'"},
                        {"id": "'"$APPRECIATION_ATTR"'", "plainText": "'"$APPRECIATION"'"}
                    ]
                }
            }
        }'
    echo ""
}

echo "=== Updating Product Attributes ==="

# The Aurum Residence
update_product "$AURUM_ID" "London, UK" "UK" "2,800 - 6,500 Sq. Ft." "3, 4 & 5 BHK" "Immediate" "4.2% p.a." "18-22%" "The Aurum Residence"

# Palm Royale Villa
update_product "$PALM_ID" "Dubai, UAE" "UAE" "8,500 - 15,000 Sq. Ft." "5 & 6 BHK" "Q4 2025" "5.8% p.a." "25-30%" "Palm Royale Villa"

# Manhattan Heights
update_product "$MANHATTAN_ID" "New York, USA" "USA" "3,200 - 5,800 Sq. Ft." "3 & 4 BHK" "Immediate" "3.8% p.a." "15-20%" "Manhattan Heights"

# Beverly Hills Estate
update_product "$BEVERLY_ID" "Los Angeles, USA" "USA" "18,500 Sq. Ft." "7 BHK + Staff Quarters" "Immediate" "2.5% p.a." "20-25%" "Beverly Hills Estate"

# Marina Bay Penthouse
update_product "$MARINA_ID" "Singapore" "Singapore" "6,200 Sq. Ft." "4 BHK + Study" "Immediate" "3.2% p.a." "12-18%" "Marina Bay Penthouse"

# Monaco Harbour Residence
update_product "$MONACO_ID" "Monte Carlo, Monaco" "Monaco" "2,800 Sq. Ft." "3 BHK" "Immediate" "2.8% p.a." "15-20%" "Monaco Harbour Residence"

# Swiss Alps Chalet
update_product "$SWISS_ID" "Verbier, Switzerland" "Switzerland" "8,500 Sq. Ft." "6 BHK" "Immediate" "4.5% p.a." "10-15%" "Swiss Alps Chalet"

# Sea Link Towers
update_product "$SEALINK_ID" "Mumbai, India" "India" "4,500 - 8,000 Sq. Ft." "4 & 5 BHK" "Q2 2026" "2.8% p.a." "35-45%" "Sea Link Towers"

echo ""
echo "=== Verifying Updated Products ==="
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "query { products(first: 10) { edges { node { id name attributes { attribute { name } values { plainText } } } } } }"
    }' | python3 -m json.tool 2>/dev/null || cat

echo ""
echo "=== Attribute Update Complete ==="
