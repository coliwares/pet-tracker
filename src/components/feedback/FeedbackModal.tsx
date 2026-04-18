'use client';

import { useMemo, useState } from 'react';
import { Bug, Lightbulb, MessageSquarePlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { FEEDBACK_TYPE_COLORS, FEEDBACK_TYPE_LABELS, FEEDBACK_TYPES } from '@/lib/constants';
import { FeedbackType } from '@/lib/types';
import { createFeedback } from '@/lib/supabase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
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
  userEmail,
  onSubmitted,
}: FeedbackModalProps) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const formIsValid = useMemo(() => {
    return (
      form.title.trim().length >= 4 &&
      form.title.trim().length <= 120 &&
      form.message.trim().length >= 10 &&
      form.message.trim().length <= 1000
    );
  }, [form.message, form.title]);

  const reset = () => {
    setForm(initialForm);
    setError('');
  };

  const handleClose = () => {
    if (submitting) {
      return;
    }

    reset();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!formIsValid) {
      setError('Completa un título y una descripción con más detalle.');
      return;
    }

    try {
      setSubmitting(true);
      await createFeedback({
        user_id: userId,
        user_email: userEmail,
        type: form.type,
        title: form.title.trim(),
        message: form.message.trim(),
      });
      await onSubmitted?.();
      setToast('Gracias por tu feedback. Ya quedó registrado.');
      handleClose();
    } catch (err) {
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
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Título
            </label>
            <input
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
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Detalle
            </label>
            <textarea
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

      {toast && (
        <Toast
          message={toast}
          type="success"
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
