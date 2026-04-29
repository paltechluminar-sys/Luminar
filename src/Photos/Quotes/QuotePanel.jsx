import React, { useState, useRef, useEffect } from 'react';
import './QuotePanel.css';
import VerificationBadge from '../../Admin/components/VerificationBadge';

export const QuotePanel = ({ onDesignSelect, selectedDesign }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    };

    const panel = panelRef.current;
    if (panel) {
      panel.addEventListener('scroll', handleScroll);
      return () => {
        panel.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeoutRef.current);
      };
    }
  }, []);

  const quoteDesigns = [
    {
      id: 'Sample Quote 1',
      name: 'Sample Quote 1',
      layout: 'social',
      backgroundColor: 'rgba(20, 20, 20, 0.95)',
      textColor: '#FFFFFF',
      accentColor: '#1DA1F2',
      borderStyle: 'rounded-border',
      borderRadius: '12px',
      hasProfile: true,
      hasVerification: true,
      hasHandle: true,
    },
    {
      id: 'Sample Quote 2',
      name: 'Sample Quote 2',
      layout: 'inspirational',
      backgroundColor: '#1a1a1a',
      textColor: '#FFFFFF',
      accentColor: '#FFD700',
      borderStyle: 'no-border',
      borderRadius: '0px',
      hasProfile: true,
      hasQuoteMarks: true,
      highlightColor: '#FFD700',
    },
    {
      id: 'Sample Quote 3',
      name: 'Sample Quote 3',
      layout: 'large-quote',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      accentColor: '#FFFFFF',
      borderStyle: 'no-border',
      borderRadius: '0px',
      hasHandle: true,
    },
    {
      id: 'Sample Quote 4',
      name: 'Sample Quote 4',
      layout: 'portrait-quote',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      accentColor: '#FFFFFF',
      borderStyle: 'no-border',
      borderRadius: '0px',
      hasPortrait: true,
    },
    {
      id: 'Sample Quote 5',
      name: 'Sample Quote 5',
      layout: 'photo-quote-side',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      accentColor: '#FFFFFF',
      borderStyle: 'no-border',
      borderRadius: '0px',
      hasPhotoSide: true,
    },
    {
      id: 'Sample Quote 6',
      name: 'Sample Quote 6',
      layout: 'photo-quote-side-flipped',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      accentColor: '#FFFFFF',
      borderStyle: 'no-border',
      borderRadius: '0px',
      hasPhotoSideFlipped: true,
    },
    {
      id: 'Sample Quote 7',
      name: 'Sample Quote 7',
      layout: 'illustrated-quote',
      backgroundColor: '#F5E6D3',
      textColor: '#000000',
      accentColor: '#8B7355',
      borderStyle: 'no-border',
      borderRadius: '0px',
      hasIllustration: true,
    },
  ];

  const renderQuotePreview = (design) => {
    // Social Media: Twitter/X style card with profile
    if (design.id === 'Sample Quote 1') {
      return (
        <div className="social-preview-exact">
          <div className="social-avatar-exact" style={{ background: design.accentColor }} />
          <div className="social-content-exact">
            <div className="social-title-line-exact">
              <span className="social-title-text-exact">Sample Quote 1</span>
              <VerificationBadge tier="premium" size="sm" showTooltip={false} />
            </div>
            <div className="social-handle-exact">@speaker</div>
            <div className="social-body-text-exact">Quote text appears here</div>
          </div>
        </div>
      );
    }

    // Inspirational: Minimalist design with yellow quotation marks and highlights
    if (design.id === 'Sample Quote 2') {
      return (
        <div className="inspirational-preview-new">
          <div className="inspirational-quote-open">"</div>
          <div className="inspirational-text-new">
            <strong>Sample quote 2.</strong> Quote text appears here
          </div>
          <div className="inspirational-author-new">- Speaker</div>
        </div>
      );
    }

    // Large Quote: Big centered quote design
    if (design.id === 'Sample Quote 3') {
      return (
        <div className="large-quote-preview">
          <div className="large-quote-handle">@BIGDREAMS.IN</div>
          <div className="large-quote-text">Sample quote 3. Quote text appears here</div>
          <div className="large-quote-author">- Speaker</div>
        </div>
      );
    }

    // Portrait Quote: Photo with multi-line quote design
    if (design.id === 'Sample Quote 4') {
      return (
        <div className="portrait-quote-preview">
          <div className="portrait-quote-text">"Sample quote 4. Quote text appears here and spans multiple lines."</div>
          <div className="portrait-quote-author">~ Speaker</div>
        </div>
      );
    }

    // Photo Quote Side: Large quotation mark with multi-line text and photo on right
    if (design.id === 'Sample Quote 5') {
      return (
        <div className="photo-quote-side-preview">
          <div className="photo-quote-side-content">
            <div className="photo-quote-mark">"</div>
            <div className="photo-quote-text">You'll never be criticized by someone who is doing more than you.</div>
            <div className="photo-quote-author">- DENZEL WASHINGTON</div>
          </div>
          <div className="photo-quote-side-image" />
        </div>
      );
    }

    // Photo Quote Side Flipped: Photo on left, large quotation mark with text and author on right
    if (design.id === 'Sample Quote 6') {
      return (
        <div className="photo-quote-side-flipped-preview">
          <div className="photo-quote-side-image-flipped" />
          <div className="photo-quote-side-content-flipped">
            <div className="photo-quote-mark-flipped">"</div>
            <div className="photo-quote-text-flipped">You'll never be criticized by someone who is doing more than you.</div>
            <div className="photo-quote-author-flipped">- DENZEL WASHINGTON</div>
          </div>
        </div>
      );
    }

    // Illustrated Quote: Portrait background with quote overlay
    if (design.id === 'Sample Quote 7') {
      return (
        <div className="illustrated-quote-preview">
          <div className="illustrated-quote-content">
            <div className="illustrated-quote-text">"Sample quote 7. Quote text appears here and spans multiple lines."</div>
            <div className="illustrated-quote-author">- Speaker</div>
          </div>
          <div className="illustrated-quote-image" />
        </div>
      );
    }


    return null;
  };

  return (
    <div className={`quote-panel ${isScrolling ? 'is-scrolling' : ''}`} ref={panelRef}>
      <div className="quote-designs-grid">
        {/* Row 1: Cards 1-4 */}
        <div className="quote-row">
          {quoteDesigns.slice(0, 4).map((design, index) => (
            <div
              key={design.id}
              className={`quote-design-card ${selectedDesign === design.id ? 'active' : ''}`}
              onClick={() => onDesignSelect(design)}
              title={design.name}
            >
              {renderQuotePreview(design)}
              <div className="quote-design-name">{design.name}</div>
            </div>
          ))}
        </div>
        {/* Row 2: Cards 5-6 (Portrait) */}
        <div className="quote-row">
          {quoteDesigns.slice(4).map((design) => (
            <div
              key={design.id}
              className={`quote-design-card ${selectedDesign === design.id ? 'active' : ''}`}
              onClick={() => onDesignSelect(design)}
              title={design.name}
            >
              {renderQuotePreview(design)}
              <div className="quote-design-name">{design.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
