import React, { useRef, useEffect, useState, useCallback } from 'react';
import './Sports.css';
import PaltechWhite from '../../Assets/PaltechWhite.png';
export const SportsCanvas = ({
  image,
  setImage,
  logos,
  setLogos,
  filters,
  activeElement,
  setActiveElement,
  dragging,
  isRotating,
  isEditing,
  setIsEditing,
  handleDrag,
  handleTouchMove,
  handleTouchEnd,
  handleMouseWheelRotation,
  handleLogoResize,
  startDragging,
  stopDragging,
  startRotation,
  handleRotation,
  stopRotation,
  handleElementClick,
  setCanvasRefs,
  updateLogoProperties,
  selectedFeature,
  handleImageUpload,
  fileInputRef,
  logoInputRef,
  onTeam1Click,
  onTeam2Click,
  team1Logo,
  team2Logo,
  setTeam1Logo,
  setTeam2Logo,
  setImageDimensions,
  team1Score,
  team2Score,
  setTeam1Score,
  setTeam2Score,
  selectedCompetition,
  setSelectedCompetition,
  matchStatus,
  setMatchStatus,
  team1Goals,
  setTeam1Goals,
  team2Goals,
  setTeam2Goals,
  addGoal,
  updateGoal,
  removeGoal,
  isMatchday,
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
  disablePaltechLogo = false,
  isCropping = false,
}) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const wrapperRef = useRef(null);
  const additionalImageInputRef = useRef(null);
  const additionalImageRefs = useRef([]);
  const [imageDimensionsLocal, setImageDimensionsLocal] = useState({ width: 1188, height: 708 });
  const [imageOrientation, setImageOrientation] = useState('landscape');
  const [naturalImageDimensions, setNaturalImageDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 1188, height: 708 });
  const [logoMoved, setLogoMoved] = useState(false);
  const [isPaltechDeleted, setIsPaltechDeleted] = useState(false); // New state to track deletion

  const scoreOptions = Array.from({ length: 20 }, (_, i) => i + 1);
  const timeOptions = Array.from({ length: 120 }, (_, i) => i + 1);

  const competitions = [
    'Premier League', 'LaLiga', 'Friendly', 'FA Cup', 'UEFA Champions League', 'UEFA Europa League',
    'UEFA Europa Conference League', 'Bundesliga', 'Serie A', 'Ligue 1', 'Copa del Rey', 'DFB-Pokal',
    'Coppa Italia', 'Coupe de France', 'EFL Cup', 'FIFA World Cup', 'UEFA European Championship',
    'Copa América', 'Africa Cup of Nations', 'CONMEBOL Libertadores', 'CONMEBOL Sudamericana',
    'AFC Champions League', 'MLS', 'CONCACAF Champions Cup', 'FIFA Club World Cup',
  ];

  const matchStatusOptions = ['Half-Time', 'Full-Time', 'Custom'];

  const generateDays = () => Array.from({ length: 31 }, (_, i) => i + 1);
  const generateMonths = () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const generateHours = () => Array.from({ length: 24 }, (_, i) => i.toString());
  const generateMinutes = () => ['00', '15', '30', '45'];
  const generateWeekdays = () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const generateYears = () => Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const calculateWeekday = (day, month, year) => {
    const monthIndex = generateMonths().indexOf(month);
    const date = new Date(year, monthIndex, day);
    return date.toLocaleString('en-US', { weekday: 'short' });
  };

  useEffect(() => {
    if (isMatchday || selectedFeature === 'quote') {
      const { day, month, year } = matchDateTime;
      const newWeekday = calculateWeekday(day, month, year);
      setMatchDateTime((prev) => ({ ...prev, weekday: newWeekday }));
      const formattedDateTime = `${newWeekday} ${day}/${month}/${year} ${matchDateTime.hour}:${matchDateTime.minute}`;
      setMatchStatus(formattedDateTime);
    }
  }, [isMatchday, selectedFeature, matchDateTime, setMatchDateTime, setMatchStatus]);

  // Fixed canvas dimensions
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
    if (
      image &&
      !logos.some((logo) => logo.id === 'paltechWhite') &&
      !isPaltechDeleted &&
      !disablePaltechLogo
    ) {
      const logoWidth = (isMatchday || selectedFeature === 'quote' ? 50 : 100) / 2; // Half the original size
      const logoHeight = (isMatchday || selectedFeature === 'quote' ? 50 : 100) / 2; // Half the original size
      const margin = 10;
      setLogos((prevLogos) => [
        ...prevLogos,
        {
          id: 'paltechWhite',
          type: 'logo',
          src: PaltechWhite,
          x: margin + logoWidth / 2,
          y: margin + logoHeight / 2,
          width: logoWidth,
          height: logoHeight,
          rotation: 0,
          opacity: 1,
          brightness: 1,
        },
      ]);
    }
  }, [image, imageDimensionsLocal, logos, setLogos, selectedFeature, additionalImages, isMatchday, isPaltechDeleted, disablePaltechLogo]);

  useEffect(() => {
    if (canvasRef.current) {
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = 888 * dpr;
      canvasRef.current.height = 588 * dpr;
      
      const ctx = canvasRef.current.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, []);

  useEffect(() => {
    if (setCanvasRefs) {
      setCanvasRefs({ canvasRef, imageRef, additionalImageRefs });
    }
  }, [setCanvasRefs]);

  const drawImageElement = useCallback(
    (ctx, logo) => {
      if (!logo.src || logo.id === 'quoteImage' || logo.id === 'paltechWhite') return;
      const img = new Image();
      img.src = logo.src;
      if (!img.complete) {
        img.onload = () => {
          ctx.save();
          ctx.translate(logo.x, logo.y);
          ctx.rotate((logo.rotation * Math.PI) / 180);
          ctx.globalAlpha = logo.opacity;
          ctx.filter = `brightness(${logo.brightness * 100}%)`;
          ctx.drawImage(img, -logo.width / 2, -logo.height / 2, logo.width, logo.height);
          ctx.restore();
        };
      } else {
        ctx.save();
        ctx.translate(logo.x, logo.y);
        ctx.rotate((logo.rotation * Math.PI) / 180);
        ctx.globalAlpha = logo.opacity;
        ctx.filter = `brightness(${logo.brightness * 100}%)`;
        ctx.drawImage(img, -logo.width / 2, -logo.height / 2, logo.width, logo.height);
        ctx.restore();
      }
    },
    []
  );

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
      const totalImages = 1 + additionalImages.length;
      const widthPerImage = displayWidth / ((isMatchday || selectedFeature === 'quote') && totalImages > 1 ? 2 : 1);
      const heightPerImage = displayHeight / ((isMatchday || selectedFeature === 'quote') && totalImages > 2 ? 2 : 1);

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

    if (additionalImages.length > 0 && (isMatchday || selectedFeature === 'quote')) {
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

    logos.forEach((logo) => {
      if (
        logo.type === 'logo' &&
        logo.id !== 'team1Logo' &&
        logo.id !== 'team2Logo' &&
        logo.id !== 'quoteImage' &&
        logo.id !== 'paltechWhite'
      ) {
        drawImageElement(ctx, logo);
      }
    });
  }, [image, additionalImages, isMatchday, selectedFeature, filters, logos, drawImageElement]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleCanvasClick = useCallback(() => {
    setIsEditing(false);
    setActiveElement({ type: null, id: null });
  }, [setIsEditing, setActiveElement]);

  const handleImageUploadClick = useCallback(() => {
    fileInputRef.current.click();
  }, [fileInputRef]);

  const handleAdditionalImageUploadClick = useCallback(() => {
    if (additionalImages.length < 3) {
      additionalImageInputRef.current.click();
    }
  }, [additionalImages.length]);

  const handleMatchStatusChange = (value) => {
    setMatchStatus(value);
    if (value !== 'Custom') {
      setCustomMatchTime('');
    } else if (!customMatchTime) {
      setMatchStatus('Custom');
    }
  };

  const handleCustomTimeChange = (value) => {
    setCustomMatchTime(value);
    setMatchStatus(value ? `${value}'` : 'Custom');
  };

  const addLogo = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoId = selectedFeature === 'quote' ? 'quoteImage' : `logo-${Date.now()}`;
        setLogos((prevLogos) => [
          ...prevLogos.filter((logo) => logo.id !== 'quoteImage'),
          {
            id: logoId,
            type: 'logo',
            src: e.target.result,
            x: imageDimensionsLocal.width / 2,
            y: imageDimensionsLocal.height / 2,
            width: 80,
            height: 80,
            rotation: 0,
            opacity: 1,
            brightness: 1,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLogo = useCallback(
    (logoId) => {
      if (logoId === 'paltechWhite') {
        setIsPaltechDeleted(true);
      }
      setLogos((prevLogos) => prevLogos.filter((logo) => logo.id !== logoId));
      setActiveElement({ type: null, id: null });
    },
    [setLogos, setActiveElement]
  );

  const handleImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (img && img.naturalWidth && img.naturalHeight) {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      const imageAspectRatio = naturalWidth / naturalHeight;
      const isPortrait = naturalWidth < naturalHeight;

      setNaturalImageDimensions({ width: naturalWidth, height: naturalHeight });
      setImageOrientation(isPortrait ? 'portrait' : 'landscape');

      // Determine max container dimensions based on viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = Math.max(window.innerHeight, 500); // Minimum height fallback
      let maxContainerWidth, maxContainerHeight;

      if (viewportWidth <= 480) {
        // Mobile: ≤480px
        maxContainerWidth = Math.floor(viewportWidth * 0.98);
        maxContainerHeight = Math.floor(viewportHeight * 0.55);
      } else if (viewportWidth <= 768) {
        // Tablet: ≤768px
        maxContainerWidth = Math.floor(viewportWidth * 0.95);
        maxContainerHeight = Math.floor(viewportHeight * 0.60);
      } else {
        // Desktop
        maxContainerWidth = 1188;
        maxContainerHeight = 708;
      }

      // Ensure minimum dimensions
      maxContainerWidth = Math.max(maxContainerWidth, 300);
      maxContainerHeight = Math.max(maxContainerHeight, 200);

      const containerAspectRatio = maxContainerWidth / maxContainerHeight;

      let containerWidth;
      let containerHeight;

      if (imageAspectRatio >= containerAspectRatio) {
        containerWidth = maxContainerWidth;
        containerHeight = Math.round(maxContainerWidth / imageAspectRatio);
      } else {
        containerHeight = maxContainerHeight;
        containerWidth = Math.round(maxContainerHeight * imageAspectRatio);
      }

      if (containerWidth > maxContainerWidth) {
        containerWidth = maxContainerWidth;
      }
      if (containerHeight > maxContainerHeight) {
        containerHeight = maxContainerHeight;
      }

      // Final validation
      containerWidth = Math.max(containerWidth, 100);
      containerHeight = Math.max(containerHeight, 100);

      setContainerDimensions({ width: containerWidth, height: containerHeight });
      setImageDimensionsLocal({ width: containerWidth, height: containerHeight });
    }
  }, []);

  useEffect(() => {
    if (image && imageRef.current && imageRef.current.complete) {
      handleImageLoad();
    }
  }, [image, handleImageLoad]);

  // Notify parent of dimension changes
  useEffect(() => {
    if (setImageDimensions) {
      setImageDimensions(containerDimensions);
    }
  }, [containerDimensions, setImageDimensions]);

  const selectStyle = {
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    padding: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    textAlignLast: 'center',
  };

  return (
    <div
      className="canvas-wrapper"
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
        maxWidth: containerDimensions.width > 0 ? `${containerDimensions.width}px` : '100%',
        maxHeight: containerDimensions.height > 0 ? `${containerDimensions.height}px` : '100%',
        width: '100%',
        height: '100%',
        minWidth: '100px',
        minHeight: '100px',
        borderRadius: window.innerWidth <= 480 ? '6px' : window.innerWidth <= 768 ? '8px' : '12px',
      }}
    >
      <div
        className="image-container"
        style={{
          position: 'relative',
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
        }}
      >
        {image && (
          <div
            style={{
              width: additionalImages.length > 0 && (isMatchday || selectedFeature === 'quote') ? '50%' : '100%',
              height: '100%',
              borderRadius: window.innerWidth <= 480 ? '6px' : window.innerWidth <= 768 ? '8px' : '12px',
              overflow: 'hidden',
            }}
          >
            <img
              ref={imageRef}
              src={image}
              alt="Sports background"
              onLoad={handleImageLoad}
              style={{
                width: imageOrientation === 'portrait' ? 'auto' : '100%',
                height: imageOrientation === 'portrait' ? '100%' : 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                objectPosition: 'center center',
                display: 'block',
                borderRadius: window.innerWidth <= 480 ? '6px' : window.innerWidth <= 768 ? '8px' : '12px',
                WebkitBorderRadius: window.innerWidth <= 480 ? '6px' : window.innerWidth <= 768 ? '8px' : '12px',
              }}
            />
          </div>
        )}
        {(isMatchday || selectedFeature === 'quote') && additionalImages.map((imgSrc, index) => (
          <div
            key={`additional-image-${index}`}
            style={{
              width: '50%',
              height: additionalImages.length >= 2 ? '50%' : '100%',
              position: 'relative',
            }}
          >
            <img
              ref={(el) => (additionalImageRefs.current[index] = el)}
              src={imgSrc}
              alt={`Additional image ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
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
        {(selectedFeature === 'quote' || isMatchday || image) && (
          <div
            className="campuslife-text"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              color: 'white',
              fontSize: '20px',
              fontWeight: '900',
              textAlign: 'right',
              lineHeight: '1',
              zIndex: 15,
              fontFamily: "'Roboto', sans-serif",
            }}
            aria-label="Campuslife website branding"
          >
            Campuslife
            <br />
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>.co.ke</span>
          </div>
        )}
        {logos
          .filter((logo) => logo.id !== 'team1Logo' && logo.id !== 'team2Logo' && logo.id !== 'quoteImage')
          .map((logo) => (
            <div
              key={logo.id}
              className={`logo-element ${activeElement.id === logo.id && activeElement.type === 'logo' ? 'active' : ''}`}
              style={{
                position: 'absolute',
                left: logo.x,
                top: logo.y,
                transform: `translate(-50%, -50%) rotate(${logo.rotation}deg)`,
                width: logo.width,
                height: logo.height,
                cursor: dragging ? 'grabbing' : 'grab',
                zIndex: activeElement.id === logo.id ? 100 : 10,
                pointerEvents: isEditing || dragging || isRotating ? 'none' : 'auto',
              }}
              onPointerDown={(e) => {
                startDragging(logo.type, logo.id, e);
                setLogoMoved(true);
              }}
              onPointerMove={handleDrag}
              onPointerUp={stopDragging}
              onTouchStart={(e) => {
                startDragging(logo.type, logo.id, e);
                setLogoMoved(true);
              }}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={(e) => handleElementClick(logo.type, logo.id, e)}
              onWheel={(e) => handleLogoResize(logo.id, e)}
            >
              <img
                src={logo.src}
                alt={logo.id === 'paltechWhite' ? 'Paltech White Logo' : 'Logo'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  opacity: logo.opacity,
                  filter: `brightness(${logo.brightness * 100}%)`,
                }}
              />
              {activeElement.id === logo.id && activeElement.type === 'logo' && (
                <>
                  <div
                    className="resize-handle"
                    style={{
                      position: 'absolute',
                      right: -5,
                      bottom: -5,
                      width: 10,
                      height: 10,
                      background: '#fff',
                      border: '1px solid #000',
                      cursor: 'se-resize',
                    }}
                    onPointerDown={(e) => startDragging(logo.type, logo.id, e)}
                  />
                  <div
                    className="rotate-handle"
                    style={{
                      position: 'absolute',
                      top: -15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 10,
                      height: 10,
                      background: '#fff',
                      border: '1px solid #000',
                      cursor: 'pointer',
                    }}
                    onPointerDown={(e) => startRotation(logo.type, logo.id, e)}
                  />
                  <div
                    className="delete-handle"
                    style={{
                      position: 'absolute',
                      top: -15,
                      right: -15,
                      width: 10,
                      height: 10,
                      background: 'red',
                      border: '1px solid #000',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '8px',
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handleDeleteLogo(logo.id);
                    }}
                    aria-label={`Delete ${logo.id === 'paltechWhite' ? 'Paltech White Logo' : 'logo'}`}
                  >
                    X
                  </div>
                </>
              )}
            </div>
          ))}
        {!image && logos.length === 0 && (
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
            <div style={{ fontSize: '1.05rem', marginBottom: '18px', fontWeight: 600, color: '#a8b0b8' }}>Let's go!!</div>
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
          ref={logoInputRef}
          onChange={addLogo}
          accept="image/*"
          style={{ display: 'none' }}
          aria-label="Upload logo"
        />
        <input
          type="file"
          ref={additionalImageInputRef}
          onChange={handleAdditionalImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
          aria-label="Upload additional image"
        />
        {isMatchday && (
          <div
            className="add-images"
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              display: 'flex',
              gap: '10px',
              zIndex: 20,
            }}
          >
            <button
              onClick={handleAdditionalImageUploadClick}
              disabled={additionalImages.length >= 3}
              style={{
                width: '30px',
                height: '30px',
                background: additionalImages.length >= 3 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                borderRadius: '50%',
                cursor: additionalImages.length >= 3 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#000',
              }}
              aria-label="Add additional image"
            >
              +
            </button>
            <button
              onClick={() => setShowScoreBox(!showScoreBox)}
              style={{
                width: '30px',
                height: '30px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#000',
              }}
              aria-label="Toggle score box"
            >
              -
            </button>
          </div>
        )}
        {image && showScoreBox && (
          <div
            className={selectedFeature === 'quote' ? 'quote-box' : 'score-box'}
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
              width: selectedFeature === 'quote' ? '300px' : '80%',
              maxWidth: selectedFeature === 'quote' ? '300px' : `${imageDimensionsLocal.width * 0.8}px`,
              pointerEvents: 'auto',
              borderRadius: '10px',
              padding: selectedFeature === 'quote' ? '24px 8px 36px 8px' : '8px',
              background: selectedFeature === 'quote' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
            }}
          >
            {selectedFeature === 'quote' ? (
              <>
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '36px',
                    color: '#fff',
                    fontWeight: 'bold',
                    lineHeight: 1,
                    zIndex: 15,
                    marginBottom: '8px',
                    fontFamily: "'Roboto', sans-serif",
                  }}
                  aria-label="Quote symbol"
                >
                  ❝
                </span>
                <div
                  className="quote-image-container"
                  style={{
                    position: 'absolute',
                    top: '-100px',
                    left: '75%',
                    transform: 'translateX(-50%)',
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 15,
                  }}
                >
                  <button
                    className="logo-container quote-image-button"
                    onClick={() => logoInputRef.current.click()}
                    style={{
                      width: '100px',
                      height: '100px',
                      border: '0.1px dotted #00ff00',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: 'rgba(0, 0, 0, 0.7)',
                      cursor: 'pointer',
                      padding: 0,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                    aria-label="Upload quote image"
                  >
                    {logos.find((logo) => logo.id === 'quoteImage')?.src ? (
                      <img
                        src={logos.find((logo) => logo.id === 'quoteImage').src}
                        alt="Quote Image"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          filter: `brightness(${(logos.find((logo) => logo.id === 'quoteImage')?.brightness || 1) * 100}%)`,
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '24px', color: '#fff', fontFamily: "'Roboto', sans-serif" }}>
                        Image
                      </span>
                    )}
                  </button>
                </div>
                <textarea
                  value={customMatchTime}
                  onChange={(e) => setCustomMatchTime(e.target.value)}
                  placeholder="Enter quote"
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    fontSize: '18px',
                    fontWeight: '700',
                    padding: '8px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: 'none',
                    borderRadius: '5px',
                    textAlign: 'center',
                    resize: 'vertical',
                    color: '#fff',
                    fontFamily: "'Roboto', sans-serif",
                    marginTop: '40px',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
                  }}
                  aria-label="Quote input"
                />
                <input
                  type="text"
                  value={spokesperson}
                  onChange={(e) => setSpokesperson(e.target.value)}
                  placeholder="Spokesperson"
                  style={{
                    position: 'absolute',
                    bottom: '24px',
                    right: '8px',
                    width: '120px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '4px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: 'none',
                    borderRadius: '3px',
                    textAlign: 'right',
                    color: 'white',
                    fontFamily: "'Roboto', sans-serif",
                  }}
                  aria-label="Spokesperson name"
                />
                <div
                  className="date-selector"
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '8px',
                    display: 'flex',
                    gap: '4px',
                    zIndex: 15,
                    marginTop: '8px',
                  }}
                >
                  <select
                    value={matchDateTime.day}
                    onChange={(e) => setMatchDateTime((prev) => ({ ...prev, day: parseInt(e.target.value) }))}
                    style={selectStyle}
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
                    style={selectStyle}
                    aria-label="Select month"
                  >
                    {generateMonths().map((month) => (
                      <option key={`month-${month}`} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={matchDateTime.year}
                    onChange={(e) => setMatchDateTime((prev) => ({ ...prev, year: parseInt(e.target.value) }))}
                    style={{ ...selectStyle, width: '80px' }}
                    aria-label="Select year"
                  >
                    {generateYears().map((year) => (
                      <option key={`year-${year}`} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div
                  className="competition-container"
                  style={{
                    width: '50%',
                    maxHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '5px',
                    padding: '4px',
                    color: 'white',
                    fontSize: '14px',
                    textAlign: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <select
                    value={selectedCompetition || 'Premier League'}
                    onChange={(e) => setSelectedCompetition(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 1)',
                      color: 'white',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      padding: '4px',
                      textAlign: 'center',
                      textAlignLast: 'center',
                    }}
                    aria-label="Select competition"
                  >
                    {competitions.map((competition, index) => (
                      <option key={index} value={competition}>
                        {competition}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  className="logos-scores-section"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: `${imageDimensionsLocal.width * 0.8}px`,
                    marginBottom: '8px',
                  }}
                >
                  <div
                    className="team-logo"
                    style={{
                      width: isMatchday ? '80px' : '60px',
                      height: isMatchday ? '80px' : '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <button
                      className="logo-container team-logo-button"
                      onClick={onTeam1Click}
                      style={{
                        width: isMatchday ? '80px' : '60px',
                        height: isMatchday ? '80px' : '60px',
                        border: '0.1px dotted #00ff00',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      aria-label="Select Team 1 logo"
                    >
                      {team1Logo?.src ? (
                        <img
                          src={team1Logo.src}
                          alt="Team 1 Logo"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: `brightness(${team1Logo.brightness * 100}%)`,
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: isMatchday ? '20px' : '16px', color: '#666' }}>
                          Team 1
                        </span>
                      )}
                    </button>
                  </div>
                  <div
                    className="score-container"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '120px',
                    }}
                  >
                    {isMatchday ? (
                      <span
                        style={{
                          fontSize: '36px',
                          fontWeight: '900',
                          color: 'white',
                          margin: '0 20px',
                          alignContent: 'center',
                        }}
                      >
                        VS
                      </span>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <select
                          value={team1Score || 0}
                          onChange={(e) => setTeam1Score(parseInt(e.target.value))}
                          style={{
                            width: '65px',
                            height: '60px',
                            fontSize: '32px',
                            fontWeight: '900',
                            textAlign: 'center',
                            borderRadius: '4px',
                            boxShadow: 'none',
                            border: 'none',
                            background: 'rgba(0, 0, 0, 0.8)',
                            cursor: 'pointer',
                            color: 'white',
                          }}
                          aria-label="Select Team 1 score"
                        >
                          <option value={0}>0</option>
                          {scoreOptions.map((num) => (
                            <option key={`team1-${num}`} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                        <span
                          style={{
                            fontSize: '36px',
                            fontWeight: '500',
                            color: 'white',
                            margin: '0 20px',
                            alignContent: 'center',
                          }}
                        >
                          -
                        </span>
                        <select
                          value={team2Score || 0}
                          onChange={(e) => setTeam2Score(parseInt(e.target.value))}
                          style={{
                            width: '65px',
                            height: '60px',
                            fontSize: '32px',
                            fontWeight: '900',
                            textAlign: 'center',
                            borderRadius: '4px',
                            boxShadow: 'none',
                            border: 'none',
                            background: 'rgba(0, 0, 0, 0.8)',
                            cursor: 'pointer',
                            color: 'white',
                          }}
                          aria-label="Select Team 2 score"
                        >
                          <option value={0}>0</option>
                          {scoreOptions.map((num) => (
                            <option key={`team2-${num}`} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {isMatchday && (
                      <div
                        className="match-date-container"
                        style={{
                          width: 'fit-content',
                          maxHeight: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '5px',
                          padding: '4px',
                          color: 'white',
                          fontSize: '12px',
                          textAlign: 'center',
                          marginBottom: '-10px',
                          gap: '8px',
                          background: 'rgba(0, 0, 0, 0.8)',
                        }}
                      >
                        <select
                          value={matchDateTime.weekday}
                          onChange={(e) => setMatchDateTime({ ...matchDateTime, weekday: e.target.value })}
                          style={{ ...selectStyle, color: 'green', fontWeight: 'bold', width: '50px', padding: '1px' }}
                          aria-label="Select match weekday"
                        >
                          {generateWeekdays().map((weekday) => (
                            <option key={`weekday-${weekday}`} value={weekday} style={{ color: 'green', fontWeight: 'bold' }}>
                              {weekday}
                            </option>
                          ))}
                        </select>
                        <select
                          value={matchDateTime.day}
                          onChange={(e) => setMatchDateTime({ ...matchDateTime, day: parseInt(e.target.value) })}
                          style={{ ...selectStyle, color: 'green', fontWeight: 'bold', width: '50px', padding: '1px' }}
                          aria-label="Select match day"
                        >
                          {generateDays().map((day) => (
                            <option key={`day-${day}`} value={day} style={{ color: 'green', fontWeight: 'bold' }}>
                              {day}
                            </option>
                          ))}
                        </select>
                        <select
                          value={matchDateTime.month}
                          onChange={(e) => setMatchDateTime({ ...matchDateTime, month: e.target.value })}
                          style={{ ...selectStyle, color: 'green', fontWeight: 'bold', width: '50px', padding: '1px' }}
                          aria-label="Select match month"
                        >
                          {generateMonths().map((month) => (
                            <option key={`month-${month}`} value={month} style={{ color: 'green', fontWeight: 'bold' }}>
                              {month}
                            </option>
                          ))}
                        </select>
                        <select
                          value={matchDateTime.hour}
                          onChange={(e) => setMatchDateTime({ ...matchDateTime, hour: e.target.value })}
                          style={{ ...selectStyle, color: 'green', fontWeight: 'bold', width: '50px', padding: '1px' }}
                          aria-label="Select match hour"
                        >
                          {generateHours().map((hour) => (
                            <option key={`hour-${hour}`} value={hour} style={{ color: 'green', fontWeight: 'bold' }}>
                              {hour}
                            </option>
                          ))}
                        </select>
                        <select
                          value={matchDateTime.minute}
                          onChange={(e) => setMatchDateTime({ ...matchDateTime, minute: e.target.value })}
                          style={{ ...selectStyle, color: 'green', fontWeight: 'bold', width: '50px', padding: '1px' }}
                          aria-label="Select match minute"
                        >
                          {generateMinutes().map((minute) => (
                            <option key={`minute-${minute}`} value={minute} style={{ color: 'green', fontWeight: 'bold' }}>
                              {minute}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {!isMatchday && (
                      <div
                        className="match-status-container"
                        style={{
                          width: 'fit-content',
                          maxHeight: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '5px',
                          padding: '4px',
                          color: 'white',
                          fontSize: '12px',
                          textAlign: 'center',
                          marginBottom: '-10px',
                          gap: '4px',
                        }}
                      >
                        <select
                          value={matchStatusOptions.includes(matchStatus) ? matchStatus : 'Custom'}
                          onChange={(e) => handleMatchStatusChange(e.target.value)}
                          style={{ ...selectStyle, color: 'green', fontWeight: 'bold', width: '100px', padding: '1px' }}
                          aria-label="Select match status"
                        >
                          {matchStatusOptions.map((status, index) => (
                            <option key={index} value={status} style={{ color: 'green', fontWeight: 'bold' }}>
                              {status}
                            </option>
                          ))}
                        </select>
                        {matchStatus === 'Custom' || !matchStatusOptions.includes(matchStatus) ? (
                          <select
                            value={customMatchTime || (matchStatus && matchStatus.replace("'", '')) || ''}
                            onChange={(e) => handleCustomTimeChange(e.target.value)}
                            style={{ ...selectStyle, color: 'green', fontWeight: 'bold', width: '60px', padding: '1px' }}
                            aria-label="Select custom match time"
                          >
                            <option value="">Time</option>
                            {timeOptions.map((num) => (
                              <option key={`match-time-${num}`} value={num} style={{ color: 'green', fontWeight: 'bold' }}>
                                {num}'
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <div
                    className="team-logo"
                    style={{
                      width: isMatchday ? '80px' : '60px',
                      height: isMatchday ? '80px' : '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <button
                      className="logo-container team-logo-button"
                      onClick={onTeam2Click}
                      style={{
                        width: isMatchday ? '80px' : '60px',
                        height: isMatchday ? '80px' : '60px',
                        border: '0.1px dotted #00ff00',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      aria-label="Select Team 2 logo"
                    >
                      {team2Logo?.src ? (
                        <img
                          src={team2Logo.src}
                          alt="Team 2 Logo"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: `brightness(${team2Logo.brightness * 100}%)`,
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: isMatchday ? '20px' : '16px', color: '#666' }}>
                          Team 2
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                {!isMatchday && (
                  <div
                    className="add-goal-section"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      maxWidth: `${imageDimensionsLocal.width * 0.8}px`,
                      marginBottom: '8px',
                    }}
                  >
                    <button
                      onClick={() => addGoal('team1')}
                      style={{
                        maxWidth: 'fit-content',
                        padding: '4px 8px',
                        fontSize: '10px',
                        background: 'rgba(0, 0, 0, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      aria-label="Add Team 1 goal"
                    >
                      + Goal
                    </button>
                    <button
                      onClick={() => addGoal('team2')}
                      style={{
                        maxWidth: 'fit-content',
                        fontSize: '10px',
                        background: 'rgba(0, 0, 0, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      aria-label="Add Team 2 goal"
                    >
                      + Goal
                    </button>
                  </div>
                )}
                {!isMatchday && (
                  <div
                    className="goals-section"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      maxWidth: `${imageDimensionsLocal.width * 0.8}px`,
                    }}
                  >
                    <div
                      className="team-goals"
                      style={{
                        width: '48%',
                        maxHeight: '80px',
                        overflowY: 'auto',
                      }}
                    >
                      {team1Goals.map((goal, index) => (
                        <div
                          key={`team1-goal-${index}`}
                          className="goal-entry"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '4px',
                            justifyContent: 'center',
                            flexWrap: 'nowrap',
                          }}
                        >
                          <input
                            type="text"
                            value={goal.player}
                            onChange={(e) => updateGoal('team1', index, 'player', e.target.value)}
                            placeholder="Player"
                            style={{
                              width: '80px',
                              fontSize: '10px',
                              padding: '2px',
                              background: 'rgba(0, 0, 0, 0.9)',
                              border: 'none',
                              borderRadius: '3px',
                            }}
                            aria-label={`Team 1 goal ${index + 1} player`}
                          />
                          <select
                            value={goal.time}
                            onChange={(e) => updateGoal('team1', index, 'time', e.target.value)}
                            style={{
                              width: '60px',
                              fontSize: '10px',
                              padding: '2px',
                              background: 'rgba(0, 0, 0, 0.9)',
                              border: 'none',
                              borderRadius: '3px',
                            }}
                            aria-label={`Team 1 goal ${index + 1} time`}
                          >
                            <option value="">Time</option>
                            {timeOptions.map((num) => (
                              <option key={`team1-time-${num}`} value={num}>
                                {num}'
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeGoal('team1', index)}
                            style={{
                              padding: '2px 6px',
                              fontSize: '10px',
                              background: 'rgba(255, 0, 0, 0.8)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                            }}
                            aria-label={`Remove Team 1 goal ${index + 1}`}
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                    <div
                      className="team-goals"
                      style={{
                        width: '48%',
                        maxHeight: '80px',
                        overflowY: 'auto',
                      }}
                    >
                      {team2Goals.map((goal, index) => (
                        <div
                          key={`team2-goal-${index}`}
                          className="goal-entry"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '4px',
                            justifyContent: 'center',
                            flexWrap: 'nowrap',
                          }}
                        >
                          <input
                            type="text"
                            value={goal.player}
                            onChange={(e) => updateGoal('team2', index, 'player', e.target.value)}
                            placeholder="Player"
                            style={{
                              width: '80px',
                              fontSize: '10px',
                              padding: '2px',
                              background: 'rgba(0, 0, 0, 0.9)',
                              border: 'none',
                              borderRadius: '3px',
                            }}
                            aria-label={`Team 2 goal ${index + 1} player`}
                          />
                          <select
                            value={goal.time}
                            onChange={(e) => updateGoal('team2', index, 'time', e.target.value)}
                            style={{
                              width: '60px',
                              fontSize: '10px',
                              padding: '2px',
                              background: 'rgba(0, 0, 0, 0.9)',
                              border: 'none',
                              borderRadius: '3px',
                            }}
                            aria-label={`Team 2 goal ${index + 1} time`}
                          >
                            <option value="">Time</option>
                            {timeOptions.map((num) => (
                              <option key={`team2-time-${num}`} value={num}>
                                {num}'
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeGoal('team2', index)}
                            style={{
                              padding: '2px 6px',
                              fontSize: '10px',
                              background: 'rgba(255, 0, 0, 0.8)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                            }}
                            aria-label={`Remove Team 2 goal ${index + 1}`}
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};