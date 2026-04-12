'use client';

import { useState } from 'react';
import { Event, EventType } from '@/lib/types';
import { EVENT_TYPES, EVENT_TYPE_LABELS } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface EventFormProps {
  petId: string;
  event?: Event;
  onSubmit: (data: Partial<Event>) => Promise<void>;
  submitLabel?: string;
}

export function EventForm({ petId, event, onSubmit, submitLabel = 'Guardar' }: EventFormProps) {
  const [type, setType] = useState<EventType>(event?.type || 'vacuna');
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [eventDate, setEventDate] = useState(event?.event_date || '');
  const [nextDueDate, setNextDueDate] = useState(event?.next_due_date || '');
  const [notes, setNotes] = useState(event?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (!eventDate) {
      setError('La fecha es obligatoria');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        pet_id: petId,
        type,
        title: title.trim(),
        description: description.trim() || null,
        event_date: eventDate,
        next_due_date: nextDueDate || null,
        notes: notes.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const eventIcons = {
    vacuna: '💉',
    visita: '🏥',
    medicina: '💊',
    otro: '📋',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100 rounded-2xl p-4 mb-6">
        <p className="text-sm font-semibold text-gray-700">
          {eventIcons[type]} <span className="text-blue-600">Registrando:</span> {EVENT_TYPE_LABELS[type]}
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📌 Tipo de evento *
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as EventType)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base font-medium bg-white hover:border-gray-300"
          required
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {eventIcons[t]} {EVENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Input
          label="✏️ Título *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Vacuna antirrábica, Consulta de rutina"
          required
        />
      </div>

      <div className="space-y-1">
        <Input
          type="date"
          label="📅 Fecha del evento *"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 ml-1">¿Cuándo ocurrió o está programado?</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📝 Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalles importantes del evento..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base bg-white hover:border-gray-300 resize-none"
        />
        <p className="text-xs text-gray-500 ml-1">Opcional - Agrega detalles que consideres importantes</p>
      </div>

      <div className="space-y-1">
        <Input
          type="date"
          label="⏰ Próxima dosis / revisión"
          value={nextDueDate}
          onChange={(e) => setNextDueDate(e.target.value)}
        />
        <p className="text-xs text-gray-500 ml-1">Opcional - Para recordatorios futuros</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          💬 Notas adicionales
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones del veterinario, recomendaciones especiales..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base bg-white hover:border-gray-300 resize-none"
        />
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl font-medium animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      <Button type="submit" className="w-full text-lg py-4 mt-8" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
          </span>
        ) : (
          <span>✨ {submitLabel}</span>
        )}
      </Button>
    </form>
  );
}
