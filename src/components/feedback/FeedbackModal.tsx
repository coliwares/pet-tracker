'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Bug, ImagePlus, Lightbulb, MessageSquarePlus, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { FEEDBACK_TYPE_COLORS, FEEDBACK_TYPE_LABELS, FEEDBACK_TYPES } from '@/lib/constants';
import { FeedbackType } from '@/lib/types';
import { createFeedback } from '@/lib/supabase';
import {
  compressImage,
  deleteStorageFile,
  uploadFeedbackImage,
  validateFile,
} from '@/lib/storage';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSubmitted?: () => Promise<void> | void;
}

const initialForm = {
  type: 'bug' as FeedbackType,
  title: '',
  message: '',
};

export function FeedbackModal({
  isOpen,
  onClose,
  userId,
  onSubmitted,
}: FeedbackModalProps) {
  const [form, setForm] = useState(initialForm);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (attachmentPreview) {
        URL.revokeObjectURL(attachmentPreview);
      }
    };
  }, [attachmentPreview]);

  const formIsValid = useMemo(() => {
    return (
      form.title.trim().length >= 4 &&
      form.title.trim().length <= 120 &&
      form.message.trim().length >= 10 &&
      form.message.trim().length <= 1000
    );
  }, [form.message, form.title]);

  const reset = () => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }

    setForm(initialForm);
    setAttachment(null);
    setAttachmentPreview(null);
    setError('');
  };

  const handleClose = () => {
    if (submitting) {
      return;
    }

    reset();
    onClose();
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';

    if (!file) {
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error ?? 'La imagen no es válida.');
      return;
    }

    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }

    setError('');
    setAttachment(file);
    setAttachmentPreview(URL.createObjectURL(file));
  };

  const removeAttachment = () => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }

    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!formIsValid) {
      setError('Completa un título y una descripción con más detalle.');
      return;
    }

    let uploadedUrl: string | null = null;

    try {
      setSubmitting(true);

      if (attachment) {
        const compressed = await compressImage(attachment);
        const uploadId = crypto.randomUUID();
        uploadedUrl = await uploadFeedbackImage(compressed, userId, uploadId);

        if (!uploadedUrl) {
          throw new Error('No se pudo subir la imagen adjunta.');
        }
      }

      await createFeedback({
        type: form.type,
        title: form.title.trim(),
        message: form.message.trim(),
        image_url: uploadedUrl,
      });

      await onSubmitted?.();
      setToast('Gracias por tu feedback. Ya quedó registrado.');
      reset();
      onClose();
    } catch (err) {
      if (uploadedUrl) {
        await deleteStorageFile(uploadedUrl);
      }

      setError(err instanceof Error ? err.message : 'No se pudo enviar el feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Enviar feedback">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {FEEDBACK_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((current) => ({ ...current, type }))}
                className={`rounded-2xl border-2 p-4 text-left transition-all ${
                  form.type === type
                    ? FEEDBACK_TYPE_COLORS[type]
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  {type === 'bug' ? (
                    <Bug className="h-4 w-4" />
                  ) : (
                    <Lightbulb className="h-4 w-4" />
                  )}
                  {FEEDBACK_TYPE_LABELS[type]}
                </div>
                <p className="text-sm opacity-80">
                  {type === 'bug'
                    ? 'Reporta un problema que encontraste en la app.'
                    : 'Sugiere una mejora o nueva funcionalidad.'}
                </p>
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="feedback-title" className="mb-2 block text-sm font-semibold text-gray-700">
              Título
            </label>
            <input
              id="feedback-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              maxLength={120}
              placeholder="Ej: Error al guardar evento veterinario"
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="mt-2 text-xs text-gray-500">{form.title.length}/120</p>
          </div>

          <div>
            <label htmlFor="feedback-message" className="mb-2 block text-sm font-semibold text-gray-700">
              Detalle
            </label>
            <textarea
              id="feedback-message"
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({ ...current, message: event.target.value }))
              }
              maxLength={1000}
              rows={6}
              placeholder="Cuéntanos qué pasó, cómo lo reproduciste o qué te gustaría mejorar."
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="mt-2 text-xs text-gray-500">{form.message.length}/1000</p>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Imagen opcional</p>
                <p className="mt-1 text-xs text-gray-500">
                  Adjunta una captura en JPG, PNG o WebP de hasta 5MB.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700">
                <ImagePlus className="h-4 w-4" />
                Cargar imagen
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={handleAttachmentChange}
                  disabled={submitting}
                />
              </label>
            </div>

            {attachment && attachmentPreview && (
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{attachment.name}</p>
                    <p className="text-xs text-gray-500">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Quitar imagen adjunta"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 overflow-hidden rounded-xl border border-gray-100">
                  <Image
                    src={attachmentPreview}
                    alt="Vista previa de la imagen adjunta"
                    width={640}
                    height={360}
                    className="max-h-64 w-full object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !formIsValid}>
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              {submitting ? 'Enviando...' : 'Enviar feedback'}
            </Button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
    </>
  );
}
