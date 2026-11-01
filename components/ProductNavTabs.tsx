'use client';

import React, {useState, useEffect} from 'react';

const TABS = [
  {id: 'overview', label: 'Overview'},
  {id: 'story', label: 'Magic & Features'},
  {id: 'specifications', label: 'Specifications'},
  {id: 'unboxing', label: 'In the Box'},
  {id: 'faq', label: 'FAQs'},
  {id: 'reviews', label: 'Reviews'}
];

export default function ProductNavTabs() {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      for (let i = TABS.length - 1; i >= 0; i--) {
        const el = document.getElementById(TABS[i].id);
        if (el && el.offsetTop - 120 <= scrollY) {
          setActiveTab(TABS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({top, behavior: 'smooth'});
      setActiveTab(id);
    }
  };

  return (
    <nav className="product-quick-nav-wrap wrap" aria-label="Product section quick navigation">
      <div className="product-quick-nav-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`product-quick-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => scrollToSection(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

