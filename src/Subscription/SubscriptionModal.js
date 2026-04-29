import React, { useState } from 'react';
import './SubscriptionModal.css';

const SubscriptionModal = ({
  isOpen,
  onClose,
  user,
  onSubscribed,
  product = 'joblink',
  selectedPlan = null,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState('1m');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen) return null;

  const premiumPlans = [
    { id: '1m', label: '1 month', months: 1, priceKes: 30 },
    { id: '3m', label: '3 months', months: 3, priceKes: 60 },
    { id: '6m', label: '6 months', months: 6, priceKes: 150 },
    { id: '12m', label: '12 months', months: 12, priceKes: 270 },
  ];

  const proPlans = [
    { id: '1m', label: '1 month', months: 1, priceKes: 50 },
    { id: '3m', label: '3 months', months: 3, priceKes: 100 },
    { id: '6m', label: '6 months', months: 6, priceKes: 250 },
    { id: '12m', label: '12 months', months: 12, priceKes: 450 },
  ];

  const plans = selectedPlan === 'pro' ? proPlans : premiumPlans;

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleSubscribe = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your payment details.');
      return;
    }

    // Basic phone number validation for Kenyan numbers
    const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
      setError('Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678).');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Demo mode: Simulate payment request
      console.log('📱 Demo Mode - Starting subscription:', { product, planId: currentPlan.id, phoneNumber: phoneNumber.trim() });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate a fake reference ID for demo
      const demoReference = `DEMO-${Date.now()}`;
      setCheckoutRequestId(demoReference);
      setAwaitingPayment(true);

      // Show success message
      alert(`Demo Mode: Payment request sent to ${phoneNumber}.\n\nClick "Verify" to complete the demo subscription flow.`);

    } catch (e) {
      console.error('Subscription error:', e.message || e);
      setError(`Failed to start subscription: ${e.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!checkoutRequestId) return;

    try {
      setLoading(true);
      setError(null);

      // Demo mode: Simulate payment verification
      console.log('📱 Demo Mode - Verifying payment:', { reference: checkoutRequestId });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Demo success - just close and show success
      if (onSubscribed) {
        onSubscribed({
          planId: selectedPlanId,
          months: currentPlan.months,
          priceKes: currentPlan.priceKes,
          purchasedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + currentPlan.months * 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      alert(`✅ Demo Upgrade Successful!\n\nYou now have ${currentPlan.months} month${currentPlan.months > 1 ? 's' : ''} of premium access (Ksh ${currentPlan.priceKes})\n\nThis is a demo. In production, payment would be processed via M-Pesa.`);

      setAwaitingPayment(false);
      setCheckoutRequestId(null);
      setPhoneNumber('');
      setSelectedPlanId('1m');
      onClose();
    } catch (e) {
      console.error('Verification failed', e);
      setError(e.message || 'Failed to verify payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-modal-overlay" onClick={onClose}>
      <div
        className="subscription-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderColor: 
            selectedPlan === 'premium' ? '#00d9ff' : 
            selectedPlan === 'pro' ? '#ffd700' : 
            'rgba(0, 217, 255, 0.15)'
        }}
      >
        <button className="subscription-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="subscription-header">
          <h2 style={{
            color: 
              selectedPlan === 'premium' ? '#00d9ff' : 
              selectedPlan === 'pro' ? '#ffd700' : 
              '#ffffff'
          }}>
            Unlock {selectedPlan === 'premium' ? 'Premium' : selectedPlan === 'pro' ? 'Premium Pro' : 'Premium'}
          </h2>
        </div>

        <div className="subscription-body">
          <div className="subscription-plans-grid">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={
                  'subscription-plan-card' +
                  (plan.id === selectedPlanId ? ' selected' : '')
                }
                onClick={() => setSelectedPlanId(plan.id)}
              >
                <div className="plan-price">{plan.priceKes}</div>
                <div className="plan-label">{plan.label}</div>
              </button>
            ))}
          </div>

          <div className="subscription-payment-section">
            <label className="payment-label">📱 Phone Number</label>
            <textarea
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712345678"
              className="subscription-phone-field"
              disabled={awaitingPayment}
                        rows="1"
                      />

            {error && <div className="subscription-error-box">{error}</div>}

            {!awaitingPayment ? (
              <button
                type="button"
                className="subscription-pay-btn"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? 'Processing...' : `💳 Pay Ksh ${currentPlan.priceKes}`}
              </button>
            ) : (
              <button
                type="button"
                className="subscription-verify-btn"
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? 'Verifying...' : '✓ Verify'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
