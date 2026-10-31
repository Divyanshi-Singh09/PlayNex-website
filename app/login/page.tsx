'use client';

import React, {useState, useEffect, Suspense} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {useRouter, useSearchParams} from 'next/navigation';
import {useAuth} from '@/components/AuthProvider';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const {user, loading, login, register, recoverPassword} = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'recover'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (!loading && user) {
      router.push(redirectUrl);
    }
  }, [user, loading, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setSubmitting(true);

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (res.success) {
          router.push(redirectUrl);
        } else {
          setError(res.error || 'Invalid email or password.');
        }
      } else if (tab === 'register') {
        const res = await register({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined
        });
        if (res.success) {
          router.push(redirectUrl);
        } else {
          setError(res.error || 'Could not create account. Please check your details.');
        }
      } else if (tab === 'recover') {
        const res = await recoverPassword(email);
        if (res.success) {
          setSuccessNotice('If an account exists for this email, password reset instructions have been sent.');
        } else {
          setError(res.error || 'Could not send recovery link.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page-shell">
      <div className="login-card">
        <div className="login-header">
          <Link href="/" className="login-logo-link" aria-label="PlayNex Home">
            <Image
              src="/images/playnex-horizontal.png"
              width={160}
              height={52}
              priority
              unoptimized
              alt="PlayNex"
            />
          </Link>

          <h1>
            {tab === 'recover'
              ? 'Reset Password'
              : tab === 'login'
              ? 'Sign In to Your Account'
              : 'Create Your Account'}
          </h1>
          <p>
            {tab === 'recover'
              ? 'Enter your email to receive password reset instructions.'
              : tab === 'login'
              ? 'Access orders, saved address, and express checkout.'
              : 'Enter your details to create your customer account.'}
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
                <span>Mobile number * (for delivery updates)</span>
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
            <div className="login-quick-links">
              <Link href="/shop" className="auth-text-link">
                ← Return to Shop
              </Link>
              <span>•</span>
              <Link href="/contact" className="auth-text-link">
                Need Help?
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="login-page-shell">
          <div className="login-card" style={{minHeight: '320px', display: 'grid', placeItems: 'center'}}>
            <p>Loading PlayNex Account…</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
