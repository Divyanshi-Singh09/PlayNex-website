'use client';

import React from 'react';
import Link from 'next/link';

interface FAQItem {
  q: string;
  a: string | React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    q: 'How does the AI Teddy connect to Wi-Fi or Mobile Hotspot?',
    a: 'Setup takes under 60 seconds. You power on the companion, open the PlayNex setup app (or browser portal), select your 2.4GHz home Wi-Fi or mobile hotspot, and you are ready. For car trips, plane travel, or outdoor visits, it effortlessly connects to your smartphone hotspot.'
  },
  {
    q: 'Does it require any monthly subscription or hidden fees?',
    a: 'No recurring monthly subscription is required! Conversational AI access, educational stories, voice responses, and trivia are fully included with your purchase.'
  },
  {
    q: 'Can the plush toy be washed when it gets dirty?',
    a: 'Yes, 100%! The plush is designed with a hidden, child-safe zippered compartment on the back. Simply unzip and slide out the compact AI capsule. The exterior plush fabric can be hand-washed or gentle machine-washed, keeping it clean, hygienic, and fresh.'
  },
  {
    q: 'Is my child’s voice data and privacy protected?',
    a: 'Safety and privacy are our top priorities. There are zero cameras, zero third-party advertisements, and all voice communications use end-to-end SSL/TLS encryption. Built-in moderation guardrails prevent adult topics and ensure every conversation is age-appropriate, wholesome, and safe.'
  },
  {
    q: 'What languages does the companion speak and teach?',
    a: 'It is fully multilingual and speaks English, Hindi, Spanish, French, Japanese, German, and more. Children can chat naturally in their native tongue or practice conversational phrases in a second language.'
  },
  {
    q: 'How long does the battery last and how is it recharged?',
    a: 'The built-in 800mAh rechargeable lithium battery provides up to 6 hours of continuous active conversation or multiple days of intermittent bedtime storytelling. It charges quickly with the included USB-C braided cable.'
  },
  {
    q: 'What is your warranty and return policy?',
    a: (
      <span>
        Every companion comes with an official 1-year PlayNex manufacturer warranty and a 30-day risk-free return
        guarantee. If you or your child are not completely delighted, visit our{' '}
        <Link href="/returns">Returns Policy</Link> or <Link href="/contact">contact our support team</Link>.
      </span>
    )
  }
];

export default function ProductFAQ() {
  return (
    <section id="faq" className="folotoy-faq-section wrap">
      <div className="section-head text-center">
        <span className="micro-label">FREQUENTLY ASKED QUESTIONS</span>
        <h2>Everything you need to know.</h2>
        <p className="faq-section-subtitle">
          Have a question before ordering? Here are clear answers to our most common questions from parents and buyers.
        </p>
      </div>

      <div className="folotoy-faq-list">
        {FAQS.map((item, idx) => (
          <details key={idx} className="folotoy-faq-item">
            <summary>
              <span>{item.q}</span>
              <span className="faq-chevron">▾</span>
            </summary>
            <div className="faq-item-body">
              <p>{item.a}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="faq-help-strip">
        <p>Still have questions about features, delivery or setup?</p>
        <Link href="/contact" className="button button-white">
          Contact our team anytime ↗
        </Link>
      </div>
    </section>
  );
}

