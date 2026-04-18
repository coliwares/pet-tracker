'use client';

import { useState } from 'react';
import {
  FEEDBACK_STATUSES,
  FEEDBACK_STATUS_COLORS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPE_COLORS,
  FEEDBACK_TYPE_LABELS,
} from '@/lib/constants';
import { Feedback, FeedbackStatus } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface FeedbackAdminTableProps {
  feedback: Feedback[];
  onStatusChange: (feedbackId: string, status: FeedbackStatus) => Promise<void>;
}

export function FeedbackAdminTable({
  feedback,
  onStatusChange,
}: FeedbackAdminTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleChange = async (feedbackId: string, status: FeedbackStatus) => {
    try {
      setUpdatingId(feedbackId);
      await onStatusChange(feedbackId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm font-bold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-4">Usuario</th>
              <th className="px-5 py-4">Tipo</th>
              <th className="px-5 py-4">Título</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {feedback.map((entry) => (
              <tr key={entry.id} className="align-top">
                <td className="px-5 py-4 text-sm font-medium text-gray-700">
                  {entry.user_email}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-xl px-3 py-1 text-sm font-bold ${FEEDBACK_TYPE_COLORS[entry.type]}`}>
                    {FEEDBACK_TYPE_LABELS[entry.type]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-gray-900">{entry.title}</p>
                  <p className="mt-1 max-w-xl whitespace-pre-wrap text-sm text-gray-600">
                    {entry.message}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-2">
                    <span className={`inline-flex rounded-xl px-3 py-1 text-sm font-bold ${FEEDBACK_STATUS_COLORS[entry.status]}`}>
                      {FEEDBACK_STATUS_LABELS[entry.status]}
                    </span>
                    <select
                      value={entry.status}
                      onChange={(event) =>
                        handleChange(entry.id, event.target.value as FeedbackStatus)
                      }
                      disabled={updatingId === entry.id}
                      className="block w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    >
                      {FEEDBACK_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {FEEDBACK_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  {formatDateTime(entry.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
