import React, { useState, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import './Studio.css';
import { PhotoEditor } from './Photos/PhotoEditor';
import { UserProfile } from './UserProfile';
import Admin from './Admin/Admin';
import SubscriptionModal from './Subscription/SubscriptionModal';
import PremiumPanel from './Subscription/PremiumPanel';
import PremiumProPanel from './Subscription/PremiumProPanel';
import VerificationBadge from './Admin/components/VerificationBadge';

const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div>Loading...</div>
  </div>
);

const StudioHome = ({ activeTab, setActiveTab }) => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPremiumPanel, setShowPremiumPanel] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="studio-page">
      <header className="studio-page-header">
        <div className="studio-header-content">
        </div>
        <div className="header-right">
          <UserProfile onSubscriptionClick={() => setShowPremiumPanel(true)} />
        </div>
      </header>

      <div className="tab-selector">
        <button 
          className={activeTab === 'photos' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('photos')}
        >
          Photos
        </button>
        <button 
          className={activeTab === 'sports' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('sports')}
        >
          Sports
        </button>
      </div>

      <div className="studio-editor-page">
        <PhotoEditor activeTab={activeTab} setActiveTab={setActiveTab} onSubscriptionModalOpen={() => setShowSubscriptionModal(true)} />
      </div>

      {showPremiumPanel && (
        <PremiumPanel 
          onClose={() => setShowPremiumPanel(false)}
          onSelectPlan={(plan) => {
            setSelectedPlan(plan);
            setShowPremiumPanel(false);
            setShowSubscriptionModal(true);
          }}
        />
      )}

      {showSubscriptionModal && (
        <SubscriptionModal 
          isOpen={true}
          onClose={() => setShowSubscriptionModal(false)}
          selectedPlan={selectedPlan}
          onSubscribed={() => {
            setShowSubscriptionModal(false);
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
};

export const Studio = ({ onFeatureChange }) => {
  const [activeTab, setActiveTab] = useState('photos');
  const location = useLocation();

  // Check if we're in the admin section
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<StudioHome activeTab={activeTab} setActiveTab={setActiveTab} />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};