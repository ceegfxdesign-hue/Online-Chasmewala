/**
 * Config-driven feature flags. Premium capabilities ship disabled and can be
 * turned on without code changes / refactors. Values may later be sourced from
 * env or the Settings collection; defaults live here.
 */
export const features = Object.freeze({
  virtualTryOn: false,
  aiRecommendations: false,
  loyaltyProgram: false,
  wallet: false,
  giftCards: false,
  multiLanguage: false,
  multiCurrency: false,
  pwa: false,
});

/** @param {keyof typeof features} name */
export const isFeatureEnabled = (name) => Boolean(features[name]);

export default features;
