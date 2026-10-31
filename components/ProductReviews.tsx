'use client';

import React, {useState, useEffect, useMemo} from 'react';
import {useAuth} from './AuthProvider';
import type {ProductReview} from '@/app/api/reviews/route';

export default function ProductReviews({
  productHandle,
  productTitle
}: {
  productHandle: string;
  productTitle: string;
}) {
  const {user, openAuthModal} = useAuth();

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load reviews on mount
  useEffect(() => {
    let mounted = true;
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?handle=${encodeURIComponent(productHandle)}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.reviews) {
            setReviews(data.reviews);
          }
        }
      } catch (e) {
        console.error('Failed to load reviews:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchReviews();
    return () => {
      mounted = false;
    };
  }, [productHandle]);

  // Calculations
  const averageRating = useMemo(() => {
    if (!reviews.length) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const handleStartReview = () => {
    setError(null);
    setSuccessMsg(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: strictly ensure user is logged in
    if (!user) {
      openAuthModal();
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          handle: productHandle,
          rating,
          title,
          comment
        })
      });

      const data = await res.json();
      if (!res.ok || !data.review) {
        setError(data.error || 'Could not post review. Please try again.');
        return;
      }

      // Add new review dynamically at the top
      setReviews((prev) => [data.review, ...prev]);
      setTitle('');
      setComment('');
      setRating(5);
      setShowForm(false);
      setSuccessMsg('Thank you! Your verified review has been published.');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="product-reviews-section wrap" id="reviews" aria-label="Customer Reviews">
      <div className="product-reviews-header">
        <div>
          <span className="micro-label">COMMUNITY PERSPECTIVE</span>
          <h2>Customer reviews</h2>
          <div className="reviews-summary-row">
            <div className="reviews-stars-wrap" aria-label={`Average rating: ${averageRating} out of 5 stars`}>
              <span className="reviews-stars-filled">★★★★★</span>
              <strong className="reviews-average-score">{averageRating}</strong>
            </div>
            <span className="reviews-count-badge">
              Based on {reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>

        {!showForm && (
          <button
            type="button"
            className="button button-blue reviews-write-btn"
            onClick={handleStartReview}
          >
            {user ? 'Write a review ↗' : 'Sign in to review 🔒'}
          </button>
        )}
      </div>

      {successMsg && (
        <div className="auth-success-box" role="status" style={{marginBottom: '20px'}}>
          <span>✓</span>
          <p>{successMsg}</p>
        </div>
      )}

      {/* Review Form Area */}
      {showForm && (
        <div className="reviews-form-card">
          {!user ? (
            /* Sign-in gate for guest users */
            <div className="review-auth-gate">
              <span className="review-auth-gate-icon">🔒</span>
              <div className="review-auth-gate-copy">
                <h3>Customer sign-in required</h3>
                <p>
                  To keep all reviews authentic and helpful, only customers signed into a verified PlayNex account can publish reviews.
                </p>
                <div className="review-auth-gate-buttons">
                  <button
                    type="button"
                    className="button button-blue"
                    onClick={() => openAuthModal()}
                  >
                    Sign in or Create account ↗
                  </button>
                  <button
                    type="button"
                    className="reviews-cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Active Form for Authenticated Customers */
            <form onSubmit={handleSubmit} className="reviews-active-form">
              <div className="reviews-form-top">
                <div>
                  <span className="micro-label">WRITE A REVIEW FOR</span>
                  <h3>{productTitle}</h3>
                </div>
                <div className="review-author-pill">
                  <span className="review-author-dot" />
                  <span>
                    Reviewing as <strong>{user.firstName || user.displayName}</strong> (Verified)
                  </span>
                </div>
              </div>

              {error && (
                <div className="auth-error-box" role="alert">
                  <span>⚠</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Star Rating Picker */}
              <div className="reviews-rating-picker-wrap">
                <span className="field-label-text">Your Rating *</span>
                <div className="reviews-star-buttons" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`star-pick-btn ${
                        (hoverRating || rating) >= star ? 'star-active' : ''
                      }`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={`${star} star`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="reviews-rating-text-label">
                    {rating === 5 && '5/5 — Excellent'}
                    {rating === 4 && '4/5 — Very Good'}
                    {rating === 3 && '3/5 — Good'}
                    {rating === 2 && '2/5 — Fair'}
                    {rating === 1 && '1/5 — Poor'}
                  </span>
                </div>
              </div>

              {/* Headline */}
              <label className="auth-field">
                <span>Review headline *</span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Remarkable build quality and smooth feel"
                  maxLength={100}
                />
              </label>

              {/* Body */}
              <label className="auth-field">
                <span>Your review *</span>
                <textarea
                  required
                  rows={4}
                  className="reviews-textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked about this item, how you use it, or what others should know..."
                  maxLength={1000}
                />
              </label>

              <div className="reviews-form-actions">
                <button
                  type="submit"
                  className="button button-blue reviews-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Publishing review…' : 'Submit Review ↗'}
                </button>
                <button
                  type="button"
                  className="reviews-cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-grid">
        {loading ? (
          <div className="reviews-loading">
            <span className="reviews-skeleton-pulse" />
            <p>Loading community reviews…</p>
          </div>
        ) : reviews.length ? (
          reviews.map((r) => (
            <article className="review-card" key={r.id}>
              <div className="review-card-top">
                <div className="review-stars-row" aria-label={`${r.rating} stars`}>
                  {'★'.repeat(r.rating)}
                  {'☆'.repeat(Math.max(0, 5 - r.rating))}
                </div>
                <time className="review-date">{r.date}</time>
              </div>

              <h4 className="review-title">{r.title}</h4>
              <p className="review-comment">{r.comment}</p>

              <div className="review-footer">
                <span className="review-author-name">{r.author}</span>
                {r.verified && (
                  <span className="review-verified-badge">
                    <span className="review-check-icon">✓</span> Verified Buyer
                  </span>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="reviews-empty">
            <span>✳</span>
            <h3>Be the first to review</h3>
            <p>Share your experience with this item and help other members of our community.</p>
            <button
              type="button"
              className="button button-blue"
              onClick={handleStartReview}
            >
              {user ? 'Write the first review ↗' : 'Sign in to review 🔒'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

