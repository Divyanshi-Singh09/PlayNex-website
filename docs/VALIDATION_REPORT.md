# PlayNex V4 validation report

## Verified in the artifact environment

- Reused and extended the existing V3 Next.js codebase, logo, colors and pages.
- `node scripts/check-source.mjs`: all TypeScript/TSX modules transpile with **zero syntax diagnostics**.
- `node scripts/check-content.mjs`: PASS on approved photo-only, approved video-only, hidden/unconsented, and missing metaobjects. Tests evaluate the actual `lib/perspectives.ts` mapper.
- Shopify Storefront read caching, image CDN allowlists and signed webhook source included.
- Source archive integrity validated before delivery.

## Not verified here / needs store access

- Full Next.js `npm run build` and typecheck (dependency installation unavailable / timed out).
- Shopify GraphQL schema against **your actual store** (no credentials connected). Validate metaobject fields and types when creating them.
- Signed webhook end-to-end tests with actual registered Shopify topic deliveries.
- Lighthouse, WebPageTest, device/browser testing, production logs or actual Core Web Vitals.
- Live checkout, payment, fulfillment, customer emails, return flow.

## Priority post-connect tests

1. Confirm public Storefront API `metaobject(handle:{type:"playnex_perspectives_section",handle:"home"})` resolves and the `stories` field is a list reference.
2. Test an image-only story, video-only story and both-media story with the preference toggled.
3. Unpublish a story; verify it is not publicly shown. Set `show_on_site=false` and verify it is filtered.
4. Test Shopify video MIME/preview image via Storefront GraphQL; confirm portrait and landscape image crops.
5. Validate signed webhook in staging; inspect cached content after update and deletion.
6. Test product variants, out-of-stock, multiple currencies, shipping and checkout with a test transaction.
7. Inspect Product JSON-LD, canonical host, sitemap, robots and indexation after flipping ready flag.
