
import requests
import json

SALEOR_URL = "http://localhost:8000/graphql/"
ADMIN_EMAIL = "superadmin@example.com"
ADMIN_PASSWORD = "admin123"

PRODUCT_TYPE_SLUG = "property" # Assuming there is a product type slug, or I'll need to find it.
# Actually I need to add the attribute to the Product Type too.

def get_token():
    query = """
    mutation {
      tokenCreate(email: "%s", password: "%s") {
        token
      }
    }
    """ % (ADMIN_EMAIL, ADMIN_PASSWORD)
    response = requests.post(SALEOR_URL, json={'query': query})
    return response.json()['data']['tokenCreate']['token']

def run_setup(token):
    headers = {"Authorization": f"JWT {token}"}
    
    # 1. Find existing Amenities attribute ID
    print("Finding existing Amenities attribute...")
    query = """
    query {
      attributes(first: 1, search: "Amenities") {
        edges {
          node {
            id
            slug
          }
        }
      }
    }
    """
    res = requests.post(SALEOR_URL, json={'query': query}, headers=headers)
    data = res.json()
    existing_id = None
    if data['data']['attributes']['edges']:
        existing_id = data['data']['attributes']['edges'][0]['node']['id']
        print(f"Found existing Amenities attribute: {existing_id}")
        
    # 2. Delete if exists
    if existing_id:
        print("Deleting old attribute...")
        mut = """
        mutation($id: ID!) {
          attributeDelete(id: $id) {
            errors { message }
          }
        }
        """
        requests.post(SALEOR_URL, json={'query': mut, 'variables': {'id': existing_id}}, headers=headers)

    # 3. Create new Attribute
    print("Creating new Amenities attribute (MULTISELECT)...")
    create_mut = """
    mutation AttributeCreate($input: AttributeCreateInput!) {
      attributeCreate(input: $input) {
        attribute {
          id
          slug
        }
        errors {
          message
          field
        }
      }
    }
    """
    input_data = {
        "name": "Amenities",
        "slug": "amenities",
        "type": "PRODUCT_TYPE",
        "inputType": "MULTISELECT",
        "valueRequired": False # Optional
    }
    res = requests.post(SALEOR_URL, json={'query': create_mut, 'variables': {'input': input_data}}, headers=headers)
    new_attr_data = res.json()['data']['attributeCreate']
    if new_attr_data['errors']:
        print("Error creating attribute:", new_attr_data['errors'])
        return
        
    attr_id = new_attr_data['attribute']['id']
    print(f"Created Amenities attribute: {attr_id}")
    
    # 4. Create Values
    values = ["Swimming Pool", "Fitness Center", "Spa & Wellness", "24/7 Security", 
              "Concierge Service", "Private Parking", "Smart Home System", "Rooftop Garden"]
    
    print("Creating values...")
    val_map = {}
    for val in values:
        val_mut = """
        mutation AttributeValueCreate($id: ID!, $input: AttributeValueCreateInput!) {
          attributeValueCreate(attribute: $id, input: $input) {
            attributeValue {
              id
              name
              slug
            }
            errors { message }
          }
        }
        """
        vres = requests.post(SALEOR_URL, json={'query': val_mut, 'variables': {'id': attr_id, 'input': {'name': val}}}, headers=headers)
        if 'data' in vres.json() and vres.json()['data']['attributeValueCreate']['attributeValue']:
             v_obj = vres.json()['data']['attributeValueCreate']['attributeValue']
             val_map[val] = v_obj['id']
             print(f"  - Created {val}")
        else:
             print(f"  - Error creating {val}: {vres.json()}")

    # 5. Assign Attribute to Product Type "Property" (or whatever the main type is)
    # I need to find the product type ID first.
    print("Finding Product Type 'Property'...")
    pt_query = """
    query {
      productTypes(first: 20) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
    """
    pt_res = requests.post(SALEOR_URL, json={'query': pt_query}, headers=headers)
    if 'data' not in pt_res.json():
         print("Error fetching productTypes:", pt_res.json())
         return

    pt_id = None
    # Look for "Property" or "Default Type" or similar
    for edge in pt_res.json()['data']['productTypes']['edges']:
        pt = edge['node']
        print(f"Checking Product Type: {pt['name']}")
        if "Property" in pt['name'] or "Default" in pt['name']:
             pt_id = pt['id']
             break
    
    # If not found, just take the first one?
    if not pt_id and pt_res.json()['data']['productTypes']['edges']:
         pt_id = pt_res.json()['data']['productTypes']['edges'][0]['node']['id']

    if pt_id:
        print(f"Found Product Type: {pt_id}")
    
    if pt_id:
        print("Assigning attribute to Product Type...")
        assign_mut = """
        mutation AttributeAssign($productTypeId: ID!, $operations: [ProductAttributeAssignInput!]!) {
          productAttributeAssign(productTypeId: $productTypeId, operations: $operations) {
            errors { message }
          }
        }
        """
        # Note: operations expect IDs.
        ops = [{"id": attr_id, "type": "PRODUCT"}] 
        requests.post(SALEOR_URL, json={'query': assign_mut, 'variables': {'productTypeId': pt_id, 'operations': ops}}, headers=headers)
    
    # 6. Assign Default Amenities to All Products
    # To save time, I'll assign ALL created values to ALL products for now, or a subset.
    # Let's assign 4 random ones to "The Aurum Residence" and "Palm Royale Villa" specifically to test.
    
    print("Assigning amenities to products...")
    # Get specific products
    p_query = """
    query {
      products(first: 50, channel: "default-channel") {
        edges {
           node { id name } 
        }
      }
    }
    """
    p_res = requests.post(SALEOR_URL, json={'query': p_query}, headers=headers)
    products = p_res.json()['data']['products']['edges']
    
    # Values to assign (IDs)
    pool_id = val_map.get("Swimming Pool")
    gym_id = val_map.get("Fitness Center")
    security_id = val_map.get("24/7 Security")
    spa_id = val_map.get("Spa & Wellness")
    
    default_ids = [v for v in [pool_id, gym_id, security_id, spa_id] if v]
    
    for edge in products:
        prod = edge['node']
        print(f"Updating {prod['name']}...")
        update_mut = """
        mutation UpdateProduct($id: ID!, $attributes: [AttributeValueInput!]!) {
          productUpdate(id: $id, input: { attributes: $attributes }) {
            errors { message }
          }
        }
        """
        # Assign default set
        attrs = [{"id": attr_id, "values": default_ids}]
        requests.post(SALEOR_URL, json={'query': update_mut, 'variables': {'id': prod['id'], 'attributes': attrs}}, headers=headers)

if __name__ == "__main__":
    token = get_token()
    run_setup(token)
