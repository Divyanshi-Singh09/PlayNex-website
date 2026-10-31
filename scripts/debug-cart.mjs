import fs from 'node:fs';
import path from 'node:path';

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
const env = { ...loadEnv(path.join(root, '.env.example')), ...process.env, ...loadEnv(path.join(root, '.env.local')) };
const domain = env.SHOPIFY_STORE_DOMAIN;
const token = env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = env.SHOPIFY_API_VERSION || '2024-10';

async function testResilientCart() {
  const m = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl } userErrors { field message } } }`;

  async function executeCart(input) {
    const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
      body: JSON.stringify({ query: m, variables: { input } })
    });
    return await res.json();
  }

  // Attempt 1: with bad token
  const inputWithToken = {
    lines: [{ merchandiseId: 'gid://shopify/ProductVariant/53619301122360', quantity: 1 }],
    buyerIdentity: {
      customerAccessToken: 'stale_token',
      email: 'customer@example.com',
      phone: '+919876543210'
    }
  };

  console.log('Testing Attempt 1 (with token)...');
  let data = await executeCart(inputWithToken);
  console.log('Attempt 1 userErrors:', data.data?.cartCreate?.userErrors);

  if (data.data?.cartCreate?.userErrors?.length) {
    console.log('Token failed! Falling back to buyerIdentity without stale token...');
    const inputWithoutToken = {
      lines: [{ merchandiseId: 'gid://shopify/ProductVariant/53619301122360', quantity: 1 }],
      buyerIdentity: {
        email: 'customer@example.com',
        phone: '+919876543210',
        countryCode: 'IN'
      }
    };
    data = await executeCart(inputWithoutToken);
    console.log('Fallback Result checkoutUrl:', data.data?.cartCreate?.cart?.checkoutUrl ? 'SUCCESS URL GENERATED!' : 'FAILED');
    console.log('Fallback userErrors:', data.data?.cartCreate?.userErrors);
  }
}

testResilientCart().catch(console.error);
