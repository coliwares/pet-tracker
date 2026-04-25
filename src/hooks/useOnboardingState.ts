'use client';

import { useCallback, useMemo, useState } from 'react';

type DismissedSteps = Record<string, boolean>;

const STORAGE_PREFIX = 'pet-tracker:onboarding';

function readDismissedSteps(storageKey: string | null): DismissedSteps {
  if (!storageKey || typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as DismissedSteps) : {};
  } catch {
    return {};
  }
}

export function useOnboardingState(userId?: string) {
  const [version, setVersion] = useState(0);

  const storageKey = useMemo(() => {
    return userId ? `${STORAGE_PREFIX}:${userId}` : null;
  }, [userId]);

  const dismissedSteps = useMemo(() => {
    void version;
    return readDismissedSteps(storageKey);
  }, [storageKey, version]);

  const persist = useCallback((nextState: DismissedSteps) => {
    if (!storageKey || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(nextState));
    setVersion((current) => current + 1);
  }, [storageKey]);

  const dismissStep = useCallback((stepId: string) => {
    persist({
      ...dismissedSteps,
      [stepId]: true,
    });
  }, [dismissedSteps, persist]);

  const showStep = useCallback((stepId: string) => {
    if (!dismissedSteps[stepId]) {
      return;
    }

    const nextState = { ...dismissedSteps };
    delete nextState[stepId];
    persist(nextState);
  }, [dismissedSteps, persist]);

  const isDismissed = useCallback((stepId: string) => Boolean(dismissedSteps[stepId]), [dismissedSteps]);

  return {
    dismissStep,
    isDismissed,
    showStep,
  };
}
