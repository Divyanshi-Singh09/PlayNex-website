'use client';

import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';
import {Arrow, MenuIcon, Close} from './Icons';
import CartButton from './CartButton';
import AccountButton from './AccountButton';

const left = [
  {href: '/shop', label: 'Shop'},
  {href: '/discover', label: 'Discover'}
];

const right = [
  {href: '/#voices', label: 'Voices'},
  {href: '/experience', label: 'Experience'},
  {href: '/about', label: 'About us'},
  {href: '/technology', label: 'Technology'}
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    const cb = () => setScrolled(window.scrollY > 15);
    cb();
    window.addEventListener('scroll', cb, {passive: true});
    return () => window.removeEventListener('scroll', cb);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div className="announcement">
        <span className="announcement-diamond">✳</span> Built for moments that matter.{' '}
        <Link href="/discover">
          Discover something new <Arrow size={13} />
        </Link>
      </div>

      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <nav className="nav-container" aria-label="Main navigation">
          <div className="nav-links nav-left">
            {left.map((x) => (
              <Link
                key={x.href}
                className={path.startsWith(x.href) ? 'active' : ''}
                href={x.href}
              >
                {x.label}
              </Link>
            ))}
          </div>

          <Link href="/" className="main-logo" aria-label="PlayNex home">
            <Image
              src="/images/playnex-horizontal.png"
              width={220}
              height={72}
              priority
              unoptimized
              alt="PlayNex Interactive Technologies"
              className="main-logo-img"
            />
          </Link>

          <div className="nav-links nav-right">
            {right.map((x) => (
              <Link
                key={x.href}
                className={path === x.href ? 'active' : ''}
                href={x.href}
              >
                {x.label}
              </Link>
            ))}
            <Link href="/contact" className="nav-cta">
              Say hello <Arrow size={15} />
            </Link>
          </div>

          <div className="header-tools">
            <AccountButton />
            <CartButton />
            <button
              type="button"
              className="menu-btn"
              aria-expanded={open}
              aria-controls="mobile-site-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen(!open)}
            >
              {open ? <Close size={23} /> : <MenuIcon size={23} />}
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-site-nav"
        className={`mobile-nav ${open ? 'open' : ''}`}
        aria-hidden={!open}
      >
        <div className="mobile-nav-topbar">
          <Link
            href="/"
            className="mobile-nav-logo"
            onClick={() => setOpen(false)}
            aria-label="PlayNex home"
          >
            <Image
              src="/images/playnex-horizontal.png"
              width={160}
              height={52}
              priority
              unoptimized
              alt="PlayNex"
            />
          </Link>
          <button
            type="button"
            className="mobile-nav-close-btn"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <Close size={24} />
          </button>
        </div>

        <div className="mobile-nav-links">
          {[
            ...left,
            ...right,
            {href: '/our-story', label: 'Our story'},
            {href: '/safety', label: 'Responsible design'},
            {href: '/journal', label: 'Journal'},
            {href: '/faq', label: 'FAQs'},
            {href: '/contact', label: 'Contact'}
          ].map((x, i) => (
            <Link
              tabIndex={open ? 0 : -1}
              href={x.href}
              onClick={() => setOpen(false)}
              key={x.href}
            >
              <span className="mobile-nav-index">{String(i + 1).padStart(2, '0')}</span>
              {x.label}
              <Arrow size={18} />
            </Link>
          ))}
        </div>
        <div className="mobile-nav-account">
          <AccountButton mobile />
        </div>
        <span className="mobile-nav-bottom">PLAYNEX / CONNECT · INTERACT · THRIVE</span>
      </div>
    </>
  );
}
