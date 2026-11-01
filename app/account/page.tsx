'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/components/AuthProvider';
import {formatPrice} from '@/lib/shopify';
import {Arrow} from '@/components/Icons';
import EditProfileModal from '@/components/EditProfileModal';

export default function AccountPage() {
  const router = useRouter();
  const {user, loading, logout} = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, loading, router]);

  // Support ?edit=1 in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('edit') === '1' || params.get('edit') === 'true') {
        setIsEditModalOpen(true);
      }
    }
  }, []);

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('edit')) {
        params.delete('edit');
        const newQuery = params.toString();
        const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  };

  if (loading) {
    return (
      <main id="main" className="account-page-wrap">
        <div className="wrap">
          <div className="account-loading-skeleton">
            <span className="account-skeleton-pulse" />
            <p>Loading your customer details from Shopify…</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const orders = user.orders || [];
  const defaultAddress = user.defaultAddress;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <main id="main" className="account-page-wrap">
      <div className="wrap">
        {/* Account Top Banner */}
        <div className="account-header-card">
          <div className="account-header-main">
            <div className="account-avatar-circle">
              {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <span className="account-verified-chip">✓ Verified Shopify Customer</span>
              <h1>Welcome back, {user.firstName || user.displayName || 'Customer'}</h1>
              <p className="account-email-sub">{user.email}</p>
            </div>
          </div>

          <div className="account-header-actions">
            <button
              type="button"
              className="button button-outline account-edit-header-btn"
              onClick={() => setIsEditModalOpen(true)}
            >
              <span>✎</span> Edit Profile & Address
            </button>
            <Link href="/shop" className="button button-blue">
              Explore Shop <Arrow size={14} />
            </Link>
            <button
              type="button"
              className="button button-outline"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="account-dashboard-grid">
          {/* Orders Section */}
          <section className="account-orders-section" aria-labelledby="orders-title">
            <div className="account-section-head">
              <h2 id="orders-title">Order History</h2>
              <span className="account-order-count">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
              </span>
            </div>

            {orders.length > 0 ? (
              <div className="account-orders-list">
                {orders.map((order) => {
                  const dateStr = new Date(order.processedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <article key={order.id} className="account-order-card">
                      <div className="account-order-top">
                        <div>
                          <strong>{order.name || `#${order.orderNumber}`}</strong>
                          <span className="order-date">Placed on {dateStr}</span>
                        </div>
                        <div className="order-badges">
                          <span className={`order-status-badge financial-${order.financialStatus.toLowerCase()}`}>
                            {order.financialStatus.replace('_', ' ')}
                          </span>
                          <span className={`order-status-badge fulfillment-${order.fulfillmentStatus.toLowerCase()}`}>
                            {order.fulfillmentStatus.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="account-order-items">
                        {order.lineItems.map((item, idx) => (
                          <div key={idx} className="account-order-item-row">
                            <div className="order-item-thumb">
                              {item.variant?.image?.url ? (
                                <Image
                                  src={item.variant.image.url}
                                  width={48}
                                  height={48}
                                  alt=""
                                  unoptimized
                                />
                              ) : (
                                <span>✳</span>
                              )}
                            </div>
                            <div className="order-item-details">
                              <strong>{item.title}</strong>
                              {item.variant?.title && item.variant.title !== 'Default Title' && (
                                <small>{item.variant.title}</small>
                              )}
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="account-order-bottom">
                        <div className="order-total-price">
                          <span>Total</span>
                          <strong>
                            {formatPrice(Number(order.totalPrice.amount), order.totalPrice.currencyCode)}
                          </strong>
                        </div>
                        {order.statusUrl && (
                          <a
                            href={order.statusUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="order-track-link"
                          >
                            Track order on Shopify ↗
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="account-empty-orders">
                <span className="empty-box-icon">📦</span>
                <h3>No orders placed yet</h3>
                <p>
                  When you purchase PlayNex items or dropshipped finds, your tracking details and order receipts will appear right here.
                </p>
                <div className="empty-orders-buttons">
                  <Link href="/shop" className="button button-blue">
                    Browse PlayNex items ↗
                  </Link>
                  <Link href="/discover" className="button button-outline">
                    Explore Discover ↗
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Customer Profile & Address Sidebar */}
          <aside className="account-sidebar">
            {/* Profile Info */}
            <div className="account-sidebar-card">
              <div className="account-card-header-row">
                <h3>Customer Details</h3>
                <button
                  type="button"
                  className="account-card-edit-btn"
                  onClick={() => setIsEditModalOpen(true)}
                  aria-label="Edit customer details"
                >
                  Edit ✎
                </button>
              </div>
              <div className="account-detail-list">
                <div>
                  <span className="detail-label">Name</span>
                  <strong>{user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer'}</strong>
                </div>
                <div>
                  <span className="detail-label">Email</span>
                  <span>{user.email}</span>
                </div>
                <div>
                  <span className="detail-label">Phone</span>
                  {user.phone ? (
                    <span className="account-phone-val">{user.phone}</span>
                  ) : (
                    <button
                      type="button"
                      className="account-add-field-link"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      + Add mobile number for tracking
                    </button>
                  )}
                </div>
                <div>
                  <span className="detail-label">Authentication</span>
                  <span className="auth-platform-tag">Shopify Storefront ID</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="account-sidebar-card">
              <div className="account-card-header-row">
                <h3>Shipping Address</h3>
                <button
                  type="button"
                  className="account-card-edit-btn"
                  onClick={() => setIsEditModalOpen(true)}
                  aria-label="Edit shipping address"
                >
                  {defaultAddress ? 'Edit ✎' : '+ Add Address'}
                </button>
              </div>
              {defaultAddress ? (
                <div className="account-address-box">
                  {defaultAddress.formatted && defaultAddress.formatted.length > 0 ? (
                    defaultAddress.formatted.map((line, idx) => <p key={idx}>{line}</p>)
                  ) : (
                    <>
                      <p>{defaultAddress.address1}</p>
                      {defaultAddress.address2 && <p>{defaultAddress.address2}</p>}
                      <p>
                        {[defaultAddress.city, defaultAddress.province, defaultAddress.zip]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <p>{defaultAddress.country}</p>
                    </>
                  )}
                  <button
                    type="button"
                    className="account-address-quick-edit"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Update default shipping address →
                  </button>
                </div>
              ) : (
                <div className="account-no-address">
                  <p>No default address saved yet.</p>
                  <button
                    type="button"
                    className="button button-outline account-add-address-btn"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    + Add Delivery Address
                  </button>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="account-sidebar-card">
              <h3>Need Assistance?</h3>
              <p className="account-support-note">
                Have questions regarding orders, tracking, or delivery times?
              </p>
              <div className="account-quick-links">
                <Link href="/contact" className="account-link-item">
                  Contact Customer Care →
                </Link>
                <Link href="/shipping" className="account-link-item">
                  Shipping Policies →
                </Link>
                <Link href="/returns" className="account-link-item">
                  Returns & Replacements →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Edit Profile & Address Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
      />
    </main>
  );
}
