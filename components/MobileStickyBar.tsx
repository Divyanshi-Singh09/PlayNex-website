'use client';

import {useState, useEffect} from 'react';
import Image from 'next/image';
import type {StoreProduct} from '@/lib/shopify';
import {useCart, price} from './CartProvider';

export default function MobileStickyBar({
  product,
  category = 'original'
}: {
  product: StoreProduct;
  category?: 'original' | 'discover';
}) {
  const [visible, setVisible] = useState(false);
  const {add} = useCart();

  const variant = product.variants?.find((v) => v.availableForSale) || product.variants?.[0];

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past 320px
      setVisible(window.scrollY > 350);
    };

    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible || !variant) return null;

  const handleAdd = () => {
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

    // Item adding is free and unblocked for all shoppers; authentication is compulsory at checkout
    add(item);
  };

  return (
    <div className="mobile-sticky-bar" role="region" aria-label="Quick order bar">
      <div className="mobile-sticky-info">
        {product.image && (
          <div className="mobile-sticky-thumb">
            <Image src={product.image} width={40} height={40} alt="" />
          </div>
        )}
        <div className="mobile-sticky-copy">
          <strong>{product.title}</strong>
          <span>{product.price ? price(Number(product.price), product.currency) : 'Contact for price'}</span>
        </div>
      </div>

      <button
        type="button"
        className="button button-blue mobile-sticky-add-btn"
        disabled={!variant.availableForSale}
        onClick={handleAdd}
      >
        {variant.availableForSale ? 'Add to bag ↗' : 'Sold out'}
      </button>
    </div>
  );
}

