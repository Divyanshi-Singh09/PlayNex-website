import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUp,
  Arrow,
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
  XIcon,
  LinkedInIcon,
  WhatsAppIcon
} from './Icons';

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

          {/* Social Media Channels */}
          <div className="footer-social-block">
            <span className="footer-social-title">CONNECT WITH US</span>
            <div className="footer-social-icons">
              <a
                href="https://www.instagram.com/playnexinteractive"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PlayNex on Instagram"
                className="footer-social-btn instagram"
                title="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://www.youtube.com/@playnexinteractive"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PlayNex on YouTube"
                className="footer-social-btn youtube"
                title="YouTube"
              >
                <YouTubeIcon size={18} />
              </a>
              <a
                href="https://www.facebook.com/playnexinteractive"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PlayNex on Facebook"
                className="footer-social-btn facebook"
                title="Facebook"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href="https://x.com/playnex_ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PlayNex on X"
                className="footer-social-btn x"
                title="X (Twitter)"
              >
                <XIcon size={16} />
              </a>
              <a
                href="https://www.linkedin.com/company/playnex-interactive"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PlayNex on LinkedIn"
                className="footer-social-btn linkedin"
                title="LinkedIn"
              >
                <LinkedInIcon size={18} />
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=919876543210&text=Hi%20PlayNex%20team,%20I%20have%20a%20question%20about%20your%20products"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="footer-social-btn whatsapp"
                title="WhatsApp Support"
              >
                <WhatsAppIcon size={18} />
              </a>
            </div>
          </div>
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
            <span>SOCIAL</span>
            <a href="https://www.instagram.com/playnexinteractive" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
            <a href="https://www.youtube.com/@playnexinteractive" target="_blank" rel="noopener noreferrer">YouTube ↗</a>
            <a href="https://x.com/playnex_ai" target="_blank" rel="noopener noreferrer">X / Twitter ↗</a>
            <a href="https://www.linkedin.com/company/playnex-interactive" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
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
