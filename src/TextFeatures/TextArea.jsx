import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import './TextArea.css';

export const TextArea = ({ text, isEditing, isSelected, onTextChange, onEditStart, onEditEnd, maxWidth = null }) => {
  const inputRef = useRef(null);
  const measureRef = useRef(null);
  const [localValue, setLocalValue] = useState(text?.content || '');
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  // Define displayValue early so it can be used in hooks
  const textContent = text?.content || '';
  const displayValue = isEditing ? localValue : textContent;

  useEffect(() => {
    if (!isEditing) {
      setLocalValue(text?.content || '');
    }
  }, [text?.content, isEditing]);

  useEffect(() => {
    if ((isSelected || isEditing) && inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isSelected, isEditing]);

  useLayoutEffect(() => {
    if (inputRef.current && measureRef.current) {
      // Get the ACTUAL computed font size (accounts for CSS media query overrides)
      const computedStyle = window.getComputedStyle(inputRef.current);
      const computedFontSize = parseFloat(computedStyle.fontSize) || 18;
      const fontSizeStr = `${computedFontSize}px`;
      
      const fontFamily = text?.fontFamily || 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
      const fontWeight = (text?.bold || text?.isBold) ? 'bold' : 'normal';
      const fontStyle = (text?.italic || text?.isItalic) ? 'italic' : 'normal';
      const letterSpacing = `${text?.letterSpacing || 0}px`;
      const LINE_HEIGHT_RATIO = 1.4;

      // Apply all styling to measurement div
      measureRef.current.style.fontSize = fontSizeStr;
      measureRef.current.style.fontFamily = fontFamily;
      measureRef.current.style.fontWeight = fontWeight;
      measureRef.current.style.fontStyle = fontStyle;
      measureRef.current.style.letterSpacing = letterSpacing;
      measureRef.current.style.lineHeight = `${LINE_HEIGHT_RATIO}`;

      // Determine sizing model based on viewport (match CSS media queries)
      const isMobile = window.innerWidth <= 480;
      const BORDER_WIDTH = 6; // 3px left + 3px right
      
      // Apply mobile-specific box-sizing and padding to measurement div
      if (isMobile) {
        measureRef.current.style.boxSizing = 'border-box';
        measureRef.current.style.padding = '0';
        measureRef.current.style.border = '3px solid transparent';
      } else {
        measureRef.current.style.boxSizing = 'content-box';
        measureRef.current.style.padding = '0';
        measureRef.current.style.border = '3px solid transparent';
      }
      
      // Calculate max content width based on maxWidth container
      // Desktop (content-box): width property = content only, border adds to total
      // Mobile (border-box): width property = content + border, need to subtract border
      const marginLeft = text?.marginLeft || 0;
      const marginRight = text?.marginRight || 0;
      const TOTAL_MARGINS = marginLeft + marginRight;
      
      let MAX_DRAWABLE_WIDTH = 10000; // The actual available space for text content
      if (maxWidth && maxWidth > 50) {
        if (isMobile) {
          // Mobile with border-box: the 6px border is INSIDE the width property
          // So if width can be maxWidth, content can be maxWidth - BORDER_WIDTH - MARGINS
          MAX_DRAWABLE_WIDTH = maxWidth - BORDER_WIDTH - TOTAL_MARGINS;
        } else {
          // Desktop with content-box: the width is just content, border is separate
          // So if maxWidth is the total, content can be maxWidth - BORDER_WIDTH - MARGINS
          MAX_DRAWABLE_WIDTH = maxWidth - BORDER_WIDTH - TOTAL_MARGINS;
        }
      } else {
        // If no maxWidth, still respect margins
        MAX_DRAWABLE_WIDTH = Math.max(50, 10000 - TOTAL_MARGINS);
      }

      // Single measurement pass - measure natural width only once
      measureRef.current.style.width = 'auto';
      measureRef.current.style.whiteSpace = 'nowrap';
      const naturalWidth = measureRef.current.scrollWidth;
      
      // Small buffer to prevent last char wrapping
      const bufferWidth = naturalWidth + 2;
      // Clamp to available drawable space
      let dynamicContentWidth = Math.min(bufferWidth, MAX_DRAWABLE_WIDTH);
      
      // Now convert back to the actual width property value
      // On desktop (content-box): width = dynamicContentWidth as-is
      // On mobile (border-box): need to add border back since it's included in property
      const dynamicWidth = isMobile ? dynamicContentWidth + BORDER_WIDTH : dynamicContentWidth;

      // Measure height with stable dynamic width
      measureRef.current.style.width = `${dynamicWidth}px`;
      measureRef.current.style.whiteSpace = 'pre-wrap';
      const finalHeight = measureRef.current.scrollHeight;

      // Calculate minimum height for single line (font size * line height ratio)
      const LINE_HEIGHT_PIXEL = computedFontSize * LINE_HEIGHT_RATIO;
      const singleLineMinHeight = Math.ceil(LINE_HEIGHT_PIXEL);
      
      // Use measured height directly, but respect single line minimum (no padding inflating it)
      const finalHeightRounded = Math.round(Math.max(finalHeight, singleLineMinHeight));

      // Apply to textarea with stable dynamic width
      // Force both width and height with !important to override all CSS
      inputRef.current.style.setProperty('width', `${dynamicWidth}px`, 'important');
      inputRef.current.style.setProperty('height', `${finalHeightRounded}px`, 'important');
      inputRef.current.style.maxWidth = 'none';
      
      // Double-check the measurement div was sized correctly
      const measureFinalWidth = measureRef.current.scrollWidth;

      console.log('📝 TextArea (optimized-stable):', {
        isMobile,
        computedFontSize,
        naturalWidth,
        dynamicContentWidth,
        dynamicWidth,
        maxWidth,
        MAX_DRAWABLE_WIDTH,
        BORDER_WIDTH,
        marginLeft,
        marginRight,
        TOTAL_MARGINS,
        textLen: displayValue.length,
        viewportWidth
      });
    }
  }, [localValue, maxWidth, text?.fontSize, text?.fontFamily, text?.bold, text?.italic, text?.letterSpacing, text?.marginLeft, text?.marginRight, viewportWidth]);

  // Handle window resize to recalculate on mobile/desktop changes
  useLayoutEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Update viewport width to trigger measurement recalculation
        setViewportWidth(window.innerWidth);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onTextChange?.(newValue);
  };

  const fontSize = `${text?.fontSize || 18}px`;
  const fontFamily = text?.fontFamily || 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
  const fontWeight = (text?.bold || text?.isBold) ? 'bold' : 'normal';
  const fontStyle = (text?.italic || text?.isItalic) ? 'italic' : 'normal';

  return (
    <>
      {/* Hidden measurement div - mirrors textarea exactly for accurate sizing */}
      <div
        ref={measureRef}
        className="text-measure"
        style={{
          fontSize,
          fontFamily,
          fontWeight,
          fontStyle,
        }}
      >
        {displayValue || 'Add Your Thoughts'}
      </div>

      <textarea
        ref={inputRef}
        value={displayValue}
        onChange={handleTextChange}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape') {
            onEditEnd?.();
            inputRef.current?.blur();
          }
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            onEditEnd?.();
            inputRef.current?.blur();
          }
        }}
        onFocus={onEditStart}
        onBlur={onEditEnd}
        onClick={(e) => {
          e.stopPropagation();
          onEditStart?.();
        }}
        placeholder="Add Your Thoughts"
        className="text-area-editor"
        style={{
          fontSize,
          color: text?.color || '#ffffff',
          fontFamily,
          fontWeight,
          fontStyle,
          textDecoration: (text?.underline || text?.isUnderline) ? 'underline' : 'none',
          textDecorationLine: (text?.strikethrough || text?.isStrikethrough) ? 'line-through' : 'none',
          textShadow: text?.shadowOffset > 0 || text?.shadowBlur > 0 ? 
            `${text.shadowOffset}px ${text.shadowOffset}px ${text.shadowBlur}px ${text.shadowColor}` : 
            'none',
          filter: text?.glowIntensity > 0 ? 
            `drop-shadow(0 0 ${text.glowIntensity}px ${text.glowColor})` : 
            'none',
          WebkitTextStroke: text?.outlineWidth > 0 ? 
            `${text.outlineWidth}px ${text.outlineColor}` : 
            'none',
          letterSpacing: `${text?.letterSpacing || 0}px`,
        }}
      />
    </>
  );
};
