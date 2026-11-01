'use client';

import {useState, useEffect} from 'react';
import Image from 'next/image';
import type {StoreProduct} from '@/lib/shopify';
import {useCart, price} from './CartProvider';
import {useAuth} from './AuthProvider';

export default function MobileStickyBar({
  product,
  category = 'original'
}: {
  product: StoreProduct;
  category?: 'original' | 'discover';
}) {
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const {add, setOpen} = useCart();
  const {user, openAuthModal} = useAuth();

  const variant = product.variants?.find((v) => v.availableForSale) || product.variants?.[0];

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past 450px
      setVisible(window.scrollY > 450);
    };

    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible || !variant) return null;

  const handleAdd = (openDrawer = true) => {
    if (!variant.availableForSale) return;

    const item = {
      id: variant.id,
      handle: product.handle,
      title: product.title,
      variantTitle: variant.title,
      image: product.image,
      amount: variant.price.amount,
      currency: variant.price.currencyCode,
      quantity: 1,
      vendor: product.vendor,
      category
    };

    add(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    if (openDrawer) {
      setOpen(true);
    }
  };

  const handleBuyNow = async () => {
    if (!variant.availableForSale) return;

    if (!user) {
      handleAdd(false);
      openAuthModal('checkout');
      return;
    }

    try {
      handleAdd(false);
      const res = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          lines: [{merchandiseId: variant.id, quantity: 1}],
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
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  };

  return (
    <div className="mobile-sticky-bar universal-sticky-bar" role="region" aria-label="Quick order bar">
      <div className="mobile-sticky-info">
        {product.image && (
          <div className="mobile-sticky-thumb">
            <Image src={product.image} width={44} height={44} alt="" />
          </div>
        )}
        <div className="mobile-sticky-copy">
          <strong>{product.title}</strong>
          <div className="sticky-sub-row">
            <span>{product.price ? price(Number(product.price), product.currency) : 'Contact for price'}</span>
            <span className="sticky-stock-dot">● In Stock</span>
          </div>
        </div>
      </div>

      <div className="sticky-actions-group">
        <button
          type="button"
          className={`button button-blue mobile-sticky-add-btn ${added ? 'added' : ''}`}
          disabled={!variant.availableForSale}
          onClick={() => handleAdd(true)}
        >
          {added ? 'Added ✓' : variant.availableForSale ? 'Add to bag ↗' : 'Sold out'}
        </button>

        <button
          type="button"
          className="button button-gold sticky-instant-buy-btn"
          disabled={!variant.availableForSale}
          onClick={handleBuyNow}
        >
          Buy Now ⚡
        </button>
      </div>
    </div>
  );
}
