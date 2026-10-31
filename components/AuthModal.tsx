'use client';

import React, {useState, useEffect} from 'react';
import {useAuth} from './AuthProvider';
import {Close} from './Icons';

export default function AuthModal() {
  const {isAuthModalOpen, closeAuthModal, authModalReason, pendingCartItem, login, register, recoverPassword} = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'recover'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [zip, setZip] = useState('');
  const [country] = useState('India');
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Reset errors and fields when modal opens or tab changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null);
      setSuccessNotice(null);
      setSubmitting(false);
    }
  }, [isAuthModalOpen, tab]);

  // Handle ESC key
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Lock scroll when open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setSubmitting(true);

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Invalid email or password.');
        }
      } else if (tab === 'register') {
        const res = await register({
          firstName,
          lastName,
          email,
          password,
          phone: phone.trim() || undefined,
          address: address1.trim()
            ? {
                address1: address1.trim(),
                city: city.trim(),
                province: province.trim(),
                zip: zip.trim(),
                country
              }
            : undefined
        });
        if (!res.success) {
          setError(res.error || 'Could not create account.');
        }
      } else if (tab === 'recover') {
        const res = await recoverPassword(email);
        if (res.success) {
          setSuccessNotice('If an account exists for this email, password reset instructions have been sent.');
        } else {
          setError(res.error || 'Could not send reset email.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-backdrop" onClick={closeAuthModal} aria-modal="true" role="dialog">
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="auth-close-btn"
          onClick={closeAuthModal}
          aria-label="Close dialog"
        >
          <Close size={18} />
        </button>

        {/* Checkout requirement notice */}
        {authModalReason === 'checkout' && (
          <div className="auth-cart-notice">
            <span className="auth-lock-icon">🔒</span>
            <div>
              <strong>Sign in required to checkout</strong>
              <p>Please sign in or create an account to confirm your delivery address, mobile number, and complete checkout.</p>
            </div>
          </div>
        )}

        {/* Security / Pending Item Notice (fallback) */}
        {pendingCartItem && !authModalReason && (
          <div className="auth-cart-notice">
            <span className="auth-lock-icon">🔒</span>
            <div>
              <strong>Sign in to proceed</strong>
              <p>
                Sign in to your account to securely manage{' '}
                <span className="auth-item-title">&ldquo;{pendingCartItem.title}&rdquo;</span> in your bag.
              </p>
            </div>
          </div>
        )}

        <div className="auth-header">
          <h2>
            {tab === 'login' && 'Sign in to PlayNex'}
            {tab === 'register' && 'Create your account'}
            {tab === 'recover' && 'Reset your password'}
          </h2>
          <p>
            {tab === 'login' && 'Access your orders, saved items, and verified checkout.'}
            {tab === 'register' && 'Join PlayNex for personalized experiences, faster checkout, and direct orders.'}
            {tab === 'recover' && 'Enter your email address and we will send you a reset link.'}
          </p>
        </div>

        {tab !== 'recover' && (
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'login'}
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setTab('login');
                setError(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'register'}
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setTab('register');
                setError(null);
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {error && (
          <div className="auth-error-box" role="alert">
            <span>⚠</span>
            <p>{error}</p>
          </div>
        )}

        {successNotice && (
          <div className="auth-success-box" role="status">
            <span>✓</span>
            <p>{successNotice}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'register' && (
            <>
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
                <span>Mobile number (for delivery coordination)</span>
                <div className="bag-phone-input-wrap">
                  <span className="bag-phone-prefix">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                  />
                </div>
              </label>

              <button
                type="button"
                className="auth-link-btn"
                style={{alignSelf: 'flex-start', margin: '1px 0 3px'}}
                onClick={() => setShowAddressFields(!showAddressFields)}
              >
                {showAddressFields ? '− Remove delivery address' : '+ Add delivery address now (optional)'}
              </button>

              {showAddressFields && (
                <>
                  <label className="auth-field">
                    <span>Street address</span>
                    <input
                      type="text"
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                      placeholder="Flat/House no., building, street"
                      autoComplete="street-address"
                    />
                  </label>

                  <div className="auth-name-row">
                    <label className="auth-field">
                      <span>City</span>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Mumbai"
                      />
                    </label>
                    <label className="auth-field">
                      <span>PIN code</span>
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="e.g. 400001"
                      />
                    </label>
                  </div>
                </>
              )}
            </>
          )}

          <label className="auth-field">
            <span>Email address *</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
            />
          </label>

          {tab !== 'recover' && (
            <label className="auth-field">
              <div className="auth-field-header">
                <span>Password *</span>
                {tab === 'login' && (
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setTab('recover');
                      setError(null);
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={5}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tab === 'register' ? 'At least 5 characters' : 'Enter your password'}
                  autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
          )}

          <button
            type="submit"
            className="button button-blue auth-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <span>Connecting securely…</span>
            ) : (
              <>
                {tab === 'login' && 'Sign In ↗'}
                {tab === 'register' && 'Create Account ↗'}
                {tab === 'recover' && 'Send Reset Link ↗'}
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-help">
          {tab === 'recover' ? (
            <button
              type="button"
              className="auth-text-link"
              onClick={() => {
                setTab('login');
                setError(null);
                setSuccessNotice(null);
              }}
            >
              ← Back to Sign In
            </button>
          ) : (
            <p className="auth-terms-note">
              🔒 Safe & secure customer accounts verified by Shopify. By continuing, you agree to PlayNex&apos;s Terms & Privacy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
