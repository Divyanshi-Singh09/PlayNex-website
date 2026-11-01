import React from 'react';
import Image from 'next/image';

interface ProductStoryProps {
  productTitle?: string;
  isDiscover?: boolean;
}

export default function ProductStorySection({productTitle = 'PlayNex Companion', isDiscover = false}: ProductStoryProps) {
  return (
    <section id="story" className="folotoy-story-section wrap">
      {/* Editorial Header */}
      <div className="story-section-header">
        <span className="micro-label">THE EXPERIENCE</span>
        <h2>A companion that truly listens, speaks & inspires.</h2>
        <p className="story-section-subtitle">
          Designed to bring magical, screen-free engagement into children’s daily play. Combining warm huggable plush
          with next-generation conversational intelligence.
        </p>
      </div>

      {/* Feature Story Grid */}
      <div className="folotoy-story-grid">
        {/* Story Card 1 */}
        <div className="story-card featured">
          <div className="story-card-body">
            <span className="story-card-pill">🎙️ ZERO SCREENS NEEDED</span>
            <h3>Press Paw to Talk</h3>
            <p>
              An intuitive tactile button hidden right inside the paw lets children hold natural conversations. No
              phones, no blue light, and no complicated apps during playtime.
            </p>
            <ul className="story-card-perks">
              <li>✓ Real-time interactive voice replies</li>
              <li>✓ Understands questions and follows along</li>
              <li>✓ Sparks imagination and creative roleplay</li>
            </ul>
          </div>
          <div className="story-card-visual">
            <div className="paw-interactive-visual">
              <span className="paw-icon">🐾</span>
              <span className="paw-soundwave">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="paw-caption">“Tell me a bedtime story about a baby dinosaur!”</span>
            </div>
          </div>
        </div>

        {/* Story Card 2 */}
        <div className="story-card">
          <div className="story-card-body">
            <span className="story-card-pill">🧼 100% WASHABLE</span>
            <h3>Removable Smart AI Core</h3>
            <p>
              Kids take their teddy everywhere—from breakfast tables to muddy backyard adventures. A concealed zipper
              compartment lets parents pop the AI capsule out in 5 seconds to hand-wash or spot-clean the plush exterior.
            </p>
            <div className="story-core-chips">
              <span>Quick Zip</span>
              <span>Pop-Out Core</span>
              <span>Fresh & Clean</span>
            </div>
          </div>
        </div>

        {/* Story Card 3 */}
        <div className="story-card">
          <div className="story-card-body">
            <span className="story-card-pill">🌍 MULTILINGUAL LEARNING</span>
            <h3>Speaks 10+ Languages</h3>
            <p>
              Whether practicing English, Hindi, French, Spanish, or Japanese, your companion chats fluently in multiple
              languages—helping children develop vocabulary and phonics naturally.
            </p>
            <div className="story-languages-badge">
              <span>English</span>
              <span>हिन्दी</span>
              <span>Español</span>
              <span>Français</span>
              <span>日本語</span>
              <span>Deutsch</span>
            </div>
          </div>
        </div>

        {/* Story Card 4 */}
        <div className="story-card">
          <div className="story-card-body">
            <span className="story-card-pill">🛡️ PARENT APPROVED</span>
            <h3>Safety & Privacy Guardrails</h3>
            <p>
              Built specifically for children. Strict content moderation filters ensure conversations stay wholesome,
              educational, and safe. Zero built-in cameras, zero ads, and encrypted cloud connectivity.
            </p>
            <div className="story-safety-tags">
              <span>🔒 Encrypted Wi-Fi</span>
              <span>🚫 No Cameras</span>
              <span>✨ Age-Appropriate AI</span>
            </div>
          </div>
        </div>

        {/* Story Card 5 */}
        <div className="story-card">
          <div className="story-card-body">
            <span className="story-card-pill">🌐 ON-THE-GO COMPANION</span>
            <h3>Dual Wi-Fi & Hotspot</h3>
            <p>
              Seamlessly connects to home 2.4GHz Wi-Fi or your mobile phone’s hotspot. Perfect for road trips, flights,
              and hotel stays so the fun never stops.
            </p>
            <div className="story-connectivity-meta">
              <span>🔋 800mAh Battery (~6 hrs talk)</span>
              <span>⚡ Fast USB-C Port</span>
            </div>
          </div>
        </div>
      </div>

      {/* What's In The Box Unboxing Strip */}
      <div id="unboxing" className="folotoy-unboxing-box">
        <div className="unboxing-head">
          <span className="micro-label">INSIDE THE PACKAGE</span>
          <h3>What’s in the Box</h3>
        </div>
        <div className="unboxing-items-grid">
          <div className="unboxing-item">
            <span className="item-icon">🧸</span>
            <strong>1× AI Plush Companion</strong>
            <small>Ultra-soft velvet plush (35 cm)</small>
          </div>
          <div className="unboxing-item">
            <span className="item-icon">🧠</span>
            <strong>1× Smart AI Capsule</strong>
            <small>Removable core with Wi-Fi & speaker</small>
          </div>
          <div className="unboxing-item">
            <span className="item-icon">⚡</span>
            <strong>1× Braided USB-C Cable</strong>
            <small>Durable fast charging cable</small>
          </div>
          <div className="unboxing-item">
            <span className="item-icon">📖</span>
            <strong>1× Quick-Start Guide</strong>
            <small>Setup & parent dashboard card</small>
          </div>
        </div>
      </div>
    </section>
  );
}

