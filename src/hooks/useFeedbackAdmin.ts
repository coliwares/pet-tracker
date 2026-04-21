'use client';

import { useCallback, useEffect, useState } from 'react';
import { Feedback, FeedbackStatus } from '@/lib/types';
import {
  getAllFeedback,
  getFeedbackAdminStatus,
  updateFeedbackStatus,
} from '@/lib/supabase';

export function useFeedbackAdmin(filters: { type: string; status: string }) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAdminStatus = useCallback(async () => {
    try {
      const data = await getFeedbackAdminStatus();
      setIsAdmin(data.isAdmin);
      return data.isAdmin;
    } catch {
      setIsAdmin(false);
      return false;
    }
  }, []);

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const admin = await fetchAdminStatus();

      if (!admin) {
        setFeedback([]);
        setError(null);
        return;
      }

      const data = await getAllFeedback(filters);
      setFeedback(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching admin feedback');
    } finally {
      setLoading(false);
    }
  }, [fetchAdminStatus, filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchFeedback();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchFeedback]);

  const updateStatus = async (feedbackId: string, status: FeedbackStatus) => {
    const updated = await updateFeedbackStatus(feedbackId, status);
    setFeedback((current) =>
      current.map((entry) => (entry.id === feedbackId ? updated : entry))
    );
    return updated;
  };

  return {
    feedback,
    loading,
    error,
    isAdmin,
    refresh: fetchFeedback,
    updateStatus,
  };
}
