
import json
import requests

# Configuration
SALEOR_URL = "http://localhost:8000/graphql/"
ADMIN_EMAIL = "superadmin@example.com"
ADMIN_PASSWORD = "admin123"

# Data from VaultConstruction.tsx
CONSTRUCTION_DATA = {
    "structureProgress": 80,
    "interiorProgress": 20,
    "overallProgress": 55,
    "lastUpdate": "2025-01-02",
    "milestones": [
        {"id": "1", "name": "Foundation Complete", "status": "completed", "date": "2024-06-15"},
        {"id": "2", "name": "Structure Complete", "status": "in-progress", "date": "2025-02-28"},
        {"id": "3", "name": "Interior Works", "status": "upcoming", "date": "2025-06-30"},
        {"id": "4", "name": "Handover", "status": "upcoming", "date": "2025-12-15"},
    ],
    "gallery": [
        {"id": "1", "url": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80", "date": "2025-01-02", "caption": "Structure Level 18 - Facade Installation"},
        {"id": "2", "url": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80", "date": "2024-12-15", "caption": "MEP Works in Progress"},
        {"id": "3", "url": "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&q=80", "date": "2024-11-30", "caption": "Lobby Area Framing"},
    ],
}

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

def update_product_metadata(token, slug, key, value_json):
    query = """
    mutation UpdateMetadata($id: ID!, $input: [MetadataInput!]!) {
      updateMetadata(id: $id, input: $input) {
        item {
          metadata {
            key
            value
          }
        }
        errors {
          message
        }
      }
    }
    """
    
    # First get Product ID
    product_query = """
    query {
      product(slug: "%s", channel: "default-channel") {
        id
        name
      }
    }
    """ % slug
    
    headers = {"Authorization": f"JWT {token}"}
    p_res = requests.post(SALEOR_URL, json={'query': product_query}, headers=headers)
    p_data = p_res.json()
    
    if not p_data.get('data') or not p_data['data'].get('product'):
        print(f"Product {slug} not found.")
        return

    product_id = p_data['data']['product']['id']
    print(f"Updating product: {p_data['data']['product']['name']} ({product_id})")

    variables = {
        "id": product_id,
        "input": [{
            "key": key,
            "value": json.dumps(value_json)
        }]
    }
    
    m_res = requests.post(SALEOR_URL, json={'query': query, 'variables': variables}, headers=headers)
    print("Update Response:", m_res.json())

if __name__ == "__main__":
    token = get_token()
    print("Authenticated.")
    
    # Update "palm-royale" or similar if exists. 
    # I'll try "palm-royale" first as it is in DEFAULT_PROPERTY_IMAGES
    update_product_metadata(token, "palm-royale", "construction_asset", CONSTRUCTION_DATA)
