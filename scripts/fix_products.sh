#!/bin/bash

# Script to fix product types and add attributes

BASE_URL="http://localhost:8000/graphql/"

# Get token
TOKEN_RESPONSE=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { tokenCreate(email: \"admin@global.com\", password: \"admin123\") { token errors { message } } }"}')

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token": "[^"]*' | cut -d'"' -f4)
echo "Token obtained"

# The CORRECT Product Type ID (Luxury Property with attributes)
LUXURY_PRODUCT_TYPE="UHJvZHVjdFR5cGU6Mg=="

# Product IDs
PRODUCTS=("UHJvZHVjdDox" "UHJvZHVjdDoy" "UHJvZHVjdDoz" "UHJvZHVjdDo0" "UHJvZHVjdDo1" "UHJvZHVjdDo2" "UHJvZHVjdDo3" "UHJvZHVjdDo4")
NAMES=("The Aurum Residence" "Palm Royale Villa" "Manhattan Heights" "Beverly Hills Estate" "Marina Bay Penthouse" "Monaco Harbour Residence" "Swiss Alps Chalet" "Sea Link Towers")

# First, delete the existing products
echo "=== Deleting existing products ==="
for PRODUCT_ID in "${PRODUCTS[@]}"; do
    echo "Deleting $PRODUCT_ID..."
    curl -s -X POST $BASE_URL \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "query": "mutation { productDelete(id: \"'"$PRODUCT_ID"'\") { product { id } errors { message } } }"
        }'
    echo ""
done

# Now create products with correct product type and attributes
echo ""
echo "=== Creating products with correct product type ==="

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
                "productType": "'"$LUXURY_PRODUCT_TYPE"'",
                "attributes": [
                    {"id": "QXR0cmlidXRlOjE=", "plainText": "London, UK"},
                    {"id": "QXR0cmlidXRlOjI=", "plainText": "UK"},
                    {"id": "QXR0cmlidXRlOjU=", "plainText": "2,800 - 6,500 Sq. Ft."},
                    {"id": "QXR0cmlidXRlOjY=", "plainText": "3, 4 & 5 BHK"},
                    {"id": "QXR0cmlidXRlOjc=", "plainText": "Immediate"},
                    {"id": "QXR0cmlidXRlOjk=", "plainText": "4.2% p.a."},
                    {"id": "QXR0cmlidXRlOjEw", "plainText": "18-22%"}
                ]
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
                "productType": "'"$LUXURY_PRODUCT_TYPE"'",
                "attributes": [
                    {"id": "QXR0cmlidXRlOjE=", "plainText": "Dubai, UAE"},
                    {"id": "QXR0cmlidXRlOjI=", "plainText": "UAE"},
                    {"id": "QXR0cmlidXRlOjU=", "plainText": "8,500 - 15,000 Sq. Ft."},
                    {"id": "QXR0cmlidXRlOjY=", "plainText": "5 & 6 BHK"},
                    {"id": "QXR0cmlidXRlOjc=", "plainText": "Q4 2025"},
                    {"id": "QXR0cmlidXRlOjk=", "plainText": "5.8% p.a."},
                    {"id": "QXR0cmlidXRlOjEw", "plainText": "25-30%"}
                ]
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
                "productType": "'"$LUXURY_PRODUCT_TYPE"'",
                "attributes": [
                    {"id": "QXR0cmlidXRlOjE=", "plainText": "New York, USA"},
                    {"id": "QXR0cmlidXRlOjI=", "plainText": "USA"},
                    {"id": "QXR0cmlidXRlOjU=", "plainText": "3,200 - 5,800 Sq. Ft."},
                    {"id": "QXR0cmlidXRlOjY=", "plainText": "3 & 4 BHK"},
                    {"id": "QXR0cmlidXRlOjc=", "plainText": "Immediate"},
                    {"id": "QXR0cmlidXRlOjk=", "plainText": "3.8% p.a."},
                    {"id": "QXR0cmlidXRlOjEw", "plainText": "15-20%"}
                ]
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
                "productType": "'"$LUXURY_PRODUCT_TYPE"'",
                "attributes": [
                    {"id": "QXR0cmlidXRlOjE=", "plainText": "Los Angeles, USA"},
                    {"id": "QXR0cmlidXRlOjI=", "plainText": "USA"},
                    {"id": "QXR0cmlidXRlOjU=", "plainText": "18,500 Sq. Ft."},
                    {"id": "QXR0cmlidXRlOjY=", "plainText": "7 BHK + Staff Quarters"},
                    {"id": "QXR0cmlidXRlOjc=", "plainText": "Immediate"},
                    {"id": "QXR0cmlidXRlOjk=", "plainText": "2.5% p.a."},
                    {"id": "QXR0cmlidXRlOjEw", "plainText": "20-25%"}
                ]
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
                "productType": "'"$LUXURY_PRODUCT_TYPE"'",
                "attributes": [
                    {"id": "QXR0cmlidXRlOjE=", "plainText": "Singapore"},
                    {"id": "QXR0cmlidXRlOjI=", "plainText": "Singapore"},
                    {"id": "QXR0cmlidXRlOjU=", "plainText": "6,200 Sq. Ft."},
                    {"id": "QXR0cmlidXRlOjY=", "plainText": "4 BHK + Study"},
                    {"id": "QXR0cmlidXRlOjc=", "plainText": "Immediate"},
                    {"id": "QXR0cmlidXRlOjk=", "plainText": "3.2% p.a."},
                    {"id": "QXR0cmlidXRlOjEw", "plainText": "12-18%"}
                ]
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
                "productType": "'"$LUXURY_PRODUCT_TYPE"'",
                "attributes": [
                    {"id": "QXR0cmlidXRlOjE=", "plainText": "Monte Carlo, Monaco"},
                    {"id": "QXR0cmlidXRlOjI=", "plainText": "Monaco"},
                    {"id": "QXR0cmlidXRlOjU=", "plainText": "2,800 Sq. Ft."},
                    {"id": "QXR0cmlidXRlOjY=", "plainText": "3 BHK"},
                    {"id": "QXR0cmlidXRlOjc=", "plainText": "Immediate"},
                    {"id": "QXR0cmlidXRlOjk=", "plainText": "2.8% p.a."},
                    {"id": "QXR0cmlidXRlOjEw", "plainText": "15-20%"}
                ]
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
                "productType": "'"$LUXURY_PRODUCT_TYPE"'",
                "attributes": [
                    {"id": "QXR0cmlidXRlOjE=", "plainText": "Verbier, Switzerland"},
                    {"id": "QXR0cmlidXRlOjI=", "plainText": "Switzerland"},
                    {"id": "QXR0cmlidXRlOjU=", "plainText": "8,500 Sq. Ft."},
                    {"id": "QXR0cmlidXRlOjY=", "plainText": "6 BHK"},
                    {"id": "QXR0cmlidXRlOjc=", "plainText": "Immediate"},
                    {"id": "QXR0cmlidXRlOjk=", "plainText": "4.5% p.a."},
                    {"id": "QXR0cmlidXRlOjEw", "plainText": "10-15%"}
                ]
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
                "productType": "'"$LUXURY_PRODUCT_TYPE"'",
                "attributes": [
                    {"id": "QXR0cmlidXRlOjE=", "plainText": "Mumbai, India"},
                    {"id": "QXR0cmlidXRlOjI=", "plainText": "India"},
                    {"id": "QXR0cmlidXRlOjU=", "plainText": "4,500 - 8,000 Sq. Ft."},
                    {"id": "QXR0cmlidXRlOjY=", "plainText": "4 & 5 BHK"},
                    {"id": "QXR0cmlidXRlOjc=", "plainText": "Q2 2026"},
                    {"id": "QXR0cmlidXRlOjk=", "plainText": "2.8% p.a."},
                    {"id": "QXR0cmlidXRlOjEw", "plainText": "35-45%"}
                ]
            }
        }
    }'
echo ""

echo ""
echo "=== Verifying Created Products with Attributes ==="
curl -s -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "query": "query { products(first: 10) { edges { node { id name slug productType { name } attributes { attribute { name } values { plainText } } } } } }"
    }' | python3 -m json.tool 2>/dev/null || cat

echo ""
echo "=== Property creation with attributes complete! ==="
