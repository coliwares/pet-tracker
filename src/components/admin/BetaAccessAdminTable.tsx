'use client';

import { useState } from 'react';
import {
  BETA_ACCESS_REQUEST_STATUS_COLORS,
  BETA_ACCESS_REQUEST_STATUS_LABELS,
} from '@/lib/constants';
import { BetaAccessRequest } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface BetaAccessAdminTableProps {
  requests: BetaAccessRequest[];
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
}

export function BetaAccessAdminTable({
  requests,
  onApprove,
  onReject,
}: BetaAccessAdminTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await onApprove(requestId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await onReject(requestId);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-3xl border-2 border-gray-100 bg-white p-4 shadow-card sm:p-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="text-left text-sm text-gray-500">
            <th className="py-3 pr-4 font-semibold">Solicitante</th>
            <th className="py-3 pr-4 font-semibold">Motivo</th>
            <th className="py-3 pr-4 font-semibold">Estado</th>
            <th className="py-3 pr-4 font-semibold">Última solicitud</th>
            <th className="py-3 font-semibold">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.map((request) => {
            const isApproved = request.status === 'aprobado';
            const isRejected = request.status === 'rechazado';
            const isUpdating = processingId === request.id;

            return (
              <tr key={request.id} className="align-top">
                <td className="py-4 pr-4">
                  <p className="font-bold text-gray-900">{request.full_name}</p>
                  <p className="text-sm text-gray-600">{request.email}</p>
                  <p className="text-xs text-gray-500">Intentos: {request.request_count}</p>
                </td>
                <td className="py-4 pr-4">
                  <p className="max-w-xl whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {request.reason}
                  </p>
                </td>
                <td className="py-4 pr-4">
                  <span
                    className={`inline-flex rounded-xl px-3 py-1 text-xs font-bold ${BETA_ACCESS_REQUEST_STATUS_COLORS[request.status]}`}
                  >
                    {BETA_ACCESS_REQUEST_STATUS_LABELS[request.status]}
                  </span>
                  {request.approved_at ? (
                    <p className="mt-2 text-xs text-gray-500">
                      Aprobado: {formatDateTime(request.approved_at)}
                    </p>
                  ) : null}
                </td>
                <td className="py-4 pr-4 text-sm text-gray-600">
                  {formatDateTime(request.last_requested_at)}
                </td>
                <td className="py-4">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={isApproved || isRejected || isUpdating}
                    >
                      {isUpdating
                        ? 'Procesando...'
                        : isApproved
                          ? 'Ya aprobado'
                          : 'Aprobar y enviar invitacion'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => handleReject(request.id)}
                      disabled={isApproved || isRejected || isUpdating}
                    >
                      {isRejected ? 'Ya rechazado' : 'Rechazar'}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
