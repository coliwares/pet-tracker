'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ChevronDown, ExternalLink, Image as ImageIcon } from 'lucide-react';
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
  const [collapsedEntries, setCollapsedEntries] = useState<Record<string, boolean>>({});

  const groupedFeedback = useMemo(() => {
    return FEEDBACK_STATUSES.reduce((accumulator, status) => {
      accumulator[status] = feedback.filter((entry) => entry.status === status);
      return accumulator;
    }, {} as Record<FeedbackStatus, Feedback[]>);
  }, [feedback]);

  const feedbackIds = useMemo(() => feedback.map((entry) => entry.id), [feedback]);
  const allCollapsed =
    feedbackIds.length > 0 && feedbackIds.every((feedbackId) => Boolean(collapsedEntries[feedbackId]));

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

  const toggleCollapsed = (feedbackId: string) => {
    setCollapsedEntries((current) => ({
      ...current,
      [feedbackId]: !current[feedbackId],
    }));
  };

  const setAllCollapsed = (collapsed: boolean) => {
    setCollapsedEntries(
      Object.fromEntries(feedbackIds.map((feedbackId) => [feedbackId, collapsed]))
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-900">Vista del tablero</p>
          <p className="text-xs text-slate-500">
            {allCollapsed
              ? 'Todas las tarjetas están resumidas.'
              : 'Puedes resumir todas las tarjetas para revisar más rápido.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAllCollapsed(!allCollapsed)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700"
        >
          {allCollapsed ? 'Expandir todo' : 'Colapsar todo'}
        </button>
      </div>

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
                    (() => {
                      const isCollapsed = Boolean(collapsedEntries[entry.id]);

                      return (
                        <article
                          key={entry.id}
                          draggable={updatingId !== entry.id}
                          onDragStart={(event) => handleDragStart(event, entry.id)}
                          onDragEnd={handleDragEnd}
                          className={`rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                            draggingId === entry.id ? 'scale-[0.98] opacity-60 shadow-lg' : ''
                          } ${
                            updatingId === entry.id
                              ? 'cursor-wait opacity-70'
                              : 'cursor-grab active:cursor-grabbing'
                          }`}
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
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

                              <h3 className="text-base font-bold text-gray-900">{entry.title}</h3>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleCollapsed(entry.id)}
                              aria-expanded={!isCollapsed}
                              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-700"
                            >
                              {isCollapsed ? 'Expandir' : 'Ocultar'}
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                              />
                            </button>
                          </div>

                          {isCollapsed ? (
                            <div className="space-y-3">
                              <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                <span className="font-semibold">Usuario:</span> {entry.user_email}
                              </div>

                              <p className="text-sm leading-relaxed text-gray-600">
                                {entry.message.length > 140
                                  ? `${entry.message.slice(0, 140).trimEnd()}...`
                                  : entry.message}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                                {entry.image_url ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                                    <ImageIcon className="h-3.5 w-3.5" />
                                    Con imagen
                                  </span>
                                ) : null}
                                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                  Estado: {FEEDBACK_STATUS_LABELS[entry.status]}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                                {entry.message}
                              </p>

                              {entry.image_url && (
                                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                                    <ImageIcon className="h-4 w-4" />
                                    <span>Imagen adjunta</span>
                                  </div>
                                  <div className="mt-3 overflow-hidden rounded-xl border border-blue-100 bg-white">
                                    <Image
                                      src={entry.image_url}
                                      alt={`Adjunto de feedback: ${entry.title}`}
                                      width={288}
                                      height={192}
                                      className="h-40 w-full object-cover"
                                      unoptimized
                                    />
                                  </div>
                                  <a
                                    href={entry.image_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-700 hover:text-blue-800"
                                  >
                                    Ver imagen completa
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </div>
                              )}

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
                            </>
                          )}
                        </article>
                      );
                    })()
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
      </div>
    </div>
  );
}
