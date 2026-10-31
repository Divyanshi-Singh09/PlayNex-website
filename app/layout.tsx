import type {Metadata, Viewport} from 'next';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import RevealEffects from '@/components/RevealEffects';
import {CartProvider} from '@/components/CartProvider';
import CartDrawer from '@/components/CartDrawer';
import {AuthProvider} from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import ScrollToTop from '@/components/ScrollToTop';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const published = process.env.NEXT_PUBLIC_SITE_READY === 'true';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {default: 'PlayNex — A little more connection', template: '%s | PlayNex'},
  description:
    'PlayNex Interactive Technologies creates thoughtful interactive companions for all ages. Discover connection, curiosity and conversation.',
  applicationName: 'PlayNex Interactive Technologies',
  openGraph: {
    type: 'website',
    siteName: 'PlayNex Interactive Technologies',
    title: 'PlayNex — A little more connection',
    description: 'Human-centered, thoughtfully designed companion experiences.',
    url: '/',
    images: [{url: '/images/playnex-original-logo.png', width: 1200, height: 1200, alt: 'PlayNex Interactive Technologies'}]
  },
  twitter: {card: 'summary_large_image'},
  robots: {index: published, follow: published}
};

export const viewport: Viewport = {themeColor: '#ffffff', width: 'device-width', initialScale: 1};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <CartProvider>
          <AuthProvider>
            <SiteHeader />
            <RevealEffects />
            {children}
            <SiteFooter />
            <CartDrawer />
            <AuthModal />
            <ScrollToTop />
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
