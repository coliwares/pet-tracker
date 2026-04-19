'use client';

import { useMemo, useState } from 'react';
import {
  FEEDBACK_STATUSES,
  FEEDBACK_STATUS_COLORS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPE_COLORS,
  FEEDBACK_TYPE_LABELS,
} from '@/lib/constants';
import { Feedback, FeedbackStatus } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface FeedbackAdminBoardProps {
  feedback: Feedback[];
  onStatusChange: (feedbackId: string, status: FeedbackStatus) => Promise<void>;
}

export function FeedbackAdminBoard({
  feedback,
  onStatusChange,
}: FeedbackAdminBoardProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<FeedbackStatus | null>(null);

  const groupedFeedback = useMemo(() => {
    return FEEDBACK_STATUSES.reduce((accumulator, status) => {
      accumulator[status] = feedback.filter((entry) => entry.status === status);
      return accumulator;
    }, {} as Record<FeedbackStatus, Feedback[]>);
  }, [feedback]);

  const handleChange = async (feedbackId: string, status: FeedbackStatus) => {
    try {
      setUpdatingId(feedbackId);
      await onStatusChange(feedbackId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLElement>,
    feedbackId: string
  ) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', feedbackId);
    setDraggingId(feedbackId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLElement>,
    status: FeedbackStatus
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  };

  const handleDrop = async (
    event: React.DragEvent<HTMLElement>,
    status: FeedbackStatus
  ) => {
    event.preventDefault();

    const feedbackId = event.dataTransfer.getData('text/plain');
    const draggedEntry = feedback.find((entry) => entry.id === feedbackId);

    setDragOverStatus(null);
    setDraggingId(null);

    if (!feedbackId || !draggedEntry || draggedEntry.status === status) {
      return;
    }

    await handleChange(feedbackId, status);
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-6">
        {FEEDBACK_STATUSES.map((status) => {
          const entries = groupedFeedback[status];

          return (
            <section
              key={status}
              onDragOver={(event) => handleDragOver(event, status)}
              onDragLeave={() => {
                if (dragOverStatus === status) {
                  setDragOverStatus(null);
                }
              }}
              onDrop={(event) => handleDrop(event, status)}
              className={`flex w-[340px] shrink-0 flex-col rounded-3xl border-2 bg-white/90 p-5 shadow-card backdrop-blur-sm transition-all ${
                dragOverStatus === status
                  ? 'border-blue-400 ring-4 ring-blue-100'
                  : 'border-gray-100'
              }`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <span
                    className={`inline-flex rounded-xl px-3 py-1 text-sm font-bold ${FEEDBACK_STATUS_COLORS[status]}`}
                  >
                    {FEEDBACK_STATUS_LABELS[status]}
                  </span>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                  {entries.length}
                </span>
              </div>

              <div className="flex min-h-[420px] flex-1 flex-col gap-4">
                {entries.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 text-center text-sm text-gray-500">
                    No hay feedback en esta columna.
                  </div>
                ) : (
                  entries.map((entry) => (
                    <article
                      key={entry.id}
                      draggable={updatingId !== entry.id}
                      onDragStart={(event) => handleDragStart(event, entry.id)}
                      onDragEnd={handleDragEnd}
                      className={`rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                        draggingId === entry.id ? 'scale-[0.98] opacity-60 shadow-lg' : ''
                      } ${
                        updatingId === entry.id ? 'cursor-wait opacity-70' : 'cursor-grab active:cursor-grabbing'
                      }`}
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-xl px-3 py-1 text-xs font-bold ${FEEDBACK_TYPE_COLORS[entry.type]}`}
                        >
                          {FEEDBACK_TYPE_LABELS[entry.type]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(entry.created_at)}
                        </span>
                      </div>

                      <h3 className="mb-2 text-base font-bold text-gray-900">
                        {entry.title}
                      </h3>
                      <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                        {entry.message}
                      </p>

                      <div className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-gray-700">
                        <span className="font-semibold">Usuario:</span> {entry.user_email}
                      </div>

                      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                        Arrastra esta tarjeta a otra columna o usa el selector.
                      </p>

                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Mover a
                      </label>
                      <select
                        value={entry.status}
                        onChange={(event) =>
                          handleChange(entry.id, event.target.value as FeedbackStatus)
                        }
                        disabled={updatingId === entry.id}
                        className="block w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                      >
                        {FEEDBACK_STATUSES.map((nextStatus) => (
                          <option key={nextStatus} value={nextStatus}>
                            {FEEDBACK_STATUS_LABELS[nextStatus]}
                          </option>
                        ))}
                      </select>
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
