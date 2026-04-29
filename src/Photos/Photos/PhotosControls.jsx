import React, { useCallback, useRef } from 'react';
import { FONT_FAMILIES, TEXT_COLORS, UNDERLINE_STYLES } from './PhotosConstants';
import './Photos.css';

export const PhotosControls = ({
  addText,
  addLogo,
  handleFilterChange,
  selectedFeature,
  setSelectedFeature,
  activeElement,
  deleteElement,
  filters,
  handleImageUpload,
  newPhotoInputRef,
  handleQuoteClick,
  handleCropClick,
  closeCrop,
  isCropping,
  brandName,
  handleBrandChange,
  brandFontFamily,
  handleBrandFontFamilyChange,
  brandFontSize,
  handleBrandFontSizeChange,
  brandFontWeight,
  handleBrandFontWeightChange,
  brandColor,
  handleBrandColorChange,
  brandOpacity,
  handleBrandOpacityChange,
  brandPosition,
}) => {
  const logoInputRef = useRef(null);
  // Memoize the new photo upload handler
  const handleNewPhotoClick = useCallback(() => {
    if (closeCrop) closeCrop();
    newPhotoInputRef.current.click();
  }, [newPhotoInputRef, closeCrop]);

  // Wrapper for filter toggle that closes crop
  const handleFiltersToggle = useCallback(() => {
    if (closeCrop) closeCrop();
    setSelectedFeature(prev => prev === 'filters' ? null : 'filters');
  }, [closeCrop, setSelectedFeature]);

  // Wrapper for quote click that closes crop
  const handleQuoteClickWrapper = useCallback(() => {
    if (closeCrop) closeCrop();
    handleQuoteClick();
  }, [closeCrop, handleQuoteClick]);

  // Wrapper for brand toggle that closes crop
  const handleBrandToggle = useCallback(() => {
    if (closeCrop) closeCrop();
    setSelectedFeature(prev => prev === 'brand' ? null : 'brand');
  }, [closeCrop, setSelectedFeature]);

  // Wrapper for merge toggle that closes crop
  const handleMergeToggle = useCallback(() => {
    if (closeCrop) closeCrop();
    setSelectedFeature(prev => prev === 'merge' ? null : 'merge');
  }, [closeCrop, setSelectedFeature]);

  // Wrapper for text toggle that closes crop
  const handleTextToggle = useCallback(() => {
    if (closeCrop) closeCrop();
    addText();
    setSelectedFeature('text');
  }, [closeCrop, addText, setSelectedFeature]);

  // Wrapper for logo toggle that closes crop
  const handleLogoToggle = useCallback(() => {
    if (closeCrop) closeCrop();
    logoInputRef.current?.click();
  }, [closeCrop]);

  // Handle logo upload
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
            className={`tool-button-sports ${selectedFeature === 'filters' ? 'active' : ''}`}
            onClick={handleFiltersToggle}
            data-tooltip="Apply filters to the background image"
            disabled={false}
            aria-label="Apply filters"
          >
            <span>Filters</span>
          </button>
          <button
            className={`tool-button-sports ${selectedFeature === 'text' ? 'active' : ''}`}
            onClick={handleTextToggle}
            data-tooltip="Add text to your image"
            disabled={false}
            aria-label="Add text"
          >
            <span>Text</span>
          </button>
          <button
            className={`tool-button-sports ${selectedFeature === 'logo' ? 'active' : ''}`}
            onClick={handleLogoToggle}
            data-tooltip="Add a custom logo to your image"
            disabled={false}
            aria-label="Add logo"
          >
            <span>Logo</span>
          </button>
          <button
            className={`tool-button-sports ${selectedFeature === 'quote' ? 'active' : ''}`}
            onClick={handleQuoteClickWrapper}
            data-tooltip="Show quote overlay"
            disabled={false}
            aria-label="Quote"
          >
            <span>Quote</span>
          </button>
          <button
            className={`tool-button-sports ${isCropping ? 'active' : ''}`}
            onClick={handleCropClick}
            data-tooltip="Crop your image"
            disabled={false}
            aria-label="Crop image"
          >
            <span>Crop</span>
          </button>
          <button
            className={`tool-button-sports ${selectedFeature === 'merge' ? 'active' : ''}`}
            onClick={handleMergeToggle}
            data-tooltip="Merge images together"
            disabled={false}
            aria-label="Merge images"
          >
            <span>Merge</span>
          </button>
          <button
            className={`tool-button-sports ${selectedFeature === 'brand' ? 'active' : ''}`}
            onClick={handleBrandToggle}
            data-tooltip="Choose a brand for the image"
            disabled={false}
            aria-label="Brand"
          >
            <span>Brand</span>
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
        </div>
      </div>
      <input
        type="file"
        ref={logoInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        style={{ display: 'none' }}
        aria-label="Upload logo"
      />
      {selectedFeature && selectedFeature !== 'filters' && selectedFeature !== 'brand' && selectedFeature !== 'merge' && selectedFeature !== 'text' && selectedFeature !== 'quote' && selectedFeature !== 'logo' && (
        <div className="secondary-tools-scroll-container-sports">
          <div className="tool-group-sports secondary-tools">
          </div>
        </div>
      )}
    </>
  );
};