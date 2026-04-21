'use client';

import { useCallback, useEffect, useState } from 'react';
import { Feedback } from '@/lib/types';
import { createFeedback, getFeedback, supabase } from '@/lib/supabase';

export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const data = await getFeedback(user.id);
      setFeedback(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching feedback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchFeedback();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchFeedback]);

  const add = async (payload: Omit<Feedback, 'id' | 'status' | 'created_at' | 'updated_at'>) => {
    const created = await createFeedback(payload);
    setFeedback((current) => [created, ...current]);
    return created;
  };

  return { feedback, loading, error, fetchFeedback, add };
}
