import React, { useState, useCallback, useRef } from 'react';
import { SportsCanvas } from './SportsCanvas';
import { SportsControls } from './SportsControls';
import { SportsDownload } from './SportsDownload';
import { getImageCenter, restrictToBounds, loadImage, throttleEvent } from './SportsUtils';
import { SportTemplate } from './SportTemplate/SportTemplate';
import { CropTool } from '../Photos/CropTool';
import { cropImage } from '../Photos/CropUtils';

export const Sports = ({ initialImage, onSubscriptionModalOpen }) => {
  const [image, setImage] = useState(initialImage || null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [logos, setLogos] = useState([]);
  const [team1Logo, setTeam1Logo] = useState(null);
  const [team2Logo, setTeam2Logo] = useState(null);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [team1Goals, setTeam1Goals] = useState([]);
  const [team2Goals, setTeam2Goals] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [matchStatus, setMatchStatus] = useState('Full-Time');
  const [customMatchTime, setCustomMatchTime] = useState('');
  const [spokesperson, setSpokesperson] = useState('');
  const [matchDateTime, setMatchDateTime] = useState({
    weekday: new Date().toLocaleString('en-US', { weekday: 'short' }),
    day: new Date().getDate(),
    month: new Date().toLocaleString('en-US', { month: 'short' }),
    hour: new Date().getHours().toString(),
    minute: '45',
    year: new Date().getFullYear().toString(),
  });
  const [imageDimensions, setImageDimensions] = useState({ width: 500, height: 281.25 });
  const [activeElement, setActiveElement] = useState({ type: null, id: null });
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [logoOpacity, setLogoOpacity] = useState(100);
  const [logoBrightness, setLogoBrightness] = useState(100);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStartAngle, setRotationStartAngle] = useState(0);
  const [rotationCenter, setRotationCenter] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [initialDistance, setInitialDistance] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
    blur: 0,
  });
  const [canvasRefs, setCanvasRefs] = useState({ canvasRef: null, imageRef: null, additionalImageRefs: [] });
  const [showTeamTemplate, setShowTeamTemplate] = useState({ team: null, visible: false });
  const [isMatchday, setIsMatchday] = useState(false);
  const [showScoreBox, setShowScoreBox] = useState(true);
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState(null);

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const mergePhotoInputRef = useRef(null);
  const sportTemplateRef = useRef(null);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setAdditionalImages([]);
      setLogos([]);
      setTeam1Logo(null);
      setTeam2Logo(null);
      setTeam1Score(0);
      setTeam2Score(0);
      setTeam1Goals([]);
      setTeam2Goals([]);
      setSelectedCompetition('');
      setMatchStatus('Full-Time');
      setCustomMatchTime('');
      setSpokesperson('');
      setIsMatchday(false);
      setShowScoreBox(true);
      setMatchDateTime({
        weekday: new Date().toLocaleString('en-US', { weekday: 'short' }),
        day: new Date().getDate(),
        month: new Date().toLocaleString('en-US', { month: 'short' }),
        hour: new Date().getHours().toString(),
        minute: '45',
        year: new Date().getFullYear().toString(),
      });
      setActiveElement({ type: null, id: null });
      setSelectedFeature(null);
      setIsMatchday(false);
      setShowScoreBox(true);
      setFilters({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grayscale: 0,
        sepia: 0,
        blur: 0,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAdditionalImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file || additionalImages.length >= 3) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAdditionalImages((prev) => [...prev, event.target.result]);
    };
    reader.readAsDataURL(file);
  }, [additionalImages.length]);

  const readFilesAsDataURLs = useCallback((files) => {
    return Promise.all(
      Array.from(files).map((file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      )
    );
  }, []);

  React.useEffect(() => {
    if (initialImage) {
      setImage(initialImage);
    }
  }, [initialImage]);

  const updateLogoProperties = useCallback((id, updates) => {
    setLogos((prev) => prev.map((logo) => (logo.id === id ? { ...logo, ...updates } : logo)));
  }, []);

  const addGoal = useCallback((team) => {
    if (team === 'team1') {
      setTeam1Goals((prev) => [...prev, { player: '', time: '' }]);
      setTeam1Score((prev) => prev + 1);
    } else {
      setTeam2Goals((prev) => [...prev, { player: '', time: '' }]);
      setTeam2Score((prev) => prev + 1);
    }
  }, []);

  const updateGoal = useCallback((team, index, field, value) => {
    if (team === 'team1') {
      const updatedGoals = [...team1Goals];
      updatedGoals[index] = { ...updatedGoals[index], [field]: value };
      setTeam1Goals(updatedGoals);
    } else {
      const updatedGoals = [...team2Goals];
      updatedGoals[index] = { ...updatedGoals[index], [field]: value };
      setTeam2Goals(updatedGoals);
    }
  }, [team1Goals, team2Goals]);

  const removeGoal = useCallback((team, index) => {
    if (team === 'team1') {
      setTeam1Goals((prev) => prev.filter((_, i) => i !== index));
      setTeam1Score((prev) => Math.max(0, prev - 1));
    } else {
      setTeam2Goals((prev) => prev.filter((_, i) => i !== index));
      setTeam2Score((prev) => Math.max(0, prev - 1));
    }
  }, []);

  const addLogo = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const { x, y } = getImageCenter(canvasRefs.canvasRef || canvasRefs.imageRef);
        const newLogo = {
          id: selectedFeature === 'quote' ? 'quoteImage' : `logo-${Date.now()}`,
          type: 'logo',
          src: event.target.result,
          x: additionalImages.length > 0 && (isMatchday || selectedFeature === 'quote') ? x / 2 : x,
          y,
          width: 100,
          height: 100,
          opacity: logoOpacity / 100,
          brightness: logoBrightness / 100,
          rotation: 0,
        };
        const { x: boundedX, y: boundedY, width, height } = restrictToBounds('logo', newLogo.id, newLogo.x, y, 100, 100, 0, canvasRefs.canvasRef || canvasRefs.imageRef, logos);
        setLogos((prev) => [...prev.filter((logo) => logo.id !== 'quoteImage'), { ...newLogo, x: boundedX, y: boundedY, width, height }]);
        setActiveElement({ type: 'logo', id: newLogo.id });
        setSelectedFeature('logo');
      };
      reader.readAsDataURL(file);
    },
    [logoOpacity, logoBrightness, canvasRefs, logos, additionalImages.length, isMatchday, selectedFeature]
  );

  const deleteElement = useCallback(() => {
    if (!activeElement.id) return;

    switch (activeElement.type) {
      case 'logo':
        setLogos((prev) => prev.filter((logo) => logo.id !== activeElement.id));
        break;
      default:
        return;
    }

    setActiveElement({ type: null, id: null });
    setSelectedFeature(null);
  }, [activeElement]);

  const handleElementClick = useCallback(
    (type, id, e) => {
      e.stopPropagation();
      setActiveElement({ type, id });
      setSelectedFeature(type);

      const element = logos.find((p) => p.id === id);

      if (!element) return;

      if (type === 'logo') {
        setLogoOpacity(element.opacity * 100 || 100);
        setLogoBrightness(element.brightness * 100 || 100);
      }
    },
    [logos]
  );

  const handleStartDragging = useCallback(
    (type, id, e) => {
      e.stopPropagation();
      e.preventDefault();
      setDragging(true);

      const element = logos.find((p) => p.id === id);

      if (!element) return;

      const clientX = e.clientX || (e.touches?.[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches?.[0]?.clientY) || 0;

      const width = element.width || 100;
      const height = element.height || 100;

      const { x, y } = restrictToBounds(type, id, element.x, element.y, width, height, element.rotation, canvasRefs.canvasRef || canvasRefs.imageRef, logos);
      setDragOffset({ x: clientX - x, y: clientY - y });
    },
    [logos, canvasRefs]
  );

  const handleDrag = useCallback(
    throttleEvent((e) => {
      if (!dragging || !activeElement.id) return;
      e.preventDefault();

      const clientX = e.clientX || (e.touches?.[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches?.[0]?.clientY) || 0;

      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;

      const element = logos.find((p) => p.id === activeElement.id);

      if (!element) return;

      const width = element.width || 100;
      const height = element.height || 100;

      const { x, y } = restrictToBounds(activeElement.type, activeElement.id, newX, newY, width, height, element.rotation, canvasRefs.canvasRef || canvasRefs.imageRef, logos);

      updateLogoProperties(activeElement.id, { x, y });
    }, 8),
    [dragging, activeElement, dragOffset, logos, updateLogoProperties, canvasRefs]
  );

  const handleStopDragging = useCallback(() => {
    setDragging(false);
  }, []);

  const handleStartRotation = useCallback(
    (type, id, e) => {
      e.stopPropagation();
      e.preventDefault();
      setIsRotating(true);

      const element = logos.find((p) => p.id === id);

      if (!element) return;

      setRotationCenter({ x: element.x, y: element.y });
      const clientX = e.clientX || (e.touches?.[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches?.[0]?.clientY) || 0;
      const dx = clientX - element.x;
      const dy = clientY - element.y;
      setRotationStartAngle(Math.atan2(dy, dx) * (180 / Math.PI) - (element.rotation || 0));
    },
    [logos]
  );

  const handleRotation = useCallback(
    throttleEvent((e) => {
      if (!isRotating || !activeElement.id) return;
      e.preventDefault();

      const clientX = e.clientX || (e.touches?.[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches?.[0]?.clientY) || 0;
      const dx = clientX - rotationCenter.x;
      const dy = clientY - rotationCenter.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const newRotation = angle - rotationStartAngle;

      updateLogoProperties(activeElement.id, { rotation: newRotation });
    }, 8),
    [isRotating, activeElement, rotationCenter, rotationStartAngle, updateLogoProperties]
  );

  const handleStopRotation = useCallback(() => {
    setIsRotating(false);
  }, []);

  const handleMouseWheelRotation = useCallback(
    (e) => {
      if (e.ctrlKey && activeElement.id) {
        e.preventDefault();
        const rotationDelta = e.deltaY * 0.2;

        const element = logos.find((p) => p.id === activeElement.id);

        if (!element) return;

        const newRotation = (element.rotation || 0) - rotationDelta;
        updateLogoProperties(activeElement.id, { rotation: newRotation });
      }
    },
    [activeElement, logos, updateLogoProperties]
  );

  const handleLogoResize = useCallback(
    throttleEvent((id, e) => {
      if (activeElement.type !== 'logo' || activeElement.id !== id) return;
      const delta = e.deltaY || 0;
      const logo = logos.find((p) => p.id === id);
      if (!logo) return;

      const newWidth = Math.max(10, logo.width - delta);
      const newHeight = Math.max(10, logo.height - delta);
      const { x, y, width, height } = restrictToBounds('logo', id, logo.x, logo.y, newWidth, newHeight, logo.rotation, canvasRefs.canvasRef || canvasRefs.imageRef, logos);
      updateLogoProperties(id, { width, height, x, y });
    }, 10),
    [activeElement, logos, updateLogoProperties, canvasRefs]
  );

  const handleTouchZoom = useCallback(
    (type, id, e) => {
      if (e.touches.length === 2) {
        e.preventDefault();

        const element = logos.find((p) => p.id === id);

        if (!element) return;

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        setInitialDistance(dist);
      }
    },
    [logos]
  );

  const handleTouchMove = useCallback(
    throttleEvent((e) => {
      if (initialDistance !== null && e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        const scale = currentDistance / initialDistance;
        const newSize = Math.min(Math.max(100 * scale, 10), 500);

        if (!activeElement.id) return;

        const element = logos.find((p) => p.id === activeElement.id);

        if (!element) return;

        const { x, y, width, height } = restrictToBounds(
          activeElement.type,
          activeElement.id,
          element.x,
          element.y,
          newSize,
          newSize,
          element.rotation,
          canvasRefs.canvasRef || canvasRefs.imageRef,
          logos
        );
        updateLogoProperties(activeElement.id, { width, height, x, y });
      } else if (e.touches.length === 1) {
        handleDrag(e);
      }
    }, 8),
    [initialDistance, activeElement, updateLogoProperties, handleDrag, canvasRefs, logos]
  );

  const handleTouchEnd = useCallback(() => {
    setInitialDistance(null);
    handleStopDragging();
    handleStopRotation();
  }, [handleStopDragging, handleStopRotation]);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: parseInt(value) }));
  }, []);

  const handleLogoOpacityChange = useCallback(
    (e) => {
      const newOpacity = parseInt(e.target.value);
      setLogoOpacity(newOpacity);
      if (activeElement.type === 'logo' && activeElement.id && selectedFeature === 'logo') {
        updateLogoProperties(activeElement.id, { opacity: newOpacity / 100 });
      }
    },
    [activeElement, selectedFeature, updateLogoProperties]
  );

  const handleLogoBrightnessChange = useCallback(
    (e) => {
      const newBrightness = parseInt(e.target.value);
      setLogoBrightness(newBrightness);
      if (activeElement.type === 'logo' && activeElement.id && selectedFeature === 'logo') {
        updateLogoProperties(activeElement.id, { brightness: newBrightness / 100 });
      }
    },
    [activeElement, selectedFeature, updateLogoProperties]
  );

  const handleTeam1Click = useCallback(() => {
    setShowTeamTemplate({ team: 'team1', visible: true });
  }, []);

  const handleTeam2Click = useCallback(() => {
    setShowTeamTemplate({ team: 'team2', visible: true });
  }, []);

  const handleTeamTemplateClose = useCallback(() => {
    setShowTeamTemplate({ team: null, visible: false });
  }, []);

  const handleTeamTemplateSelect = useCallback(
    (sport) => {
      const src = sport.value.startsWith('url(') ? sport.value.match(/url\((.*?)\)/)[1] : sport.value;
      const newLogo = {
        src,
        width: isMatchday || selectedFeature === 'quote' ? 80 : 60,
        height: isMatchday || selectedFeature === 'quote' ? 80 : 60,
        opacity: logoOpacity / 100,
        brightness: logoBrightness / 100,
        rotation: 0,
      };
      if (showTeamTemplate.team === 'team1') {
        setTeam1Logo(newLogo);
      } else if (showTeamTemplate.team === 'team2') {
        setTeam2Logo(newLogo);
      }
      setActiveElement({ type: 'logo', id: showTeamTemplate.team === 'team1' ? 'team1Logo' : 'team2Logo' });
      setSelectedFeature('logo');
      setShowTeamTemplate({ team: null, visible: false });
    },
    [logoOpacity, logoBrightness, showTeamTemplate.team, isMatchday, selectedFeature]
  );

  const handleMatchdayClick = useCallback(() => {
    setIsMatchday((prev) => !prev);
    setSelectedFeature(null);
    if (!isMatchday) {
      setTeam1Score(0);
      setTeam2Score(0);
      setTeam1Goals([]);
      setTeam2Goals([]);
      const now = new Date();
      const formattedDateTime = `${now.toLocaleString('en-US', { weekday: 'short' })} ${now.getDate()}/${now.toLocaleString('en-US', { month: 'short' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setMatchStatus(formattedDateTime);
      setCustomMatchTime('');
      setSpokesperson('');
      setShowScoreBox(true);
    } else {
      setMatchStatus('Full-Time');
      setCustomMatchTime('');
      setSpokesperson('');
    }
  }, [isMatchday]);

  const handleQuoteClick = useCallback(() => {
    setSelectedFeature((prev) => (prev === 'quote' ? null : 'quote'));
    if (selectedFeature !== 'quote') {
      setTeam1Score(0);
      setTeam2Score(0);
      setTeam1Goals([]);
      setTeam2Goals([]);
      const now = new Date();
      const formattedDateTime = `${now.toLocaleString('en-US', { weekday: 'short' })} ${now.getDate()}/${now.toLocaleString('en-US', { month: 'short' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setMatchStatus(formattedDateTime);
      setCustomMatchTime('');
      setSpokesperson('');
      setShowScoreBox(true);
      setIsMatchday(false);
    } else {
      setMatchStatus('Full-Time');
      setCustomMatchTime('');
      setSpokesperson('');
    }
  }, [selectedFeature]);

  const handleCropClick = useCallback(() => {
    setIsCropping(true);
  }, []);

  const handleCropCancel = useCallback(() => {
    setIsCropping(false);
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (!image || !cropArea) return;

    try {
      const croppedImage = await cropImage(image, cropArea, imageDimensions);
      setImage(croppedImage);
      setLogos([]);
      setTeam1Logo(null);
      setTeam2Logo(null);
      setAdditionalImages([]);
      setIsCropping(false);
      setCropArea(null);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  }, [image, cropArea, imageDimensions]);

  return (
    <div className="sports-editor">
      <div className="editor-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <SportsControls
          addLogo={addLogo}
          deleteElement={deleteElement}
          handleFilterChange={handleFilterChange}
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          activeElement={activeElement}
          logoOpacity={logoOpacity}
          handleLogoOpacityChange={handleLogoOpacityChange}
          logoBrightness={logoBrightness}
          handleLogoBrightnessChange={handleLogoBrightnessChange}
          filters={filters}
          handleImageUpload={handleImageUpload}
          newPhotoInputRef={fileInputRef}
          handleMatchdayClick={handleMatchdayClick}
          handleQuoteClick={handleQuoteClick}
          handleCropClick={handleCropClick}
        />
        <div className={`canvas-panel ${selectedFeature === 'merge' ? 'merge-active' : ''}`} style={{ position: 'relative', overflow: 'visible' }}>
          {isCropping && image && (
            <div style={{ 
              position: 'absolute', 
              inset: 0,
              zIndex: 999,
              width: '100%', 
              height: '100%',
              display: 'block',
              pointerEvents: 'auto'
            }}>
              <CropTool
                image={image}
                imageDimensions={imageDimensions}
                onCropComplete={handleCropComplete}
                onCancel={handleCropCancel}
                imageRef={canvasRefs.imageRef}
                cropArea={cropArea}
                onCropAreaChange={setCropArea}
              />
            </div>
          )}
          <SportsCanvas
            image={image}
          additionalImages={additionalImages}
          setAdditionalImages={setAdditionalImages}
          handleAdditionalImageUpload={handleAdditionalImageUpload}
          logos={logos}
          setLogos={setLogos}
          filters={filters}
          activeElement={activeElement}
          setActiveElement={setActiveElement}
          dragging={dragging}
          isRotating={isRotating}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleDrag={handleDrag}
          handleTouchMove={handleTouchMove}
          handleTouchEnd={handleTouchEnd}
          handleMouseWheelRotation={handleMouseWheelRotation}
          handleLogoResize={handleLogoResize}
          startDragging={handleStartDragging}
          stopDragging={handleStopDragging}
          startRotation={handleStartRotation}
          handleRotation={handleRotation}
          stopRotation={handleStopRotation}
          handleElementClick={handleElementClick}
          handleTouchZoom={handleTouchZoom}
          setImage={setImage}
          setCanvasRefs={setCanvasRefs}
          updateLogoProperties={updateLogoProperties}
          selectedFeature={selectedFeature}
          handleImageUpload={handleImageUpload}
          fileInputRef={fileInputRef}
          logoInputRef={logoInputRef}
          onTeam1Click={handleTeam1Click}
          onTeam2Click={handleTeam2Click}
          team1Logo={team1Logo}
          setTeam1Logo={setTeam1Logo}
          team2Logo={team2Logo}
          setTeam2Logo={setTeam2Logo}
          setImageDimensions={setImageDimensions}
          team1Score={team1Score}
          setTeam1Score={setTeam1Score}
          team2Score={team2Score}
          setTeam2Score={setTeam2Score}
          selectedCompetition={selectedCompetition}
          setSelectedCompetition={setSelectedCompetition}
          matchStatus={matchStatus}
          setMatchStatus={setMatchStatus}
          team1Goals={team1Goals}
          setTeam1Goals={setTeam1Goals}
          team2Goals={team2Goals}
          setTeam2Goals={setTeam2Goals}
          addGoal={addGoal}
          updateGoal={updateGoal}
          removeGoal={removeGoal}
          isMatchday={isMatchday}
          showScoreBox={showScoreBox}
          setShowScoreBox={setShowScoreBox}
          customMatchTime={customMatchTime}
          setCustomMatchTime={setCustomMatchTime}
          spokesperson={spokesperson}
          setSpokesperson={setSpokesperson}
          matchDateTime={matchDateTime}
          setMatchDateTime={setMatchDateTime}
          isCropping={isCropping}
        />
        </div>
        <SportsDownload
          image={image}
          additionalImages={additionalImages}
          logos={logos}
          team1Logo={team1Logo}
          team2Logo={team2Logo}
          team1Score={team1Score}
          team2Score={team2Score}
          filters={filters}
          canvasRefs={canvasRefs}
          imageDimensions={imageDimensions}
          selectedCompetition={selectedCompetition}
          matchStatus={matchStatus}
          team1Goals={team1Goals}
          team2Goals={team2Goals}
          isMatchday={isMatchday}
          showScoreBox={showScoreBox}
          selectedFeature={selectedFeature}
          customMatchTime={customMatchTime}
          spokesperson={spokesperson}
          matchDateTime={matchDateTime}
          onSubscriptionModalOpen={onSubscriptionModalOpen}
        />
        {isCropping && (
          <div className="crop-panel-sidebar">
            <div className="crop-panel-header">
              <h3>Crop</h3>
              <span className="crop-header-dimensions">{cropArea ? `${Math.round(cropArea.width)} × ${Math.round(cropArea.height)}px` : 'Select area'}</span>
            </div>
            <div className="crop-panel-content">
              <div className="crop-panel-buttons">
                <button className="crop-cancel-btn" onClick={handleCropCancel}>
                  Cancel
                </button>
                <button className="crop-apply-btn" onClick={handleCropComplete}>
                  Crop
                </button>
              </div>
            </div>
          </div>
        )}
        {showTeamTemplate.visible && (
          <SportTemplate
            ref={sportTemplateRef}
            currentSport={null}
            onClose={handleTeamTemplateClose}
            onSelect={handleTeamTemplateSelect}
          />
        )}
      </div>
    </div>
  );
}; 