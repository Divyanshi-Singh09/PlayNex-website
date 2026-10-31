import Link from 'next/link';
import {Eyebrow} from './Shared';

export default function HomeCommerceShowcase() {
  return (
    <section className="wrap home-commerce section" data-reveal>
      <div className="section-split">
        <div>
          <Eyebrow>EXPLORE / SHOP & DISCOVER</Eyebrow>
          <h2>
            Two worlds.<br />
            <em>One purpose.</em>
          </h2>
        </div>
        <p className="section-explainer">
          Explore official PlayNex items engineered for connection, alongside a curated edit of dropshipped finds from independent makers around the world.
        </p>
      </div>

      <div className="home-commerce-grid">
        <Link href="/shop" className="home-commerce-tile hct-one">
          <span className="micro-label">THE PLAYNEX SHOP</span>
          <div className="home-commerce-tile-art">✳</div>
          <div>
            <h3>
              PlayNex Items.<br />
              Made to feel.
            </h3>
            <p>Official brand creations crafted for conversation and connection.</p>
            <strong>Explore PlayNex shop ↗</strong>
          </div>
        </Link>

        <Link href="/discover" className="home-commerce-tile hct-two">
          <span className="micro-label">INTRODUCING DISCOVER</span>
          <div className="home-commerce-tile-art">✺</div>
          <div>
            <h3>
              Dropshipped Finds.<br />
              Curated wonder.
            </h3>
            <p>Playful gadgets and interactive objects from verified external partners.</p>
            <strong>Explore Discover ↗</strong>
          </div>
        </Link>
      </div>
    </section>
  );
}
