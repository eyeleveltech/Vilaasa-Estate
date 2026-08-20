
import requests
import json

SALEOR_URL = "http://localhost:8000/graphql/"
ADMIN_EMAIL = "superadmin@example.com"
ADMIN_PASSWORD = "admin123"

# Constants
BAD_VAL_UNDER_CONST = "QXR0cmlidXRlVmFsdWU6MTc2"
BAD_VAL_READY = "QXR0cmlidXRlVmFsdWU6MTgw"

REAL_VAL_UNDER_CONST = "QXR0cmlidXRlVmFsdWU6NQ=="
REAL_VAL_READY = "QXR0cmlidXRlVmFsdWU6NA=="

STATUS_ATTR_ID = "QXR0cmlidXRlOjQ="

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
    
    products_to_fix_const = []
    products_to_fix_ready = []
    
    for edge in products:
        prod = edge['node']
        for attr in prod['attributes']:
            if attr['attribute']['slug'] == 'status':
                for val in attr['values']:
                    if val['id'] == BAD_VAL_UNDER_CONST:
                        products_to_fix_const.append(prod)
                    elif val['id'] == BAD_VAL_READY:
                        products_to_fix_ready.append(prod)
                        
    print(f"Found {len(products_to_fix_const)} products with bad 'Under Construction'.")
    print(f"Found {len(products_to_fix_ready)} products with bad 'Ready to Move'.")
    
    def update_products(prods, correct_val_id):
        for prod in prods:
            print(f"Fixing {prod['name']} -> {correct_val_id}...")
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
                        "id": STATUS_ATTR_ID,
                        "values": [correct_val_id]
                    }
                ]
            }
            res = requests.post(SALEOR_URL, json={'query': mutation, 'variables': variables}, headers=headers)
            print(res.json())

    update_products(products_to_fix_const, REAL_VAL_UNDER_CONST)
    update_products(products_to_fix_ready, REAL_VAL_READY)
        
    print("Deleting bad attribute values...")
    def delete_val(val_id):
        del_mutation = """
        mutation DeleteValue($id: ID!) {
          attributeValueDelete(id: $id) {
            errors {
              message
            }
          }
        }
        """
        res = requests.post(SALEOR_URL, json={'query': del_mutation, 'variables': {'id': val_id}}, headers=headers)
        print(f"Delete {val_id} result:", res.json())

    delete_val(BAD_VAL_UNDER_CONST)
    delete_val(BAD_VAL_READY)

if __name__ == "__main__":
    token = get_token()
    run_fix(token)
