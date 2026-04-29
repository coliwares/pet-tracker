'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pet } from '@/lib/types';
import { getEventCountForPets, getPets } from '@/lib/supabase';

type UserOnboardingProgress = {
  petCount: number;
  totalEventCount: number;
};

export function useUserOnboardingProgress(userId?: string, petsOverride?: Pet[]) {
  const [progress, setProgress] = useState<UserOnboardingProgress>({
    petCount: petsOverride?.length ?? 0,
    totalEventCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setProgress({ petCount: 0, totalEventCount: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const pets = petsOverride ?? (await getPets(userId));
      const petIds = pets.map((pet) => pet.id);
      const totalEventCount = await getEventCountForPets(petIds);

      setProgress({
        petCount: pets.length,
        totalEventCount,
      });
    } finally {
      setLoading(false);
    }
  }, [petsOverride, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchProgress();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchProgress]);

  return {
    ...progress,
    loading,
    refetch: fetchProgress,
  };
}
