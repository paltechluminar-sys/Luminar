import React, { useCallback, useRef } from 'react';
import { SportsFilterControls } from './SportsFilterControls';
import './Sports.css';

export const SportsControls = ({
  addLogo,
  handleFilterChange,
  selectedFeature,
  setSelectedFeature,
  activeElement,
  deleteElement,
  logoOpacity,
  handleLogoOpacityChange,
  logoBrightness,
  handleLogoBrightnessChange,
  filters,
  handleImageUpload,
  newPhotoInputRef,
  handleMatchdayClick,
  handleQuoteClick,
  handleCropClick,
}) => {
  const logoInputRef = useRef(null);

  // Memoize the logo upload handler
  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      addLogo?.(event.target.result);
      logoInputRef.current.value = ''; // Reset input
    };
    reader.readAsDataURL(file);
  }, [addLogo]);

  const handleLogoClick = useCallback(() => {
    logoInputRef.current.click();
  }, []);

  // Memoize the new photo upload handler
  const handleNewPhotoClick = useCallback(() => {
    newPhotoInputRef.current.click();
  }, [newPhotoInputRef]);

  return (
    <>
      <div className="primary-tools-scroll-container-sports">
        <div className="tool-group-sports primary-tools toolbar-row-sports">
          <button
            className="tool-button-sports"
            onClick={handleNewPhotoClick}
            data-tooltip="Upload a new background image"
            disabled={false}
            aria-label="Upload new photo"
          >
            <span>+Photo</span>
          </button>
          <button
            className={`tool-button-sports ${selectedFeature === 'logo' ? 'active' : ''}`}
            onClick={handleLogoClick}
            data-tooltip="Add a logo to your sports image"
            disabled={false}
            aria-label="Add logo"
          >
            <span>Logo</span>
          </button>
          <button
            className={`tool-button-sports ${selectedFeature === 'filters' ? 'active' : ''}`}
            onClick={() => setSelectedFeature('filters')}
            data-tooltip="Apply filters to the background image"
            disabled={false}
            aria-label="Apply filters"
          >
            <span>Filters</span>
          </button>
          <button
            className="tool-button-sports"
            onClick={handleMatchdayClick || (() => console.log('Matchday button clicked'))}
            data-tooltip="Show matchday overlay"
            disabled={false}
            aria-label="Matchday"
          >
            <span>Matchday</span>
          </button>
          <button
            className="tool-button-sports"
            onClick={handleQuoteClick || (() => console.log('Quote button clicked'))}
            data-tooltip="Show quote overlay"
            disabled={false}
            aria-label="Quote"
          >
            <span>Quote</span>
          </button>
          <button
            className="tool-button-sports"
            onClick={handleCropClick}
            data-tooltip="Crop your image"
            disabled={false}
            aria-label="Crop image"
          >
            <span>Crop</span>
          </button>
          <button
            className={`tool-button-sports ${selectedFeature === 'merge' ? 'active' : ''}`}
            onClick={() => setSelectedFeature('merge')}
            data-tooltip="Merge images together"
            disabled={false}
            aria-label="Merge images"
          >
            <span>Merge</span>
          </button>
          {activeElement.id && (
            <button
              className="tool-button-sports"
              onClick={deleteElement}
              data-tooltip="Delete selected element"
              disabled={false}
              aria-label="Delete element"
            >
              <span>Delete</span>
            </button>
          )}
          <input
            type="file"
            ref={logoInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            style={{ display: 'none' }}
            aria-label="Upload logo"
          />
          <input
            type="file"
            ref={newPhotoInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
            aria-label="Upload new photo"
          />
        </div>
      </div>
      {selectedFeature && selectedFeature !== 'filters' && (
        <div className="secondary-tools-scroll-container-sports">
          <div className="tool-group-sports secondary-tools">
            {selectedFeature === 'logo' && (
              <>
                <div className="form-group-sports">
                  <label>Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={logoOpacity}
                    onChange={handleLogoOpacityChange}
                    className="size-slider-sports"
                    aria-label="Adjust logo opacity"
                  />
                  <span>{logoOpacity}%</span>
                </div>
                <div className="form-group-sports">
                  <label>Brightness</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={logoBrightness}
                    onChange={handleLogoBrightnessChange}
                    className="size-slider-sports"
                    aria-label="Adjust logo brightness"
                  />
                  <span>{logoBrightness}%</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <SportsFilterControls
        filters={filters}
        handleFilterChange={handleFilterChange}
        selectedFeature={selectedFeature}
        isCropping={false}
      />
    </>
  );
};