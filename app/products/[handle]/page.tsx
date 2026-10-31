import Image from 'next/image';
import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {
  getStoreProduct,
  getDiscoverProducts,
  getPlayNexProducts,
  getStoreProducts,
  isDiscoverProduct,
  formatPrice
} from '@/lib/shopify';
import {AddToCart, StoreProductCard} from '@/components/ShopControls';
import {Eyebrow} from '@/components/Shared';
import TrustStrip from '@/components/TrustStrip';
import MobileStickyBar from '@/components/MobileStickyBar';
import ProductReviews from '@/components/ProductReviews';

export async function generateMetadata({params}:{params:Promise<{handle:string}>}):Promise<Metadata>{
  const {handle} = await params;
  const product = await getStoreProduct(handle);
  return {
    title: product ? `${product.title} — PlayNex` : 'Product',
    description: product?.description || 'Explore PlayNex items and curated discoveries.',
    alternates: {canonical: `/products/${encodeURIComponent(handle)}`},
    openGraph: product?.image ? {images: [{url: product.image, alt: product.alt}]} : undefined,
    robots: product ? undefined : {index: false}
  };
}

export default async function ProductPage({params}:{params:Promise<{handle:string}>}){
  const {handle} = await params;
  const product = await getStoreProduct(handle);
  if (!product) notFound();

  const isDiscover = isDiscoverProduct(product);
  const relatedSource = isDiscover 
    ? await getDiscoverProducts(8) 
    : await getPlayNexProducts(8);

  const related = (relatedSource.length > 0 ? relatedSource : await getStoreProducts())
    .filter(p => p.id !== product.id)
    .slice(0, 3);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.map(x => x.url),
    brand: {'@type': 'Brand', name: product.vendor || (isDiscover ? 'Independent Maker' : 'PlayNex')},
    sku: product.handle,
    offers: product.price ? {
      '@type': 'Offer',
      url: `${(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')}/products/${encodeURIComponent(handle)}`,
      price: product.price,
      priceCurrency: product.currency,
      availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    } : undefined
  };

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(productSchema).replace(/</g, '\\u003c')}}
      />
      <div className="breadcrumb wrap">
        <Link href="/shop">Shop</Link>
        <span> / </span>
        <Link href={isDiscover ? '/discover' : '/shop'}>
          {isDiscover ? 'Discover (Dropshipped)' : 'PlayNex Items'}
        </Link>
        <span> / </span>
        <span>{product.title}</span>
      </div>

      <section className="shop-detail wrap">
        <div className="shop-detail-gallery">
          <div className="shop-detail-primary">
            {product.image ? (
              <Image
                src={product.image}
                width={900}
                height={900}
                sizes="(max-width: 800px) 95vw, 48vw"
                priority
                alt={product.alt}
              />
            ) : (
              <div className="product-noimage">
                <span>✳</span>
                <p>Product image coming soon</p>
              </div>
            )}
            <span className="detail-photo-badge">
              {isDiscover ? 'DROPSHIPPED / PARTNER ITEM' : 'PLAYNEX ORIGINAL ITEM'}
            </span>
          </div>
          {product.images.length > 1 && (
            <div className="shop-detail-thumbs">
              {product.images.map((x, idx) => (
                <div key={x.url + idx}>
                  <Image
                    src={x.url}
                    width={280}
                    height={280}
                    sizes="150px"
                    alt={x.altText || product.title}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shop-detail-copy">
          <Eyebrow>{isDiscover ? 'PLAYNEX DISCOVER / DROPSHIPPED' : 'PLAYNEX / ORIGINALS'}</Eyebrow>
          <h1>{product.title}</h1>
          <div className="product-review-quick-bar">
            <a href="#reviews" className="product-review-badge-link" aria-label="Jump to customer reviews">
              <span className="stars">★★★★★</span>
              <span className="score">4.9</span>
              <span className="count">· Customer Reviews ↗</span>
            </a>
          </div>
          <p className="product-vendor">
            {product.vendor || (isDiscover ? 'Partner Brand' : 'PlayNex')}
            {product.productType ? ` · ${product.productType}` : ''}
          </p>
          <div className="product-detail-price">
            {formatPrice(product.price, product.currency)}
          </div>
          <p className="detail-lede">
            {product.description || 'Explore the craftsmanship, features, and experience of this item.'}
          </p>
          <div className="availability-label">
            <span className={product.available ? 'availability-dot' : 'availability-dot off'} />
            {product.available ? 'Available to order' : 'Currently unavailable'}
          </div>

          <AddToCart product={product} category={isDiscover ? 'discover' : 'original'} />

          <div className="product-trust-notes">
            <div>
              <span>{isDiscover ? '✺' : '♡'}</span>
              <p>
                <strong>{isDiscover ? 'Dropshipped Product' : 'PlayNex Original Item'}</strong>
                <br />
                {isDiscover
                  ? 'Fulfilled by verified independent suppliers with direct delivery.'
                  : 'Designed and fulfilled directly by PlayNex.'}
              </p>
            </div>
            <div>
              <span>↗</span>
              <p>
                <strong>Secure checkout</strong>
                <br />
                Transactions are completed safely through Shopify.
              </p>
            </div>
            <div>
              <span>✳</span>
              <p>
                <strong>Delivery details</strong>
                <br />
                Shipping options and delivery estimates are confirmed at checkout.
              </p>
            </div>
          </div>

          <details className="product-details-accordion">
            <summary>Shipping & returns</summary>
            <p>
              Review our <Link href="/shipping">shipping information</Link> and <Link href="/returns">return policy</Link>. 
              {isDiscover ? ' For third-party and dropshipped items, fulfillment timelines depend on supplier location.' : ''}
            </p>
          </details>
          <details className="product-details-accordion">
            <summary>Need a hand?</summary>
            <p>
              Questions about features, suitability or delivery? <Link href="/contact">Contact our team</Link> anytime.
            </p>
          </details>
        </div>
      </section>

      {related.length > 0 && (
        <section className="wrap section">
          <div className="section-split">
            <div>
              <Eyebrow>MORE TO EXPLORE</Eyebrow>
              <h2>You may also like.</h2>
            </div>
          </div>
          <div className="store-grid">
            {related.map(p => (
              <StoreProductCard
                key={p.id}
                product={p}
                category={isDiscover ? 'discover' : 'original'}
              />
            ))}
          </div>
        </section>
      )}

      <ProductReviews productHandle={product.handle} productTitle={product.title} />

      <TrustStrip />
      <MobileStickyBar product={product} category={isDiscover ? 'discover' : 'original'} />
    </main>
  );
}
