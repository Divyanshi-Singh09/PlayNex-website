/**
 * PlayNex Shopify Connection Diagnostics
 * Usage: node scripts/test-shopify.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

// Simple parser for .env files without requiring extra dependencies
function loadEnv(file) {
  if (!fs.existsSync(file)) return {};
  const content = fs.readFileSync(file, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const root = process.cwd();
const envLocal = loadEnv(path.join(root, '.env.local'));
const envExample = loadEnv(path.join(root, '.env.example'));
const merged = { ...envExample, ...process.env, ...envLocal };

const domain = merged.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/$/, '');
const token = merged.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = merged.SHOPIFY_API_VERSION || '2026-07';
const originalsHandle = merged.SHOPIFY_ORIGINALS_COLLECTION || 'playnex-originals';
const discoverHandle = merged.SHOPIFY_DISCOVER_COLLECTION || 'playnex-discover';

console.log('\n=== PlayNex Shopify Connection Diagnostic ===\n');

if (!fs.existsSync(path.join(root, '.env.local'))) {
  console.warn('⚠️  .env.local file not found in project root.');
  console.log('   Please copy .env.example to .env.local and fill in your Shopify credentials:\n');
  console.log('   cp .env.example .env.local\n');
}

if (!domain || domain === 'your-store.myshopify.com') {
  console.error('❌ SHOPIFY_STORE_DOMAIN is not configured or is still the placeholder.');
  console.log('   Set SHOPIFY_STORE_DOMAIN=your-store-name.myshopify.com in .env.local\n');
  process.exit(1);
}

if (!token) {
  console.error('❌ SHOPIFY_STOREFRONT_ACCESS_TOKEN is missing in .env.local.');
  console.log('   Obtain a Storefront API Access Token from Shopify Admin:\n   Shopify Admin -> Sales Channels -> Headless (or Develop Apps) -> Storefront API Token\n');
  process.exit(1);
}

if (token.startsWith('shpat_')) {
  console.warn('⚠️  Warning: Token starts with "shpat_", which is typically an Admin API access token.');
  console.warn('   Storefront API requires a Storefront Access Token (generated via Headless channel or Storefront API scopes).\n');
}

console.log(`Connecting to: https://${domain}/api/${version}/graphql.json`);

const TEST_QUERY = `
query TestConnection($originals: String!, $discover: String!) {
  shop {
    name
    primaryDomain {
      host
      url
    }
    paymentSettings {
      currencyCode
    }
  }
  originalsCol: collection(handle: $originals) {
    id
    handle
    title
    products(first: 5) {
      nodes {
        id
        title
        handle
        availableForSale
      }
    }
  }
  discoverCol: collection(handle: $discover) {
    id
    handle
    title
    products(first: 5) {
      nodes {
        id
        title
        handle
        availableForSale
      }
    }
  }
  allProducts: products(first: 10) {
    nodes {
      id
      title
      handle
      availableForSale
    }
  }
}
`;

try {
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({
      query: TEST_QUERY,
      variables: {
        originals: originalsHandle,
        discover: discoverHandle,
      },
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    console.error(`❌ HTTP Error from Shopify: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.error('Response:', text);
    process.exit(1);
  }

  const payload = await res.json();
  if (payload.errors?.length) {
    console.error('❌ Shopify GraphQL Errors:');
    for (const err of payload.errors) {
      console.error(`   - ${err.message}`);
    }
    process.exit(1);
  }

  const data = payload.data;
  console.log('✅ Connected successfully to Shopify Storefront API!\n');
  console.log(`🏪 Store Name:    ${data.shop?.name} (${data.shop?.primaryDomain?.host || domain})`);
  console.log(`💱 Currency:      ${data.shop?.paymentSettings?.currencyCode || 'N/A'}`);
  console.log(`📦 Total visible products queried: ${data.allProducts?.nodes?.length || 0}`);

  console.log('\n--- Collections Status ---');
  if (data.originalsCol) {
    console.log(`✅ Collection "${originalsHandle}": Found ("${data.originalsCol.title}") with ${data.originalsCol.products?.nodes?.length || 0} sample product(s) published.`);
  } else {
    console.warn(`⚠️  Collection "${originalsHandle}": NOT FOUND. Make sure to create a collection with handle "${originalsHandle}" and publish it to the Headless storefront.`);
  }

  if (data.discoverCol) {
    console.log(`✅ Collection "${discoverHandle}": Found ("${data.discoverCol.title}") with ${data.discoverCol.products?.nodes?.length || 0} sample product(s) published.`);
  } else {
    console.warn(`⚠️  Collection "${discoverHandle}": NOT FOUND. Make sure to create a collection with handle "${discoverHandle}" and publish it to the Headless storefront.`);
  }

  console.log('\n✨ Shopify is ready to work with your Next.js project!\n');
} catch (err) {
  console.error('❌ Connection test failed:', err.message);
  process.exit(1);
}

