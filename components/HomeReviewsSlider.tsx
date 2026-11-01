'use client';

import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import type {ProductReview} from '@/app/api/reviews/route';
import {Arrow} from './Icons';

interface HomeReviewsSliderProps {
  initialReviews?: ProductReview[];
}

export default function HomeReviewsSlider({initialReviews}: HomeReviewsSliderProps) {
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews || []);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<'normal' | 'slow'>('normal');

  // Load reviews from API if needed to keep fresh
  useEffect(() => {
    let mounted = true;
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (mounted && Array.isArray(data.reviews) && data.reviews.length > 0) {
            setReviews(data.reviews);
          }
        }
      } catch (err) {
        console.warn('Could not load reviews for home slider:', err);
      }
    }

    if (!initialReviews || initialReviews.length === 0) {
      fetchReviews();
    }
    return () => {
      mounted = false;
    };
  }, [initialReviews]);

  if (!reviews || reviews.length === 0) return null;

  // Duplicate reviews array to create seamless infinite continuous loop
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <section
      className="home-reviews-slider-section"
      aria-label="Continuous Customer Reviews"
    >
      <div className="wrap">
        {/* Section Header */}
        <div className="home-reviews-header">
          <div className="home-reviews-title-col">
            <p className="eyebrow">
              <span className="eyebrow-indicator" />
              VERIFIED CUSTOMER STORIES
            </p>
            <h2>
              Loved by families & creators.<br />
              <em>Real moments, genuine words.</em>
            </h2>
          </div>

          <div className="home-reviews-stats-col">
            <div className="home-reviews-score-pill">
              <div className="stars-row" aria-label="5 out of 5 stars">
                {'★★★★★'}
              </div>
              <div className="score-details">
                <strong>5.0 / 5.0 Rating</strong>
                <span>Verified Customer Reviews</span>
              </div>
            </div>

            {/* Play/Pause & Speed Controls */}
            <div className="home-reviews-marquee-controls">
              <button
                type="button"
                className={`marquee-control-btn ${isPaused ? 'active' : ''}`}
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? 'Resume scrolling reviews' : 'Pause scrolling reviews'}
                title={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
              >
                {isPaused ? '▶ Play' : '❚❚ Pause'}
              </button>
              <button
                type="button"
                className="marquee-control-btn speed-btn"
                onClick={() => setSpeed(speed === 'normal' ? 'slow' : 'normal')}
                title="Toggle continuous scroll speed"
              >
                {speed === 'normal' ? '1x Speed' : '0.5x Slow'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Continuous Running Viewport */}
      <div
        className="home-reviews-marquee-viewport"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`home-reviews-marquee-track ${isPaused ? 'is-paused' : ''} speed-${speed}`}
        >
          {duplicatedReviews.map((rev, idx) => {
            const authorInitial = rev.author ? rev.author.trim()[0].toUpperCase() : 'U';
            const avatarThemes = ['avatar-sky', 'avatar-mint', 'avatar-peach', 'avatar-amber'];
            const themeClass = avatarThemes[idx % avatarThemes.length];

            return (
              <article
                key={`${rev.id || idx}-${idx}`}
                className="home-review-card"
              >
                {/* Top rating & verified badge */}
                <div className="home-review-card-top">
                  <div className="card-stars">
                    {Array.from({length: 5}, (_, i) => (
                      <span
                        key={i}
                        className={i < rev.rating ? 'star-filled' : 'star-empty'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="card-verified-badge">✓ Verified Buyer</span>
                  )}
                </div>

                {/* Review Title & Comment */}
                <h3 className="card-review-title">{rev.title}</h3>
                <p className="card-review-comment">“{rev.comment}”</p>

                {/* Card Footer: Author info & product reference */}
                <div className="card-review-author-row">
                  <div className={`card-author-avatar ${themeClass}`}>
                    {authorInitial}
                  </div>
                  <div className="card-author-meta">
                    <strong>{rev.author}</strong>
                    <span className="card-review-date">{rev.date}</span>
                  </div>
                  <Link
                    href={`/products/${rev.handle || 'abc'}`}
                    className="card-product-tag"
                    title="View featured product"
                  >
                    PlayNex Companion ↗
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Bottom Sub-Action */}
      <div className="wrap">
        <div className="home-reviews-bottom-action">
          <p>
            Hover or tap any review to pause and read. Share your own experience on any product page.
          </p>
          <Link href="/shop" className="text-button">
            Browse all companion items <Arrow size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
