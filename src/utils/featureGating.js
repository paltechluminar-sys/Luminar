/**
 * Feature Gating Matrix
 * Defines which features are available for each subscription tier
 */

export const FEATURES = {
  // Export features
  EXPORT_PDF: { basic: true, premium: true, premium_pro: true },
  EXPORT_HIGH_RES: { basic: true, premium: true, premium_pro: true },
  EXPORT_BATCH: { basic: true, premium: true, premium_pro: true },

  // Editor features
  ADVANCED_FILTERS: { basic: false, premium: true, premium_pro: true },
  CUSTOM_TEMPLATES: { basic: false, premium: true, premium_pro: true },
  AI_BACKGROUND_REMOVAL: { basic: false, premium: false, premium_pro: true },

  // Storage
  PROJECTS_LIMIT: { basic: 3, premium: 50, premium_pro: 1000 },
  STORAGE_GB: { basic: 1, premium: 10, premium_pro: 100 },

  // Support
  PRIORITY_SUPPORT: { basic: false, premium: true, premium_pro: true },
};

/**
 * Check if a tier has a specific feature
 * @param {string} tier - subscription tier ('basic', 'premium', 'premium_pro')
 * @param {string} feature - feature key from FEATURES
 * @returns {boolean|number} - true/false for boolean features, number for limits
 */
export function hasFeature(tier, feature) {
  const tiers = ['basic', 'premium', 'premium_pro'];
  
  if (!tiers.includes(tier)) {
    console.warn(`[hasFeature] Invalid tier: ${tier}, defaulting to basic`);
    tier = 'basic';
  }

  const featureConfig = FEATURES[feature];
  if (!featureConfig) {
    console.warn(`[hasFeature] Unknown feature: ${feature}`);
    return false;
  }

  return featureConfig[tier] !== false && featureConfig[tier] !== 0;
}

/**
 * Get the actual value/limit for a feature at a given tier
 * @param {string} tier - subscription tier
 * @param {string} feature - feature key
 * @returns {boolean|number|null} - the feature value
 */
export function getFeatureValue(tier, feature) {
  const tiers = ['basic', 'premium', 'premium_pro'];
  
  if (!tiers.includes(tier)) {
    tier = 'basic';
  }

  const featureConfig = FEATURES[feature];
  if (!featureConfig) {
    return null;
  }

  return featureConfig[tier];
}

/**
 * Get tier details for display/comparison
 */
export const TIER_DETAILS = {
  basic: {
    label: 'Free',
    price: 0,
    currency: 'KES',
    billing: 'Forever free',
    features: [
      'Photo & Sports templates',
      'Basic text overlays',
      'Export as image',
      '1 GB storage',
      'Up to 3 projects',
    ],
  },
  premium: {
    label: 'Premium',
    price: 99,
    currency: 'KES',
    billing: 'Monthly',
    popular: true,
    features: [
      'All Free features',
      'PDF export',
      'High-res export (4K)',
      'Advanced filters & effects',
      '10 GB storage',
      'Unlimited projects',
      'Custom templates',
      'Email support',
    ],
  },
  premium_pro: {
    label: 'Premium Pro',
    price: 299,
    currency: 'KES',
    billing: 'Monthly',
    features: [
      'All Premium features',
      'Batch export',
      'AI Background Removal',
      '100 GB storage',
      'Priority support',
      'API access',
      'Advanced analytics',
    ],
  },
};

/**
 * Check tier hierarchy
 * Returns true if 'tier1' is >= 'tier2'
 */
export function isTierOrHigher(tier1, tier2) {
  const hierarchy = { basic: 0, premium: 1, premium_pro: 2 };
  return (hierarchy[tier1] || 0) >= (hierarchy[tier2] || 0);
}

/**
 * Get upgrade suggestion
 * Suggests the minimum tier needed for a feature
 */
export function getMinTierForFeature(feature) {
  const config = FEATURES[feature];
  if (!config) return null;

  if (config.premium_pro !== false && config.premium_pro !== 0) {
    return 'premium_pro';
  }
  if (config.premium !== false && config.premium !== 0) {
    return 'premium';
  }
  return null;
}
