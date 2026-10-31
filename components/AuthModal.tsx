'use client';

import React, {useState, useEffect} from 'react';
import {useAuth} from './AuthProvider';
import {Close} from './Icons';

export default function AuthModal() {
  const {user, isAuthModalOpen, closeAuthModal, authModalReason, login, register, recoverPassword} = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'recover'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
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

  // Lock body scroll when modal is open
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

  // Never show auth modal if user is already signed in
  if (!isAuthModalOpen || user) return null;

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
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          address: address1.trim()
            ? {
                address1: address1.trim(),
                city: city.trim(),
                province: '',
                zip: zip.trim(),
                country: 'India'
              }
            : undefined
        });

        if (res.success) {
          try {
            localStorage.setItem(
              'playnex_saved_delivery_address',
              JSON.stringify({
                phone: phone.trim(),
                address1: address1.trim(),
                city: city.trim(),
                zip: zip.trim()
              })
            );
          } catch {}
        } else {
          setError(res.error || 'Could not create account. Please check your details.');
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

        <div className="auth-header">
          <h2>
            {tab === 'recover'
              ? 'Reset Password'
              : authModalReason === 'checkout'
              ? 'Sign in to Checkout'
              : tab === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </h2>
          <p>
            {tab === 'recover'
              ? 'Enter your email address to receive reset instructions.'
              : authModalReason === 'checkout'
              ? 'Sign in or create an account to complete your order.'
              : tab === 'login'
              ? 'Welcome back to PlayNex.'
              : 'Save your details once to order and track shipments.'}
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
                setSuccessNotice(null);
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
                setSuccessNotice(null);
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
                    placeholder="First name"
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
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                </label>
              </div>

              <label className="auth-field">
                <span>Mobile number * (for courier delivery updates)</span>
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
                <span>Delivery address * (House/Flat, Street)</span>
                <input
                  type="text"
                  required
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="e.g. Flat 402, Lotus Towers, 5th Main Road"
                  autoComplete="street-address"
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
                    placeholder="City"
                    autoComplete="address-level2"
                  />
                </label>
                <label className="auth-field">
                  <span>PIN code *</span>
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
              </div>
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
                      setSuccessNotice(null);
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
              🔒 Details saved securely to your Shopify customer account.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
