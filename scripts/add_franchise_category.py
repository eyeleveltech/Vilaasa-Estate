import requests
import json

SALEOR_API_URL = "http://localhost:8000/graphql/"
AUTH_EMAIL = "superadmin@example.com"
AUTH_PASS = "admin123"

def get_token():
    query = 'mutation { tokenCreate(email: "%s", password: "%s") { token } }' % (AUTH_EMAIL, AUTH_PASS)
    res = requests.post(SALEOR_API_URL, json={'query': query})
    return res.json()['data']['tokenCreate']['token']

TOKEN = get_token()
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def run_query(query, variables=None):
    res = requests.post(SALEOR_API_URL, json={'query': query, 'variables': variables}, headers=HEADERS)
    if res.status_code != 200 or 'errors' in res.json():
        print("Error:", res.text)
    return res.json()

# 1. Create Attribute "Franchise Category"
print("Creating Attribute...")
create_attr_query = """
mutation {
  attributeCreate(input: {
    name: "Franchise Category",
    slug: "franchise-category",
    type: PRODUCT_TYPE,
    inputType: DROPDOWN
  }) {
    attribute { id }
    errors { message }
  }
}
"""
# Check if exists
check_attr = run_query('query { attribute(slug: "franchise-category") { id } }')
if check_attr['data']['attribute']:
    ATTR_ID = check_attr['data']['attribute']['id']
    print(f"Attribute exists: {ATTR_ID}")
else:
    create_res = run_query(create_attr_query)
    ATTR_ID = create_res['data']['attributeCreate']['attribute']['id']
    print(f"Created Attribute: {ATTR_ID}")

# 2. Assign to Franchise Product Type
print("Assigning to Product Type...")
pt_res = run_query('query { productTypes(first: 20) { edges { node { id name } } } }')
PT_ID = next((e['node']['id'] for e in pt_res['data']['productTypes']['edges'] if e['node']['name'] == "Franchise"), None)

if PT_ID:
    assign_query = """
    mutation {
      productAttributeAssign(productTypeId: "%s", operations: [{id: "%s", type: PRODUCT}]) {
        errors { message }
      }
    }
    """ % (PT_ID, ATTR_ID)
    run_query(assign_query)

# 3. Create Values
print("Creating Values...")
VALUES = {
    "Wellness": None,
    "Spa": None,
    "Resort": None,
    "Saloon": None,
    "Hotel": None
}

for val in VALUES.keys():
    create_val_query = """
    mutation {
      attributeValueCreate(attribute: "%s", input: { name: "%s" }) {
        attributeValue { id }
        errors { message }
      }
    }
    """ % (ATTR_ID, val)
    # Check exists first (simple check via fetching all choices)
    # Lazy: Just try create, it might duplicate if run generic check fails, 
    # but I'll fetch choices to map names to IDs.
    pass

# Fetch all choices to get IDs
choices_res = run_query(f'query {{ attribute(id: "{ATTR_ID}") {{ choices(first: 50) {{ edges {{ node {{ id name }} }} }} }} }}')
for edge in choices_res['data']['attribute']['choices']['edges']:
    name = edge['node']['name']
    if name in VALUES:
        VALUES[name] = edge['node']['id']

# Create missing
for name, vid in VALUES.items():
    if not vid:
        res = run_query(f'mutation {{ attributeValueCreate(attribute: "{ATTR_ID}", input: {{ name: "{name}" }}) {{ attributeValue {{ id }} }} }}')
        VALUES[name] = res['data']['attributeValueCreate']['attributeValue']['id']

print(f"Values: {VALUES}")

# 4. Update Products
PRODUCTS = [
    ("wellness-resorts-kerala", "Wellness"),
    ("carlton-wellness-spa", "Spa"),
    ("colton-resort-chennai", "Resort"),
    ("luxe-saloon-mumbai", "Saloon"),
    ("zen-wellness-goa", "Wellness"),
    ("ayur-wellness-bangalore", "Wellness"),
    ("wellness-bangalore", "Hotel")
]

for slug, cat in PRODUCTS:
    print(f"Updating {slug} -> {cat}...")
    # Get Product ID
    p_res = run_query(f'query {{ product(slug: "{slug}") {{ id }} }}')
    if p_res['data']['product']:
        pid = p_res['data']['product']['id']
        val_id = VALUES[cat]
        update_query = """
        mutation {
            productUpdate(id: "%s", input: {
                attributes: [{id: "%s", dropdown: {value: "%s"}}]
            }) {
                product { id }
                errors { message }
            }
        }
        """ % (pid, ATTR_ID, val_id)
        run_query(update_query)
        print("Updated.")
    else:
        print("Product not found.")
