import axios from "axios";

// const GRAPHQL_URL = 'http://localhost:8000/graphql/';
const GRAPHQL_URL = "https://api.theeyelevelstudio.com/graphql/";

export interface GraphQLResponse<T> {
  data: T;
  errors?: { message: string }[];
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await axios.post<GraphQLResponse<T>>(
    GRAPHQL_URL,
    { query, variables },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (response.data.errors && response.data.errors.length > 0) {
    throw new Error(response.data.errors[0].message);
  }

  return response.data.data;
}

// GraphQL Queries
export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first, channel: "default-channel") {
      edges {
        node {
          id
          name
          slug
          description
          productType {
            name
          }
          category {
            name
            slug
          }
          pricing {
            priceRange {
              start {
                gross {
                  amount
                }
              }
            }
          }
          attributes {
            attribute {
              name
              slug
            }
            values {
              name
              plainText
            }
          }
          metadata {
            key
            value
          }
          media {
            url
            alt
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_SLUG_QUERY = `
  query GetProductBySlug($slug: String!) {
    product(slug: $slug, channel: "default-channel") {
      id
      name
      slug
      description
      productType {
        name
      }
      category {
        name
        slug
      }
      pricing {
        priceRange {
          start {
            gross {
              amount
            }
          }
        }
      }
      attributes {
        attribute {
          name
          slug
        }
        values {
          name
          plainText
          file {
            url
            contentType
               }
        }
      }
      variants {
      id
      name
      sku
      pricing {
        price {
          gross {
            amount
            currency
          }
        }
      }
    }
      metadata {
        key
        value
      }
      media {
        url
        alt
      }
    }
  }
`;

// Response Types
export interface ProductAttribute {
  attribute: {
    name: string;
    slug: string;
  };
  values: {
    name: string;
    plainText: string | null;
    file?: {
      url: string;
      contentType: string;
    } | null;
  }[];
}

export interface ProductAttributeArray {
  attribute: {
    name: string;
    slug: string;
  };
  values: {
    name: string;
    plainText: string | null;
    file?: {
      url: string;
      contentType: string;
    } | null;
  }[];
}

export interface SaleorProductVariant {
  id: string;
  name: string;
  sku: string;
  pricing?: {
    price?: {
      gross?: {
        amount: number;
        currency: string;
      };
    };
  };
}

export interface SaleorProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productType: {
    name: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  pricing?: {
    priceRange: {
      start: {
        gross: {
          amount: number;
        };
      };
    };
  };
  attributes: ProductAttribute[];
  variants: SaleorProductVariant[];
  metadata: {
    key: string;
    value: string;
  }[];
  media?: {
    url: string;
    alt: string;
  }[];
}

export interface ProductsResponse {
  products: {
    edges: {
      node: SaleorProduct;
    }[];
  };
}

export interface ProductBySlugResponse {
  product: SaleorProduct | null;
}
