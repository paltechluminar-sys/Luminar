import React, { useCallback } from 'react';
export const SportsFilterControls = ({ filters, handleFilterChange, selectedFeature, isCropping }) => {
  return (
    <>
      {selectedFeature === 'filters' && !isCropping && (
        <div className="secondary-tools-scroll-container-memes">
          <div className="bob tool-group-memes secondary-tools">
            <div className="filter-controls">
              <div className="form-group-memes">
                <label>Brightness</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.brightness}
                  onChange={(e) => handleFilterChange('brightness', e.target.value)}
                  className="size-slider"
                />
                <span>{filters.brightness}%</span>
              </div>
              <div className="form-group-memes">
                <label>Contrast</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.contrast}
                  onChange={(e) => handleFilterChange('contrast', e.target.value)}
                  className="size-slider"
                />
                <span>{filters.contrast}%</span>
              </div>
              <div className="form-group-memes">
                <label>Saturation</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.saturation}
                  onChange={(e) => handleFilterChange('saturation', e.target.value)}
                  className="size-slider"
                />
                <span>{filters.saturation}%</span>
              </div>
              <div className="form-group-memes">
                <label>Grayscale</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.grayscale}
                  onChange={(e) => handleFilterChange('grayscale', e.target.value)}
                  className="size-slider"
                />
                <span>{filters.grayscale}%</span>
              </div>
              <div className="form-group-memes">
                <label>Sepia</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.sepia}
                  onChange={(e) => handleFilterChange('sepia', e.target.value)}
                  className="size-slider"
                />
                <span>{filters.sepia}%</span>
              </div>
              <div className="form-group-memes">
                <label>Blur</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.blur}
                  onChange={(e) => handleFilterChange('blur', e.target.value)}
                  className="size-slider"
                />
                <span>{filters.blur}px</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

