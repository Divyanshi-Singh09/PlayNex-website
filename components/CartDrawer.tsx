'use client';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useCart, price} from './CartProvider';
import {useAuth} from './AuthProvider';

export default function CartDrawer() {
  const {items, count, total, currency, remove, update, open, setOpen} = useCart();
  const {user, openAuthModal, updateDetails} = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Delivery details form state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('India');

  // Pre-fill form from user profile whenever user changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      if (user.defaultAddress) {
        setAddress1(user.defaultAddress.address1 || '');
        setAddress2(user.defaultAddress.address2 || '');
        setCity(user.defaultAddress.city || '');
        setProvince(user.defaultAddress.province || '');
        setZip(user.defaultAddress.zip || '');
        setCountry(user.defaultAddress.country || 'India');
      }
    }
  }, [user]);

  // Reset view when drawer closes
  useEffect(() => {
    if (!open) {
      setIsEditingDetails(false);
      setError('');
      setDetailsError('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Check if customer has complete shipping and mobile details
  const hasDeliveryDetails = Boolean(
    user &&
      (user.phone || phone) &&
      user.defaultAddress?.address1 &&
      user.defaultAddress?.city &&
      user.defaultAddress?.zip
  );

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    setDetailsError('');
    setSavingDetails(true);

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setDetailsError('Please enter a valid 10-digit mobile number for delivery coordination.');
      setSavingDetails(false);
      return;
    }

    if (!address1.trim()) {
      setDetailsError('Please enter your street address (flat/house no., building, street).');
      setSavingDetails(false);
      return;
    }

    if (!city.trim() || !province.trim() || !zip.trim()) {
      setDetailsError('Please enter your city, state/province, and postal / PIN code.');
      setSavingDetails(false);
      return;
    }

    const res = await updateDetails({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      address1: address1.trim(),
      address2: address2.trim(),
      city: city.trim(),
      province: province.trim(),
      zip: zip.trim(),
      country: country.trim() || 'India'
    });

    setSavingDetails(false);

    if (!res.success) {
      setDetailsError(res.error || 'Could not save delivery details. Please check your inputs.');
      return;
    }

    setIsEditingDetails(false);
    // Proceed directly to Shopify checkout with saved details
    proceedToShopifyCheckout({
      phone: phone.trim(),
      email: user?.email
    });
  }

  async function proceedToShopifyCheckout(customerInfo?: { phone?: string; email?: string }) {
    setError('');
    setBusy(true);

    try {
      if (!items.length) throw Error('Your bag is empty.');
      const r = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          lines: items.map((i) => ({merchandiseId: i.id, quantity: i.quantity})),
          customerInfo: {
            phone: customerInfo?.phone || user?.phone || phone,
            email: customerInfo?.email || user?.email,
            countryCode: 'IN'
          }
        })
      });
      const data = await r.json();
      if (!r.ok || !data.checkoutUrl) throw new Error(data.error || 'Checkout unavailable.');
      const url = new URL(data.checkoutUrl);
      if (url.protocol !== 'https:') throw new Error('Invalid checkout destination');
      location.assign(url.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start checkout');
      setBusy(false);
    }
  }

  function handleCheckoutClick() {
    setError('');

    // 1. Compulsory login check
    if (!user) {
      openAuthModal('checkout');
      return;
    }

    // 2. Check for required address and mobile number
    if (!hasDeliveryDetails) {
      setIsEditingDetails(true);
      return;
    }

    // 3. Already has details -> proceed to Shopify Checkout
    proceedToShopifyCheckout();
  }

  return (
    <>
      <div className={`bag-backdrop ${open ? 'shown' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside
        className={`bag-drawer ${open ? 'shown' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your shopping bag"
        aria-hidden={!open}
      >
        <div className="bag-head">
          <div>
            <span className="micro-label">YOUR SELECTIONS</span>
            <h2>
              {isEditingDetails ? 'Delivery details' : <>Your bag <span>({count})</span></>}
            </h2>
          </div>
          <button
            type="button"
            className="round-icon"
            onClick={() => setOpen(false)}
            aria-label="Close shopping bag"
          >
            ×
          </button>
        </div>

        {user ? (
          <div className="bag-auth-banner authenticated">
            <span className="auth-dot" />
            <span>
              Signed in as <strong>{user.firstName || user.email}</strong>
            </span>
          </div>
        ) : (
          <div className="bag-auth-banner guest">
            <span>🔒 Authentication required to checkout</span>
            <button
              type="button"
              className="bag-auth-login-link"
              onClick={() => openAuthModal('checkout')}
            >
              Sign In ↗
            </button>
          </div>
        )}

        <div className="bag-content">
          {isEditingDetails ? (
            <div className="bag-details-form-wrap">
              <div className="bag-details-form-intro">
                <span className="micro-label">SHIPPING & CONTACT INFO</span>
                <h3>Enter delivery details</h3>
                <p>Please provide your mobile number and address so we can deliver your order and send tracking updates.</p>
              </div>

              {detailsError && (
                <div className="auth-error-box" role="alert">
                  <span>⚠</span>
                  <p>{detailsError}</p>
                </div>
              )}

              <form onSubmit={handleSaveDetails} className="bag-details-form">
                <div className="auth-name-row">
                  <label className="auth-field">
                    <span>First name *</span>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Alex"
                      autoComplete="given-name"
                    />
                  </label>
                  <label className="auth-field">
                    <span>Last name *</span>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Sharma"
                      autoComplete="family-name"
                    />
                  </label>
                </div>

                <label className="auth-field">
                  <span>Mobile number * (for courier delivery & OTP)</span>
                  <div className="bag-phone-input-wrap">
                    <span className="bag-phone-prefix">+91</span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      maxLength={15}
                    />
                  </div>
                </label>

                <label className="auth-field">
                  <span>Delivery address (House / Flat / Plot, Street) *</span>
                  <input
                    type="text"
                    required
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    placeholder="e.g. Flat 402, Lotus Towers, 5th Main Road"
                    autoComplete="address-line1"
                  />
                </label>

                <label className="auth-field">
                  <span>Apartment, Suite, Landmark (Optional)</span>
                  <input
                    type="text"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    placeholder="e.g. Near Metro Station / Sector 4"
                    autoComplete="address-line2"
                  />
                </label>

                <div className="auth-name-row">
                  <label className="auth-field">
                    <span>City *</span>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      autoComplete="address-level2"
                    />
                  </label>
                  <label className="auth-field">
                    <span>State / Province *</span>
                    <input
                      type="text"
                      required
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      autoComplete="address-level1"
                    />
                  </label>
                </div>

                <div className="auth-name-row">
                  <label className="auth-field">
                    <span>PIN / Postal code *</span>
                    <input
                      type="text"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="e.g. 400001"
                      autoComplete="postal-code"
                      maxLength={10}
                    />
                  </label>
                  <label className="auth-field">
                    <span>Country</span>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="India"
                      autoComplete="country-name"
                    />
                  </label>
                </div>

                <div className="bag-details-actions">
                  <button
                    type="submit"
                    className="button button-blue bag-details-save-btn"
                    disabled={savingDetails}
                  >
                    {savingDetails ? 'Saving to Shopify…' : 'Save Details & Proceed ↗'}
                  </button>

                  {hasDeliveryDetails && (
                    <button
                      type="button"
                      className="bag-details-cancel-btn"
                      onClick={() => setIsEditingDetails(false)}
                      disabled={savingDetails}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <>
              {items.length ? (
                <>
                  <div className="bag-items-list">
                    {items.map((item) => (
                      <div className="bag-line" key={item.id}>
                        <div className="bag-thumb">{item.image ? <img src={item.image} alt="" /> : <span>✳</span>}</div>
                        <div className="bag-line-copy">
                          <span className="micro-label">{item.category === 'discover' ? 'CURATED FIND' : 'PLAYNEX'}</span>
                          <strong>{item.title}</strong>
                          <small>{item.variantTitle === 'Default Title' ? '' : item.variantTitle}</small>
                          <span>{price(Number(item.amount) * item.quantity, item.currency)}</span>
                          <div className="bag-controls">
                            <button onClick={() => update(item.id, item.quantity - 1)} aria-label={`Remove one ${item.title}`}>
                              −
                            </button>
                            <b>{item.quantity}</b>
                            <button onClick={() => update(item.id, item.quantity + 1)} aria-label={`Add one ${item.title}`}>
                              +
                            </button>
                            <button className="bag-remove" onClick={() => remove(item.id)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Details Card for Logged-in Customer */}
                  {user && (
                    <div className="bag-delivery-card">
                      <div className="bag-delivery-header">
                        <div className="bag-delivery-title">
                          <span className="bag-delivery-icon">📦</span>
                          <strong>Delivery Information</strong>
                        </div>
                        <button
                          type="button"
                          className="bag-delivery-edit-btn"
                          onClick={() => setIsEditingDetails(true)}
                        >
                          {hasDeliveryDetails ? 'Edit / Change' : '+ Add Address'}
                        </button>
                      </div>

                      {hasDeliveryDetails ? (
                        <div className="bag-delivery-body">
                          <p className="bag-delivery-name">
                            <strong>{user.firstName} {user.lastName}</strong>
                            {user.phone && <span className="bag-delivery-phone">• {user.phone}</span>}
                          </p>
                          <p className="bag-delivery-address">
                            {user.defaultAddress?.address1}
                            {user.defaultAddress?.address2 ? `, ${user.defaultAddress.address2}` : ''}
                            <br />
                            {user.defaultAddress?.city}, {user.defaultAddress?.province} - {user.defaultAddress?.zip}
                          </p>
                        </div>
                      ) : (
                        <div className="bag-delivery-missing">
                          <p>📍 Mobile number & delivery address required for courier shipping.</p>
                          <button
                            type="button"
                            className="bag-delivery-prompt-btn"
                            onClick={() => setIsEditingDetails(true)}
                          >
                            Enter delivery address & mobile ↗
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="bag-empty">
                  <span>✳</span>
                  <h3>There’s room for something wonderful.</h3>
                  <p>Your bag is empty. Explore what PlayNex has to offer.</p>
                  <Link href="/shop" onClick={() => setOpen(false)} className="button button-blue">
                    Explore the shop ↗
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {!isEditingDetails && (
          <div className="bag-footer">
            <div className="bag-subtotal">
              <span>Subtotal</span>
              <strong>{price(total, currency)}</strong>
            </div>
            <p>
              Shipping, taxes and order eligibility are confirmed at Shopify checkout. Verified with Shopify Customer Accounts.
            </p>
            {error && (
              <div className="bag-error" role="alert">
                {error}
              </div>
            )}
            <button
              className="button button-blue bag-checkout"
              disabled={busy || !items.length}
              onClick={handleCheckoutClick}
            >
              {busy
                ? 'Connecting securely…'
                : !user
                ? 'Sign in & Checkout 🔒'
                : !hasDeliveryDetails
                ? 'Add Delivery Details ↗'
                : 'Proceed to Shopify Checkout ↗'}
            </button>
            <button type="button" className="bag-continue" onClick={() => setOpen(false)}>
              Continue exploring
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
