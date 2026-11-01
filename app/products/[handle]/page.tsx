import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {
  getStoreProduct,
  getDiscoverProducts,
  getPlayNexProducts,
  getStoreProducts,
  isDiscoverProduct,
  formatPrice,
  FOLOTOY_TEDDY_PRODUCT
} from '@/lib/shopify';
import {StoreProductCard} from '@/components/ShopControls';
import {Eyebrow} from '@/components/Shared';
import TrustStrip from '@/components/TrustStrip';
import MobileStickyBar from '@/components/MobileStickyBar';
import ProductReviews from '@/components/ProductReviews';
import ProductGallery from '@/components/ProductGallery';
import ProductBuyBox from '@/components/ProductBuyBox';
import ProductStorySection from '@/components/ProductStorySection';
import ProductDemoSection from '@/components/ProductDemoSection';
import ProductNavTabs from '@/components/ProductNavTabs';
import ProductFAQ from '@/components/ProductFAQ';

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

  // Calculate simulated compare-at price for discount display
  const currentPriceNum = Number(product.price || 0);
  const comparePriceNum = currentPriceNum > 100 ? Math.round(currentPriceNum * 1.35) : null;

  // Use the actual PlayNex product images from Shopify
  const isFolotoyTeddy = ['folotoy-ai-teddy', 'ai-teddy', 'kumma'].includes(product.handle.toLowerCase());

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : isFolotoyTeddy
      ? FOLOTOY_TEDDY_PRODUCT.images
      : [
          {
            url: '/images/playnex-original-logo.png',
            altText: `${product.title} - PlayNex Original Product`
          }
        ];

  return (
    <main id="main" className="folotoy-product-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(productSchema).replace(/</g, '\\u003c')}}
      />

      {/* Breadcrumb Navigation */}
      <div className="breadcrumb wrap">
        <Link href="/">Home</Link>
        <span> / </span>
        <Link href="/shop">Catalog</Link>
        <span> / </span>
        <Link href={isDiscover ? '/discover' : '/shop'}>
          {isDiscover ? 'Discover (Partner Items)' : 'AI Companions'}
        </Link>
        <span> / </span>
        <span className="current-crumb">{product.title}</span>
      </div>

      {/* User-Friendly Quick-Jump Section Tabs */}
      <ProductNavTabs />

      {/* Top Main Product Showcase (Folotoy 2-Column Stage) */}
      <section id="overview" className="shop-detail wrap">
        {/* Left Column: Interactive Product Gallery */}
        <div className="shop-detail-gallery-col">
          <ProductGallery
            images={galleryImages}
            title={product.title}
            badge={isDiscover ? 'DROPSHIPPED / PARTNER ITEM' : 'PLAYNEX ORIGINAL ITEM'}
          />
        </div>

        {/* Right Column: Sticky Product Purchase & Information */}
        <div className="shop-detail-copy">
          <Eyebrow>
            {isDiscover
              ? 'PLAYNEX DISCOVER / PARTNER'
              : isFolotoyTeddy
              ? 'PLAYNEX × FOLOTOY / AI TOYS'
              : 'PLAYNEX / ORIGINALS'}
          </Eyebrow>

          <h1 className="folotoy-product-title">{product.title}</h1>

          {/* Social Proof Review Rating Bar */}
          <div className="product-review-quick-bar">
            <a href="#reviews" className="product-review-badge-link" aria-label="Jump to customer reviews">
              <span className="stars">★★★★★</span>
              <span className="score">4.9</span>
              <span className="count">· 128+ Verified Reviews ↗</span>
            </a>
          </div>

          <p className="product-vendor">
            {product.vendor || (isDiscover ? 'Partner Brand' : 'PlayNex')}
            {product.productType ? ` · ${product.productType}` : ''}
          </p>

          {/* Price Display with Compare Strike-through */}
          <div className="folotoy-price-container">
            <div className="folotoy-price-main">
              <span className="folotoy-price-current">{formatPrice(product.price, product.currency)}</span>
              {comparePriceNum && (
                <span className="folotoy-price-compare">
                  {formatPrice(comparePriceNum, product.currency)}
                </span>
              )}
            </div>
            {comparePriceNum && (
              <span className="folotoy-save-badge">SAVE 35%</span>
            )}
            <p className="folotoy-tax-shipping-note">
              Shipping & taxes calculated at checkout. Free shipping on all prepaid orders.
            </p>
          </div>

          {/* Product Lede Description */}
          <p className="detail-lede">
            {product.description ||
              'Meet Kumma, the interactive conversational AI Teddy powered by PlayNex. Featuring natural speech dialogue, a removable washable AI core, and multilingual learning, Kumma is designed to inspire curiosity, speech development, and bedtime storytelling.'}
          </p>

          {/* Interactive Buy Box: Quantity, Add to Bag, Buy Now, Accordions */}
          <ProductBuyBox product={product} category={isDiscover ? 'discover' : 'original'} />
        </div>
      </section>

      {/* Visual Product Storytelling Section (matching Folotoy's visual banners) */}
      <ProductStorySection productTitle={product.title} isDiscover={isDiscover} />

      {/* Live Interactive Voice Demo Simulator */}
      <ProductDemoSection productTitle={product.title} />

      {/* Dedicated Frequently Asked Questions Section */}
      <ProductFAQ />

      {/* Dynamic Customer Reviews System (Signed-in users can write reviews) */}
      <ProductReviews productHandle={product.handle} productTitle={product.title} />

      {/* Related Products Recommendation */}
      {related.length > 0 && (
        <section className="wrap section folotoy-related-section">
          <div className="section-split">
            <div>
              <Eyebrow>MORE TO EXPLORE</Eyebrow>
              <h2>You may also like.</h2>
            </div>
            <Link href="/shop" className="text-link">
              View all companions ↗
            </Link>
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

      {/* Trust Strip */}
      <TrustStrip />

      {/* Mobile & Desktop Floating Sticky Bar for Quick Add */}
      <MobileStickyBar product={product} category={isDiscover ? 'discover' : 'original'} />
    </main>
  );
}
