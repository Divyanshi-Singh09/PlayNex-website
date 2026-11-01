const domain = 'uxmaq0-mx.myshopify.com';
const token = '806b42b05be6de8a5089ec1863199be6';
const version = '2024-10';

async function main() {
  const q = `query {
    product(handle: "abc") {
      id
      title
      handle
      images(first: 5) {
        nodes {
          url
          altText
        }
      }
    }
  }`;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({ query: q })
  });

  const data = await res.json();
  console.log('Result for abc:', JSON.stringify(data, null, 2));
}

main().catch(console.error);

