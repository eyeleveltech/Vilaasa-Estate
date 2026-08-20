#!/bin/bash

# Saleor GraphQL Endpoint
SALEOR_API_URL="http://localhost:8000/graphql/"

# List of AttributeValue IDs to delete (Property Type Duplicates)
# These were identified as unused duplicates (e.g. residential-2, luxury-villa-5, etc.)
IDS_TO_DELETE=(
  "QXR0cmlidXRlVmFsdWU6MTMx"
  "QXR0cmlidXRlVmFsdWU6MTM1"
)

AUTH_TOKEN=$(curl -s -X POST "$SALEOR_API_URL" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { tokenCreate(email: \"superadmin@example.com\", password: \"admin123\") { token } }"}' | grep -o '"token": "[^"]*"' | cut -d'"' -f4)

if [ -z "$AUTH_TOKEN" ]; then
  echo "Authentication failed!"
  exit 1
fi

echo "Authenticated with token: $AUTH_TOKEN"

for ID in "${IDS_TO_DELETE[@]}"; do
  echo "Deleting AttributeValue ID: $ID"
  
  RESPONSE=$(curl -s -X POST "$SALEOR_API_URL" \
    -H "Authorization: JWT $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"mutation { attributeValueDelete(id: \\\"$ID\\\") { attributeValue { id slug } errors { field message } } }\"}")
  
  echo "Response: $RESPONSE"
done

echo "Deletion complete."
