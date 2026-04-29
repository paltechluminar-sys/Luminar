import React, { useEffect, useRef } from 'react';
import './PhotosQuote.css';
import { QuoteTemplates } from './QuoteTemplates';
import { Quote1Template } from './Quote1Template';
import { Quote2Template } from './Quote2Template';
import { Quote3Template } from './Quote3Template';
import { Quote4Template } from './Quote4Template';
import { Quote5Template } from './Quote5Template';
import { Quote6Template } from './Quote6Template';
import { Quote7Template } from './Quote7Template';

const generateDays = () => Array.from({ length: 31 }, (_, i) => i + 1);
const generateMonths = () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const generateYears = () => Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

// List of actual template designs
const TEMPLATE_DESIGNS = ['Sample Quote 1', 'Sample Quote 2', 'Sample Quote 3', 'Sample Quote 4', 'Sample Quote 5', 'Sample Quote 6', 'red-border-quote', 'Sample Quote 7', 'portrait-quote-large', 'portrait-quote-large-flipped'];

// Templates that include speaker/author information
const TEMPLATES_WITH_SPEAKER = ['Sample Quote 1', 'Sample Quote 3', 'Sample Quote 4', 'Sample Quote 5', 'Sample Quote 6', 'red-border-quote', 'Sample Quote 7', 'portrait-quote-large', 'portrait-quote-large-flipped'];

// Templates that use image uploads
const TEMPLATES_WITH_IMAGE = ['portrait-quote-large', 'portrait-quote-large-flipped'];

export const PhotosQuote = ({
  logos = [],
  logoInputRef,
  customMatchTime = '',
  setCustomMatchTime,
  spokesperson = '',
  setSpokesperson,
  matchDateTime = { day: 1, month: 'Jan', year: new Date().getFullYear() },
  setMatchDateTime,
  selectedQuoteDesign = null,
  containerWidth = 400,
  containerHeight = 300,
}) => {
  const quoteImage = logos.find((logo) => logo.id === 'quoteImage');
  const textareaRef = useRef(null);
  
  // Check if we're in template mode (a specific design is selected)
  const isTemplateMode = selectedQuoteDesign && TEMPLATE_DESIGNS.includes(selectedQuoteDesign);
  const hasSpokesperson = isTemplateMode && TEMPLATES_WITH_SPEAKER.includes(selectedQuoteDesign);
  const hasImageUpload = isTemplateMode && TEMPLATES_WITH_IMAGE.includes(selectedQuoteDesign);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Expand the parent containers to accommodate the growing textarea
      const templatePreview = textareaRef.current.closest('.quote-template-preview');
      const quoteContainer = textareaRef.current.closest('.quote-container');
      
      if (templatePreview) {
        templatePreview.style.minHeight = `${newHeight + 200}px`;
      }
      if (quoteContainer) {
        quoteContainer.style.minHeight = `${newHeight + 200}px`;
      }
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [customMatchTime]);

  const handleTextareaChange = (e) => {
    // Handle both event objects (from overlay textareas) and string values (from Quote1Template)
    let value;
    if (typeof e === 'string' || typeof e === 'object' && !e.target) {
      // It's a string from Quote1Template
      value = typeof e === 'string' ? e : e;
    } else {
      // It's an event object
      value = e.target.value;
    }
    
    setCustomMatchTime(value);
    
    // Only manipulate ref if textareaRef exists (for non-social templates)
    if (textareaRef.current && e.target) {
      textareaRef.current.style.height = 'auto';
      const newHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Expand the parent containers to accommodate the growing textarea
      const templatePreview = textareaRef.current.closest('.quote-template-preview');
      const quoteContainer = textareaRef.current.closest('.quote-container');
      
      if (templatePreview) {
        templatePreview.style.minHeight = `${newHeight + 200}px`;
      }
      if (quoteContainer) {
        quoteContainer.style.minHeight = `${newHeight + 200}px`;
      }
    }
  };

  // Default mode: Show old interface
  if (!isTemplateMode) {
    return (
      <div className="quote-content">
        <div className="quote-header">
          <span className="quote-symbol" aria-label="Quote symbol">
            ❝
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={customMatchTime}
          onChange={handleTextareaChange}
          placeholder="Enter quote"
          className="quote-textarea"
          aria-label="Quote input"
        />
        <div className="quote-footer">
          <input
            type="text"
            value={spokesperson}
            onChange={(e) => setSpokesperson(e.target.value)}
            placeholder="Spokesperson"
            className="quote-spokesperson-input"
            aria-label="Spokesperson name"
          />
          <div className="quote-date-selector">
            <select
              value={matchDateTime.day}
              onChange={(e) => setMatchDateTime((prev) => ({ ...prev, day: parseInt(e.target.value, 10) }))}
              aria-label="Select day"
            >
              {generateDays().map((day) => (
                <option key={`day-${day}`} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <select
              value={matchDateTime.month}
              onChange={(e) => setMatchDateTime((prev) => ({ ...prev, month: e.target.value }))}
              aria-label="Select month"
            >
              {generateMonths().map((month) => (
                <option key={`month-${month}`} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              className="quote-year-select"
              value={matchDateTime.year}
              onChange={(e) => setMatchDateTime((prev) => ({ ...prev, year: parseInt(e.target.value, 10) }))}
              aria-label="Select year"
            >
              {generateYears().map((year) => (
                <option key={`year-${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  // Template mode: Show template with overlaid textarea at exact text position
  return (
    <div className="quote-container">
      {/* Quote Template Preview with Overlaid Editing */}
      <div className="quote-template-preview">
        {selectedQuoteDesign === 'Sample Quote 1' ? (
          // Use dedicated Quote1Template component for social cards
          <Quote1Template
            quoteText={customMatchTime}
            onQuoteChange={handleTextareaChange}
            speaker={spokesperson || 'Speaker Name'}
          />
        ) : selectedQuoteDesign === 'Sample Quote 2' ? (
          // Use dedicated Quote2Template component for inspirational cards
          <Quote2Template
            quoteText={customMatchTime}
            onQuoteChange={handleTextareaChange}
            speaker={spokesperson || 'Speaker'}
          />
        ) : selectedQuoteDesign === 'Sample Quote 3' ? (
          // Use dedicated Quote3Template component for large quote cards
          <Quote3Template
            quoteText={customMatchTime}
            onQuoteChange={handleTextareaChange}
            speaker={spokesperson || 'Speaker'}
            handle="BIGDREAMS.IN"
          />
        ) : selectedQuoteDesign === 'Sample Quote 4' ? (
          // Use dedicated Quote4Template component for portrait quote cards
          <Quote4Template
            quoteText={customMatchTime}
            onQuoteChange={handleTextareaChange}
            speaker={spokesperson || 'Speaker'}
          />
        ) : selectedQuoteDesign === 'Sample Quote 5' ? (
          // Use dedicated Quote5Template component for photo quote side cards (vertical layout)
          <Quote5Template
            quoteText={customMatchTime}
            onQuoteChange={handleTextareaChange}
            speaker={spokesperson || 'Speaker'}
            photoUrl={quoteImage?.src}
          />
        ) : selectedQuoteDesign === 'Sample Quote 6' ? (
          // Use dedicated Quote6Template component for photo quote side flipped cards (vertical layout)
          <Quote6Template
            quoteText={customMatchTime}
            onQuoteChange={handleTextareaChange}
            speaker={spokesperson || 'Speaker'}
            photoUrl={quoteImage?.src}
          />
        ) : selectedQuoteDesign === 'Sample Quote 7' ? (
          // Use dedicated Quote7Template component for illustrated quote cards
          <Quote7Template
            quoteText={customMatchTime}
            onQuoteChange={handleTextareaChange}
            speaker={spokesperson || 'Speaker'}
            photoUrl={quoteImage?.src}
          />
        ) : (
          // Use QuoteTemplates for other designs
          <QuoteTemplates
            selectedDesign={selectedQuoteDesign}
            quoteText={customMatchTime}
            speaker={spokesperson || 'Speaker'}
            quoteImageUrl={quoteImage?.src}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
          />
        )}
        
        {/* Overlaid Textarea at exact quote text position - NOT for social, inspirational, large-quote, portrait-quote, photo-quote-side, photo-quote-side-flipped, or illustrated-quote (which have their own textareas) */}
        {selectedQuoteDesign !== 'Sample Quote 1' && selectedQuoteDesign !== 'Sample Quote 2' && selectedQuoteDesign !== 'Sample Quote 3' && selectedQuoteDesign !== 'Sample Quote 4' && selectedQuoteDesign !== 'Sample Quote 5' && selectedQuoteDesign !== 'Sample Quote 6' && selectedQuoteDesign !== 'Sample Quote 7' && (
          <textarea
            ref={textareaRef}
            value={customMatchTime}
            onChange={handleTextareaChange}
            placeholder="Edit quote text"
            className="quote-textarea-overlay"
            aria-label="Quote text editor"
            spellCheck="true"
          />
        )}

        {/* Overlaid Speaker Input - only for templates that use it (but not social, inspirational, large-quote, portrait-quote, photo-quote-side, photo-quote-side-flipped, or illustrated-quote which have their own) */}
        {hasSpokesperson && selectedQuoteDesign !== 'Sample Quote 1' && selectedQuoteDesign !== 'Sample Quote 2' && selectedQuoteDesign !== 'Sample Quote 3' && selectedQuoteDesign !== 'Sample Quote 4' && selectedQuoteDesign !== 'Sample Quote 5' && selectedQuoteDesign !== 'Sample Quote 6' && selectedQuoteDesign !== 'Sample Quote 7' && (
          <input
            type="text"
            value={spokesperson}
            onChange={(e) => setSpokesperson(e.target.value)}
            placeholder="Speaker/Author"
            className="quote-speaker-overlay"
            aria-label="Speaker name"
          />
        )}

        {/* Image upload button for templates that need images */}
        {hasImageUpload && (
          <button
            type="button"
            className="quote-image-overlay-button"
            onClick={(e) => {
              e.preventDefault();
              logoInputRef.current.click();
            }}
            aria-label="Upload image for quote template"
          >
            📸 Upload Image
          </button>
        )}
      </div>
    </div>
  );
};


