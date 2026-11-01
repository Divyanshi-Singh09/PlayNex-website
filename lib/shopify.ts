/** Shopify Storefront API. All credentials and GraphQL calls stay on the server. */

export type Money = { amount: string; currencyCode: string };
export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number;
  price: Money;
  selectedOptions: { name: string; value: string }[];
};

export type StoreProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  images: { url: string; altText: string | null }[];
  image: string | null;
  alt: string;
  price: string | null;
  currency: string;
  available: boolean;
  variantId: string | null;
  variants: Variant[];
  vendor: string;
  productType: string;
  tags: string[];
  collectionHandles: string[];
};

const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/$/, '');
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || '2024-10';

export const shopifyEnabled = Boolean(domain && token);
export const SHOPIFY_ORIGINALS_HANDLE = process.env.SHOPIFY_ORIGINALS_COLLECTION || 'playnex-product';
export const SHOPIFY_DISCOVER_HANDLE = process.env.SHOPIFY_DISCOVER_COLLECTION || 'dropship-products';

// Collection handles recognized as Dropship / Discover products
export const DISCOVER_COLLECTION_HANDLES = [
  'dropship-products',
  'dropship',
  'dropshipped',
  'dropshipping',
  'dropshipped-products',
  'playnex-discover',
  'discover',
  'curated'
];

// Collection handles recognized as Official PlayNex products
export const PLAYNEX_COLLECTION_HANDLES = [
  'playnex-product',
  'playnex-products',
  'playnex-originals',
  'originals',
  'playnex'
];

// Flexible tags & collection identifiers that designate a product as a Dropshipped / Discover item
export const DROPSHIP_TAGS = ['dropship', 'dropshipped', 'discover', 'curated', 'partner', 'thirdparty'];

/** Check whether a product belongs to Discover / Dropshipped (by collection, tag, vendor, or product type) */
export function isDiscoverProduct(product: {
  tags?: string[];
  collectionHandles?: string[];
  vendor?: string;
  productType?: string;
} | null | undefined): boolean {
  if (!product) return false;

  // 1. Check collection handles (e.g. dropship-products, playnex-discover, discover, dropship)
  const inDiscoverCollection = product.collectionHandles?.some((h) => {
    const clean = h.toLowerCase().trim();
    return (
      DISCOVER_COLLECTION_HANDLES.includes(clean) ||
      clean === SHOPIFY_DISCOVER_HANDLE.toLowerCase().trim()
    );
  });
  if (inDiscoverCollection) return true;

  // 2. Check tags (e.g. "dropship", "discover", "curated")
  const hasDropshipTag = product.tags?.some((t) =>
    DROPSHIP_TAGS.includes(t.toLowerCase().trim())
  );
  if (hasDropshipTag) return true;

  // 3. Check productType or vendor
  if (product.productType && DROPSHIP_TAGS.includes(product.productType.toLowerCase().trim())) {
    return true;
  }

  return false;
}

export function formatPrice(amount: number | string | null | undefined, currency = 'INR'): string {
  if (amount === null || amount === undefined || amount === '') return 'Contact for price';
  const num = typeof amount === 'string' ? Number(amount) : amount;
  if (isNaN(num)) return 'Contact for price';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: currency === 'INR' ? 0 : 2
  }).format(num);
}

function validateConfig() {
  if (!domain || !token || !/^([a-z0-9-]+\.)+myshopify\.com$/i.test(domain)) {
    throw new Error('Shopify store domain or token is not configured correctly');
  }
}

export type StorefrontCache = { revalidate: number; tags: string[] };

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  buyerIp?: string,
  cacheSettings?: StorefrontCache
): Promise<T> {
  validateConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token!
  };
  if (buyerIp && /^[\d.:a-fA-F]{3,45}$/.test(buyerIp)) {
    headers['Shopify-Storefront-Buyer-IP'] = buyerIp;
  }

  const isDev = process.env.NODE_ENV === 'development';
  const response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    ...(isDev
      ? { cache: 'no-store' as const }
      : cacheSettings
      ? { next: { revalidate: cacheSettings.revalidate, tags: cacheSettings.tags } }
      : { cache: 'no-store' as const }),
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok) throw new Error(`Shopify HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((x: { message: string }) => x.message).join('; '));
  }
  return payload.data as T;
}

const cardSelection = `
  id
  handle
  title
  description
  vendor
  productType
  tags
  availableForSale
  collections(first: 10) { nodes { handle } }
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 1) { nodes { url altText } }
  variants(first: 1) {
    nodes {
      id
      title
      availableForSale
      price { amount currencyCode }
      selectedOptions { name value }
    }
  }
`;

const detailSelection = `
  id
  handle
  title
  description
  descriptionHtml
  vendor
  productType
  tags
  availableForSale
  collections(first: 40) { nodes { handle } }
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 8) { nodes { url altText } }
  variants(first: 25) {
    nodes {
      id
      title
      availableForSale
      price { amount currencyCode }
      selectedOptions { name value }
    }
  }
`;

function normalize(p: any): StoreProduct {
  const variants = p.variants?.nodes || [];
  const initial = variants.find((v: Variant) => v.availableForSale) || variants[0];
  const images = p.images?.nodes || [];
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description || '',
    descriptionHtml: p.descriptionHtml || '',
    images,
    image: images[0]?.url || null,
    alt: images[0]?.altText || p.title,
    price: p.priceRange?.minVariantPrice?.amount || initial?.price?.amount || null,
    currency: p.priceRange?.minVariantPrice?.currencyCode || initial?.price?.currencyCode || 'INR',
    available: Boolean(p.availableForSale),
    variantId: initial?.id || null,
    variants,
    vendor: p.vendor || '',
    productType: p.productType || '',
    tags: p.tags || [],
    collectionHandles: p.collections?.nodes?.map((c: { handle: string }) => c.handle) || []
  };
}

export async function getCollectionProducts(handle: string, limit = 150): Promise<StoreProduct[]> {
  if (!shopifyEnabled) return [];
  const products: StoreProduct[] = [];
  let cursor: string | null = null;
  const safeLimit = Math.min(Math.max(1, limit), 150);

  try {
    while (products.length < safeLimit) {
      const size = Math.min(40, safeLimit - products.length);
      type CollectionResponse = {
        collection: {
          products: {
            nodes: any[];
            pageInfo: { hasNextPage: boolean; endCursor: string | null };
          };
        } | null;
      };

      const d: CollectionResponse = await storefront<CollectionResponse>(
        `query($handle:String!,$first:Int!,$after:String){
          collection(handle:$handle){
            products(first:$first,after:$after){
              nodes{${cardSelection}}
              pageInfo{hasNextPage endCursor}
            }
          }
        }`,
        { handle, first: size, after: cursor },
        undefined,
        { revalidate: 120, tags: ['shopify-products', `collection-${handle}`] }
      );

      if (!d.collection) break;
      products.push(...d.collection.products.nodes.map(normalize));
      if (!d.collection.products.pageInfo.hasNextPage || !d.collection.products.pageInfo.endCursor) break;
      cursor = d.collection.products.pageInfo.endCursor;
    }
    return products;
  } catch (e) {
    console.error('Collection unavailable', handle, e);
    return products;
  }
}

export async function getStoreProducts(): Promise<StoreProduct[]> {
  if (!shopifyEnabled) return [];
  try {
    const d = await storefront<{ products: { nodes: any[] } }>(
      `query{ products(first: 80){ nodes{${cardSelection}} } }`,
      {},
      undefined,
      { revalidate: 120, tags: ['shopify-products'] }
    );
    return d.products.nodes.map(normalize);
  } catch (e) {
    console.error('Shopify products unavailable', e);
    return [];
  }
}

export const FOLOTOY_TEDDY_PRODUCT: StoreProduct = {
  id: 'gid://shopify/Product/folotoy-ai-teddy',
  handle: 'folotoy-ai-teddy',
  title: 'FoloToy AI Teddy Kumma AI Toy',
  description:
    'Meet Kumma, the interactive conversational AI Teddy powered by PlayNex & FoloToy. Featuring natural speech dialogue, a removable washable AI core, and multilingual learning, Kumma is designed to inspire curiosity and bedtime storytelling.',
  descriptionHtml: '',
  price: '7999',
  currency: 'INR',
  available: true,
  image: 'https://store.folotoy.com/cdn/shop/files/b363db57ccaf7b36813ed705912d9e09.png?v=1781179930&width=1100',
  alt: 'FoloToy AI Teddy Kumma AI Toy',
  images: [
    {
      url: 'https://store.folotoy.com/cdn/shop/files/b363db57ccaf7b36813ed705912d9e09.png?v=1781179930&width=1100',
      altText: 'FoloToy AI Teddy Kumma Front View'
    },
    {
      url: 'https://store.folotoy.com/cdn/shop/files/8815146adb8d0f8d547228ff2271d5cd.png?v=1782218262&width=1100',
      altText: 'FoloToy AI Teddy Kumma Angle View'
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0586/6058/5547/files/1.jpg?v=1767684239',
      altText: 'FoloToy AI Teddy Features Overview'
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0586/6058/5547/files/2.jpg?v=1767684260',
      altText: 'FoloToy Press Paw to Talk'
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0586/6058/5547/files/3.jpg?v=1767684260',
      altText: 'FoloToy Storytelling and Learning'
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0586/6058/5547/files/4.jpg?v=1767684260',
      altText: 'FoloToy Removable AI Core and Washable Plush'
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0586/6058/5547/files/5_b40a6aa7-1646-4b8a-9cfa-5484b2792c7c.jpg?v=1767684259',
      altText: 'FoloToy Wi-Fi 2.4G & Mobile Hotspot'
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0586/6058/5547/files/6_918ad384-2d87-4d71-9cdc-956fd3ac1045.jpg?v=1767684260',
      altText: 'FoloToy Specifications and Care'
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0586/6058/5547/files/7.jpg?v=1767684259',
      altText: 'FoloToy Packaging and Box Contents'
    }
  ],
  variantId: 'gid://shopify/ProductVariant/53632868286776',
  variants: [
    {
      id: 'gid://shopify/ProductVariant/53632868286776',
      title: 'Classic Soft Honey Plush',
      availableForSale: true,
      price: { amount: '7999', currencyCode: 'INR' },
      selectedOptions: [{ name: 'Color', value: 'Classic Soft Honey' }]
    },
    {
      id: 'gid://shopify/ProductVariant/53619301122360',
      title: 'Warm Cocoa Brown Plush',
      availableForSale: true,
      price: { amount: '7999', currencyCode: 'INR' },
      selectedOptions: [{ name: 'Color', value: 'Warm Cocoa Brown' }]
    }
  ],
  vendor: 'FoloToy × PlayNex',
  productType: 'AI Interactive Companion',
  tags: ['ai', 'smart-toy', 'interactive', 'companion', 'folotoy'],
  collectionHandles: ['playnex-product', 'playnex-originals']
};

export async function getStoreProduct(handle: string): Promise<StoreProduct | null> {
  const cleanHandle = handle.toLowerCase().trim();
  if (['folotoy-ai-teddy', 'ai-teddy', 'kumma', 'folotoy'].includes(cleanHandle)) {
    if (shopifyEnabled) {
      try {
        const d = await storefront<{ product: any | null }>(
          `query($handle:String!){ product(handle:$handle){${detailSelection}} }`,
          { handle },
          undefined,
          { revalidate: 120, tags: ['shopify-products', `product-${handle}`] }
        );
        if (d.product) return normalize(d.product);
      } catch (err) {
        console.warn('Folotoy product lookup fallback to static definition', err);
      }
    }
    return FOLOTOY_TEDDY_PRODUCT;
  }

  if (!shopifyEnabled) return null;
  try {
    const d = await storefront<{ product: any | null }>(
      `query($handle:String!){ product(handle:$handle){${detailSelection}} }`,
      { handle },
      undefined,
      { revalidate: 120, tags: ['shopify-products', `product-${handle}`] }
    );
    return d.product ? normalize(d.product) : null;
  } catch (e) {
    console.error('Product unavailable', handle, e);
    return null;
  }
}

/**
 * Fetch all Dropshipped products for the Discover section (/discover).
 * Uses Shopify collection 'dropship-products' (or configured discover collection),
 * with fallback to tags (dropship, discover, curated).
 */
export async function getDiscoverProducts(limit = 150): Promise<StoreProduct[]> {
  if (!shopifyEnabled) return [];

  // 1. Try primary configured collection (e.g. 'dropship-products')
  let products = await getCollectionProducts(SHOPIFY_DISCOVER_HANDLE, limit);

  // 2. Fallbacks to other known dropship collection handles
  if (products.length === 0) {
    for (const h of DISCOVER_COLLECTION_HANDLES) {
      if (h !== SHOPIFY_DISCOVER_HANDLE) {
        products = await getCollectionProducts(h, limit);
        if (products.length > 0) break;
      }
    }
  }

  // 3. Tag / metadata fallback across all products
  if (products.length === 0) {
    const all = await getStoreProducts();
    products = all.filter((p) => isDiscoverProduct(p));
  }

  return products.slice(0, limit);
}

/**
 * Fetch official PlayNex items for the Shop section (/shop).
 * Uses Shopify collection 'playnex-product' (or configured originals collection),
 * with fallback to all products excluding dropshipped items.
 */
export async function getPlayNexProducts(limit = 150): Promise<StoreProduct[]> {
  if (!shopifyEnabled) return [];

  // 1. Try primary configured collection (e.g. 'playnex-product')
  let products = await getCollectionProducts(SHOPIFY_ORIGINALS_HANDLE, limit);

  // 2. Fallbacks to other known PlayNex collection handles
  if (products.length === 0) {
    for (const h of PLAYNEX_COLLECTION_HANDLES) {
      if (h !== SHOPIFY_ORIGINALS_HANDLE) {
        products = await getCollectionProducts(h, limit);
        if (products.length > 0) break;
      }
    }
  }

  // 3. Fallback: all store products minus discover/dropship products
  if (products.length === 0) {
    const all = await getStoreProducts();
    products = all.filter((p) => !isDiscoverProduct(p));
  }

  return products.slice(0, limit);
}

type CartResult = {
  cart: { id: string; checkoutUrl: string; totalQuantity: number } | null;
  userErrors: { field?: string[]; message: string }[];
};

function sanitizeE164Phone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digitsOnly = phone.replace(/[^\d+]/g, '');
  if (!digitsOnly) return undefined;
  if (digitsOnly.startsWith('+') && digitsOnly.length >= 10) return digitsOnly;
  if (digitsOnly.length === 10) return `+91${digitsOnly}`;
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) return `+${digitsOnly}`;
  if (digitsOnly.length >= 10) return `+${digitsOnly}`;
  return undefined;
}

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[],
  buyerIp?: string,
  customerAccessToken?: string,
  customerInfo?: { email?: string; phone?: string; countryCode?: string }
) {
  if (!shopifyEnabled) throw new Error('Shopify is not configured');
  const m = `mutation($input:CartInput!){cartCreate(input:$input){cart{id checkoutUrl totalQuantity}userErrors{field message}}}`;

  const cleanPhone = sanitizeE164Phone(customerInfo?.phone);
  const cleanEmail = customerInfo?.email?.trim() || undefined;

  // Helper to execute cartCreate mutation safely without throwing
  const tryCreate = async (buyerIdentity?: {
    customerAccessToken?: string;
    email?: string;
    phone?: string;
    countryCode?: string;
  }) => {
    try {
      const input: {
        lines: { merchandiseId: string; quantity: number }[];
        buyerIdentity?: typeof buyerIdentity;
      } = { lines };
      if (buyerIdentity && Object.keys(buyerIdentity).length > 0) {
        input.buyerIdentity = buyerIdentity;
      }
      const res = await storefront<{ cartCreate: CartResult }>(m, { input }, buyerIp);
      if (res?.cartCreate?.cart?.checkoutUrl && (!res.cartCreate.userErrors || res.cartCreate.userErrors.length === 0)) {
        return res.cartCreate.cart;
      }
      if (res?.cartCreate?.userErrors?.length) {
        console.warn('Shopify cartCreate userErrors:', res.cartCreate.userErrors);
      }
      return null;
    } catch (err) {
      console.warn('Shopify cartCreate exception caught:', err instanceof Error ? err.message : err);
      return null;
    }
  };

  // Attempt 1: Full identity (token + email + phone)
  let cart = null;
  if (customerAccessToken || cleanEmail || cleanPhone) {
    cart = await tryCreate({
      ...(customerAccessToken ? { customerAccessToken } : {}),
      ...(cleanEmail ? { email: cleanEmail } : {}),
      ...(cleanPhone ? { phone: cleanPhone } : {}),
      countryCode: customerInfo?.countryCode || 'IN'
    });
  }

  // Attempt 2: If failed with token, retry with email & phone only
  if (!cart && (cleanEmail || cleanPhone)) {
    cart = await tryCreate({
      ...(cleanEmail ? { email: cleanEmail } : {}),
      ...(cleanPhone ? { phone: cleanPhone } : {}),
      countryCode: customerInfo?.countryCode || 'IN'
    });
  }

  // Attempt 3: If still failed or no identity, create bare cart lines (100% reliable)
  if (!cart) {
    cart = await tryCreate(undefined);
  }

  if (!cart?.checkoutUrl) {
    throw new Error('Shopify could not create a checkout destination. Please check item availability.');
  }

  return cart;
}
