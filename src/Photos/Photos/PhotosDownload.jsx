import React, { useCallback, useEffect, useRef, useState } from 'react';
import { loadImage, measureTextWidth } from './PhotosUtils';
// Quote template designs
const TEMPLATE_DESIGNS = [
  'classic',
  'Sample Quote 1',
  'Sample Quote 2',
  'Sample Quote 3',
  'Sample Quote 4',
  'Sample Quote 5',
  'Sample Quote 6',
  'red-border-quote',
  'Sample Quote 7',
  'portrait-quote-large',
  'portrait-quote-large-flipped'
];

export const PhotosDownload = ({
  image,
  additionalImages,
  texts,
  filters,
  canvasRefs,
  imageDimensions,
  selectedFeature,
  showScoreBox,
  customMatchTime,
  spokesperson,
  matchDateTime,
  fontFamily,
  brandName,
  brandFontFamily,
  brandFontSize,
  brandColor,
  brandOutlineColor,
  brandOutlineWidth,
  brandIsBold,
  brandIsItalic,
  brandIsUnderline,
  brandIsStrikethrough,
  brandShadowOffset,
  brandShadowBlur,
  brandShadowColor,
  brandGlowIntensity,
  brandGlowColor,
  brandLetterSpacing,
  brandRotation,
  brandPosition,
  logos = [],
  cropArea = null,
  selectedQuoteDesign = 'classic',
  onSubscriptionModalOpen,
}) => {
  const imageCache = useRef(new Map());
  const isDownloading = useRef(false);

  // Map CSS font aliases to actual font names for canvas rendering
  const getFontName = (fontFamily) => {
    const fontMap = {
      'primary': 'Arial, sans-serif',
      'secondary': 'Georgia, serif',
      'monospace': 'Courier New, monospace',
      'script': "Brush Script MT, cursive",
      'display': 'Impact, sans-serif',
    };
    return fontMap[fontFamily] || fontFamily || 'Arial, sans-serif';
  };

  useEffect(() => {
    const preloadImages = async () => {
      try {
        if (image) {
          const bgImg = await loadImage(image);
          imageCache.current.set(image, bgImg);
        }

        if (selectedFeature === 'quote' && additionalImages.length > 0) {
          const additionalImagePromises = additionalImages.map(async (imgSrc) => {
            const img = await loadImage(imgSrc);
            imageCache.current.set(imgSrc, img);
          });
          await Promise.all(additionalImagePromises);
        }

        // Preload all logos
        if (Array.isArray(logos) && logos.length > 0) {
          const logoPromises = logos
            .filter((logo) => logo.src)
            .map(async (logo) => {
              const img = await loadImage(logo.src);
              imageCache.current.set(logo.src, img);
            });
          await Promise.all(logoPromises);
        }
      } catch (err) {
        console.error('Failed to preload images:', err);
      }
    };
    preloadImages();
  }, [image, additionalImages, selectedFeature, logos]);

  const normalizedBrand = brandName ? brandName.trim() : '';
  const firstDotIndex = normalizedBrand.indexOf('.');
  const brandPrefix = firstDotIndex > 0 ? normalizedBrand.slice(0, firstDotIndex) : normalizedBrand;
  const brandSuffix = firstDotIndex > 0 ? normalizedBrand.slice(firstDotIndex) : '';

  const drawGradientText = (ctx, text, lines, scaledFontSize, fontString, textWidth, lineHeight, textHeight) => {
    // Create temporary canvas for gradient composition
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Precise dimensions
    const canvasWidth = Math.ceil(textWidth) + 4;
    const canvasHeight = Math.ceil(textHeight) + 4;
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;

    // Draw text on temp canvas
    tempCtx.font = fontString;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillStyle = '#000000'; // Black for mask
    
    const verticalOffset = (lineHeight / 2);
    lines.forEach((line, index) => {
      const yPos = verticalOffset + (index * lineHeight);
      tempCtx.fillText(line, canvasWidth / 2, yPos);
    });

    // Apply gradient as mask
    tempCtx.globalCompositeOperation = 'source-in';
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    const colorParts = text.color.split(',');
    const color1 = (colorParts[0] || '#ffffff').trim();
    const color2 = (colorParts[1] || color1).trim();
    
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    tempCtx.fillStyle = gradient;
    tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw on main canvas at correct position
    const drawX = -canvasWidth / 2;
    const drawY = -(textHeight / 2);
    ctx.drawImage(tempCanvas, drawX, drawY);
    tempCanvas.remove();
  };



  const drawCircularEmoji = (ctx, emoji, x, y, size) => {
    ctx.save();
    ctx.font = `${size}px Arial`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillText(emoji, x, y);
    ctx.restore();
  };

  const drawUnderline = (ctx, text, scaledFontSize, lineWidth, yPos, lineHeight) => {
    ctx.strokeStyle = text.color || text.stroke || '#000000';
    ctx.lineWidth = Math.max(1, scaledFontSize * 0.05);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const underlineY = yPos + scaledFontSize * 0.15;
    const startX = -lineWidth / 2;
    const endX = lineWidth / 2;
    
    if (text.underline === 'double') {
      const offset = scaledFontSize * 0.1;
      ctx.beginPath();
      ctx.moveTo(startX, underlineY - offset);
      ctx.lineTo(endX, underlineY - offset);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(startX, underlineY + offset);
      ctx.lineTo(endX, underlineY + offset);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.stroke();
    }
  };

  const drawQuoteBox = (ctx, width, height, scaleX, scaleY) => {
    const boxWidth = width * 0.7;
    const quoteText = customMatchTime || 'Enter quote';
    const fontSize = 16;
    const textAreaWidth = boxWidth - (32 + 8) * scaleX;
    const maxWidth = textAreaWidth;
    const lineHeight = fontSize * 1.4;
    const textPaddingTop = 6 * Math.min(scaleX, scaleY);
    const textPaddingBottom = 8 * Math.min(scaleX, scaleY);
    const bottomInputsHeight = 36 * scaleY;
    const defaultTextAreaHeight = 100 * Math.min(scaleX, scaleY);

    const wrapText = (text) => {
      ctx.font = `400 ${fontSize}px 'Roboto', sans-serif`;
      const paragraphs = text.split('\n');
      const lines = [];

      const addLine = (nextLine) => {
        lines.push(nextLine);
      };

      const splitLongWord = (word) => {
        let remainder = word;
        while (remainder.length > 0) {
          let chunk = remainder;
          while (ctx.measureText(chunk).width > maxWidth && chunk.length > 1) {
            chunk = chunk.slice(0, -1);
          }
          if (!chunk) break;
          if (chunk.length < remainder.length) {
            addLine(`${chunk}-`);
            remainder = remainder.slice(chunk.length);
          } else {
            addLine(chunk);
            remainder = '';
          }
        }
      };

      paragraphs.forEach((paragraph, paragraphIndex) => {
        let line = '';
        const tokens = paragraph.match(/\S+|\s+/g) || [];
        tokens.forEach((token) => {
          const testLine = line + token;
          const testWidth = ctx.measureText(testLine).width;
          if (testWidth <= maxWidth) {
            line = testLine;
            return;
          }

          if (line) {
            addLine(line);
            line = token;
            if (ctx.measureText(line).width > maxWidth) {
              if (token.trim() === '') {
                line = '';
              } else {
                splitLongWord(token);
                line = '';
              }
            }
          } else if (token.trim() === '') {
            line = token;
          } else {
            splitLongWord(token);
            line = '';
          }
        });

        if (line) {
          addLine(line);
        }

        if (paragraphIndex < paragraphs.length - 1) {
          lines.push('');
        }
      });

      return lines;
    };

    const lines = wrapText(quoteText);
    const textBlockHeight = lines.length * lineHeight;
    const textAreaHeight = Math.max(defaultTextAreaHeight, textBlockHeight + textPaddingTop + textPaddingBottom);
    const boxHeight = textAreaHeight + bottomInputsHeight + 18 * Math.min(scaleX, scaleY);
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height - boxHeight;
    const padding = 8 * Math.min(scaleX, scaleY);
    const textAreaTop = boxY;
    const textAreaX = boxX + 32 * scaleX;
    const textAreaCenterX = textAreaX + textAreaWidth / 2;
    const availableHeight = textAreaHeight - textPaddingTop - textPaddingBottom;
    const startY = boxY + textPaddingTop + (availableHeight - textBlockHeight) / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10 * Math.min(scaleX, scaleY));
    ctx.fill();

    ctx.font = `bold ${28 * Math.min(scaleX, scaleY)}px 'Roboto', sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('❝', boxX + 12 * scaleX, boxY + 6 * scaleY);

    const quoteImageSize = 100 * Math.min(scaleX, scaleY);
    const quoteImageCenterX = boxX + boxWidth - 16 * scaleX - quoteImageSize / 2;
    const quoteImageCenterY = boxY - 56 * scaleY;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(quoteImageCenterX, quoteImageCenterY, quoteImageSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#007bff';
    ctx.setLineDash([4 * Math.min(scaleX, scaleY), 4 * Math.min(scaleX, scaleY)]);
    ctx.lineWidth = 2 * Math.min(scaleX, scaleY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fff';
    ctx.font = `${14 * Math.min(scaleX, scaleY)}px 'Roboto', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Image', quoteImageCenterX, quoteImageCenterY);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(textAreaX, textAreaTop, textAreaWidth, textAreaHeight);
    ctx.clip();

    ctx.font = `400 ${fontSize}px 'Roboto', sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowOffsetX = 1 * Math.min(scaleX, scaleY);
    ctx.shadowOffsetY = 1 * Math.min(scaleX, scaleY);
    ctx.shadowBlur = 2 * Math.min(scaleX, scaleY);
    lines.forEach((line, index) => {
      ctx.fillText(line || ' ', textAreaCenterX, startY + index * lineHeight);
    });
    ctx.restore();
    ctx.shadowColor = 'transparent';

    const spokespersonText = spokesperson || 'Spokesperson';
    ctx.font = `normal 12px 'Roboto', sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(spokespersonText, boxX + boxWidth - padding, boxY + boxHeight - 36 * scaleY);

    const dateText = `${matchDateTime.day} ${matchDateTime.month} ${matchDateTime.year}`;
    ctx.font = `10px 'Roboto', sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.textAlign = 'right';
    ctx.fillText(dateText, boxX + boxWidth - padding, boxY + boxHeight - 26 * scaleY);
  };

  // ==================== QUOTE TEMPLATE RENDERING ====================
  const drawSampleQuote = (ctx, customText, author, date, x, y, width, height, scale) => {
    const padding = 20 * scale;
    const fontSize = 18 * scale;
    
    // Draw semi-transparent black background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, width, height, 8 * scale);
    } else {
      ctx.rect(x, y, width, height);
    }
    ctx.fill();
    
    // Draw quote mark
    ctx.fillStyle = '#FFD700';
    ctx.font = `${48 * scale}px Georgia, serif`;
    ctx.fillText('❝', x + padding, y + padding + 30 * scale);
    
    // Draw quote text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${fontSize}px Georgia, serif`;
    ctx.textAlign = 'center';
    const lines = customText ? customText.split('\n') : ['Quote'];
    const maxLinesPerPage = 3;
    let yOffset = y + height / 2 - (Math.min(lines.length, maxLinesPerPage) * fontSize) / 2;
    
    lines.slice(0, maxLinesPerPage).forEach((line) => {
      ctx.fillText(line || ' ', x + width / 2, yOffset);
      yOffset += fontSize + 5 * scale;
    });
    
    // Draw author
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `${14 * scale}px Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(`— ${author || 'Spokesperson'}`, x + width - padding, y + height - padding - 20 * scale);
    
    // Draw date
    const dateText = date ? `${date.day} ${date.month} ${date.year}` : '';
    ctx.fillText(dateText, x + width - padding, y + height - padding);
  };

  const drawRedBorderQuote = (ctx, customText, author, date, x, y, width, height, scale) => {
    const borderWidth = 4 * scale;
    const padding = 20 * scale;
    
    // Draw red border
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.stroke();
    
    // Draw white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + borderWidth, y + borderWidth, 
                 width - 2*borderWidth, height - 2*borderWidth);
    
    // Draw quote text
    ctx.fillStyle = '#000000';
    ctx.font = `${24 * scale}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`"${customText || 'Quote'}"`, x + width/2, y + height/2 - padding);
    
    // Draw author
    ctx.font = `${16 * scale}px Georgia, serif`;
    ctx.fillStyle = '#666666';
    ctx.fillText(`— ${author || 'Spokesperson'}`, x + width/2, y + height/2 + padding + 30);
  };
  // ==================== END QUOTE TEMPLATE RENDERING ====================

  // ==================== PRECISE TEXT RENDERING ====================


  const drawLogo = (ctx, logo, scaleX, scaleY) => {
    const img = imageCache.current.get(logo.src);
    if (!img) {
      console.warn(`Logo image not found in cache: ${logo.src}`);
      return;
    }

    // Calculate base dimensions from ACTUAL image (matching LogoArea.jsx logic)
    let baseWidth = img.naturalWidth;
    let baseHeight = img.naturalHeight;

    // Apply max size constraints (60×60) - same as LogoArea
    const maxWidth = 60;
    const maxHeight = 60;

    if (baseWidth > maxWidth || baseHeight > maxHeight) {
      const ratio = Math.min(maxWidth / baseWidth, maxHeight / baseHeight);
      baseWidth = baseWidth * ratio;
      baseHeight = baseHeight * ratio;
    }

    // Apply all scale factors (matching LogoArea display)
    const logoScale = logo.scale || 1;
    const logoScaleWidth = logo.scaleWidth || 1;
    const logoScaleHeight = logo.scaleHeight || 1;

    // Calculate final target dimensions for export
    const targetWidth = baseWidth * logoScale * logoScaleWidth * scaleX;
    const targetHeight = baseHeight * logoScale * logoScaleHeight * scaleY;

    // Position (scaled from canvas coordinates) - Use precise positioning for mobile accuracy
    // Apply Math.round for sub-pixel precision on all devices
    const scaledX = Math.round(logo.x * scaleX * 100) / 100;
    const scaledY = Math.round(logo.y * scaleY * 100) / 100;

    ctx.save();
    
    // Translate to CENTER of logo (rotation origin in CSS is 50% 50%)
    // Add half-pixel offset for perfect centering on all device pixel ratios
    const centerX = scaledX + (targetWidth / 2);
    const centerY = scaledY + (targetHeight / 2);
    ctx.translate(centerX, centerY);
    
    if (logo.rotation) {
      ctx.rotate((logo.rotation * Math.PI) / 180);
    }
    ctx.globalAlpha = logo.opacity || 1;

    // Draw logo centered at origin (matches CSS transform behavior exactly)
    ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
    ctx.restore();
  };
  // ==================== END LOGO RENDERING ====================

  const downloadImage = useCallback(async () => {
    if (isDownloading.current) return;
    isDownloading.current = true;

    const { canvasRef, imageRef, additionalImageRefs } = canvasRefs;
    if (!canvasRef?.current || !image) {
      alert('No image available for download. Please select an image.');
      isDownloading.current = false;
      return;
    }

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    const img = imageCache.current.get(image) || imageRef.current;
    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;

    const targetWidth = (selectedFeature === 'quote' || selectedFeature === 'merge') && additionalImages.length > 0 ? 1080 : originalWidth;
    const targetHeight = (selectedFeature === 'quote' || selectedFeature === 'merge') && additionalImages.length > 0 ? (selectedFeature === 'merge' ? 1080 : 1350) : originalHeight;

    tempCanvas.width = targetWidth;
    tempCanvas.height = targetHeight;

    // Get actual rendered canvas dimensions for perfect mobile accuracy
    // Fallback to imageDimensions if canvas ref not available
    let canvasWidth = imageDimensions.width;
    let canvasHeight = imageDimensions.height;
    
    // Get ACTUAL display canvas dimensions from the DOM
    // CRITICAL: Use CSS display size, NOT canvas.width/height (which may be device-pixel-ratio scaled)
    let actualDisplayWidth = canvasWidth;
    let actualDisplayHeight = canvasHeight;
    
    if (canvasRefs?.canvasRef?.current) {
      const canvas = canvasRefs.canvasRef.current;
      
      // Parse CSS width/height to get actual display dimensions
      const cssWidth = parseFloat(canvas.style.width);
      const cssHeight = parseFloat(canvas.style.height);
      
      if (!isNaN(cssWidth) && cssWidth > 0) {
        actualDisplayWidth = cssWidth;
      }
      if (!isNaN(cssHeight) && cssHeight > 0) {
        actualDisplayHeight = cssHeight;
      }
    }
    
    const scaleX = (selectedFeature === 'quote' || selectedFeature === 'merge') && additionalImages.length > 0 ? targetWidth / (actualDisplayWidth * 2) : targetWidth / actualDisplayWidth;
    const scaleY = targetHeight / actualDisplayHeight;

    if (selectedFeature !== 'merge') {
      tempCtx.filter = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        grayscale(${filters.grayscale}%)
        sepia(${filters.sepia}%)
        blur(${filters.blur}px)
      `;
      tempCtx.drawImage(
        img,
        0,
        0,
        selectedFeature === 'quote' && additionalImages.length > 0 ? targetWidth / 2 : targetWidth,
        selectedFeature === 'quote' && additionalImages.length >= 2 ? targetHeight / 2 : targetHeight
      );
      tempCtx.filter = 'none';
    }

    if (selectedFeature === 'quote' && additionalImages.length > 0) {
      additionalImages.forEach((imgSrc, index) => {
        const additionalImg = imageCache.current.get(imgSrc) || additionalImageRefs.current[index];
        if (additionalImg) {
          const widthPerImage = targetWidth / 2;
          const heightPerImage = additionalImages.length >= 2 ? targetHeight / 2 : targetHeight;
          let x = 0;
          let y = 0;
          if (index === 0) {
            x = widthPerImage;
            y = 0;
          } else if (index === 1) {
            x = 0;
            y = heightPerImage;
          } else if (index === 2) {
            x = widthPerImage;
            y = heightPerImage;
          }
          tempCtx.filter = `
            brightness(${filters.brightness}%)
            contrast(${filters.contrast}%)
            saturate(${filters.saturation}%)
            grayscale(${filters.grayscale}%)
            sepia(${filters.sepia}%)
            blur(${filters.blur}px)
          `;
          tempCtx.drawImage(additionalImg, x, y, widthPerImage, heightPerImage);
          tempCtx.filter = 'none';
        }
      });
    }

    if (selectedFeature === 'merge' && additionalImages.length > 0) {
      const numImages = additionalImages.length;
      let cols, rows;
      if (numImages === 1) { cols = 1; rows = 1; }
      else if (numImages === 2) { cols = 2; rows = 1; }
      else if (numImages === 3) { cols = 3; rows = 1; }
      else if (numImages === 4) { cols = 2; rows = 2; }
      else { cols = Math.ceil(Math.sqrt(numImages)); rows = Math.ceil(numImages / cols); }
      const cellWidth = targetWidth / cols;
      const cellHeight = targetHeight / rows;
      additionalImages.forEach((imgSrc, index) => {
        const additionalImg = imageCache.current.get(imgSrc) || additionalImageRefs.current[index];
        if (additionalImg) {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = col * cellWidth;
          const y = row * cellHeight;
          const imgAspect = additionalImg.naturalWidth / additionalImg.naturalHeight;
          const cellAspect = cellWidth / cellHeight;
          let drawWidth, drawHeight, drawX, drawY;
          if (imgAspect > cellAspect) {
            // image wider, fit to width
            drawWidth = cellWidth;
            drawHeight = cellWidth / imgAspect;
            drawX = x;
            drawY = y + (cellHeight - drawHeight) / 2;
          } else {
            // image taller, fit to height
            drawHeight = cellHeight;
            drawWidth = cellHeight * imgAspect;
            drawX = x + (cellWidth - drawWidth) / 2;
            drawY = y;
          }
          tempCtx.filter = `
            brightness(${filters.brightness}%)
            contrast(${filters.contrast}%)
            saturate(${filters.saturation}%)
            grayscale(${filters.grayscale}%)
            sepia(${filters.sepia}%)
            blur(${filters.blur}px)
          `;
          tempCtx.drawImage(additionalImg, drawX, drawY, drawWidth, drawHeight);
          tempCtx.filter = 'none';
        }
      });
    }

    // ==================== APPLY CROP IF PROVIDED ====================
    if (cropArea && selectedFeature !== 'merge') {
      tempCtx.save();
      tempCtx.beginPath();
      
      // Define clip region in scaled coordinates
      const clipX = cropArea.x * scaleX;
      const clipY = cropArea.y * scaleY;
      const clipWidth = cropArea.width * scaleX;
      const clipHeight = cropArea.height * scaleY;
      
      tempCtx.rect(clipX, clipY, clipWidth, clipHeight);
      tempCtx.clip();
    }
    // ==================== END CROP APPLICATION ====================

    // ==================== RENDER LOGOS ====================
    if (Array.isArray(logos) && logos.length > 0) {
      logos
        .filter(logo => logo.id !== 'quoteImage' && logo.src)  // Skip quote image logos
        .forEach(logo => {
          try {
            drawLogo(tempCtx, logo, scaleX, scaleY);
          } catch (err) {
            console.warn(`Error rendering logo ${logo.id}:`, err.message);
          }
        });
    }
    // ==================== END LOGO RENDERING ====================

    if (normalizedBrand) {
      tempCtx.save();
      
      // Calculate scaling for position
      const scale = Math.min(scaleX, scaleY);
      const scaledFontSize = (brandFontSize || 16) * scale;
      const scaledOutlineWidth = (brandOutlineWidth || 0) * scale;
      const scaledLetterSpacing = (brandLetterSpacing || 0) * scale;
      
      // Setup text properties
      const fontWeight = brandIsBold ? 'bold' : '400';
      const fontStyle = brandIsItalic ? 'italic' : 'normal';
      const fontName = getFontName(brandFontFamily);
      tempCtx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px ${fontName}`;
      tempCtx.fillStyle = brandColor || '#FFFFFF';
      tempCtx.strokeStyle = brandOutlineColor || '#000000';
      tempCtx.lineWidth = scaledOutlineWidth;
      tempCtx.globalAlpha = 1;
      
      // Calculate position based on brandPosition
      let brandX, brandY, textAlign;
      const padding = 10 * scale;
      
      if (brandPosition === 'top-left') {
        brandX = padding;
        brandY = padding;
        textAlign = 'left';
      } else if (brandPosition === 'top-center') {
        brandX = targetWidth / 2;
        brandY = padding;
        textAlign = 'center';
      } else if (brandPosition === 'top-right') {
        brandX = targetWidth - padding;
        brandY = padding;
        textAlign = 'right';
      } else if (brandPosition === 'center-left') {
        brandX = padding;
        brandY = targetHeight / 2;
        textAlign = 'left';
      } else if (brandPosition === 'center') {
        brandX = targetWidth / 2;
        brandY = targetHeight / 2;
        textAlign = 'center';
      } else if (brandPosition === 'center-right') {
        brandX = targetWidth - padding;
        brandY = targetHeight / 2;
        textAlign = 'right';
      } else if (brandPosition === 'bottom-left') {
        brandX = padding;
        brandY = targetHeight - padding;
        textAlign = 'left';
      } else if (brandPosition === 'bottom-center') {
        brandX = targetWidth / 2;
        brandY = targetHeight - padding;
        textAlign = 'center';
      } else if (brandPosition === 'bottom-right') {
        brandX = targetWidth - padding;
        brandY = targetHeight - padding;
        textAlign = 'right';
      } else {
        // Default to top-right
        brandX = targetWidth - padding;
        brandY = padding;
        textAlign = 'right';
      }
      
      tempCtx.textAlign = textAlign;
      tempCtx.textBaseline = 'top';
      
      // Save position for rotation
      const originalX = brandX;
      const originalY = brandY;
      
      // Apply rotation around the text position
      if (brandRotation !== 0) {
        tempCtx.translate(brandX, brandY);
        tempCtx.rotate((brandRotation || 0) * Math.PI / 180);
        brandX = 0;
        brandY = 0;
      }
      
      // Draw multiple times for outline effect (simulating WebkitTextStroke)
      if (scaledOutlineWidth > 0) {
        // Draw outline by stroking multiple times
        tempCtx.strokeStyle = brandOutlineColor || '#000000';
        tempCtx.lineWidth = scaledOutlineWidth;
        tempCtx.lineCap = 'round';
        tempCtx.lineJoin = 'round';
        
        // Main text with outline
        tempCtx.strokeText(brandPrefix || normalizedBrand, brandX, brandY);
      }
      
      // Draw main text
      tempCtx.fillStyle = brandColor || '#FFFFFF';
      
      // Apply shadow effect
      if (brandShadowOffset > 0 || brandShadowBlur > 0) {
        tempCtx.shadowColor = brandShadowColor || '#000000';
        tempCtx.shadowOffsetX = (brandShadowOffset || 0) * scale;
        tempCtx.shadowOffsetY = (brandShadowOffset || 0) * scale;
        tempCtx.shadowBlur = (brandShadowBlur || 0) * scale;
      }
      
      // Draw text multiple times for glow effect
      if (brandGlowIntensity > 0) {
        for (let i = 0; i < brandGlowIntensity * 2; i++) {
          tempCtx.globalAlpha = 0.3;
          tempCtx.fillText(brandPrefix || normalizedBrand, brandX, brandY);
        }
        tempCtx.globalAlpha = 1;
      }
      
      tempCtx.fillText(brandPrefix || normalizedBrand, brandX, brandY);
      
      // Draw underline if needed
      if (brandIsUnderline) {
        const textMetrics = tempCtx.measureText(brandPrefix || normalizedBrand);
        const underlineY = brandY + scaledFontSize + 2 * scale;
        const underlineX = textAlign === 'center' ? brandX - textMetrics.width / 2 : 
                           textAlign === 'right' ? brandX - textMetrics.width : brandX;
        tempCtx.strokeStyle = brandColor || '#FFFFFF';
        tempCtx.lineWidth = Math.max(1, scaledFontSize * 0.05);
        tempCtx.beginPath();
        tempCtx.moveTo(underlineX, underlineY);
        tempCtx.lineTo(underlineX + textMetrics.width, underlineY);
        tempCtx.stroke();
      }
      
      // Draw strikethrough if needed
      if (brandIsStrikethrough) {
        const textMetrics = tempCtx.measureText(brandPrefix || normalizedBrand);
        const strikeY = brandY + scaledFontSize * 0.5;
        const strikeX = textAlign === 'center' ? brandX - textMetrics.width / 2 : 
                        textAlign === 'right' ? brandX - textMetrics.width : brandX;
        tempCtx.strokeStyle = brandColor || '#FFFFFF';
        tempCtx.lineWidth = Math.max(1, scaledFontSize * 0.05);
        tempCtx.beginPath();
        tempCtx.moveTo(strikeX, strikeY);
        tempCtx.lineTo(strikeX + textMetrics.width, strikeY);
        tempCtx.stroke();
      }
      
      // Draw suffix if present
      if (brandSuffix) {
        const suffixFontSize = scaledFontSize * 0.7;
        const suffixY = brandY + scaledFontSize + 4 * scale;
        const fontName = getFontName(brandFontFamily);
        tempCtx.font = `${fontStyle} bold ${suffixFontSize}px ${fontName}`;
        
        if (scaledOutlineWidth > 0) {
          tempCtx.lineWidth = scaledOutlineWidth * 0.7;
          tempCtx.strokeText(brandSuffix, brandX, suffixY);
        }
        tempCtx.fillText(brandSuffix, brandX, suffixY);
      }
      
      tempCtx.restore();
    }

    if (selectedFeature === 'quote' && showScoreBox) {
      // Render template-specific styling based on selectedQuoteDesign
      const quoteScale = Math.min(scaleX, scaleY);
      const quoteHeight = 300 * quoteScale;
      const quoteY = targetHeight - quoteHeight;
      
      if (selectedQuoteDesign && TEMPLATE_DESIGNS.includes(selectedQuoteDesign) && selectedQuoteDesign !== 'classic') {
        // Template-specific rendering
        if (selectedQuoteDesign === 'red-border-quote') {
          drawRedBorderQuote(tempCtx, customMatchTime || '', spokesperson || '', matchDateTime, 
                            0, quoteY, targetWidth, quoteHeight, quoteScale);
        } else {
          // Sample quotes and other templates
          drawSampleQuote(tempCtx, customMatchTime || '', spokesperson || '', matchDateTime,
                         0, quoteY, targetWidth, quoteHeight, quoteScale);
        }
      } else {
        // Fallback to basic box
        drawQuoteBox(tempCtx, targetWidth, targetHeight, scaleX, scaleY);
      }
    }

    // ==================== RESTORE CROP CLIPPING ====================
    if (cropArea && selectedFeature !== 'merge') {
      tempCtx.restore();
    }
    // ==================== END CROP RESTORE ====================

    const tryGenerateImage = (quality, resolve, reject) => {
        tempCanvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              isDownloading.current = false;
              return;
            }

            const sizeKB = (blob.size / 1024).toFixed(2);
            console.log(`Image size at quality ${quality}: ${sizeKB} KB`);

            const targetSizeKB = 500;
            const minQuality = 0.5;
            const qualityStep = 0.05;

            if (sizeKB <= targetSizeKB || quality <= minQuality) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'image.jpg';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              tempCanvas.remove();
              resolve();
            } else {
              setTimeout(() => tryGenerateImage(quality - qualityStep, resolve, reject), 0);
            }
          },
          'image/jpeg',
          quality
        );
      };

      return new Promise((resolve, reject) => {
        tryGenerateImage(0.8, resolve, reject);
      }).finally(() => {
        isDownloading.current = false;
      });
  }, [
    image,
    additionalImages,
    texts,
    filters,
    canvasRefs,
    imageDimensions,
    selectedFeature,
    showScoreBox,
    customMatchTime,
    spokesperson,
    matchDateTime,
    fontFamily,
    brandName,
    brandFontFamily,
    brandFontSize,
    brandColor,
    brandOutlineColor,
    brandOutlineWidth,
    brandIsBold,
    brandIsItalic,
    brandIsUnderline,
    brandIsStrikethrough,
    brandShadowOffset,
    brandShadowBlur,
    brandShadowColor,
    brandGlowIntensity,
    brandGlowColor,
    brandLetterSpacing,
    brandRotation,
    brandPosition,
    logos,
    cropArea,
    selectedQuoteDesign,
  ]);

  return (
    <div className="download-section" style={{ padding: '10px', textAlign: 'center' }}>
      <button
        onClick={() => downloadImage().catch(err => console.error('Download error:', err))}
        onTouchStart={(e) => {
          downloadImage().catch(err => console.error('Download error:', err));
        }}
        style={{
          fontSize: '14px',
          background: 'green',
          color: 'black',
          border: 'none',
          borderRadius: '6px',
          padding: '11px 20px',
          cursor: 'pointer',
          touchAction: 'manipulation',
          width: 'auto',
          maxWidth: '250px',
          display: 'inline-block',
          fontWeight: '600',
          transition: 'background-color 0.2s, transform 0.1s',
          opacity: 1,
        }}
        onMouseDown={(e) => e.preventDefault()}
        onTouchEnd={(e) => e.preventDefault()}
        aria-label="Download image"
        role="button"
        disabled={isDownloading.current}
      >
        Download
      </button>
    </div>
  );
};
