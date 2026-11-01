'use client';

import React, {useState, useEffect} from 'react';
import {useAuth} from './AuthProvider';
import {Close, Check} from './Icons';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({isOpen, onClose}: EditProfileModalProps) {
  const {user, updateDetails} = useAuth();

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('India');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill fields whenever the modal opens or user updates
  useEffect(() => {
    if (!isOpen || !user) return;

    setError(null);
    setSuccess(false);
    setSubmitting(false);

    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');

    // Format phone to strip +91 for clean editing in the input
    const rawPhone = user.phone || '';
    const cleanPhone = rawPhone.replace(/^\+91/, '').trim();
    setPhone(cleanPhone);

    // Default address
    if (user.defaultAddress) {
      setAddress1(user.defaultAddress.address1 || '');
      setAddress2(user.defaultAddress.address2 || '');
      setCity(user.defaultAddress.city || '');
      setProvince(user.defaultAddress.province || '');
      setZip(user.defaultAddress.zip || '');
      setCountry(user.defaultAddress.country || 'India');
    } else {
      // LocalStorage fallback
      try {
        const saved = localStorage.getItem('playnex_saved_delivery_address');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.address1) setAddress1(parsed.address1);
          if (parsed.address2) setAddress2(parsed.address2);
          if (parsed.city) setCity(parsed.city);
          if (parsed.province) setProvince(parsed.province);
          if (parsed.zip) setZip(parsed.zip);
          if (parsed.country) setCountry(parsed.country);
          if (!cleanPhone && parsed.phone) {
            setPhone(parsed.phone.replace(/^\+91/, '').trim());
          }
        }
      } catch {}
    }
  }, [isOpen, user]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedPhone = phone.trim();
    const digitsOnly = trimmedPhone.replace(/\D/g, '');

    // Validate phone if provided
    if (trimmedPhone && digitsOnly.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Validate address if any address field is filled
    const hasAddressField =
      address1.trim() || address2.trim() || city.trim() || province.trim() || zip.trim();

    if (hasAddressField) {
      if (!address1.trim() || address1.trim().length < 3) {
        setError('Please enter a valid street address (house/flat no. and street).');
        return;
      }
      if (!city.trim() || city.trim().length < 2) {
        setError('Please enter your city.');
        return;
      }
      if (!province.trim() || province.trim().length < 2) {
        setError('Please enter your state / province.');
        return;
      }
      if (!zip.trim() || zip.trim().length < 4) {
        setError('Please enter a valid postal / PIN code.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const fullPhone = trimmedPhone ? (trimmedPhone.startsWith('+') ? trimmedPhone : `+91${digitsOnly}`) : undefined;

      const res = await updateDetails({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: fullPhone,
        address1: address1.trim() || undefined,
        address2: address2.trim() || undefined,
        city: city.trim() || undefined,
        province: province.trim() || undefined,
        zip: zip.trim() || undefined,
        country: country.trim() || 'India'
      });

      if (!res.success) {
        setError(res.error || 'Failed to update profile. Please try again.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);

      // Auto close after brief success confirmation
      setTimeout(() => {
        onClose();
      }, 900);
    } catch {
      setError('A network error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="edit-profile-backdrop shown"
      onClick={() => {
        if (!submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        className="edit-profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="edit-profile-head">
          <div>
            <span className="micro-label">CUSTOMER SETTINGS</span>
            <h2 id="edit-profile-title">Edit Profile & Address</h2>
            <p className="edit-profile-sub">
              Manage your personal info and default delivery address.
            </p>
          </div>
          <button
            type="button"
            className="edit-profile-close-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close edit profile modal"
          >
            <Close size={18} />
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="edit-profile-alert edit-profile-alert-error" role="alert">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="edit-profile-alert edit-profile-alert-success" role="status">
            <Check size={16} />
            <span>Profile and delivery address updated successfully!</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* Section 1: Personal Info */}
          <section className="edit-profile-section">
            <h3 className="edit-section-title">
              <span>👤</span> Personal Details
            </h3>

            <div className="edit-profile-grid-2">
              <div className="edit-profile-field">
                <label htmlFor="edit-first-name">First Name</label>
                <input
                  id="edit-first-name"
                  type="text"
                  placeholder="e.g. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={submitting}
                  autoComplete="given-name"
                />
              </div>

              <div className="edit-profile-field">
                <label htmlFor="edit-last-name">Last Name</label>
                <input
                  id="edit-last-name"
                  type="text"
                  placeholder="e.g. Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={submitting}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="edit-profile-field">
              <label htmlFor="edit-phone">Mobile Phone (for delivery & SMS updates)</label>
              <div className="edit-phone-input-wrap">
                <span className="edit-phone-prefix">🇮🇳 +91</span>
                <input
                  id="edit-phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d\s-]/g, ''))}
                  disabled={submitting}
                  maxLength={14}
                  autoComplete="tel"
                />
              </div>
              <small className="edit-field-hint">
                Used by couriers for dispatch notifications and order verification.
              </small>
            </div>

            <div className="edit-profile-field">
              <label htmlFor="edit-email">Account Email</label>
              <div className="edit-readonly-input-wrap">
                <input
                  id="edit-email"
                  type="email"
                  value={user.email}
                  disabled
                  readOnly
                  aria-describedby="edit-email-hint"
                />
                <span className="edit-readonly-badge">Verified</span>
              </div>
              <small id="edit-email-hint" className="edit-field-hint">
                Your login email is securely tied to your Shopify customer account.
              </small>
            </div>
          </section>

          {/* Section 2: Delivery Address */}
          <section className="edit-profile-section">
            <div className="edit-section-head">
              <h3 className="edit-section-title">
                <span>📍</span> Default Delivery Address
              </h3>
              <span className="edit-section-badge">Auto-applied at checkout</span>
            </div>

            <div className="edit-profile-field">
              <label htmlFor="edit-address1">Street Address / House / Flat No.</label>
              <input
                id="edit-address1"
                type="text"
                placeholder="e.g. Flat 402, Sunshine Apartments, 12th Cross"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                disabled={submitting}
                autoComplete="street-address"
              />
            </div>

            <div className="edit-profile-field">
              <label htmlFor="edit-address2">Apartment, Suite, Landmark (Optional)</label>
              <input
                id="edit-address2"
                type="text"
                placeholder="e.g. Near City Park / Sector 62"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                disabled={submitting}
                autoComplete="address-line2"
              />
            </div>

            <div className="edit-profile-grid-2">
              <div className="edit-profile-field">
                <label htmlFor="edit-city">City</label>
                <input
                  id="edit-city"
                  type="text"
                  placeholder="e.g. Bengaluru, Mumbai, Noida"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={submitting}
                  autoComplete="address-level2"
                />
              </div>

              <div className="edit-profile-field">
                <label htmlFor="edit-province">State / Province</label>
                <input
                  id="edit-province"
                  type="text"
                  placeholder="e.g. Karnataka, Maharashtra, UP"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  disabled={submitting}
                  autoComplete="address-level1"
                />
              </div>
            </div>

            <div className="edit-profile-grid-2">
              <div className="edit-profile-field">
                <label htmlFor="edit-zip">Postal / PIN Code</label>
                <input
                  id="edit-zip"
                  type="text"
                  placeholder="e.g. 560001"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/[^\d\w\s-]/g, ''))}
                  disabled={submitting}
                  maxLength={10}
                  autoComplete="postal-code"
                />
              </div>

              <div className="edit-profile-field">
                <label htmlFor="edit-country">Country</label>
                <input
                  id="edit-country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={submitting}
                  autoComplete="country-name"
                />
              </div>
            </div>
          </section>

          {/* Action Footer */}
          <div className="edit-profile-footer">
            <button
              type="button"
              className="button button-outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-blue edit-submit-btn"
              disabled={submitting || success}
            >
              {submitting ? (
                <>
                  <span className="spinner-dot" /> Saving Changes…
                </>
              ) : success ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

