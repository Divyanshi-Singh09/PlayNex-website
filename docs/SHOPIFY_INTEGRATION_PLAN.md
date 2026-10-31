# PlayNex → Shopify integration and launch plan

## Architecture

**Next.js 16 App Router + React 19** for the site, design system, SEO and responsive experience. **Shopify** is the catalog, inventory, variants, merchandising, headless checkout and content CMS. **Metaobjects** manage People / Perspectives. **GSAP ScrollTrigger** loads only on Home, About and Discover, only for users who do not request reduced motion.

```text
Shopify Admin
├── Products & variants
├── Collections: playnex-originals, playnex-discover
├── Content → Files: consented portraits, posters, videos
├── Content → Metaobjects: perspectives + homepage section
└── Inventory, shipping, discounts, tax, fulfillment
             │  Storefront GraphQL API (server only)
             ▼
Next.js on Vercel or similar Node-capable host
├── Server-rendered pages, OG/SEO, product JSON-LD
├── 300s tag-cached Shopify catalog & perspectives
├── Optimized Next/Image, static brand assets
├── Browser-only client UI: bag, filter, media lightbox
├── Shopify Cart API: cartCreate → Shopify checkoutUrl
└── Signed webhook endpoint → tag revalidation
             │
             ▼
Customer → secure Shopify checkout → order → mapped fulfillment workflow
```

## Phased rollout: concrete owner and acceptance checks

| Phase | Owner | Work | Verify before proceeding |
|---|---|---|---|
| 1. Store foundation | Shopify owner | Create store, Headless channel, permitted Storefront API access, collections, domain, tax settings | One test product in each collection is visible via GraphQL |
| 2. Editorial CMS | Shopify admin + developer | Create metaobject definitions (see `SHOPIFY_METAOBJECTS.md`), populate approved people/stories, set Public Read and publishability | Image-only + video-only + hidden/draft stories behave correctly |
| 3. Catalog + partner fulfillment | Commerce owner | Upload products, image alt, vendor, variants, pricing, stock, actual supplier origin, returns/shipping by supplier; verify dropship SLAs | No Discover item labeled PlayNex manufactured; supplier accepts test order |
| 4. Headless web | Developer | Copy `.env.example` to `.env.local`, set domain and Storefront token. Launch a preview deployment with `NEXT_PUBLIC_SITE_READY=false`. Configure strict remote image hosts | `/shop`, `/discover`, `/products/[handle]`, bag and checkout work in test store |
| 5. Webhook + content refresh | Developer | Set `SHOPIFY_WEBHOOK_SECRET` and register official Shopify topics supported by the store API version for product/collection/metaobject events | Valid HMAC triggers refresh, bad HMAC returns 401, edits propagate |
| 6. Search + content | Marketing & SEO | Approved titles/descriptions, canonical host, real images, alt, brand schema, editorial pages, sitemap, redirects | Search Console and Rich Results validation, no placeholder claims |
| 7. Payments + compliance | Business owner | Approve store policies, refund rights, partner SLA, fulfillment responsibility, payment gateway, privacy & consent procedures | Payment, refund, cancellations, emails and tracking tested end-to-end |
| 8. Performance & go-live | Developer + QA | Lighthouse, Playwright desktop/mobile, Core Web Vitals, accessibility review, monitoring, error tracking | Targets and launch checks pass; flip `NEXT_PUBLIC_SITE_READY=true` only then |

## Credentials and configuration

`.env.local` (server environment): `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_API_VERSION` (defaults to `2026-07`), `SHOPIFY_ORIGINALS_COLLECTION`, `SHOPIFY_DISCOVER_COLLECTION`, `SHOPIFY_WEBHOOK_SECRET`, `SHOPIFY_PERSPECTIVES_SECTION_TYPE`, `SHOPIFY_PERSPECTIVES_SECTION_HANDLE`. Public: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_READY`, `NEXT_PUBLIC_HIDE_EMPTY_VOICES`.

The Storefront token is intentionally **not** prefixed with `NEXT_PUBLIC_`; all GraphQL operations run server-side. Don't use an Admin API token for storefront reads. Use a secret store (Vercel environment variables) rather than committing `.env.local`.

## Catalog and dropshipping model

Publish owned products under `playnex-originals` and independently manufactured items under `playnex-discover`. The product's Shopify vendor is displayed visibly. Operations must determine who is legally responsible for invoices, shipping, returns, warranty, and customer support; independent suppliers do not automatically receive orders merely because products are imported into Shopify. Connect the approved fulfillment app, supplier API or manual order handoff *before accepting purchases*. If items have different lead times, the listings and policies must communicate them accurately. Test split fulfillments and out-of-stock variants.

The existing storefront implements a Shopify-powered catalog, filtering, product variants, persistent cart, server-side Cart API creation and Shopify checkout handoff. It does not implement vendor settlement, automated supplier purchase orders, real-time carrier integration or customer accounts. They should not be assumed ready.

## Performance decisions already in code

- Server components for most editorial pages; client islands only where interaction is required. Static HomeLetter/HomeVision are server-rendered and not hydrated.
- `next/image` for Shopify catalog and story photos; modern AVIF/WebP, properly sized image slots, offscreen lazy images. Hero brand logo remains optimized static asset.
- Public Storefront reads cached 300 seconds with tags; cart mutation explicitly `no-store`.
- Videos use a still preview and click-to-play with `preload=metadata`, never autoplay, minimizing media transfer.
- GSAP and ScrollTrigger are loaded by `import()` after hydration on only Home/About/Discover; reduced-motion users skip both.
- Browser-local cart is a convenience, but **Shopify** is always the pricing/inventory authority at checkout.
- No hardcoded invented testimonials, prices, discounts, sales numbers, customer ratings, or product safety claims.

## SEO decisions already in code

- Page-specific title/description, canonical URLs (not inherited homepage canonical), Open Graph, responsive metadata.
- Product JSON-LD schema from published Shopify data only; never adds fake reviews or rating counts.
- Product sitemap entries generated from the published PlayNex collections, site launch gating and robots policy.
- Product images have meaningful `alt`; HTML page titles and semantic headings are preserved.
- Do not deploy `NEXT_PUBLIC_SITE_READY=true` on a staging domain. Set production domain in `NEXT_PUBLIC_SITE_URL` and configure URL redirects from any old site/Shopify shop domain.

## Performance and SEO acceptance criteria (targets, not verified results)

- Lighthouse mobile performance **≥90** under realistic network/device conditions, accessibility **≥95**, best practices **≥95**, SEO **≥95** on primary routes. Targets are not guarantees.
- Core Web Vitals: **LCP ≤2.5s, INP ≤200ms, CLS ≤0.1** at 75th percentile field data; confirm post launch with actual monitoring.
- No auto-play video; validate first viewport and Shopify image loading at 360/390/768/1440 widths. Test Safari/iOS and Chrome/Android.
- Verify schema.org Product output with Rich Results Test after actual product data exists.
- Load-test Shopify API and webhook revalidation; add server-side cursor pagination before catalog grows beyond the initial collection limits (~150 per collection).
- Set up error tracking, abuse prevention/rate limiting for public contact and cart APIs, CSP with only required Shopify/CDN origins, and a secret rotation plan.

## Commands

```bash
cp .env.example .env.local
npm install
npm run check:sources
npm run check:content
npm run typecheck
npm run build
npm run start
```

Run dev at `http://localhost:3000`; only set live-ready after real end-to-end testing. In this delivered environment, dependency installation was unavailable, so `npm run build` and end-to-end checkout were **not** executed. Syntax + mapper tests were executed (see validation report).

## References (official)

- https://shopify.dev/docs/apps/build/metaobjects
- https://shopify.dev/docs/api/storefront/latest/objects/metaobject
- https://shopify.dev/docs/api/storefront/latest/objects/metaobjectfield
- https://shopify.dev/docs/api/storefront/latest/mutations/cartcreate
- https://nextjs.org/docs/app/guides/caching-without-cache-components
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
