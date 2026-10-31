import Link from 'next/link';
import Image from 'next/image';
import {ArrowUp, Arrow} from './Icons';

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-top wrap">
        <div>
          <span className="eyebrow light">STAY HUMAN. STAY CURIOUS.</span>
          <h2>
            More than products.<br />
            <em>Moments that matter.</em>
          </h2>
        </div>
        <Link href="/contact" className="button button-white">
          Start a conversation <ArrowUp size={19} />
        </Link>
      </div>

      <div className="footer-bottom wrap">
        <div className="footer-logo">
          <div className="footer-logo-frame">
            <Image
              src="/images/playnex-horizontal.png"
              width={200}
              height={65}
              unoptimized
              alt="PlayNex"
            />
          </div>
          <p>
            PlayNex original creations and thoughtfully curated discoveries.<br />
            Connection, at every age.
          </p>
        </div>

        <div className="footer-columns">
          <div>
            <span>EXPLORE</span>
            <Link href="/shop">Shop PlayNex</Link>
            <Link href="/discover">Discover · dropshipped finds</Link>
            <Link href="/experience">Experience</Link>
          </div>
          <div>
            <span>PLAYNEX</span>
            <Link href="/about">About us</Link>
            <Link href="/technology">Technology</Link>
            <Link href="/our-story">Our story</Link>
            <Link href="/journal">Journal</Link>
          </div>
          <div>
            <span>HELP</span>
            <Link href="/contact">Contact</Link>
            <Link href="/faq">FAQs</Link>
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns">Returns</Link>
          </div>
          <div>
            <span>IMPORTANT</span>
            <Link href="/safety">Responsibility</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Partnerships</Link>
          </div>
        </div>
      </div>

      <div className="footer-base wrap">
        <p>© {new Date().getFullYear()} PlayNex Interactive Technologies</p>
        <span>CONNECT · INTERACT · THRIVE</span>
        <Link href="#main">
          Back to top <Arrow size={14} />
        </Link>
      </div>
    </footer>
  );
}
