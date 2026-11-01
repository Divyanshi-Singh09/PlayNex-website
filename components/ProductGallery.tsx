'use client';

import React, {useState, useRef, useEffect} from 'react';
import Image from 'next/image';

interface ProductImage {
  url: string;
  altText?: string | null;
}

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  badge?: string;
}

export default function ProductGallery({images, title, badge}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  // Fallback to PlayNex brand image if no images provided
  const displayImages = images.length > 0 ? images : [{url: '/images/playnex-original-logo.png', altText: title}];
  const activeImage = displayImages[activeIndex] || displayImages[0];

  useEffect(() => {
    setImgError(false);
  }, [activeIndex]);

  const currentSrc = imgError
    ? '/images/playnex-original-logo.png'
    : activeImage.url;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbsRef.current) {
      const activeThumb = thumbsRef.current.children[activeIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
      }
    }
  }, [activeIndex]);

  // Handle escape key for lightbox
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isLightboxOpen, displayImages.length]);

  return (
    <div className="folotoy-gallery-wrapper">
      {/* Primary Display Stage */}
      <div className="folotoy-gallery-stage">
        <div className="folotoy-gallery-stage-inner" onClick={() => setIsLightboxOpen(true)}>
          <Image
            src={currentSrc}
            alt={activeImage.altText || `${title} view ${activeIndex + 1}`}
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
            priority
            unoptimized
            draggable={false}
            onError={() => setImgError(true)}
            className="folotoy-gallery-img"
          />

          {/* Floating Badges */}
          <div className="folotoy-gallery-badges">
            <span className="folotoy-badge stock">
              <span className="pulse-dot" /> IN STOCK
            </span>
            <span className="folotoy-badge washable">
              🧼 100% WASHABLE PLUSH
            </span>
          </div>

          {/* Zoom hint overlay */}
          <div className="folotoy-zoom-hint" aria-hidden="true">
            <span className="zoom-icon">🔍</span> Click to zoom
          </div>
        </div>

        {/* Gallery Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              className="folotoy-gallery-nav prev"
              onClick={handlePrev}
              aria-label="Previous product image"
            >
              ‹
            </button>
            <button
              type="button"
              className="folotoy-gallery-nav next"
              onClick={handleNext}
              aria-label="Next product image"
            >
              ›
            </button>
          </>
        )}

        {/* Counter Pill */}
        {displayImages.length > 1 && (
          <div className="folotoy-gallery-counter">
            {activeIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Clickable Thumbnails Row */}
      {displayImages.length > 1 && (
        <div className="folotoy-thumbs-row" ref={thumbsRef} role="tablist" aria-label="Product thumbnails">
          {displayImages.map((img, idx) => (
            <button
              key={img.url + idx}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Show image ${idx + 1}`}
              className={`folotoy-thumb-btn ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
            >
              <Image
                src={img.url}
                alt={img.altText || `${title} thumbnail ${idx + 1}`}
                width={78}
                height={78}
                unoptimized={img.url.startsWith('http')}
                className="folotoy-thumb-img"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="folotoy-lightbox-backdrop" onClick={() => setIsLightboxOpen(false)}>
          <div className="folotoy-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="folotoy-lightbox-close"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close zoomed image"
            >
              ×
            </button>

            <div className="folotoy-lightbox-stage">
              <Image
                src={currentSrc}
                alt={activeImage.altText || `${title} zoomed view`}
                fill
                sizes="95vw"
                unoptimized={currentSrc.startsWith('http')}
                className="folotoy-lightbox-img"
              />
            </div>

            {displayImages.length > 1 && (
              <div className="folotoy-lightbox-controls">
                <button type="button" onClick={handlePrev} className="button button-white">
                  ‹ Prev
                </button>
                <span>
                  {activeIndex + 1} of {displayImages.length}
                </span>
                <button type="button" onClick={handleNext} className="button button-white">
                  Next ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

