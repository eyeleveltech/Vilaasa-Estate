
import requests
import json

SALEOR_URL = "http://localhost:8000/graphql/"
ADMIN_EMAIL = "superadmin@example.com"
ADMIN_PASSWORD = "admin123"

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

QUERY = """
query {
  products(first: 100) {
    edges {
      node {
        name
        slug
        id
      }
    }
  }
}
"""

def run_query(token):
    headers = {"Authorization": f"JWT {token}"}
    response = requests.post(SALEOR_URL, json={'query': QUERY}, headers=headers) # Using AUTH just in case
    data = response.json()
    
    if 'data' in data and 'products' in data['data']:
        for edge in data['data']['products']['edges']:
            p = edge['node']
            print(f"Slug: {p['slug']} | Name: {p['name']} | ID: {p['id']}")
    else:
        print("Error or no data:", data)

if __name__ == "__main__":
    token = get_token()
    run_query(token)
