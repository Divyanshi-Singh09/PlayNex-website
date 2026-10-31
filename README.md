# PlayNex Interactive Technologies — V4 Next.js storefront

A responsive, animated, multi-page PlayNex website based on the existing V3 design and supplied official logo/brand palette. **V4** makes the **People / Perspectives** section completely Shopify-managed, supports **still images and videos**, improves on-page SEO and Shopify fetch caching, and adds optional route-scoped GSAP animation.

> Deployment-oriented source, not an already activated commerce site. A production build, real store integration, and real payment/fulfillment tests still require store credentials, dependencies and launch approval. Never set `NEXT_PUBLIC_SITE_READY=true` on staging.

## Start here

1. Read [`docs/SHOPIFY_INTEGRATION_PLAN.md`](docs/SHOPIFY_INTEGRATION_PLAN.md) to connect the Shopify store and plan the rollout.
2. Create the content fields exactly as described in [`docs/SHOPIFY_METAOBJECTS.md`](docs/SHOPIFY_METAOBJECTS.md).
3. Review the actual validation boundary in [`docs/VALIDATION_REPORT.md`](docs/VALIDATION_REPORT.md).
4. Copy `.env.example` to `.env.local`, fill in the server-side credentials, install dependencies, then test/build.

```bash
cp .env.example .env.local
npm install
npm run check:sources
npm run check:content
npm run typecheck
npm run build
npm run dev
```

## Routes

| Route | Purpose |
|---|---|
| `/` | Expansive homepage, server-rendered storytelling, live Shopify Perspectives |
| `/shop` | Combined original + independent curated products |
| `/discover` | Dedicated dropship / third-party product landing page |
| `/products/[handle]` | Shopify product variants, stock, price, JSON-LD and bag |
| `/companions` and `/companions/[handle]` | Companion concepts and product storytelling |
| `/about`, `/our-story`, `/technology`, `/safety` | Human-focused brand narrative, science, responsible design |
| `/experience` | Interactive conversation concept |
| `/journal` and `/journal/[slug]` | Editorial content |
| `/faq`, `/contact` | Service, enquiries, questions |
| `/shipping`, `/returns`, `/privacy`, `/terms` | **Legal drafts: require approval before production** |
| `/api/shopify/cart` | Shopify cart creation and secure checkout URL |
| `/api/webhooks/shopify` | Signed content-invalidation endpoint |
| `/api/contact` | Optional transactional contact form delivery (Resend) |
| `/sitemap.xml`, `/robots.txt` | Search metadata, indexation launch gate |

## Shopify-managed People / Perspectives

**Key files:** `lib/perspectives.ts`, `components/Perspectives.tsx`, and `docs/SHOPIFY_METAOBJECTS.md`.

A single Shopify `playnex_perspectives_section` entry at handle `home` owns the entire section: heading, emphasized phrase, description, gallery heading, footer, and ordered list of guest stories. Each story (`playnex_perspective`) owns name, attribution, text, picture, video, cover, media preference, permissions and visibility. Editing any of these from **Shopify Admin** updates the storefront after cache refresh; code changes are unnecessary.

A `MediaImage` displays instantly and never shows a play button. A Shopify-hosted `Video` displays a poster and only streams when clicked. If both are supplied, `media_preference` controls which is featured. No media at all shows branded fallback artwork. No invented quotes or unverifiable endorsements are used.

## Core technical decisions

- Next.js 16 App Router, React 19, TypeScript, mobile-first CSS and supplied PlayNex brand assets.
- Shopify public Storefront API is called server-side; credentials are not exposed to the browser.
- Shopify catalog and metaobjects cached for up to **300 seconds**, independently tagged for webhook refresh; cart mutations are always uncached.
- `next/image` for Shopify photos; AVIF/WebP and responsive dimensions, fixed image slots.
- GSAP/ScrollTrigger imported dynamically only on Home, About and Discover; skips reduced-motion visitors.
- Server components for purely editorial homepage sections; client JS only where interaction is needed.
- SEO: page title and description, per-route canonical, Open Graph, schema.org Product/Organization, dynamic product sitemap, safe staging `noindex`.
- Shopping bag stores selections locally but Shopify validates cost, inventory, taxes, shipping and final checkout.

## Launch responsibilities

The product source code **does not configure** your Shopify store, app permissions, payment gateway, shipping carrier, supplier agreements, tax, email sending domain, consent records or final policies. The developer and merchant must verify each of these in staging. For a future larger catalog, add server-side cursor pagination and dedicated search instead of loading many collection items on one page.

## Brand rules

The submitted PlayNex mark and logo are retained. Core palette is blue `#005BBB`, aqua `#31C8E8`, green `#49C65B`, sunlight `#FFBC19`, coral `#FF515B`, and ink `#173E55`; editorial typography uses Segoe UI with accessible system fallbacks. Warm colors are accents, not large competing blocks. Brand voice is adult-inclusive, reassuring, competent and never claims clinical understanding or guaranteed privacy without evidence.
