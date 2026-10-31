import StoryMotion from '@/components/StoryMotion';
import type {Metadata} from 'next';
import Link from 'next/link';
import {getDiscoverProducts} from '@/lib/shopify';
import {curatedCategories, shopFaqs} from '@/lib/editorial';
import {ShopGrid} from '@/components/ShopControls';
import {Eyebrow, BottomCTA} from '@/components/Shared';
import FAQAccordion from '@/components/FAQAccordion';
import TrustStrip from '@/components/TrustStrip';

export const metadata: Metadata = {
  alternates: {canonical: '/discover'},
  title: 'PlayNex Discover — Curated & Dropshipped Finds',
  description: 'An independent edit of dropshipped interactive items, curious gadgets, and objects from verified third-party makers.'
};

export default async function Discover() {
  const products = await getDiscoverProducts();

  return (
    <main id="main">
      <StoryMotion />
      <section className="discover-hero" data-gsap="rise">
        <div className="wrap discover-hero-layout">
          <div className="discover-hero-copy">
            <Eyebrow light>PLAYNEX DISCOVER / DROPSHIPPED & CURATED</Eyebrow>
            <h1>
              For curious finds<br />
              that make life<br />
              <em>more interesting.</em>
            </h1>
            <p>
              Explore an evolving edit of companion-style discoveries, creative gadgets, and playful finds from independent makers — dropshipped directly to your doorstep.
            </p>
            <div className="hero-buttons">
              <a className="button button-white" href="#discover-collection">
                Explore dropshipped items ↗
              </a>
              <Link href="/shop" className="discover-text-link">
                Shop PlayNex items →
              </Link>
            </div>
            <span className="discover-hero-note">
              CURATED WITH CARE ✳ DROPSHIPPED WITH TRANSPARENCY ✳ SECURE SHOPIFY CHECKOUT
            </span>
          </div>

          <div className="discover-orbit" aria-label="Abstract animated orbits representing discovery">
            <span className="orbit-one" />
            <span className="orbit-two" />
            <span className="orbit-three" />
            <div className="discover-orbit-center">✳</div>
            <div className="discover-floating-label label-top">Curated finds ✺</div>
            <div className="discover-floating-label label-bottom">Direct delivery ♡</div>
          </div>
        </div>

        <div className="discover-ticker">
          <span>DROPSHIPPED FINDS ✳ CURIOUS OBJECTS ✳ VERIFIED SUPPLIERS ✳ DIRECT TO DOOR ✳</span>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-split" data-reveal>
          <div>
            <Eyebrow>01 / OUR CURATION</Eyebrow>
            <h2>
              Wonder takes<br />
              <em>many forms.</em>
            </h2>
          </div>
          <p className="section-explainer">
            An independent world of products worth getting curious about. Maker details, pricing, country of origin, and delivery times are clearly indicated on each item.
          </p>
        </div>

        <div className="curated-grid">
          {curatedCategories.map((c, i) => (
            <article className={`curated-tile curated-${c.tone}`} key={c.id} data-reveal>
              <span className="tile-index">0{i + 1} / {c.kicker}</span>
              <div className="curated-icon">{c.icon}</div>
              <div>
                <span className="micro-label">{c.label}</span>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="discover-listing" id="discover-collection">
        <div className="wrap section">
          <div className="section-split" data-reveal>
            <div>
              <Eyebrow>02 / DROPSHIPPED ITEMS</Eyebrow>
              <h2>
                Meet the<br />
                <em>Discover edit.</em>
              </h2>
            </div>
            <p className="section-explainer">
              Carefully curated dropshipped products and independent maker creations appear here for customers.
            </p>
          </div>

          {products.length > 0 ? (
            <ShopGrid products={products} category="discover" />
          ) : (
            <div className="shop-coming discover-empty">
              <span className="micro-label">DROPSHIPPED COLLECTION</span>
              <h3>No dropshipped items added yet.</h3>
              <p>
                Add dropshipped products in your Shopify Admin:
                <br />
                <strong>Method 1 (Collection):</strong> Add products to your <code>Dropship Products</code> collection (handle: <code>dropship-products</code>).
                <br />
                <strong>Method 2 (Tags):</strong> Open any product in Shopify, add the tag <code>dropship</code> or <code>discover</code> in the Tags box, and click Save.
              </p>
              <div className="hero-buttons">
                <Link className="button button-blue" href="/shop">
                  Browse PlayNex items ↗
                </Link>
                <Link className="button button-outline" href="/contact">
                  Suggest a brand ↗
                </Link>
              </div>
              <small>Syncs directly with Shopify collection &quot;Dropship Products&quot; (dropship-products)</small>
            </div>
          )}
        </div>
      </section>

      <section className="wrap section">
        <div className="section-split">
          <div>
            <Eyebrow>03 / DROPSHIP TRANSPARENCY</Eyebrow>
            <h2>
              A little more<br />
              <em>thought behind every find.</em>
            </h2>
          </div>
          <p className="section-explainer">
            PlayNex Discover items are sourced from external partner manufacturers and suppliers. We believe in total clarity for our customers.
          </p>
        </div>

        <div className="discovery-disclosure">
          <div>
            <span>01</span>
            <h3>Supplier verified</h3>
            <p>Every dropshipped listing displays the maker or brand name.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Clear delivery times</h3>
            <p>Shipping timelines and tracking details are provided at checkout and via email.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Secure checkout</h3>
            <p>All payments, orders, and customer protections are handled through our Shopify engine.</p>
          </div>
        </div>
      </section>

      <section className="wrap section discover-faq">
        <div className="section-split">
          <div>
            <Eyebrow>04 / GOOD TO KNOW</Eyebrow>
            <h2>
              Questions?<br />
              <em>Glad you asked.</em>
            </h2>
          </div>
        </div>
        <FAQAccordion items={shopFaqs.map(([q, a]) => ({q, a}))} />
      </section>

      <TrustStrip />

      <BottomCTA
        title="Keep your curiosity close."
        subtitle="Have a brand or dropshipped product you'd love to see in Discover? Let's talk."
      />
    </main>
  );
}
