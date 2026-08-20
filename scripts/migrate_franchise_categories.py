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
    if res.status_code != 200:
        print("HTTP Error:", res.text)
        return None
    return res.json()

# 1. Create Parent Category "Franchises"
print("Setting up Categories...")
# Check if exists
cat_res = run_query('query { categories(first: 20) { edges { node { id name slug } } } }')
PARENT_ID = next((e['node']['id'] for e in cat_res['data']['categories']['edges'] if e['node']['slug'] == "franchises"), None)

if not PARENT_ID:
    print("Creating Parent 'Franchises'...")
    create_res = run_query('mutation { categoryCreate(input: { name: "Franchises", slug: "franchises" }) { category { id } } }')
    PARENT_ID = create_res['data']['categoryCreate']['category']['id']
print(f"Parent Category: {PARENT_ID}")

# 2. Create Subcategories and Map Products
MAPPING = {
    "wellness": ["wellness-resorts-kerala", "zen-wellness-goa", "ayur-wellness-bangalore"],
    "spa": ["carlton-wellness-spa"],
    "resort": ["colton-resort-chennai"],
    "saloon": ["luxe-saloon-mumbai"],
    "hotel": ["wellness-bangalore"]
}

# Values from previous step were capitalized (Wellness, Spa...), but logic implies handling slugs or names. 
# I will create proper Display Name categories.

CATEGORY_NAMES = {
    "wellness": "Wellness",
    "spa": "Spa",
    "resort": "Resort",
    "saloon": "Saloon",
    "hotel": "Hotel"
}

for key, products in MAPPING.items():
    cat_name = CATEGORY_NAMES[key]
    cat_slug = f"franchise-{key}"
    
    # Check/Create Subcategory
    sub_id = None
    # Assuming we can just create and catch error or check existing (lazy check in this script for speed)
    # Better to check if existing under parent, but global slug check is enough
    
    sub_res = run_query(f'query {{ category(slug: "{cat_slug}") {{ id }} }}')
    if sub_res['data']['category']:
        sub_id = sub_res['data']['category']['id']
    else:
        print(f"Creating {cat_name}...")
        # Fix: parent is a separate argument, not inside input
        c_res = run_query(f'mutation {{ categoryCreate(parent: "{PARENT_ID}", input: {{ name: "{cat_name}", slug: "{cat_slug}" }}) {{ category {{ id }} }} }}')
        
        if 'errors' in c_res['data']['categoryCreate'] and c_res['data']['categoryCreate']['errors']:
             print("Error creating category:", c_res['data']['categoryCreate']['errors'])
             continue
             
        sub_id = c_res['data']['categoryCreate']['category']['id']
    
    print(f"Category {cat_name}: {sub_id}")
    
    # Move Products
    for prod_slug in products:
        print(f"Moving {prod_slug} to {cat_name}...")
        p_res = run_query(f'query {{ product(slug: "{prod_slug}") {{ id }} }}')
        if p_res['data']['product']:
            pid = p_res['data']['product']['id']
            # Update Category
            run_query(f'mutation {{ productUpdate(id: "{pid}", input: {{ category: "{sub_id}" }}) {{ product {{ id }} }} }}')
        else:
            print(f"Product {prod_slug} not found.")

# 3. Remove "Franchise Category" Attribute
print("Cleaning up old attribute...")
attr_res = run_query('query { attribute(slug: "franchise-category") { id } }')
if attr_res['data']['attribute']:
    attr_id = attr_res['data']['attribute']['id']
    
    # Unassign from Product Type first?
    # Actually deleting the attribute automatically unassigns it.
    print(f"Deleting attribute {attr_id}...")
    run_query(f'mutation {{ attributeDelete(id: "{attr_id}") {{ attribute {{ id }} }} }}')

print("Migration Done.")
