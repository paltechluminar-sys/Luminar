import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PhotosQuote } from '../Quotes/PhotosQuote';
import { TextController } from '../../TextFeatures/TextController';
import { LogoController } from '../../LogoFeatures/LogoController';
import './Photos.css';
import './MergePanel.css';
import PaltechWhite from '../../Assets/PaltechWhite.png';

export const PhotosCanvas = ({
  image,
  setImage,
  texts,
  setTexts,
  logos,
  setLogos,
  updateLogo,
  filters,
  activeElement,
  setActiveElement,
  dragging,
  isRotating,
  isEditing,
  setIsEditing,
  textStyles,
  textColor,
  strokeColor,
  fontInfo,
  handleDrag,
  handleTouchMove,
  handleTouchEnd,
  handleMouseWheelRotation,
  handleTextZoom,
  stopDragging,
  handleRotation,
  stopRotation,
  handleResize,
  stopResizing,
  handleElementClick,
  handleDoubleClick,
  startLongPress,
  handleTextBlur,
  handleTextKeyDown,
  handleTouchZoom,
  setCanvasRefs,
  updateText,
  textInputRef,
  selectedFeature,
  handleImageUpload,
  fileInputRef,
  setImageDimensions,
  showScoreBox,
  setShowScoreBox,
  customMatchTime,
  setCustomMatchTime,
  spokesperson,
  setSpokesperson,
  matchDateTime,
  setMatchDateTime,
  additionalImages,
  setAdditionalImages,
  handleAdditionalImageUpload,
  brandName,
  brandFontFamily,
  brandFontSize,
  brandColor,
  brandFill,
  brandOutlineColor,
  brandOutlineWidth,
  brandOutlineStyle,
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
  disablePaltechLogo = false,
  selectedMergeLayout = null,
  mergedImages = [],
  mergeOrientation = 'portrait',
  mergeOutlineWidth = 2,
  mergeOutlineColor = '#777777',
  hoveredMergeCell = null,
  setHoveredMergeCell = () => {},
  handleChangeImageClick = () => {},
  isChangeImageMode = false,
  setIsChangeImageMode = () => {},
  selectedQuoteDesign = null,
}) => {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const additionalImageInputRef = useRef(null);
  const additionalImageRefs = useRef([]);
  const preventClickRef = useRef(false);
  const prevMergeOrientationRef = useRef(null); // Track previous value to detect changes, start as null

  const [containerDimensions, setContainerDimensions] = useState({ width: 1188, height: 708 });
  const [imageDimensionsLocal, setImageDimensionsLocal] = useState({ width: 1188, height: 708 });
  const [naturalImageDimensions, setNaturalImageDimensions] = useState({ width: 0, height: 0 });
  const [imageOrientation, setImageOrientation] = useState('landscape');
  const [renderedCanvasDimensions, setRenderedCanvasDimensions] = useState({ width: 0, height: 0 });

  // DEBUG: Log merge images on mount and when they change
  useEffect(() => {
    if (selectedFeature === 'merge' && (mergedImages?.length > 0 || selectedMergeLayout)) {
      console.log('📊 Merge ready:', {
        'Has Images': mergedImages?.length > 0,
        'Has Layout': selectedMergeLayout?.id,
      });
    }
  }, [mergedImages, selectedMergeLayout, selectedFeature]);

  const normalizedBrand = brandName ? brandName.trim() : '';
  const firstDotIndex = normalizedBrand.indexOf('.');
  const brandPrefix = firstDotIndex > 0 ? normalizedBrand.slice(0, firstDotIndex) : normalizedBrand;
  const brandSuffix = firstDotIndex > 0 ? normalizedBrand.slice(firstDotIndex) : '';

  // Get total slots for a merge layout
  const getTotalSlots = (layout) => {
    // Check for template in nested grid.template, or fallback to layout.template, or layout.id
    const templateId = layout.grid?.template || layout.template || layout.id;
    
    if (!templateId) {
      return layout.grid.columns * layout.grid.rows;
    }
    
    // Determine slot count from template ID
    if (templateId.startsWith('2m')) return 2;
    if (templateId.startsWith('3m')) return 3;
    if (templateId.startsWith('4m')) return 4;
    if (templateId.startsWith('5m')) return 5;
    if (templateId.startsWith('6m')) return 6;
    return layout.grid.columns * layout.grid.rows;
  };

  // Get exact grid position for each slot
  const getSlotPositions = (layout) => {
    if (!layout || !layout.grid?.template) return [];
    
    const positions = [];
    const totalSlots = getTotalSlots(layout);
    
    try {
      for (let i = 0; i < totalSlots; i++) {
        const cellElement = document.querySelector(`.merge-template-${layout.grid.template} .cell-${i + 1}`);
        if (cellElement) {
          const style = window.getComputedStyle(cellElement);
          positions.push({
            slotIndex: i,
            slotNumber: i + 1,
            totalSlots: totalSlots,
            gridColumn: style.gridColumn,
            gridRow: style.gridRow,
            width: style.width,
            height: style.height,
            columnStart: style.gridColumnStart,
            columnEnd: style.gridColumnEnd,
            rowStart: style.gridRowStart,
            rowEnd: style.gridRowEnd,
          });
        }
      }
    } catch (error) {
      console.log('Position data will be available after render');
    }
    
    return positions;
  };

  // Capture exact slot positions when layout changes
  useEffect(() => {
    if (selectedMergeLayout && selectedMergeLayout.grid?.template) {
      const positions = getSlotPositions(selectedMergeLayout);
      if (positions.length > 0) {
        console.log('📐 Merge Layout Slot Positions:', {
          template: selectedMergeLayout.grid.template,
          totalSlots: getTotalSlots(selectedMergeLayout),
          positions: positions.map(p => ({
            slot: `${p.slotNumber}/${p.totalSlots}`,
            gridColumn: p.gridColumn,
            gridRow: p.gridRow,
            gridColumnStart: p.columnStart,
            gridColumnEnd: p.columnEnd,
            gridRowStart: p.rowStart,
            gridRowEnd: p.rowEnd,
            dimensions: `${p.width} × ${p.height}`
          }))
        });
      }
    }
  }, [selectedMergeLayout]);

  useEffect(() => {
    if (canvasRef.current) {
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = containerDimensions.width * dpr;
      canvasRef.current.height = containerDimensions.height * dpr;

      const ctx = canvasRef.current.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, [containerDimensions]);

  useEffect(() => {
    if (setCanvasRefs) {
      setCanvasRefs({ canvasRef, imageRef, additionalImageRefs });
    }
  }, [setCanvasRefs]);

  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const displayWidth = canvas.width / dpr;
    const displayHeight = canvas.height / dpr;
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    if (image && imageRef.current && selectedFeature !== 'merge') {
      const img = imageRef.current;
      const useSplitLayout = selectedFeature === 'quote' && additionalImages.length > 0;
      const widthPerImage = displayWidth / (useSplitLayout ? 2 : 1);
      const heightPerImage = displayHeight / (useSplitLayout ? (additionalImages.length >= 2 ? 2 : 1) : 1);

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.filter = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        grayscale(${filters.grayscale}%)
        sepia(${filters.sepia}%)
        blur(${filters.blur}px)
      `;
      ctx.drawImage(img, 0, 0, widthPerImage, heightPerImage);
      ctx.filter = 'none';
    }

    if (additionalImages.length > 0 && selectedFeature === 'quote') {
      const widthPerImage = displayWidth / 2;
      const heightPerImage = displayHeight / (additionalImages.length >= 2 ? 2 : 1);
      additionalImages.forEach((imgSrc, index) => {
        const img = additionalImageRefs.current[index];
        if (img) {
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
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.filter = `
            brightness(${filters.brightness}%)
            contrast(${filters.contrast}%)
            saturate(${filters.saturation}%)
            grayscale(${filters.grayscale}%)
            sepia(${filters.sepia}%)
            blur(${filters.blur}px)
          `;
          ctx.drawImage(img, x, y, widthPerImage, heightPerImage);
          ctx.filter = 'none';
        }
      });
    }

    if (additionalImages.length > 0 && selectedFeature === 'merge') {
      const numImages = additionalImages.length;
      let cols, rows;
      if (numImages === 1) { cols = 1; rows = 1; }
      else if (numImages === 2) { cols = 2; rows = 1; }
      else if (numImages === 3) { cols = 3; rows = 1; }
      else if (numImages === 4) { cols = 2; rows = 2; }
      else { cols = Math.ceil(Math.sqrt(numImages)); rows = Math.ceil(numImages / cols); }
      const cellWidth = displayWidth / cols;
      const cellHeight = displayHeight / rows;
      additionalImages.forEach((imgSrc, index) => {
        const img = additionalImageRefs.current[index];
        if (img && img.complete) {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = col * cellWidth;
          const y = row * cellHeight;
          const imgAspect = img.naturalWidth / img.naturalHeight;
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
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.filter = `
            brightness(${filters.brightness}%)
            contrast(${filters.contrast}%)
            saturate(${filters.saturation}%)
            grayscale(${filters.grayscale}%)
            sepia(${filters.sepia}%)
            blur(${filters.blur}px)
          `;
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          ctx.filter = 'none';
        }
      });
    }
  }, [image, additionalImages, selectedFeature, filters]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleCanvasClick = useCallback((e) => {
    // Don't deselect if clicking on a text controller, logo controller, or formatting panel
    const isClickOnTextController = e.target.closest('.text-controller');
    const isClickOnLogoController = e.target.closest('.logo-controller');
    const isClickOnFormattingPanel = e.target.closest('.text-formatting-panel');
    
    if (!isClickOnTextController && !isClickOnLogoController && !isClickOnFormattingPanel) {
      setIsEditing(false);
      setActiveElement({ type: null, id: null });
    }
  }, [setIsEditing, setActiveElement]);

  const handleImageUploadClick = useCallback(() => {
    fileInputRef.current.click();
  }, [fileInputRef]);

  const handleAdditionalImageUploadClick = useCallback(() => {
    if (additionalImages.length < 3) {
      additionalImageInputRef.current.click();
    }
  }, [additionalImages.length]);

  const updateTextProperties = useCallback((id, updates) => {
    setTexts((prev) => prev.map((text) => (text.id === id ? { ...text, ...updates } : text)));
  }, [setTexts]);

  /**
   * CRITICAL: Use CSS max-constraints as reference, NOT actual canvas-panel size
   * canvas-panel is auto-sized by its children, so measuring it creates feedback loops
   * Instead, use the CSS max-width/max-height constraints: 75vw × 70vh
   */
  const getActualAvailableSpace = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth < 480;
    
    // Use CSS constraints as the STABLE reference (75vw × 70vh)
    // This prevents feedback loops when multiple images are added
    const maxWidth = window.innerWidth * 0.75; // 75vw from CSS
    
    // ⚠️ IMPORTANT: Mobile max height set to FIXED 506px (reduced 2% from 516px) for consistency
    // Desktop uses 73.31625vh (increased 5% from 69.825vh)
    // Height only - width remains responsive
    const maxHeight = isMobile ? 506 : window.innerHeight * 0.7331625;
    
    return {
      width: Math.max(Math.round(maxWidth), 100),
      height: Math.max(Math.round(maxHeight), 100),
    };
  }, []);

  /**
   * HYPER-ACCURATE dimension calculator using STABLE CSS constraints
   * Never measures canvas-panel DOM size (it's auto-sized by children)
   * Uses CSS max-width/max-height which are the REAL constraints
   * MOBILE: Gets special handling for better mobile display
   */
  const calculateSmartContainerDimensions = useCallback((imgWidth, imgHeight) => {
    if (!imgWidth || !imgHeight) return { width: 1188, height: 708, orientation: 'landscape', aspectRatio: 1.676 };

    // Get STABLE available space from CSS constraints (not DOM measurement)
    const availableSpace = getActualAvailableSpace();
    
    // MOBILE-SPECIFIC optimization
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth < 480;
    
    // ⚠️ IMPORTANT: Mobile scale factor reduced by 10% + 5% more to prevent overflow and improve UX
    // Desktop stays conservative at 0.95 to maintain padding
    const scaleFactor = isMobile ? 1.026 : 0.95;
    
    const maxAvailableWidth = availableSpace.width * scaleFactor;
    const maxAvailableHeight = availableSpace.height * scaleFactor;
    
    const imageAspectRatio = imgWidth / imgHeight;
    
    // ULTRA-PRECISE orientation detection
    const isPortrait = imageAspectRatio < 0.95;
    const isLandscape = imageAspectRatio > 1.05;
    const isSquare = !isPortrait && !isLandscape;
    
    // MERGE MODE: Determine target aspect ratio for merge feature
    let targetAspectRatio = null;
    if (selectedFeature === 'merge') {
      if (mergeOrientation === 'portrait') {
        targetAspectRatio = 9 / 16; // Portrait: 9:16
      } else if (mergeOrientation === 'landscape') {
        targetAspectRatio = 16 / 9; // Landscape: 16:9
      } else if (mergeOrientation === 'square') {
        targetAspectRatio = 1; // Square: 1:1
      }
    }
    
    // HYPER-ACCURATE container calculation: fit image to available space PERFECTLY
    let containerWidth, containerHeight;
    
    if (targetAspectRatio) {
      // MERGE MODE: Use merge aspect ratio as primary constraint
      containerWidth = maxAvailableWidth;
      containerHeight = Math.round(containerWidth / targetAspectRatio);
      if (containerHeight > maxAvailableHeight) {
        containerHeight = maxAvailableHeight;
        containerWidth = Math.round(containerHeight * targetAspectRatio);
      }
    } else if (imageAspectRatio >= 1) {
      // Landscape or square: prioritize width
      containerWidth = maxAvailableWidth;
      containerHeight = Math.round(containerWidth / imageAspectRatio);
      
      // If height exceeds available, use height as limit
      if (containerHeight > maxAvailableHeight) {
        containerHeight = maxAvailableHeight;
        containerWidth = Math.round(containerHeight * imageAspectRatio);
      }
    } else {
      // Portrait: prioritize height
      containerHeight = maxAvailableHeight;
      containerWidth = Math.round(containerHeight * imageAspectRatio);
      
      // If width exceeds available, use width as limit
      if (containerWidth > maxAvailableWidth) {
        containerWidth = maxAvailableWidth;
        containerHeight = Math.round(containerWidth / imageAspectRatio);
      }
    }
    
    // FINAL VALIDATION: ensure dimensions are valid
    containerWidth = Math.max(Math.round(containerWidth), 100);
    containerHeight = Math.max(Math.round(containerHeight), 100);
    
    // ⚠️ IMPORTANT: Apply additional 15% upscaling on mobile for better visibility
    // But ensure aspect ratio is PRESERVED and height doesn't exceed max constraint
    const mobileImageScale = isMobile ? 1.15 : 1.0;
    let scaledWidth = Math.round(containerWidth * mobileImageScale);
    let scaledHeight = Math.round(containerHeight * mobileImageScale);
    
    // ULTRA-CRITICAL: If scaled height exceeds max available, scale DOWN proportionally
    // This ensures perfect fit without ANY distortion for taller images
    if (isMobile && scaledHeight > maxAvailableHeight) {
      const heightConstraintScale = maxAvailableHeight / scaledHeight;
      scaledHeight = maxAvailableHeight;
      scaledWidth = Math.round(scaledWidth * heightConstraintScale);
    }
    
    // Calculate actual resulting aspect ratio
    const resultingAspectRatio = scaledWidth / scaledHeight;
    
    return { 
      width: scaledWidth, 
      height: scaledHeight,
      orientation: isSquare ? 'square' : (isPortrait ? 'portrait' : 'landscape'),
      aspectRatio: imageAspectRatio,
      resultingAspectRatio: resultingAspectRatio,
      targetAspectRatio: targetAspectRatio,
      maxAvailable: { width: Math.round(maxAvailableWidth), height: Math.round(maxAvailableHeight) },
    };
  }, [getActualAvailableSpace, selectedFeature, mergeOrientation]);

  const handleImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (img && img.naturalWidth && img.naturalHeight) {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      setNaturalImageDimensions({ width: naturalWidth, height: naturalHeight });
      
      // Use the hyper-accurate calculator (uses stable CSS constraints, not DOM)
      // The function reads selectedFeature and mergeOrientation from closure
      const isMerge = selectedFeature === 'merge';
      const dimensions = calculateSmartContainerDimensions(naturalWidth, naturalHeight);
      
      console.log('🎯 IMAGE LOADED - MERGE-AWARE Calculation:', {
        'Image Natural': `${naturalWidth}×${naturalHeight} (${dimensions.aspectRatio.toFixed(3)})`,
        'Orientation': dimensions.orientation.toUpperCase(),
        'Merge Mode': isMerge ? `YES (${mergeOrientation})` : 'NO',
        'Canvas Dimensions': `${dimensions.width}×${dimensions.height}`,
        'Resulting Ratio': dimensions.resultingAspectRatio.toFixed(3),
        'Target Ratio': dimensions.targetAspectRatio ? dimensions.targetAspectRatio.toFixed(4) : 'N/A',
        'Available': `${dimensions.maxAvailable.width}×${dimensions.maxAvailable.height}`,
      });
      
      setImageOrientation(dimensions.orientation);
      setContainerDimensions({ width: dimensions.width, height: dimensions.height });
      setImageDimensionsLocal({ width: dimensions.width, height: dimensions.height });

      // Schedule measurement of actual rendered image dimensions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              setRenderedCanvasDimensions({
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              });
              console.log('📏 Image rendered dimensions:', {
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              });
            }
          }
        });
      });
    }
  }, [calculateSmartContainerDimensions, selectedFeature, mergeOrientation]);

  useEffect(() => {
    if (image && imageRef.current && imageRef.current.complete) {
      handleImageLoad();
    }
  }, [image, handleImageLoad]);

  /**
   * CRITICAL: Real-time listener for ACTUAL viewport changes ONLY
   * Does NOT measure canvas-panel or rendered dimensions (those cause feedback loops)
   * Only recalculates when window size changes meaningfully
   */
  useEffect(() => {
    if (!naturalImageDimensions.width || !naturalImageDimensions.height) return;

    let isCalculating = false;
    let needsRecalc = false;
    let lastViewportWidth = window.innerWidth;
    let lastViewportHeight = window.innerHeight;

    const handleDimensionChange = () => {
      if (isCalculating) {
        needsRecalc = true;
        return;
      }

      isCalculating = true;

      // Calculate new dimensions based on viewport
      // Pass merge mode info with updated parameters
      const isMerge = selectedFeature === 'merge';
      const dimensions = calculateSmartContainerDimensions(
        naturalImageDimensions.width,
        naturalImageDimensions.height
      );
      
      console.log('⚡ VIEWPORT CHANGED - MERGE-AWARE Update:', {
        'Viewport': `${window.innerWidth}×${window.innerHeight}`,
        'New Dimensions': `${dimensions.width}×${dimensions.height}`,
        'Merge Mode': isMerge ? `YES (${mergeOrientation})` : 'NO',
        'Orientation': dimensions.orientation,
      });
      
      setImageOrientation(dimensions.orientation);
      setContainerDimensions({ width: dimensions.width, height: dimensions.height });
      setImageDimensionsLocal({ width: dimensions.width, height: dimensions.height });
      
      // Force canvas redraw if it exists
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = dimensions.width * dpr;
        canvasRef.current.height = dimensions.height * dpr;
      }

      isCalculating = false;

      // If another resize happened while calculating, recalculate
      if (needsRecalc) {
        needsRecalc = false;
        requestAnimationFrame(handleDimensionChange);
      }
    };

    // Use requestAnimationFrame for smooth updates - BUT only on real viewport changes
    const handleResizeWithRAF = () => {
      // Only recalculate if viewport actually changed significantly (>5px)
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      
      if (Math.abs(currentWidth - lastViewportWidth) > 5 || 
          Math.abs(currentHeight - lastViewportHeight) > 5) {
        lastViewportWidth = currentWidth;
        lastViewportHeight = currentHeight;
        requestAnimationFrame(handleDimensionChange);
      }
    };

    // Attach listeners - ONLY for actual viewport changes
    window.addEventListener('resize', handleResizeWithRAF, { passive: true });
    window.addEventListener('orientationchange', handleDimensionChange, { passive: true });
    
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleDimensionChange);
    }

    return () => {
      window.removeEventListener('resize', handleResizeWithRAF);
      window.removeEventListener('orientationchange', handleDimensionChange);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleDimensionChange);
      }
    };
  }, [naturalImageDimensions, calculateSmartContainerDimensions, selectedFeature, mergeOrientation]);

  /**
   * CRITICAL FIX: Remove canvas-panel ResizeObserver that causes shrinking loops!
   * Only recalculate on INTENTIONAL changes: image load, window resize, orientation change
   * NOT on internal dimension updates (which would cause feedback loop)
   */
  useEffect(() => {
    const canvasPanel = document.querySelector('.canvas-panel');
    if (!canvasPanel || naturalImageDimensions.width === 0) return;

    let debounceTimer = null;
    let lastCalculatedDimensions = null;
    let measurementAttempts = 0;
    const MAX_ATTEMPTS = 3;

    const attemptRecalculation = () => {
      const availableSpace = getActualAvailableSpace();
      
      // Validate that canvas-panel exists and has valid dimensions
      if (availableSpace.width <= 0 || availableSpace.height <= 0) {
        if (measurementAttempts < MAX_ATTEMPTS) {
          measurementAttempts++;
          // Retry after short delay
          setTimeout(attemptRecalculation, 50);
        }
        return;
      }

      // Recalculate dimensions based on actual canvas-panel size
      const dimensions = calculateSmartContainerDimensions(
        naturalImageDimensions.width,
        naturalImageDimensions.height
      );

      // Only update if dimensions actually changed SIGNIFICANTLY (tolerance: 5px)
      if (lastCalculatedDimensions && 
          Math.abs(lastCalculatedDimensions.width - dimensions.width) < 5 &&
          Math.abs(lastCalculatedDimensions.height - dimensions.height) < 5 &&
          lastCalculatedDimensions.orientation === dimensions.orientation) {
        // Dimensions unchanged within tolerance - skip update to prevent loops
        return;
      }

      lastCalculatedDimensions = dimensions;
      measurementAttempts = 0;

      console.log('📐 LOOP-SAFE Canvas Update:', {
        'Available': `${availableSpace.width}×${availableSpace.height}`,
        'Calculated': `${dimensions.width}×${dimensions.height}`,
        'Orientation': dimensions.orientation,
        'AspectRatio': dimensions.resultingAspectRatio.toFixed(3),
      });

      setImageOrientation(dimensions.orientation);
      setContainerDimensions({ width: dimensions.width, height: dimensions.height });
      setImageDimensionsLocal({ width: dimensions.width, height: dimensions.height });

      // Force canvas redraw with DPR awareness
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = dimensions.width * dpr;
        canvasRef.current.height = dimensions.height * dpr;
      }
    };

    const recalculateOnPanelResize = () => {
      // Debounce: clear previous timer and set new one
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Use CropTool's stabilization delay (250ms)
      debounceTimer = setTimeout(attemptRecalculation, 250);
    };

    // DIRECT CALL: If orientation changed in merge mode, recalculate immediately
    if (selectedFeature === 'merge' && prevMergeOrientationRef.current !== mergeOrientation) {
      console.log('✅ ORIENTATION CHANGED - IMMEDIATE RECALCULATION:', mergeOrientation);
      attemptRecalculation();
    } else {
      // Initial calculation only, NOT reactive to ResizeObserver
      attemptRecalculation();
    }

    // IMPORTANT: We do NOT observe canvas-panel ResizeObserver changes
    // because that creates a feedback loop (dimension change → panel resize → recalc → smaller dimensions)
    // Only recalculate on explicit user actions handled by other listeners

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [naturalImageDimensions, calculateSmartContainerDimensions, getActualAvailableSpace, mergeOrientation, selectedFeature, mergedImages]);

  /**
   * DEDICATED effect: When merge orientation changes, immediately recalculate canvas dimensions
   * Also triggers when merge feature opens to apply initial square orientation
   */
  useEffect(() => {
    // When merge closes, reset the ref so next time merge opens it's detected as "just opened"
    if (selectedFeature !== 'merge') {
      prevMergeOrientationRef.current = null;
      return;
    }

    const orientationChanged = prevMergeOrientationRef.current !== null && prevMergeOrientationRef.current !== mergeOrientation;
    const mergeJustOpened = prevMergeOrientationRef.current === null;
    
    if ((orientationChanged || mergeJustOpened) && selectedFeature === 'merge') {
      // Use a default 1080x1080 if no images
      const width = 1080;
      const height = 1080;

      // Calculate new dimensions with correct aspect ratio
      const dimensions = calculateSmartContainerDimensions(width, height);

      // Update state to trigger canvas resize
      setContainerDimensions({ width: dimensions.width, height: dimensions.height });
      setImageDimensionsLocal({ width: dimensions.width, height: dimensions.height });
      setImageOrientation(dimensions.orientation);

      // Redraw canvas element
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = dimensions.width * dpr;
        canvasRef.current.height = dimensions.height * dpr;
      }
    }

    // Update ref for next comparison
    prevMergeOrientationRef.current = mergeOrientation;
  }, [mergeOrientation, selectedFeature, calculateSmartContainerDimensions]);

  /**
   * MEASURE ACTUAL RENDERED IMAGE WIDTH FOR TEXT AREA
   * Gets the real DOM width of the image element (the actual visible image in the canvas)
   * This ensures TextArea dimensions match the exact image bounds, not the wrapper
   */
  useEffect(() => {
    const measureImageWidth = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const actualWidth = Math.round(rect.width);
        const actualHeight = Math.round(rect.height);
        
        if (actualWidth > 0 && actualHeight > 0) {
          setRenderedCanvasDimensions({
            width: actualWidth,
            height: actualHeight
          });
        }
      }
    };

    // Measure after a short delay to ensure DOM is ready
    const measureTimer = setTimeout(() => {
      measureImageWidth();
    }, 100);

    // Re-measure on window resize
    const handleResize = () => {
      measureImageWidth();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(measureTimer);
    };
  }, [image, containerDimensions]);


  /**
   * DISABLED: Measurement hooks disabled to prevent cascading updates
   * These were constantly triggering state updates and causing shrinking
   */
  // All measurement/rendering verification disabled - they're unnecessary for core function
  // If needed in future, can be re-enabled with proper isolation

  useEffect(() => {
    if (setImageDimensions) {
      setImageDimensions(containerDimensions);
    }
  }, [containerDimensions, setImageDimensions]);

  // Handle clicks outside text and formatting panel to deselect text
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Only deselect if something is actually selected
      if (!activeElement.type) return;
      
      // Check if the click is on text-related or logo-related elements
      const isClickOnTextController = e.target.closest('.text-controller');
      const isClickOnLogoController = e.target.closest('.logo-controller');
      const isClickOnFormattingPanel = e.target.closest('.text-formatting-panel');
      
      // If clicking outside text/logo-related areas, deselect
      if (!isClickOnTextController && !isClickOnLogoController && !isClickOnFormattingPanel) {
        setActiveElement({ type: null, id: null });
      }
    };
    
    // Use capture phase to ensure we detect clicks even if stopPropagation is called
    document.addEventListener('mousedown', handleDocumentClick, true);
    return () => document.removeEventListener('mousedown', handleDocumentClick, true);
  }, [activeElement.type, setActiveElement]);

  return (
    <div
      className={`canvas-wrapper${!image && selectedFeature !== 'merge' ? ' canvas-empty-state' : ''}`}
      ref={wrapperRef}
      onPointerMove={handleDrag}
      onPointerUp={stopDragging}
      onPointerLeave={stopDragging}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleMouseWheelRotation}
      onClick={handleCanvasClick}
      style={{
        touchAction: 'none',
        position: 'relative',
        overflow: 'hidden',
        padding: '0px',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: containerDimensions.width > 0 ? `${!image && selectedFeature !== 'merge' && window.innerWidth > 768 ? containerDimensions.width * 0.9 : containerDimensions.width}px` : '100%',
        height: containerDimensions.height > 0 ? `${!image && selectedFeature !== 'merge' && window.innerWidth > 768 ? containerDimensions.height * 0.9 : containerDimensions.height}px` : '100%',
        minWidth: '100px',
        minHeight: '100px',
        borderRadius: window.innerWidth <= 480 ? '6px' : window.innerWidth <= 768 ? '8px' : '12px',
        aspectRatio: selectedFeature === 'merge' 
          ? mergeOrientation === 'portrait' 
            ? '9/16'
            : mergeOrientation === 'landscape'
            ? '16/9'
            : '1/1'
          : 'auto',
        // SUPER SMART responsive transitions - smoothly adapts to dimension changes
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.2s ease-out',
        willChange: 'width, height',
      }}
    >
      <div
        className="image-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          background: 'transparent',
          borderRadius: window.innerWidth <= 480 ? '6px' : window.innerWidth <= 768 ? '8px' : '12px',
          overflow: 'hidden',
          aspectRatio: selectedFeature === 'merge' 
            ? mergeOrientation === 'portrait' 
              ? '9/16'
              : mergeOrientation === 'landscape'
              ? '16/9'
              : '1/1'
            : 'auto',
          // SUPER SMART transitions - smooth visual feedback for responsive changes
          transition: 'border-radius 0.2s ease-out',
          willChange: 'border-radius',
        }}
      >
        {image && (
          <div
            key={`image-wrapper-${imageOrientation}`}
            style={{
              width: additionalImages.length > 0 && selectedFeature === 'quote' ? '50%' : '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: additionalImages.length > 0 && selectedFeature === 'quote' ? '0 0 50%' : '1 1 100%',
              borderRadius: window.innerWidth <= 480 ? '6px' : window.innerWidth <= 768 ? '8px' : '12px',
              overflow: 'hidden',
              backgroundColor: '#000000',
              minWidth: 0,
              minHeight: 0,
              // SUPER SMART responsive transition
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), flex 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'width, flex',
            }}
          >
            <img
              key={`main-image-${imageOrientation}-${image}`}
              ref={imageRef}
              src={image}
              alt="Uploaded background"
              onLoad={handleImageLoad}
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                minWidth: 0,
                minHeight: 0,
                objectFit: 'contain',
                objectPosition: 'center center',
                display: 'block',
                borderRadius: window.innerWidth <= 480 ? '3px' : window.innerWidth <= 768 ? '4px' : '8px',
                WebkitBorderRadius: window.innerWidth <= 480 ? '3px' : window.innerWidth <= 768 ? '4px' : '8px',
                // SUPER SMOOTH image scaling - smooth transitions when dimensions change
                transition: 'border-radius 0.2s ease-out',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                perspective: 1000,
              }}
            />
          </div>
        )}

        {selectedFeature === 'quote' && additionalImages.map((imgSrc, index) => (
          <div
            key={`additional-image-${index}`}
            style={{
              width: '50%',
              height: additionalImages.length >= 2 ? '50%' : '100%',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: additionalImages.length >= 2 ? '0 0 50%' : '1 1 100%',
              backgroundColor: '#000000',
              overflow: 'hidden',
              minWidth: 0,
              minHeight: 0,
              // SUPER SMART responsive transition
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <img
              ref={(el) => (additionalImageRefs.current[index] = el)}
              src={imgSrc}
              alt={`Additional image ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                minWidth: 0,
                minHeight: 0,
                objectFit: 'contain',
                objectPosition: 'center center',
                display: 'block',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
        ))}

        {selectedFeature === 'merge' && additionalImages.map((imgSrc, index) => (
          <img
            key={`merge-ref-${index}`}
            ref={(el) => (additionalImageRefs.current[index] = el)}
            src={imgSrc}
            style={{ display: 'none' }}
            alt={`Merged image ${index + 1}`}
          />
        ))}

        {selectedFeature === 'merge' && selectedMergeLayout && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (e.target === e.currentTarget && isChangeImageMode) {
                setIsChangeImageMode(false);
              }
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'grid',
              gridTemplateColumns: `repeat(${selectedMergeLayout.grid.columns}, 1fr)`,
              gridTemplateRows: `repeat(${selectedMergeLayout.grid.rows}, 1fr)`,
              gap: 0,
              backgroundColor: '#1a1a1a',
              padding: 0,
              boxSizing: 'border-box',
              borderRadius: '0',
              overflow: 'hidden',
              border: `${mergeOutlineWidth}px solid ${mergeOutlineColor}`,
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
            }}
            className={selectedMergeLayout.grid?.template ? `merge-template-${selectedMergeLayout.grid.template} merge-grid-container` : 'merge-grid-container'}
          >
              {(() => {
                const totalSlots = getTotalSlots(selectedMergeLayout);
                
                return Array.from({ length: totalSlots }).map((_, idx) => {
                  return (
                    <div
                      key={`merge-slot-${idx}`}
                      className={selectedMergeLayout.grid?.template ? `cell-${idx + 1} merge-grid-cell` : 'merge-grid-cell'}
                      data-slot-index={idx}
                      data-slot-number={idx + 1}
                      data-total-slots={totalSlots}
                      data-layout-template={selectedMergeLayout.grid?.template || selectedMergeLayout.id}
                      onMouseEnter={() => setHoveredMergeCell(idx)}
                      onMouseLeave={() => setHoveredMergeCell(null)}
                      style={{
                        backgroundColor: mergedImages[idx] ? 'transparent' : '#333',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRight: `${mergeOutlineWidth}px solid ${mergeOutlineColor}`,
                        borderBottom: `${mergeOutlineWidth}px solid ${mergeOutlineColor}`,
                        display: 'flex',
                        alignItems: 'stretch',
                        justifyContent: 'stretch',
                        borderRadius: 0,
                        margin: 0,
                        padding: 0,
                        boxSizing: 'border-box',
                        minWidth: 0,
                        minHeight: 0,
                      }}
                    >
                      {mergedImages[idx] ? (
                        <>
                          <img
                            src={mergedImages[idx].src}
                            alt={`Merged ${idx}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center',
                              display: 'block',
                              flex: 1,
                            }}
                          />
                          {(hoveredMergeCell === idx || isChangeImageMode) && (
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleChangeImageClick(idx);
                              }}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isChangeImageMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                                cursor: 'pointer',
                                fontSize: '32px',
                                transition: 'all 0.2s ease',
                                pointerEvents: 'auto',
                                zIndex: 10,
                              }}
                            >
                              📷
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '28px',
                            color: '#888',
                            fontWeight: 'bold',
                            width: '100%',
                            height: '100%',
                          }}
                        >
                          📷
                          <span style={{ fontSize: '14px', color: '#888' }}>
                            {idx + 1}/{totalSlots}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{
            position: image ? 'absolute' : 'relative',
            top: 0,
            left: 0,
            width: imageDimensionsLocal.width ? `${imageDimensionsLocal.width}px` : '100%',
            height: imageDimensionsLocal.height ? `${imageDimensionsLocal.height}px` : '100%',
            background: 'transparent',
          }}
        />

        
        {image && normalizedBrand && (
          <div
            className="campuslife-text"
            style={{
              position: 'absolute',
              ...(brandPosition === 'top-left' && { top: '10px', left: '10px', textAlign: 'left' }),
              ...(brandPosition === 'top-center' && { top: '10px', left: '50%', textAlign: 'center', transform: `translateX(-50%) rotate(${brandRotation}deg)` }),
              ...(brandPosition === 'top-right' && { top: '10px', right: '10px', textAlign: 'right' }),
              ...(brandPosition === 'center-left' && { top: '50%', left: '10px', textAlign: 'left', transform: `translateY(-50%) rotate(${brandRotation}deg)` }),
              ...(brandPosition === 'center' && { top: '50%', left: '50%', textAlign: 'center', transform: `translate(-50%, -50%) rotate(${brandRotation}deg)` }),
              ...(brandPosition === 'center-right' && { top: '50%', right: '10px', textAlign: 'right', transform: `translateY(-50%) rotate(${brandRotation}deg)` }),
              ...(brandPosition === 'bottom-left' && { bottom: '10px', left: '10px', textAlign: 'left' }),
              ...(brandPosition === 'bottom-center' && { bottom: '10px', left: '50%', textAlign: 'center', transform: `translateX(-50%) rotate(${brandRotation}deg)` }),
              ...(brandPosition === 'bottom-right' && { bottom: '10px', right: '10px', textAlign: 'right' }),
              ...(!(brandPosition === 'top-center' || brandPosition === 'center-left' || brandPosition === 'center' || brandPosition === 'center-right' || brandPosition === 'bottom-center') && { transform: `rotate(${brandRotation}deg)` }),
              color: brandColor,
              fontSize: `${brandFontSize}px`,
              fontWeight: brandIsBold ? 'bold' : '400',
              fontStyle: brandIsItalic ? 'italic' : 'normal',
              textDecoration: `${brandIsUnderline ? 'underline' : ''} ${brandIsStrikethrough ? 'line-through' : ''}`.trim(),
              lineHeight: '1.2',
              zIndex: 15,
              fontFamily: brandFontFamily || "'Roboto', sans-serif",
              letterSpacing: `${brandLetterSpacing}px`,
              textShadow: brandShadowOffset > 0 || brandShadowBlur > 0 ? `${brandShadowOffset}px ${brandShadowOffset}px ${brandShadowBlur}px ${brandShadowColor}` : 'none',
              filter: brandGlowIntensity > 0 ? `drop-shadow(0 0 ${brandGlowIntensity}px ${brandGlowColor})` : 'none',
              WebkitTextStroke: brandOutlineWidth > 0 ? `${brandOutlineWidth}px ${brandOutlineColor}` : 'none',
            }}
            aria-label={`${brandPrefix} website branding`}
          >
            {brandPrefix || normalizedBrand}
            {brandSuffix ? (
              <>
                <br />
                <span style={{ fontSize: `${brandFontSize * 0.7}px`, fontWeight: brandIsBold ? 'bold' : 'normal' }}>{brandSuffix}</span>
              </>
            ) : null}
          </div>
        )}

        {/* Render Text Elements */}
        {texts.map((text) => (
          <TextController
            key={text.id}
            text={text}
            isSelected={activeElement.id === text.id && activeElement.type === 'text'}
            onSelect={() => setActiveElement({ type: 'text', id: text.id })}
            onDeselect={() => setActiveElement({ type: null, id: null })}
            onUpdate={(updates) => updateText(text.id, updates)}
            onContentChange={(content) => updateText(text.id, { content })}
            maxWidth={renderedCanvasDimensions.width ? Math.round(renderedCanvasDimensions.width * 0.95) : imageDimensionsLocal.width}
          />
        ))}

        {/* Render Logo Elements */}
        {logos?.map((logo) => (
          <LogoController
            key={logo.id}
            logo={logo}
            isSelected={activeElement.id === logo.id && activeElement.type === 'logo'}
            onSelect={() => setActiveElement({ type: 'logo', id: logo.id })}
            onDeselect={() => setActiveElement({ type: null, id: null })}
            onUpdate={(updates) => updateLogo(logo.id, updates)}
          />
        ))}

        {!image && selectedFeature !== 'merge' && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              color: '#d9e3ee',
              textAlign: 'center',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ fontSize: '14px', marginBottom: '18px', fontWeight: 450, color: '#a8b0b8' }}>Let's go!!</div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="canvas-upload-dropzone"
            >
              Upload Image
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
          aria-label="Upload image"
        />
        <input
          type="file"
          ref={additionalImageInputRef}
          onChange={handleAdditionalImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
          aria-label="Upload additional image"
        />

        {image && showScoreBox && selectedFeature === 'quote' && (
          <div
            className="quote-box"
            style={{
              position: 'absolute',
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 'auto',
              width: `${containerDimensions.width * 0.7}px`,
              maxWidth: `${imageDimensionsLocal.width * 0.8}px`,
              pointerEvents: 'auto',
              borderRadius: selectedQuoteDesign ? '0' : '10px',
              padding: selectedQuoteDesign ? '0' : '0 0 4px 0',
              background: selectedQuoteDesign ? 'transparent' : 'rgba(0, 0, 0, 0.7)',
              border: selectedQuoteDesign ? 'none' : 'none',
            }}
          >
            <PhotosQuote
              customMatchTime={customMatchTime}
              setCustomMatchTime={setCustomMatchTime}
              spokesperson={spokesperson}
              setSpokesperson={setSpokesperson}
              matchDateTime={matchDateTime}
              setMatchDateTime={setMatchDateTime}
              selectedQuoteDesign={selectedQuoteDesign}
              containerWidth={containerDimensions.width * 0.7}
              containerHeight={selectedQuoteDesign ? 200 : 150}
            />
          </div>
        )}

      </div>
    </div>
  );
};
