
import requests
import json

SALEOR_URL = "http://localhost:8000/graphql/"
ADMIN_EMAIL = "superadmin@example.com"
ADMIN_PASSWORD = "admin123"

# Constants
BAD_VALUE_ID = "QXR0cmlidXRlVmFsdWU6MTc1"
CORRECT_VALUE_ID = "QXR0cmlidXRlVmFsdWU6MTI2" # Franchise
PROPERTY_TYPE_ATTR_ID = "QXR0cmlidXRlOjM=" # From debug output

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

def run_fix(token):
    headers = {"Authorization": f"JWT {token}"}
    
    # 1. Find products using the BAD ID
    # Note: filtering by attribute value in GraphQL might be tricky without a specific filter input,
    # so I'll iterate all products and check
    print("Scanning products...")
    query = """
    query {
      products(first: 100, channel: "default-channel") {
        edges {
          node {
            id
            name
            attributes {
              attribute { slug }
              values { id name }
            }
          }
        }
      }
    }
    """
    res = requests.post(SALEOR_URL, json={'query': query}, headers=headers)
    products = res.json()['data']['products']['edges']
    
    products_to_fix = []
    for edge in products:
        prod = edge['node']
        for attr in prod['attributes']:
            if attr['attribute']['slug'] == 'property-type':
                for val in attr['values']:
                    if val['id'] == BAD_VALUE_ID:
                        products_to_fix.append(prod)
                        
    print(f"Found {len(products_to_fix)} products with bad value.")
    
    # 2. Update each product to use CORRECT_VALUE_ID
    # Since I cannot easily "replace" via mutation without re-assigning, I'll use productAttributeAssign/Unassign or Update?
    # ProductUpdate input attributes uses `values` (list of strings, usually slugs or IDs depending on setup).
    # But usually `productAttributeAssign` is for *types*.
    # To update a *product's* attribute value, we use `productUpdate`.
    
    for prod in products_to_fix:
        print(f"Fixing {prod['name']}...")
        mutation = """
        mutation UpdateProduct($id: ID!, $attributes: [AttributeValueInput!]!) {
          productUpdate(id: $id, input: { attributes: $attributes }) {
            product {
              id
              name
            }
            errors {
              message
            }
          }
        }
        """
        variables = {
            "id": prod['id'],
            "attributes": [
                {
                    "id": PROPERTY_TYPE_ATTR_ID,
                    "values": [CORRECT_VALUE_ID] # or slug "franchise"? Try ID first.
                }
            ]
        }
        res = requests.post(SALEOR_URL, json={'query': mutation, 'variables': variables}, headers=headers)
        print(res.json())
        
    # 3. Delete the bad value
    print("Deleting bad attribute value...")
    del_mutation = """
    mutation DeleteValue($id: ID!) {
      attributeValueDelete(id: $id) {
        errors {
          message
        }
      }
    }
    """
    res = requests.post(SALEOR_URL, json={'query': del_mutation, 'variables': {'id': BAD_VALUE_ID}}, headers=headers)
    print("Delete result:", res.json())

if __name__ == "__main__":
    token = get_token()
    run_fix(token)
