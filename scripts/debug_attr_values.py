
import requests
import json

SALEOR_URL = "http://localhost:8000/graphql/"

QUERY = """
query {
  attributes(first: 50, search: "Amenities") {
    edges {
      node {
        id
        slug
        inputType
        choices(first: 20) {
          edges {
            node {
              id
              name
              slug
            }
          }
        }
      }
    }
  }
}
"""

def run_query():
    response = requests.post(SALEOR_URL, json={'query': QUERY})
    data = response.json()
    if 'data' in data and 'attributes' in data['data']:
        for edge in data['data']['attributes']['edges']:
            attr = edge['node']
            print(f"Attribute: {attr['slug']} ({attr['id']}) | Type: {attr['inputType']}")
            for val_edge in attr['choices']['edges']:
                val = val_edge['node']
                print(f"  - Value: '{val['name']}' (Slug: '{val['slug']}', ID: '{val['id']}')")

if __name__ == "__main__":
    run_query()
