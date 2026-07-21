/**
 * Frontend feature flags — mirror of backend `config/features.js`. Premium
 * capabilities are gated here so UI can be toggled without refactoring.
 * Sourced from build-time env where provided, else the safe default (off).
 */
const flag = (key, def = false) => {
  const val = import.meta.env[key];
  if (val === undefined) return def;
  return val === 'true' || val === '1';
};

export const features = Object.freeze({
  virtualTryOn: flag('VITE_FEATURE_VIRTUAL_TRY_ON'),
  aiRecommendations: flag('VITE_FEATURE_AI_RECOMMENDATIONS'),
  loyaltyProgram: flag('VITE_FEATURE_LOYALTY'),
  wallet: flag('VITE_FEATURE_WALLET'),
  giftCards: flag('VITE_FEATURE_GIFT_CARDS'),
  multiLanguage: flag('VITE_FEATURE_MULTI_LANGUAGE'),
  multiCurrency: flag('VITE_FEATURE_MULTI_CURRENCY'),
  pwa: flag('VITE_FEATURE_PWA'),
});

export const isFeatureEnabled = (name) => Boolean(features[name]);

export default features;
