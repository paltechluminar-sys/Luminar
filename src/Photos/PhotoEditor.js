import React from 'react';
import './PhotoEditor.css';
import { Sports } from './Sports/Sports';
import { Photos } from './Photos';

export const PhotoEditor = ({ activeTab, setActiveTab, initialImage, onSubscriptionModalOpen }) => {
  return (
    <div className="photo-editor-container">
      <div className="photo-editor-content">
        {activeTab === 'sports' && <Sports initialImage={initialImage} onSubscriptionModalOpen={onSubscriptionModalOpen} />}
        {activeTab === 'photos' && <Photos initialImage={initialImage} onSubscriptionModalOpen={onSubscriptionModalOpen} />}
      </div>
    </div>
  );
};
