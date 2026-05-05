'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays } from 'date-fns';
import { getDailyCareLogs, getDailyCareLogsForPets, upsertDailyCareLog } from '@/lib/supabase';
import { DailyCareLog, DailyCareLogInput } from '@/lib/types';
import { DAILY_CARE_DEFAULTS, mergeDailyCareLog } from '@/lib/gamification';
import { toDateInputValue } from '@/lib/utils';

type UseDailyCareLogsOptions = {
  from?: string;
  to?: string;
  logDate?: string;
};

export function useDailyCareLogs(petId: string, options?: UseDailyCareLogsOptions) {
  const defaultFrom = toDateInputValue(addDays(new Date(), -365));
  const from = options?.from;
  const to = options?.to;
  const logDateFilter = options?.logDate;
  const logDate = options?.logDate ?? toDateInputValue(new Date());
  const [logs, setLogs] = useState<DailyCareLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!petId) {
      setLogs([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      const data = await getDailyCareLogs(petId, {
        from: from ?? defaultFrom,
        to,
        logDate: logDateFilter,
      });
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tracking diario');
    } finally {
      setLoading(false);
    }
  }, [defaultFrom, from, logDateFilter, petId, to]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchLogs();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchLogs]);

  const currentLog = useMemo(() => {
    return mergeDailyCareLog(petId, logDate, logs.find((entry) => entry.log_date === logDate));
  }, [logDate, logs, petId]);

  const saveLog = useCallback(
    async (input: Partial<DailyCareLogInput>) => {
      if (!petId) {
        throw new Error('Mascota no disponible');
      }

      const payload: DailyCareLogInput = {
        ...DAILY_CARE_DEFAULTS,
        meals_logged: currentLog.meals_logged,
        breakfast_completed: currentLog.breakfast_completed,
        lunch_completed: currentLog.lunch_completed,
        dinner_completed: currentLog.dinner_completed,
        hydration_logged: currentLog.hydration_logged,
        hydration_ml: currentLog.hydration_ml,
        exercise_logged: currentLog.exercise_logged,
        exercise_minutes: currentLog.exercise_minutes,
        health_logged: currentLog.health_logged,
        symptoms_severity: currentLog.symptoms_severity,
        care_logged: currentLog.care_logged,
        medicines_on_time: currentLog.medicines_on_time,
        grooming_completed: currentLog.grooming_completed,
        ears_eyes_cleaning_completed: currentLog.ears_eyes_cleaning_completed,
        notes: currentLog.notes,
        ...input,
        pet_id: petId,
        log_date: input.log_date ?? logDate,
      };
      const saved = await upsertDailyCareLog(payload);

      setLogs((current) => {
        const next = current.filter(
          (entry) => !(entry.pet_id === saved.pet_id && entry.log_date === saved.log_date)
        );
        next.push(saved);
        next.sort((a, b) => a.log_date.localeCompare(b.log_date));
        return next;
      });

      return saved;
    },
    [currentLog, logDate, petId]
  );

  return {
    logs,
    currentLog,
    loading,
    error,
    fetchLogs,
    saveLog,
  };
}

export function useDailyCareLogsByPets(petIds: string[], options?: UseDailyCareLogsOptions) {
  const defaultFrom = toDateInputValue(addDays(new Date(), -365));
  const from = options?.from;
  const to = options?.to;
  const logDateFilter = options?.logDate;
  const [logs, setLogs] = useState<DailyCareLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const petIdsKey = petIds.join('|');
  const sortedPetIds = useMemo(() => {
    return petIdsKey.length > 0 ? petIdsKey.split('|').sort() : [];
  }, [petIdsKey]);

  const fetchLogs = useCallback(async () => {
    if (sortedPetIds.length === 0) {
      setLogs([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading((current) => current || logs.length === 0);
      const data = await getDailyCareLogsForPets(sortedPetIds, {
        from: from ?? defaultFrom,
        to,
        logDate: logDateFilter,
      });
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tracking global');
    } finally {
      setLoading(false);
    }
  }, [defaultFrom, from, logDateFilter, logs.length, sortedPetIds, to]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchLogs();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchLogs]);

  const logsByPetId = useMemo(() => {
    return logs.reduce<Record<string, DailyCareLog[]>>((grouped, log) => {
      if (!grouped[log.pet_id]) {
        grouped[log.pet_id] = [];
      }

      grouped[log.pet_id].push(log);
      return grouped;
    }, {});
  }, [logs]);

  return {
    logs,
    logsByPetId,
    loading,
    error,
    fetchLogs,
  };
}
