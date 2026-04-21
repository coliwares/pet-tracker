'use client';

import { useEffect, useMemo, useState } from 'react';
import { Event, EventType, Pet } from '@/lib/types';
import { EVENT_CATALOG, EVENT_TYPES, EVENT_TYPE_LABELS } from '@/lib/constants';
import { getPet } from '@/lib/supabase';
import { applyDueRule, calculateAgeInMonths, getEventCatalogOptions, toDateInputValue } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface EventFormProps {
  petId: string;
  event?: Event;
  onSubmit: (data: Partial<Event>) => Promise<void>;
  submitLabel?: string;
}

const CUSTOM_TITLE_VALUE = '__custom__';

const eventIcons: Record<EventType, string> = {
  vacuna: '💉',
  visita: '🏥',
  medicina: '💊',
  otro: '📋',
};

export function EventForm({ petId, event, onSubmit, submitLabel = 'Guardar' }: EventFormProps) {
  const [type, setType] = useState<EventType>(event?.type || 'vacuna');
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [eventDate, setEventDate] = useState(event?.event_date || toDateInputValue(new Date()));
  const [nextDueDate, setNextDueDate] = useState(event?.next_due_date || '');
  const [notes, setNotes] = useState(event?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nextDueDateTouched, setNextDueDateTouched] = useState(Boolean(event?.next_due_date));
  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const data = await getPet(petId);
        setPet(data);
      } catch (err) {
        console.error('Error fetching pet for event form:', err);
      }
    };

    if (petId) {
      fetchPet();
    }
  }, [petId]);

  const catalogOptions = useMemo(
    () => getEventCatalogOptions(EVENT_CATALOG[type], pet),
    [pet, type]
  );
  const standardTitles = useMemo(
    () => catalogOptions.map((option) => option.title),
    [catalogOptions]
  );
  const selectedCatalogItem = useMemo(
    () => catalogOptions.find((option) => option.title === title) ?? null,
    [catalogOptions, title]
  );
  const selectedTitle = useMemo(
    () =>
      type === 'otro' || (title && !standardTitles.includes(title))
        ? CUSTOM_TITLE_VALUE
        : title || '',
    [standardTitles, title, type]
  );

  const getSuggestedNextDueDate = (nextEventDate: string, nextTitle: string, nextType = type) => {
    if (nextType === 'otro' || !nextTitle) {
      return '';
    }

    const nextCatalogItem = getEventCatalogOptions(EVENT_CATALOG[nextType], pet).find(
      (option) => option.title === nextTitle
    );

    return applyDueRule(nextEventDate, nextCatalogItem?.nextDueRule) ?? '';
  };

  const showCustomTitleInput = type === 'otro' || selectedTitle === CUSTOM_TITLE_VALUE;

  const handleTypeChange = (nextType: EventType) => {
    setType(nextType);

    if (nextType === 'otro') {
      if (!event || event.type !== 'otro') {
        setTitle('');
      }
      if (!nextDueDateTouched) {
        setNextDueDate('');
      }
      return;
    }

    const nextTitles = getEventCatalogOptions(EVENT_CATALOG[nextType], pet).map((option) => option.title);
    if (title && nextTitles.includes(title)) {
      if (!nextDueDateTouched) {
        setNextDueDate(getSuggestedNextDueDate(eventDate, title, nextType));
      }
      return;
    }

    if (!event || event.type !== nextType) {
      setTitle('');
    }
    if (!nextDueDateTouched) {
      setNextDueDate('');
    }
  };

  const petContextLabel = useMemo(() => {
    if (!pet) {
      return null;
    }

    if (pet.species === 'Perro') {
      const ageInMonths = pet.birth_date ? calculateAgeInMonths(pet.birth_date) : null;
      return ageInMonths !== null && ageInMonths < 12 ? 'Perro cachorro' : 'Perro adulto';
    }

    if (pet.species === 'Gato') {
      const ageInMonths = pet.birth_date ? calculateAgeInMonths(pet.birth_date) : null;
      return ageInMonths !== null && ageInMonths < 12 ? 'Gato gatito' : 'Gato adulto';
    }

    return pet.species;
  }, [pet]);

  const handleTitleOptionChange = (value: string) => {
    if (value === CUSTOM_TITLE_VALUE) {
      setTitle('');
      if (!nextDueDateTouched) {
        setNextDueDate('');
      }
      return;
    }

    setTitle(value);
    if (!nextDueDateTouched) {
      setNextDueDate(getSuggestedNextDueDate(eventDate, value));
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100 rounded-2xl p-4 mb-6">
        <p className="text-sm font-semibold text-gray-700">
          {eventIcons[type]} <span className="text-blue-600">Registrando:</span> {EVENT_TYPE_LABELS[type]}
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tipo de evento *
        </label>
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as EventType)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base font-medium bg-white hover:border-gray-300"
          required
        >
          {EVENT_TYPES.map((eventType) => (
            <option key={eventType} value={eventType}>
              {eventIcons[eventType]} {EVENT_TYPE_LABELS[eventType]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Título *
        </label>
        {type === 'otro' ? (
          <p className="text-xs text-gray-500 ml-1">
            Este tipo de evento usa un título personalizado.
          </p>
        ) : (
          <>
            {petContextLabel && (
              <p className="text-xs text-blue-600 ml-1">
                Opciones sugeridas para {petContextLabel}.
              </p>
            )}
            <select
              value={selectedTitle}
              onChange={(e) => handleTitleOptionChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base font-medium bg-white hover:border-gray-300"
              required
            >
              <option value="" disabled>
                Selecciona un título
              </option>
              {standardTitles.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value={CUSTOM_TITLE_VALUE}>Otro</option>
            </select>
          </>
        )}
        {showCustomTitleInput && (
          <Input
            value={title}
            onChange={(e) => {
              const nextTitle = e.target.value;
              setTitle(nextTitle);
              if (!nextDueDateTouched) {
                setNextDueDate(getSuggestedNextDueDate(eventDate, nextTitle));
              }
            }}
            placeholder="Escribe el título del evento"
            required
          />
        )}
      </div>

      <div className="space-y-1">
        <Input
          type="date"
          label="Fecha del evento *"
          value={eventDate}
          onChange={(e) => {
            const nextEventDate = e.target.value;
            setEventDate(nextEventDate);
            if (!nextDueDateTouched) {
              setNextDueDate(getSuggestedNextDueDate(nextEventDate, title));
            }
          }}
          required
        />
        <p className="text-xs text-gray-500 ml-1">Cuando ocurrió o está programado.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalles importantes del evento..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base bg-white hover:border-gray-300 resize-none"
        />
        <p className="text-xs text-gray-500 ml-1">Opcional. Agrega detalles importantes.</p>
      </div>

      <div className="space-y-1">
        <Input
          type="date"
          label="Próxima dosis / revisión"
          value={nextDueDate}
          onChange={(e) => {
            setNextDueDate(e.target.value);
            setNextDueDateTouched(true);
          }}
        />
        <p className="text-xs text-gray-500 ml-1">
          Opcional. Se completa automáticamente para vacunas y controles estándar, pero puedes ajustarla.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Notas adicionales
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
          {error}
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
          <span>{submitLabel}</span>
        )}
      </Button>
    </form>
  );
}
