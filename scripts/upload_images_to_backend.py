
import requests
import json
import os

SALEOR_URL = "http://localhost:8000/graphql/"
ADMIN_EMAIL = "superadmin@example.com"
ADMIN_PASSWORD = "admin123"

# Mapping from slug to URL (Same as DEFAULT_PROPERTY_IMAGES in src/types/property.ts)
IMAGE_MAP = {
    'the-aurum': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
    'palm-royale': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80',
    'manhattan-heights': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&q=80',
    'beverly-estate': 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80',
    'marina-bay-penthouse': 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1920&q=80',
    'monaco-harbour': 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1920&q=80',
    'swiss-alps-chalet': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80',
    'mumbai-sea-link': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1920&q=80',
    # Franchises (Corrected Slugs)
    'wellness-resorts-kerala': 'https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?w=1920&q=80',
    'ayur-wellness-bangalore': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80',
    'carlton-wellness-spa': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&q=80',
    'colton-resort-chennai': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80',
    'luxe-saloon-mumbai': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80',
    'wellness-bangalore': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&q=80',
    'zen-wellness-goa': 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=1920&q=80',
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
    if 'data' not in response.json():
        print("Auth failed:", response.json())
        exit(1)
    return response.json()['data']['tokenCreate']['token']

def get_product_id(token, slug):
    query = """
    query GetProduct($slug: String!) {
      product(slug: $slug, channel: "default-channel") {
        id
        media { id }
      }
    }
    """
    headers = {"Authorization": f"JWT {token}"}
    response = requests.post(SALEOR_URL, json={'query': query, 'variables': {'slug': slug}}, headers=headers)
    data = response.json()
    if data.get('data') and data['data'].get('product'):
        return data['data']['product']
    return None

def upload_image(token, product_id, image_url, alt_text):
    # 1. Download image
    try:
        img_resp = requests.get(image_url)
        if img_resp.status_code != 200:
            print(f"Failed to download image from {image_url}")
            return
    except Exception as e:
        print(f"Error downloading {image_url}: {e}")
        return

    # 2. Upload to Saleor
    # For file upload, we use multipart/form-data with 'operations', 'map', and the file.
    
    mutation = """
    mutation ProductMediaCreate($product: ID!, $image: Upload!, $alt: String!) {
      productMediaCreate(input: { product: $product, image: $image, alt: $alt }) {
        media {
          id
          url
        }
        errors {
          message
        }
      }
    }
    """
    
    operations = json.dumps({
        "query": mutation,
        "variables": {
            "product": product_id,
            "image": None, # Handled by map
            "alt": alt_text
        }
    })
    
    file_map = json.dumps({"0": ["variables.image"]})
    
    files = {
        "0": ("image.jpg", img_resp.content, "image/jpeg")
    }
    
    headers = {"Authorization": f"JWT {token}"}
    # Note: Do not set Content-Type header when using files parameter in requests, it sets multipart boundary automatically.
    
    response = requests.post(
        SALEOR_URL,
        data={"operations": operations, "map": file_map},
        files=files,
        headers=headers
    )
    
    print(f"Upload response: {response.json()}")

if __name__ == "__main__":
    token = get_token()
    print("Authenticated.")
    
    for slug, url in IMAGE_MAP.items():
        print(f"Processing {slug}...")
        product_data = get_product_id(token, slug)
        
        if not product_data:
            print(f"Product {slug} not found.")
            continue
            
        # Check if media already exists?
        # If media list is empty, upload.
        if len(product_data['media']) == 0:
            print(f"Uploading image for {slug}...")
            upload_image(token, product_data['id'], url, f"Image for {slug}")
        else:
            print(f"Media already exists for {slug}, skipping.")
