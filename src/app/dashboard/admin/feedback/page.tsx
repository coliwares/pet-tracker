'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { Toast } from '@/components/ui/Toast';
import { FeedbackAdminBoard } from '@/components/feedback/FeedbackAdminBoard';
import {
  FEEDBACK_STATUSES,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPES,
  FEEDBACK_TYPE_LABELS,
} from '@/lib/constants';
import { FeedbackStatus } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useFeedbackAdmin } from '@/hooks/useFeedbackAdmin';

export default function AdminFeedbackPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [filters, setFilters] = useState({ type: 'all', status: 'all' });
  const [toast, setToast] = useState<string | null>(null);
  const { feedback, loading, isAdmin, error, updateStatus } = useFeedbackAdmin(filters);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!authLoading && user && !loading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, loading, router, user]);

  if (authLoading || loading) {
    return <Loading text="Cargando panel administrativo..." />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleStatusChange = async (feedbackId: string, status: FeedbackStatus) => {
    await updateStatus(feedbackId, status);
    setToast('Estado actualizado correctamente.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Container className="py-12">
        <Link
          href="/dashboard"
          className="group mb-8 inline-flex items-center text-base font-semibold text-gray-600 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Volver al dashboard
        </Link>

        <div className="mb-8 rounded-3xl border-2 border-indigo-100 bg-white p-8 shadow-card">
          <div className="mb-6 flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-4 shadow-lg">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">Panel global de feedback</h1>
              <p className="text-lg text-gray-600">
                Revisa todos los reportes y actualiza su estado operativo.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Filtrar por tipo</label>
              <select
                value={filters.type}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, type: event.target.value }))
                }
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus:border-blue-400 focus:outline-none"
              >
                <option value="all">Todos</option>
                {FEEDBACK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {FEEDBACK_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Filtrar por estado</label>
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, status: event.target.value }))
                }
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus:border-blue-400 focus:outline-none"
              >
                <option value="all">Todos</option>
                {FEEDBACK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {FEEDBACK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 px-5 py-4 font-medium text-red-700">
            {error}
          </div>
        ) : feedback.length === 0 ? (
          <div className="rounded-3xl border-2 border-gray-100 bg-white p-12 shadow-card">
            <EmptyState
              icon={
                <div className="rounded-3xl bg-gradient-to-br from-indigo-400 to-blue-500 p-6 shadow-xl">
                  <ShieldCheck className="h-20 w-20 text-white" />
                </div>
              }
              title="No hay feedback para estos filtros"
              description="Ajusta los filtros o espera nuevos reportes de usuarios."
            />
          </div>
        ) : (
          <FeedbackAdminBoard feedback={feedback} onStatusChange={handleStatusChange} />
        )}
      </Container>

      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}
    </div>
  );
}
