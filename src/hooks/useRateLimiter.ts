'use client';

import { useState, useCallback } from 'react';

interface RateLimiterOptions {
  maxAttempts?: number;
  windowMs?: number;
}

export function useRateLimiter({
  maxAttempts = 3,
  windowMs = 60000 // 1 minuto por defecto
}: RateLimiterOptions = {}) {
  const [attempts, setAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);

  const checkLimit = useCallback(() => {
    if (blockedUntil && Date.now() < blockedUntil) {
      const waitSeconds = Math.ceil((blockedUntil - Date.now()) / 1000);
      throw new Error(`⏱️ Demasiados intentos. Espera ${waitSeconds} segundos`);
    }
    return true;
  }, [blockedUntil]);

  const recordAttempt = useCallback(() => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= maxAttempts) {
      const blockTime = Date.now() + windowMs;
      setBlockedUntil(blockTime);

      // Reset después del tiempo de bloqueo
      setTimeout(() => {
        setAttempts(0);
        setBlockedUntil(null);
      }, windowMs);
    }
  }, [attempts, maxAttempts, windowMs]);

  const reset = useCallback(() => {
    setAttempts(0);
    setBlockedUntil(null);
  }, []);

  const isBlocked = blockedUntil !== null && Date.now() < blockedUntil;

  return {
    checkLimit,
    recordAttempt,
    reset,
    isBlocked,
    attempts
  };
}
