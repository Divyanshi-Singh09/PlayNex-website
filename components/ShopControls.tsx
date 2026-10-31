'use client';
import {useMemo, useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type {StoreProduct} from '@/lib/shopify';
import {useCart, price} from './CartProvider';

export function AddToCart({product, category = 'original'}: {product: StoreProduct; category?: 'original' | 'discover'}) {
  const [variant, setVariant] = useState(product.variants.find((v) => v.availableForSale) || product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const {add} = useCart();

  const handleAdd = () => {
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

    // Item adding is free and unblocked for all shoppers; login is required at checkout
    add(item);
  };

  return (
    <div className="purchase-controls">
      {product.variants.length > 1 && (
        <label className="field-label">
          Choose a variant
          <select
            className="select-input"
            value={variant?.id || ''}
            onChange={(e) => setVariant(product.variants.find((v) => v.id === e.target.value)!)}
          >
            {product.variants.map((v) => (
              <option value={v.id} key={v.id} disabled={!v.availableForSale}>
                {v.title}
                {!v.availableForSale ? ' — Sold out' : ''}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="purchase-bottom">
        <div className="quantity-stepper">
          <button aria-label="Decrease quantity" type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span aria-live="polite">{quantity}</span>
          <button aria-label="Increase quantity" type="button" onClick={() => setQuantity((q) => Math.min(10, q + 1))}>
            +
          </button>
        </div>
        <button
          type="button"
          className="button button-blue"
          disabled={!variant?.availableForSale}
          onClick={handleAdd}
        >
          {variant?.availableForSale ? 'Add to bag ↗' : 'Currently unavailable'}
        </button>
      </div>

      <p className="purchase-note">
        Calculated shipping and applicable taxes are confirmed at checkout. Verified with Shopify Customer Accounts.
      </p>
    </div>
  );
}
export function ShopGrid({
  products,
  category = 'all',
  curatedIds = []
}: {
  products: StoreProduct[];
  category?: 'original' | 'discover' | 'all';
  curatedIds?: string[];
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [availability, setAvailability] = useState('all');

  const shown = useMemo(() => {
    const q = search.toLowerCase().trim();
    const p = products.filter(
      (x) =>
        (!q || `${x.title} ${x.description} ${x.vendor} ${x.productType}`.toLowerCase().includes(q)) &&
        (availability === 'all' || x.available)
    );
    if (sort === 'low') p.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sort === 'high') p.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sort === 'az') p.sort((a, b) => a.title.localeCompare(b.title));
    return p;
  }, [search, sort, availability, products]);

  const resetFilters = () => {
    setSearch('');
    setAvailability('all');
    setSort('featured');
  };

  return (
    <>
      <div className="shop-toolbar">
        <div className="shop-search-wrapper">
          <label className="shop-search">
            <span className="sr-only">Search products</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18">
              <circle cx="10" cy="10" r="6" />
              <path d="m15 15 6 6" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, feature, or maker…"
            />
          </label>
          {search && (
            <button
              type="button"
              className="shop-search-clear-btn"
              onClick={() => setSearch('')}
              aria-label="Clear search query"
            >
              ✕
            </button>
          )}
        </div>

        <label className="shop-filter">
          <span className="sr-only">Filter availability</span>
          <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="all">All availability</option>
            <option value="available">In stock only</option>
          </select>
        </label>

        <label className="shop-filter">
          <span className="sr-only">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="az">Name: A to Z</option>
          </select>
        </label>

        <span className="shop-result-count">
          Showing {shown.length} of {products.length} {products.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {shown.length ? (
        <div className="store-grid">
          {shown.map((p) => (
            <StoreProductCard
              key={p.id}
              product={p}
              category={category === 'all' ? (curatedIds.includes(p.id) ? 'discover' : 'original') : category}
            />
          ))}
        </div>
      ) : (
        <div className="shop-empty">
          <span className="shop-empty-icon">🔍</span>
          <strong>No matching items found</strong>
          <p>We couldn&apos;t find anything matching &ldquo;{search}&rdquo;. Try another keyword or reset filters.</p>
          <button type="button" className="button button-outline" onClick={resetFilters}>
            Reset filters ↗
          </button>
        </div>
      )}
    </>
  );
}

export function StoreProductCard({
  product,
  category = 'original'
}: {
  product: StoreProduct;
  category?: 'original' | 'discover';
}) {
  const {add} = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const initialVariant = product.variants?.find((v) => v.availableForSale) || product.variants?.[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!initialVariant || !initialVariant.availableForSale) return;

    const item = {
      id: initialVariant.id,
      handle: product.handle,
      title: product.title,
      variantTitle: initialVariant.title,
      image: product.image,
      amount: initialVariant.price.amount,
      currency: initialVariant.price.currencyCode,
      quantity: 1,
      vendor: product.vendor,
      category
    };

    // Item adding is free and unblocked for all shoppers; authentication is compulsory at checkout
    add(item);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <Link href={`/products/${product.handle}`} className="store-product" aria-label={`View ${product.title}`}>
      <div className="store-product-image">
        {product.image ? (
          <Image
            src={product.image}
            width={480}
            height={480}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw"
            alt={product.alt}
            loading="lazy"
          />
        ) : (
          <div className="product-noimage">
            <span>✳</span>
            <small>IMAGE COMING SOON</small>
          </div>
        )}
        <span className="store-product-chip">{category === 'discover' ? 'DROPSHIPPED' : 'PLAYNEX'}</span>
      </div>
      <div className="store-product-caption">
        <div>
          <span className="micro-label">
            {product.vendor || (category === 'discover' ? 'DROPSHIP PARTNER' : 'PLAYNEX')}
          </span>
          <h3>{product.title}</h3>
          <p>{product.description}</p>
        </div>
        <div className="product-price">
          <strong>{product.price ? price(Number(product.price), product.currency) : 'Ask us'}</strong>
          <div className="product-card-cta">
            {product.available ? (
              <button
                type="button"
                className={`card-quick-add ${justAdded ? 'added' : ''}`}
                onClick={handleQuickAdd}
                aria-label={`Quick add ${product.title} to bag`}
                title="Quick Add to Bag"
              >
                {justAdded ? '✓ Added' : '+ Add'}
              </button>
            ) : (
              <span className="card-unavailable-tag">Sold out</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
