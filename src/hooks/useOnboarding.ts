import { useState, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'spendwiser_onboarding_completed';

export const useOnboarding = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      return stored === 'true';
    } catch (error) {
      console.error('Error reading onboarding state from localStorage:', error);
      return false;
    }
  });

  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  const markOnboardingComplete = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      setHasCompletedOnboarding(true);
      setShouldShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding state to localStorage:', error);
    }
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error resetting onboarding state:', error);
    }
  };

  const triggerOnboarding = (shouldTrigger: boolean, forceShow: boolean = false) => {
    if (forceShow) {
      setShouldShowOnboarding(shouldTrigger);
    } else {
      setShouldShowOnboarding(shouldTrigger && !hasCompletedOnboarding);
    }
  };

  return {
    hasCompletedOnboarding,
    shouldShowOnboarding,
    markOnboardingComplete,
    resetOnboarding,
    triggerOnboarding,
  };
};