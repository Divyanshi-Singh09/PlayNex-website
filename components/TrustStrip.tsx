import React from 'react';

export default function TrustStrip() {
  return (
    <section className="trust-strip-wrap" aria-label="PlayNex Trust and Guarantees">
      <div className="wrap trust-strip-inner">
        <div className="trust-item">
          <span className="trust-icon">🚚</span>
          <div>
            <strong>Tracked & Direct Delivery</strong>
            <p>Dispatched with full tracking to your doorstep</p>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">🔒</span>
          <div>
            <strong>Shopify Secure Checkout</strong>
            <p>256-bit encrypted payments & buyer protection</p>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">✓</span>
          <div>
            <strong>Verified Authenticity</strong>
            <p>Official PlayNex items & curated partner finds</p>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">💬</span>
          <div>
            <strong>Dedicated Support</strong>
            <p>Fast customer care & responsive inquiry support</p>
          </div>
        </div>
      </div>
    </section>
  );
}

