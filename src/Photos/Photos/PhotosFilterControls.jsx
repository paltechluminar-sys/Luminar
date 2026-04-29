import React, { useCallback, useRef, useEffect, useState } from 'react';
import './PhotosFilterControls.css';

export const PhotosFilterControls = ({ filters, handleFilterChange, selectedFeature, isCropping, onClose }) => {
  const filterPanelRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('brightness');

  const filterOptions = [
    { id: 'brightness', label: 'Brightness', value: filters.brightness, unit: '%' },
    { id: 'contrast', label: 'Contrast', value: filters.contrast, unit: '%' },
    { id: 'saturation', label: 'Saturation', value: filters.saturation, unit: '%' },
    { id: 'grayscale', label: 'Grayscale', value: filters.grayscale, unit: '%' },
    { id: 'sepia', label: 'Sepia', value: filters.sepia, unit: '%' },
    { id: 'blur', label: 'Blur', value: filters.blur, unit: 'px' },
  ];

  const getFilterConfig = (filterId) => {
    const configs = {
      brightness: { min: 0, max: 200, default: 100 },
      contrast: { min: 0, max: 200, default: 100 },
      saturation: { min: 0, max: 200, default: 100 },
      grayscale: { min: 0, max: 100, default: 0 },
      sepia: { min: 0, max: 100, default: 0 },
      blur: { min: 0, max: 10, default: 0 },
    };
    return configs[filterId];
  };

  const getDefaultPercentage = (filterId) => {
    const config = getFilterConfig(filterId);
    const range = config.max - config.min;
    const percentage = ((config.default - config.min) / range) * 100;
    return percentage;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (onClose && filterPanelRef.current && !filterPanelRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const currentFilter = filterOptions.find(f => f.id === activeFilter);
  const config = getFilterConfig(activeFilter);

  return (
    <>
      {selectedFeature === 'filters' && !isCropping && (
        <div className="filter-controls-container" ref={filterPanelRef}>
          {/* Filter Selection Buttons */}
          <div className="filter-buttons-wrapper">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                className={`filter-button ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
                title={filter.label}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Single Filter Control */}
          <div className="filter-controls-wrapper">
            <div className="filter-control-item">
              <input
                type="range"
                min={config.min}
                max={config.max}
                value={currentFilter?.value}
                onChange={(e) => handleFilterChange(activeFilter, e.target.value)}
                className="filter-slider"
                data-default={getDefaultPercentage(activeFilter)}
                style={{
                  background: `linear-gradient(to right, #2a3942 0%, #2a3942 ${getDefaultPercentage(activeFilter) - 1}%, #00a884 ${getDefaultPercentage(activeFilter) - 1}%, #00a884 ${getDefaultPercentage(activeFilter) + 1}%, #2a3942 ${getDefaultPercentage(activeFilter) + 1}%, #2a3942 100%)`
                }}
              />
              <span className="filter-value">{currentFilter?.value}{currentFilter?.unit}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


