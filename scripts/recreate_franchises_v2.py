import requests
import json
import re

SALEOR_API_URL = "http://localhost:8000/graphql/"
AUTH_EMAIL = "superadmin@example.com"
AUTH_PASS = "admin123"

# Authentication
def get_token():
    query = """
    mutation {
      tokenCreate(email: "%s", password: "%s") {
        token
      }
    }
    """ % (AUTH_EMAIL, AUTH_PASS)
    response = requests.post(SALEOR_API_URL, json={'query': query})
    data = response.json()
    return data['data']['tokenCreate']['token']

TOKEN = get_token()
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def run_query(query, variables=None):
    payload = {'query': query}
    if variables:
        payload['variables'] = variables
    response = requests.post(SALEOR_API_URL, json=payload, headers=HEADERS)
    if response.status_code != 200:
        raise Exception(f"Query failed: {response.text}")
    return response.json()

# IDs
PROPERTY_TYPE_ATTR = "QXR0cmlidXRlOjM="
STATUS_ATTR = "QXR0cmlidXRlOjQ="
LOCATION_ATTR = "QXR0cmlidXRlOjE="
COUNTRY_ATTR = "QXR0cmlidXRlOjI="
YIELD_ATTR = "QXR0cmlidXRlOjk="

# Fetch Category ID (Real Estate)
cat_res = run_query('query { category(slug: "real-estate") { id } }')
CATEGORY_ID = cat_res['data']['category']['id']
print(f"Category ID: {CATEGORY_ID}")

# Fetch Product Type (Franchise)
pt_res = run_query('query { productTypes(first: 20) { edges { node { id name } } } }')
FRANCHISE_PT_ID = next((edge['node']['id'] for edge in pt_res['data']['productTypes']['edges'] if edge['node']['name'] == "Franchise"), None)
print(f"Franchise Product Type ID: {FRANCHISE_PT_ID}")

if not FRANCHISE_PT_ID:
    print("Franchise Product Type not found! Check previous steps.")
    exit(1)

# Ensure Attributes Assigned
assign_query = """
mutation {
  productAttributeAssign(productTypeId: "%s", operations: [
    { id: "%s", type: PRODUCT },
    { id: "%s", type: PRODUCT },
    { id: "%s", type: PRODUCT },
    { id: "%s", type: PRODUCT },
    { id: "%s", type: PRODUCT }
  ]) {
    productType { id }
    errors { message }
  }
}
""" % (FRANCHISE_PT_ID, LOCATION_ATTR, COUNTRY_ATTR, PROPERTY_TYPE_ATTR, STATUS_ATTR, YIELD_ATTR)
# run_query(assign_query) # Assuming assigned, but safe to skip if mostly setup

# Fetch Attribute Value IDs (Correct ones)
def get_attr_value_id(attr_id, value_name):
    res = run_query(f'query {{ attribute(id: "{attr_id}") {{ choices(first: 50) {{ edges {{ node {{ id name slug }} }} }} }} }}')
    for edge in res['data']['attribute']['choices']['edges']:
        if edge['node']['name'] == value_name:
            return edge['node']['id']
    return None

FRANCHISE_VAL_ID = get_attr_value_id(PROPERTY_TYPE_ATTR, "Franchise")
READY_VAL_ID = get_attr_value_id(STATUS_ATTR, "Ready to Move")
UNDER_CONST_VAL_ID = get_attr_value_id(STATUS_ATTR, "Under Construction")

print(f"Franchise Val ID: {FRANCHISE_VAL_ID}")
print(f"Ready Val ID: {READY_VAL_ID}")

# Fetch Channel ID
chan_res = run_query('{ channels { id } }')
CHANNEL_ID = chan_res['data']['channels'][0]['id']

def create_franchise(name, slug, location, subtype, price, roi, status_txt, features):
    print(f"Processing {name}...")
    
    # Check exists
    prod_check = run_query(f'query {{ product(slug: "{slug}") {{ id }} }}')
    if prod_check['data']['product']:
        old_id = prod_check['data']['product']['id']
        print(f"Deleting existing {old_id}...")
        run_query(f'mutation {{ productDelete(id: "{old_id}") {{ product {{ id }} }} }}')

    status_val = UNDER_CONST_VAL_ID if status_txt == "Opening 2025" else READY_VAL_ID
    
    # Construct Description (Rich Text)
    # Using simple paragraphs for better compatibility but structured.
    description_json = {
        "blocks": [
            {
                "type": "header",
                "data": {"text": "Franchise Overview", "level": 2}
            },
            {
                "type": "paragraph", 
                "data": {"text": f"This is a premium {subtype} opportunity located in {location}."}
            },
            {
                "type": "header",
                "data": {"text": "Key Highlights", "level": 3}
            },
            {
                "type": "list",
                "data": {
                    "style": "unordered",
                    "items": [f.strip() for f in features.split(',')]
                }
            },
            {
                "type": "paragraph",
                "data": {"text": f"Expected ROI: {roi}"}
            }
        ]
    }
    
    variables = {
        "input": {
            "name": name,
            "slug": slug,
            "category": CATEGORY_ID,
            "productType": FRANCHISE_PT_ID,
            "description": json.dumps(description_json),
            "attributes": [
                {"id": LOCATION_ATTR, "plainText": location},
                {"id": COUNTRY_ATTR, "plainText": "India"},
                {"id": PROPERTY_TYPE_ATTR, "dropdown": {"value": FRANCHISE_VAL_ID}},
                {"id": STATUS_ATTR, "dropdown": {"value": status_val}},
                {"id": YIELD_ATTR, "plainText": roi}
            ]
        }
    }
    
    create_query = """
    mutation CreateProduct($input: ProductCreateInput!) {
      productCreate(input: $input) {
        product { id }
        errors { field message }
      }
    }
    """
    res = run_query(create_query, variables)
    if 'errors' in res['data']['productCreate'] and res['data']['productCreate']['errors']:
        print("Error creating product:", res['data']['productCreate']['errors'])
        return

    product_id = res['data']['productCreate']['product']['id']
    print(f"Created Product: {product_id}")
    
    # Create Variant
    var_query = """
    mutation {
        productVariantCreate(input: { product: "%s", sku: "%s-default", attributes: [] }) {
            productVariant { id }
            errors { message } 
        }
    }
    """ % (product_id, slug)
    var_res = run_query(var_query)
    
    if var_res['data']['productVariantCreate']['productVariant']:
        var_id = var_res['data']['productVariantCreate']['productVariant']['id']
        
        # Price
        price_query = """
        mutation {
            productVariantChannelListingUpdate(id: "%s", input: [{ channelId: "%s", price: %s, costPrice: %s }]) {
                variant { id }
                errors { message }
            }
        }
        """ % (var_id, CHANNEL_ID, price, price)
        run_query(price_query)
        
        # Publish
        pub_query = """
        mutation {
            productChannelListingUpdate(id: "%s", input: { updateChannels: [{ channelId: "%s", isPublished: true, isAvailableForPurchase: true, availableForPurchaseAt: "2025-01-01T00:00:00+00:00", visibleInListings: true }] }) {
                product { id } 
            }
        }
        """ % (product_id, CHANNEL_ID)
        run_query(pub_query)

# Data
franchises = [
    ("Wellness Resorts", "wellness-resorts-kerala", "Kerala & Pondicherry", "Wellness Resort", 7000000, "24% annually", "Opening 2025", "Authentic Ayurvedic treatments, Yoga & meditation programs, Transformative wellness journeys, 5000+ years healing wisdom"),
    ("Carlton Wellness Spa", "carlton-wellness-spa", "Integrated Across All Properties", "Spa", 7000000, "26% annually", "Available Now", "Bespoke wellness treatments, Ayurvedic & contemporary therapies, Available at all properties, Signature Carlton experiences"),
    ("Colton Beach Resort", "colton-resort-chennai", "Chennai ECR", "Resort", 7000000, "22% annually", "Available Now", "Beachfront location, Premium amenities, FOCO model"),
    ("Luxe Premium Saloon", "luxe-saloon-mumbai", "Mumbai, Delhi, Bangalore", "Saloon", 7000000, "28% annually", "Available Now", "European techniques, Premium clientele, Monthly payouts"),
    ("Zen Wellness Spa", "zen-wellness-goa", "Goa, Kerala, Rishikesh", "Wellness", 70300000, "25% annually", "Available Now", "Holistic wellness, Ayurveda + modern spa, Retreat packages"),
    ("Ayur Wellness Center", "ayur-wellness-bangalore", "Bangalore, Chennai, Pune", "Wellness", 9000000, "30% annually", "Available Now", "Medical wellness, Subscription model, Doctor network"),
    ("Ayur Wellness Center Hotel", "wellness-bangalore", "Bangalore, Chennai, Pune", "Hotel", 7000000, "30% annually", "Available Now", "Medical wellness, Subscription model, Doctor network, Hotel")
]

for f in franchises:
    create_franchise(*f)
