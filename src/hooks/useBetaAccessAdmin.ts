'use client';

import { useCallback, useEffect, useState } from 'react';
import { BetaAccessRequest } from '@/lib/types';
import {
  approveBetaAccessRequest,
  getBetaAccessRequests,
  getFeedbackAdminStatus,
  rejectBetaAccessRequest,
} from '@/lib/supabase';

export function useBetaAccessAdmin(filters: {
  status: string;
  dateFrom: string;
  dateTo: string;
}) {
  const [requests, setRequests] = useState<BetaAccessRequest[]>([]);
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

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const admin = await fetchAdminStatus();

      if (!admin) {
        setRequests([]);
        setError(null);
        return;
      }

      const data = await getBetaAccessRequests(filters);
      setRequests(data);
      setError(null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'No se pudieron cargar las solicitudes beta'
      );
    } finally {
      setLoading(false);
    }
  }, [fetchAdminStatus, filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchRequests();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchRequests]);

  const approveRequest = async (requestId: string) => {
    const updatedRequest = await approveBetaAccessRequest(requestId);
    setRequests((current) =>
      current.map((entry) => (entry.id === requestId ? updatedRequest : entry))
    );
    return updatedRequest;
  };

  const rejectRequest = async (requestId: string) => {
    const updatedRequest = await rejectBetaAccessRequest(requestId);
    setRequests((current) =>
      current.map((entry) => (entry.id === requestId ? updatedRequest : entry))
    );
    return updatedRequest;
  };

  return {
    requests,
    loading,
    error,
    isAdmin,
    refresh: fetchRequests,
    approveRequest,
    rejectRequest,
  };
}
