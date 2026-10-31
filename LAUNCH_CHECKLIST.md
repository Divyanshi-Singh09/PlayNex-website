# PlayNex — go-live checklist

## P0: Required before accepting an order

- [ ] Domain + DNS / SSL configured for target hosting. Set `NEXT_PUBLIC_SITE_URL` to the production HTTPS domain.
- [ ] `npm install`, `npm run typecheck`, and `npm run build` succeed on CI/CD. Test routes on deployed preview environment.
- [ ] Confirm business legal name, GST/seller identity, contact address and customer-support email displayed where legally necessary.
- [ ] Shopify Headless channel, public Storefront token and API version configured; catalog and inventory published; check `playnex-originals` + `playnex-discover` collection membership carefully.
- [ ] Configure payment gateway, fraud controls, GST/tax calculation, applicable Markets, shipping zones, duties and eligible locations. Verify your merchant-of-record obligations.
- [ ] Approve actual supplier contracts, ownership of product photography, product safety/certifications and relevant product/age warnings; remove unsubstantiated claims.
- [ ] Approve full shipping, cancellation, return/refund, privacy, terms and grievance/contact policies. Replace **draft policy language** with final company-approved details.
- [ ] Confirm third-party supplier attribution and distinguish brand-manufactured from independently fulfilled dropshipped goods throughout customer journey.
- [ ] Run a real sandbox/test transaction with 1 and 2 products, variant selection, out-of-stock, delivery charge, refund and cross-device checkout.
- [ ] Verify customer receives legitimate transactional email, shipping notifications and support response. Ensure supplier tracking and order-status workflow.
- [ ] Add persistent spam protection to `/api/contact` if enabling Resend; validate sender domain and fallback.
- [ ] Test desktop, Android and iOS browsers, keyboard access, screen readers, reduced motion, image load failures and slow networks.
- [ ] Set `NEXT_PUBLIC_SITE_READY=true` **only after** approving content, commercial operations and legal pages; check robots, sitemap and metadata after deployment.

## P1: Strongly recommended

- [ ] Optimize real product photography and video for mobile and meaningful alt text. Replace all placeholder concept visuals on actual product listings.
- [ ] Add GA4 / Meta / analytics only with appropriate disclosure and consent where required. Measure product-view → add-to-cart → checkout conversion.
- [ ] Configure security monitoring, uptime monitoring, error tracking and reliable backups.
- [ ] Build a product data validation process for dropship suppliers (price changes, stock sync, SKU mapping, shipping promises, defective returns, recall procedures).
- [ ] Localize prices, dates, and checkout countries according to launch markets and languages.
- [ ] Validate SEO structured data only for live products and published claims, with price and availability matching Shopify.
- [ ] Run accessibility, performance and Core Web Vitals audits after publishing production media.

## Visual hierarchy and positioning

1. Home — emotional connection and original PlayNex brand promise.
2. Shop — conversion-focused product exploration across verified collections.
3. Discover — a clearly separate editorial landing page for supplier-sourced goods.
4. About / Technology / Responsibility — trust, research and credible product framing.
5. Help, policies and order fulfillment — low-friction customer assurance.

**Never describe an imported/dropshipped product as PlayNex-designed or PlayNex-manufactured unless this has been verified and contractually established.**
