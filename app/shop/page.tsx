import type {Metadata} from 'next';
import Link from 'next/link';
import {getPlayNexProducts} from '@/lib/shopify';
import {ShopGrid} from '@/components/ShopControls';
import CompanionVisual from '@/components/CompanionVisual';
import {Eyebrow, BottomCTA} from '@/components/Shared';
import {Arrow} from '@/components/Icons';
import TrustStrip from '@/components/TrustStrip';

export const metadata: Metadata = {
  alternates: {canonical: '/shop'},
  title: 'Shop PlayNex Items — Official Store',
  description: 'Explore official PlayNex items and experiences designed for connection, imagination, and moments that matter.'
};

export default async function Shop() {
  const playnexProducts = await getPlayNexProducts();

  return (
    <main id="main">
      <section className="store-hero">
        <div className="wrap store-hero-grid">
          <div data-reveal>
            <Eyebrow>THE PLAYNEX SHOP / OFFICIAL STORE</Eyebrow>
            <h1>
              PlayNex items.<br />
              <em>Experiences to feel.</em>
            </h1>
            <p>
              Discover creations crafted to spark curiosity, bring people together, and make room for moments that matter. Built with human connection at heart.
            </p>
            <div className="hero-buttons">
              <a href="#playnex-catalog" className="button button-blue">
                Explore PlayNex items <Arrow size={17} />
              </a>
              <Link href="/discover" className="button button-outline">
                Dropshipped finds (Discover) ↗
              </Link>
            </div>
            <div className="store-subnote">
              ✳ PlayNex Originals <span>•</span> Connection-focused <span>•</span> Direct fulfillment
            </div>
          </div>
          <div className="store-hero-visual">
            <div className="store-float-note float-a">✳ Made for connection</div>
            <CompanionVisual variant="blue" small cards={false} />
            <div className="store-float-note float-b">♡ PlayNex Original</div>
          </div>
        </div>
      </section>

      <section className="section wrap shop-main" id="playnex-catalog">
        <div className="section-split" data-reveal>
          <div>
            <Eyebrow>01 / OFFICIAL PLAYNEX CATALOG</Eyebrow>
            <h2>
              Crafted for<br />
              <em>connection.</em>
            </h2>
          </div>
          <p className="section-explainer">
            Every PlayNex item is created with purpose and care. Looking for third-party curated or dropshipped items? Visit our dedicated Discover section.
          </p>
        </div>

        <div className="shop-collections">
          <div className="collection-intro original-collection">
            <span>01 / PLAYNEX ORIGINALS</span>
            <h3>
              Official PlayNex<br />
              Creations.
            </h3>
            <div className="collection-symbol">✳</div>
            <strong>Browse below ↓</strong>
          </div>
          <Link href="/discover" className="collection-intro discover-collection">
            <span>02 / PLAYNEX DISCOVER</span>
            <h3>
              Curated dropshipped<br />
              innovations.
            </h3>
            <div className="collection-symbol">✺</div>
            <strong>Explore Discover ↗</strong>
          </Link>
        </div>

        <div className="shop-products-head">
          <div>
            <h2>PlayNex Items</h2>
            <span>Official brand catalog</span>
          </div>
          <span>
            {playnexProducts.length
              ? `${playnexProducts.length} item${playnexProducts.length === 1 ? '' : 's'} available`
              : 'Syncing with Shopify'}
          </span>
        </div>

        {playnexProducts.length > 0 ? (
          <ShopGrid products={playnexProducts} category="original" />
        ) : (
          <div className="shop-coming">
            <div className="shop-coming-art">✳</div>
            <span className="micro-label">SHOPIFY STORE CONNECTED</span>
            <h3>Your PlayNex items will appear here.</h3>
            <p>
              Add products in your Shopify Admin and assign them to the <strong>Playnex Product</strong> collection (handle: <code>playnex-product</code>) to display them here live for customers.
            </p>
            <div className="hero-buttons">
              <Link href="/discover" className="button button-outline">
                View Discover edit ↗
              </Link>
              <Link href="/contact" className="button button-blue">
                Contact team ↗
              </Link>
            </div>
            <small>Store connected to: uxmaq0-mx.myshopify.com</small>
          </div>
        )}
      </section>

      <TrustStrip />

      <BottomCTA
        eyebrow="CONNECT · INTERACT · THRIVE"
        title="Experience something genuinely thoughtful."
        subtitle="Have questions about PlayNex items or specifications? We are here to help."
      />
    </main>
  );
}
