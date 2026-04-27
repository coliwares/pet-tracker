'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Mail,
} from 'lucide-react';
import {
  FEEDBACK_STATUSES,
  FEEDBACK_STATUS_COLORS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPE_COLORS,
  FEEDBACK_TYPE_LABELS,
} from '@/lib/constants';
import { Feedback, FeedbackStatus } from '@/lib/types';
import { sendFeedbackReplyEmail } from '@/lib/supabase';
import { formatDateTime } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

interface FeedbackAdminBoardProps {
  feedback: Feedback[];
  onStatusChange: (feedbackId: string, status: FeedbackStatus) => Promise<void>;
}

interface FeedbackEmailDraft {
  subject: string;
  plainText: string;
  html: string;
  mailto: string;
}

type CopiedField = 'subject' | 'html' | 'text' | null;

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildFeedbackEmailDraft(entry: Feedback): FeedbackEmailDraft {
  const isBug = entry.type === 'bug';
  const subject = isBug
    ? `Actualización de tu reporte: ${entry.title}`
    : `Actualización de tu sugerencia: ${entry.title}`;
  const intro = isBug
    ? 'Queríamos contarte que ya solucionamos el bug que nos reportaste.'
    : 'Queríamos contarte que ya implementamos la mejora que nos sugeriste.';
  const gratitude = isBug
    ? 'Tu feedback nos ayudó a mejorar la experiencia de quienes usan Pet Tracker todos los días.'
    : 'Tu feedback fue muy valioso para seguir mejorando Pet Tracker.';
  const closing = isBug ? 'Gracias por avisarnos.' : 'Gracias por ayudarnos a crecer.';
  const badgeLabel = isBug ? 'Bug resuelto' : 'Mejora implementada';
  const accent = isBug ? '#0f766e' : '#2563eb';
  const accentSoft = isBug ? '#ccfbf1' : '#dbeafe';

  const plainText = [
    'Hola,',
    '',
    `Gracias por tu ${isBug ? 'reporte' : 'sugerencia'}: "${entry.title}".`,
    intro,
    '',
    gratitude,
    '',
    closing,
    '',
    'Equipo Pet Tracker',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;">
      <tr>
        <td style="padding:0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#eff6ff 0%,#ffffff 100%);border:1px solid #dbeafe;border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px 28px;">
                <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:${accentSoft};color:${accent};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                  ${badgeLabel}
                </div>
                <h1 style="margin:18px 0 10px 0;font-size:28px;line-height:1.15;color:#0f172a;">
                  Gracias por ayudarnos a mejorar Pet Tracker
                </h1>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">
                  Hola, queríamos compartirte una actualización sobre tu ${isBug ? 'reporte' : 'sugerencia'}.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;">
                  <tr>
                    <td style="padding:20px;">
                      <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">
                        Tu mensaje
                      </p>
                      <p style="margin:0;font-size:20px;font-weight:700;line-height:1.35;color:#0f172a;">
                        ${escapeHtml(entry.title)}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px 28px;">
                <p style="margin:0 0 14px 0;font-size:15px;line-height:1.8;color:#334155;">
                  ${intro}
                </p>
                <p style="margin:0 0 14px 0;font-size:15px;line-height:1.8;color:#334155;">
                  ${gratitude}
                </p>
                <p style="margin:0;font-size:15px;line-height:1.8;color:#334155;">
                  ${closing}
                </p>
                <p style="margin:24px 0 0 0;font-size:14px;font-weight:700;color:#0f172a;">
                  Equipo Pet Tracker
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();

  const mailto = `mailto:${encodeURIComponent(entry.user_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;

  return { subject, plainText, html, mailto };
}

export function FeedbackAdminBoard({
  feedback,
  onStatusChange,
}: FeedbackAdminBoardProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<FeedbackStatus | null>(null);
  const [collapsedEntries, setCollapsedEntries] = useState<Record<string, boolean>>({});
  const [selectedEntry, setSelectedEntry] = useState<Feedback | null>(null);
  const [copiedField, setCopiedField] = useState<CopiedField>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const groupedFeedback = useMemo(() => {
    return FEEDBACK_STATUSES.reduce((accumulator, status) => {
      accumulator[status] = feedback.filter((entry) => entry.status === status);
      return accumulator;
    }, {} as Record<FeedbackStatus, Feedback[]>);
  }, [feedback]);

  const feedbackIds = useMemo(() => feedback.map((entry) => entry.id), [feedback]);
  const allCollapsed =
    feedbackIds.length > 0 && feedbackIds.every((feedbackId) => Boolean(collapsedEntries[feedbackId]));

  const selectedDraft = useMemo(
    () => (selectedEntry ? buildFeedbackEmailDraft(selectedEntry) : null),
    [selectedEntry]
  );

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

  const handleCopy = async (value: string, field: Exclude<CopiedField, null>) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current));
      }, 2000);
    } catch {
      setCopiedField(null);
    }
  };

  const handleOpenEmailModal = (entry: Feedback) => {
    setCopiedField(null);
    setSendError(null);
    setSendSuccess(null);
    setSelectedEntry(entry);
  };

  const handleSendEmail = async () => {
    if (!selectedEntry || !selectedDraft) {
      return;
    }

    try {
      setIsSendingEmail(true);
      setSendError(null);
      setSendSuccess(null);

      const response = await sendFeedbackReplyEmail({
        feedbackId: selectedEntry.id,
        subject: selectedDraft.subject,
        html: selectedDraft.html,
        text: selectedDraft.plainText,
      });

      setSendSuccess(`Correo enviado a ${response.sentTo}.`);
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : 'No se pudo enviar el correo con Resend'
      );
    } finally {
      setIsSendingEmail(false);
    }
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

      <div className="-mx-2 overflow-x-auto px-2 pb-4 xl:overflow-visible">
        <div className="flex min-w-max gap-6 xl:grid xl:min-w-0 xl:grid-cols-3">
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
                className={`flex w-[360px] shrink-0 flex-col rounded-3xl border-2 bg-white/90 p-5 shadow-card backdrop-blur-sm transition-all xl:w-auto xl:min-w-0 ${
                  dragOverStatus === status
                    ? 'border-blue-400 ring-4 ring-blue-100'
                    : 'border-gray-100'
                }`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex rounded-xl px-3 py-1 text-sm font-bold ${FEEDBACK_STATUS_COLORS[status]}`}
                  >
                    {FEEDBACK_STATUS_LABELS[status]}
                  </span>
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
                    entries.map((entry) => {
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
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              {!isCollapsed ? (
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
                              ) : null}

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

                          {isCollapsed ? null : (
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

                              <button
                                type="button"
                                onClick={() => handleOpenEmailModal(entry)}
                                className="mb-3 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                              >
                                <Mail className="h-4 w-4" />
                                {entry.type === 'bug'
                                  ? 'Preparar correo de bug resuelto'
                                  : 'Preparar correo de mejora implementada'}
                              </button>

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
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedEntry && selectedDraft)}
        onClose={() => {
          setSelectedEntry(null);
          setCopiedField(null);
          setIsSendingEmail(false);
          setSendError(null);
          setSendSuccess(null);
        }}
        title={selectedEntry?.type === 'bug' ? 'Correo de bug resuelto' : 'Correo de mejora implementada'}
      >
        {selectedEntry && selectedDraft ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Para</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{selectedEntry.user_email}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Asunto</p>
              <p className="mt-1 text-sm text-slate-700">{selectedDraft.subject}</p>
            </div>

            {sendSuccess ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{sendSuccess}</span>
                </div>
              </div>
            ) : null}

            {sendError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {sendError}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Mail className="h-4 w-4" />
                {isSendingEmail ? 'Enviando...' : 'Enviar con Resend'}
              </button>
              <a
                href={selectedDraft.mailto}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <Mail className="h-4 w-4" />
                Abrir correo manual
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCopy(selectedDraft.subject, 'subject')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700"
              >
                <Copy className="h-4 w-4" />
                {copiedField === 'subject' ? 'Asunto copiado' : 'Copiar asunto'}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(selectedDraft.html, 'html')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700"
              >
                <Copy className="h-4 w-4" />
                {copiedField === 'html' ? 'HTML copiado' : 'Copiar HTML'}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(selectedDraft.plainText, 'text')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700"
              >
                <Copy className="h-4 w-4" />
                {copiedField === 'text' ? 'Texto copiado' : 'Copiar texto'}
              </button>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Vista previa HTML
              </p>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div
                  className="max-h-[420px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: selectedDraft.html }}
                />
              </div>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Si Resend todavía no tiene configurado un remitente válido para producción, puedes usar
              el respaldo manual mientras ajustas `RESEND_FROM_EMAIL`.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
