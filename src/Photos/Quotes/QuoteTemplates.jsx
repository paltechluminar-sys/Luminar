import React from 'react';
import './QuoteTemplate.css';
import VerificationBadge from '../../Admin/components/VerificationBadge';
import { Quote2Template } from './Quote2Template';
import { Quote3Template } from './Quote3Template';
import { Quote4Template } from './Quote4Template';
import { Quote7Template } from './Quote7Template';

/**
 * Quote Templates Component
 * Renders 10 different quote layouts based on the selected template
 * Each template has its own styling and layout
 */
export const QuoteTemplates = ({
  selectedDesign = 'social',
  quoteText = '',
  speaker = '',
  quoteImageUrl = null,
  containerWidth = 400,
  containerHeight = 300,
}) => {
  // Social Media Style: Twitter-like with profile and verification
  const renderSocialTemplate = () => (
    <div className="quote-template quote-template-social">
      <div className="social-card">
        <div className="social-top">
          <div className="social-avatar"></div>
          <div className="social-meta">
            <div className="social-name-line">
              <span className="social-name">Elon Musk</span>
              <VerificationBadge tier="premium" size="sm" showTooltip={false} />
            </div>
            <span className="social-handle">@elonmusk</span>
          </div>
        </div>
        <div className="social-quote-body">
          <p className="social-quote-text">{quoteText}</p>
        </div>
      </div>
    </div>
  );

  // Inspirational: Minimalist with gold accents
  const renderInspirationTemplate = () => (
    <Quote2Template 
      quoteText={quoteText}
    />
  );

  // Large Quote: Big, bold centered text
  const renderLargeQuoteTemplate = () => (
    <Quote3Template
      quoteText={quoteText}
      speaker={speaker || 'Speaker'}
      handle="BIGDREAMS.IN"
    />
  );

  // Portrait Quote: Centered quote with author on left/right
  const renderPortraitTemplate = () => (
    <Quote4Template
      quoteText={quoteText}
      speaker={speaker || 'Speaker'}
    />
  );

  // Photo + Quote Side: Image on right, quote on left
  const renderPhotoQuoteSideTemplate = () => (
    <div className="quote-template quote-template-photo-quote-side">
      <div className="quote-content-side">
        <div className="quote-mark-large">"</div>
        <p className="quote-text-side">{quoteText}</p>
        <p className="quote-speaker-side">{speaker || 'Speaker'}</p>
      </div>
      <div className="quote-image-side">
        {quoteImageUrl && (
          <img src={quoteImageUrl} alt="Quote" className="quote-image-content" />
        )}
      </div>
    </div>
  );

  // Photo + Quote Side Flipped: Image on left, quote on right
  const renderPhotoQuoteSideFlippedTemplate = () => (
    <div className="quote-template quote-template-photo-quote-side-flipped">
      <div className="quote-image-side-flipped">
        {quoteImageUrl && (
          <img src={quoteImageUrl} alt="Quote" className="quote-image-content" />
        )}
      </div>
      <div className="quote-content-side-flipped">
        <div className="quote-mark-large-flipped">"</div>
        <p className="quote-text-side-flipped">{quoteText}</p>
        <p className="quote-speaker-side-flipped">{speaker || 'Speaker'}</p>
      </div>
    </div>
  );

  // Red Border Quote: Clean with prominent border
  const renderRedBorderTemplate = () => (
    <div className="quote-template quote-template-red-border">
      <div className="red-border-content">
        <span className="red-border-open">"</span>
        <p className="red-border-text">{quoteText}</p>
        <span className="red-border-close">"</span>
        <p className="red-border-speaker">{speaker || 'Speaker'}</p>
      </div>
    </div>
  );

  // Illustrated Quote: Background image with overlay
  const renderIllustratedTemplate = () => (
    <Quote7Template 
      quoteText={quoteText}
      speaker={speaker}
      photoUrl={quoteImageUrl}
    />
  );

  // Portrait Quote Large: Large image on left, quote on right
  const renderPortraitLargeTemplate = () => (
    <div className="quote-template quote-template-portrait-large">
      <div className="portrait-large-image">
        {quoteImageUrl && (
          <img src={quoteImageUrl} alt="Quote" className="quote-image-content" />
        )}
      </div>
      <div className="portrait-large-content">
        <p className="portrait-large-text">{quoteText}</p>
        <p className="portrait-large-speaker">{speaker || 'Speaker'}</p>
      </div>
    </div>
  );

  // Portrait Quote Large Flipped: Image on right, quote on left
  const renderPortraitLargeFlippedTemplate = () => (
    <div className="quote-template quote-template-portrait-large-flipped">
      <div className="portrait-large-content-flipped">
        <p className="portrait-large-text-flipped">{quoteText}</p>
        <p className="portrait-large-speaker-flipped">{speaker || 'Speaker'}</p>
      </div>
      <div className="portrait-large-image-flipped">
        {quoteImageUrl && (
          <img src={quoteImageUrl} alt="Quote" className="quote-image-content" />
        )}
      </div>
    </div>
  );

  // Render based on selected design
  const renderTemplate = () => {
    switch (selectedDesign) {
      case 'Sample Quote 1':
        return renderSocialTemplate();
      case 'Sample Quote 2':
        return renderInspirationTemplate();
      case 'Sample Quote 3':
        return renderLargeQuoteTemplate();
      case 'Sample Quote 4':
        return renderPortraitTemplate();
      case 'Sample Quote 5':
        return renderPhotoQuoteSideTemplate();
      case 'Sample Quote 6':
        return renderPhotoQuoteSideFlippedTemplate();
      case 'red-border-quote':
        return renderRedBorderTemplate();
      case 'Sample Quote 7':
        return renderIllustratedTemplate();
      case 'portrait-quote-large':
        return renderPortraitLargeTemplate();
      case 'portrait-quote-large-flipped':
        return renderPortraitLargeFlippedTemplate();
      default:
        return renderSocialTemplate();
    }
  };

  return (
    <div
      className="quote-templates-container"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {renderTemplate()}
    </div>
  );
};
