'use client';

import React, {useState, useRef, useEffect} from 'react';
import Link from 'next/link';
import {useAuth} from './AuthProvider';
import {UserIcon} from './Icons';

export default function AccountButton({mobile = false}: {mobile?: boolean}) {
  const {user, openAuthModal, logout} = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  if (mobile) {
    if (user) {
      return (
        <div className="mobile-account-card">
          <Link href="/account" className="mobile-account-info-link">
            <div className="mobile-account-info">
              <span className="mobile-account-avatar">
                {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
              </span>
              <div>
                <strong>{user.firstName || user.displayName || 'Account'}</strong>
                <small>{user.email}</small>
                <span className="mobile-account-orders-link">View orders & account →</span>
              </div>
            </div>
          </Link>
          <button
            type="button"
            className="mobile-account-logout-btn"
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      );
    }
    return (
      <div className="mobile-guest-buttons">
        <button
          type="button"
          className="mobile-account-signin-btn"
          onClick={() => openAuthModal()}
        >
          <UserIcon size={18} />
          <span>Sign In / Create Account</span>
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        className="nav-account-signin-btn"
        onClick={() => openAuthModal()}
        aria-label="Sign in to your customer account"
      >
        <UserIcon size={16} />
        <span>Sign in</span>
      </button>
    );
  }

  const initial = user.firstName ? user.firstName[0].toUpperCase() : 'U';

  return (
    <div className="nav-account-wrap" ref={menuRef}>
      <button
        type="button"
        className={`nav-account-pill ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-label="Customer account menu"
      >
        <span className="nav-account-avatar">{initial}</span>
        <span className="nav-account-name">{user.firstName || 'Account'}</span>
        <span className="nav-account-chevron">▾</span>
      </button>

      {menuOpen && (
        <div className="nav-account-dropdown" role="menu">
          <div className="nav-account-dropdown-header">
            <strong>{user.displayName || user.firstName || 'Customer'}</strong>
            <small>{user.email}</small>
            <span className="nav-account-verified-tag">✓ Verified Shopify Customer</span>
          </div>

          <div className="nav-account-dropdown-actions">
            <Link
              href="/account"
              className="nav-account-action-link"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
            >
              👤 My Account & Orders ↗
            </Link>
            <Link
              href="/shop"
              className="nav-account-action-link"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
            >
              🛍️ Browse Shop
            </Link>
            <button
              type="button"
              className="nav-account-logout-btn"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

