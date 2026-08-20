
import requests
import json

SALEOR_URL = "http://localhost:8000/graphql/"

QUERY = """
query {
  products(first: 50, channel: "default-channel", search: "Ayur") {
    edges {
      node {
        name
        slug
      }
    }
  }
}
"""

def run_query():
    response = requests.post(SALEOR_URL, json={'query': QUERY})
    if response.status_code != 200:
        print("Error fetching data:", response.status_code)
        return

    data = response.json()
    if 'errors' in data:
        print("GraphQL Errors:", data['errors'])
        return

    products = data['data']['products']['edges']
    for edge in products:
        product = edge['node']
        print(f"Slug: {product['slug']} | Name: {product['name']}")

if __name__ == "__main__":
    run_query()
