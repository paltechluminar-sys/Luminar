import React from 'react';

/**
 * LockedFeatureModal - Shows when a user tries to access a premium feature
 */
export const LockedFeatureModal = ({ 
  feature, 
  tier,
  onClose, 
  onUpgrade 
}) => {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#1a1a1a',
          border: '2px solid #00ff00',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '400px',
          textAlign: 'center',
          zIndex: 100000,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '20px' }}>
          {feature} is a Premium Feature
        </h2>
        <p style={{ color: '#999999', marginBottom: '24px', lineHeight: '1.6' }}>
          Upgrade to Premium or Premium Pro to unlock {feature.toLowerCase()} and many other powerful features.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #666',
              color: '#ffffff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.borderColor = '#00ff00'}
            onMouseLeave={(e) => e.target.style.borderColor = '#666'}
          >
            Maybe Later
          </button>
          <button
            onClick={onUpgrade}
            style={{
              padding: '10px 20px',
              background: '#00ff00',
              border: 'none',
              color: '#000000',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#00cc00';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#00ff00';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </>
  );
};

/**
 * FeatureGate Component - Wraps a component and shows lock modal if feature not available
 */
export const FeatureGate = ({
  children,
  hasFeature,
  featureName,
  onUpgrade,
}) => {
  const [showLocked, setShowLocked] = React.useState(false);

  if (!hasFeature) {
    return (
      <>
        <div
          onClick={() => setShowLocked(true)}
          style={{
            opacity: 0.5,
            cursor: 'not-allowed',
            pointerEvents: 'auto',
          }}
        >
          {children}
        </div>
        {showLocked && (
          <LockedFeatureModal
            feature={featureName}
            onClose={() => setShowLocked(false)}
            onUpgrade={() => {
              setShowLocked(false);
              onUpgrade?.();
            }}
          />
        )}
      </>
    );
  }

  return children;
};
