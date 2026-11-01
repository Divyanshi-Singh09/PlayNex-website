'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import type {StoreProduct, Variant} from '@/lib/shopify';
import {useCart} from './CartProvider';
import {useAuth} from './AuthProvider';

interface ProductBuyBoxProps {
  product: StoreProduct;
  category?: 'original' | 'discover';
}

export default function ProductBuyBox({product, category = 'original'}: ProductBuyBoxProps) {
  const [variant, setVariant] = useState<Variant | undefined>(
    product.variants.find((v) => v.availableForSale) || product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const {add, setOpen} = useCart();
  const {user, openAuthModal} = useAuth();

  const handleAddToCart = (openBag = true) => {
    if (!variant || !variant.availableForSale) return;

    const item = {
      id: variant.id,
      handle: product.handle,
      title: product.title,
      variantTitle: variant.title,
      image: product.image,
      amount: variant.price.amount,
      currency: variant.price.currencyCode,
      quantity,
      vendor: product.vendor,
      category
    };

    add(item);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);

    if (openBag) {
      setOpen(true);
    }
  };

  const handleBuyNow = async () => {
    if (!variant || !variant.availableForSale) return;
    setBuyingNow(true);

    // If user is not logged in, prompt sign in for checkout
    if (!user) {
      handleAddToCart(false);
      openAuthModal('checkout');
      setBuyingNow(false);
      return;
    }

    try {
      handleAddToCart(false);
      const res = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          lines: [{merchandiseId: variant.id, quantity}],
          customerInfo: {
            phone: user?.phone,
            email: user?.email,
            countryCode: 'IN'
          }
        })
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        // Fallback: open bag drawer
        setOpen(true);
      }
    } catch {
      setOpen(true);
    } finally {
      setBuyingNow(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} on PlayNex!`,
          url
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    }
  };

  return (
    <div className="folotoy-buybox">
      {/* Stock Availability Pill */}
      <div className="folotoy-stock-badge">
        <span className="stock-pulse-dot" />
        <span>
          <strong>In Stock</strong> — Dispatched within 24 hours from verified hubs
        </span>
      </div>

      {/* Key Features Bullet Checklist */}
      <div className="folotoy-feature-bullets">
        <div className="feature-bullet-item">
          <span className="bullet-icon">🎙️</span>
          <div>
            <strong>Interactive AI Voice & Storytelling</strong>
            <p>Natural conversation, bedtime stories & curious Q&A</p>
          </div>
        </div>
        <div className="feature-bullet-item">
          <span className="bullet-icon">🧼</span>
          <div>
            <strong>Removable AI Module (100% Washable Plush)</strong>
            <p>Unzips easily so the plush exterior stays clean and hygienic</p>
          </div>
        </div>
        <div className="feature-bullet-item">
          <span className="bullet-icon">🌐</span>
          <div>
            <strong>Dual Wi-Fi 2.4G & Mobile Hotspot</strong>
            <p>Ready for home play, family vacations, and car rides</p>
          </div>
        </div>
        <div className="feature-bullet-item">
          <span className="bullet-icon">🗣️</span>
          <div>
            <strong>Speaks & Teaches 10+ Languages</strong>
            <p>English, Hindi, Spanish, French, Japanese, and more</p>
          </div>
        </div>
      </div>

      {/* Visual Variant Selector (Chips / Swatches) */}
      {product.variants.length > 1 && (
        <div className="folotoy-variant-group">
          <div className="variant-label-row">
            <span className="variant-label-text">Select Edition:</span>
            <strong className="variant-selected-title">{variant?.title}</strong>
          </div>
          <div className="folotoy-variant-chips" role="radiogroup" aria-label="Product editions">
            {product.variants.map((v) => {
              const isSelected = variant?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!v.availableForSale}
                  className={`variant-chip-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => setVariant(v)}
                >
                  <span className={`variant-color-dot ${v.title.toLowerCase().includes('cocoa') ? 'cocoa' : 'honey'}`} />
                  <span className="variant-chip-name">{v.title}</span>
                  {!v.availableForSale && <span className="soldout-tag">Sold Out</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Buy Buttons */}
      <div className="folotoy-cta-group">
        <div className="quantity-stepper folotoy-stepper">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span aria-live="polite">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
          >
            +
          </button>
        </div>

        <button
          type="button"
          className={`button button-blue folotoy-add-btn ${addedAnimation ? 'added' : ''}`}
          disabled={!variant?.availableForSale}
          onClick={() => handleAddToCart(true)}
        >
          {addedAnimation ? 'Added to Bag ✓' : variant?.availableForSale ? 'Add to Bag ↗' : 'Currently Sold Out'}
        </button>
      </div>

      {/* Instant Checkout Button (Folotoy / Shopify Style) */}
      {variant?.availableForSale && (
        <button
          type="button"
          className="button button-gold folotoy-buy-now-btn"
          disabled={buyingNow}
          onClick={handleBuyNow}
        >
          {buyingNow ? 'Connecting securely…' : 'Buy with Instant Checkout ⚡'}
        </button>
      )}

      {/* Under-Button Trust Strip */}
      <div className="folotoy-trust-row">
        <div className="trust-item">
          <span className="trust-icon">🚚</span>
          <span>Free Express Shipping</span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">🛡️</span>
          <span>30-Day Money-Back Guarantee</span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">🔌</span>
          <span>Type-C Fast Rechargeable</span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">🔒</span>
          <span>100% Screen-Free & Child Safe</span>
        </div>
      </div>

      {/* Accordions (exact match to Folotoy) */}
      <div id="specifications" className="folotoy-accordions">
        {/* Accordion 1: Specifications */}
        <details className="folotoy-accordion-item" open>
          <summary>
            <span>Product Specifications</span>
            <span className="chevron">▾</span>
          </summary>
          <div className="accordion-content">
            <ul className="spec-list">
              <li>
                <strong>Model:</strong> F-202 AI Interactive Companion
              </li>
              <li>
                <strong>Battery Capacity:</strong> 800mAh rechargeable lithium-ion (up to 6 hrs talk time)
              </li>
              <li>
                <strong>Dimensions:</strong> 35 cm (Toy height) | 55 × 50 × 40 mm (AI module)
              </li>
              <li>
                <strong>Connectivity:</strong> Wi-Fi 2.4G & Mobile Hotspot support
              </li>
              <li>
                <strong>Material:</strong> Ultra-soft velvet plush (Skin-safe & Hypoallergenic)
              </li>
              <li>
                <strong>Removable Core:</strong> Yes, modular AI capsule unzips safely from back
              </li>
              <li>
                <strong>Charging Port:</strong> USB-C (Braided cable included)
              </li>
              <li>
                <strong>Supported Languages:</strong> English, Hindi, French, Spanish, Japanese, Korean, German, and more
              </li>
            </ul>
          </div>
        </details>

        {/* Accordion 2: Care Instructions */}
        <details className="folotoy-accordion-item">
          <summary>
            <span>Care Instructions</span>
            <span className="chevron">▾</span>
          </summary>
          <div className="accordion-content">
            <p>
              Keep your companion fresh and clean by removing the AI module before washing. Hand-wash or spot clean
              the plush exterior only using mild detergent. Avoid machine washing with high spin cycles, and air dry
              completely before reinserting the AI module.
            </p>
          </div>
        </details>

        {/* Accordion 3: Shipping & Returns */}
        <details className="folotoy-accordion-item">
          <summary>
            <span>Shipping & Returns</span>
            <span className="chevron">▾</span>
          </summary>
          <div className="accordion-content">
            <p>
              Estimated delivery is <strong>3–5 business days</strong> across India. Eligible items can be returned
              within <strong>30 days</strong> after delivery in original condition. Questions or need assistance? Reach
              out to our team at{' '}
              <a href="mailto:support@playnexinteractive.com">support@playnexinteractive.com</a> or visit our{' '}
              <Link href="/contact">contact page</Link>.
            </p>
          </div>
        </details>

        {/* Accordion 4: Share */}
        <details className="folotoy-accordion-item">
          <summary>
            <span>Share This Companion</span>
            <span className="chevron">▾</span>
          </summary>
          <div className="accordion-content share-wrap">
            <p>Share this smart companion with friends or family:</p>
            <button type="button" className="button button-white share-copy-btn" onClick={handleShare}>
              {shareSuccess ? 'Link Copied to Clipboard! ✓' : '📋 Copy Product Link'}
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}
