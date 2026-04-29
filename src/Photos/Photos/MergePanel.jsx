import React, { useState, useRef, useEffect } from 'react';
import './MergePanel.css';

export const MergePanel = ({ onLayoutSelect, selectedLayout, uploadButton, changeButton }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    };

    const panel = panelRef.current;
    if (panel) {
      panel.addEventListener('scroll', handleScroll);
      return () => {
        panel.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeoutRef.current);
      };
    }
  }, []);
  const layoutGroups = [
    {
      count: 2,
      layouts: [
        { id: '2x1', grid: { columns: 2, rows: 1 } },
        { id: '1x2', grid: { columns: 1, rows: 2 } },
        { id: '2m2', grid: { columns: 3, rows: 2, template: '2m2' } },
        { id: '2m4', grid: { columns: 3, rows: 2, template: '2m4' } },
        { id: '2m5', grid: { columns: 2, rows: 3, template: '2m5' } },
        { id: '2m6', grid: { columns: 2, rows: 3, template: '2m6' } },
      ],
    },
    {
      count: 3,
      layouts: [
        { id: '3x1', grid: { columns: 3, rows: 1 } },
        { id: '1x3', grid: { columns: 1, rows: 3 } },
        { id: '3m1', grid: { columns: 2, rows: 2, template: '3m1' } },
        { id: '3m2', grid: { columns: 2, rows: 2, template: '3m2' } },
        { id: '3m3', grid: { columns: 2, rows: 3, template: '3m3' } },
        { id: '3m4', grid: { columns: 3, rows: 2, template: '3m4' } },
        { id: '3m5', grid: { columns: 3, rows: 2, template: '3m5' } },
        { id: '3m6', grid: { columns: 3, rows: 2, template: '3m6' } },
        { id: '3m7', grid: { columns: 2, rows: 2, template: '3m7' } },
        { id: '3m8', grid: { columns: 2, rows: 2, template: '3m8' } },
        { id: '3m9', grid: { columns: 3, rows: 2, template: '3m9' } },
        { id: '3m10', grid: { columns: 2, rows: 3, template: '3m10' } },
      ],
    },
    {
      count: 4,
      layouts: [
        { id: '2x2', grid: { columns: 2, rows: 2 } },
        { id: '4m1', grid: { columns: 3, rows: 3, template: '4m1' } },
        { id: '4m2', grid: { columns: 3, rows: 3, template: '4m2' } },
        { id: '4m3', grid: { columns: 3, rows: 2, template: '4m3' } },
        { id: '4m4', grid: { columns: 3, rows: 3, template: '4m4' } },
        { id: '4m5', grid: { columns: 3, rows: 3, template: '4m5' } },
        { id: '4m6', grid: { columns: 4, rows: 1 } },
        { id: '4m7', grid: { columns: 1, rows: 4 } },
        { id: '4m8', grid: { columns: 3, rows: 2, template: '4m8' } },
        { id: '4m9', grid: { columns: 3, rows: 3, template: '4m9' } },
        { id: '4m10', grid: { columns: 3, rows: 3, template: '4m10' } },
        { id: '4m11', grid: { columns: 3, rows: 3, template: '4m11' } },
        { id: '4m12', grid: { columns: 3, rows: 3, template: '4m12' } },
        { id: '4m13', grid: { columns: 3, rows: 3, template: '4m13' } },
        { id: '4m14', grid: { columns: 3, rows: 3, template: '4m14' } },
        { id: '4m15', grid: { columns: 3, rows: 3, template: '4m15' } },
        { id: '4m16', grid: { columns: 2, rows: 3, template: '4m16' } },
        { id: '4m17', grid: { columns: 3, rows: 3, template: '4m17' } },
        { id: '4m18', grid: { columns: 3, rows: 3, template: '4m18' } },
        { id: '4m19', grid: { columns: 2, rows: 3, template: '4m19' } },
        { id: '4m20', grid: { columns: 3, rows: 3, template: '4m20' } },
        { id: '4m21', grid: { columns: 2, rows: 3, template: '4m21' } },
        { id: '4m22', grid: { columns: 4, rows: 2, template: '4m22' } },
        { id: '4m23', grid: { columns: 3, rows: 3, template: '4m23' } },
      ],
    },
    {
      count: 5,
      layouts: [
        { id: '5m1', grid: { columns: 3, rows: 2, template: '5m1' } },
        { id: '5m2', grid: { columns: 3, rows: 2, template: '5m2' } },
        { id: '5m3', grid: { columns: 3, rows: 2, template: '5m3' } },
        { id: '5m4', grid: { columns: 3, rows: 2, template: '5m4' } },
        { id: '5m5', grid: { columns: 3, rows: 2, template: '5m5' } },
        { id: '5m6', grid: { columns: 3, rows: 2, template: '5m6' } },
        { id: '5m7', grid: { columns: 3, rows: 3, template: '5m7' } },
        { id: '5m8', grid: { columns: 4, rows: 2, template: '5m8' } },
        { id: '5m9', grid: { columns: 3, rows: 2, template: '5m9' } },
        { id: '5m10', grid: { columns: 4, rows: 2, template: '5m10' } },
        { id: '5m11', grid: { columns: 3, rows: 4, template: '5m11' } },
        { id: '5m12', grid: { columns: 3, rows: 3, template: '5m12' } },
        { id: '5m13', grid: { columns: 3, rows: 2, template: '5m13' } },
        { id: '5m14', grid: { columns: 3, rows: 3, template: '5m14' } },
        { id: '5m15', grid: { columns: 4, rows: 2, template: '5m15' } },
        { id: '5m16', grid: { columns: 3, rows: 3, template: '5m16' } },
        { id: '5m17', grid: { columns: 2, rows: 3, template: '5m17' } },
        { id: '5m18', grid: { columns: 3, rows: 3, template: '5m18' } },
        { id: '5m19', grid: { columns: 3, rows: 3, template: '5m19' } },
        { id: '5m20', grid: { columns: 3, rows: 3, template: '5m20' } },
        { id: '5m21', grid: { columns: 3, rows: 3, template: '5m21' } },
        { id: '5m22', grid: { columns: 4, rows: 2, template: '5m22' } },
        { id: '5m23', grid: { columns: 3, rows: 3, template: '5m23' } },
        { id: '5m24', grid: { columns: 3, rows: 3, template: '5m24' } },
        { id: '5m25', grid: { columns: 3, rows: 3, template: '5m25' } },
        { id: '5m26', grid: { columns: 4, rows: 3, template: '5m26' } },
        { id: '5m27', grid: { columns: 2, rows: 3, template: '5m27' } },
        { id: '5m28', grid: { columns: 3, rows: 3, template: '5m28' } },
        { id: '5m29', grid: { columns: 4, rows: 2, template: '5m29' } },
        { id: '5m30', grid: { columns: 3, rows: 3, template: '5m30' } },
      ],
    },
    {
      count: 6,
      layouts: [
        { id: '3x2', grid: { columns: 3, rows: 2 } },
        { id: '6m1', grid: { columns: 3, rows: 2, template: '6m1' } },
        { id: '6m2', grid: { columns: 3, rows: 2, template: '6m2' } },
        { id: '6m3', grid: { columns: 3, rows: 2, template: '6m3' } },
        { id: '6m4', grid: { columns: 3, rows: 2, template: '6m4' } },
        { id: '6m5', grid: { columns: 3, rows: 2, template: '6m5' } },
        { id: '6m6', grid: { columns: 2, rows: 3, template: '6m6' } },
        { id: '6m7', grid: { columns: 3, rows: 3, template: '6m7' } },
        { id: '6m8', grid: { columns: 4, rows: 2, template: '6m8' } },
        { id: '6m9', grid: { columns: 3, rows: 2, template: '6m9' } },
        { id: '6m10', grid: { columns: 3, rows: 3, template: '6m10' } },
        { id: '6m11', grid: { columns: 3, rows: 3, template: '6m11' } },
        { id: '6m12', grid: { columns: 3, rows: 3, template: '6m12' } },
        { id: '6m13', grid: { columns: 5, rows: 2, template: '6m13' } },
        { id: '6m14', grid: { columns: 2, rows: 3, template: '6m14' } },
        { id: '6m15', grid: { columns: 3, rows: 3, template: '6m15' } },
        { id: '6m16', grid: { columns: 6, rows: 2, template: '6m16' } },
        { id: '6m17', grid: { columns: 4, rows: 2, template: '6m17' } },
        { id: '6m18', grid: { columns: 4, rows: 2, template: '6m18' } },
        { id: '6m19', grid: { columns: 3, rows: 3, template: '6m19' } },
        { id: '6m20', grid: { columns: 3, rows: 2, template: '6m20' } },
        { id: '6m21', grid: { columns: 3, rows: 3, template: '6m21' } },
        { id: '6m22', grid: { columns: 3, rows: 2, template: '6m22' } },
        { id: '6m23', grid: { columns: 3, rows: 3, template: '6m23' } },
        { id: '6m24', grid: { columns: 4, rows: 3, template: '6m24' } },
        { id: '6m25', grid: { columns: 3, rows: 3, template: '6m25' } },
        { id: '6m26', grid: { columns: 4, rows: 2, template: '6m26' } },
        { id: '6m27', grid: { columns: 3, rows: 2, template: '6m27' } },
        { id: '6m28', grid: { columns: 3, rows: 3, template: '6m28' } },
        { id: '6m29', grid: { columns: 4, rows: 3, template: '6m29' } },
        { id: '6m30', grid: { columns: 3, rows: 3, template: '6m30' } },
      ],
    },
  ];

  const renderLayoutGrid = (layout) => {
    const { columns, rows, template } = layout.grid;
    
    // For simple grids
    if (!template) {
      return (
        <div className="merge-layout-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {Array.from({ length: columns * rows }).map((_, i) => (
            <div key={i} className="merge-grid-cell" />
          ))}
        </div>
      );
    }

    // For complex templates - determine cell count based on template ID
    let cellCount = 4; // default for 4-image layouts
    if (template.startsWith('5m')) cellCount = 5;
    else if (template.startsWith('6m')) cellCount = 6;
    else if (template.startsWith('3m')) cellCount = 3;
    else if (template.startsWith('2m')) cellCount = 2;

    // For complex templates
    return (
      <div className={`merge-layout-grid merge-template-${template}`}>
        {Array.from({ length: cellCount }).map((_, i) => (
          <div key={i} className={`merge-grid-cell cell-${i + 1}`} />
        ))}
      </div>
    );
  };

  return (
    <div className={`merge-panel ${isScrolling ? 'is-scrolling' : ''}`} ref={panelRef}>
      {layoutGroups.map((group) => (
        <div key={group.count} className="merge-layout-group">
          <div className="merge-group-header">
            <span className="merge-group-count">{group.count} image{group.count > 1 ? 's' : ''}</span>
          </div>
          <div className="merge-layouts-row">
            {group.layouts.map((layout) => (
              <div
                key={layout.id}
                className={`merge-layout-card ${selectedLayout === layout.id ? 'active' : ''}`}
                onClick={() => onLayoutSelect(layout)}
              >
                {renderLayoutGrid(layout)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
