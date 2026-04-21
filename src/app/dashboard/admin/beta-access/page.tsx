'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { Toast } from '@/components/ui/Toast';
import {
  BETA_ACCESS_REQUEST_STATUSES,
  BETA_ACCESS_REQUEST_STATUS_LABELS,
} from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { useBetaAccessAdmin } from '@/hooks/useBetaAccessAdmin';
import { BetaAccessAdminTable } from '@/components/admin/BetaAccessAdminTable';

export default function AdminBetaAccessPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [filters, setFilters] = useState({ status: 'all', dateFrom: '', dateTo: '' });
  const [toast, setToast] = useState<string | null>(null);
  const { requests, loading, isAdmin, error, approveRequest, rejectRequest } =
    useBetaAccessAdmin(filters);

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
    return <Loading text="Cargando solicitudes beta..." />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleApprove = async (requestId: string) => {
    await approveRequest(requestId);
    setToast('Solicitud aprobada. Invitación enviada correctamente.');
  };

  const handleReject = async (requestId: string) => {
    await rejectRequest(requestId);
    setToast('Solicitud rechazada correctamente.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Container className="py-12">
        <Link
          href="/dashboard/admin/feedback"
          className="group mb-8 inline-flex items-center text-base font-semibold text-gray-600 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Volver al panel admin
        </Link>

        <div className="mb-8 rounded-3xl border-2 border-indigo-100 bg-white p-8 shadow-card">
          <div className="mb-6 flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-4 shadow-lg">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">Solicitudes beta</h1>
              <p className="text-lg text-gray-600">
                Aprueba solicitudes y habilita acceso con configuración de contraseña.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Filtrar por estado
            </label>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({ ...current, status: event.target.value }))
              }
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus:border-blue-400 focus:outline-none"
            >
              <option value="all">Todos</option>
              {BETA_ACCESS_REQUEST_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {BETA_ACCESS_REQUEST_STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Desde (fecha)
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, dateFrom: event.target.value }))
                }
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Hasta (fecha)
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, dateTo: event.target.value }))
                }
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 px-5 py-4 font-medium text-red-700">
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border-2 border-gray-100 bg-white p-12 shadow-card">
            <EmptyState
              icon={
                <div className="rounded-3xl bg-gradient-to-br from-indigo-400 to-blue-500 p-6 shadow-xl">
                  <UserCheck className="h-20 w-20 text-white" />
                </div>
              }
              title="No hay solicitudes para estos filtros"
              description="Prueba con otro estado o espera nuevas solicitudes."
            />
          </div>
        ) : (
          <BetaAccessAdminTable
            requests={requests}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </Container>

      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}
    </div>
  );
}
